import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Create Account",
  description:
    "Sign up for TIT Tax — the AI-powered tax assistant for South Africans. Get your first bank statement analysis free. No credit card required.",
};

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return children;
}
