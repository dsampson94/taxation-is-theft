import type { Metadata } from "next";
import Link from "next/link";
import { Clock, ArrowRight, Tag } from "lucide-react";
import { blogArticles } from "@/app/lib/blog-articles";
import SeoFooter from "@/app/components/SeoFooter";

export const metadata: Metadata = {
  title: "Tax Blog — SARS Tips, Guides & Filing Help",
  description:
    "Practical South African tax articles. SARS eFiling guides, deduction tips, filing deadlines, crypto tax, freelancer tax, and more — all with legislative references.",
  alternates: { canonical: "https://taxationistheft.co.za/blog" },
  openGraph: {
    title: "Tax Blog — SARS Tips, Guides & Filing Help",
    description:
      "Practical South African tax articles. SARS eFiling guides, deduction tips, filing deadlines, and more.",
    url: "https://taxationistheft.co.za/blog",
    type: "website",
    locale: "en_ZA",
    siteName: "TIT Tax",
    images: [{ url: "/og-image.png", width: 1200, height: 630 }],
  },
  keywords: [
    "South Africa tax blog",
    "SARS tax tips",
    "SARS eFiling guide",
    "tax deductions South Africa",
    "freelancer tax tips",
    "SARS filing deadlines",
  ],
};

const categoryColors: Record<string, string> = {
  "SARS eFiling": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  Deadlines: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300",
  Deductions: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  Compliance: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "Tax Tips": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  News: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
};

export default function BlogIndexPage() {
  const sorted = [...blogArticles].sort(
    (a, b) => new Date(b.publishDate).getTime() - new Date(a.publishDate).getTime()
  );

  const categories = Array.from(new Set(blogArticles.map((a) => a.category)));

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              South African Tax Blog
            </h1>
            <p className="text-lg text-brand-100">
              Practical, fact-based articles on SARS eFiling, deductions, deadlines, and compliance
              — with references to the Income Tax Act and SARS Interpretation Notes.
            </p>
          </div>
        </div>
      </section>

      {/* Category pills */}
      <section className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((cat) => (
              <span
                key={cat}
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ${categoryColors[cat] || ""}`}
              >
                <Tag size={12} />
                {cat} ({blogArticles.filter((a) => a.category === cat).length})
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Articles grid */}
      <section className="py-12 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((article) => (
              <Link
                key={article.slug}
                href={`/blog/${article.slug}`}
                className="group flex flex-col bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all hover:border-brand-300 dark:hover:border-brand-700 overflow-hidden"
              >
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${categoryColors[article.category] || ""}`}
                    >
                      {article.category}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-slate-400">
                      <Clock size={12} />
                      {article.readingTime} min read
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-2 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {article.title}
                  </h2>

                  <p className="text-sm text-slate-600 dark:text-slate-400 mb-4 flex-1">
                    {article.excerpt}
                  </p>

                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <time dateTime={article.publishDate}>
                      {new Date(article.publishDate).toLocaleDateString("en-ZA", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                    <span className="flex items-center gap-1 text-brand-600 dark:text-brand-400 font-medium group-hover:gap-2 transition-all">
                      Read <ArrowRight size={14} />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-12 bg-gradient-to-r from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">
            Stop Reading, Start Saving
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
            Upload your bank statements and let AI find deductions you&apos;re missing.
            First analysis is free.
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
