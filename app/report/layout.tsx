import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tax Report",
  description:
    "View your detailed SARS-compliant tax report with income summary, identified deductions, and estimated tax savings for your South African tax return.",
};

export default function ReportLayout({ children }: { children: React.ReactNode }) {
  return children;
}
