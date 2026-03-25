import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Transactions",
  description:
    "Review your parsed bank transactions. See AI-categorized income, expenses, and flagged tax-deductible items from your South African bank statements.",
};

export default function TransactionsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
