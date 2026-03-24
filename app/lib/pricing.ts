// Credit Plans & Pricing for Taxation is Theft
// PayFast is the go-to SA payment gateway (supports EFT, card, SnapScan, etc.)

export const CREDIT_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 5,
    priceZAR: 69,
    pricePerCredit: 13.80,
    popular: false,
    description: 'Try it out',
    features: [
      '5 statement analyses',
      'AI transaction categorization',
      'Basic tax report',
      'Deduction identification',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 15,
    priceZAR: 139,
    pricePerCredit: 9.27,
    popular: true,
    description: 'Most popular',
    features: [
      '15 statement analyses',
      'AI transaction categorization',
      'Full tax report with savings',
      'Deduction identification',
      'Category breakdown',
      'Year-on-year tracking',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 50,
    priceZAR: 349,
    pricePerCredit: 6.98,
    popular: false,
    description: 'Power users',
    features: [
      '50 statement analyses',
      'Everything in Standard',
      'Multiple bank accounts',
      'Priority AI processing',
      'Export to tax practitioner',
      'Historical comparisons',
    ],
  },
] as const;

export const TAX_SEASON_BUNDLE = {
  id: 'tax-season',
  name: 'Tax Season Bundle',
  credits: 24,
  priceZAR: 199,
  pricePerCredit: 8.29,
  description: '12 months of bank statements + credit card — one price',
  features: [
    '24 analyses (12 bank + 12 credit card)',
    'Complete tax year coverage',
    'Full detailed report',
    'AI-powered deductions',
    'SARS-ready documentation',
  ],
} as const;

// PayFast config
export const PAYFAST_CONFIG = {
  merchantId: process.env.PAYFAST_MERCHANT_ID || '',
  merchantKey: process.env.PAYFAST_MERCHANT_KEY || '',
  passphrase: process.env.PAYFAST_PASSPHRASE || '',
  sandbox: process.env.NODE_ENV !== 'production',
  get baseUrl() {
    return this.sandbox
      ? 'https://sandbox.payfast.co.za/eng/process'
      : 'https://www.payfast.co.za/eng/process';
  },
};

export type PlanId = typeof CREDIT_PLANS[number]['id'] | typeof TAX_SEASON_BUNDLE['id'];

export function getPlanById(id: string) {
  if (id === TAX_SEASON_BUNDLE.id) return TAX_SEASON_BUNDLE;
  return CREDIT_PLANS.find(p => p.id === id) || null;
}
