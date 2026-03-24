import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import openai, { ANALYZE_STATEMENT_PROMPT } from '@/app/lib/openai';

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
    if (user.credits <= 0 && user.planType === 'FREE') {
      return NextResponse.json({ error: 'No credits remaining. Please upgrade your plan.' }, { status: 403 });
    }

    const { text, occupation, taxYearId } = await request.json();

    if (!text || text.length < 50) {
      return NextResponse.json({ error: 'Statement text too short or empty' }, { status: 400 });
    }

    const userOccupation = occupation || user.occupation || 'general taxpayer';
    const prompt = ANALYZE_STATEMENT_PROMPT.replace('{occupation}', userOccupation);

    // Truncate text if too long for API (keep ~50k chars)
    const truncatedText = text.length > 50000 ? text.substring(0, 50000) + '\n[TRUNCATED]' : text;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: prompt },
        { role: 'user', content: `Here is the bank statement text to analyze:\n\n${truncatedText}` },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 16000,
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

    // Deduct credit
    await prisma.user.update({
      where: { id: user.id },
      data: { credits: { decrement: 1 } },
    });

    // If taxYearId provided, save transactions to DB
    if (taxYearId && analysisResult.transactions) {
      const txData = analysisResult.transactions.map((tx: any) => ({
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
      }));

      await prisma.transaction.createMany({ data: txData });
    }

    return NextResponse.json({
      success: true,
      analysis: analysisResult,
      creditsRemaining: user.credits - 1,
      tokensUsed: completion.usage?.total_tokens || 0,
    });
  } catch (error) {
    console.error('Analysis error:', error);
    return NextResponse.json(
      { error: 'Analysis failed', message: (error as Error).message },
      { status: 500 }
    );
  }
}
