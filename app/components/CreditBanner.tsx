'use client';

import Link from 'next/link';
import { CreditCard, AlertTriangle, Zap, Sparkles, X } from 'lucide-react';
import { CREDIT_PLANS } from '@/app/lib/pricing';

/** Banner shown on dashboard when credits are low or zero */
export function CreditBanner({ credits }: { credits: number }) {
  if (credits > 2) return null;

  if (credits === 0) {
    return (
      <div className="mb-6 rounded-xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/30 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
          <div className="flex items-center gap-2 text-red-700 dark:text-red-400">
            <AlertTriangle size={20} />
            <span className="font-semibold">No credits remaining</span>
          </div>
          <p className="text-sm text-red-600 dark:text-red-300 flex-1">
            You&apos;ve used all your analysis credits. Purchase more to continue analyzing bank statements.
          </p>
          <Link href="/pricing" className="btn-primary shrink-0 !bg-red-600 hover:!bg-red-700">
            <CreditCard size={16} className="mr-2" />
            Buy Credits
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30 p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
          <AlertTriangle size={20} />
          <span className="font-semibold">Running low — {credits} credit{credits !== 1 ? 's' : ''} left</span>
        </div>
        <p className="text-sm text-amber-600 dark:text-amber-300 flex-1">
          Each statement analysis uses 1 credit. Top up to keep your tax year analysis going.
        </p>
        <Link href="/pricing" className="btn-secondary shrink-0 !border-amber-400 !text-amber-700 hover:!bg-amber-100">
          <CreditCard size={16} className="mr-2" />
          Top Up
        </Link>
      </div>
    </div>
  );
}

/** Inline credit chip shown after each analysis */
export function CreditChip({ credits, creditCharged, isReanalysis, isAdmin, qualityWarning }: {
  credits: number;
  creditCharged: boolean;
  isReanalysis: boolean;
  isAdmin: boolean;
  qualityWarning?: string | null;
}) {
  if (qualityWarning) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg px-3 py-2">
        <AlertTriangle size={14} />
        <span>No credit charged — {qualityWarning}</span>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/30 rounded-lg px-3 py-2">
        <Sparkles size={14} />
        <span>Admin mode — no credit charged</span>
      </div>
    );
  }

  if (isReanalysis) {
    return (
      <div className="mt-2 flex items-center gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 rounded-lg px-3 py-2">
        <Zap size={14} />
        <span>Free re-analysis — no credit charged</span>
      </div>
    );
  }

  return (
    <div className={`mt-2 flex items-center gap-2 text-xs rounded-lg px-3 py-2 ${
      credits <= 2
        ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30'
        : 'text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800'
    }`}>
      <CreditCard size={14} />
      <span>{credits} credit{credits !== 1 ? 's' : ''} remaining</span>
      {credits <= 2 && credits > 0 && (
        <Link href="/pricing" className="font-medium underline ml-1">Top up</Link>
      )}
      {credits === 0 && (
        <Link href="/pricing" className="font-semibold underline text-red-600 ml-1">Buy more</Link>
      )}
    </div>
  );
}

/** Full-screen modal overlay shown when analysis returns 403 (no credits) */
export function NoCreditModal({ onClose }: { onClose: () => void }) {
  const plans = CREDIT_PLANS.filter(p => !('isTopUp' in p && p.isTopUp));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
        >
          <X size={20} />
        </button>

        <div className="text-center mb-6">
          <div className="mx-auto w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mb-3">
            <CreditCard size={24} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white">Out of Credits</h3>
          <p className="text-sm text-slate-500 mt-1">
            Purchase credits to continue analyzing your bank statements
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {plans.map(plan => (
            <Link
              key={plan.id}
              href="/pricing"
              className={`block rounded-xl border p-4 transition-all hover:shadow-md ${
                plan.popular
                  ? 'border-brand-500 bg-brand-50 dark:bg-brand-950/20 ring-2 ring-brand-500/20'
                  : 'border-slate-200 dark:border-slate-700 hover:border-brand-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{plan.name}</span>
                    {plan.popular && (
                      <span className="text-[10px] font-bold bg-brand-600 text-white px-1.5 py-0.5 rounded-full">BEST VALUE</span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {plan.credits} analyses • R{plan.pricePerCredit.toFixed(2)} each
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold">R{plan.priceZAR}</div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <p className="text-center text-xs text-slate-400">
          Every plan includes smart AI context, free re-analysis, review tools & supporting docs.
        </p>
      </div>
    </div>
  );
}
