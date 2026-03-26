import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms & Conditions | TIT Tax",
  description:
    "Terms and Conditions for using TIT Tax, an AI-powered tax analysis service for South Africa.",
};

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-300">
      <div className="max-w-3xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-white mb-2">
          Terms &amp; Conditions
        </h1>
        <p className="text-sm text-slate-500 mb-10">
          Last updated: 26 March 2026
        </p>

        <div className="space-y-8 text-sm leading-relaxed">
          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              1. Introduction
            </h2>
            <p>
              These Terms &amp; Conditions (&quot;Terms&quot;) govern your use of the TIT Tax
              website and service located at{" "}
              <Link href="/" className="text-brand-400 hover:underline">
                taxationistheft.co.za
              </Link>{" "}
              (&quot;Service&quot;), operated by TIT Tax (&quot;we&quot;, &quot;us&quot;, &quot;our&quot;). By
              accessing or using the Service, you agree to be bound by these
              Terms. If you do not agree, please do not use the Service.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              2. Service Description
            </h2>
            <p>
              TIT Tax is an AI-powered tool that analyses South African bank
              statements to identify potential tax deductions and categorise
              transactions. Users upload bank statements in CSV or PDF format,
              and our system uses artificial intelligence to process and
              categorise the transactions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              3. Not Professional Tax Advice
            </h2>
            <p>
              <strong className="text-white">
                TIT Tax is not a registered tax practitioner, tax advisor, or
                financial advisor.
              </strong>{" "}
              The analysis provided by our Service is for informational and
              guidance purposes only and does not constitute professional tax
              advice. You should consult a SARS-registered tax practitioner for
              complex matters, filing disputes, or binding tax opinions. We do
              not guarantee the accuracy or completeness of AI-generated
              categorisations or deduction suggestions.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              4. User Accounts
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                You must provide accurate information when registering for an
                account.
              </li>
              <li>
                You are responsible for maintaining the confidentiality of your
                login credentials.
              </li>
              <li>
                You must be at least 18 years old to use this Service.
              </li>
              <li>
                We reserve the right to suspend or terminate accounts that
                violate these Terms.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              5. Credits &amp; Payments
            </h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                The Service operates on a credit-based system. Each credit
                allows you to analyse one bank statement.
              </li>
              <li>
                Credits are purchased via PayFast, a PCI DSS Level 1 compliant
                South African payment gateway. We do not store your card details.
              </li>
              <li>
                All prices are listed in South African Rand (ZAR) and include
                VAT where applicable.
              </li>
              <li>
                Credits are non-transferable and are linked to your account.
              </li>
              <li>
                Purchased credits do not expire.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              6. Delivery Policy
            </h2>
            <p>
              TIT Tax is a digital service. Upon successful payment, credits
              are delivered immediately and automatically to your account. You
              may use your credits at any time to analyse bank statements.
              There are no physical goods or shipping involved. If credits are
              not reflected in your account within 10 minutes of a successful
              payment, please contact us at{" "}
              <a
                href="mailto:support@taxationistheft.co.za"
                className="text-brand-400 hover:underline"
              >
                support@taxationistheft.co.za
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              7. Refund Policy
            </h2>
            <p>
              Because the Service involves immediate delivery of a digital
              analysis, refunds are generally not provided once an analysis
              credit has been consumed. However, if the Service fails to produce
              a result due to a technical error on our side, we will re-credit
              your account. For billing disputes, contact us at{" "}
              <a
                href="mailto:support@taxationistheft.co.za"
                className="text-brand-400 hover:underline"
              >
                support@taxationistheft.co.za
              </a>
              .
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              8. Acceptable Use
            </h2>
            <p>You agree not to:</p>
            <ul className="list-disc pl-5 space-y-1 mt-1">
              <li>
                Upload fraudulent, fabricated, or third-party bank statements
                without authorisation.
              </li>
              <li>
                Attempt to reverse-engineer, scrape, or abuse the Service or its
                API.
              </li>
              <li>
                Use the Service to facilitate tax evasion or any unlawful
                activity.
              </li>
              <li>
                Exceed reasonable usage patterns or attempt to circumvent
                credit limits.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              9. Intellectual Property
            </h2>
            <p>
              All content, branding, and technology on the Service are owned by
              TIT Tax or its licensors. You retain ownership of the bank
              statement data you upload. By uploading, you grant us a limited
              licence to process the data solely for the purpose of providing
              the analysis.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              10. Limitation of Liability
            </h2>
            <p>
              To the maximum extent permitted by South African law, TIT Tax
              shall not be liable for any indirect, incidental, special,
              consequential, or punitive damages, including but not limited to
              loss of profits, tax penalties, interest, or additional
              assessments arising from reliance on the Service&apos;s output.
              Our total liability shall not exceed the amount you paid for the
              specific credits giving rise to the claim.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              11. Data Processing
            </h2>
            <p>
              Your use of the Service is also governed by our{" "}
              <Link href="/privacy" className="text-brand-400 hover:underline">
                Privacy Policy
              </Link>
              . By using the Service, you consent to the processing of your data
              as described therein.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              12. Modifications
            </h2>
            <p>
              We may update these Terms from time to time. Continued use of the
              Service after changes constitutes acceptance of the revised Terms.
              Material changes will be communicated via the website or email.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              13. Governing Law
            </h2>
            <p>
              These Terms are governed by the laws of the Republic of South
              Africa. Disputes shall be subject to the jurisdiction of the South
              African courts.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              14. Consumer Protection
            </h2>
            <p>
              Nothing in these Terms excludes or limits any rights you may have
              under the Consumer Protection Act 68 of 2008 or the Electronic
              Communications and Transactions Act 25 of 2002.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-white mb-2">
              15. Contact
            </h2>
            <p>
              For any questions about these Terms, contact us at{" "}
              <a
                href="mailto:support@taxationistheft.co.za"
                className="text-brand-400 hover:underline"
              >
                support@taxationistheft.co.za
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
