import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { getOpenAI, ANALYZE_STATEMENT_PROMPT, buildAnalysisPrompt } from '@/app/lib/openai';
import { validateAndEnrichAnalysis, type AnalyzedTransaction } from '@/app/lib/deduction-rules';
import { isAdminEmail } from '@/app/lib/admin';
import { buildContextFromTransactions, mergeContext, contextToPromptText, type TaxYearContext } from '@/app/lib/context-builder';

export const runtime = 'nodejs';
export const maxDuration = 300;

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

/** Split statement text into chunks at natural boundaries (double newlines / page breaks) */
function splitStatementIntoChunks(text: string, maxChunkSize: number): string[] {
  if (text.length <= maxChunkSize) return [text];

  const chunks: string[] = [];
  let remaining = text;

  while (remaining.length > 0) {
    if (remaining.length <= maxChunkSize) {
      chunks.push(remaining);
      break;
    }

    // Try to find a natural break (double newline, then single newline)
    let breakPoint = remaining.lastIndexOf('\n\n', maxChunkSize);
    if (breakPoint < maxChunkSize * 0.5) {
      breakPoint = remaining.lastIndexOf('\n', maxChunkSize);
    }
    if (breakPoint < maxChunkSize * 0.3) {
      breakPoint = maxChunkSize;
    }

    chunks.push(remaining.substring(0, breakPoint));
    remaining = remaining.substring(breakPoint).trimStart();
  }

  return chunks;
}

