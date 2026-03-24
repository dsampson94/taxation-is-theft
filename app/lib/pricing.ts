// Pricing for TIT Tax — per-statement analysis model
// PayFast is the go-to SA payment gateway (supports EFT, card, SnapScan, etc.)

// Cost breakdown per analysis (GPT-4o):
//   Input: ~8,000 tokens × $2.50/1M = $0.02
//   Output: ~4,000 tokens × $10.00/1M = $0.04
//   Total: ~$0.06 per analysis (~R1.14 at R19/$)
// Margin: 96-98% depending on plan

export const CREDIT_PLANS = [
  {
    id: 'single',
    name: 'Single Analysis',
    credits: 1,
    priceZAR: 69,
    pricePerCredit: 69,
    popular: false,
    description: 'Analyze one bank statement',
    features: [
      '1 statement analysis',
      'AI transaction categorization',
      'Tax deduction identification',
      'Basic tax report',
    ],
  },
  {
    id: 'tax-year',
    name: 'Tax Year Pack',
    credits: 12,
    priceZAR: 499,
    pricePerCredit: 41.58,
    popular: true,
    description: 'Complete tax year — best value',
    features: [
      '12 statement analyses',
      'Full tax year coverage (Mar–Feb)',
      'AI transaction categorization',
      'Detailed tax report with savings',
      'Category breakdown',
      'SARS-ready deduction list',
    ],
  },
  {
    id: 'full-coverage',
    name: 'Full Coverage',
    credits: 24,
    priceZAR: 799,
    pricePerCredit: 33.29,
    popular: false,
    description: 'Bank + credit card for the year',
    features: [
      '24 statement analyses',
      'Bank account + credit card coverage',
      'Everything in Tax Year Pack',
      'Multiple account support',
      'Year-on-year comparison',
      'Priority AI processing',
    ],
  },
] as const;

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

export type PlanId = typeof CREDIT_PLANS[number]['id'];

export function getPlanById(id: string) {
  return CREDIT_PLANS.find(p => p.id === id) || null;
}
