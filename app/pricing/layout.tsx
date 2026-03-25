import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Simple, affordable pricing for AI-powered tax analysis. Get your first analysis free. Pay only when you're ready for your full tax report.",
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
