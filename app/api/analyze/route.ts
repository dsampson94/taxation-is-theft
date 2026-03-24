import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { getOpenAI, ANALYZE_STATEMENT_PROMPT, buildAnalysisPrompt } from '@/app/lib/openai';
import { validateAndEnrichAnalysis, type AnalyzedTransaction } from '@/app/lib/deduction-rules';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Check credits
    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    if (user.credits <= 0) {
      return NextResponse.json({ error: 'No credits remaining. Please purchase more credits.' }, { status: 403 });
    }

    // Require profile completion — occupation + employment type at minimum
    if (!user.taxProfileComplete) {
      return NextResponse.json(
        { error: 'Please complete your tax profile before analyzing statements. This ensures accurate results.' },
        { status: 400 }
      );
    }

    const { text, occupation, taxYearId, fileName, fileSize } = await request.json();

    if (!text || text.length < 50) {
      return NextResponse.json({ error: 'Statement text too short or empty' }, { status: 400 });
    }

    const userOccupation = occupation || user.occupation || 'general taxpayer';

    // ═══ PASS 1: AI Analysis with profile-aware prompt ═══
    // If user has completed their tax profile, use the enriched prompt.
    // Otherwise, fall back to the generic prompt.
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

    // Truncate text if too long for API (keep ~50k chars to stay well within timeout)
    const truncatedText = text.length > 50000 ? text.substring(0, 50000) + '\n[TRUNCATED — upload shorter statement periods for best results]' : text;

    const completion = await getOpenAI().chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Here is the bank statement text to analyze:\n\n${truncatedText}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 8000,
    }, { timeout: 50000 }); // 50s — leave 10s buffer before Vercel's 60s limit

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
    // Validate AI output against hard-coded SARS rules.
    // This catches AI mistakes and adds medical credits, RA deduction, etc.
    let validationResult = null;
    if (analysisResult.transactions && Array.isArray(analysisResult.transactions)) {
      validationResult = validateAndEnrichAnalysis(
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

      // Use validated transactions instead of raw AI output
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
      const monthLabel = analysisResult.summary?.statementPeriod || null;

      // Duplicate month detection: if the same month was already uploaded for this tax year,
      // replace the old data so users don't accidentally waste credits on duplicates
      if (monthLabel) {
        const existingUpload = await prisma.statementUpload.findFirst({
          where: { userId: user.id, taxYearId, monthLabel },
        });
        if (existingUpload) {
          // Delete old transactions for this month and the old upload record
          await prisma.transaction.deleteMany({
            where: { userId: user.id, taxYearId, statementMonth: monthLabel },
          });
          await prisma.statementUpload.delete({ where: { id: existingUpload.id } });
          replacedMonth = true;
        }
      }

      // Save upload metadata only — we do NOT store raw bank statement text for privacy.
      // The text is processed in-memory, transactions are extracted, then the text is discarded.
      const pageEstimate = Math.max(1, Math.ceil(text.length / 3000));
      await prisma.statementUpload.create({
        data: {
          userId: user.id,
          taxYearId,
          fileName: fileName || 'bank-statement.pdf',
          pageCount: pageEstimate,
          fileSize: fileSize || text.length,
          monthLabel: analysisResult.summary?.statementPeriod || null,
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
        statementMonth: analysisResult.summary?.statementPeriod || null,
        notes: tx.notes || null,
        flag: ['OBVIOUS', 'LIKELY', 'REVIEW', 'PERSONAL'].includes(tx.flag) ? tx.flag : null,
      }));

      await prisma.transaction.createMany({ data: txData });
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      creditsRemaining: user.credits - 1,
      tokensUsed: completion.usage?.total_tokens || 0,
      profileComplete: user.taxProfileComplete,
      replacedMonth: replacedMonth,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed' },
      { status: 500 }
    );
  }
}
