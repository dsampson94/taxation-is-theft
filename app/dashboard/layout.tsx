import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "View your tax analysis dashboard — see your income summary, deductions found, and estimated tax savings at a glance.",
};

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return children;
}
