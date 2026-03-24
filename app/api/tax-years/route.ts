import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { getCurrentTaxYear } from '@/app/lib/tax-rates-za';

// GET /api/tax-years - List user's tax years
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const taxYears = await prisma.taxYear.findMany({
      where: { userId: authUser.userId },
      orderBy: { startDate: 'desc' },
      include: {
        _count: { select: { transactions: true, deductions: true } },
      },
    });

    return NextResponse.json({ taxYears });
  } catch (error) {
    console.error('Tax years fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch tax years' }, { status: 500 });
  }
}

// POST /api/tax-years - Create a new tax year
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { yearLabel } = await request.json();
    const label = yearLabel || getCurrentTaxYear().label;

    // Parse year label to get dates
    const [startYearStr, endYearStr] = label.split('/');
    const startYear = parseInt(startYearStr);
    const endYear = parseInt(endYearStr);

    if (isNaN(startYear) || isNaN(endYear)) {
      return NextResponse.json({ error: 'Invalid year format. Use YYYY/YYYY' }, { status: 400 });
    }

    const existing = await prisma.taxYear.findUnique({
      where: { userId_yearLabel: { userId: authUser.userId, yearLabel: label } },
    });

    if (existing) {
      return NextResponse.json({ taxYear: existing });
    }

    const taxYear = await prisma.taxYear.create({
      data: {
        userId: authUser.userId,
        yearLabel: label,
        startDate: new Date(startYear, 2, 1),  // March 1
        endDate: new Date(endYear, 1, 28),      // Feb 28
      },
    });

    return NextResponse.json({ taxYear }, { status: 201 });
  } catch (error) {
    console.error('Tax year creation error:', error);
    return NextResponse.json({ error: 'Failed to create tax year' }, { status: 500 });
  }
}
