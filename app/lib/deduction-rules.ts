// ============================================================================
// Deduction Validation Rules Engine
// Pass 2: After AI extracts transactions, this validates against SARS limits.
// This is what makes our results RELIABLE — AI proposes, rules engine validates.
// ============================================================================

import { SARS_DEDUCTION_RULES, matchOccupation } from './sa-tax-knowledge';
import { ZA_TAX_RATES, calculateIncomeTax, type EntityType } from './tax-rates-za';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface AnalyzedTransaction {
  date: string;
  description: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER';
  category: string;
  isDeductible: boolean;
  deductiblePct: number;
  confidence: number;
  sarsSection: string | null;
  notes: string;
}

export interface ValidationResult {
  transactions: ValidatedTransaction[];
  medicalCredits: MedicalCreditResult;
  retirementDeduction: RetirementDeductionResult;
  homeOfficeDeduction: HomeOfficeResult;
  travelDeduction: TravelDeductionResult;
  donationDeduction: DonationResult;
  summary: ValidationSummary;
  warnings: string[];
  tips: string[];
}

export interface ValidatedTransaction extends AnalyzedTransaction {
  validationStatus: 'approved' | 'adjusted' | 'rejected' | 'flagged';
  originalDeductiblePct: number;
  validationNote: string;
}

export interface MedicalCreditResult {
  applicable: boolean;
  monthlyCredit: number;
  annualCredit: number;
  additionalCredit: number;
  totalCredit: number;
  details: string;
}

export interface RetirementDeductionResult {
  applicable: boolean;
  contribution: number;
  limit: number;
  allowedDeduction: number;
  details: string;
}

export interface HomeOfficeResult {
  applicable: boolean;
  totalHomeExpenses: number;
  officePct: number;
  deduction: number;
  details: string;
}

export interface TravelDeductionResult {
  applicable: boolean;
  actualMethod: number;
  deemedMethod: number;
  recommended: number;
  details: string;
}

export interface DonationResult {
  applicable: boolean;
  totalDonations: number;
  limit: number;
  allowedDeduction: number;
  details: string;
}

export interface ValidationSummary {
  totalIncome: number;
  totalExpenses: number;
  totalAIDeductions: number;          // What AI suggested
  totalValidatedDeductions: number;    // After rules engine
  medicalCredits: number;
  retirementDeduction: number;
  homeOfficeDeduction: number;
  travelDeduction: number;
  donationDeduction: number;
  totalTaxBenefit: number;             // All deductions + credits combined
  taxWithoutOptimization: number;
  taxWithOptimization: number;
  totalSaved: number;
  effectiveRateBefore: number;
  effectiveRateAfter: number;
}

// ─── Main Validation Function ───────────────────────────────────────────────

