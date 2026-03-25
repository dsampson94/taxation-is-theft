import Link from "next/link";
import { cities } from "@/app/lib/cities";
import { professions } from "@/app/lib/professions";
import { taxGuides } from "@/app/lib/tax-guides";
import { blogArticles } from "@/app/lib/blog-articles";

export default function SeoFooter() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main footer grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-black text-xs">
                TIT
              </div>
              <span className="text-white font-bold">TIT Tax</span>
            </div>
            <p className="text-sm mb-4">
              AI-powered tax assistance for South African taxpayers.
              Pay less, legally.
            </p>
            <div className="space-y-2 text-sm">
              <Link href="/#how-it-works" className="block hover:text-white transition-colors">How It Works</Link>
              <Link href="/pricing" className="block hover:text-white transition-colors">Pricing</Link>
              <Link href="/register" className="block hover:text-white transition-colors">Get Started Free</Link>
              <Link href="/login" className="block hover:text-white transition-colors">Log In</Link>
            </div>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Tax Help by City</h4>
            <ul className="space-y-1.5 text-sm">
              {cities.slice(0, 10).map((city) => (
                <li key={city.slug}>
                  <Link href={`/tax-help/${city.slug}`} className="hover:text-white transition-colors">
                    Tax Help {city.name}
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <span className="text-slate-500 text-xs">
                  + {cities.slice(10).map((c) => c.name).join(", ")}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Tax Deductions by Profession</h4>
            <ul className="space-y-1.5 text-sm">
              {professions.slice(0, 10).map((prof) => (
                <li key={prof.slug}>
                  <Link href={`/tax-deductions/${prof.slug}`} className="hover:text-white transition-colors">
                    {prof.name} Tax
                  </Link>
                </li>
              ))}
              <li className="pt-1">
                <span className="text-slate-500 text-xs">
                  + {professions.slice(10).map((p) => p.name).join(", ")}
                </span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Tax Guides</h4>
            <ul className="space-y-1.5 text-sm">
              {taxGuides.map((guide) => (
                <li key={guide.slug}>
                  <Link href={`/tax-guides/${guide.slug}`} className="hover:text-white transition-colors">
                    {guide.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-white font-semibold mb-3">Tax Blog</h4>
            <ul className="space-y-1.5 text-sm">
              {blogArticles.slice(0, 8).map((article) => (
                <li key={article.slug}>
                  <Link href={`/blog/${article.slug}`} className="hover:text-white transition-colors">
                    {article.title.length > 40 ? article.title.slice(0, 40) + "…" : article.title}
                  </Link>
                </li>
              ))}
              {blogArticles.length > 8 && (
                <li className="pt-1">
                  <Link href="/blog" className="text-brand-400 hover:text-brand-300 transition-colors font-medium">
                    View all articles →
                  </Link>
                </li>
              )}
            </ul>

            <h4 className="text-white font-semibold mb-3 mt-6">Legal</h4>
            <ul className="space-y-1.5 text-sm">
              <li><span className="text-slate-500">Privacy Policy</span></li>
              <li><span className="text-slate-500">Terms of Service</span></li>
            </ul>
            <p className="mt-4 text-xs text-slate-500">
              Disclaimer: This tool provides tax guidance, not professional tax advice.
              Consult a registered tax practitioner for complex matters.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 text-center text-sm">
          © {new Date().getFullYear()} TIT Tax. All rights reserved. | AI-Powered Tax Assistant for South Africa
        </div>
      </div>
    </footer>
  );
}
