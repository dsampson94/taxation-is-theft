import type { Metadata } from "next";
import Link from "next/link";
import { Upload, Brain, FileText, CheckCircle, Briefcase } from "lucide-react";
import { professions, getProfessionBySlug } from "@/app/lib/professions";
import { notFound } from "next/navigation";
import SeoFooter from "@/app/components/SeoFooter";

export function generateStaticParams() {
  return professions.map((p) => ({ profession: p.slug }));
}

interface Props {
  params: { profession: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const prof = getProfessionBySlug(params.profession);
  if (!prof) return {};

  const title = `Tax Deductions for ${prof.name}s in South Africa`;
  const description = `Common SARS-allowable tax deductions for ${prof.description} in South Africa. Includes eFiling occupation codes (OFO), IRP5 source codes, Section 11 expenses, and profession-specific deductions with legislative references.`;
  const url = `https://taxationistheft.co.za/tax-deductions/${prof.slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: "website",
      locale: "en_ZA",
      siteName: "TIT Tax",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
    },
    keywords: [
      `tax deductions ${prof.name}`,
      `${prof.name} tax South Africa`,
      `SARS deductions ${prof.name}`,
      `${prof.name} tax return`,
      `tax refund ${prof.name} South Africa`,
      `${prof.name} eFiling occupation code`,
      `${prof.name} IRP5 source code`,
      ...prof.searchTerms.map((t) => `tax deductions ${t}`),
      ...prof.searchTerms.map((t) => `${t} tax South Africa`),
    ],
  };
}

export default function ProfessionPage({ params }: Props) {
  const prof = getProfessionBySlug(params.profession);
  if (!prof) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `TIT Tax — Tax Deductions for ${prof.name}s`,
    description: `AI-powered tax deduction finder for ${prof.description} in South Africa. Identifies profession-specific SARS deductions automatically.`,
    provider: {
      "@type": "Organization",
      name: "TIT Tax",
      url: "https://taxationistheft.co.za",
    },
    serviceType: "Tax Preparation and Advisory",
    audience: {
      "@type": "Audience",
      audienceType: prof.name,
    },
    areaServed: {
      "@type": "Country",
      name: "South Africa",
    },
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ZAR",
      description: "First analysis free",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://taxationistheft.co.za" },
      { "@type": "ListItem", position: 2, name: "Tax Deductions", item: "https://taxationistheft.co.za/tax-deductions" },
      { "@type": "ListItem", position: 3, name: `${prof.name} Tax`, item: `https://taxationistheft.co.za/tax-deductions/${prof.slug}` },
    ],
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <Briefcase size={16} />
              {prof.category}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              Tax Deductions for<br />
              <span className="text-brand-200">{prof.name}s</span>
            </h1>
            <p className="text-lg sm:text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
              A reference guide to SARS-allowable deductions commonly claimed by{" "}
              {prof.description} in South Africa, with legislative references and practical guidance.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
              >
                Try a Free Analysis
              </Link>
              <Link
                href="/#how-it-works"
                className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-white hover:bg-white/10 transition-colors"
              >
                See How It Works
              </Link>
            </div>
            <p className="mt-4 text-sm text-brand-200">
              1 free trial analysis &bull; No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Common Deductions */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-8">
              Common Tax Deductions for {prof.name}s in South Africa
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              The following deductions are commonly available to {prof.description} under the
              South African Income Tax Act. Eligibility depends on your specific circumstances,
              employment type, and whether expenses were incurred in the production of income.
            </p>
            <div className="space-y-4">
              {prof.commonDeductions.map((deduction, i) => (
                <div key={i} className="flex items-start gap-3 p-4 rounded-lg bg-slate-50 dark:bg-slate-800">
                  <CheckCircle className="text-green-500 mt-0.5 shrink-0" size={20} />
                  <div className="flex-1">
                    <span className="text-slate-700 dark:text-slate-200">{deduction.item}</span>
                    <span className="ml-2 inline-flex items-center rounded bg-brand-100 dark:bg-brand-900/40 px-2 py-0.5 text-xs font-medium text-brand-700 dark:text-brand-300">
                      {deduction.sarsRef}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-8 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Important:</strong> This is general guidance based on the Income Tax Act and SARS
                Interpretation Notes. It is not professional tax advice. Deductibility depends on your
                individual circumstances. Consult a registered tax practitioner for complex situations.
                All SARS section references are based on current legislation and may be subject to change.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SARS eFiling Codes */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-4">
              SARS eFiling Codes for {prof.name}s
            </h2>
            <p className="text-slate-600 dark:text-slate-300 mb-8">
              When filing your ITR12 on SARS eFiling, you&apos;ll need to select an occupation code and
              your IRP5/IT3(a) will contain source codes for different income types. Here are the codes
              relevant to {prof.description}.
            </p>

            <div className="grid sm:grid-cols-2 gap-6">
              {/* Occupation Codes */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  OFO Occupation Code (ITR12)
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Select one of these when SARS eFiling asks for your occupation:
                </p>
                <ul className="space-y-2">
                  {prof.sarsOccupationCodes.map((oc, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center rounded bg-brand-600 px-2.5 py-1 text-xs font-bold text-white min-w-[48px] text-center">
                        {oc.code}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{oc.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* IRP5 Source Codes */}
              <div className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-5">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">
                  IRP5 / IT3(a) Source Codes
                </h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                  Common income source codes on your tax certificate:
                </p>
                <ul className="space-y-2">
                  {prof.irp5SourceCodes.map((sc, i) => (
                    <li key={i} className="flex items-center gap-3">
                      <span className="inline-flex items-center justify-center rounded bg-slate-600 px-2.5 py-1 text-xs font-bold text-white min-w-[48px] text-center">
                        {sc.code}
                      </span>
                      <span className="text-sm text-slate-700 dark:text-slate-200">{sc.description}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <p className="mt-6 text-xs text-slate-500 dark:text-slate-400">
              OFO codes are from the Organising Framework for Occupations used by SARS on the ITR12 return.
              IRP5 source codes appear on the tax certificate issued by your employer or contractor.
              Codes are based on the current SARS eFiling system and may be updated by SARS periodically.
            </p>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            How It Works for {prof.name}s
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                1. Upload Statements
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Upload your bank statement PDFs. We support FNB, Standard Bank, Nedbank, Absa, Capitec, and more.
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                <Brain size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                2. AI Analyzes for {prof.name}s
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                The AI knows what {prof.description} can claim. It categorizes every transaction and flags
                deductible expenses for your profession.
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                3. Get Your Report
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Download a SARS-compliant report showing deductions with section references — ready for eFiling or your tax practitioner.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Check Your Deductions Automatically
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
            Upload your bank statements and our tool categorises transactions against SARS-allowable
            deductions for {prof.description}. Your first analysis is free.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
          >
            Try a Free Analysis
          </Link>
        </div>
      </section>

      <SeoFooter />
    </div>
  );
}