export function validateAndEnrichAnalysis(
  transactions: AnalyzedTransaction[],
  profile: {
    occupation?: string;
    employmentType?: string;
    entityType?: string;
    age?: number;
    hasMedicalAid?: boolean;
    medicalAidMembers?: number;
    monthlyMedicalAidFee?: number;
    hasRetirementAnnuity?: boolean;
    annualRAContribution?: number;
    worksFromHome?: boolean;
    homeOfficePct?: number;
    usesVehicleForWork?: boolean;
    annualBusinessKm?: number;
    makesDonations?: boolean;
    hasOutOfPocketMedical?: boolean;
  }
): ValidationResult {
  const warnings: string[] = [];
  const tips: string[] = [];
  const occupationProfile = matchOccupation(profile.occupation || 'employed');

  // ── Step 1: Validate each transaction ──
  const validatedTransactions = transactions.map(tx =>
    validateTransaction(tx, profile, warnings)
  );

  // ── Step 2: Calculate totals ──
  const totalIncome = validatedTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalExpenses = validatedTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalAIDeductions = transactions
    .filter(t => t.isDeductible)
    .reduce((sum, t) => sum + Math.abs(t.amount) * (t.deductiblePct / 100), 0);

  const totalValidatedDeductions = validatedTransactions
    .filter(t => t.isDeductible && t.validationStatus !== 'rejected')
    .reduce((sum, t) => sum + Math.abs(t.amount) * (t.deductiblePct / 100), 0);

  // ── Step 3: Calculate medical tax credits ──
  const medicalCredits = calculateMedicalCredits(profile, totalIncome, validatedTransactions);
  if (medicalCredits.applicable && medicalCredits.totalCredit > 0) {
    tips.push(`Medical tax credits save you ${formatR(medicalCredits.totalCredit)}/year. Make sure your IRP5 reflects this correctly.`);
  }
  if (profile.hasMedicalAid && !medicalCredits.applicable) {
    warnings.push('You indicated you have medical aid but we couldn\'t calculate credits — please check your profile.');
  }

  // ── Step 4: Calculate retirement annuity deduction ──
  const retirementDeduction = calculateRetirementDeduction(profile, totalIncome);
  if (retirementDeduction.applicable && retirementDeduction.allowedDeduction > 0) {
    tips.push(`Your RA contribution of ${formatR(retirementDeduction.contribution)} is deductible. Your limit is ${formatR(retirementDeduction.limit)} — consider contributing more if possible.`);
  }
  if (!profile.hasRetirementAnnuity && totalIncome > 200000) {
    tips.push('You don\'t have a Retirement Annuity. An RA can save you up to 27.5% of contributions in tax. Consider opening one.');
  }

  // ── Step 5: Calculate home office deduction ──
  const homeOfficeDeduction = calculateHomeOffice(profile, validatedTransactions);

  // ── Step 6: Calculate travel deduction ──
  const travelDeduction = calculateTravelDeduction(profile, validatedTransactions);

  // ── Step 7: Calculate donation deduction ──
  const donationDeduction = calculateDonationDeduction(validatedTransactions, totalIncome);

  // ── Step 8: Calculate total tax impact ──
  const entityType = (profile.entityType || 'INDIVIDUAL') as EntityType;
  const age = profile.age || 35;

  const allDeductions = totalValidatedDeductions + retirementDeduction.allowedDeduction +
    homeOfficeDeduction.deduction + travelDeduction.recommended + donationDeduction.allowedDeduction;

  const taxWithout = calculateIncomeTax(totalIncome, entityType, age);
  const taxWith = calculateIncomeTax(Math.max(0, totalIncome - allDeductions), entityType, age);
  const taxAfterCredits = Math.max(0, taxWith - medicalCredits.totalCredit);

  const totalSaved = taxWithout - taxAfterCredits;

  // ── Occupation-specific tips ──
  tips.push(...occupationProfile.tips);

  // Check for commonly missed deductions
  for (const missed of occupationProfile.commonMissed) {
    const found = validatedTransactions.some(tx =>
      tx.isDeductible && tx.notes?.toLowerCase().includes(missed.toLowerCase().split(' ')[0])
    );
    if (!found) {
      tips.push(`Commonly missed for ${occupationProfile.label}: ${missed}`);
    }
  }

  return {
    transactions: validatedTransactions,
    medicalCredits,
    retirementDeduction,
    homeOfficeDeduction,
    travelDeduction,
    donationDeduction,
    summary: {
      totalIncome,
      totalExpenses,
      totalAIDeductions,
      totalValidatedDeductions,
      medicalCredits: medicalCredits.totalCredit,
      retirementDeduction: retirementDeduction.allowedDeduction,
      homeOfficeDeduction: homeOfficeDeduction.deduction,
      travelDeduction: travelDeduction.recommended,
      donationDeduction: donationDeduction.allowedDeduction,
      totalTaxBenefit: allDeductions + medicalCredits.totalCredit,
      taxWithoutOptimization: taxWithout,
      taxWithOptimization: taxAfterCredits,
      totalSaved,
      effectiveRateBefore: totalIncome > 0 ? (taxWithout / totalIncome) * 100 : 0,
      effectiveRateAfter: totalIncome > 0 ? (taxAfterCredits / totalIncome) * 100 : 0,
    },
    warnings,
    tips,
  };
}

// ─── Transaction Validation ─────────────────────────────────────────────────

