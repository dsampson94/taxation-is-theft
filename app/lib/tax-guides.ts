export interface TaxGuideData {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  heading: string;
  intro: string;
  sections: { heading: string; content: string }[];
  keywords: string[];
  relatedProfessions: string[];
}

export const taxGuides: TaxGuideData[] = [
  {
    slug: "home-office-deduction",
    title: "Home Office Deduction",
    metaTitle: "Home Office Tax Deduction South Africa — SARS Section 23(b) Guide",
    metaDescription:
      "Learn how to claim your home office deduction with SARS. Requirements under Section 23(b), what qualifies, how to calculate, and common mistakes. Free AI-powered analysis.",
    heading: "How to Claim Your Home Office Deduction in South Africa",
    intro:
      "If you work from home — whether as a remote employee, freelancer, or business owner — you may be entitled to deduct a portion of your rent, bond interest, rates, electricity, and internet costs from your taxable income under SARS Section 23(b).",
    sections: [
      {
        heading: "Who Qualifies for the Home Office Deduction?",
        content:
          "You qualify if you have a dedicated room or area in your home used regularly and exclusively for work purposes. Commission earners (earning more than 50% in commission) and self-employed individuals have the best chance of claiming. Salaried employees can claim if their employment contract requires them to work from home and their employer does not provide an office.",
      },
      {
        heading: "What Expenses Can You Claim?",
        content:
          "Eligible expenses include a proportional share of: rent or bond interest, property rates and taxes, home insurance, electricity and water, internet and phone costs, cleaning costs for the office space, repairs and maintenance to the home office area, and depreciation on office furniture and equipment.",
      },
      {
        heading: "How to Calculate the Deduction",
        content:
          "Calculate the floor area of your dedicated office as a percentage of your total home floor area. Apply this percentage to your total housing costs. For example, if your office is 15m² and your home is 150m², you can claim 10% of qualifying expenses. Keep records of all expenses and measurements.",
      },
      {
        heading: "Common Mistakes to Avoid",
        content:
          "Don't claim for a shared space (e.g. a dining table used sometimes for work). The room must be exclusively for work. Don't over-estimate the floor area percentage. Keep receipts and municipal statements as proof. Salaried employees often have their claims rejected — make sure your employer requires home-based work.",
      },
    ],
    keywords: [
      "home office deduction South Africa",
      "SARS section 23(b)",
      "work from home tax deduction",
      "home office claim SARS",
      "remote work tax deduction SA",
      "how to claim home office",
    ],
    relatedProfessions: ["software-developer", "freelancer", "consultant", "graphic-designer"],
  },
  {
    slug: "travel-allowance-claim",
    title: "Travel Allowance",
    metaTitle: "Travel Allowance Tax Claim South Africa — SARS Guide 2025",
    metaDescription:
      "How to claim your travel allowance with SARS. Actual cost method vs deemed cost method, logbook requirements, and how to maximize your vehicle deduction.",
    heading: "How to Claim Travel Allowance in South Africa",
    intro:
      "If you receive a travel allowance from your employer or use your own vehicle for business purposes, you can claim a significant tax deduction. SARS provides two methods: the actual cost method (with a logbook) and the deemed cost method.",
    sections: [
      {
        heading: "Actual Cost Method (Logbook Required)",
        content:
          "Keep a detailed logbook recording every business trip: date, destination, purpose, and kilometres driven. At year-end, calculate your total business kilometres vs personal kilometres. Claim the business percentage of all vehicle costs: fuel, maintenance, insurance, licence fees, finance charges, and depreciation (limited to R 245,056 cost price for 2025).",
      },
      {
        heading: "Deemed Cost Method (No Logbook)",
        content:
          "If you don't keep a logbook, SARS applies a prescribed rate per kilometre based on the value of your vehicle. This is simpler but usually results in a smaller deduction. SARS publishes these rates annually in the Government Gazette.",
      },
      {
        heading: "Who Should Keep a Logbook?",
        content:
          "If you drive more than 10,000 business kilometres per year, the actual cost method almost always yields a larger deduction. Sales reps, estate agents, and anyone with a travel allowance should keep a logbook. Digital logbook apps are accepted by SARS.",
      },
      {
        heading: "Tips to Maximize Your Claim",
        content:
          "Start your logbook on 1 March (the tax year start). Record trips immediately — don't reconstruct from memory. Include trips between multiple work sites, client visits, and trips to the post office or bank for business purposes. Keep fuel slips and maintenance receipts.",
      },
    ],
    keywords: [
      "travel allowance claim South Africa",
      "SARS travel deduction",
      "logbook SARS",
      "vehicle deduction South Africa",
      "travel allowance tax",
      "business kilometres claim",
    ],
    relatedProfessions: ["sales-representative", "real-estate-agent", "uber-driver", "tradesperson"],
  },
  {
    slug: "medical-tax-credits",
    title: "Medical Tax Credits",
    metaTitle: "Medical Tax Credits South Africa — How to Claim with SARS",
    metaDescription:
      "Complete guide to medical tax credits in South Africa. Section 6A and 6B credits, medical scheme fees, out-of-pocket expenses, and how to maximize your claim.",
    heading: "Medical Tax Credits in South Africa: A Complete Guide",
    intro:
      "South Africa offers two types of medical tax credits: the Medical Scheme Fees Tax Credit (Section 6A) and the Additional Medical Expenses Tax Credit (Section 6B). Together, these can significantly reduce your tax bill, especially if you have dependants or high medical expenses.",
    sections: [
      {
        heading: "Medical Scheme Fees Tax Credit (Section 6A)",
        content:
          "For the 2025 tax year, you receive a fixed monthly credit of R364 for the main member, R364 for the first dependant, and R246 for each additional dependant. These credits apply regardless of what you actually pay in medical aid contributions.",
      },
      {
        heading: "Additional Medical Expenses Tax Credit (Section 6B)",
        content:
          "If your out-of-pocket medical expenses (plus medical aid contributions exceeding 4× the Section 6A credits) are significant, you may claim an additional credit. For taxpayers under 65, the formula is: 25% × (qualifying expenses minus 7.5% of taxable income). Over-65s get a more generous calculation.",
      },
      {
        heading: "What Counts as Qualifying Medical Expenses?",
        content:
          "Doctor and specialist visits, prescription medication, hospital stays, dental work, optometry, physiotherapy, and prescribed chronic medication. Also includes disability-related expenses (wheelchair, modifications to home/vehicle). Keep ALL receipts and medical aid statements.",
      },
      {
        heading: "How TIT Tax Helps",
        content:
          "Our AI scans your bank statements for medical-related transactions — pharmacy payments, doctor visits, hospital fees — and automatically flags them for your medical tax credit calculation. No more digging through receipts manually.",
      },
    ],
    keywords: [
      "medical tax credit South Africa",
      "SARS section 6A",
      "medical scheme fees tax credit",
      "medical expenses tax deduction",
      "medical aid tax benefit SA",
      "out of pocket medical expenses SARS",
    ],
    relatedProfessions: ["doctor", "nurse", "pharmacist"],
  },
  {
    slug: "retirement-annuity-deduction",
    title: "Retirement Annuity Deduction",
    metaTitle: "Retirement Annuity Tax Deduction South Africa — Section 11(k) Guide",
    metaDescription:
      "How to claim your retirement annuity contributions with SARS. Section 11(k) rules, contribution limits, and how to reduce your taxable income legally.",
    heading: "Retirement Annuity Tax Deduction in South Africa",
    intro:
      "Contributions to a retirement annuity (RA) fund are one of the most powerful tax deductions available to South Africans. Under Section 11(k), you can deduct up to 27.5% of your taxable income (capped at R350,000 per year) for contributions to approved retirement funds.",
    sections: [
      {
        heading: "How Much Can You Deduct?",
        content:
          "The deduction is the lesser of: 27.5% of your taxable income (before the RA deduction), or R350,000 per year. This includes contributions to pension funds, provident funds, and retirement annuity funds combined. Any excess contributions roll over to the next tax year.",
      },
      {
        heading: "Why Freelancers and Self-Employed Should Use RAs",
        content:
          "If you're self-employed or a freelancer, you likely don't have a company pension fund. An RA is your primary vehicle for tax-deductible retirement savings. Contributing to an RA directly reduces your taxable income, potentially dropping you into a lower tax bracket.",
      },
      {
        heading: "Tax on Withdrawal",
        content:
          "RA funds can only be accessed at age 55 or on emigration. At retirement, the first R550,000 is tax-free (2025 rates). The balance is taxed according to the retirement lump sum tax table. This makes RAs particularly advantageous for long-term tax planning.",
      },
      {
        heading: "How TIT Tax Identifies RA Contributions",
        content:
          "When you upload your bank statements, our AI identifies debit orders and payments to known RA providers (Allan Gray, Coronation, Sanlam, Old Mutual, 10X, etc.) and automatically includes them in your deduction calculation.",
      },
    ],
    keywords: [
      "retirement annuity tax deduction South Africa",
      "section 11(k) SARS",
      "RA contribution tax benefit",
      "retirement fund deduction",
      "tax free retirement savings SA",
      "reduce taxable income South Africa",
    ],
    relatedProfessions: ["freelancer", "consultant", "software-developer"],
  },
  {
    slug: "provisional-tax-guide",
    title: "Provisional Tax",
    metaTitle: "Provisional Tax South Africa — Who Must Pay & How to File",
    metaDescription:
      "Complete guide to provisional tax in South Africa. Who must register, payment deadlines, how to calculate estimates, and penalties for late submission.",
    heading: "Provisional Tax in South Africa: Who Must Pay and How",
    intro:
      "If you earn income that is not subject to PAYE (employees' tax) — such as freelance income, rental income, or investment income exceeding R30,000 — you're likely a provisional taxpayer. This means you must estimate and pay your tax in advance, twice a year.",
    sections: [
      {
        heading: "Who Is a Provisional Taxpayer?",
        content:
          "You must register as a provisional taxpayer if you: earn any freelance or contract income, receive rental income, earn investment income (interest, dividends, capital gains) exceeding R30,000 per year, or are a sole proprietor or partner in a business. Salaried employees who ONLY earn a salary and interest below R30,000 are exempt.",
      },
      {
        heading: "Payment Deadlines",
        content:
          "First payment (IRP6): Due 31 August (6 months into the tax year). Second payment (IRP6): Due 28/29 February (end of tax year). Optional third payment: Due 30 September (for the preceding tax year). Each payment should be roughly half your estimated total tax liability for the year.",
      },
      {
        heading: "Penalties for Late Payment or Underestimation",
        content:
          "SARS charges 10% penalty on underpayment if your estimate is less than 80% of actual taxable income (or 90% for taxable income over R1 million). Interest is charged on late payments at the prescribed rate. It's better to slightly overestimate than to underestimate.",
      },
      {
        heading: "How TIT Tax Helps Provisional Taxpayers",
        content:
          "Upload your bank statements and our AI calculates your estimated taxable income, identifies deductions, and helps you determine the correct provisional tax amount — reducing the risk of penalties for underestimation.",
      },
    ],
    keywords: [
      "provisional tax South Africa",
      "IRP6 filing",
      "provisional taxpayer SARS",
      "freelancer provisional tax",
      "provisional tax deadline South Africa",
      "estimated tax payment SARS",
    ],
    relatedProfessions: ["freelancer", "uber-driver", "content-creator", "consultant"],
  },
  {
    slug: "section-11-deductions",
    title: "Section 11 Deductions",
    metaTitle: "Section 11 Tax Deductions South Africa — Complete SARS Guide",
    metaDescription:
      "All Section 11 tax deductions explained for South African taxpayers. From trade expenses to bad debts, depreciation, and more. Find deductions you're missing.",
    heading: "Section 11 Tax Deductions: What Every South African Should Know",
    intro:
      "Section 11 of the Income Tax Act is where most individual and business deductions live. If you earn income from trade, you can deduct expenses actually incurred in the production of that income, provided they are not of a capital nature.",
    sections: [
      {
        heading: "Section 11(a) — General Deduction Formula",
        content:
          "Expenditure actually incurred in the production of income, not of a capital nature. This is the broadest deduction and covers most business expenses: office supplies, professional fees, bank charges, accounting costs, and any expense directly related to earning your income.",
      },
      {
        heading: "Section 11(e) — Wear and Tear (Depreciation)",
        content:
          "Claim depreciation on assets used for trade: computers (3 years), office furniture (6 years), vehicles (5 years), and other equipment. SARS publishes Interpretation Note 47 with wear-and-tear rates for various asset types.",
      },
      {
        heading: "Section 11(k) — Retirement Fund Contributions",
        content:
          "Deduct up to 27.5% of taxable income (maximum R350,000) for pension, provident, and retirement annuity fund contributions.",
      },
      {
        heading: "Section 11(j) — Doubtful Debts",
        content:
          "If you're in trade and have outstanding debts owed to you that are doubtful, you can claim an allowance. SARS allows 25% of doubtful debts for the first year and 40% for debts outstanding for 120+ days.",
      },
    ],
    keywords: [
      "section 11 deductions South Africa",
      "SARS general deduction formula",
      "wear and tear SARS",
      "depreciation tax deduction SA",
      "trade deductions Income Tax Act",
      "section 11(a) SARS",
    ],
    relatedProfessions: ["accountant", "freelancer", "consultant"],
  },
];

export function getTaxGuideBySlug(slug: string): TaxGuideData | undefined {
  return taxGuides.find((g) => g.slug === slug);
}
