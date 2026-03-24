// South African Tax Rates and Constants
// Updated for 2025/2026 Tax Year (1 March 2025 – 28 February 2026)
// Source: https://www.sars.gov.za/tax-rates/income-tax/rates-of-tax-for-individuals/

export const ZA_TAX_RATES = {
  VAT: {
    STANDARD: 15.00,
    ZERO: 0.00,
    EXEMPT: null,
  },

  // Individual Income Tax Brackets (2024/2025/2026 — unchanged)
  INCOME_TAX_INDIVIDUAL: [
    { min: 0, max: 237100, rate: 18, deduction: 0 },
    { min: 237101, max: 370500, rate: 26, deduction: 18968 },
    { min: 370501, max: 512800, rate: 31, deduction: 37493 },
    { min: 512801, max: 673000, rate: 36, deduction: 63133 },
    { min: 673001, max: 857900, rate: 39, deduction: 83323 },
    { min: 857901, max: 1817000, rate: 41, deduction: 100481 },
    { min: 1817001, max: Infinity, rate: 45, deduction: 173161 },
  ],

  INCOME_TAX_COMPANY: 27.00,
  INCOME_TAX_TRUST: 45.00,

  INCOME_TAX_SBC: [
    { min: 0, max: 95750, rate: 0, deduction: 0 },
    { min: 95751, max: 365000, rate: 7, deduction: 6702.50 },
    { min: 365001, max: 550000, rate: 21, deduction: 57802 },
    { min: 550001, max: Infinity, rate: 27, deduction: 90802 },
  ],

  PRIMARY_REBATE: 17235,
  SECONDARY_REBATE: 9444,
  TERTIARY_REBATE: 3145,

  MEDICAL_CREDIT_MAIN: 364,
  MEDICAL_CREDIT_ADDITIONAL: 246,

  TAX_THRESHOLD_UNDER_65: 95750,
  TAX_THRESHOLD_65_TO_74: 148217,
  TAX_THRESHOLD_75_AND_OVER: 165689,
};

export const ZA_TAX_YEAR = {
  START_MONTH: 3,
  START_DAY: 1,
  END_MONTH: 2,
  END_DAY: 28,
};

export const ZA_EXPENSE_CATEGORIES: Record<string, {
  label: string;
  description: string;
  vatDeductible: boolean;
  commonlyDeductible: number;
}> = {
  OFFICE: { label: 'Office Expenses', description: 'Stationery, supplies, office equipment', vatDeductible: true, commonlyDeductible: 100 },
  TRAVEL: { label: 'Travel & Accommodation', description: 'Business travel, hotels, flights', vatDeductible: true, commonlyDeductible: 100 },
  VEHICLE: { label: 'Vehicle Expenses', description: 'Fuel, maintenance, insurance', vatDeductible: true, commonlyDeductible: 80 },
  EQUIPMENT: { label: 'Equipment & Software', description: 'Computers, software licenses, tools', vatDeductible: true, commonlyDeductible: 100 },
  PROFESSIONAL: { label: 'Professional Fees', description: 'Accounting, legal, consulting', vatDeductible: true, commonlyDeductible: 100 },
  MARKETING: { label: 'Marketing & Advertising', description: 'Ads, promotions, marketing materials', vatDeductible: true, commonlyDeductible: 100 },
  UTILITIES: { label: 'Utilities & Internet', description: 'Electricity, water, internet, phone', vatDeductible: true, commonlyDeductible: 50 },
  INSURANCE: { label: 'Insurance', description: 'Business insurance, liability', vatDeductible: false, commonlyDeductible: 100 },
  BANK: { label: 'Bank Charges', description: 'Transaction fees, account fees', vatDeductible: false, commonlyDeductible: 100 },
  TRAINING: { label: 'Training & Development', description: 'Courses, books, conferences', vatDeductible: true, commonlyDeductible: 100 },
  RENT: { label: 'Rent & Lease', description: 'Office rent, equipment leases', vatDeductible: true, commonlyDeductible: 100 },
  ENTERTAINMENT: { label: 'Entertainment', description: 'Client entertainment, meals', vatDeductible: false, commonlyDeductible: 0 },
  MEDICAL: { label: 'Medical', description: 'Medical aid, medical expenses', vatDeductible: false, commonlyDeductible: 0 },
  OTHER: { label: 'Other Business Expenses', description: 'Miscellaneous business costs', vatDeductible: true, commonlyDeductible: 100 },
};

export const ZA_CGT = {
  ANNUAL_EXCLUSION: 40000,
  DEATH_EXCLUSION: 300000,
  INDIVIDUAL_INCLUSION_RATE: 40,
  COMPANY_INCLUSION_RATE: 80,
  TRUST_INCLUSION_RATE: 80,
};

// Tax Calculation Functions
export type EntityType = 'INDIVIDUAL' | 'COMPANY' | 'SBC' | 'TRUST' | 'CC';

export const calculateIncomeTax = (
  taxableIncome: number,
  entityType: EntityType = 'INDIVIDUAL',
  age?: number
): number => {
  if (taxableIncome <= 0) return 0;

  if (entityType === 'COMPANY' || entityType === 'CC') {
    return taxableIncome * (ZA_TAX_RATES.INCOME_TAX_COMPANY / 100);
  }
  if (entityType === 'TRUST') {
    return taxableIncome * (ZA_TAX_RATES.INCOME_TAX_TRUST / 100);
  }

  const brackets = entityType === 'SBC'
    ? ZA_TAX_RATES.INCOME_TAX_SBC
    : ZA_TAX_RATES.INCOME_TAX_INDIVIDUAL;

  const bracket = brackets.find(b => taxableIncome >= b.min && taxableIncome <= b.max);
  if (!bracket) return 0;

  let tax = (taxableIncome * bracket.rate) / 100 - bracket.deduction;

  if (entityType === 'INDIVIDUAL') {
    tax -= ZA_TAX_RATES.PRIMARY_REBATE;
    if (age && age >= 65) tax -= ZA_TAX_RATES.SECONDARY_REBATE;
    if (age && age >= 75) tax -= ZA_TAX_RATES.TERTIARY_REBATE;
  }

  return Math.max(0, tax);
};

export const getCurrentTaxYear = (): { start: Date; end: Date; label: string } => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  let startYear: number, endYear: number;
  if (currentMonth >= ZA_TAX_YEAR.START_MONTH) {
    startYear = currentYear;
    endYear = currentYear + 1;
  } else {
    startYear = currentYear - 1;
    endYear = currentYear;
  }

  return {
    start: new Date(startYear, ZA_TAX_YEAR.START_MONTH - 1, ZA_TAX_YEAR.START_DAY),
    end: new Date(endYear, ZA_TAX_YEAR.END_MONTH - 1, ZA_TAX_YEAR.END_DAY),
    label: `${startYear}/${endYear}`,
  };
};

export const formatZAR = (amount: number): string => {
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
    minimumFractionDigits: 2,
  }).format(amount);
};

export const EXPENSE_CATEGORIES = Object.entries(ZA_EXPENSE_CATEGORIES).map(
  ([key, value]) => ({ id: key, ...value })
);
