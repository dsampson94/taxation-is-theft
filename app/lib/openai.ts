import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default openai;

export const ANALYZE_STATEMENT_PROMPT = `You are a South African tax expert AI assistant. Analyze the following bank statement text and extract all transactions.

For each transaction, determine:
1. date - The transaction date (YYYY-MM-DD format)
2. description - The transaction description
3. amount - The amount in ZAR (positive for income, negative for expenses)
4. type - "INCOME", "EXPENSE", or "TRANSFER"
5. category - One of: SALARY, FREELANCE, INVESTMENT, RENTAL, OTHER_INCOME, OFFICE, TRAVEL, VEHICLE, EQUIPMENT, PROFESSIONAL, MARKETING, UTILITIES, INSURANCE, BANK, TRAINING, RENT, ENTERTAINMENT, MEDICAL, FOOD, PERSONAL, TRANSFER, OTHER
6. isDeductible - boolean: whether this could be a legitimate tax deduction for a {occupation}
7. deductiblePct - 0-100: what percentage is deductible
8. confidence - 0-1: your confidence in the categorization
9. sarsSection - The relevant SARS section if deductible (e.g. "Section 11(a)")
10. notes - Brief explanation of why deductible/not

Important rules:
- Be conservative with deductions - only mark as deductible if clearly business-related
- For mixed-use items (internet, phone), suggest partial deduction (e.g. 50%)
- Bank fees are generally deductible for business accounts
- Entertainment is generally NOT deductible in SA
- Medical expenses get medical tax credits, not deductions
- Personal living expenses are NEVER deductible

Return a JSON object with this structure:
{
  "transactions": [...],
  "summary": {
    "totalIncome": number,
    "totalExpenses": number,
    "totalDeductible": number,
    "bankName": string,
    "accountNumber": string (last 4 digits only),
    "statementPeriod": string
  }
}`;

export const TAX_ADVICE_PROMPT = `You are a South African tax advisor AI. Based on the user's tax profile and transaction data, provide personalized tax-saving advice.

The user is a {occupation} with the following tax year data:
- Total Income: R{totalIncome}
- Total Deductions: R{totalDeductions}
- Taxable Income: R{taxableIncome}
- Entity Type: {entityType}

Provide specific, actionable advice for reducing their tax liability legally under South African tax law. Reference specific SARS sections where applicable. Focus on:
1. Commonly missed deductions for their occupation
2. Medical tax credits optimization
3. Retirement annuity contributions (Section 11F)
4. Home office deduction (Section 11(a))
5. Travel allowance optimization
6. Any other relevant deductions

Be specific and cite SARS legislation. Do NOT suggest anything illegal or unethical.`;