function validateTransaction(
  tx: AnalyzedTransaction,
  profile: { employmentType?: string; occupation?: string },
  warnings: string[]
): ValidatedTransaction {
  const validated: ValidatedTransaction = {
    ...tx,
    originalDeductiblePct: tx.deductiblePct,
    validationStatus: 'approved',
    validationNote: '',
  };

  if (!tx.isDeductible) return validated;

  // Rule 1: Entertainment is almost never deductible
  if (tx.category === 'ENTERTAINMENT') {
    if (tx.deductiblePct > 50) {
      validated.deductiblePct = 0;
      validated.isDeductible = false;
      validated.validationStatus = 'rejected';
      validated.validationNote = 'Entertainment expenses are generally not deductible under SARS rules.';
      return validated;
    }
  }

  // Rule 2: Personal expenses are NEVER deductible
  if (tx.category === 'PERSONAL' || tx.category === 'FOOD') {
    if (tx.isDeductible) {
      validated.isDeductible = false;
      validated.deductiblePct = 0;
      validated.validationStatus = 'rejected';
      validated.validationNote = 'Personal living expenses are not deductible.';
      return validated;
    }
  }

  // Rule 3: Medical expenses are credits, not deductions
  if (tx.category === 'MEDICAL') {
    validated.isDeductible = false;
    validated.deductiblePct = 0;
    validated.validationStatus = 'adjusted';
    validated.validationNote = 'Medical expenses qualify for medical TAX CREDITS (Section 6A/6B), not deductions. Calculated separately.';
    return validated;
  }

  // Rule 4: Employed people have very limited deductions
  if (profile.employmentType === 'employed') {
    const allowedForEmployed = ['PROFESSIONAL', 'TRAINING', 'DONATION', 'RETIREMENT'];
    if (!allowedForEmployed.includes(tx.category) && tx.category !== 'BANK') {
      validated.validationStatus = 'flagged';
      validated.validationNote = 'As a salaried employee, this deduction may only apply if the expense was required by your employer and not reimbursed.';
      warnings.push(`"${tx.description}" flagged: salaried employees have limited deduction options for ${tx.category} expenses.`);
    }
  }

  // Rule 5: Cap unreasonably high confidence
  if (tx.confidence > 0.95 && tx.deductiblePct === 100) {
    validated.validationNote = 'High confidence — verify with supporting documents.';
  }

  // Rule 6: Mixed-use items should not be 100%
  const mixedUseCategories = ['UTILITIES', 'VEHICLE'];
  if (mixedUseCategories.includes(tx.category) && tx.deductiblePct === 100) {
    validated.deductiblePct = tx.category === 'VEHICLE' ? 80 : 50;
    validated.validationStatus = 'adjusted';
    validated.validationNote = `Adjusted from 100% to ${validated.deductiblePct}% — mixed personal/business use items require proportional deduction.`;
  }

  return validated;
}

// ─── Medical Credits Calculator ─────────────────────────────────────────────

function calculateMedicalCredits(
  profile: {
    hasMedicalAid?: boolean;
    medicalAidMembers?: number;
    monthlyMedicalAidFee?: number;
    hasOutOfPocketMedical?: boolean;
    age?: number;
  },
  annualIncome: number,
  transactions: ValidatedTransaction[]
): MedicalCreditResult {
  if (!profile.hasMedicalAid || !profile.medicalAidMembers) {
    return { applicable: false, monthlyCredit: 0, annualCredit: 0, additionalCredit: 0, totalCredit: 0, details: 'No medical aid on profile.' };
  }

  const rules = SARS_DEDUCTION_RULES.medicalCredits;
  const monthlyCredit = rules.calculateMonthlyCredit(profile.medicalAidMembers);
  const annualCredit = rules.calculateAnnualCredit(profile.medicalAidMembers);

  // Calculate additional credit for out-of-pocket medical
  let additionalCredit = 0;
  if (profile.hasOutOfPocketMedical) {
    const outOfPocketTotal = transactions
      .filter(t => t.category === 'MEDICAL' && t.type === 'EXPENSE')
      .reduce((sum, t) => sum + Math.abs(t.amount), 0);

    const annualFees = (profile.monthlyMedicalAidFee || 0) * 12;
    const age = profile.age || 35;
    additionalCredit = rules.calculateAdditionalCredit(outOfPocketTotal, annualCredit, annualFees, age);
  }

  return {
    applicable: true,
    monthlyCredit,
    annualCredit,
    additionalCredit,
    totalCredit: annualCredit + additionalCredit,
    details: `${profile.medicalAidMembers} member(s): R${monthlyCredit}/month credit = R${annualCredit}/year${additionalCredit > 0 ? ` + R${Math.round(additionalCredit)} additional medical credit` : ''}`,
  };
}

// ─── Retirement Deduction Calculator ────────────────────────────────────────

