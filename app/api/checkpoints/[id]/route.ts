import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { isAdminEmail } from '@/app/lib/admin';
import { getOpenAI } from '@/app/lib/openai';

const DEEP_REVIEW_PROMPT = `You are a senior South African tax advisor reviewing a client's tax analysis checkpoint. Your job is to triple-check every deduction, flag errors, find missed deductions, and ensure SARS compliance.

Review the checkpoint document carefully and provide:

1. **ERRORS & OVERCLAIMS** — Deductions that look wrong, overclaimed, or wouldn't survive a SARS audit. Be specific about which line items and why.

2. **MISSED DEDUCTIONS** — Deductions the user likely qualifies for but hasn't claimed. Consider their occupation and transaction patterns.

3. **SARS COMPLIANCE CHECK** — Are section references correct? Are proof requirements noted? Would these deductions stand up to verification?

4. **CONFIDENCE ISSUES** — Any low-confidence items that need human review. Specifically call out items where the AI may have guessed wrong.

5. **RECOMMENDATIONS** — Actionable next steps. What should they fix, add, or prepare before filing?

Be direct, specific, and cite actual amounts/descriptions from the checkpoint. Don't be generic — reference the actual data.

Format your response in clear markdown with the sections above as ## headings.`;

// GET /api/checkpoints/[id] — get a single checkpoint's full content
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const checkpoint = await prisma.taxCheckpoint.findFirst({
      where: { id: params.id, userId: authUser.userId },
    });

    if (!checkpoint) {
      return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 });
    }

    return NextResponse.json({ checkpoint });
  } catch (error) {
    console.error('Checkpoint fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch checkpoint' }, { status: 500 });
  }
}

// DELETE /api/checkpoints/[id] — delete a checkpoint
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const checkpoint = await prisma.taxCheckpoint.findFirst({
      where: { id: params.id, userId: authUser.userId },
    });

    if (!checkpoint) {
      return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 });
    }

    await prisma.taxCheckpoint.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Checkpoint delete error:', error);
    return NextResponse.json({ error: 'Failed to delete checkpoint' }, { status: 500 });
  }
}

// POST /api/checkpoints/[id] — AI deep review (costs 1 credit unless admin)
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isAdmin = isAdminEmail(user.email);
    const body = await request.json().catch(() => ({}));
    const userQuestion = body.question || null;

    // Credit check (admins skip)
    if (!isAdmin && user.credits <= 0) {
      return NextResponse.json({
        error: 'No credits remaining. Purchase more to use Deep Review.',
        code: 'NO_CREDITS',
      }, { status: 403 });
    }

    const checkpoint = await prisma.taxCheckpoint.findFirst({
      where: { id: params.id, userId: authUser.userId },
    });

    if (!checkpoint) {
      return NextResponse.json({ error: 'Checkpoint not found' }, { status: 404 });
    }

    // Load user profile for context
    const profile = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { occupation: true, employmentType: true, worksFromHome: true, homeOfficePct: true, usesVehicleForWork: true },
    });

    // Build the AI prompt
    let systemPrompt = DEEP_REVIEW_PROMPT;
    if (profile?.occupation) {
      systemPrompt += `\n\nThe taxpayer's occupation is: ${profile.occupation} (${profile.employmentType || 'unknown employment type'})`;
      if (profile.worksFromHome) systemPrompt += `\nThey work from home (${profile.homeOfficePct || 'unknown'}% home office).`;
      if (profile.usesVehicleForWork) systemPrompt += `\nThey use a vehicle for work.`;
    }

    let userMessage = `Here is the tax checkpoint to review:\n\n${checkpoint.content}`;
    if (userQuestion) {
      userMessage += `\n\n═══ USER'S SPECIFIC QUESTION ═══\nThe user specifically wants to know: "${userQuestion}"\nPlease address this question directly in addition to the standard review.`;
    }

    // Cap checkpoint content to avoid token overflow (~60K chars ≈ 15K tokens)
    if (userMessage.length > 60000) {
      userMessage = userMessage.substring(0, 60000) + '\n\n[Content truncated for review — showing first ~60K characters]';
    }

    const openai = getOpenAI();
    const model = (process.env.OPENAI_MODEL || 'gpt-4o').trim();

    const completion = await openai.chat.completions.create({
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.2,
      max_tokens: 4096,
    });

    const reviewNotes = completion.choices[0]?.message?.content;
    if (!reviewNotes) {
      return NextResponse.json({ error: 'AI did not return a review' }, { status: 500 });
    }

    // Deduct credit (unless admin)
    if (!isAdmin) {
      await prisma.user.update({
        where: { id: user.id },
        data: { credits: { decrement: 1 } },
      });
    }

    // Save review to checkpoint
    await prisma.taxCheckpoint.update({
      where: { id: params.id },
      data: {
        reviewNotes,
        reviewQuestion: userQuestion,
        reviewedAt: new Date(),
      },
    });

    const creditsRemaining = isAdmin ? 999 : user.credits - 1;

    return NextResponse.json({
      reviewNotes,
      creditsRemaining,
      isAdmin,
    });
  } catch (error: any) {
    console.error('Deep review error:', error);
    return NextResponse.json({ error: error?.message || 'Deep review failed' }, { status: 500 });
  }
}
