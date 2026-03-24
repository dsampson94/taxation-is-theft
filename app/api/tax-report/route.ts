import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/app/lib/auth';
import { prisma } from '@/app/lib/db';
import { calculateIncomeTax, type EntityType } from '@/app/lib/tax-rates-za';
import { SARS_DEDUCTION_RULES } from '@/app/lib/sa-tax-knowledge';

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
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const entityType = (user.entityType || 'INDIVIDUAL') as EntityType;
    const age = user.dateOfBirth
      ? Math.floor((Date.now() - new Date(user.dateOfBirth).getTime()) / 31557600000)
      : 35;

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

    // ═══ Profile-Based Deductions & Credits ═══

    // Medical tax credits
    let medicalCredits = 0;
    let medicalCreditDetails = '';
    if (user.hasMedicalAid && user.medicalAidMembers) {
      const rules = SARS_DEDUCTION_RULES.medicalCredits;
      medicalCredits = rules.calculateAnnualCredit(user.medicalAidMembers);
      medicalCreditDetails = `${user.medicalAidMembers} member(s) on medical aid`;

      // Additional medical expenses credit
      if (user.hasOutOfPocketMedical) {
        const outOfPocketTotal = transactions
          .filter(t => t.category === 'MEDICAL' && t.type === 'EXPENSE')
          .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);

        if (outOfPocketTotal > 0) {
          const annualFees = user.monthlyMedicalAidFee ? Number(user.monthlyMedicalAidFee) * 12 : 0;
          const additionalCredit = rules.calculateAdditionalCredit(outOfPocketTotal, medicalCredits, annualFees, age);
          medicalCredits += additionalCredit;
        }
      }
    }

    // Retirement annuity deduction
    let raDeduction = 0;
    let raDetails = '';
    if (user.hasRetirementAnnuity && user.annualRAContribution) {
      const raRules = SARS_DEDUCTION_RULES.retirementAnnuity;
      const contribution = Number(user.annualRAContribution);
      raDeduction = raRules.calculation(totalIncome, contribution);
      raDetails = `RA contribution R${contribution.toLocaleString()} — deductible R${raDeduction.toLocaleString()}`;
    }

    // Home office deduction
    let homeOfficeDeduction = 0;
    let homeOfficeDetails = '';
    if (user.worksFromHome && user.homeOfficePct) {
      const homeKeywords = ['rent', 'bond', 'mortgage', 'rates', 'levy', 'electricity', 'water', 'internet', 'fibre', 'security', 'cleaning'];
      const homeExpenses = transactions.filter(t =>
        t.type === 'EXPENSE' &&
        homeKeywords.some(kw => t.description.toLowerCase().includes(kw))
      );
      const totalHomeExpenses = homeExpenses.reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
      homeOfficeDeduction = SARS_DEDUCTION_RULES.homeOffice.calculate(totalHomeExpenses, user.homeOfficePct);
      homeOfficeDetails = `${user.homeOfficePct}% of R${totalHomeExpenses.toLocaleString()} home expenses`;
    }

    // Total deductions (transaction-based + profile-based)
    const allDeductions = totalDeductions + raDeduction + homeOfficeDeduction;
    const taxableIncomeWithoutDeductions = totalIncome;
    const taxableIncomeWithDeductions = Math.max(0, totalIncome - allDeductions);

    const taxWithoutDeductions = calculateIncomeTax(taxableIncomeWithoutDeductions, entityType, age);
    const taxWithDeductions = calculateIncomeTax(taxableIncomeWithDeductions, entityType, age);
    const taxAfterCredits = Math.max(0, taxWithDeductions - medicalCredits);
    const taxSaved = taxWithoutDeductions - taxAfterCredits;

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
      totalDeductions: allDeductions,
      transactionDeductions: totalDeductions,
      // Profile-based deductions & credits
      medicalCredits,
      medicalCreditDetails,
      raDeduction,
      raDetails,
      homeOfficeDeduction,
      homeOfficeDetails,
      // Tax calculations
      taxableIncomeWithoutDeductions,
      taxableIncomeWithDeductions,
      taxWithoutDeductions,
      taxWithDeductions: taxAfterCredits,
      taxSaved,
      effectiveRateWithout: totalIncome > 0 ? (taxWithoutDeductions / totalIncome * 100) : 0,
      effectiveRateWith: totalIncome > 0 ? (taxAfterCredits / totalIncome * 100) : 0,
      // Counts
      transactionCount: transactions.length,
      incomeCount: incomeTransactions.length,
      expenseCount: expenseTransactions.length,
      deductibleCount: deductibleTransactions.length,
      // Breakdowns
      categoryBreakdown,
      monthlyIncome,
      // Profile completeness
      profileComplete: user.taxProfileComplete,
    };

    // Update TaxYear totals
    await prisma.taxYear.update({
      where: { id: taxYearId },
      data: {
        totalIncome: totalIncome,
        totalDeductions: allDeductions,
        taxableIncome: taxableIncomeWithDeductions,
        estimatedTax: taxWithoutDeductions,
        taxWithDeductions: taxAfterCredits,
        taxSavings: taxSaved,
      },
    });

    return NextResponse.json({ report });
  } catch (error) {
    console.error('Tax report error:', error);
    return NextResponse.json({ error: 'Failed to generate tax report' }, { status: 500 });
  }
}