function calculateRetirementDeduction(
  profile: {
    hasRetirementAnnuity?: boolean;
    annualRAContribution?: number;
  },
  annualIncome: number
): RetirementDeductionResult {
  if (!profile.hasRetirementAnnuity || !profile.annualRAContribution) {
    return { applicable: false, contribution: 0, limit: 0, allowedDeduction: 0, details: 'No RA contributions.' };
  }

  const rules = SARS_DEDUCTION_RULES.retirementAnnuity;
  const contribution = profile.annualRAContribution;
  const limit = Math.min(annualIncome * (rules.maxPctOfRemuneration / 100), rules.annualCap);
  const allowed = rules.calculation(annualIncome, contribution);

  return {
    applicable: true,
    contribution,
    limit,
    allowedDeduction: allowed,
    details: `RA contribution R${contribution.toLocaleString()} — deductible amount R${allowed.toLocaleString()} (limit: R${Math.round(limit).toLocaleString()})`,
  };
}

// ─── Home Office Calculator ─────────────────────────────────────────────────

function calculateHomeOffice(
  profile: { worksFromHome?: boolean; homeOfficePct?: number; employmentType?: string },
  transactions: ValidatedTransaction[]
): HomeOfficeResult {
  if (!profile.worksFromHome || !profile.homeOfficePct) {
    return { applicable: false, totalHomeExpenses: 0, officePct: 0, deduction: 0, details: 'Not applicable.' };
  }

  // Find home-related expenses in transactions
  const homeKeywords = ['rent', 'bond', 'mortgage', 'rates', 'levy', 'electricity', 'water', 'internet', 'fibre', 'security', 'cleaning', 'insurance'];
  const homeExpenses = transactions.filter(t =>
    t.type === 'EXPENSE' &&
    homeKeywords.some(kw => t.description.toLowerCase().includes(kw))
  );

  const totalHomeExpenses = homeExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const deduction = SARS_DEDUCTION_RULES.homeOffice.calculate(totalHomeExpenses, profile.homeOfficePct);

  const qualifier = profile.employmentType === 'employed'
    ? ' (Note: employees must prove exclusive use AND employer requirement)'
    : '';

  return {
    applicable: true,
    totalHomeExpenses,
    officePct: profile.homeOfficePct,
    deduction,
    details: `${profile.homeOfficePct}% of R${totalHomeExpenses.toLocaleString()} home expenses = R${Math.round(deduction).toLocaleString()} deduction${qualifier}`,
  };
}

// ─── Travel Deduction Calculator ────────────────────────────────────────────

function calculateTravelDeduction(
  profile: { usesVehicleForWork?: boolean; annualBusinessKm?: number },
  transactions: ValidatedTransaction[]
): TravelDeductionResult {
  if (!profile.usesVehicleForWork || !profile.annualBusinessKm) {
    return { applicable: false, actualMethod: 0, deemedMethod: 0, recommended: 0, details: 'Not applicable.' };
  }

  const vehicleExpenses = transactions.filter(t =>
    t.type === 'EXPENSE' && t.category === 'VEHICLE'
  );

  const totalVehicleCosts = vehicleExpenses.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const estimatedTotalKm = Math.max(profile.annualBusinessKm * 2, 15000); // Estimate total km

  const result = SARS_DEDUCTION_RULES.travelAllowance.calculate(
    profile.annualBusinessKm,
    estimatedTotalKm,
    totalVehicleCosts
  );

  return {
    applicable: true,
    ...result,
    details: `Business km: ${profile.annualBusinessKm.toLocaleString()}. Actual method: R${Math.round(result.actualMethod).toLocaleString()}, Deemed method: R${Math.round(result.deemedMethod).toLocaleString()}. Using higher amount.`,
  };
}

// ─── Donation Deduction Calculator ──────────────────────────────────────────

function calculateDonationDeduction(
  transactions: ValidatedTransaction[],
  annualIncome: number
): DonationResult {
  const donations = transactions.filter(t =>
    t.category === 'DONATION' && t.type === 'EXPENSE'
  );

  if (donations.length === 0) {
    return { applicable: false, totalDonations: 0, limit: 0, allowedDeduction: 0, details: 'No donations found.' };
  }

  const totalDonations = donations.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const result = SARS_DEDUCTION_RULES.donations.calculate(totalDonations, annualIncome);

  return {
    applicable: true,
    totalDonations,
    limit: annualIncome * 0.1,
    allowedDeduction: result,
    details: `Donations: R${totalDonations.toLocaleString()} (deductible: R${result.toLocaleString()}, limit: R${Math.round(annualIncome * 0.1).toLocaleString()})`,
  };
}

// ─── Helper ─────────────────────────────────────────────────────────────────

function formatR(amount: number): string {
  return `R${Math.round(amount).toLocaleString()}`;
}
