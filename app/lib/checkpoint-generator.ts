// Generates structured markdown for tax checkpoint documents
// These act as "save points" — snapshots of the user's tax year analysis

const formatZAR = (amount: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

interface CheckpointInput {
  taxYear: {
    yearLabel: string;
    totalIncome?: any;
    totalDeductions?: any;
    taxableIncome?: any;
    estimatedTax?: any;
    taxWithDeductions?: any;
    taxSavings?: any;
  };
  transactions: Array<{
    date: Date;
    description: string;
    amount: any;
    type: string;
    category: string | null;
    confidence: number | null;
    isDeductible: boolean;
    deductiblePct: number;
    flag: string | null;
    userOverride: boolean;
    userCategory: string | null;
    notes: string | null;
    bankName: string | null;
    statementMonth: string | null;
  }>;
  statements: Array<{
    monthLabel: string | null;
    fileName: string;
    createdAt: Date;
  }>;
  user: {
    name: string | null;
    email: string;
    occupation: string | null;
  };
  title: string;
}

export function generateCheckpointMarkdown(input: CheckpointInput): string {
  const { taxYear, transactions, statements, user, title } = input;
  const now = new Date();

  // Compute breakdown from actual transactions
  const income = transactions.filter(t => t.type === 'INCOME');
  const expenses = transactions.filter(t => t.type === 'EXPENSE');
  const deductible = transactions.filter(t => t.isDeductible);
  const flagged = transactions.filter(t => t.flag === 'REVIEW');
  const userOverrides = transactions.filter(t => t.userOverride);

  const totalIncome = income.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const totalExpenses = expenses.reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
  const totalDeductible = deductible.reduce((s, t) => s + Math.abs(Number(t.amount)) * (t.deductiblePct / 100), 0);

  // Group deductions by category
  const deductionsByCategory: Record<string, { amount: number; count: number; items: string[] }> = {};
  for (const tx of deductible) {
    const cat = tx.userCategory || tx.category || 'OTHER';
    if (!deductionsByCategory[cat]) {
      deductionsByCategory[cat] = { amount: 0, count: 0, items: [] };
    }
    const deductAmount = Math.abs(Number(tx.amount)) * (tx.deductiblePct / 100);
    deductionsByCategory[cat].amount += deductAmount;
    deductionsByCategory[cat].count += 1;
    if (deductionsByCategory[cat].items.length < 5) {
      deductionsByCategory[cat].items.push(tx.description.substring(0, 50));
    }
  }

  // Group income by source
  const incomeBySource: Record<string, number> = {};
  for (const tx of income) {
    const desc = tx.description.substring(0, 40);
    incomeBySource[desc] = (incomeBySource[desc] || 0) + Math.abs(Number(tx.amount));
  }

  // Confidence breakdown
  const highConf = transactions.filter(t => (t.confidence || 0) >= 0.8).length;
  const medConf = transactions.filter(t => (t.confidence || 0) >= 0.5 && (t.confidence || 0) < 0.8).length;
  const lowConf = transactions.filter(t => (t.confidence || 0) < 0.5).length;

  // Months analyzed
  const monthsUploaded = statements.filter(s => s.monthLabel).map(s => s.monthLabel!);

  // Build the markdown document
  const lines: string[] = [];

  lines.push(`# ${title}`);
  lines.push(`## Tax Year: ${taxYear.yearLabel}`);
  lines.push(`**Generated:** ${now.toLocaleDateString('en-ZA', { year: 'numeric', month: 'long', day: 'numeric' })} at ${now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}`);
  lines.push(`**Taxpayer:** ${user.name || 'Unknown'} (${user.email})`);
  if (user.occupation) lines.push(`**Occupation:** ${user.occupation}`);
  lines.push(`**Status:** ${monthsUploaded.length}/12 months analyzed`);
  lines.push('');

  // Upload progress
  lines.push('---');
  lines.push('## Upload Progress');
  lines.push('');
  const allMonths = getFullTaxYearMonths(taxYear.yearLabel);
  for (const month of allMonths) {
    const uploaded = monthsUploaded.includes(month);
    lines.push(`- ${uploaded ? '✅' : '⬜'} ${month}${uploaded ? '' : ' — not yet uploaded'}`);
  }
  lines.push('');

  // Income Summary
  lines.push('---');
  lines.push('## Income Summary');
  lines.push('');
  lines.push('| Source | Total |');
  lines.push('|--------|-------|');
  const sortedIncome = Object.entries(incomeBySource).sort((a, b) => b[1] - a[1]);
  for (const [source, amount] of sortedIncome.slice(0, 20)) {
    lines.push(`| ${source} | ${formatZAR(amount)} |`);
  }
  lines.push(`| **Total Income** | **${formatZAR(totalIncome)}** |`);
  lines.push('');

  // Deduction Summary
  lines.push('---');
  lines.push('## Deduction Summary');
  lines.push('');
  lines.push('| Category | Amount | Transactions | Sample Items |');
  lines.push('|----------|--------|-------------|-------------|');
  const sortedDeductions = Object.entries(deductionsByCategory).sort((a, b) => b[1].amount - a[1].amount);
  for (const [cat, data] of sortedDeductions) {
    lines.push(`| ${cat} | ${formatZAR(data.amount)} | ${data.count} | ${data.items.slice(0, 2).join(', ')} |`);
  }
  lines.push(`| **Total Deductible** | **${formatZAR(totalDeductible)}** | **${deductible.length}** | |`);
  lines.push('');

  // Financial Overview
  lines.push('---');
  lines.push('## Financial Overview');
  lines.push('');
  lines.push(`- **Total Income:** ${formatZAR(totalIncome)}`);
  lines.push(`- **Total Expenses:** ${formatZAR(totalExpenses)}`);
  lines.push(`- **Total Deductible:** ${formatZAR(totalDeductible)}`);
  lines.push(`- **Transactions Analyzed:** ${transactions.length}`);
  if (taxYear.taxSavings) {
    lines.push(`- **Estimated Tax Saved:** ${formatZAR(Number(taxYear.taxSavings))}`);
  }
  lines.push('');

  // AI Confidence Report
  lines.push('---');
  lines.push('## AI Confidence Report');
  lines.push('');
  lines.push(`- **High confidence (≥80%):** ${highConf} transactions`);
  lines.push(`- **Medium confidence (50-79%):** ${medConf} transactions`);
  lines.push(`- **Low confidence (<50%):** ${lowConf} transactions — review these`);
  lines.push(`- **User overrides:** ${userOverrides.length} transactions manually corrected`);
  lines.push('');

  // Flagged for Review
  if (flagged.length > 0) {
    lines.push('---');
    lines.push('## Transactions Flagged for Review');
    lines.push('');
    for (const tx of flagged.slice(0, 30)) {
      const d = new Date(tx.date).toLocaleDateString('en-ZA');
      const amt = formatZAR(Math.abs(Number(tx.amount)));
      lines.push(`- **${d}:** ${tx.description.substring(0, 60)} — ${amt} (${tx.category || 'uncategorized'})${tx.notes ? ` — ${tx.notes}` : ''}`);
    }
    if (flagged.length > 30) {
      lines.push(`- ... and ${flagged.length - 30} more flagged items`);
    }
    lines.push('');
  }

  // User Corrections
  if (userOverrides.length > 0) {
    lines.push('---');
    lines.push('## User Corrections');
    lines.push('');
    for (const tx of userOverrides.slice(0, 20)) {
      const d = new Date(tx.date).toLocaleDateString('en-ZA');
      lines.push(`- **${d}:** ${tx.description.substring(0, 50)} → ${tx.userCategory || tx.category} (${tx.isDeductible ? `${tx.deductiblePct}% deductible` : 'not deductible'})${tx.notes ? ` — "${tx.notes}"` : ''}`);
    }
    lines.push('');
  }

  lines.push('---');
  lines.push(`*This document was auto-generated by TIT Tax (taxationistheft.co.za) on ${now.toLocaleDateString('en-ZA')}. It is a snapshot of your tax year analysis at this point in time. Upload more statements and save new checkpoints to track your progress.*`);

  return lines.join('\n');
}

/** Get all 12 months for a SA tax year */
function getFullTaxYearMonths(yearLabel: string): string[] {
  const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [startStr, endStr] = yearLabel.split('/');
  const startYear = parseInt(startStr);
  const endYear = parseInt(endStr);
  if (isNaN(startYear) || isNaN(endYear)) return [];

  const months: string[] = [];
  for (let m = 2; m <= 11; m++) months.push(`${MONTH_NAMES[m]} ${startYear}`);
  months.push(`${MONTH_NAMES[0]} ${endYear}`);
  months.push(`${MONTH_NAMES[1]} ${endYear}`);
  return months;
}
