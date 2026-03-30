import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

// GET /api/transactions/search?q=jeff+meyer&taxYearId=optional
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const taxYearId = searchParams.get('taxYearId');

    if (!query || query.length < 2) {
      return NextResponse.json({ error: 'Search query must be at least 2 characters' }, { status: 400 });
    }

    // Build where clause: user's transactions matching description
    const where: any = {
      userId: authUser.userId,
      description: { contains: query, mode: 'insensitive' },
    };
    if (taxYearId) where.taxYearId = taxYearId;

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: 200,
      include: {
        taxYear: { select: { yearLabel: true } },
      },
    });

    // Also check against category and notes
    const categoryMatches = await prisma.transaction.findMany({
      where: {
        userId: authUser.userId,
        ...(taxYearId ? { taxYearId } : {}),
        id: { notIn: transactions.map(t => t.id) },
        OR: [
          { category: { contains: query, mode: 'insensitive' } },
          { userCategory: { contains: query, mode: 'insensitive' } },
          { notes: { contains: query, mode: 'insensitive' } },
        ],
      },
      orderBy: { date: 'desc' },
      take: 50,
      include: {
        taxYear: { select: { yearLabel: true } },
      },
    });

    const allResults = [...transactions, ...categoryMatches];

    // Compute totals
    const totalAmount = allResults.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const incomeResults = allResults.filter(t => t.type === 'INCOME');
    const expenseResults = allResults.filter(t => t.type === 'EXPENSE');

    return NextResponse.json({
      results: allResults,
      summary: {
        total: allResults.length,
        totalAmount,
        incomeCount: incomeResults.length,
        expenseCount: expenseResults.length,
        incomeTotal: incomeResults.reduce((s, t) => s + Math.abs(Number(t.amount)), 0),
        expenseTotal: expenseResults.reduce((s, t) => s + Math.abs(Number(t.amount)), 0),
      },
    });
  } catch (error) {
    console.error('Transaction search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
