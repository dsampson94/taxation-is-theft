'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import { ArrowLeft, Search, Calendar, Tag, DollarSign } from 'lucide-react';

const formatZAR = (amount: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' });

interface SearchResult {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string | null;
  userCategory: string | null;
  isDeductible: boolean;
  deductiblePct: number;
  notes: string | null;
  flag: string | null;
  statementMonth: string | null;
  taxYear: { yearLabel: string } | null;
}

interface SearchSummary {
  total: number;
  totalAmount: number;
  incomeCount: number;
  expenseCount: number;
  incomeTotal: number;
  expenseTotal: number;
}

export default function SearchPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [summary, setSummary] = useState<SearchSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [taxYears, setTaxYears] = useState<{ id: string; yearLabel: string }[]>([]);
  const [selectedTaxYear, setSelectedTaxYear] = useState('');

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchTaxYears();
  }, [user]);

  const fetchTaxYears = async () => {
    try {
      const res = await fetch('/api/tax-years');
      if (res.ok) {
        const data = await res.json();
        setTaxYears(data.taxYears || []);
      }
    } catch {
      // silent
    }
  };

  const doSearch = useCallback(async () => {
    if (!query.trim() || query.trim().length < 2) {
      toast.error('Enter at least 2 characters to search');
      return;
    }

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams({ q: query.trim() });
      if (selectedTaxYear) params.set('taxYearId', selectedTaxYear);

      const res = await fetch(`/api/transactions/search?${params}`);
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || 'Search failed');
        return;
      }
      const data = await res.json();
      setResults(data.results);
      setSummary(data.summary);
    } catch {
      toast.error('Search failed');
    } finally {
      setLoading(false);
    }
  }, [query, selectedTaxYear]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') doSearch();
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
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 mb-4"
          >
            <ArrowLeft size={16} />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
            Search Bank Statements
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Search through all your parsed transactions by vendor name, description, category, or notes.
          </p>
        </div>

        {/* Search controls */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-700 dark:bg-slate-900 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search transactions… e.g. &quot;Jeff Meyer&quot;, &quot;Woolworths&quot;, &quot;medical&quot;"
                className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500"
                autoFocus
              />
            </div>

            {taxYears.length > 1 && (
              <select
                value={selectedTaxYear}
                onChange={(e) => setSelectedTaxYear(e.target.value)}
                className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200"
              >
                <option value="">All tax years</option>
                {taxYears.map((ty) => (
                  <option key={ty.id} value={ty.id}>
                    {ty.yearLabel}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={doSearch}
              disabled={loading || query.trim().length < 2}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <Search size={16} />
              )}
              Search
            </button>
          </div>
        </div>

        {/* Summary */}
        {summary && searched && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Matches</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{summary.total}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-xs font-medium text-slate-500 dark:text-slate-400">Total Amount</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{formatZAR(summary.totalAmount)}</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-xs font-medium text-green-600">Income</div>
              <div className="text-xl font-bold text-green-600">{formatZAR(summary.incomeTotal)}</div>
              <div className="text-xs text-slate-400">{summary.incomeCount} transactions</div>
            </div>
            <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
              <div className="text-xs font-medium text-red-500">Expenses</div>
              <div className="text-xl font-bold text-red-500">{formatZAR(summary.expenseTotal)}</div>
              <div className="text-xs text-slate-400">{summary.expenseCount} transactions</div>
            </div>
          </div>
        )}

        {/* Results */}
        {searched && !loading && results.length === 0 && (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center dark:border-slate-700 dark:bg-slate-900">
            <Search size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-slate-500 dark:text-slate-400">
              No transactions found matching &quot;{query}&quot;
            </p>
            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
              Try different keywords — bank statements use abbreviated vendor names
            </p>
          </div>
        )}

        {results.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900 overflow-hidden">
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {results.map((tx) => (
                <div
                  key={tx.id}
                  className="flex items-start gap-4 px-5 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  {/* Amount indicator */}
                  <div className="flex-shrink-0 pt-0.5">
                    <div
                      className={`flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold ${
                        tx.type === 'INCOME'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : tx.type === 'EXPENSE'
                          ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      <DollarSign size={16} />
                    </div>
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {tx.description}
                    </p>
                    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                      <span className="inline-flex items-center gap-1">
                        <Calendar size={12} />
                        {formatDate(tx.date)}
                      </span>
                      {(tx.userCategory || tx.category) && (
                        <span className="inline-flex items-center gap-1">
                          <Tag size={12} />
                          {tx.userCategory || tx.category}
                        </span>
                      )}
                      {tx.taxYear && (
                        <span className="text-slate-400 dark:text-slate-500">
                          {tx.taxYear.yearLabel}
                        </span>
                      )}
                      {tx.isDeductible && (
                        <span className="rounded bg-brand-100 px-1.5 py-0.5 text-[10px] font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-400">
                          {tx.deductiblePct}% DEDUCTIBLE
                        </span>
                      )}
                      {tx.flag && (
                        <span
                          className={`h-2 w-2 rounded-full ${
                            tx.flag === 'OBVIOUS'
                              ? 'bg-green-500'
                              : tx.flag === 'LIKELY'
                              ? 'bg-blue-500'
                              : tx.flag === 'REVIEW'
                              ? 'bg-amber-500'
                              : 'bg-slate-400'
                          }`}
                          title={tx.flag}
                        />
                      )}
                    </div>
                    {tx.notes && (
                      <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 italic truncate">
                        {tx.notes}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="flex-shrink-0 text-right">
                    <span
                      className={`text-sm font-semibold ${
                        tx.type === 'INCOME'
                          ? 'text-green-600 dark:text-green-400'
                          : tx.type === 'EXPENSE'
                          ? 'text-red-500 dark:text-red-400'
                          : 'text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {tx.type === 'INCOME' ? '+' : tx.type === 'EXPENSE' ? '-' : ''}
                      {formatZAR(Math.abs(Number(tx.amount)))}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {results.length >= 200 && (
              <div className="border-t border-slate-100 dark:border-slate-800 px-5 py-3 text-center text-xs text-slate-400">
                Showing first 200 results — refine your search for more specific matches
              </div>
            )}
          </div>
        )}

        {/* Help text */}
        {!searched && (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-900">
            <Search size={40} className="mx-auto text-slate-300 dark:text-slate-600 mb-3" />
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Search across all your uploaded bank statements
            </p>
            <p className="mt-2 text-xs text-slate-400 dark:text-slate-500">
              Find specific vendors, payments, or expense types. Try searching for a business name,
              payment reference, or category like &quot;medical&quot; or &quot;office&quot;.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
