'use client';

import { useEffect } from 'react';
import { useAuth } from '@/app/contexts/AuthContext';
import Link from 'next/link';
import { CheckCircle, ArrowRight } from 'lucide-react';

export default function PaymentSuccessPage() {
  const { refreshUser } = useAuth();

  useEffect(() => {
    // Refresh user data to pick up new credits
    refreshUser();
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-slate-50 dark:bg-slate-950">
      <div className="card max-w-md w-full text-center">
        <CheckCircle className="mx-auto text-accent-500 mb-4" size={64} />
        <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
        <p className="text-slate-500 mb-6">
          Your credits have been added to your account. You&apos;re ready to start saving on your taxes.
        </p>
        <div className="space-y-3">
          <Link href="/upload" className="btn-accent w-full inline-flex items-center justify-center gap-2">
            Upload Statement <ArrowRight size={16} />
          </Link>
          <Link href="/dashboard" className="btn-secondary w-full inline-block">
            Go to Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
