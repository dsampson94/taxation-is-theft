import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Review & Deep Analysis",
  description:
    "Review your tax analysis, save checkpoints, and use AI to deep-dive into deductions with SARS-ready supporting documents.",
};

export default function CheckpointsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
