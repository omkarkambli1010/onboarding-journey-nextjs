'use client';

import { useEffect, useRef } from 'react';
import Header from '@/components/header/Header';
import Spinner from '@/components/spinner/Spinner';
import { APP_VERSION } from '@/lib/version';
import { asset } from '@/lib/asset';
import Lenis from 'lenis';
import styles from './app-shell.module.scss';

// AppShell — equivalent to Angular AppComponent
// Handles: header visibility, back-button prevention, devtools blocking,
// right-click prevention, zoom disable, smooth scrolling (Lenis), cache clearing

export default function AppShell({ children }: { children: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  // Bootstrap JS bundle (Popper + Collapse/Modal/Dropdown handlers) — required
  // for the data-bs-toggle="collapse" accordion buttons in HomeComponent.
  // Loaded client-side only; the bundle touches `document` at import time,
  // which crashes during SSR.
  useEffect(() => {
    // @ts-expect-error — prebuilt bootstrap bundle ships no type declarations
    import('bootstrap/dist/js/bootstrap.bundle.min.js');
  }, []);

  // Prefix CSS-referenced images with the deploy basePath. Plain CSS url()s are
  // static and Next can't rewrite them for a sub-path deploy (e.g. /open-nri-account),
  // so we resolve them with asset() and expose them as :root CSS variables that
  // globals.scss consumes via var(). No-op at the root path (local dev).
  useEffect(() => {
    const root = document.documentElement.style;
    root.setProperty('--iti-path-flags-1x', `url('${asset(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/intl-tel-input/flags.webp`)}')`);
    root.setProperty('--iti-path-flags-2x', `url('${asset(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/intl-tel-input/flags@2x.webp`)}')`);
    root.setProperty('--blue-dot-url', `url('${asset(`${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/assets/images/diy/blue-dot.png`)}')`);
  }, []);

  useEffect(() => {
    // Clear service worker caches on load
    if ('caches' in window) {
      caches
        .keys()
        .then((names) => Promise.all(names.map((n) => caches.delete(n))))
        .catch((e) => console.error('Error clearing caches:', e));
    }

    // Disable the BROWSER Back/Forward buttons while keeping the in-app back
    // arrows working — across all browsers.
    //
    // How: the native Back button (and swipe-back gesture) fires `popstate`
    // WITHOUT calling history.back(); programmatic navigation — router.back(),
    // router.forward() — goes THROUGH window.history.back()/forward()/go(). So
    // we wrap those three methods to set an "allow" flag, and on popstate we let
    // the navigation pass only when the flag is set; otherwise we re-push the
    // current URL, pinning the user in place. router.push() uses pushState and
    // never fires popstate, so it is unaffected. This means the existing
    // router.back() arrows keep working without any per-component changes.
    history.pushState(null, '', location.href);

    let allowPop = false;
    const origBack = window.history.back.bind(window.history);
    const origForward = window.history.forward.bind(window.history);
    const origGo = window.history.go.bind(window.history);
    window.history.back = () => { allowPop = true; origBack(); };
    window.history.forward = () => { allowPop = true; origForward(); };
    window.history.go = (delta?: number) => { allowPop = true; origGo(delta); };

    const handlePopState = () => {
      if (allowPop) {
        allowPop = false; // programmatic nav (router.back/forward) — let it through
        return;
      }
      history.pushState(null, '', location.href); // native Back/Forward — block
    };
    window.addEventListener('popstate', handlePopState);

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
      window.removeEventListener('popstate', handlePopState);
      window.history.back = origBack;
      window.history.forward = origForward;
      window.history.go = origGo;
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
      <Header />
      <Spinner />
      <main>{children}</main>
      <footer className={styles.appFooter}>v{APP_VERSION}</footer>
    </>
  );
}
