'use client';

import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  Users,
  CreditCard,
  FileText,
  Upload,
  TrendingUp,
  BarChart3,
  DollarSign,
  Activity,
  RefreshCw,
  Coins,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';

interface Stats {
  overview: {
    totalUsers: number;
    usersWithProfile: number;
    profileCompletionRate: number;
    totalTransactions: number;
    totalStatements: number;
    totalPayments: number;
    totalRevenue: number;
    totalCreditsInCirculation: number;
    avgCreditsPerUser: string;
  };
  growth: {
    today: number;
    thisWeek: number;
    thisMonth: number;
  };
  topOccupations: { occupation: string; count: number }[];
  employmentBreakdown: { type: string; count: number }[];
  planBreakdown: { plan: string; count: number }[];
  deductibles: { count: number; totalAmount: number };
  statementsPerMonth: { month: string; count: number }[];
  recentUsers: {
    id: string;
    email: string;
    name: string | null;
    occupation: string | null;
    credits: number;
    taxProfileComplete: boolean;
    createdAt: string;
    _count: { transactions: number; statements: number; payments: number };
  }[];
  recentPayments: {
    id: string;
    amount: number;
    status: string;
    creditsPurchased: number | null;
    createdAt: string;
    user: { email: string; name: string | null };
  }[];
}

