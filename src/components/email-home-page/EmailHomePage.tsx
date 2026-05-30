'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './email-home-page.module.scss';

// EmailHomePage — Figma: SEMI--FULL-NRE-NRO / Email ID Verification (text entry)
// Desktop: 1:76966   Mobile: 1:72753

const BackArrowSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Figma 0:17705 — exclamation circle for invalid email state
const ExclamationCircleSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none"
    stroke="#ff2e00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="8" x2="12" y2="12" />
    <line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

const checkAtSymbolCount = (s: string) => (s.match(/@/g) || []).length;

const checkEmailSpecialchars = (v: string) => /[^a-z0-9_.@]/i.test(v);

const isEmailValid = (v: string): boolean => {
  const regex = /^[a-z](?!.*[_.]{2})[a-z0-9_.]*@[a-z0-9-]+(\.[a-z]{2,})+$/i;
  return regex.test(v) && !v.endsWith('@sbi.co.in');
};

export default function EmailHomePage() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [email, setEmail] = useState('');
  const [showError, setShowError] = useState(false);

  const hasError = showError && email.length > 0 && !isEmailValid(email);
  const isSendDisabled = !isEmailValid(email);

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    const saved = typeof window !== 'undefined' ? sessionStorage.getItem('email') || '' : '';
    setEmail(saved);
  }, []);

  const handleEmailChange = (val: string) => {
    setEmail(val);
    if (showError) setShowError(false);
  };

  const handleEmailBlur = () => {
    if (email.length > 0) setShowError(true);
  };

  const goBack = () => {
    showSpinner();
    setTimeout(() => {
      router.push('/email');
      hideSpinner();
    }, 200);
  };

  const getEmailOtp = async () => {
    if (isSendDisabled) return;
    if (typeof window !== 'undefined') sessionStorage.setItem('email', email);

    // Re-register with the entered email. The base payload (mobileNumber,
    // countryCode, journeyType, rmCode, utm…) was stored at the home step; we
    // only swap in the real emailAddress here.
    const stored = typeof window !== 'undefined' ? sessionStorage.getItem('registerPayload') : null;
    const basePayload = stored ? JSON.parse(stored) : {};
    const payload = { ...basePayload, emailAddress: email };

    showSpinner();
    try {
      const response = await apiService.registerUser(payload, hideSpinner);
      if (!response) {
        hideSpinner();
        return;
      }
      if (response.applicationId) {
        sessionStorage.setItem('applicationId', response.applicationId);
      }
      if (response.applicationNumber) {
        sessionStorage.setItem('applicationNumber', response.applicationNumber);
      }
      // OTP is sent automatically on the email-home-otp screen.
      hideSpinner();
      router.push('/email-home-otp');
    } catch {
      hideSpinner();
    }
  };

  const errorMessage = (
    <div className={styles.emailErrorRow}>
      <ExclamationCircleSvg />
      <span>Enter valid Email ID</span>
    </div>
  );

  return (
    <>
      {/* ── MOBILE ── */}
      <section aria-label="Email ID Verification" className={styles.mobilePage}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>
            <button type="button" className={styles.mobileBackBtn} onClick={goBack} aria-label="Go back">
              <BackArrowSvg />
            </button>
            <div className={styles.mobileTitleBlock}>
              <h5 className={styles.mobileTitle}>Email ID Verification</h5>
              <p className={styles.mobileSubtitle}>
                All communication related to your account will be sent to this email
              </p>
            </div>
          </div>
        </div>

        <div className={styles.mobileCard}>
          <div className={styles.mobileEmailField}>
            <label htmlFor="emailInputMobile" className={styles.mobileEmailLabel}>Enter Email ID</label>
            <input
              id="emailInputMobile"
              type="email"
              autoComplete="email"
              placeholder="example@gmail.com"
              value={email}
              onChange={(e) => handleEmailChange(e.target.value)}
              onBlur={handleEmailBlur}
              onKeyDown={(e) => { if (e.key === 'Enter') getEmailOtp(); }}
              className={`${styles.mobileEmailInput}${hasError ? ` ${styles.mobileEmailInputError}` : ''}`}
            />
            {hasError && (
              <div className={styles.mobileEmailErrorWrapper}>
                {errorMessage}
              </div>
            )}
          </div>
        </div>

        <div className={styles.mobileProceedArea}>
          <button
            type="button"
            className={`${styles.mobileProceedBtn}${isSendDisabled ? ` ${styles.mobileProceedBtnDisabled}` : ''}`}
            onClick={getEmailOtp}
            disabled={isSendDisabled}
          >
            Send OTP
          </button>
        </div>
      </section>

      {/* ── DESKTOP ── */}
      <section aria-label="Email ID Verification" className={styles.desktopPage}>
        <div className={styles.desktopCard}>
          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={goBack} aria-label="Go back">
              <BackArrowSvg />
            </button>
            <div className={styles.desktopTitleBlock}>
              <h5 className={styles.desktopCardTitle}>Email ID Verification</h5>
              <p className={styles.desktopCardSubtitle}>
                All communication related to your account will be sent to this email
              </p>
            </div>
          </div>

          <div className={styles.desktopCardBody}>
            {/* Email form row */}
            <div className={styles.desktopEmailRow}>
              <label htmlFor="emailInputDesktop" className={styles.desktopEmailLabel}>Email ID</label>
              <input
                id="emailInputDesktop"
                type="email"
                autoComplete="email"
                placeholder="example@gmail.com"
                value={email}
                onChange={(e) => handleEmailChange(e.target.value)}
                onBlur={handleEmailBlur}
                onKeyDown={(e) => { if (e.key === 'Enter') getEmailOtp(); }}
                className={`${styles.desktopEmailInput}${hasError ? ` ${styles.desktopEmailInputError}` : ''}`}
              />
            </div>

            {/* Figma 0:17705 — error message below input, aligned under input */}
            {hasError && (
              <div className={styles.desktopEmailErrorWrapper}>
                {errorMessage}
              </div>
            )}

            <div className={styles.desktopProceedWrapper}>
              <button
                type="button"
                className={`${styles.desktopProceedBtn}${isSendDisabled ? ` ${styles.desktopProceedBtnDisabled}` : ''}`}
                onClick={getEmailOtp}
                disabled={isSendDisabled}
              >
                Send OTP
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
