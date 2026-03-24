import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

// GET /api/transactions?taxYearId=xxx
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const taxYearId = searchParams.get('taxYearId');

    const where: any = { userId: authUser.userId };
    if (taxYearId) where.taxYearId = taxYearId;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Compute summaries
    const income = transactions.filter(t => t.type === 'INCOME');
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    const deductible = transactions.filter(t => t.isDeductible);

    const totalIncome = income.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const totalExpenses = expenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const totalDeductible = deductible.reduce(
      (sum, t) => sum + Math.abs(Number(t.amount)) * (t.deductiblePct / 100),
      0
    );

    return NextResponse.json({
      transactions,
      summary: {
        totalIncome,
        totalExpenses,
        totalDeductible,
        transactionCount: transactions.length,
        incomeCount: income.length,
        expenseCount: expenses.length,
        deductibleCount: deductible.length,
      },
    });
  } catch (error) {
    console.error('Transactions fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
  }
}

// PATCH /api/transactions - Update a transaction (user override)
export async function PATCH(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { id, category, isDeductible, deductiblePct, notes } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    // Verify ownership
    const existing = await prisma.transaction.findFirst({
      where: { id, userId: authUser.userId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Transaction not found' }, { status: 404 });
    }

    const updated = await prisma.transaction.update({
      where: { id },
      data: {
        userCategory: category || undefined,
        isDeductible: isDeductible !== undefined ? isDeductible : undefined,
        deductiblePct: deductiblePct !== undefined ? deductiblePct : undefined,
        notes: notes || undefined,
        userOverride: true,
      },
    });

    return NextResponse.json({ transaction: updated });
  } catch (error) {
    console.error('Transaction update error:', error);
    return NextResponse.json({ error: 'Failed to update transaction' }, { status: 500 });
  }
}
