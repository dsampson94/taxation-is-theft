import { NextResponse } from 'next/server';
import { getAdminUser } from '@/app/lib/admin';
import { prisma } from '@/app/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Run all queries in parallel
  const [
    totalUsers,
    usersWithProfile,
    totalTransactions,
    totalStatements,
    totalPayments,
    revenueResult,
    creditsResult,
    usersToday,
    usersThisWeek,
    usersThisMonth,
    recentUsers,
    recentPayments,
    topOccupations,
    employmentBreakdown,
    deductibleStats,
    planBreakdown,
    statementsPerMonth,
  ] = await Promise.all([
    // Core counts
    prisma.user.count(),
    prisma.user.count({ where: { taxProfileComplete: true } }),
    prisma.transaction.count(),
    prisma.statementUpload.count(),
    prisma.payment.count({ where: { status: 'COMPLETED' } }),

    // Revenue
    prisma.payment.aggregate({
      where: { status: 'COMPLETED' },
      _sum: { amount: true },
    }),

    // Credits in circulation
    prisma.user.aggregate({
      _sum: { credits: true },
      _avg: { credits: true },
    }),

    // User growth
    prisma.user.count({
      where: { createdAt: { gte: startOfDay() } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: startOfWeek() } },
    }),
    prisma.user.count({
      where: { createdAt: { gte: startOfMonth() } },
    }),

    // Recent users (last 20)
    prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        email: true,
        name: true,
        occupation: true,
        credits: true,
        taxProfileComplete: true,
        createdAt: true,
        _count: { select: { transactions: true, statements: true, payments: true } },
      },
    }),

    // Recent payments (last 20)
    prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
      select: {
        id: true,
        amount: true,
        status: true,
        creditsPurchased: true,
        createdAt: true,
        user: { select: { email: true, name: true } },
      },
    }),

    // Top occupations
    prisma.user.groupBy({
      by: ['occupation'],
      where: { occupation: { not: null } },
      _count: true,
      orderBy: { _count: { occupation: 'desc' } },
      take: 10,
    }),

    // Employment type breakdown
    prisma.user.groupBy({
      by: ['employmentType'],
      where: { employmentType: { not: null } },
      _count: true,
    }),

    // Deductible stats
    prisma.transaction.aggregate({
      where: { isDeductible: true },
      _count: true,
      _sum: { amount: true },
    }),

    // Plan breakdown
    prisma.user.groupBy({
      by: ['planType'],
      _count: true,
    }),

    // Statements per month (last 6 months)
    prisma.$queryRaw`
      SELECT 
        TO_CHAR("createdAt", 'YYYY-MM') as month,
        COUNT(*)::int as count
      FROM statement_uploads
      WHERE "createdAt" >= NOW() - INTERVAL '6 months'
      GROUP BY TO_CHAR("createdAt", 'YYYY-MM')
      ORDER BY month DESC
    ` as Promise<{ month: string; count: number }[]>,
  ]);

  return NextResponse.json({
    overview: {
      totalUsers,
      usersWithProfile,
      profileCompletionRate: totalUsers > 0 ? Math.round((usersWithProfile / totalUsers) * 100) : 0,
      totalTransactions,
      totalStatements,
      totalPayments,
      totalRevenue: Number(revenueResult._sum.amount || 0),
      totalCreditsInCirculation: Number(creditsResult._sum.credits || 0),
      avgCreditsPerUser: Number(creditsResult._avg.credits || 0).toFixed(1),
    },
    growth: {
      today: usersToday,
      thisWeek: usersThisWeek,
      thisMonth: usersThisMonth,
    },
    topOccupations: topOccupations.map(o => ({
      occupation: o.occupation || 'Not set',
      count: o._count,
    })),
    employmentBreakdown: employmentBreakdown.map(e => ({
      type: e.employmentType || 'Not set',
      count: e._count,
    })),
    planBreakdown: planBreakdown.map(p => ({
      plan: p.planType,
      count: p._count,
    })),
    deductibles: {
      count: deductibleStats._count,
      totalAmount: Math.abs(Number(deductibleStats._sum.amount || 0)),
    },
    statementsPerMonth,
    recentUsers,
    recentPayments,
  });
}

// ─── Date helpers ───────────────────────────────────────
function startOfDay(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek(): Date {
  const d = new Date();
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(): Date {
  const d = new Date();
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}
