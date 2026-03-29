// Pricing for TIT Tax — bundled "red carpet" model
// PayFast is the go-to SA payment gateway (supports EFT, card, SnapScan, etc.)

// Cost breakdown per analysis (GPT-4o):
//   Input: ~15,000 tokens × $2.50/1M = $0.04
//   Output: ~8,000 tokens × $10.00/1M = $0.08
//   Total: ~$0.12 per analysis (~R2.28 at R19/$)
//   With chunking (large statements, 2 calls): ~$0.24 (~R4.56)
// Margin: 89-95% depending on plan and statement size
//
// Philosophy: Bundle EVERYTHING into the main packs. When someone buys,
// they get the full premium experience for that tax year — context accumulation,
// checkpoints, re-analysis, supporting docs. No feature gates. The product
// sells itself when they see the full experience. Loyal users for life.

export const CREDIT_PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 3,
    priceZAR: 99,
    pricePerCredit: 33,
    popular: false,
    description: 'Try it out — analyze a few months',
    features: [
      '3 statement analyses',
      'AI transaction categorization',
      'Tax deduction identification',
      'Smart AI context (learns your patterns)',
      'Free re-analysis of uploaded months',
      'Basic tax report',
    ],
  },
  {
    id: 'tax-year',
    name: 'Tax Year Complete',
    credits: 12,
    priceZAR: 330,
    pricePerCredit: 27.50,
    popular: true,
    description: 'Full tax year — the complete package',
    features: [
      '12 statement analyses (full year)',
      'Smart AI context (learns your spending)',
      'Unlimited re-analysis of any month',
      'Tax checkpoints & supporting documents',
      'SARS-ready deduction schedule (PDF)',
      'Detailed tax report with savings',
      'Category breakdown & SARS references',
    ],
  },
  {
    id: 'full-coverage',
    name: 'Full Coverage',
    credits: 24,
    priceZAR: 499,
    pricePerCredit: 20.79,
    popular: false,
    description: 'Bank + credit card — every account covered',
    features: [
      '24 statement analyses',
      'Bank + credit card + savings coverage',
      'Everything in Tax Year Complete',
      'Multiple account support',
      'Cross-account deduction matching',
      'Priority AI processing',
    ],
  },
  {
    id: 'topup-6',
    name: 'Top Up — 6 Credits',
    credits: 6,
    priceZAR: 180,
    pricePerCredit: 30,
    popular: false,
    description: 'Need a few more? Top up your balance',
    isTopUp: true,
    features: [
      '6 additional analyses',
      'Add to any existing plan',
      'Great for extra credit card statements',
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
