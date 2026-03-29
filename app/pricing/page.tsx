'use client';

import { useState } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  Check,
  Zap,
  Crown,
  Sparkles,
  Plus,
  ArrowRight,
  Shield,
  CreditCard,
  Lock,
  FileText,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { CREDIT_PLANS } from '@/app/lib/pricing';

// Map plan IDs to display config
const PLAN_UI: Record<string, { icon: any; color: string; btnClass: string; badge?: string }> = {
  starter: {
    icon: Zap,
    color: 'border-slate-200 dark:border-slate-700',
    btnClass: 'btn-secondary',
  },
  'tax-year': {
    icon: Crown,
    color: 'border-brand-500 ring-2 ring-brand-500/20',
    btnClass: 'btn-primary',
    badge: 'BEST VALUE',
  },
  'full-coverage': {
    icon: Sparkles,
    color: 'border-slate-200 dark:border-slate-700',
    btnClass: 'btn-primary',
    badge: 'SAVE 37%',
  },
  'topup-6': {
    icon: Plus,
    color: 'border-slate-200 dark:border-slate-700',
    btnClass: 'btn-secondary',
  },
};

const MAIN_PLANS = CREDIT_PLANS.filter(p => !('isTopUp' in p && p.isTopUp));
const TOPUP_PLAN = CREDIT_PLANS.find(p => 'isTopUp' in p && p.isTopUp);

export default function PricingPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (planId: string) => {
    if (!user) {
      router.push('/register');
      return;
    }

    setLoading(planId);
    try {
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Payment initiation failed');
      }

      const data = await res.json();

      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.formData) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = data.formAction;
        Object.entries(data.formData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = String(value);
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)]">
      {/* Hero */}
      <section className="bg-gradient-to-b from-brand-800 via-brand-700 to-brand-900 text-white py-16">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-6 backdrop-blur-sm">
            <Shield size={16} />
            SARS Compliant Tax Assistance
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-lg text-brand-100 max-w-2xl mx-auto mb-2">
            Pay per statement. No subscriptions. No feature gates.<br />
            Every plan includes the full AI-powered tax experience.
          </p>
          {user && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-lg px-4 py-2 text-sm">
              <CreditCard size={16} />
              You have <span className="font-bold">{user.credits}</span> credits remaining
            </div>
          )}
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 bg-slate-50 dark:bg-slate-950">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {MAIN_PLANS.map(plan => {
              const ui = PLAN_UI[plan.id] || PLAN_UI.starter;
              const Icon = ui.icon;
              const isPopular = plan.popular;
              return (
                <div
                  key={plan.id}
                  className={`card relative ${ui.color} ${isPopular ? 'scale-[1.02]' : ''}`}
                >
                  {ui.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-600 text-white text-xs font-bold px-3 py-1 rounded-full">
                      {ui.badge}
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <Icon className={`mx-auto mb-3 ${isPopular ? 'text-brand-600' : 'text-slate-400'}`} size={32} />
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-slate-500">R</span>
                      <span className="text-4xl font-bold">{plan.priceZAR}</span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {plan.credits} {plan.credits as number === 1 ? 'analysis' : 'analyses'} &bull; R{plan.pricePerCredit.toFixed(2)} each
                    </div>
                  </div>

                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-brand-600 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={loading === plan.id}
                    className={`${ui.btnClass} w-full`}
                  >
                    {loading === plan.id ? 'Processing...' : `Buy ${plan.credits} Analyses`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Top-up option */}
          {TOPUP_PLAN && (
            <div className="card border-dashed border-2 border-slate-300 dark:border-slate-600 mb-12 max-w-md mx-auto">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center shrink-0">
                  <Plus className="text-brand-600" size={24} />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold">{TOPUP_PLAN.name}</h3>
                  <p className="text-sm text-slate-500">{TOPUP_PLAN.description}</p>
                  <p className="text-sm font-semibold mt-1">R{TOPUP_PLAN.priceZAR} &bull; {TOPUP_PLAN.credits} credits &bull; R{TOPUP_PLAN.pricePerCredit.toFixed(2)} each</p>
                </div>
                <button
                  onClick={() => handlePurchase(TOPUP_PLAN.id)}
                  disabled={loading === TOPUP_PLAN.id}
                  className="btn-secondary whitespace-nowrap"
                >
                  {loading === TOPUP_PLAN.id ? '...' : 'Top Up'}
                </button>
              </div>
            </div>
          )}

          {/* What's included callout */}
          <div className="card bg-gradient-to-r from-brand-50 to-blue-50 dark:from-brand-950/30 dark:to-blue-950/30 border-brand-200 dark:border-brand-800 mb-8">
            <div className="text-center mb-6">
              <h3 className="text-lg font-bold mb-2">Every plan includes the full experience</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                No feature gates, no upsells. Buy credits and get everything.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-3xl mx-auto">
              <div className="flex items-start gap-2 text-sm">
                <Brain size={16} className="text-brand-600 mt-0.5 shrink-0" />
                <span>Smart AI context that learns your spending patterns</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <RefreshCw size={16} className="text-brand-600 mt-0.5 shrink-0" />
                <span>Free re-analysis of already-uploaded months</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <FileText size={16} className="text-brand-600 mt-0.5 shrink-0" />
                <span>Tax checkpoints &amp; SARS-ready supporting docs</span>
              </div>
              <div className="flex items-start gap-2 text-sm">
                <Shield size={16} className="text-brand-600 mt-0.5 shrink-0" />
                <span>AES-256 encryption — your data stays private</span>
              </div>
            </div>
          </div>

          {/* Cost comparison */}
          <div className="card border-brand-200 dark:border-brand-800 mb-8">
            <div className="text-center">
              <h3 className="text-lg font-bold mb-2">Why are we so much cheaper than a tax practitioner?</h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
                A registered tax consultant charges <strong>R2,000–R5,000+</strong> to prepare your return.
                TIT gives you detailed, AI-powered deduction analysis for a full tax year at <strong>R330</strong> — that&apos;s
                up to <strong>90% less</strong>. Our AI costs us less than R2 per analysis, so we pass the savings to you.
              </p>
            </div>
          </div>

          {/* Free tier note */}
          <div className="text-center">
            <p className="text-slate-500 text-sm">
              New accounts include <span className="font-semibold">1 free trial analysis</span> to try before you buy.
              <br />
              <Link href="/register" className="text-brand-600 font-medium hover:underline">
                Create a free account
              </Link>
              {' '}to get started.
            </p>
          </div>
        </div>
      </section>

      {/* Trust signals */}
      <section className="py-12 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 text-center">
            <div>
              <Shield className="mx-auto text-brand-600 mb-2" size={28} />
              <h4 className="font-semibold mb-1">Secure Payments</h4>
              <p className="text-sm text-slate-500">PayFast — South Africa&apos;s trusted payment gateway. Card, EFT, SnapScan.</p>
            </div>
            <div>
              <Lock className="mx-auto text-brand-600 mb-2" size={28} />
              <h4 className="font-semibold mb-1">Your Data is Encrypted</h4>
              <p className="text-sm text-slate-500">AES-256 encryption at rest. Bank statements processed in memory and never stored.</p>
            </div>
            <div>
              <FileText className="mx-auto text-brand-600 mb-2" size={28} />
              <h4 className="font-semibold mb-1">No Subscriptions</h4>
              <p className="text-sm text-slate-500">Buy analysis credits when you need them. They never expire. No recurring charges.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
