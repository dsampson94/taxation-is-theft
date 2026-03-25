import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Log In",
  description:
    "Log in to your TIT Tax account to access your tax dashboard, upload bank statements, and manage your South African tax deductions.",
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
