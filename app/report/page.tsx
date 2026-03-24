'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  BarChart3,
  TrendingDown,
  DollarSign,
  PieChart,
  Download,
  ArrowLeft,
} from 'lucide-react';

const formatZAR = (amount: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

interface TaxReport {
  taxYear: string;
  entityType: string;
  totalIncome: number;
  totalExpenses: number;
  totalDeductions: number;
  taxableIncomeWithoutDeductions: number;
  taxableIncomeWithDeductions: number;
  taxWithoutDeductions: number;
  taxWithDeductions: number;
  taxSaved: number;
  effectiveRateWithout: number;
  effectiveRateWith: number;
  transactionCount: number;
  incomeCount: number;
  expenseCount: number;
  deductibleCount: number;
  categoryBreakdown: Record<string, { count: number; total: number; deductible: number }>;
  monthlyIncome: Record<string, number>;
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><div className="animate-pulse text-slate-400">Loading...</div></div>}>
      <ReportContent />
    </Suspense>
  );
}

function ReportContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taxYearIdParam = searchParams.get('taxYearId');

  const [report, setReport] = useState<TaxReport | null>(null);
  const [taxYears, setTaxYears] = useState<any[]>([]);
  const [selectedTaxYearId, setSelectedTaxYearId] = useState(taxYearIdParam || '');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchTaxYears();
  }, [user]);

  useEffect(() => {
    if (selectedTaxYearId) fetchReport(selectedTaxYearId);
  }, [selectedTaxYearId]);

  const fetchTaxYears = async () => {
    const res = await fetch('/api/tax-years');
    if (res.ok) {
      const data = await res.json();
      setTaxYears(data.taxYears);
      if (!selectedTaxYearId && data.taxYears.length > 0) {
        setSelectedTaxYearId(data.taxYears[0].id);
      }
    }
  };

  const fetchReport = async (tyId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/tax-report?taxYearId=${tyId}`);
      if (res.ok) {
        const data = await res.json();
        setReport(data.report);
      } else {
        const data = await res.json();
        toast.error(data.error);
      }
    } catch {
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  };

  const downloadReport = () => {
    if (!report) return;
    const data = JSON.stringify(report, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tax-report-${report.taxYear}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (authLoading || !user) {
    return <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><div className="animate-pulse text-slate-400">Loading...</div></div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-2">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Tax Report</h1>
        </div>

        {/* Year selector */}
        <div className="flex gap-3 mb-8 items-center">
          <select
            value={selectedTaxYearId}
            onChange={e => setSelectedTaxYearId(e.target.value)}
            className="input max-w-xs"
          >
            <option value="">Select tax year...</option>
            {taxYears.map((ty: any) => (
              <option key={ty.id} value={ty.id}>{ty.yearLabel}</option>
            ))}
          </select>
          {report && (
            <button onClick={downloadReport} className="btn-secondary py-2 px-3 text-sm">
              <Download size={16} className="mr-1" />
              Export
            </button>
          )}
        </div>

        {loading && <div className="card text-center py-12 text-slate-400">Generating report...</div>}

        {!loading && !report && selectedTaxYearId && (
          <div className="card text-center py-12">
            <BarChart3 className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Data Yet</h3>
            <p className="text-slate-500 mb-4">Upload bank statements to generate your tax report.</p>
            <Link href={`/upload?taxYearId=${selectedTaxYearId}`} className="btn-primary">
              Upload Statements
            </Link>
          </div>
        )}

        {report && (
          <div className="space-y-6">
            {/* Tax savings highlight */}
            {report.taxSaved > 0 && (
              <div className="card bg-gradient-to-r from-accent-500 to-accent-600 text-white border-0">
                <div className="flex items-center gap-4">
                  <TrendingDown size={40} />
                  <div>
                    <div className="text-sm opacity-80">Your Estimated Tax Savings</div>
                    <div className="text-3xl font-bold">{formatZAR(report.taxSaved)}</div>
                    <div className="text-sm opacity-80">
                      Effective rate reduced from {report.effectiveRateWithout.toFixed(1)}% to {report.effectiveRateWith.toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Main numbers */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="card">
                <div className="text-sm text-slate-500 mb-1">Total Income</div>
                <div className="text-xl font-bold">{formatZAR(report.totalIncome)}</div>
                <div className="text-xs text-slate-400">{report.incomeCount} transactions</div>
              </div>
              <div className="card">
                <div className="text-sm text-slate-500 mb-1">Total Deductions</div>
                <div className="text-xl font-bold text-accent-600">{formatZAR(report.totalDeductions)}</div>
                <div className="text-xs text-slate-400">{report.deductibleCount} deductible items</div>
              </div>
              <div className="card">
                <div className="text-sm text-slate-500 mb-1">Taxable Income</div>
                <div className="text-xl font-bold">{formatZAR(report.taxableIncomeWithDeductions)}</div>
                <div className="text-xs text-slate-400">after deductions</div>
              </div>
              <div className="card">
                <div className="text-sm text-slate-500 mb-1">Estimated Tax</div>
                <div className="text-xl font-bold text-brand-600">{formatZAR(report.taxWithDeductions)}</div>
                <div className="text-xs text-slate-400">
                  without deductions: {formatZAR(report.taxWithoutDeductions)}
                </div>
              </div>
            </div>

            {/* Tax comparison */}
            <div className="card">
              <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-brand-600" />
                Tax Comparison
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Tax WITHOUT deductions</span>
                    <span className="font-medium text-red-600">{formatZAR(report.taxWithoutDeductions)}</span>
                  </div>
                  <div className="h-3 bg-red-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-slate-500">Tax WITH deductions</span>
                    <span className="font-medium text-accent-600">{formatZAR(report.taxWithDeductions)}</span>
                  </div>
                  <div className="h-3 bg-accent-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-accent-500 rounded-full"
                      style={{
                        width: `${report.taxWithoutDeductions > 0 ? (report.taxWithDeductions / report.taxWithoutDeductions * 100) : 0}%`,
                      }}
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between text-lg font-semibold">
                    <span>You Save</span>
                    <span className="text-accent-600">{formatZAR(report.taxSaved)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Deduction categories */}
            {Object.keys(report.categoryBreakdown).length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <PieChart size={20} className="text-brand-600" />
                  Deductions by Category
                </h3>
                <div className="space-y-3">
                  {Object.entries(report.categoryBreakdown)
                    .sort(([, a], [, b]) => b.deductible - a.deductible)
                    .map(([category, data]) => (
                      <div key={category} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
                        <div>
                          <div className="font-medium text-sm">{category}</div>
                          <div className="text-xs text-slate-500">{data.count} transactions</div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-accent-600">{formatZAR(data.deductible)}</div>
                          <div className="text-xs text-slate-500">of {formatZAR(data.total)}</div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Monthly income */}
            {Object.keys(report.monthlyIncome).length > 0 && (
              <div className="card">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <BarChart3 size={20} className="text-brand-600" />
                  Monthly Income
                </h3>
                <div className="space-y-2">
                  {Object.entries(report.monthlyIncome)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([month, amount]) => {
                      const maxIncome = Math.max(...Object.values(report.monthlyIncome));
                      return (
                        <div key={month} className="flex items-center gap-3">
                          <span className="text-sm text-slate-500 w-20">{month}</span>
                          <div className="flex-1 h-6 bg-slate-100 dark:bg-slate-700 rounded overflow-hidden">
                            <div
                              className="h-full bg-brand-500 rounded"
                              style={{ width: `${(amount / maxIncome) * 100}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-28 text-right">{formatZAR(amount)}</span>
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            {/* Disclaimer */}
            <div className="card bg-yellow-50 dark:bg-yellow-950/20 border-yellow-200">
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                <strong>Disclaimer:</strong> This report is generated by AI and should be used as guidance only.
                For complex tax matters, please consult a registered tax practitioner.
                All deductions should be supported by valid documentation when filing with SARS.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
