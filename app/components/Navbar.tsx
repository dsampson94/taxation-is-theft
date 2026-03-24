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
    <nav className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-lg dark:border-slate-700 dark:bg-slate-900/80">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white font-black text-base tracking-tight">
              TIT
            </div>
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
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Dashboard
                </Link>
                <Link
                  href="/upload"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/upload'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Upload
                </Link>
                <Link
                  href="/report"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/report'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Tax Report
                </Link>
                <Link
                  href="/tax-profile"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/tax-profile'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Profile
                </Link>
                <Link
                  href="/pricing"
                  className={`text-sm font-medium transition-colors ${
                    pathname === '/pricing'
                      ? 'text-brand-600'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
                  }`}
                >
                  Credits
                </Link>
                <div className="flex items-center gap-3 ml-4 pl-4 border-l border-slate-200 dark:border-slate-700">
                  <Link
                    href="/pricing"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-accent-600 hover:text-accent-700"
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
              <>
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
              </>
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
                <Link href="/upload" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Upload Statements
                </Link>
                <Link href="/report" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Tax Report
                </Link>
                <Link href="/tax-profile" className="block py-2.5 px-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Tax Profile
                </Link>
                <Link href="/pricing" className="block py-2.5 px-2 text-sm font-medium text-accent-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg" onClick={() => setMobileOpen(false)}>
                  Credits ({user.credits})
                </Link>
                <button onClick={() => { logout(); setMobileOpen(false); }} className="block w-full text-left py-2.5 px-2 text-sm font-medium text-brand-600 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg">
                  Sign Out
                </button>
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
