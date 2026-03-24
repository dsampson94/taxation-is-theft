'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';
import { Menu, X, LogOut, User, BarChart3, CreditCard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLanding = pathname === '/';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-bold text-lg">
              T
            </div>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              Taxation is Theft
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/dashboard'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/upload"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/upload'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  Upload Statements
                </Link>
                <Link
                  href="/report"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/report'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  Tax Report
                </Link>
                <Link
                  href="/tax-profile"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/tax-profile'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  Tax Profile
                </Link>
                <Link
                  href="/pricing"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/pricing'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300'
                  }`}
                >
                  Buy Credits
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:text-accent-700"
                    title="Buy more credits"
                  >
                    <CreditCard size={14} />
                    {user.credits} credits
                  </Link>
                  <button
                    onClick={logout}
                    className="text-slate-400 hover:text-brand-600 transition-colors"
                    title="Sign out"
                  >
                    <LogOut size={18} />
                  </button>
                </div>
              </>
            ) : (
              <>
                {!isLanding && (
                  <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                    Home
                  </Link>
                )}
                <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900">
                  Pricing
                </Link>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started Free
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-slate-600"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
            {user ? (
              <>
                <Link href="/dashboard" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/upload" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Upload Statements
                </Link>
                <Link href="/report" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Tax Report
                </Link>
                <Link href="/tax-profile" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Tax Profile
                </Link>
                <Link href="/pricing" className="block py-2.5 px-2 text-sm font-medium text-accent-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Buy Credits ({user.credits})
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left py-2.5 px-2 text-sm font-medium text-brand-600 hover:bg-slate-50 rounded-lg">
                  Sign Out
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="block py-2.5 px-2 text-sm font-medium text-brand-600 hover:bg-slate-50 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Get Started Free
                </Link>
              </>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
