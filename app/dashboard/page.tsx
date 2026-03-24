'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/app/contexts/AuthContext';
import toast from 'react-hot-toast';
import {
  Upload,
  FileText,
  TrendingDown,
  Plus,
  Calendar,
  CreditCard,
  BarChart3,
  Settings,
  Sparkles,
  Lock,
  ChevronDown,
  Info,
} from 'lucide-react';

interface TaxYear {
  id: string;
  yearLabel: string;
  totalIncome: number | null;
  totalDeductions: number | null;
  taxableIncome: number | null;
  estimatedTax: number | null;
  taxWithDeductions: number | null;
  taxSavings: number | null;
  status: string;
  _count: { transactions: number; deductions: number };
}

const formatZAR = (amount: number | null) => {
  if (amount === null || amount === undefined) return 'R0.00';
  return new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);
};

// Full range of SA tax years users can build their history with
function getAllTaxYearOptions() {
  const years: string[] = [];
  for (let start = 2030; start >= 2000; start--) {
    years.push(`${start}/${start + 1}`);
  }
  return years;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTaxYears();
    }
  }, [user]);

  const fetchTaxYears = async () => {
    try {
      const res = await fetch('/api/tax-years');
      if (res.ok) {
        const data = await res.json();
        setTaxYears(data.taxYears);
      }
    } catch {
      toast.error('Failed to load tax years');
    } finally {
      setLoading(false);
    }
  };

  const createTaxYear = async (yearLabel: string) => {
    try {
      const res = await fetch('/api/tax-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ yearLabel }),
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Tax year ${data.taxYear.yearLabel} added`);
        setShowYearPicker(false);
        setSelectedYear('');
        fetchTaxYears();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to create tax year');
    }
  };

  const existingLabels = taxYears.map(ty => ty.yearLabel);
  const availableYears = getAllTaxYearOptions().filter(y => !existingLabels.includes(y));

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Header */}
      <section className="bg-gradient-to-b from-brand-800 to-brand-950 text-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">
                Welcome back{user.name ? `, ${user.name}` : ''}
              </h1>
              <p className="text-brand-200 mt-1">
                {user.credits} analysis credit{user.credits !== 1 ? 's' : ''} remaining •{' '}
                <span className="capitalize">{user.planType.toLowerCase()}</span> plan
              </p>
            </div>
            <div className="flex gap-3">
              <Link href="/tax-profile" className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white hover:bg-white/20 transition-colors">
                <Settings size={16} className="mr-2" />
                Profile
              </Link>
              <Link href="/upload" className="inline-flex items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition-colors">
                <Upload size={16} className="mr-2" />
                Upload Statements
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Profile CTA */}
        {!user.taxProfileComplete && (
          <div className="card mb-8 border-brand-200 dark:border-brand-800 bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-950/30 dark:to-blue-950/30">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Sparkles className="text-brand-600" size={20} />
                  <h3 className="font-semibold text-lg text-slate-900 dark:text-white">Complete Your Tax Profile</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300">
                  Tell us your occupation and tax situation so our AI knows exactly which deductions to find.
                  This makes results <strong>significantly more accurate</strong>. Takes 2 minutes.
                </p>
              </div>
              <Link href="/tax-profile" className="btn-primary shrink-0">
                <Sparkles size={16} className="mr-2" />
                Set Up Profile
              </Link>
            </div>
          </div>
        )}

        {/* Stats cards */}
        {taxYears.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-8">
            <div className="card">
              <div className="text-sm text-slate-500 mb-1">Total Income</div>
              <div className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
                {formatZAR(taxYears[0]?.totalIncome ?? 0)}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-slate-500 mb-1">Total Deductions</div>
              <div className="text-lg sm:text-xl font-bold text-brand-600">
                {formatZAR(taxYears[0]?.totalDeductions ?? 0)}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-slate-500 mb-1">Estimated Tax</div>
              <div className="text-lg sm:text-xl font-bold text-brand-600">
                {formatZAR(taxYears[0]?.taxWithDeductions ?? 0)}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-slate-500 mb-1">Tax Saved</div>
              <div className="text-lg sm:text-xl font-bold text-brand-600">
                {formatZAR(taxYears[0]?.taxSavings ?? 0)}
              </div>
            </div>
          </div>
        )}

        {/* Tax Years */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tax Years</h2>
            <button onClick={() => setShowYearPicker(true)} className="btn-secondary py-2 px-3 text-sm">
              <Plus size={16} className="mr-1" />
              Add Older Year
            </button>
          </div>

          {/* Year picker modal */}
          {showYearPicker && (
            <div className="card mb-4 border-brand-200 dark:border-brand-800 bg-brand-50/50 dark:bg-brand-950/20">
              <h3 className="font-semibold mb-3 text-slate-900 dark:text-white">Add a Tax Year</h3>
              <p className="text-xs text-slate-500 mb-3">SA tax years run March to February. Select a year, then upload 12 monthly statements for it.</p>
              {availableYears.length === 0 ? (
                <p className="text-sm text-slate-500">You already have all available tax years.</p>
              ) : (
                <div className="flex flex-wrap gap-1.5 mb-4 max-h-48 overflow-y-auto">
                  {availableYears.map(year => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                        selectedYear === year
                          ? 'bg-brand-600 text-white border-brand-600'
                          : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-brand-400 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button
                  onClick={() => createTaxYear(selectedYear)}
                  disabled={!selectedYear}
                  className="btn-primary py-2 px-4 text-sm"
                >
                  Add {selectedYear || 'Tax Year'}
                </button>
                <button onClick={() => { setShowYearPicker(false); setSelectedYear(''); }} className="btn-secondary py-2 px-4 text-sm">
                  Cancel
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div className="card text-center py-8 text-slate-400">Loading...</div>
          ) : (
            <div className="grid gap-4">
              {taxYears.map(ty => (
                <div key={ty.id} className="card flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Calendar size={18} className="text-brand-600" />
                      <h3 className="font-semibold text-lg">{ty.yearLabel}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        ty.status === 'COMPLETED'
                          ? 'bg-brand-100 text-brand-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {ty.status === 'COMPLETED' ? 'Complete' : 'In Progress'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-500 mt-1">
                      {ty._count.transactions} transactions • {ty._count.deductions} deductions
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-1.5 sm:gap-2">
                    <Link
                      href={`/upload?taxYearId=${ty.id}`}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      <Upload size={14} className="mr-1" />
                      Upload
                    </Link>
                    <Link
                      href={`/transactions?taxYearId=${ty.id}`}
                      className="btn-secondary py-1.5 px-3 text-xs"
                    >
                      <CreditCard size={14} className="mr-1" />
                      Transactions
                    </Link>
                    <Link
                      href={`/report?taxYearId=${ty.id}`}
                      className="btn-primary py-1.5 px-3 text-xs"
                    >
                      <BarChart3 size={14} className="mr-1" />
                      Tax Report
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick actions */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
          <Link href="/upload" className="card hover:border-brand-300 transition-colors group">
            <Upload className="text-brand-600 mb-3 group-hover:scale-110 transition-transform" size={24} />
            <h3 className="font-semibold mb-1">Upload Bank Statement</h3>
            <p className="text-sm text-slate-500">Upload PDFs and let AI analyze your transactions</p>
          </Link>
          <Link href="/report" className="card hover:border-brand-300 transition-colors group">
            <FileText className="text-brand-600 mb-3 group-hover:scale-110 transition-transform" size={24} />
            <h3 className="font-semibold mb-1">View Tax Report</h3>
            <p className="text-sm text-slate-500">See your tax calculations and potential savings</p>
          </Link>
          <Link href="/transactions" className="card hover:border-brand-300 transition-colors group">
            <TrendingDown className="text-brand-600 mb-3 group-hover:scale-110 transition-transform" size={24} />
            <h3 className="font-semibold mb-1">Review Transactions</h3>
            <p className="text-sm text-slate-500">Review and adjust AI categorizations</p>
          </Link>
        </div>

        {/* Privacy & Security info */}
        <div className="card bg-slate-100 dark:bg-slate-900 border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <Lock size={20} className="text-brand-600 mt-0.5 shrink-0" />
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white mb-1">Your data is protected</h3>
              <p className="text-xs text-slate-500">
                Bank statement PDFs are processed in memory and <strong>never stored</strong>.
                Only extracted transaction data is kept — encrypted at rest with AES-256.
                Your ID number and tax reference are encrypted in our database.
                We comply with South Africa&apos;s POPIA (Protection of Personal Information Act).
              </p>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
