'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Edit3,
  Save,
  Filter,
} from 'lucide-react';
import { ZA_EXPENSE_CATEGORIES } from '@/app/lib/tax-rates-za';

const formatZAR = (amount: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount);

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: string;
  category: string | null;
  userCategory: string | null;
  isDeductible: boolean;
  deductiblePct: number;
  confidence: number | null;
  notes: string | null;
  bankName: string | null;
  userOverride: boolean;
}

export default function TransactionsPage() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><div className="animate-pulse text-slate-400">Loading...</div></div>}>
      <TransactionsContent />
    </Suspense>
  );
}

function TransactionsContent() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const taxYearIdParam = searchParams.get('taxYearId');

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [taxYears, setTaxYears] = useState<any[]>([]);
  const [selectedTaxYearId, setSelectedTaxYearId] = useState(taxYearIdParam || '');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'deductible'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchTaxYears();
  }, [user]);

  useEffect(() => {
    if (selectedTaxYearId) fetchTransactions(selectedTaxYearId);
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

  const fetchTransactions = async (tyId: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/transactions?taxYearId=${tyId}`);
      if (res.ok) {
        const data = await res.json();
        setTransactions(data.transactions);
        setSummary(data.summary);
      }
    } catch {
      toast.error('Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (tx: Transaction) => {
    setEditingId(tx.id);
    setEditData({
      category: tx.userCategory || tx.category || '',
      isDeductible: tx.isDeductible,
      deductiblePct: tx.deductiblePct,
      notes: tx.notes || '',
    });
  };

  const saveEdit = async () => {
    if (!editingId) return;
    try {
      const res = await fetch('/api/transactions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId, ...editData }),
      });
      if (res.ok) {
        toast.success('Transaction updated');
        setEditingId(null);
        fetchTransactions(selectedTaxYearId);
      }
    } catch {
      toast.error('Failed to update');
    }
  };

  const filtered = transactions.filter(tx => {
    if (filter === 'income') return tx.type === 'INCOME';
    if (filter === 'expense') return tx.type === 'EXPENSE';
    if (filter === 'deductible') return tx.isDeductible;
    return true;
  });

  if (authLoading || !user) {
    return <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><div className="animate-pulse text-slate-400">Loading...</div></div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-slate-400 hover:text-slate-600">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
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

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(['all', 'income', 'expense', 'deductible'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {f === 'all' ? 'All' : f === 'income' ? 'Income' : f === 'expense' ? 'Expenses' : 'Deductible'}
              </button>
            ))}
          </div>
        </div>

        {/* Summary bar */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
            <div className="card py-3 px-4">
              <div className="text-xs text-slate-500">Total</div>
              <div className="font-bold">{summary.transactionCount}</div>
            </div>
            <div className="card py-3 px-4">
              <div className="text-xs text-slate-500">Income</div>
              <div className="font-bold text-accent-600">{formatZAR(summary.totalIncome)}</div>
            </div>
            <div className="card py-3 px-4">
              <div className="text-xs text-slate-500">Expenses</div>
              <div className="font-bold text-red-600">{formatZAR(summary.totalExpenses)}</div>
            </div>
            <div className="card py-3 px-4">
              <div className="text-xs text-slate-500">Deductible</div>
              <div className="font-bold text-accent-600">{formatZAR(summary.totalDeductible)}</div>
            </div>
          </div>
        )}

        {/* Transactions table */}
        {loading ? (
          <div className="card text-center py-12 text-slate-400">Loading transactions...</div>
        ) : filtered.length === 0 ? (
          <div className="card text-center py-12">
            <Filter className="mx-auto text-slate-300 mb-4" size={48} />
            <h3 className="text-lg font-semibold mb-2">No Transactions</h3>
            <p className="text-slate-500 mb-4">Upload bank statements to see your transactions.</p>
            <Link href={`/upload?taxYearId=${selectedTaxYearId}`} className="btn-primary">
              Upload Statements
            </Link>
          </div>
        ) : (
          <div className="card overflow-x-auto p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  <th className="text-left py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs sm:text-sm">Date</th>
                  <th className="text-left py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs sm:text-sm">Description</th>
                  <th className="text-right py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs sm:text-sm">Amount</th>
                  <th className="text-left py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs sm:text-sm hidden sm:table-cell">Category</th>
                  <th className="text-center py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs sm:text-sm hidden sm:table-cell">Deductible</th>
                  <th className="text-center py-3 px-3 sm:px-4 font-medium text-slate-500 text-xs sm:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(tx => (
                  <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap text-slate-500 text-xs sm:text-sm">
                      {new Date(tx.date).toLocaleDateString('en-ZA')}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 max-w-[150px] sm:max-w-[250px] truncate text-xs sm:text-sm" title={tx.description}>
                      {tx.description}
                      {tx.notes && (
                        <div className="text-xs text-slate-400 truncate">{tx.notes}</div>
                      )}
                    </td>
                    <td className={`py-2.5 px-3 sm:px-4 text-right font-medium whitespace-nowrap text-xs sm:text-sm ${
                      tx.type === 'INCOME' ? 'text-accent-600' : 'text-slate-900 dark:text-slate-100'
                    }`}>
                      {tx.type === 'INCOME' ? '+' : '-'}{formatZAR(Math.abs(Number(tx.amount)))}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 hidden sm:table-cell">
                      {editingId === tx.id ? (
                        <select
                          value={editData.category}
                          onChange={e => setEditData({ ...editData, category: e.target.value })}
                          className="input py-1 px-2 text-xs"
                        >
                          {Object.keys(ZA_EXPENSE_CATEGORIES).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      ) : (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                          {tx.userCategory || tx.category || '—'}
                          {tx.userOverride && <span className="text-brand-500 ml-1">✎</span>}
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center hidden sm:table-cell">
                      {editingId === tx.id ? (
                        <div className="flex items-center justify-center gap-2">
                          <input
                            type="checkbox"
                            checked={editData.isDeductible}
                            onChange={e => setEditData({ ...editData, isDeductible: e.target.checked })}
                          />
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={editData.deductiblePct}
                            onChange={e => setEditData({ ...editData, deductiblePct: parseInt(e.target.value) || 0 })}
                            className="input py-0.5 px-1 text-xs w-14"
                          />%
                        </div>
                      ) : tx.isDeductible ? (
                        <span className="inline-flex items-center gap-1 text-xs text-accent-600">
                          <CheckCircle size={14} />
                          {tx.deductiblePct}%
                        </span>
                      ) : (
                        <XCircle size={14} className="mx-auto text-slate-300" />
                      )}
                    </td>
                    <td className="py-2.5 px-3 sm:px-4 text-center">
                      {editingId === tx.id ? (
                        <button onClick={saveEdit} className="text-accent-600 hover:text-accent-700">
                          <Save size={16} />
                        </button>
                      ) : (
                        <button onClick={() => startEdit(tx)} className="text-slate-400 hover:text-brand-600">
                          <Edit3 size={16} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
