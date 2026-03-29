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
  ChevronDown,
  ChevronUp,
  Shield,
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
  flag: string | null;
  statementMonth: string | null;
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
  const [statementMap, setStatementMap] = useState<Record<string, string>>({});
  const [taxYears, setTaxYears] = useState<any[]>([]);
  const [selectedTaxYearId, setSelectedTaxYearId] = useState(taxYearIdParam || '');
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'income' | 'expense' | 'deductible' | 'review'>('all');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>({});
  const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(new Set());

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
        setStatementMap(data.statementMap || {});
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
    if (filter === 'review') return tx.flag === 'REVIEW' || tx.flag === 'LIKELY';
    return true;
  });

  if (authLoading || !user) {
    return <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center"><div className="animate-pulse text-slate-400">Loading...</div></div>;
  }

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      <section className="bg-gradient-to-b from-brand-800 to-brand-950 text-white py-8">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-3 backdrop-blur-sm">
            <Filter size={16} />
            Transaction Review
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Transactions</h1>
          <p className="text-brand-200 text-sm">Review and adjust AI-categorized transactions</p>
        </div>
      </section>

      <div className="bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
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

          {selectedTaxYearId && (
            <Link
              href={`/checkpoints?taxYearId=${selectedTaxYearId}`}
              className="btn-secondary py-1.5 px-3 text-xs sm:text-sm border-brand-300 text-brand-700 hover:bg-brand-50 flex items-center gap-1.5"
            >
              <Shield size={14} />
              Triple Check
            </Link>
          )}

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {(['all', 'income', 'expense', 'deductible', 'review'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-2.5 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-brand-600 text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
                }`}
              >
                {f === 'all' ? 'All' : f === 'income' ? 'Income' : f === 'expense' ? 'Expenses' : f === 'deductible' ? 'Deductible' : '⚠ Needs Review'}
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
              <div className="font-bold text-brand-600">{formatZAR(summary.totalIncome)}</div>
            </div>
            <div className="card py-3 px-4">
              <div className="text-xs text-slate-500">Expenses</div>
              <div className="font-bold text-red-600">{formatZAR(summary.totalExpenses)}</div>
            </div>
            <div className="card py-3 px-4">
              <div className="text-xs text-slate-500">Deductible</div>
              <div className="font-bold text-brand-600">{formatZAR(summary.totalDeductible)}</div>
            </div>
          </div>
        )}

        {/* Transactions grouped by month */}
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
        ) : (() => {
          // Group transactions by month
          const groups: Record<string, Transaction[]> = {};
          for (const tx of filtered) {
            const key = tx.statementMonth || new Date(tx.date).toISOString().substring(0, 7);
            if (!groups[key]) groups[key] = [];
            groups[key].push(tx);
          }
          const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));

          const toggleMonth = (key: string) => {
            setCollapsedMonths(prev => {
              const next = new Set(prev);
              if (next.has(key)) next.delete(key);
              else next.add(key);
              return next;
            });
          };

          const collapseAll = () => setCollapsedMonths(new Set(sortedKeys));
          const expandAll = () => setCollapsedMonths(new Set());

          return (
            <div className="space-y-3">
              <div className="flex justify-end gap-2">
                <button onClick={expandAll} className="text-xs text-brand-600 hover:underline">Expand all</button>
                <span className="text-xs text-slate-300">|</span>
                <button onClick={collapseAll} className="text-xs text-brand-600 hover:underline">Collapse all</button>
              </div>
              {sortedKeys.map(monthKey => {
                const txs = groups[monthKey];
                const isCollapsed = collapsedMonths.has(monthKey);
                const monthExpenses = txs.filter(t => t.type === 'EXPENSE').reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
                const monthIncome = txs.filter(t => t.type === 'INCOME').reduce((s, t) => s + Math.abs(Number(t.amount)), 0);
                const monthDeductible = txs.filter(t => t.isDeductible).reduce((s, t) => s + Math.abs(Number(t.amount)) * t.deductiblePct / 100, 0);

                return (
                  <div key={monthKey} className="card p-0 overflow-hidden">
                    {/* Month header — clickable */}
                    <button
                      onClick={() => toggleMonth(monthKey)}
                      className="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {isCollapsed ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronUp size={16} className="text-slate-400" />}
                        <span className="font-semibold text-sm">{monthKey}</span>
                        <span className="text-xs text-slate-400">{txs.length} transactions</span>
                        {statementMap[monthKey] && (
                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                            statementMap[monthKey] === 'CREDIT_CARD' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                            statementMap[monthKey] === 'SAVINGS' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' :
                            'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400'
                          }`}>
                            {statementMap[monthKey] === 'CREDIT_CARD' ? 'Credit Card' : statementMap[monthKey] === 'SAVINGS' ? 'Savings' : 'Cheque'}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        {monthIncome > 0 && <span className="text-brand-600">+{formatZAR(monthIncome)}</span>}
                        <span className="text-slate-500">-{formatZAR(monthExpenses)}</span>
                        {monthDeductible > 0 && <span className="text-brand-600 font-medium">Ded: {formatZAR(monthDeductible)}</span>}
                      </div>
                    </button>

                    {/* Transactions table (collapsible) */}
                    {!isCollapsed && (
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-slate-200 dark:border-slate-700">
                              <th className="text-left py-2 px-3 sm:px-4 font-medium text-slate-500 text-xs">Date</th>
                              <th className="text-left py-2 px-3 sm:px-4 font-medium text-slate-500 text-xs">Description</th>
                              <th className="text-right py-2 px-3 sm:px-4 font-medium text-slate-500 text-xs">Amount</th>
                              <th className="text-left py-2 px-3 sm:px-4 font-medium text-slate-500 text-xs hidden sm:table-cell">Category</th>
                              <th className="text-center py-2 px-3 sm:px-4 font-medium text-slate-500 text-xs hidden sm:table-cell">Deductible</th>
                              <th className="text-center py-2 px-3 sm:px-4 font-medium text-slate-500 text-xs">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {txs.map(tx => (
                              <tr key={tx.id} className="border-b border-slate-100 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                                <td className="py-2.5 px-3 sm:px-4 whitespace-nowrap text-slate-500 text-xs">
                                  {new Date(tx.date).toLocaleDateString('en-ZA')}
                                </td>
                                <td className="py-2.5 px-3 sm:px-4 max-w-[150px] sm:max-w-[250px] truncate text-xs sm:text-sm" title={tx.description}>
                                  <div className="flex items-center gap-1.5">
                                    {tx.flag === 'OBVIOUS' && <span className="shrink-0 inline-block w-2 h-2 rounded-full bg-brand-500" title="Obvious deduction" />}
                                    {tx.flag === 'LIKELY' && <span className="shrink-0 inline-block w-2 h-2 rounded-full bg-blue-500" title="Likely deduction" />}
                                    {tx.flag === 'REVIEW' && <span className="shrink-0 inline-block w-2 h-2 rounded-full bg-amber-500" title="Needs review" />}
                                    {tx.flag === 'PERSONAL' && <span className="shrink-0 inline-block w-2 h-2 rounded-full bg-slate-300" title="Personal expense" />}
                                    <span className="truncate">{tx.description}</span>
                                  </div>
                                  {tx.notes && (
                                    <div className="text-xs text-slate-400 truncate">{tx.notes}</div>
                                  )}
                                </td>
                                <td className={`py-2.5 px-3 sm:px-4 text-right font-medium whitespace-nowrap text-xs sm:text-sm ${
                                  tx.type === 'INCOME' ? 'text-brand-600' : 'text-slate-900 dark:text-slate-100'
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
                                    <span className="inline-flex items-center gap-1 text-xs text-brand-600">
                                      <CheckCircle size={14} />
                                      {tx.deductiblePct}%
                                    </span>
                                  ) : (
                                    <XCircle size={14} className="mx-auto text-slate-300" />
                                  )}
                                </td>
                                <td className="py-2.5 px-3 sm:px-4 text-center">
                                  {editingId === tx.id ? (
                                    <button onClick={saveEdit} className="text-brand-600 hover:text-brand-700">
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
                );
              })}
            </div>
          );
        })()}
      </div>
      </div>
    </div>
  );
}
