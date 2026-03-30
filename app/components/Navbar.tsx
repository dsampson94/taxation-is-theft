'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Menu, X, LogOut, CreditCard, Sun, Moon } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    localStorage.setItem('theme', next ? 'dark' : 'light');
  };

  const isLanding = pathname === '/';

  return (
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-black text-base tracking-tight">
              TIT
            </div>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {user ? (
              <>
                {[
                  { label: 'Dashboard', href: '/dashboard' },
                  { label: 'Profile', href: '/tax-profile' },
                  { label: 'Upload', href: '/upload' },
                  { label: 'Transactions', href: '/transactions' },
                  { label: 'Search', href: '/search' },
                  { label: 'Report', href: '/report' },
                  { label: 'Review', href: '/checkpoints' },
                ].map((item, i) => (
                  <div key={item.label} className="flex items-center">
                    {i > 0 && (
                      <svg className="w-3.5 h-3.5 text-slate-300 dark:text-slate-600 mx-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                    <Link
                      href={item.href}
                      className={`text-sm font-medium px-2 py-1 rounded transition-colors ${
                        pathname === item.href
                          ? 'text-brand-600 bg-brand-50 dark:bg-brand-950/30 dark:text-brand-400'
                          : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                      }`}
                    >
                      {item.label}
                    </Link>
                  </div>
                ))}
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
                    title="Buy more credits"
                  >
                    <CreditCard size={14} />
                    {user.credits}
                  </Link>
                  <button
                    onClick={toggleTheme}
                    className="text-slate-400 hover:text-brand-600 transition-colors"
                    title="Toggle dark mode"
                  >
                    {dark ? <Sun size={18} /> : <Moon size={18} />}
                  </button>
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
              <div className="flex items-center gap-4">
                {!isLanding && (
                  <Link href="/" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300">
                    Home
                  </Link>
                )}
                <Link href="/pricing" className="text-sm font-medium text-slate-600 hover:text-slate-900 dark:text-slate-300">
                  Pricing
                </Link>
                <button
                  onClick={toggleTheme}
                  className="text-slate-400 hover:text-brand-600 transition-colors"
                  title="Toggle dark mode"
                >
                  {dark ? <Sun size={18} /> : <Moon size={18} />}
                </button>
                <Link href="/login" className="btn-secondary text-sm py-2 px-4">
                  Sign In
                </Link>
                <Link href="/register" className="btn-primary text-sm py-2 px-4">
                  Get Started Free
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleTheme}
              className="p-2 text-slate-600 dark:text-slate-300"
              title="Toggle dark mode"
            >
              {dark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="p-2 text-slate-600 dark:text-slate-300"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="md:hidden pb-4 space-y-1 border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
            {user ? (
              <>
                <Link href="/dashboard" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Dashboard
                </Link>
                <Link href="/tax-profile" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Profile
                </Link>
                <Link href="/upload" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Upload
                </Link>
                <Link href="/transactions" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Transactions
                </Link>
                <Link href="/search" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Search
                </Link>
                <Link href="/report" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Report
                </Link>
                <Link href="/checkpoints" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Review
                </Link>
                <div className="border-t border-slate-200 dark:border-slate-700 mt-2 pt-2">
                  <Link href="/pricing" className="block py-2.5 px-2 text-sm font-medium text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                    Credits ({user.credits})
                  </Link>
                  <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left py-2.5 px-2 text-sm font-medium text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Sign In
                </Link>
                <Link href="/register" className="block py-2.5 px-2 text-sm font-medium text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
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