const formatZAR = (n: number) =>
  new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(n);

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString('en-ZA', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function AdminPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [grantUserId, setGrantUserId] = useState('');
  const [grantCredits, setGrantCredits] = useState('');
  const [granting, setGranting] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/stats');
      if (res.status === 403) {
        setError('Access denied. Admin only.');
        return;
      }
      if (!res.ok) throw new Error('Failed to load');
      setStats(await res.json());
      setError('');
    } catch {
      setError('Failed to load admin stats');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && !user) router.push('/login');
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) fetchStats();
  }, [user, fetchStats]);

  const handleGrantCredits = async () => {
    if (!grantUserId || !grantCredits) return;
    setGranting(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: grantUserId, credits: parseInt(grantCredits) }),
      });
      if (res.ok) {
        setGrantUserId('');
        setGrantCredits('');
        fetchStats();
      }
    } finally {
      setGranting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <RefreshCw className="h-8 w-8 animate-spin text-brand-600" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center dark:border-red-800 dark:bg-red-950">
          <ShieldCheck className="mx-auto h-12 w-12 text-red-500" />
          <h1 className="mt-4 text-xl font-bold text-red-700 dark:text-red-400">{error}</h1>
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const s = stats.overview;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
              Admin Dashboard
            </h1>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              System overview & metrics
            </p>
          </div>
          <button
            onClick={fetchStats}
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* KPI Cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <KPICard icon={Users} label="Users" value={s.totalUsers} color="blue" />
          <KPICard icon={FileText} label="Transactions" value={s.totalTransactions.toLocaleString()} color="green" />
          <KPICard icon={Upload} label="Statements" value={s.totalStatements} color="purple" />
          <KPICard icon={CreditCard} label="Payments" value={s.totalPayments} color="amber" />
          <KPICard icon={DollarSign} label="Revenue" value={formatZAR(s.totalRevenue)} color="emerald" />
          <KPICard icon={Coins} label="Credits Out" value={s.totalCreditsInCirculation} color="orange" />
        </div>

        {/* Growth + Funnel Row */}
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {/* User Growth */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <TrendingUp className="h-5 w-5 text-green-500" />
              User Growth
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Today</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.growth.today}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">This Week</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.growth.thisWeek}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">This Month</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.growth.thisMonth}</span>
              </div>
            </div>
          </div>

          {/* Conversion Funnel */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <Activity className="h-5 w-5 text-brand-500" />
              Funnel
            </h2>
            <div className="space-y-3">
              <FunnelRow label="Registered" value={s.totalUsers} total={s.totalUsers} />
              <FunnelRow label="Profile Complete" value={s.usersWithProfile} total={s.totalUsers} />
              <FunnelRow label="Uploaded ≥1" value={stats.recentUsers.filter(u => u._count.statements > 0).length} total={s.totalUsers} note="(of last 20)" />
              <FunnelRow label="Paid" value={stats.recentUsers.filter(u => u._count.payments > 0).length} total={s.totalUsers} note="(of last 20)" />
            </div>
          </div>

          {/* Deductible Impact */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-white">
              <BarChart3 className="h-5 w-5 text-emerald-500" />
              AI Performance
            </h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Deductible Txns</span>
                <span className="font-bold text-slate-900 dark:text-white">{stats.deductibles.count.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Total Deductible Value</span>
                <span className="font-bold text-emerald-600">{formatZAR(stats.deductibles.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Avg Credits/User</span>
                <span className="font-bold text-slate-900 dark:text-white">{s.avgCreditsPerUser}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Profile Rate</span>
                <span className="font-bold text-slate-900 dark:text-white">{s.profileCompletionRate}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Row: Occupations + Employment + Plan + Statements/Month */}
        <div className="mb-8 grid gap-6 lg:grid-cols-4">
          {/* Top Occupations */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Briefcase className="h-4 w-4" />
              Top Occupations
            </h2>
            <div className="space-y-2">
              {stats.topOccupations.map((o, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="truncate text-slate-700 dark:text-slate-300">{o.occupation}</span>
                  <span className="ml-2 font-mono font-bold text-slate-900 dark:text-white">{o.count}</span>
                </div>
              ))}
              {stats.topOccupations.length === 0 && (
                <p className="text-sm text-slate-400">No data yet</p>
              )}
            </div>
          </div>

          {/* Employment Types */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Employment Split
            </h2>
            <div className="space-y-2">
              {stats.employmentBreakdown.map((e, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{e.type}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{e.count}</span>
                </div>
              ))}
              {stats.employmentBreakdown.length === 0 && (
                <p className="text-sm text-slate-400">No data yet</p>
              )}
            </div>
          </div>

          {/* Plan Breakdown */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Plan Breakdown
            </h2>
            <div className="space-y-2">
              {stats.planBreakdown.map((p, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{p.plan}</span>
                  <span className="font-mono font-bold text-slate-900 dark:text-white">{p.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Statements Per Month */}
          <div className="rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
            <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              Statements/Month
            </h2>
            <div className="space-y-2">
              {stats.statementsPerMonth.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300">{s.month}</span>
                  <div className="flex items-center gap-2">
                    <div
                      className="h-2 rounded-full bg-brand-500"
                      style={{ width: `${Math.min(100, s.count * 5)}px` }}
                    />
                    <span className="font-mono font-bold text-slate-900 dark:text-white">{s.count}</span>
                  </div>
                </div>
              ))}
              {stats.statementsPerMonth.length === 0 && (
                <p className="text-sm text-slate-400">No data yet</p>
              )}
            </div>
          </div>
        </div>

        {/* Grant Credits */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white p-6 dark:border-slate-700 dark:bg-slate-900">
          <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Grant Credits</h2>
          <div className="flex flex-wrap items-end gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">User ID</label>
              <input
                value={grantUserId}
                onChange={e => setGrantUserId(e.target.value)}
                className="mt-1 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="clxyz123..."
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-500 dark:text-slate-400">Set Credits To</label>
              <input
                type="number"
                min="0"
                value={grantCredits}
                onChange={e => setGrantCredits(e.target.value)}
                className="mt-1 w-24 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                placeholder="24"
              />
            </div>
            <button
              onClick={handleGrantCredits}
              disabled={granting || !grantUserId || !grantCredits}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:opacity-50"
            >
              {granting ? 'Updating...' : 'Set Credits'}
            </button>
          </div>
        </div>

        {/* Recent Users Table */}
        <div className="mb-8 rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-6 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Users</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Occupation</th>
                  <th className="px-6 py-3 text-center">Credits</th>
                  <th className="px-6 py-3 text-center">Profile</th>
                  <th className="px-6 py-3 text-center">Stmts</th>
                  <th className="px-6 py-3 text-center">Txns</th>
                  <th className="px-6 py-3">Joined</th>
                  <th className="px-6 py-3">ID</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentUsers.map(u => (
                  <tr key={u.id} className="border-b border-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{u.name || '—'}</div>
                      <div className="text-xs text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{u.occupation || '—'}</td>
                    <td className="px-6 py-3 text-center">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        u.credits > 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-500'
                      }`}>
                        {u.credits}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      {u.taxProfileComplete ? (
                        <span className="text-green-500">&#10003;</span>
                      ) : (
                        <span className="text-slate-300">&#10007;</span>
                      )}
                    </td>
                    <td className="px-6 py-3 text-center font-mono text-slate-700 dark:text-slate-300">{u._count.statements}</td>
                    <td className="px-6 py-3 text-center font-mono text-slate-700 dark:text-slate-300">{u._count.transactions}</td>
                    <td className="px-6 py-3 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                    <td className="px-6 py-3">
                      <button
                        onClick={() => setGrantUserId(u.id)}
                        className="font-mono text-xs text-brand-600 hover:underline dark:text-brand-400"
                        title="Click to use in Grant Credits"
                      >
                        {u.id.slice(0, 10)}...
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Payments */}
        <div className="rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <div className="border-b border-slate-200 p-6 dark:border-slate-700">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Recent Payments</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wide text-slate-500 dark:border-slate-800 dark:text-slate-400">
                  <th className="px-6 py-3">User</th>
                  <th className="px-6 py-3">Amount</th>
                  <th className="px-6 py-3">Credits</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentPayments.map(p => (
                  <tr key={p.id} className="border-b border-slate-50 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
                    <td className="px-6 py-3">
                      <div className="font-medium text-slate-900 dark:text-white">{p.user.name || '—'}</div>
                      <div className="text-xs text-slate-500">{p.user.email}</div>
                    </td>
                    <td className="px-6 py-3 font-bold text-slate-900 dark:text-white">{formatZAR(Number(p.amount))}</td>
                    <td className="px-6 py-3 text-slate-600 dark:text-slate-400">{p.creditsPurchased || '—'}</td>
                    <td className="px-6 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-bold ${
                        p.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                        p.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' :
                        'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {p.status}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-xs text-slate-500">{formatDate(p.createdAt)}</td>
                  </tr>
                ))}
                {stats.recentPayments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">No payments yet</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-components ─────────────────────────────────────
function KPICard({ icon: Icon, label, value, color }: { icon: any; label: string; value: string | number; color: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-50 text-blue-600 dark:bg-blue-950/30 dark:text-blue-400',
    green: 'bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400',
    purple: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
    amber: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    emerald: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400',
    orange: 'bg-orange-50 text-orange-600 dark:bg-orange-950/30 dark:text-orange-400',
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className={`mb-2 inline-flex rounded-lg p-2 ${colors[color]}`}>
        <Icon className="h-4 w-4" />
      </div>
      <div className="text-2xl font-black text-slate-900 dark:text-white">{value}</div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

function FunnelRow({ label, value, total, note }: { label: string; value: number; total: number; note?: string }) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="flex justify-between text-sm">
        <span className="text-slate-600 dark:text-slate-400">
          {label} {note && <span className="text-xs text-slate-400">{note}</span>}
        </span>
        <span className="font-bold text-slate-900 dark:text-white">{value} <span className="text-xs font-normal text-slate-400">({pct}%)</span></span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
        <div className="h-full rounded-full bg-brand-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
