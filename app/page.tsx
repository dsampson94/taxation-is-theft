import Link from 'next/link';
import { Upload, Brain, FileText, Shield, TrendingDown, Zap } from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-brand-700 via-brand-800 to-brand-950 text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur-sm">
              <img src="/south-africa-flag-icon.svg" alt="South African flag" width={20} height={14} className="shrink-0 rounded-sm" />
              Built for South African Taxpayers
            </div>
            <h1 className="text-4xl sm:text-6xl font-bold tracking-tight mb-6">
              Stop Overpaying<br />
              <span className="text-brand-200">Your Tax</span>
            </h1>
            <p className="text-lg sm:text-xl text-brand-100 mb-10 max-w-2xl mx-auto">
              Upload your bank statements. Our AI finds every legitimate deduction.
              Pay the least tax legally possible — in minutes, not months.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-brand-700 hover:bg-brand-50 transition-colors">
                Get Started Free
              </Link>
              <Link href="#how-it-works" className="inline-flex items-center justify-center rounded-lg border-2 border-white/30 px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-white hover:bg-white/10 transition-colors">
                See How It Works
              </Link>
            </div>
            <p className="mt-4 text-sm text-brand-200">
              1 free trial analysis • No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-slate-200 bg-white dark:bg-slate-900 dark:border-slate-700">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 md:gap-8 text-center">
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-brand-600">R17,235</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Primary Tax Rebate</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-brand-600">R95,750</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Tax-Free Threshold</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-brand-600">18-45%</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Income Tax Range</div>
            </div>
            <div>
              <div className="text-2xl sm:text-3xl font-bold text-brand-600">100%</div>
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-1">Legal &amp; Compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-slate-900">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300">
              Three simple steps to minimize your tax bill
            </p>
          </div>

          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                <Upload size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">1. Upload Statements</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Upload your bank statement PDFs. We support FNB, Standard Bank, Nedbank, Absa, Capitec, and more.
              </p>
            </div>

            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                <Brain size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">2. AI Analyzes</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Our AI categorizes every transaction, flags deductible expenses, and identifies what needs your review.
              </p>
            </div>

            <div className="card text-center">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600">
                <FileText size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-slate-900 dark:text-white">3. Get Your Report</h3>
              <p className="text-slate-600 dark:text-slate-300">
                Download a detailed tax report showing your income, deductions, and exactly how much you could save.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white">
              Why TIT?
            </h2>
            <p className="mt-4 text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
              Because you work hard for your money. We make sure SARS only gets what they&apos;re legally owed — not a cent more.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            <div className="card">
              <TrendingDown className="text-brand-600 mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Maximize Deductions</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                AI identifies deductions you never knew existed — profession-specific, home office, travel, equipment, and more.
              </p>
            </div>
            <div className="card">
              <Zap className="text-brand-600 mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Minutes, Not Months</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                No more spreadsheets or expensive tax consultants. Upload, analyze, done. Your tax sorted in minutes.
              </p>
            </div>
            <div className="card">
              <Shield className="text-brand-600 mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">SARS Compliant</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Every deduction references the relevant SARS section. Fully legal, fully compliant, fully documented.
              </p>
            </div>
            <div className="card">
              <Brain className="text-brand-600 mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">Occupation-Smart</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Software engineer? Doctor? Freelancer? The AI tailors deductions to your specific profession.
              </p>
            </div>
            <div className="card">
              <FileText className="text-brand-600 mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">SARS Compliant</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Every deduction references the relevant SARS section. Fully legal, fully compliant, fully documented.
              </p>
            </div>
            <div className="card">
              <Upload className="text-brand-600 mb-3" size={24} />
              <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">All Major Banks</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm">
                Works with FNB, Standard Bank, Nedbank, Absa, Capitec, Investec, Discovery Bank, and more.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-brand-700 to-brand-900 text-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Pay Less Tax?
          </h2>
          <p className="text-lg text-brand-100 mb-8 max-w-2xl mx-auto">
            Join thousands of South Africans who are taking control of their tax.
            Your first analysis is completely free — no credit card needed.
          </p>
          <Link href="/register" className="inline-flex items-center justify-center rounded-lg bg-white px-6 py-3 sm:px-8 sm:py-4 text-base sm:text-lg font-semibold text-brand-700 hover:bg-brand-50 transition-colors">
            Start Saving Now — It&apos;s Free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white font-black text-xs">
                  TIT
                </div>
                <span className="text-white font-bold">TIT</span>
              </div>
              <p className="text-sm">
                AI-powered tax assistance for South African taxpayers. 
                Pay less, legally.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="#how-it-works" className="hover:text-white transition-colors">How It Works</Link></li>
                <li><Link href="/register" className="hover:text-white transition-colors">Get Started</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-3">Legal</h4>
              <ul className="space-y-2 text-sm">
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
            © {new Date().getFullYear()} TIT Tax. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
