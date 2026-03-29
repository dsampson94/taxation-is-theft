import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { generateCheckpointMarkdown } from '@/app/lib/checkpoint-generator';

// GET /api/checkpoints?taxYearId=xxx — list checkpoints for a tax year
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taxYearId = searchParams.get('taxYearId');

    if (!taxYearId) {
      return NextResponse.json({ error: 'taxYearId is required' }, { status: 400 });
    }

    // Verify ownership
    const taxYear = await prisma.taxYear.findFirst({
      where: { id: taxYearId, userId: authUser.userId },
    });
    if (!taxYear) {
      return NextResponse.json({ error: 'Tax year not found' }, { status: 404 });
    }

    const checkpoints = await prisma.taxCheckpoint.findMany({
      where: { userId: authUser.userId, taxYearId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        title: true,
        monthsAnalyzed: true,
        totalIncome: true,
        totalDeductions: true,
        transactionCount: true,
        createdAt: true,
        reviewNotes: true,
        reviewQuestion: true,
        reviewedAt: true,
      },
    });

    return NextResponse.json({ checkpoints });
  } catch (error) {
    console.error('Checkpoint list error:', error);
    return NextResponse.json({ error: 'Failed to fetch checkpoints' }, { status: 500 });
  }
}

// POST /api/checkpoints — create a new checkpoint (snapshot)
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { taxYearId, title } = await request.json();

    if (!taxYearId) {
      return NextResponse.json({ error: 'taxYearId is required' }, { status: 400 });
    }

    // Verify ownership and get tax year data
    const taxYear = await prisma.taxYear.findFirst({
      where: { id: taxYearId, userId: authUser.userId },
      include: {
        statements: { select: { monthLabel: true, fileName: true, createdAt: true } },
      },
    });
    if (!taxYear) {
      return NextResponse.json({ error: 'Tax year not found' }, { status: 404 });
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: authUser.userId },
      select: { name: true, email: true, occupation: true },
    });

    // Get all transactions for this tax year
    const transactions = await prisma.transaction.findMany({
      where: { userId: authUser.userId, taxYearId },
      orderBy: { date: 'asc' },
    });

    if (transactions.length === 0) {
      return NextResponse.json({ error: 'No transactions to checkpoint. Upload and analyze statements first.' }, { status: 400 });
    }

    // Generate the markdown
    const monthsAnalyzed = taxYear.statements.filter(s => s.monthLabel).length;
    const autoTitle = title || `Checkpoint — ${monthsAnalyzed}/12 months analyzed`;

    const content = generateCheckpointMarkdown({
      taxYear,
      transactions,
      statements: taxYear.statements,
      user: user!,
      title: autoTitle,
    });

    // Compute totals
    const income = transactions.filter(t => t.type === 'INCOME');
    const deductible = transactions.filter(t => t.isDeductible);
    const totalIncome = income.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const totalDeductions = deductible.reduce((sum, t) => sum + Math.abs(Number(t.amount)) * (t.deductiblePct / 100), 0);

    const checkpoint = await prisma.taxCheckpoint.create({
      data: {
        userId: authUser.userId,
        taxYearId,
        title: autoTitle,
        content,
        monthsAnalyzed,
        totalIncome,
        totalDeductions,
        transactionCount: transactions.length,
      },
    });

    return NextResponse.json({ checkpoint });
  } catch (error) {
    console.error('Checkpoint creation error:', error);
    return NextResponse.json({ error: 'Failed to create checkpoint' }, { status: 500 });
  }
}
