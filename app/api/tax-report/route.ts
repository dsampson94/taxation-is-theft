import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { calculateIncomeTax, formatZAR, type EntityType } from '@/app/lib/tax-rates-za';

// GET /api/tax-report?taxYearId=xxx
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

    const user = await prisma.user.findUnique({ where: { id: authUser.userId } });
    const entityType = (user?.entityType || 'INDIVIDUAL') as EntityType;

    // Get all transactions for this tax year
    const transactions = await prisma.transaction.findMany({
      where: { userId: authUser.userId, taxYearId },
      orderBy: { date: 'asc' },
    });

    // Calculate totals
    const incomeTransactions = transactions.filter(t => t.type === 'INCOME');
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE');
    const deductibleTransactions = transactions.filter(t => t.isDeductible);

    const totalIncome = incomeTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    const totalDeductions = deductibleTransactions.reduce(
      (sum, t) => sum + Math.abs(Number(t.amount)) * (t.deductiblePct / 100),
      0
    );

    const taxableIncomeWithoutDeductions = totalIncome;
    const taxableIncomeWithDeductions = Math.max(0, totalIncome - totalDeductions);

    const taxWithoutDeductions = calculateIncomeTax(taxableIncomeWithoutDeductions, entityType);
    const taxWithDeductions = calculateIncomeTax(taxableIncomeWithDeductions, entityType);
    const taxSaved = taxWithoutDeductions - taxWithDeductions;

    // Category breakdown
    const categoryBreakdown: Record<string, { count: number; total: number; deductible: number }> = {};
    for (const tx of deductibleTransactions) {
      const cat = tx.userCategory || tx.category || 'OTHER';
      if (!categoryBreakdown[cat]) {
        categoryBreakdown[cat] = { count: 0, total: 0, deductible: 0 };
      }
      categoryBreakdown[cat].count++;
      categoryBreakdown[cat].total += Math.abs(Number(tx.amount));
      categoryBreakdown[cat].deductible += Math.abs(Number(tx.amount)) * (tx.deductiblePct / 100);
    }

    // Monthly income breakdown
    const monthlyIncome: Record<string, number> = {};
    for (const tx of incomeTransactions) {
      const month = new Date(tx.date).toISOString().substring(0, 7);
      monthlyIncome[month] = (monthlyIncome[month] || 0) + Math.abs(Number(tx.amount));
    }

    const report = {
      taxYear: taxYear.yearLabel,
      entityType,
      totalIncome,
      totalExpenses,
      totalDeductions,
      taxableIncomeWithoutDeductions,
      taxableIncomeWithDeductions,
      taxWithoutDeductions,
      taxWithDeductions,
      taxSaved,
      effectiveRateWithout: totalIncome > 0 ? (taxWithoutDeductions / totalIncome * 100) : 0,
      effectiveRateWith: totalIncome > 0 ? (taxWithDeductions / totalIncome * 100) : 0,
      transactionCount: transactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      deductibleCount: deductibleTransactions.length,
      categoryBreakdown,
      monthlyIncome,
    };

    // Update TaxYear totals
    await prisma.taxYear.update({
      where: { id: taxYearId },
      data: {
        totalIncome: totalIncome,
        totalDeductions: totalDeductions,
        taxableIncome: taxableIncomeWithDeductions,
        estimatedTax: taxWithoutDeductions,
        taxWithDeductions: taxWithDeductions,
        taxSavings: taxSaved,
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Tax report error:', error);
    return NextResponse.json({ error: 'Failed to generate tax report' }, { status: 500 });
  }
}
