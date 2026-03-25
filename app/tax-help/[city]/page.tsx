import type { Metadata } from "next";
import Link from "next/link";
import { Upload, Brain, FileText, Shield, MapPin, TrendingDown } from "lucide-react";
import { cities, getCityBySlug } from "@/app/lib/cities";
import { notFound } from "next/navigation";
import SeoFooter from "@/app/components/SeoFooter";

export function generateStaticParams() {
  return cities.map((city) => ({ city: city.slug }));
}

interface Props {
  params: { city: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const city = getCityBySlug(params.city);
  if (!city) return {};

  const title = `Tax Assistant in ${city.name} | AI-Powered Tax Help ${city.province}`;
  const description = `Looking for tax help in ${city.name}? TIT Tax is an AI-powered tax assistant for ${city.name} taxpayers. Upload your bank statements, find deductions, and pay less tax — legally. Serving ${city.region}.`;
  const url = `https://taxationistheft.co.za/tax-help/${city.slug}`;

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
      `tax assistant ${city.name}`,
      `tax help ${city.name}`,
      `SARS help ${city.name}`,
      `tax deductions ${city.name}`,
      `tax return ${city.name}`,
      `income tax ${city.province}`,
      `tax calculator ${city.name}`,
      `tax consultant ${city.name}`,
      `tax filing ${city.name}`,
      ...city.searchTerms.map((t) => `tax help ${t}`),
    ],
  };
}

export default function CityPage({ params }: Props) {
  const city = getCityBySlug(params.city);
  if (!city) notFound();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: `TIT Tax — AI Tax Assistant in ${city.name}`,
    description: `AI-powered tax assistant helping individual taxpayers in ${city.name}, ${city.province} find deductions and pay less tax legally.`,
    provider: {
      "@type": "Organization",
      name: "TIT Tax",
      url: "https://taxationistheft.co.za",
    },
    areaServed: {
      "@type": "City",
      name: city.name,
      containedInPlace: {
        "@type": "State",
        name: city.province,
        containedInPlace: {
          "@type": "Country",
          name: "South Africa",
        },
      },
    },
    serviceType: "Tax Preparation and Advisory",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "ZAR",
      description: "First analysis free, no credit card required",
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://taxationistheft.co.za" },
      { "@type": "ListItem", position: 2, name: "Tax Help", item: "https://taxationistheft.co.za/tax-help" },
      { "@type": "ListItem", position: 3, name: city.name, item: `https://taxationistheft.co.za/tax-help/${city.slug}` },
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
              <MapPin size={16} />
              Serving {city.name}, {city.province}
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-6">
              AI-Powered Tax Help<br />
              <span className="text-brand-200">in {city.name}</span>
            </h1>
            <p className="text-lg sm:text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
              {city.name} taxpayers: upload your bank statements and let AI find every legitimate deduction.
              Pay the least tax legally possible — in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
              >
                Get Started Free
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

      {/* Local context */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl">
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mb-6">
              Tax Assistance for {city.name} Residents
            </h2>
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <p>
                Whether you&apos;re a salaried employee, freelancer, or small business owner in{" "}
                <strong>{city.name}</strong>, {city.description.toLowerCase()}, TIT Tax helps you
                maximize your SARS deductions without the cost of a traditional tax consultant.
              </p>
              <p>
                Our AI analyses bank statements from all major South African banks — FNB, Standard Bank,
                Nedbank, Absa, Capitec, Investec, and Discovery Bank — and identifies deductions specific
                to your profession and circumstances.
              </p>
              <p>
                Serving taxpayers across <strong>{city.region}</strong> and the greater{" "}
                <strong>{city.province}</strong> area.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            How It Works for {city.name} Taxpayers
          </h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                1. Upload Your Statements
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Upload bank statement PDFs from any major SA bank. Takes less than a minute.
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                <Brain size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                2. AI Finds Deductions
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Our AI categorizes every transaction and identifies deductions you may have missed.
              </p>
            </div>
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">
                3. Get Your Tax Report
              </h3>
              <p className="text-slate-600 dark:text-slate-300">
                Download a SARS-compliant report showing your income, deductions, and potential savings.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why use TIT */}
      <section className="py-16 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-center mb-12">
            Why {city.name} Taxpayers Choose TIT Tax
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="card">
              <TrendingDown className="text-brand-600 mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">
                Maximize Your Refund
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                AI identifies deductions specific to your profession — home office, travel, equipment,
                medical expenses, and more.
              </p>
            </div>
            <div className="card">
              <Shield className="text-brand-600 mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">
                SARS Compliant
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Every deduction references the relevant SARS section. Fully legal, fully documented.
              </p>
            </div>
            <div className="card">
              <MapPin className="text-brand-600 mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">
                No Office Visit Needed
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Skip the traffic in {city.name}. Do your tax from home — upload, analyze, done.
                No appointments, no queues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-gradient-to-r from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Pay Less Tax in {city.name}?
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
            Join taxpayers across {city.province} who are taking control of their SARS returns.
            Your first analysis is completely free.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
          >
            Start Saving Now — It&apos;s Free
          </Link>
        </div>
      </section>

      <SeoFooter />
    </div>
  );
}
