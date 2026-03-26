import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | TIT Tax",
  description:
    "Privacy Policy for TIT Tax — how we collect, use, and protect your personal information under POPIA.",
};

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">Privacy Policy</h1>
        <p className="text-sm text-slate-500 mb-10">
          Last updated: 26 March 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              1. Introduction
            </h2>
            <p>
              TIT Tax (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;) is committed to protecting your
              personal information in compliance with the Protection of Personal
              Information Act 4 of 2013 (POPIA) and other applicable South
              African legislation. This Privacy Policy explains what information
              we collect, how we use it, and your rights.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              2. Information We Collect
            </h2>
            <h3 className="font-medium text-slate-200 mb-1">
              2.1 Account Information
            </h3>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Name and surname</li>
              <li>Email address</li>
              <li>Password (stored securely using bcrypt hashing)</li>
            </ul>

            <h3 className="font-medium text-slate-200 mb-1">
              2.2 Tax Profile Information
            </h3>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>Occupation and employment type</li>
              <li>
                Tax identification number and ID number (encrypted at rest using
                AES-256)
              </li>
              <li>Medical aid details and dependants</li>
              <li>Retirement annuity contributions</li>
            </ul>

            <h3 className="font-medium text-slate-200 mb-1">
              2.3 Bank Statement Data
            </h3>
            <ul className="list-disc pl-5 space-y-1 mb-3">
              <li>
                Transaction text extracted from uploaded bank statements (CSV or
                PDF)
              </li>
              <li>
                <strong className="text-white">
                  We do not store the original uploaded files.
                </strong>{" "}
                Text is extracted in memory for AI analysis and the raw file is
                discarded immediately.
              </li>
            </ul>

            <h3 className="font-medium text-slate-200 mb-1">
              2.4 Payment Information
            </h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Payments are processed by{" "}
                <a
                  href="https://www.payfast.co.za"
                  className="text-brand-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  PayFast
                </a>
                , a PCI DSS Level 1 compliant payment processor.
              </li>
              <li>
                We do not receive, process, or store your credit card number,
                CVV, or banking credentials.
              </li>
              <li>
                We store only: PayFast payment ID, plan selected, amount,
                status, and timestamp.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              3. How We Use Your Information
            </h2>
            <p>We use your personal information to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>Provide and improve the tax analysis service.</li>
              <li>
                Process transactions via AI (OpenAI) to categorise and identify
                potential deductions.
              </li>
              <li>Manage your account and credit balance.</li>
              <li>Process payments through PayFast.</li>
              <li>
                Communicate with you regarding your account or the Service.
              </li>
              <li>Comply with legal and regulatory obligations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              4. AI Processing &amp; Third Parties
            </h2>
            <p>
              Bank statement transaction text is sent to{" "}
              <a
                href="https://openai.com"
                className="text-brand-400 hover:underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                OpenAI
              </a>{" "}
              via their API for AI-powered analysis. OpenAI&apos;s API data usage
              policy states that data submitted via the API is not used to train
              their models. No identifying information such as your name, ID
              number, or account number is included in the data sent to OpenAI —
              only transaction descriptions, dates, and amounts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              5. Data Storage &amp; Security
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Your data is stored in a secure PostgreSQL database hosted by
                Neon, with encrypted connections (TLS).
              </li>
              <li>
                Sensitive fields (ID number, tax number) are encrypted at rest
                using AES-256-GCM.
              </li>
              <li>Passwords are hashed using bcrypt and never stored in plain text.</li>
              <li>
                Authentication uses HTTP-only, secure, SameSite cookies (JWT).
              </li>
              <li>
                The application is served over HTTPS via Vercel&apos;s edge
                network.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              6. Cookies
            </h2>
            <p>
              We use a single essential authentication cookie
              (&quot;token&quot;) to keep you logged in. This is an HTTP-only
              secure cookie and cannot be accessed by JavaScript. We do not use
              tracking cookies, advertising cookies, or third-party analytics
              at this time.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              7. Data Retention
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                Account data is retained for as long as your account is active.
              </li>
              <li>
                Transaction analysis results are retained to allow you to
                generate reports across tax years.
              </li>
              <li>
                You may request deletion of your account and all associated data
                at any time (see section 8).
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              8. Your Rights Under POPIA
            </h2>
            <p>As a data subject under POPIA, you have the right to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>
                <strong className="text-slate-200">Access</strong> — request
                a copy of the personal information we hold about you.
              </li>
              <li>
                <strong className="text-slate-200">Correction</strong> —
                request correction of inaccurate personal information.
              </li>
              <li>
                <strong className="text-slate-200">Deletion</strong> — request
                deletion of your personal information where there is no lawful
                reason for us to continue processing it.
              </li>
              <li>
                <strong className="text-slate-200">Objection</strong> — object
                to the processing of your personal information.
              </li>
              <li>
                <strong className="text-slate-200">Complaint</strong> — lodge a
                complaint with the Information Regulator (South Africa) at{" "}
                <a
                  href="https://inforegulator.org.za"
                  className="text-brand-400 hover:underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  inforegulator.org.za
                </a>
                .
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              9. Children&apos;s Privacy
            </h2>
            <p>
              The Service is not intended for use by anyone under the age of 18.
              We do not knowingly collect personal information from children.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              10. Changes to This Policy
            </h2>
            <p>
              We may update this Privacy Policy from time to time. Updates will
              be posted on this page with a revised &quot;Last updated&quot; date.
              Continued use of the Service constitutes acceptance of the updated
              policy.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              11. Contact Us
            </h2>
            <p>
              For privacy-related enquiries or to exercise your rights under
              POPIA, contact us at{" "}
              <a
                href="mailto:support@taxationistheft.co.za"
                className="text-brand-400 hover:underline"
              >
                support@taxationistheft.co.za
              </a>
              .
            </p>
          </section>

          <section className="pt-4 border-t border-slate-800">
            <p className="text-xs text-slate-500">
              See also our{" "}
              <Link
                href="/terms"
                className="text-brand-400 hover:underline"
              >
                Terms &amp; Conditions
              </Link>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
