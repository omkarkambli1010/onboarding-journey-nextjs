'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { useSpinner } from '@/components/spinner/Spinner';
import styles from './header.module.scss';

// Header component — equivalent to Angular HeaderComponent
// Shows SBI Securities logo; logo click reloads or navigates home

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const { show, hide } = useSpinner();

  useEffect(() => {
    // Set page title dynamically (equivalent to Angular Title service)
    document.title = 'Open Demat Account - Free Demat & Trading Account Opening Online | SBI Securities';
  }, []);

  const redirectHome = () => {
    show();
    if (pathname === '/page-not-found') {
      localStorage.clear();
      sessionStorage.clear();
      router.push('/');
      hide();
    } else {
      window.location.reload();
    }
  };

  return (
    <nav className={`navbar navbar-expand-lg bg-white ${styles.navbar}`} aria-label="Main navigation">
      <div className="container">
        <button
          className={`navbar-brand ${styles.navbarBrand}`}
          onClick={redirectHome}
          aria-label="Go to homepage"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <Image
            src="/assets/images/sbi-securities-logo.png"
            alt="SBI Securities Logo"
            width={160}
            height={48}
            priority
            style={{ objectFit: 'contain' }}
          />
        </button>
      </div>
    </nav>
  );
}
