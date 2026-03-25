import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tax Profile",
  description:
    "Set up your tax profile — select your tax year, occupation, and income sources so the AI can tailor deductions to your specific situation.",
};

export default function TaxProfileLayout({ children }: { children: React.ReactNode }) {
  return children;
}
