import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search Statements",
  description:
    "Search through all your parsed bank statement transactions. Find specific payments, vendors, or expense categories across all your tax years.",
};

export default function SearchLayout({ children }: { children: React.ReactNode }) {
  return children;
}
