'use client';

import Link from 'next/link';
import { XCircle, ArrowLeft } from 'lucide-react';

export default function PaymentCancelPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="card max-w-md w-full text-center">
        <XCircle className="mx-auto text-slate-400 mb-4" size={64} />
        <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
        <p className="text-slate-500 mb-6">
          Your payment was not completed. No charges were made. You can try again anytime.
        </p>
        <div className="space-y-3">
          <Link href="/pricing" className="btn-primary w-full inline-flex items-center justify-center gap-2">
            <ArrowLeft size={16} /> Back to Pricing
          </Link>
          <Link href="/dashboard" className="btn-secondary w-full inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
