'use client';

import { useEffect, useRef, useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';

const NAV_ROUTES = [
  '/dashboard',
  '/tax-profile',
  '/upload',
  '/transactions',
  '/report',
];

const SWIPE_THRESHOLD = 60;  // min px to count as a swipe
const SWIPE_MAX_Y = 80;      // max vertical movement (ignore scrolls)

export default function SwipeNav({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const handleSwipe = useCallback((deltaX: number) => {
    const currentIdx = NAV_ROUTES.indexOf(pathname);
    if (currentIdx === -1) return;

    if (deltaX < -SWIPE_THRESHOLD && currentIdx < NAV_ROUTES.length - 1) {
      // Swipe left → next screen
      router.push(NAV_ROUTES[currentIdx + 1]);
    } else if (deltaX > SWIPE_THRESHOLD && currentIdx > 0) {
      // Swipe right → previous screen
      router.push(NAV_ROUTES[currentIdx - 1]);
    }
  }, [pathname, router]);

  useEffect(() => {
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      touchStart.current = { x: t.clientX, y: t.clientY };
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - touchStart.current.x;
      const dy = Math.abs(t.clientY - touchStart.current.y);
      touchStart.current = null;

      // Only trigger if horizontal swipe is dominant
      if (dy < SWIPE_MAX_Y) {
        handleSwipe(dx);
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchend', onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchend', onTouchEnd);
    };
  }, [handleSwipe]);

  // Show dots indicator on mobile for the nav routes
  const currentIdx = NAV_ROUTES.indexOf(pathname);
  const showDots = currentIdx !== -1;

  return (
    <>
      {children}
      {showDots && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 md:hidden z-40">
          {NAV_ROUTES.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 rounded-full transition-all duration-200 ${
                i === currentIdx
                  ? 'w-6 bg-brand-500'
                  : 'w-1.5 bg-slate-300 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      )}
    </>
  );
}
