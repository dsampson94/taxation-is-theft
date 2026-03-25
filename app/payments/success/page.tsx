'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { CheckCircle, ArrowRight, Clock, XCircle, RefreshCw } from 'lucide-react';

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
          <div className="card max-w-md w-full text-center">
            <RefreshCw className="mx-auto text-brand-500 mb-4 animate-spin" size={64} />
            <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
          </div>
        </div>
      }
    >
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const { refreshUser } = useAuth();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('payment_id');
  const [status, setStatus] = useState<'checking' | 'completed' | 'pending' | 'failed'>('checking');
  const [credits, setCredits] = useState<number | null>(null);
  const [retries, setRetries] = useState(0);

  useEffect(() => {
    if (!paymentId) {
      // No payment ID — they navigated here directly, just refresh
      refreshUser();
      setStatus('completed');
      return;
    }

    let cancelled = false;

    const checkPayment = async () => {
      try {
        const res = await fetch(`/api/payments/verify?payment_id=${encodeURIComponent(paymentId)}`);
        if (!res.ok) {
          setStatus('failed');
          return;
        }
        const data = await res.json();

        if (cancelled) return;

        if (data.status === 'COMPLETED') {
          setStatus('completed');
          setCredits(data.creditsPurchased);
          refreshUser();
        } else if (data.status === 'PENDING') {
          setStatus('pending');
          // PayFast ITN may take a few seconds — retry up to 5 times
          if (retries < 5) {
            setTimeout(() => {
              if (!cancelled) setRetries(r => r + 1);
            }, 3000);
          }
        } else {
          setStatus('failed');
        }
      } catch {
        setStatus('failed');
      }
    };

    checkPayment();
    return () => { cancelled = true; };
  }, [paymentId, retries]);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="card max-w-md w-full text-center">
        {status === 'checking' && (
          <>
            <RefreshCw className="mx-auto text-brand-500 mb-4 animate-spin" size={64} />
            <h1 className="text-2xl font-bold mb-2">Verifying Payment...</h1>
            <p className="text-slate-500">Confirming with PayFast...</p>
          </>
        )}

        {status === 'pending' && (
          <>
            <Clock className="mx-auto text-amber-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold mb-2">Processing Payment</h1>
            <p className="text-slate-500 mb-6">
              PayFast is still confirming your payment. This usually takes a few seconds.
              {retries < 5 ? ' Checking again...' : ' Please refresh this page in a minute.'}
            </p>
            {retries >= 5 && (
              <button
                onClick={() => setRetries(0)}
                className="btn-secondary inline-flex items-center gap-2"
              >
                <RefreshCw size={16} /> Check Again
              </button>
            )}
          </>
        )}

        {status === 'completed' && (
          <>
            <CheckCircle className="mx-auto text-brand-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-slate-500 mb-6">
              {credits
                ? `${credits} credits have been added to your account.`
                : 'Your credits have been added to your account.'
              }
              {' '}You&apos;re ready to start saving on your taxes.
            </p>
            <div className="space-y-3">
              <Link href="/upload" className="btn-accent w-full inline-flex items-center justify-center gap-2">
                Upload Statement <ArrowRight size={16} />
              </Link>
              <Link href="/dashboard" className="btn-secondary w-full inline-block">
                Go to Dashboard
              </Link>
            </div>
          </>
        )}

        {status === 'failed' && (
          <>
            <XCircle className="mx-auto text-red-500 mb-4" size={64} />
            <h1 className="text-2xl font-bold mb-2">Payment Issue</h1>
            <p className="text-slate-500 mb-6">
              We couldn&apos;t verify this payment. If you were charged, your credits will be added automatically once PayFast confirms.
            </p>
            <div className="space-y-3">
              <Link href="/dashboard" className="btn-accent w-full inline-block">
                Go to Dashboard
              </Link>
              <Link href="/pricing" className="btn-secondary w-full inline-block">
                Try Again
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
