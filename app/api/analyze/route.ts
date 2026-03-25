import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { getOpenAI, ANALYZE_STATEMENT_PROMPT, buildAnalysisPrompt } from '@/app/lib/openai';
import { validateAndEnrichAnalysis, type AnalyzedTransaction } from '@/app/lib/deduction-rules';

export const runtime = 'nodejs';
export const maxDuration = 300;

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

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
  if (user.credits <= 0) {
    return NextResponse.json({ error: 'No credits remaining. Please purchase more credits.' }, { status: 403 });
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

    const truncatedText = text.length > 50000
      ? text.substring(0, 50000) + '\n[TRUNCATED — upload shorter statement periods for best results]'
      : text;

    // Call OpenAI (non-streaming for simplicity — maxDuration=300 prevents timeout)
    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Here is the bank statement text to analyze:\n\n${truncatedText}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 8000,
    });

    const resultText = completion.choices[0]?.message?.content;
    if (!resultText) {
      return NextResponse.json({ error: 'AI did not return a response' }, { status: 500 });
    }

    let analysisResult;
    try {
      analysisResult = JSON.parse(resultText);
    } catch {
      return NextResponse.json({ error: 'AI returned invalid JSON' }, { status: 500 });
    }

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

    // Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    // If taxYearId provided, save transactions to DB
    let replacedMonth = false;
    if (taxYearId && analysisResult.transactions) {
      // User-selected month takes priority, then AI detection, then transaction date fallback
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

      const pageEstimate = Math.max(1, Math.ceil(text.length / 3000));
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
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      creditsRemaining: user.credits - 1,
      profileComplete: user.taxProfileComplete,
      replacedMonth,
    });
  } catch (error: any) {
    console.error('Analysis error:', error);
    return NextResponse.json({ error: error?.message || 'Analysis failed' }, { status: 500 });
  }
}
