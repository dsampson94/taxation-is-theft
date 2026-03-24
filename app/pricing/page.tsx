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
  FileText,
  ArrowRight,
  Shield,
  CreditCard,
} from 'lucide-react';

const PLANS = [
  {
    id: 'starter',
    name: 'Starter',
    credits: 5,
    price: 69,
    perCredit: '13.80',
    popular: false,
    icon: Zap,
    color: 'border-slate-200',
    btnClass: 'btn-secondary',
    description: 'Perfect for trying it out',
    features: [
      '5 statement analyses',
      'AI transaction categorization',
      'Basic tax report',
      'Deduction identification',
    ],
  },
  {
    id: 'standard',
    name: 'Standard',
    credits: 15,
    price: 139,
    perCredit: '9.27',
    popular: true,
    icon: Crown,
    color: 'border-accent-500 ring-2 ring-accent-500/20',
    btnClass: 'btn-accent',
    description: 'Best value for tax season',
    features: [
      '15 statement analyses',
      'AI transaction categorization',
      'Full tax report with savings',
      'Deduction identification',
      'Category breakdown',
      'Year-on-year tracking',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    credits: 50,
    price: 349,
    perCredit: '6.98',
    popular: false,
    icon: Sparkles,
    color: 'border-slate-200',
    btnClass: 'btn-primary',
    description: 'For power users & small businesses',
    features: [
      '50 statement analyses',
      'Everything in Standard',
      'Multiple bank accounts',
      'Priority AI processing',
      'Export to tax practitioner',
      'Historical comparisons',
    ],
  },
];

const TAX_SEASON_BUNDLE = {
  id: 'tax-season',
  name: 'Tax Season Bundle',
  credits: 24,
  price: 199,
  perCredit: '8.29',
  description: '12 months bank + 12 months credit card — complete tax year in one go',
  features: [
    '24 analyses (covers full tax year)',
    'Bank + credit card statements',
    'Complete tax position report',
    'AI-powered deduction finder',
    'SARS-ready documentation',
  ],
};

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

      // Redirect to PayFast
      if (data.paymentUrl) {
        window.location.href = data.paymentUrl;
      } else if (data.formData) {
        // Create hidden form and submit to PayFast
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
      {/* Hero - SARS eFiling inspired green theme */}
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
            Pay per analysis. No subscriptions. No hidden fees.<br />
            Each credit = one bank statement analyzed by AI.
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
          {/* Credit plans */}
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-12">
            {PLANS.map(plan => {
              const Icon = plan.icon;
              return (
                <div
                  key={plan.id}
                  className={`card relative ${plan.color} ${plan.popular ? 'scale-[1.02]' : ''}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-accent-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                      MOST POPULAR
                    </div>
                  )}
                  <div className="text-center mb-6">
                    <Icon className={`mx-auto mb-3 ${plan.popular ? 'text-accent-500' : 'text-slate-400'}`} size={32} />
                    <h3 className="text-xl font-bold">{plan.name}</h3>
                    <p className="text-sm text-slate-500">{plan.description}</p>
                  </div>

                  <div className="text-center mb-6">
                    <div className="flex items-baseline justify-center gap-1">
                      <span className="text-sm text-slate-500">R</span>
                      <span className="text-4xl font-bold">{plan.price}</span>
                    </div>
                    <div className="text-sm text-slate-500 mt-1">
                      {plan.credits} credits • R{plan.perCredit}/analysis
                    </div>
                  </div>

                  <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check size={16} className="text-accent-500 mt-0.5 shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handlePurchase(plan.id)}
                    disabled={loading === plan.id}
                    className={`${plan.btnClass} w-full`}
                  >
                    {loading === plan.id ? 'Processing...' : `Buy ${plan.credits} Credits`}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Tax Season Bundle - special highlight */}
          <div className="card bg-gradient-to-r from-brand-50 to-accent-50 dark:from-brand-950/30 dark:to-accent-950/30 border-brand-200 dark:border-brand-800">
            <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="text-brand-600" size={24} />
                  <h3 className="text-xl font-bold">{TAX_SEASON_BUNDLE.name}</h3>
                  <span className="bg-brand-100 text-brand-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                    SAVE 17%
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-4">
                  {TAX_SEASON_BUNDLE.description}
                </p>
                <ul className="grid sm:grid-cols-2 gap-2">
                  {TAX_SEASON_BUNDLE.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-2 text-sm">
                      <Check size={14} className="text-brand-600 shrink-0" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="text-center md:text-right shrink-0">
                <div className="flex items-baseline justify-center md:justify-end gap-1 mb-1">
                  <span className="text-sm text-slate-500">R</span>
                  <span className="text-5xl font-bold">{TAX_SEASON_BUNDLE.price}</span>
                </div>
                <div className="text-sm text-slate-500 mb-4">
                  {TAX_SEASON_BUNDLE.credits} credits • R{TAX_SEASON_BUNDLE.perCredit}/analysis
                </div>
                <button
                  onClick={() => handlePurchase(TAX_SEASON_BUNDLE.id)}
                  disabled={loading === TAX_SEASON_BUNDLE.id}
                  className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-8 py-3 text-sm font-semibold text-white hover:bg-brand-700 transition-colors"
                >
                  {loading === TAX_SEASON_BUNDLE.id ? 'Processing...' : (
                    <>Get the Bundle <ArrowRight size={16} className="ml-2" /></>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Free tier note */}
          <div className="mt-8 text-center">
            <p className="text-slate-500 text-sm">
              New accounts include <span className="font-semibold">3 free analyses</span> to try before you buy.
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
              <FileText className="mx-auto text-brand-600 mb-2" size={28} />
              <h4 className="font-semibold mb-1">No Subscriptions</h4>
              <p className="text-sm text-slate-500">Buy credits when you need them. They never expire. No recurring charges.</p>
            </div>
            <div>
              <CreditCard className="mx-auto text-brand-600 mb-2" size={28} />
              <h4 className="font-semibold mb-1">Money-Back Guarantee</h4>
              <p className="text-sm text-slate-500">Not satisfied? Contact us within 7 days for a full refund. No questions asked.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
