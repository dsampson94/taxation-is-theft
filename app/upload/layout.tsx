import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Upload Bank Statements",
  description:
    "Upload your bank statement PDFs from FNB, Standard Bank, Nedbank, Absa, Capitec, or Investec. Our AI will analyze your transactions and find tax deductions.",
};

export default function UploadLayout({ children }: { children: React.ReactNode }) {
  return children;
}
