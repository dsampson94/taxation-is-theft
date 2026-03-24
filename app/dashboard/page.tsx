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

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [taxYears, setTaxYears] = useState<TaxYear[]>([]);
  const [loading, setLoading] = useState(true);

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

  const createTaxYear = async () => {
    try {
      const res = await fetch('/api/tax-years', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}), // Uses current tax year
      });
      if (res.ok) {
        const data = await res.json();
        toast.success(`Tax year ${data.taxYear.yearLabel} created`);
        fetchTaxYears();
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to create tax year');
    }
  };

  if (authLoading || !user) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center">
        <div className="animate-pulse text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Welcome back{user.name ? `, ${user.name}` : ''}
            </h1>
            <p className="text-slate-500 mt-1">
              {user.credits} analysis credits remaining •{' '}
              <span className="capitalize">{user.planType.toLowerCase()}</span> plan
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/tax-profile" className="btn-secondary py-2 px-4 text-sm">
              <Settings size={16} className="mr-2" />
              Profile
            </Link>
            <Link href="/upload" className="btn-primary py-2 px-4 text-sm">
              <Upload size={16} className="mr-2" />
              Upload Statements
            </Link>
          </div>
        </div>

        {/* Getting Started / Profile CTA */}
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
              <Link
                href="/tax-profile"
                className="btn-primary shrink-0"
              >
                <Sparkles size={16} className="mr-2" />
                Set Up Profile
              </Link>
            </div>
          </div>
        )}

        {/* Getting Started Stepper (show when no tax years) */}
        {taxYears.length === 0 && !loading && (
          <div className="card mb-8">
            <h2 className="font-semibold text-lg mb-4 text-slate-900 dark:text-white">Getting Started</h2>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${user.taxProfileComplete ? 'bg-accent-100 text-accent-700 dark:bg-accent-900/40' : 'bg-brand-100 text-brand-700 dark:bg-brand-900/40'}`}>
                  {user.taxProfileComplete ? '✓' : '1'}
                </div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Complete your tax profile <span className="text-xs text-slate-400 font-normal">(optional but recommended)</span></p>
                  <p className="text-sm text-slate-500">Helps AI find profession-specific deductions for you</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 text-sm font-bold">2</div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Create a tax year &amp; upload your bank statements</p>
                  <p className="text-sm text-slate-500">PDF statements from your online banking portal work best</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 text-sm font-bold">3</div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Review flagged transactions</p>
                  <p className="text-sm text-slate-500">Confirm obvious deductions, review suspicious items, exclude personal expenses</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900/40 text-sm font-bold">4</div>
                <div>
                  <p className="font-medium text-slate-900 dark:text-white">Generate your tax report</p>
                  <p className="text-sm text-slate-500">See exactly how much you can save — SARS-compliant calculations</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-3">
              <button onClick={createTaxYear} className="btn-primary">
                <Plus size={16} className="mr-2" />
                Create Tax Year &amp; Start
              </button>
              {!user.taxProfileComplete && (
                <Link href="/tax-profile" className="btn-secondary">
                  Set Up Profile First
                </Link>
              )}
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
              <div className="text-lg sm:text-xl font-bold text-accent-600">
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
              <div className="text-lg sm:text-xl font-bold text-accent-600">
                {formatZAR(taxYears[0]?.taxSavings ?? 0)}
              </div>
            </div>
          </div>
        )}

        {/* Tax Years */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Tax Years</h2>
            <button onClick={createTaxYear} className="btn-secondary py-2 px-3 text-sm">
              <Plus size={16} className="mr-1" />
              New Tax Year
            </button>
          </div>

          {loading ? (
            <div className="card text-center py-8 text-slate-400">Loading...</div>
          ) : taxYears.length === 0 ? (
            <div className="card text-center py-12">
              <Calendar className="mx-auto text-slate-300 mb-4" size={48} />
              <h3 className="text-lg font-semibold mb-2">No Tax Years Yet</h3>
              <p className="text-slate-500 mb-4">
                Create a tax year to start tracking your income and deductions.
              </p>
              <button onClick={createTaxYear} className="btn-primary">
                <Plus size={16} className="mr-2" />
                Create Current Tax Year
              </button>
            </div>
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
                          ? 'bg-accent-100 text-accent-700'
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
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          <Link href="/upload" className="card hover:border-brand-300 transition-colors group">
            <Upload className="text-brand-600 mb-3 group-hover:scale-110 transition-transform" size={24} />
            <h3 className="font-semibold mb-1">Upload Bank Statement</h3>
            <p className="text-sm text-slate-500">Upload PDFs and let AI analyze your transactions</p>
          </Link>
          <Link href="/report" className="card hover:border-accent-300 transition-colors group">
            <FileText className="text-accent-600 mb-3 group-hover:scale-110 transition-transform" size={24} />
            <h3 className="font-semibold mb-1">View Tax Report</h3>
            <p className="text-sm text-slate-500">See your tax calculations and potential savings</p>
          </Link>
          <Link href="/transactions" className="card hover:border-brand-300 transition-colors group">
            <TrendingDown className="text-brand-600 mb-3 group-hover:scale-110 transition-transform" size={24} />
            <h3 className="font-semibold mb-1">Review Transactions</h3>
            <p className="text-sm text-slate-500">Review and adjust AI categorizations</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
