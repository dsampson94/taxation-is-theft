import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { getCurrentTaxYear, getRecentTaxYearLabels, ZA_TAX_YEAR } from '@/app/lib/tax-rates-za';

// Auto-seed recent tax years for a user who has none yet
async function seedTaxYearsIfNeeded(userId: string) {
  const count = await prisma.taxYear.count({ where: { userId } });
  if (count > 0) return;

  const labels = getRecentTaxYearLabels(3);
  await prisma.taxYear.createMany({
    data: labels.map(label => {
      const [startYearStr, endYearStr] = label.split('/');
      return {
        userId,
        yearLabel: label,
        startDate: new Date(parseInt(startYearStr), ZA_TAX_YEAR.START_MONTH - 1, ZA_TAX_YEAR.START_DAY),
        endDate: new Date(parseInt(endYearStr), ZA_TAX_YEAR.END_MONTH - 1, ZA_TAX_YEAR.END_DAY),
      };
    }),
    skipDuplicates: true,
  });
}

// GET /api/tax-years - List user's tax years
export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    // Auto-seed for existing users who registered before auto-creation
    await seedTaxYearsIfNeeded(authUser.userId);

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