/** Merge analysis results from multiple chunks into a single result */
function mergeChunkResults(results: any[]): any {
  if (results.length === 1) return results[0];

  const allTransactions = results.flatMap(r => r.transactions || []);

  // Deduplicate transactions with same date + description + amount
  const seen = new Set<string>();
  const deduped = allTransactions.filter((tx: any) => {
    const key = `${tx.date}|${tx.description}|${tx.amount}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Recompute summary from merged transactions
  const income = deduped.filter((t: any) => t.type === 'INCOME');
  const expenses = deduped.filter((t: any) => t.type === 'EXPENSE');
  const deductible = deduped.filter((t: any) => t.isDeductible);

  const baseSummary = results[0]?.summary || {};

  return {
    transactions: deduped,
    summary: {
      ...baseSummary,
      totalIncome: income.reduce((s: number, t: any) => s + Math.abs(t.amount), 0),
      totalExpenses: expenses.reduce((s: number, t: any) => s + Math.abs(t.amount), 0),
      totalDeductible: deductible.reduce((s: number, t: any) => s + (Math.abs(t.amount) * (t.deductiblePct || 0) / 100), 0),
    },
  };
}

/** Normalize a statement period string to "Month YYYY" format (e.g. "November 2025") */
function normalizeMonthLabel(raw: string | null | undefined, transactions?: any[]): string | null {
  if (!raw && (!transactions || transactions.length === 0)) return null;

  // Try parsing the raw string for month/year
  if (raw) {
    // Match patterns like "November 2025", "Nov 2025", "2025-11", "11/2025"
    for (let i = 0; i < MONTH_NAMES.length; i++) {
      const full = MONTH_NAMES[i].toLowerCase();
      const short = full.substring(0, 3);
      if (raw.toLowerCase().includes(full) || raw.toLowerCase().includes(short)) {
        const yearMatch = raw.match(/(20\d{2})/);
        if (yearMatch) return `${MONTH_NAMES[i]} ${yearMatch[1]}`;
      }
    }
    // Try YYYY-MM format
    const isoMatch = raw.match(/(20\d{2})-(\d{2})/);
    if (isoMatch) {
      const monthIdx = parseInt(isoMatch[2]) - 1;
      if (monthIdx >= 0 && monthIdx < 12) return `${MONTH_NAMES[monthIdx]} ${isoMatch[1]}`;
    }
  }

  // Fallback: derive from transaction dates (use most common month)
  if (transactions && transactions.length > 0) {
    const monthCounts: Record<string, number> = {};
    for (const tx of transactions) {
      const d = new Date(tx.date);
      if (!isNaN(d.getTime())) {
        const key = `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`;
        monthCounts[key] = (monthCounts[key] || 0) + 1;
      }
    }
    const sorted = Object.entries(monthCounts).sort((a, b) => b[1] - a[1]);
    if (sorted.length > 0) return sorted[0][0];
  }

  return raw || null;
}

export async function POST(request: NextRequest) {
  const authUser = await getAuthUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }
  if (!user.taxProfileComplete) {
    return NextResponse.json(
      { error: 'Please complete your tax profile before analyzing statements.' },
      { status: 400 }
    );
  }

  const { text, occupation, taxYearId, fileName, fileSize, selectedMonth } = await request.json();
  if (!text || text.length < 50) {
    return NextResponse.json({ error: 'Statement text too short or empty' }, { status: 400 });
  }

  // ═══ CREDIT LOGIC: Admin bypass, re-analysis check ═══
  const isAdmin = isAdminEmail(user.email);
  let isReanalysis = false;

  // Check if this is a re-analysis of an existing month (free)
  if (taxYearId && selectedMonth) {
    const existingUpload = await prisma.statementUpload.findFirst({
      where: { userId: user.id, taxYearId, monthLabel: selectedMonth },
    });
    if (existingUpload) {
      isReanalysis = true;
    }
  }

  const shouldChargeCredit = !isAdmin && !isReanalysis;

  if (shouldChargeCredit && user.credits <= 0) {
    return NextResponse.json({
      error: 'No credits remaining. Purchase more credits to continue analyzing.',
      code: 'NO_CREDITS',
      creditsRemaining: 0,
    }, { status: 403 });
  }

  try {
    const userOccupation = occupation || user.occupation || 'general taxpayer';

    let prompt: string;
    if (user.taxProfileComplete) {
      prompt = buildAnalysisPrompt({
        occupation: userOccupation,
        employmentType: user.employmentType || undefined,
        hasMedicalAid: user.hasMedicalAid,
        hasRetirementAnnuity: user.hasRetirementAnnuity,
        worksFromHome: user.worksFromHome,
        usesVehicleForWork: user.usesVehicleForWork,
        homeOfficePct: user.homeOfficePct || undefined,
        taxNotes: user.taxNotes || undefined,
      });
    } else {
      prompt = ANALYZE_STATEMENT_PROMPT.replace('{occupation}', userOccupation);
    }

    // ═══ CONTEXT INJECTION: Load accumulated context for this tax year ═══
    let existingContext: TaxYearContext | null = null;
    if (taxYearId) {
      const taxYear = await prisma.taxYear.findUnique({
        where: { id: taxYearId },
        select: { contextJson: true },
      });
      if (taxYear?.contextJson) {
        existingContext = taxYear.contextJson as unknown as TaxYearContext;
        const contextText = contextToPromptText(existingContext);
        if (contextText) {
          prompt += `\n\n═══ LEARNED CONTEXT FROM PREVIOUS ANALYSES ═══\nThe following vendor classifications were learned from previous months. Use these as strong priors — the user has already confirmed or accepted these categorizations. Apply them to matching vendors in this statement:\n\n${contextText}`;
        }
      }
    }

    // GPT-4o supports 128K context — allow up to ~120K chars input (~30K tokens)
    const maxInputChars = 120000;
    const safeText = text.length > maxInputChars
      ? text.substring(0, maxInputChars) + '\n[TRUNCATED — upload shorter statement periods for best results]'
      : text;

    // ═══ CHUNKING: Split large statements to avoid output token limits ═══
    const CHUNK_SIZE = 40000;
    const chunks = splitStatementIntoChunks(safeText, CHUNK_SIZE);
    const openai = getOpenAI();
    const model = process.env.OPENAI_MODEL || 'gpt-4o';

    const chunkPromises = chunks.map((chunk, i) => {
      const chunkLabel = chunks.length > 1
        ? `\n\n[Part ${i + 1} of ${chunks.length} — extract ALL transactions from this section]`
        : '';

      return openai.chat.completions.create({
        model,
        messages: [
          { role: 'system', content: prompt },
          { role: 'user', content: `Here is the bank statement text to analyze:\n\n${chunk}${chunkLabel}` },
        ],
        response_format: { type: 'json_object' },
        temperature: 0.1,
        max_tokens: 16384,
      });
    });

    const completions = await Promise.all(chunkPromises);

    const chunkResults: any[] = [];
    for (let i = 0; i < completions.length; i++) {
      const resultText = completions[i].choices[0]?.message?.content;
      if (!resultText) {
        return NextResponse.json({ error: `AI did not return a response (chunk ${i + 1})` }, { status: 500 });
      }
      try {
        chunkResults.push(JSON.parse(resultText));
      } catch {
        return NextResponse.json({ error: `AI returned invalid JSON (chunk ${i + 1})` }, { status: 500 });
      }
    }

    // Merge chunk results
    const analysisResult = mergeChunkResults(chunkResults);

    // ═══ PASS 2: Rules Engine Validation ═══
    if (analysisResult.transactions && Array.isArray(analysisResult.transactions)) {
      const validationResult = validateAndEnrichAnalysis(
        analysisResult.transactions as AnalyzedTransaction[],
        {
          occupation: userOccupation,
          employmentType: user.employmentType || undefined,
          entityType: user.entityType || undefined,
          age: user.dateOfBirth
            ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / 31557600000)
            : undefined,
          hasMedicalAid: user.hasMedicalAid,
          medicalAidMembers: user.medicalAidMembers || undefined,
          monthlyMedicalAidFee: user.monthlyMedicalAidFee ? Number(user.monthlyMedicalAidFee) : undefined,
          hasRetirementAnnuity: user.hasRetirementAnnuity,
          annualRAContribution: user.annualRAContribution ? Number(user.annualRAContribution) : undefined,
          worksFromHome: user.worksFromHome,
          homeOfficePct: user.homeOfficePct || undefined,
          usesVehicleForWork: user.usesVehicleForWork,
          annualBusinessKm: user.annualBusinessKm || undefined,
          makesDonations: user.makesDonations,
          hasOutOfPocketMedical: user.hasOutOfPocketMedical,
        }
      );

      analysisResult.transactions = validationResult.transactions;
      analysisResult.validation = {
        medicalCredits: validationResult.medicalCredits,
        retirementDeduction: validationResult.retirementDeduction,
        homeOfficeDeduction: validationResult.homeOfficeDeduction,
        travelDeduction: validationResult.travelDeduction,
        donationDeduction: validationResult.donationDeduction,
        summary: validationResult.summary,
        warnings: validationResult.warnings,
        tips: validationResult.tips,
      };
    }

    // ═══ QUALITY GATE: Don't charge if results are garbage ═══
    const txCount = analysisResult.transactions?.length || 0;
    const pageEstimate = Math.max(1, Math.ceil(text.length / 3000));
    let creditCharged = false;
    let qualityWarning: string | null = null;

    const qualityTooLow = (
      (pageEstimate >= 2 && txCount < 5) ||
      (text.length > 5000 && txCount < 3)
    );

    if (qualityTooLow) {
      qualityWarning = `Only ${txCount} transactions extracted from ~${pageEstimate} pages. This may be a scanned PDF or unusual format. No credit was charged — try re-uploading or using a different PDF export from your bank.`;
      creditCharged = false;
    } else if (shouldChargeCredit) {
      // Deduct credit — quality is good enough
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } },
      });
      creditCharged = true;
    }

    // If taxYearId provided, save transactions to DB
    let replacedMonth = false;
    if (taxYearId && analysisResult.transactions) {
      const monthLabel = selectedMonth || normalizeMonthLabel(
        analysisResult.summary?.statementPeriod,
        analysisResult.transactions
      );

      if (monthLabel) {
        const existingUpload = await prisma.statementUpload.findFirst({
          where: { userId: user.id, taxYearId, monthLabel },
        });
        if (existingUpload) {
          await prisma.transaction.deleteMany({
            where: { userId: user.id, taxYearId, statementMonth: monthLabel },
          });
          await prisma.statementUpload.delete({ where: { id: existingUpload.id } });
          replacedMonth = true;
        }
      }

      await prisma.statementUpload.create({
        data: {
          userId: user.id,
          taxYearId,
          fileName: fileName || 'bank-statement.pdf',
          pageCount: pageEstimate,
          fileSize: fileSize || text.length,
          monthLabel,
        },
      });

      const txData = analysisResult.transactions
        .filter((tx: any) => {
          const d = new Date(tx.date);
          return !isNaN(d.getTime());
        })
        .map((tx: any) => ({
          userId: user.id,
          taxYearId,
          date: new Date(tx.date),
          description: String(tx.description || ''),
          amount: tx.amount,
          type: tx.type === 'INCOME' ? 'INCOME' : tx.type === 'TRANSFER' ? 'TRANSFER' : 'EXPENSE',
          category: tx.category || 'OTHER',
          confidence: tx.confidence || 0.5,
          isDeductible: Boolean(tx.isDeductible),
          deductiblePct: Math.min(100, Math.max(0, tx.deductiblePct || 0)),
          bankName: analysisResult.summary?.bankName || null,
          accountNumber: analysisResult.summary?.accountNumber || null,
          statementMonth: monthLabel,
          notes: tx.notes || null,
          flag: ['OBVIOUS', 'LIKELY', 'REVIEW', 'PERSONAL'].includes(tx.flag) ? tx.flag : null,
        }));

      await prisma.transaction.createMany({ data: txData });

      // ═══ UPDATE CONTEXT: Accumulate vendor knowledge ═══
      if (txCount > 0) {
        const newContext = buildContextFromTransactions(analysisResult.transactions);
        const updatedContext = existingContext
          ? mergeContext(existingContext, newContext)
          : newContext;

        await prisma.taxYear.update({
          where: { id: taxYearId },
          data: { contextJson: updatedContext as any },
        });
      }
    }

    const creditsRemaining = creditCharged ? user.credits - 1 : user.credits;

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      creditsRemaining: isAdmin ? 999 : creditsRemaining,
      creditCharged,
      isReanalysis,
      isAdmin,
      qualityWarning,
      profileComplete: user.taxProfileComplete,
      replacedMonth,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    // Credit NOT deducted on errors — we never reached the deduction point
    return NextResponse.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
}
