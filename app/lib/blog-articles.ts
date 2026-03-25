export interface BlogArticle {
  slug: string;
  title: string;
  metaTitle: string;
  metaDescription: string;
  excerpt: string;
  category: "SARS eFiling" | "Deadlines" | "Deductions" | "Compliance" | "Tax Tips" | "News";
  publishDate: string; // YYYY-MM-DD
  lastUpdated: string; // YYYY-MM-DD
  readingTime: number; // minutes
  sections: { heading: string; content: string }[];
  keywords: string[];
  relatedSlugs: string[];
}

export const blogArticles: BlogArticle[] = [
  // ═══════════════════════════════════════════════════════════════
  // SARS eFiling & ITR12
  // ═══════════════════════════════════════════════════════════════
  {
    slug: "how-to-file-tax-return-sars-efiling",
    title: "How to File Your Tax Return on SARS eFiling (Step-by-Step)",
    metaTitle: "How to File Tax Return on SARS eFiling 2025 — Step-by-Step Guide",
    metaDescription:
      "Complete step-by-step guide to filing your ITR12 tax return on SARS eFiling. Registration, login, IRP5 import, deductions, and submission for the 2024/2025 tax year.",
    excerpt:
      "A practical walkthrough of the entire SARS eFiling process — from registering your profile to submitting your ITR12 and checking your assessment.",
    category: "SARS eFiling",
    publishDate: "2025-07-01",
    lastUpdated: "2025-07-01",
    readingTime: 8,
    sections: [
      {
        heading: "1. Register on SARS eFiling",
        content:
          "Visit efiling.sars.gov.za and click 'Register'. You'll need your South African ID number, contact details, and a valid email address. SARS will send a one-time PIN (OTP) to verify your identity. If you've previously registered but forgot your password, use the 'Forgot Password' or 'Forgot Username' links rather than creating a new account — duplicate accounts cause compliance issues.",
      },
      {
        heading: "2. Request Your ITR12",
        content:
          "Once logged in, navigate to Returns → Tax Returns → Request Return. Select the correct tax year (e.g. 2025 for the March 2024 – February 2025 period). SARS will generate a pre-populated ITR12 with data from your employer's IRP5 submissions, your bank interest certificates (IT3(b)), and medical aid tax certificates. Always check that the pre-populated data is correct before proceeding.",
      },
      {
        heading: "3. Import Your IRP5 / IT3(a) Certificate",
        content:
          "If your employer has submitted your IRP5 to SARS, it should auto-populate in Section A of your ITR12. Verify: source code 3601 (salary), 3605 (commission), 4001 (pension fund contributions), 4003 (medical aid employer contributions). If your IRP5 is missing, contact your employer — they are legally required to submit it. You can also manually capture it under 'Add a source of income'.",
      },
      {
        heading: "4. Declare Additional Income",
        content:
          "Declare all income not on your IRP5: freelance/contract income (use source code 3616), rental income (code 4250), local interest income (code 4201), foreign dividends (code 4216), and capital gains. SARS cross-references with banks and third parties — omitting income is a criminal offence under the Tax Administration Act.",
      },
      {
        heading: "5. Claim Your Deductions",
        content:
          "Complete the deductions sections: medical credits (Section 6A/6B), retirement annuity contributions (Section 11(k)), travel allowance (Section 8(1)(b)), home office (Section 23(b)), and other Section 11 trade expenses. For each deduction, you'll need supporting documents — SARS may request these during a verification or audit.",
      },
      {
        heading: "6. Submit and Check Your Assessment",
        content:
          "Review the declaration, tick the confirmation box, and click Submit. SARS will issue an ITA34 assessment within seconds for most returns. If you owe tax, the amount and payment deadline will be shown. If you're due a refund, it typically reflects within 72 hours (but can take up to 21 business days). If your return is selected for verification, you'll receive a request for supporting documents — upload these via eFiling promptly.",
      },
    ],
    keywords: [
      "how to file tax return SARS eFiling",
      "SARS ITR12 guide",
      "eFiling step by step",
      "file tax return South Africa",
      "SARS eFiling 2025",
      "submit tax return online South Africa",
    ],
    relatedSlugs: ["sars-efiling-deadlines-2025", "what-documents-needed-tax-return"],
  },
  {
    slug: "sars-efiling-deadlines-2025",
    title: "SARS Tax Filing Deadlines 2025 — Key Dates You Can't Miss",
    metaTitle: "SARS Tax Filing Deadlines 2025 — All Key Dates for Individual Taxpayers",
    metaDescription:
      "All SARS tax filing deadlines for the 2024/2025 tax year. Auto-assessment, non-provisional, provisional taxpayer dates, and penalties for late filing.",
    excerpt:
      "Every deadline that matters for the 2024/2025 tax year — auto-assessments, provisional tax, objections, and what happens if you miss them.",
    category: "Deadlines",
    publishDate: "2025-06-15",
    lastUpdated: "2025-06-15",
    readingTime: 5,
    sections: [
      {
        heading: "Auto-Assessments (Section 95 Assessments)",
        content:
          "SARS issues auto-assessments from 1 July for taxpayers with simple tax affairs (single employer, no additional income, no deductions to claim). If you accept the auto-assessment, you don't need to file. Log in to eFiling before 21 October to check if you've received one. If you disagree or have additional deductions to claim, you must 'Edit' the return and file manually — the auto-assessment deadline is 21 October 2025.",
      },
      {
        heading: "Non-Provisional Taxpayers (Salaried Employees)",
        content:
          "Filing season opens 1 July 2025 at SARS branches and 1 July for eFiling. The deadline is 21 October 2025 for electronic filing (eFiling/MobiApp). If you file at a SARS branch, the deadline is typically earlier. Late submission attracts a penalty of R250 for every month the return is outstanding, up to a maximum of 35 months (R8,750).",
      },
      {
        heading: "Provisional Taxpayers (IRP6)",
        content:
          "First payment (IRP6): 31 August 2025. Second payment (IRP6): 28 February 2026. Provisional taxpayer filing deadline: 31 January 2026 (extended from the non-provisional deadline). Third voluntary top-up payment: 30 September 2025. Underestimation of taxable income by more than 20% (or 10% for income exceeding R1 million) triggers a penalty.",
      },
      {
        heading: "Objections and Appeals",
        content:
          "If you disagree with your assessment (ITA34), you have 30 business days to file a Notice of Objection via eFiling. If the objection is disallowed, you have a further 30 business days to file an appeal. These timelines are strict — missing them means you lose your right to dispute unless SARS grants condonation.",
      },
      {
        heading: "Penalties for Late Filing",
        content:
          "Administrative penalty: R250/month for each month the return is outstanding (individual earning under R250K). The penalty scales based on taxable income: up to R16,000/month for taxpayers earning above R10 million. Interest on late payment: the prescribed rate (currently around 11.5%) on any outstanding tax owed. SARS can also issue a reduced assessment if you don't file, which often overestimates your liability.",
      },
    ],
    keywords: [
      "SARS filing deadline 2025",
      "tax return deadline South Africa",
      "when to file tax return SARS",
      "SARS late filing penalty",
      "provisional tax deadline",
      "auto assessment SARS 2025",
    ],
    relatedSlugs: ["how-to-file-tax-return-sars-efiling", "provisional-tax-explained"],
  },

  // ═══════════════════════════════════════════════════════════════
  // Deductions & Credits
  // ═══════════════════════════════════════════════════════════════
  {
    slug: "what-can-i-claim-against-tax-south-africa",
    title: "What Can I Claim Against Tax in South Africa? (2025 Guide)",
    metaTitle: "What Can I Claim Against Tax in South Africa? — Complete 2025 Guide",
    metaDescription:
      "Everything you can claim as a tax deduction in South Africa. Section 11 deductions, home office, travel, medical credits, retirement annuity, and more with SARS references.",
    excerpt:
      "A comprehensive overview of every deduction and credit available to individual South African taxpayers — sorted by category with SARS section references.",
    category: "Deductions",
    publishDate: "2025-03-15",
    lastUpdated: "2025-03-15",
    readingTime: 10,
    sections: [
      {
        heading: "The General Deduction Formula — Section 11(a)",
        content:
          "The starting point for most deductions: expenditure actually incurred in the production of income, not of a capital nature. This covers most business-related expenses for people who earn trade income. Salaried employees who don't carry on a trade generally cannot claim Section 11(a) deductions — the exception is commission earners who earn more than 50% of their remuneration in commission.",
      },
      {
        heading: "Home Office — Section 23(b)",
        content:
          "If you have a dedicated room used regularly and exclusively for work, you can deduct a proportion of rent/bond interest, rates, electricity, internet, and insurance. The proportion is calculated as office floor area ÷ total home floor area. Commission earners (>50%) and self-employed individuals qualify. Salaried employees only qualify if their employer requires them to work from home and doesn't provide an office. SARS Interpretation Note 28 provides detailed guidance.",
      },
      {
        heading: "Travel Allowance — Section 8(1)(b)",
        content:
          "If you receive a travel allowance from your employer or use your own vehicle for business, you can claim: (a) Actual cost method — keep a logbook, claim business % of actual vehicle costs (fuel, insurance, maintenance, depreciation limited to R245,056 cost). (b) Deemed cost method — SARS prescribed rate per km (no logbook needed, but usually a smaller deduction). SARS publishes fixed cost tables annually.",
      },
      {
        heading: "Medical Tax Credits — Section 6A and 6B",
        content:
          "Section 6A: Fixed monthly credit per member — R364/month for main member + first dependant, R246/month for additional dependants (2025 rates). Section 6B: Additional credit for high out-of-pocket medical expenses — 25% of (qualifying expenses minus 7.5% of taxable income) for under-65s. Over-65s and people with disabilities get a more generous formula. These are credits (reduce tax payable), not deductions (reduce taxable income).",
      },
      {
        heading: "Retirement Contributions — Section 11(k)",
        content:
          "Contributions to pension funds, provident funds, and retirement annuities are deductible up to the lesser of: 27.5% of the greater of remuneration or taxable income, or R350,000 per year. Excess contributions carry forward to the next year. This is the single most powerful deduction for high-income earners and self-employed individuals.",
      },
      {
        heading: "Donations — Section 18A",
        content:
          "Donations to approved Section 18A organisations (public benefit organisations) are deductible up to 10% of taxable income. You must have a Section 18A receipt from the organisation with their PBO reference number. Cash, property, and listed shares qualify. Donations to political parties, foreign organisations, or individuals are NOT deductible.",
      },
      {
        heading: "Wear and Tear — Section 11(e)",
        content:
          "Capital assets used for trade can be depreciated over their useful life. SARS Interpretation Note 47 sets the rates: computers (3 years / 33.3%), office furniture (6 years / 16.7%), vehicles (5 years / 20%), tools (5 years / 20%). The asset must be owned by you and used for producing income. Second-hand assets are depreciated at the same rate based on your purchase price.",
      },
      {
        heading: "Other Commonly Missed Deductions",
        content:
          "Professional body fees (Section 11(a)): SAICA, HPCSA, ECSA, Law Society, etc. Bad debts (Section 11(i)): debts owed to you that become uncollectible. Legal expenses (Section 11(c)): costs in connection with income-producing activities. Study costs: only deductible if directly connected to current employment and required by employer. Entertainment: generally not deductible in South Africa.",
      },
    ],
    keywords: [
      "what can I claim against tax South Africa",
      "SARS tax deductions list",
      "South Africa tax deductions 2025",
      "SARS allowable deductions",
      "income tax deductions South Africa",
      "claim deductions SARS",
    ],
    relatedSlugs: ["how-to-file-tax-return-sars-efiling", "home-office-deduction-sars-section-23b"],
  },
  {
    slug: "home-office-deduction-sars-section-23b",
    title: "Home Office Deduction — SARS Section 23(b) Explained",
    metaTitle: "Home Office Deduction South Africa — SARS Section 23(b) Full Guide 2025",
    metaDescription:
      "How to claim your home office deduction under SARS Section 23(b). Who qualifies, how to calculate, what expenses, and common mistakes that trigger audits.",
    excerpt:
      "Everything you need to know about the home office deduction — who qualifies, how to calculate the floor area ratio, and which expenses count.",
    category: "Deductions",
    publishDate: "2025-04-01",
    lastUpdated: "2025-04-01",
    readingTime: 7,
    sections: [
      {
        heading: "Who Can Claim the Home Office Deduction?",
        content:
          "Three categories of taxpayers qualify: (1) Self-employed individuals carrying on a trade from home. (2) Commission earners who earn more than 50% of their total remuneration in commission and are not reimbursed by their employer. (3) Salaried employees whose employment contract specifically requires them to work from home and whose employer does not provide an office. Category 3 is the strictest — SARS regularly rejects claims from employees who choose to work from home but have office space available.",
      },
      {
        heading: "The Exclusive-Use Requirement",
        content:
          "The room or area must be used 'regularly and exclusively' for work. A dining room table that doubles as a workspace does not qualify. A spare bedroom converted into a permanent office does qualify. The room does not need a separate entrance, but it must be clearly distinguishable as a workspace. SARS has the right to inspect your home to verify — though in practice this is rare.",
      },
      {
        heading: "Calculating the Floor Area Percentage",
        content:
          "Measure the floor area of your dedicated office and divide by the total floor area of your home (including garages, passages, and bathrooms). Example: 12m² office ÷ 120m² home = 10%. Apply this percentage to your total qualifying expenses. If you work from a room in a security complex, use only your unit's floor area — not common areas.",
      },
      {
        heading: "Which Expenses Qualify?",
        content:
          "Qualifying expenses include: rent (or bond interest — not capital repayments), property rates and taxes, home insurance, electricity and water, internet and phone costs, cleaning of the office area, repairs and maintenance to the office, and depreciation on office furniture and equipment. Note: bond repayments are NOT deductible — only the interest portion. Body corporate levies count as a qualifying expense for sectional title properties.",
      },
      {
        heading: "Records You Must Keep",
        content:
          "Keep a floor plan showing the dedicated office area with dimensions. Retain all invoices, municipal accounts, insurance policies, and internet bills. If you use internet partly for personal use, apply a reasonable business-use percentage (commonly 50-80%). SARS can request these records for up to 5 years after assessment — keep originals or certified copies.",
      },
      {
        heading: "Common Mistakes That Trigger SARS Audits",
        content:
          "Claiming for a shared space (e.g. family TV room). Over-estimating the floor area percentage. Salaried employees claiming without employment contract proof. Not apportioning shared expenses (internet, electricity). Claiming bond capital repayments instead of interest. Claiming when your employer provides adequate office space. If SARS disallows your claim, you'll owe the tax plus interest — and potentially a penalty if they consider it negligent.",
      },
    ],
    keywords: [
      "home office deduction SARS",
      "section 23(b) South Africa",
      "work from home tax deduction",
      "SARS home office claim",
      "home office percentage calculation",
      "home office expenses tax",
    ],
    relatedSlugs: ["what-can-i-claim-against-tax-south-africa", "how-to-file-tax-return-sars-efiling"],
  },

  // ═══════════════════════════════════════════════════════════════
  // Compliance & Audits
  // ═══════════════════════════════════════════════════════════════
  {
    slug: "sars-audit-what-to-expect",
    title: "SARS Audit — What to Expect and How to Prepare",
    metaTitle: "SARS Audit 2025 — What to Expect, How to Prepare, and Your Rights",
    metaDescription:
      "What happens during a SARS audit or verification? Know your rights, what documents to prepare, common triggers, and how to respond to SARS requests.",
    excerpt:
      "A factual guide to SARS audits and verifications — why they happen, what documents you need, your rights under the Tax Administration Act, and how to respond.",
    category: "Compliance",
    publishDate: "2025-05-01",
    lastUpdated: "2025-05-01",
    readingTime: 7,
    sections: [
      {
        heading: "Verification vs Full Audit",
        content:
          "A verification (Section 42 of the Tax Administration Act) is a targeted check on specific items in your return — for example, SARS may ask for proof of your home office claim or medical expenses. A full audit (Section 40) is a comprehensive review of your entire tax position. Most taxpayers will encounter verifications, not full audits. SARS selects returns using a risk-based system that flags anomalies: deductions that are unusually high relative to income, inconsistencies between years, or mismatches with third-party data.",
      },
      {
        heading: "Common Audit Triggers",
        content:
          "Large home office claims relative to income. Travel allowance claims without a logbook. Claiming deductions as a salaried (non-commission) employee. Income that doesn't match IRP5 or IT3 certificates. Large donations or unusual Section 18A claims. Freelance income not declared. Rental income omitted. Cryptocurrency gains not declared. Previous non-compliance or late filing.",
      },
      {
        heading: "What Documents to Prepare",
        content:
          "IRP5 / IT3(a) certificates from employers. IT3(b) interest certificates from banks. Medical aid tax certificates. Retirement fund contribution certificates. Home office — floor plan, municipal accounts, employment contract. Travel — logbook (digital or paper), vehicle costs receipts. Receipts for any deduction claimed. Bank statements showing expenses. Invoices for assets depreciated under Section 11(e).",
      },
      {
        heading: "Your Rights During an Audit",
        content:
          "You have the right to: be informed of the reason for the audit; be represented by a tax practitioner; receive reasonable time to gather documents (usually 21 business days for a verification); object to the outcome; request reasons for adverse decisions. SARS must follow proper procedures under the Tax Administration Act. If a SARS official behaves improperly, you can complain to the Tax Ombud.",
      },
      {
        heading: "Responding to SARS Requests",
        content:
          "Respond within the deadline (typically 21 business days). Upload documents via eFiling under 'SARS Correspondence'. Organise documents clearly — label each file with the relevant section/deduction. Don't submit more than what's asked for — relevant, concise responses reduce the chance of additional queries. If you need more time, contact SARS via eFiling or the call centre before the deadline to request an extension.",
      },
    ],
    keywords: [
      "SARS audit",
      "SARS verification",
      "SARS audit what to expect",
      "tax audit South Africa",
      "SARS audit documents",
      "how to respond SARS audit",
    ],
    relatedSlugs: ["what-documents-needed-tax-return", "sars-efiling-deadlines-2025"],
  },
  {
    slug: "what-documents-needed-tax-return",
    title: "What Documents Do You Need for Your Tax Return?",
    metaTitle: "Documents Needed for Tax Return South Africa 2025 — Complete Checklist",
    metaDescription:
      "Complete checklist of documents needed to file your South African tax return. IRP5, IT3(b), medical aid, retirement, home office, travel, and more.",
    excerpt:
      "A practical checklist of every document you might need when filing your ITR12 — organised by type of income and deduction.",
    category: "Tax Tips",
    publishDate: "2025-06-01",
    lastUpdated: "2025-06-01",
    readingTime: 5,
    sections: [
      {
        heading: "Income Documents",
        content:
          "IRP5 / IT3(a) — from each employer (salary, commission, directors' fees). IT3(b) — from banks and investment platforms (interest, dividends). IT3(c) — broker statements for capital gains tax. Rental income records — lease agreements, rental receipts, expense invoices. Freelance income — invoices issued, proof of payment received. Foreign income — payslips, tax certificates from foreign employers. If you have cryptocurrency transactions, records of acquisitions, disposals, and fair market values.",
      },
      {
        heading: "Medical Aid & Medical Expenses",
        content:
          "Medical aid tax certificate — your scheme sends this annually showing contributions and dependants. Out-of-pocket medical receipts — doctor visits, prescriptions, dental, optometry, physio. Gap cover statements. Medical device invoices (wheelchair, hearing aids). Disability-related expenses and ITR-DD form if applicable.",
      },
      {
        heading: "Retirement & Insurance",
        content:
          "Retirement annuity (RA) contribution certificate — from your RA provider (Allan Gray, Coronation, Sanlam, etc.). Pension & provident fund statements — usually reflected on IRP5 but verify. Income protection insurance — premiums may generate tax benefits on claims received.",
      },
      {
        heading: "Home Office",
        content:
          "Floor plan with measurements of dedicated office and total home. Municipal rates and taxes account. Bond statement showing interest (not capital). Electricity/water bills. Internet/fibre invoices. Home insurance policy. Employment contract or letter confirming work-from-home requirement (for salaried employees).",
      },
      {
        heading: "Travel & Vehicle",
        content:
          "Travel logbook — preferably digital (MileageTracker, TripLog). Vehicle finance agreement showing cost price. Fuel receipts. Service and maintenance invoices. Vehicle insurance policy. e-Toll and parking receipts. Opening and closing odometer readings for the tax year.",
      },
      {
        heading: "Other Deductions",
        content:
          "Section 18A donation receipts (with PBO reference number). Professional body membership fee invoices. Trade-related expenses — equipment, supplies, software subscriptions. Bad debt write-off records. Legal fees related to trade income. Study-related expenses (only if employer-required and directly related to current role).",
      },
    ],
    keywords: [
      "documents needed tax return South Africa",
      "tax return checklist SARS",
      "IRP5 tax certificate",
      "what to prepare for tax filing",
      "SARS tax documents list",
      "tax return documents 2025",
    ],
    relatedSlugs: ["how-to-file-tax-return-sars-efiling", "sars-audit-what-to-expect"],
  },

  // ═══════════════════════════════════════════════════════════════
  // Specific Topics (Trending Searches)
  // ═══════════════════════════════════════════════════════════════
  {
    slug: "provisional-tax-explained",
    title: "Provisional Tax in South Africa Explained Simply",
    metaTitle: "Provisional Tax South Africa 2025 — Who Pays, Deadlines & How to Calculate",
    metaDescription:
      "Simple explanation of provisional tax in South Africa. Who must register, how to calculate IRP6 payments, deadlines, and penalties for under-estimation.",
    excerpt:
      "If you earn freelance, rental, or investment income, you're likely a provisional taxpayer. Here's what that means and how to handle it.",
    category: "Tax Tips",
    publishDate: "2025-04-15",
    lastUpdated: "2025-04-15",
    readingTime: 6,
    sections: [
      {
        heading: "Who Is a Provisional Taxpayer?",
        content:
          "You must register if you earn any income not subject to PAYE (employees' tax). This includes: freelance or contract income (even R1), rental income from property, interest income exceeding R23,800 (under 65) or R34,500 (65+), directors' fees not on PAYE, and any trade income. Salaried employees whose ONLY income is salary and interest below the exemption are NOT provisional taxpayers. If you're unsure, register — there's no penalty for being registered and submitting IRP6s with zero income.",
      },
      {
        heading: "How to Calculate Your Provisional Tax Payment",
        content:
          "Estimate your total taxable income for the full year. Apply the income tax tables to get the total tax liability. Subtract any PAYE already deducted by employers. Subtract medical tax credits. Divide the remainder by 2 for each IRP6 payment. Tip: use the previous year's assessed income as a starting point, adjusted for any changes. SARS provides a worksheet on eFiling to help with the calculation.",
      },
      {
        heading: "Deadlines and Penalties",
        content:
          "First IRP6: 31 August (6 months into the tax year). Second IRP6: 28/29 February (end of tax year). Third voluntary top-up: 30 September (for the previous tax year). Underestimation penalty: 10% of the difference if your estimate is less than 80% of your actual taxable income (90% if income exceeds R1 million). Interest charged on late payments at the current prescribed rate (~11.5% per annum). It's always better to slightly overestimate — you'll get the excess back as a refund.",
      },
      {
        heading: "Tips for Managing Provisional Tax",
        content:
          "Set aside 25-35% of every freelance payment received for tax. Open a dedicated tax savings account. Upload your bank statements to TIT Tax monthly to track your taxable income in real-time. Review your estimate before each IRP6 deadline and adjust. If your income changes significantly mid-year, update your estimate on the second IRP6 — it's an opportunity to correct your first estimate.",
      },
    ],
    keywords: [
      "provisional tax South Africa",
      "IRP6 explained",
      "who is provisional taxpayer",
      "provisional tax calculation",
      "provisional tax deadline 2025",
      "freelancer provisional tax SA",
    ],
    relatedSlugs: ["sars-efiling-deadlines-2025", "freelancer-tax-guide-south-africa"],
  },
  {
    slug: "freelancer-tax-guide-south-africa",
    title: "Freelancer Tax Guide South Africa — What You Must Know",
    metaTitle: "Freelancer Tax Guide South Africa 2025 — Income, Deductions, Provisional Tax",
    metaDescription:
      "Complete tax guide for freelancers in South Africa. How to declare income, claim deductions, register as provisional taxpayer, and avoid SARS penalties.",
    excerpt:
      "Everything freelancers, contractors, and gig workers in South Africa need to know about tax — from registering with SARS to claiming deductions and filing returns.",
    category: "Tax Tips",
    publishDate: "2025-03-01",
    lastUpdated: "2025-03-01",
    readingTime: 9,
    sections: [
      {
        heading: "You're Running a Business (Even If It Doesn't Feel Like It)",
        content:
          "If you earn money outside of formal employment — consulting, freelancing on Upwork/Fiverr, content creation, tutoring, graphic design — SARS considers you to be carrying on a 'trade'. This means you must: register as a provisional taxpayer, submit IRP6 payments twice a year, file an ITR12 annually, and declare ALL income received. This applies even if you also have a full-time job and freelance on the side.",
      },
      {
        heading: "Registering with SARS as a Freelancer",
        content:
          "Visit your nearest SARS branch or use eFiling to update your taxpayer registration. You need to update your source of income to include 'trade income' or 'independent contractor income'. If you'll earn more than R1 million per year, you must also register for VAT. Below R1 million, VAT registration is voluntary. Consider registering voluntarily if your clients are VAT-registered businesses — you can then claim input VAT on expenses.",
      },
      {
        heading: "What Income to Declare",
        content:
          "Declare the TOTAL amount received from all clients — before expenses. If your clients issue IRP5s or IT3(a)s (source code 3616), verify these match your records. Keep a spreadsheet or use accounting software to track income monthly. Bank statements are your primary evidence — upload them to TIT Tax to track income and expenses automatically.",
      },
      {
        heading: "Top Deductions for Freelancers",
        content:
          "Home office (Section 23(b)): must be exclusive-use, dedicated space. Computer equipment (Section 11(e)): laptops, monitors — depreciated over 3 years. Software subscriptions (Section 11(a)): design tools, accounting software, hosting. Internet and phone (Section 11(a)): apportion between personal and business use. Retirement annuity (Section 11(k)): up to 27.5% of taxable income, max R350K. Accounting fees, bank charges, and business insurance. Bad debts written off (Section 11(i)) — clients who don't pay.",
      },
      {
        heading: "Invoicing and Record-Keeping",
        content:
          "Issue a proper tax invoice for every job (your name, address, tax reference number, description, amount, date). Keep copies of all invoices and proof of payment received. Retain receipts for all business expenses for at least 5 years. If VAT-registered, your invoices must include your VAT number, the VAT amount, and be labelled 'Tax Invoice'. Use cloud accounting tools (FreshBooks, Wave, Xero) for automated record-keeping.",
      },
      {
        heading: "Common Mistakes Freelancers Make",
        content:
          "Not registering as provisional taxpayer — SARS catches up eventually via bank data. Not setting aside money for tax — budget 25-35% of income. Claiming personal expenses as business (groceries, gym, personal streaming). Not keeping a logbook for vehicle use. Forgetting to declare small freelance jobs. Missing IRP6 deadlines (31 August and 28 February). Over-claiming home office without meeting the exclusive-use test.",
      },
    ],
    keywords: [
      "freelancer tax South Africa",
      "freelance tax guide",
      "independent contractor tax SA",
      "gig worker tax South Africa",
      "freelancer SARS registration",
      "freelancer deductions South Africa",
    ],
    relatedSlugs: ["provisional-tax-explained", "what-can-i-claim-against-tax-south-africa"],
  },
  {
    slug: "sars-tax-refund-how-long",
    title: "SARS Tax Refund — How Long Does It Take and How to Check?",
    metaTitle: "SARS Tax Refund 2025 — How Long, How to Check, and Why It's Delayed",
    metaDescription:
      "How long does a SARS tax refund take? Check your refund status, understand common delays (verification, outstanding returns), and know what to do if it's held up.",
    excerpt:
      "Submitted your return and waiting for a refund? Here's how long it actually takes, how to check the status, and what to do if it's delayed.",
    category: "SARS eFiling",
    publishDate: "2025-07-15",
    lastUpdated: "2025-07-15",
    readingTime: 5,
    sections: [
      {
        heading: "Standard Refund Timelines",
        content:
          "If your return is assessed without issues: within 72 hours of submission, SARS issues the ITA34 assessment. Refunds for eFiling submissions typically reflect in your bank account within 7-21 business days. If you filed at a branch, it may take longer. SARS pays refunds directly into the bank account registered on your eFiling profile — make sure your banking details are up to date.",
      },
      {
        heading: "How to Check Your Refund Status",
        content:
          "Log in to SARS eFiling → go to 'Returns' → 'Tax Returns History' → select the relevant year → view your 'Statement of Account'. The assessment (ITA34) shows whether you owe SARS or are due a refund. If the refund is showing but hasn't been paid, check 'Payment' → 'Payment History' for the payout status. You can also call the SARS Contact Centre on 0800 00 7277 (Mon-Fri 8am-5pm).",
      },
      {
        heading: "Common Reasons for Delays",
        content:
          "Verification/audit selection — your return is flagged for review. Outstanding returns — SARS won't pay refunds if you have unfiled returns for previous years. Incorrect banking details — update on eFiling immediately. Debt set-off — if you owe SARS for other tax types (VAT, PAYE), the refund is reduced. Employer hasn't submitted your IRP5 — SARS can't verify income data. Provisional tax account in arrears — outstanding IRP6 payments are deducted.",
      },
      {
        heading: "What to Do If Your Refund Is Stuck",
        content:
          "Check for SARS correspondence on eFiling — there may be a verification request you missed. File any outstanding returns for previous years. Verify your banking details match eFiling records exactly. If selected for verification, submit requested documents within 21 business days. If nothing works, visit a SARS branch with your ID and proof of banking details, or escalate to the Tax Ombud if SARS isn't responding within 90 days.",
      },
    ],
    keywords: [
      "SARS tax refund how long",
      "SARS refund delayed",
      "check SARS refund status",
      "when will SARS pay my refund",
      "SARS refund processing time",
      "tax refund South Africa 2025",
    ],
    relatedSlugs: ["how-to-file-tax-return-sars-efiling", "sars-efiling-deadlines-2025"],
  },
  {
    slug: "do-i-need-to-file-tax-return-south-africa",
    title: "Do I Need to File a Tax Return in South Africa?",
    metaTitle: "Do I Need to File a Tax Return in South Africa? — 2025 Thresholds",
    metaDescription:
      "Find out if you need to file a tax return with SARS. Income thresholds, exemptions, when auto-assessments apply, and consequences of not filing.",
    excerpt:
      "Not everyone in South Africa needs to file a tax return. Here's how to find out based on your income, employment type, and SARS requirements.",
    category: "SARS eFiling",
    publishDate: "2025-06-01",
    lastUpdated: "2025-06-01",
    readingTime: 5,
    sections: [
      {
        heading: "Who Does NOT Need to File?",
        content:
          "You may not need to file if ALL these apply: your total employment income for the year is below R500,000. You have one employer for the full year. You have no additional income (freelance, rental, capital gains). You don't want to claim any deductions (home office, travel, medical expenses). Your investment income (interest) is below R23,800 (under 65) or R34,500 (over 65). In this case, SARS may issue an auto-assessment — check eFiling from 1 July.",
      },
      {
        heading: "Who MUST File?",
        content:
          "You must file if: you earned more than R500,000 from employment. You had more than one employer during the year. You earned any freelance, rental, or trade income. You want to claim deductions not on your IRP5. You received income from outside South Africa. You have capital gains to declare. You are registered as a provisional taxpayer. You received a SARS notification to file. If in doubt, file — there's no penalty for filing when not required, but there IS a penalty for not filing when required.",
      },
      {
        heading: "Auto-Assessments — Accepting or Editing",
        content:
          "From 1 July, SARS issues auto-assessments for simple tax affairs based on employer IRP5 data. Log in to eFiling to check yours. If correct and you don't have additional income or deductions, you can accept it (or it auto-accepts on 21 October). If you disagree — for example, you want to claim home office, travel, or medical deductions — you must 'Edit' the return and file manually before the deadline.",
      },
      {
        heading: "Consequences of Not Filing",
        content:
          "Administrative penalty: R250/month per return outstanding (can accumulate over 35 months = R8,750). SARS can issue an estimated/reduced assessment in your absence — typically overestimating your income and underestimating deductions. You cannot get a tax clearance certificate (needed for tenders, emigration, some contracts). Outstanding returns prevent refund payments. Persistent non-filing may result in criminal prosecution under the Tax Administration Act.",
      },
    ],
    keywords: [
      "do I need to file tax return South Africa",
      "SARS filing threshold 2025",
      "who must file tax return",
      "SARS auto assessment",
      "R500000 tax threshold",
      "penalty not filing tax return SARS",
    ],
    relatedSlugs: ["sars-efiling-deadlines-2025", "how-to-file-tax-return-sars-efiling"],
  },
  {
    slug: "sars-tax-brackets-2025",
    title: "SARS Tax Brackets and Rates 2025 — Income Tax Tables",
    metaTitle: "SARS Tax Brackets 2025 — South Africa Income Tax Tables & Rebates",
    metaDescription:
      "Current SARS income tax brackets, rates, and rebates for the 2024/2025 tax year. Tax-free thresholds, marginal rates from 18% to 45%, and age rebates.",
    excerpt:
      "The complete SARS income tax tables for 2024/2025 — brackets, marginal rates, primary/secondary/tertiary rebates, and tax-free thresholds by age.",
    category: "Tax Tips",
    publishDate: "2025-03-01",
    lastUpdated: "2025-03-01",
    readingTime: 4,
    sections: [
      {
        heading: "2024/2025 Tax Brackets (1 March 2024 – 28 February 2025)",
        content:
          "R1 – R237,100: 18% of taxable income. R237,101 – R370,500: R42,678 + 26% of amount above R237,100. R370,501 – R512,800: R77,362 + 31% of amount above R370,500. R512,801 – R673,000: R121,475 + 36% of amount above R512,800. R673,001 – R857,900: R179,147 + 39% of amount above R673,000. R857,901 – R1,817,000: R251,258 + 41% of amount above R857,900. R1,817,001 and above: R644,489 + 45% of amount above R1,817,000.",
      },
      {
        heading: "Rebates (Tax Credits)",
        content:
          "Primary rebate (all taxpayers): R17,235. Secondary rebate (65 and older): R9,444. Tertiary rebate (75 and older): R3,145. These reduce your tax payable (not taxable income). The effective tax-free threshold for under-65s is R95,750 (i.e., if you earn less than this, you owe zero tax after the primary rebate).",
      },
      {
        heading: "Tax-Free Thresholds by Age",
        content:
          "Under 65: R95,750 per year. 65 to 74: R148,217 per year. 75 and older: R165,689 per year. These are the income levels below which you owe zero income tax. If your total taxable income is below these thresholds, you don't need to file (subject to other conditions).",
      },
      {
        heading: "Interest and Dividends Exemptions",
        content:
          "Local interest exemption: R23,800 per year (under 65) or R34,500 (65+). South African dividends from listed shares are subject to 20% dividends tax withheld at source — not included in taxable income. Foreign dividends are taxable but exempt up to R3,700 if the total foreign dividends are below this amount.",
      },
    ],
    keywords: [
      "SARS tax brackets 2025",
      "South Africa income tax rates",
      "tax tables South Africa 2024/2025",
      "SARS tax rebates",
      "income tax calculator South Africa",
      "how much tax do I pay South Africa",
    ],
    relatedSlugs: ["what-can-i-claim-against-tax-south-africa", "do-i-need-to-file-tax-return-south-africa"],
  },
  {
    slug: "crypto-tax-south-africa",
    title: "Cryptocurrency Tax in South Africa — SARS Rules Explained",
    metaTitle: "Crypto Tax South Africa 2025 — SARS Rules, CGT, and How to Declare",
    metaDescription:
      "How cryptocurrency is taxed in South Africa. SARS rules on Bitcoin, Ethereum, and crypto trading. Capital gains vs income tax, how to declare, and record-keeping.",
    excerpt:
      "SARS treats cryptocurrency as an asset — meaning gains are taxable. Here's how crypto is taxed, what records to keep, and how to declare on your ITR12.",
    category: "Compliance",
    publishDate: "2025-05-15",
    lastUpdated: "2025-05-15",
    readingTime: 6,
    sections: [
      {
        heading: "How SARS Classifies Cryptocurrency",
        content:
          "SARS does not classify cryptocurrency as currency — it's treated as an intangible asset. This means disposals (selling, swapping, spending) are subject to either income tax or capital gains tax depending on your intent. If you trade frequently (buying and selling for profit), SARS considers this trading stock — gains are taxed as ordinary income at your marginal rate. If you hold long-term (HODLing), disposals are taxed as capital gains.",
      },
      {
        heading: "Capital Gains Tax (CGT) on Crypto",
        content:
          "Individuals receive an annual R40,000 CGT exclusion. Only 40% of the net capital gain above R40,000 is included in taxable income. So for an individual in the 45% bracket: effective CGT rate = 40% × 45% = 18%. Calculate gain as: proceeds minus base cost (what you paid, including exchange fees). FIFO (first in, first out) or specific identification methods are accepted.",
      },
      {
        heading: "Income Tax on Crypto Trading",
        content:
          "If SARS deems you a 'trader' (frequent buying/selling, short holding periods, intention to profit), your gains are taxed as ordinary income at marginal rates (18%-45%). There is no CGT exclusion for trading income. Losses can be deducted against other income. The distinction between investor and trader is based on your intention, frequency, and pattern — not a bright-line test. Keep a record of your trading strategy.",
      },
      {
        heading: "Declaring Crypto on Your ITR12",
        content:
          "If capital gains: complete the Capital Gains section of the ITR12. If trading income: include under 'Other income' or 'Trade income'. SARS can access data from South African exchanges (Luno, VALR) and uses cross-border information-sharing agreements. Failure to declare is tax evasion — a criminal offence. Some exchanges provide annual tax summaries — use these as your starting point.",
      },
      {
        heading: "Record-Keeping Requirements",
        content:
          "Keep records of every acquisition: date, amount, exchange rate (ZAR), fees, and the source of funds. Keep records of every disposal: date, amount received, exchange rate, fees. If you swapped one crypto for another, this is a disposal and an acquisition — both must be recorded. If you received crypto as payment for services (mining, staking, airdrops), the fair market value at receipt is taxable income. Keep records for at least 5 years.",
      },
    ],
    keywords: [
      "crypto tax South Africa",
      "SARS cryptocurrency",
      "Bitcoin tax South Africa",
      "crypto capital gains tax SA",
      "how to declare crypto SARS",
      "Luno SARS tax",
    ],
    relatedSlugs: ["what-can-i-claim-against-tax-south-africa", "sars-efiling-deadlines-2025"],
  },
  {
    slug: "travel-allowance-logbook-sars",
    title: "Travel Allowance & Logbook — SARS Claim Guide",
    metaTitle: "Travel Allowance Logbook SARS 2025 — How to Claim & Calculate",
    metaDescription:
      "How to claim your SARS travel allowance using a logbook. Actual cost vs deemed cost method, vehicle depreciation limits, and examples.",
    excerpt:
      "If you receive a travel allowance or use your own vehicle for work, a logbook could save you thousands in tax. Here's exactly how to do it.",
    category: "Deductions",
    publishDate: "2025-04-15",
    lastUpdated: "2025-04-15",
    readingTime: 6,
    sections: [
      {
        heading: "Who Can Claim a Travel Deduction?",
        content:
          "You can claim if you: receive a travel allowance from your employer (code 3702 on IRP5), OR use your own vehicle for business travel and earn commission or trade income. Salaried employees who receive a company car/fuel card generally cannot claim — the employer claims the deduction. You cannot claim for travel between home and a fixed place of work (commuting). You CAN claim for travel between multiple work sites, client visits, and business errands.",
      },
      {
        heading: "Actual Cost Method (With Logbook)",
        content:
          "Record every business trip: date, start/end odometer reading, destination, purpose, km driven. At year-end: calculate total business km ÷ total km = business-use %. Claim that % of: fuel, oil, maintenance, tyres, insurance, licence fees, finance charges, and depreciation (limited to vehicle cost of R245,056 for 2024/25, straight-line over 5 years). Example: 20,000 business km ÷ 30,000 total km = 67%. If total vehicle costs = R120,000, deduction = R80,000.",
      },
      {
        heading: "Deemed Cost Method (No Logbook)",
        content:
          "If you don't keep a logbook, SARS applies a simplified formula based on the value of your vehicle and current cost tables. SARS publishes these annually in the Government Gazette (Table 2 of Schedule 7). The deemed method typically produces a much smaller deduction than the actual cost method. It's most appropriate for low-mileage business use or if you couldn't maintain a logbook.",
      },
      {
        heading: "Tips for an Audit-Proof Logbook",
        content:
          "Use a digital logbook app (TripLog, MileageTracker) — SARS accepts digital records. Record trips in real-time, not retrospectively. Include the purpose of each trip (e.g., 'Client meeting — ABC Corp, Sandton'). Record opening and closing odometer readings for 1 March and 28/29 February. Keep fuel and maintenance receipts separately — these support your actual cost claim. If SARS audits your travel claim, the logbook is your primary evidence.",
      },
    ],
    keywords: [
      "SARS travel allowance",
      "travel logbook SARS",
      "how to claim travel allowance",
      "actual cost method SARS",
      "vehicle deduction South Africa",
      "SARS travel claim 2025",
    ],
    relatedSlugs: ["what-can-i-claim-against-tax-south-africa", "what-documents-needed-tax-return"],
  },
];

export function getBlogArticleBySlug(slug: string): BlogArticle | undefined {
  return blogArticles.find((a) => a.slug === slug);
}

export function getBlogArticlesByCategory(category: BlogArticle["category"]): BlogArticle[] {
  return blogArticles.filter((a) => a.category === category);
}
