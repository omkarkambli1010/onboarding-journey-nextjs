'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Header from '@/components/header/Header';
import Spinner from '@/components/spinner/Spinner';
import Lenis from 'lenis';

// AppShell — equivalent to Angular AppComponent
// Handles: header visibility, back-button prevention, devtools blocking,
// right-click prevention, zoom disable, smooth scrolling (Lenis), cache clearing

const EXCLUDED_HEADER_ROUTES = ['yono-mobile', 'yono-sso', 'yono-email'];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  const isExcludedRoute = EXCLUDED_HEADER_ROUTES.some((route) =>
    pathname?.includes(route)
  );

  const getDeviceType = (): 'Mobile' | 'Tablet' | 'Desktop' => {
    if (typeof navigator === 'undefined') return 'Desktop';
    const ua = navigator.userAgent;
    if (/mobile/i.test(ua)) return 'Mobile';
    if (/tablet/i.test(ua)) return 'Tablet';
    return 'Desktop';
  };

  const isHeaderVisible = (): boolean => !isExcludedRoute;

  useEffect(() => {
    // Clear service worker caches on load
    if ('caches' in window) {
      caches
        .keys()
        .then((names) => Promise.all(names.map((n) => caches.delete(n))))
        .catch((e) => console.error('Error clearing caches:', e));
    }

    // Prevent back button navigation
    history.pushState(null, '', location.href);
    window.onpopstate = () => history.go(1);

    // Smooth scrolling with Lenis
    const lenis = new Lenis({ duration: 2.0, smoothWheel: true });
    lenisRef.current = lenis;

    const raf = (time: number) => {
      lenis.raf(time);
      requestAnimationFrame(raf);
    };
    requestAnimationFrame(raf);

    // Disable pinch-to-zoom
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 1) e.preventDefault();
    };

    // Disable double-tap zoom
    let lastTouchEnd = 0;
    const handleTouchEnd = (e: TouchEvent) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) e.preventDefault();
      lastTouchEnd = now;
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: false });
    document.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      lenis.destroy();
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
      window.onpopstate = null;
    };
  }, []);

  // Block right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Block DevTools shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        (e.ctrlKey &&
          e.shiftKey &&
          ['i', 'j', 'c'].includes(e.key.toLowerCase())) ||
        e.key === 'F12'
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      {isHeaderVisible() && <Header />}
      <Spinner />
      <main>{children}</main>
    </>
  );
}
