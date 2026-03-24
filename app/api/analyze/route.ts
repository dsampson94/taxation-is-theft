import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { getOpenAI, ANALYZE_STATEMENT_PROMPT, buildAnalysisPrompt } from '@/app/lib/openai';
import { validateAndEnrichAnalysis, type AnalyzedTransaction } from '@/app/lib/deduction-rules';

export const runtime = 'nodejs';
export const maxDuration = 60;

// Helper: send an SSE event
function sseEvent(event: string, data: any): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export async function POST(request: NextRequest) {
  // Pre-flight: auth & validation (fast, before we open the stream)
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

  const { text, occupation, taxYearId, fileName, fileSize } = await request.json();
  if (!text || text.length < 50) {
    return NextResponse.json({ error: 'Statement text too short or empty' }, { status: 400 });
  }

  // Stream the response as SSE to keep the Vercel connection alive
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: string, data: any) => {
        controller.enqueue(encoder.encode(sseEvent(event, data)));
      };

      try {
        send('progress', { step: 'analyzing', message: 'AI is analyzing your statement...' });

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

        // Stream the OpenAI call — this keeps bytes flowing so Vercel doesn't kill us
        const openaiStream = await getOpenAI().chat.completions.create({
          model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
          messages: [
            { role: 'system', content: prompt },
            { role: 'user', content: `Here is the bank statement text to analyze:\n\n${truncatedText}` },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 8000,
          stream: true,
        });

        // Collect streamed chunks, sending periodic progress to keep connection alive
        let resultText = '';
        let chunkCount = 0;
        for await (const chunk of openaiStream) {
          const delta = chunk.choices[0]?.delta?.content || '';
          resultText += delta;
          chunkCount++;
          // Send a heartbeat every 20 chunks to keep the connection alive
          if (chunkCount % 20 === 0) {
            send('progress', { step: 'analyzing', message: 'Processing transactions...' });
          }
        }

        if (!resultText) {
          send('error', { error: 'AI did not return a response' });
          controller.close();
          return;
        }

        send('progress', { step: 'validating', message: 'Validating against SARS rules...' });

        let analysisResult;
        try {
          analysisResult = JSON.parse(resultText);
        } catch {
          send('error', { error: 'AI returned invalid JSON' });
          controller.close();
          return;
        }

        // ═══ PASS 2: Rules Engine Validation ═══
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

        send('progress', { step: 'saving', message: 'Saving results...' });

        // Deduct credit
        await prisma.user.update({
          where: { id: user.id },
          data: { credits: { decrement: 1 } },
        });

        // If taxYearId provided, save transactions to DB
        let replacedMonth = false;
        if (taxYearId && analysisResult.transactions) {
          const monthLabel = analysisResult.summary?.statementPeriod || null;

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

        // Final result
        send('done', {
          success: true,
          analysis: analysisResult,
          creditsRemaining: user.credits - 1,
          profileComplete: user.taxProfileComplete,
          replacedMonth,
        });
      } catch (error: any) {
        console.error('Analysis error:', error);
        send('error', { error: error?.message || 'Analysis failed' });
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  });
}
