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
  const [showProfile, setShowProfile] = useState(false);
  const [occupation, setOccupation] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchTaxYears();
      fetchProfile();
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

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        setOccupation(data.user.occupation || '');
        setTaxNumber(data.user.taxNumber || '');
        if (!data.user.occupation) {
          setShowProfile(true);
        }
      }
    } catch {}
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

  const saveProfile = async () => {
    try {
      const res = await fetch('/api/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ occupation, taxNumber }),
      });
      if (res.ok) {
        toast.success('Profile updated');
        setShowProfile(false);
      }
    } catch {
      toast.error('Failed to update profile');
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
            <button onClick={() => setShowProfile(!showProfile)} className="btn-secondary py-2 px-4 text-sm">
              <Settings size={16} className="mr-2" />
              Profile
            </button>
            <Link href="/upload" className="btn-primary py-2 px-4 text-sm">
              <Upload size={16} className="mr-2" />
              Upload Statements
            </Link>
          </div>
        </div>

        {/* Profile setup card */}
        {showProfile && (
          <div className="card mb-8 border-brand-200 bg-brand-50 dark:bg-brand-950/20">
            <h3 className="font-semibold text-lg mb-4">
              {occupation ? 'Update Your Profile' : '👋 Complete Your Profile'}
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 mb-4">
              Your occupation helps the AI find profession-specific deductions.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="label">Occupation / Job Title</label>
                <input
                  type="text"
                  value={occupation}
                  onChange={e => setOccupation(e.target.value)}
                  className="input"
                  placeholder="e.g. Software Engineer, Doctor, Freelancer"
                />
              </div>
              <div>
                <label className="label">SARS Tax Reference Number (optional)</label>
                <input
                  type="text"
                  value={taxNumber}
                  onChange={e => setTaxNumber(e.target.value)}
                  className="input"
                  placeholder="e.g. 0123456789"
                />
              </div>
            </div>
            <button onClick={saveProfile} className="btn-primary py-2 px-4 text-sm">
              Save Profile
            </button>
          </div>
        )}

        {/* Stats cards */}
        {taxYears.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="card">
              <div className="text-sm text-slate-500 mb-1">Total Income</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">
                {formatZAR(taxYears[0]?.totalIncome ?? 0)}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-slate-500 mb-1">Total Deductions</div>
              <div className="text-xl font-bold text-accent-600">
                {formatZAR(taxYears[0]?.totalDeductions ?? 0)}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-slate-500 mb-1">Estimated Tax</div>
              <div className="text-xl font-bold text-brand-600">
                {formatZAR(taxYears[0]?.taxWithDeductions ?? 0)}
              </div>
            </div>
            <div className="card">
              <div className="text-sm text-slate-500 mb-1">Tax Saved</div>
              <div className="text-xl font-bold text-accent-600">
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
                  <div className="flex flex-wrap gap-2">
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
        <div className="grid sm:grid-cols-3 gap-4">
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
