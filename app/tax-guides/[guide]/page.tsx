import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen } from "lucide-react";
import { taxGuides, getTaxGuideBySlug } from "@/app/lib/tax-guides";
import { getProfessionBySlug } from "@/app/lib/professions";
import { notFound } from "next/navigation";
import SeoFooter from "@/app/components/SeoFooter";

export function generateStaticParams() {
  return taxGuides.map((g) => ({ guide: g.slug }));
}

interface Props {
  params: { guide: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const guide = getTaxGuideBySlug(params.guide);
  if (!guide) return {};

  const url = `https://taxationistheft.co.za/tax-guides/${guide.slug}`;

  return {
    title: guide.metaTitle,
    description: guide.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: guide.metaTitle,
      description: guide.metaDescription,
      url,
      type: "article",
      locale: "en_ZA",
      siteName: "TIT Tax",
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: guide.metaTitle,
      description: guide.metaDescription,
      images: ["/og-image.png"],
    },
    keywords: guide.keywords,
  };
}

export default function TaxGuidePage({ params }: Props) {
  const guide = getTaxGuideBySlug(params.guide);
  if (!guide) notFound();

  const relatedProfs = guide.relatedProfessions
    .map((slug) => {
      const p = getProfessionBySlug(slug);
      return p ? { slug: p.slug, name: p.name } : null;
    })
    .filter(Boolean) as { slug: string; name: string }[];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://taxationistheft.co.za" },
      { "@type": "ListItem", position: 2, name: "Tax Guides", item: "https://taxationistheft.co.za/tax-guides" },
      { "@type": "ListItem", position: 3, name: guide.title, item: `https://taxationistheft.co.za/tax-guides/${guide.slug}` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: guide.heading,
    description: guide.metaDescription,
    author: {
      "@type": "Organization",
      name: "TIT Tax",
      url: "https://taxationistheft.co.za",
    },
    publisher: {
      "@type": "Organization",
      name: "TIT Tax",
      url: "https://taxationistheft.co.za",
    },
    mainEntityOfPage: `https://taxationistheft.co.za/tax-guides/${guide.slug}`,
    datePublished: "2025-03-01",
    dateModified: new Date().toISOString().split("T")[0],
  };

  return (
    <div className="flex flex-col">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Header */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <BookOpen size={16} />
              Tax Guide
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {guide.heading}
            </h1>
            <p className="text-lg text-brand-100">{guide.intro}</p>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-10">
            {guide.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {section.heading}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
            <div className="mt-4 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Disclaimer:</strong> This guide is based on the South African Income Tax Act and
                published SARS Interpretation Notes as at the 2024/2025 tax year. It is provided for
                informational purposes only and does not constitute professional tax advice. Tax legislation
                changes periodically — consult a registered tax practitioner for advice on your specific situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related profession links */}
      {relatedProfs.length > 0 && (
        <section className="py-12 bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Related Profession Tax Guides
              </h2>
              <div className="flex flex-wrap gap-3">
                {relatedProfs.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/tax-deductions/${p.slug}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-white dark:bg-slate-800 px-4 py-2 text-sm font-medium text-brand-600 dark:text-brand-400 shadow-sm hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700"
                  >
                    Tax Deductions for {p.name}s →
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Identify Your {guide.title} Automatically
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
            Upload your bank statements and our tool categorises transactions against SARS-allowable
            deductions — including {guide.title.toLowerCase()} items. Your first analysis is free.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-brand-700 hover:bg-brand-50 transition-colors"
          >
            Analyze My Statements Free
          </Link>
        </div>
      </section>

      <SeoFooter />
    </div>
  );
}
