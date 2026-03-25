import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { blogArticles, getBlogArticleBySlug } from "@/app/lib/blog-articles";
import { notFound } from "next/navigation";
import SeoFooter from "@/app/components/SeoFooter";

export function generateStaticParams() {
  return blogArticles.map((a) => ({ slug: a.slug }));
}

interface Props {
  params: { slug: string };
}

export function generateMetadata({ params }: Props): Metadata {
  const article = getBlogArticleBySlug(params.slug);
  if (!article) return {};

  const url = `https://taxationistheft.co.za/blog/${article.slug}`;

  return {
    title: article.metaTitle,
    description: article.metaDescription,
    alternates: { canonical: url },
    openGraph: {
      title: article.metaTitle,
      description: article.metaDescription,
      url,
      type: "article",
      locale: "en_ZA",
      siteName: "TIT Tax",
      publishedTime: article.publishDate,
      modifiedTime: article.lastUpdated,
      images: [{ url: "/og-image.png", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: article.metaTitle,
      description: article.metaDescription,
      images: ["/og-image.png"],
    },
    keywords: article.keywords,
  };
}

const categoryColors: Record<string, string> = {
  "SARS eFiling": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Deadlines: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Deductions: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Compliance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Tax Tips": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  News: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function BlogArticlePage({ params }: Props) {
  const article = getBlogArticleBySlug(params.slug);
  if (!article) notFound();

  const related = article.relatedSlugs
    .map((s) => getBlogArticleBySlug(s))
    .filter(Boolean) as NonNullable<ReturnType<typeof getBlogArticleBySlug>>[];

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://taxationistheft.co.za" },
      { "@type": "ListItem", position: 2, name: "Blog", item: "https://taxationistheft.co.za/blog" },
      { "@type": "ListItem", position: 3, name: article.title, item: `https://taxationistheft.co.za/blog/${article.slug}` },
    ],
  };

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: article.title,
    description: article.metaDescription,
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
    mainEntityOfPage: `https://taxationistheft.co.za/blog/${article.slug}`,
    datePublished: article.publishDate,
    dateModified: article.lastUpdated,
    articleSection: article.category,
    keywords: article.keywords.join(", "),
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
            <Link
              href="/blog"
              className="inline-flex items-center gap-1.5 text-sm text-brand-200 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={14} />
              All Articles
            </Link>

            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${categoryColors[article.category] || ""}`}
              >
                {article.category}
              </span>
              <span className="flex items-center gap-1.5 text-sm text-brand-200">
                <Clock size={14} />
                {article.readingTime} min read
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {article.title}
            </h1>
            <p className="text-lg text-brand-100">{article.excerpt}</p>

            <div className="flex items-center gap-4 mt-6 text-sm text-brand-200">
              <span className="flex items-center gap-1.5">
                <Calendar size={14} />
                Published{" "}
                {new Date(article.publishDate).toLocaleDateString("en-ZA", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
              {article.lastUpdated !== article.publishDate && (
                <span>
                  · Updated{" "}
                  {new Date(article.lastUpdated).toLocaleDateString("en-ZA", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-white dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl space-y-10">
            {article.sections.map((section, i) => (
              <div key={i}>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mb-4">
                  {section.heading}
                </h2>
                <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {section.content}
                </p>
              </div>
            ))}

            {/* Disclaimer */}
            <div className="mt-4 p-4 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/20">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                <strong>Disclaimer:</strong> This article is based on the South African Income Tax Act and
                published SARS Interpretation Notes as at the 2024/2025 tax year. It is provided for
                informational purposes only and does not constitute professional tax advice. Tax legislation
                changes periodically — consult a registered tax practitioner for advice on your specific situation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Related articles */}
      {related.length > 0 && (
        <section className="py-12 bg-slate-50 dark:bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">
                Related Articles
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {related.map((r) => (
                  <Link
                    key={r.slug}
                    href={`/blog/${r.slug}`}
                    className="group flex flex-col rounded-lg bg-white dark:bg-slate-900 p-5 border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-brand-300 dark:hover:border-brand-700 transition-all"
                  >
                    <span
                      className={`self-start inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium mb-2 ${categoryColors[r.category] || ""}`}
                    >
                      {r.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                      {r.title}
                    </h3>
                    <span className="mt-2 flex items-center gap-1 text-xs text-brand-600 dark:text-brand-400 font-medium">
                      Read article <ArrowRight size={12} />
                    </span>
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
            Find Your Deductions Automatically
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
            Upload your bank statements and let AI identify every deduction you&apos;re entitled to.
            First analysis is free — no credit card required.
          </p>
          <Link
            href="/register"
            className="inline-flex items-center gap-2 rounded-lg bg-white px-8 py-3 font-semibold text-brand-700 hover:bg-brand-50 transition-colors shadow-lg"
          >
            Get Started Free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      <SeoFooter />
    </div>
  );
}
