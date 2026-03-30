import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';

// GET /api/transactions/search?q=jeff+meyer&taxYearId=optional
// Descriptions are encrypted at rest, so we fetch all user transactions
// (decrypted by Prisma middleware) and filter in memory.
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

    // Fetch all user transactions (decrypted by middleware) and filter in memory
    const where: any = { userId: authUser.userId };
    if (taxYearId) where.taxYearId = taxYearId;

    const allTransactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      include: {
        taxYear: { select: { yearLabel: true } },
      },
    });

    const queryLower = query.toLowerCase();
    const queryWords = queryLower.split(/\s+/);

    const results = allTransactions.filter((t) => {
      const desc = (t.description || '').toLowerCase();
      const cat = (t.category || '').toLowerCase();
      const userCat = (t.userCategory || '').toLowerCase();
      const notes = (t.notes || '').toLowerCase();
      const searchable = `${desc} ${cat} ${userCat} ${notes}`;

      // All query words must appear somewhere in the searchable text
      return queryWords.every((w) => searchable.includes(w));
    }).slice(0, 200);

    // Compute totals
    const totalAmount = results.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const incomeResults = results.filter(t => t.type === 'INCOME');
    const expenseResults = results.filter(t => t.type === 'EXPENSE');

    return NextResponse.json({
      results,
      summary: {
        total: results.length,
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
