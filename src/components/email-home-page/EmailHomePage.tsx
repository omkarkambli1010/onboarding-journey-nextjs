'use client';

import { useState, useEffect } from 'react';
import { useRouter/*, useSearchParams*/ } from 'next/navigation'; // TODO: Re-enable useSearchParams when API is ready
import { useSpinner } from '@/components/spinner/Spinner';
// import { toast } from 'react-toastify';         // TODO: Re-enable when API is ready
// import apiService from '@/services/api.service'; // TODO: Re-enable when API is ready
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
  // const searchParams = useSearchParams(); // TODO: Re-enable when API is ready
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [email, setEmail] = useState('');
  const [showError, setShowError] = useState(false);

  // const utmSource = searchParams.get('utm_source') || 'NA';   // TODO: Re-enable when API is ready
  // const utmMedium = searchParams.get('utm_medium') || 'NA';   // TODO: Re-enable when API is ready
  // const utmCampaign = searchParams.get('utm_campaign') || 'NA'; // TODO: Re-enable when API is ready

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

    // TODO: Re-enable when API is ready
    // showSpinner();
    // const reqData = {
    //   Flag: 'InsertOtpEmail',
    //   emailid: email,
    //   mobileno: typeof window !== 'undefined' ? sessionStorage.getItem('mobile') : '',
    //   isRetry: false,
    //   utm_source: utmSource,
    //   utm_medium: utmMedium,
    //   utm_campaign: utmCampaign,
    //   Formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    // };
    // try {
    //   const response = await apiService.postRequest('api/v1/oauth/service/otp/send', reqData, hideSpinner);
    //   if (response?.status === true) {
    //     setTimeout(() => {
    //       router.push('/email-home-otp');
    //       hideSpinner();
    //     }, 200);
    //   } else if (response?.status === false) {
    //     const msg = response.message;
    //     if (msg === 'Internal server error') {
    //       toast.error('Internal Server Error!', { position: 'bottom-center', autoClose: 2000 });
    //     } else {
    //       toast.warning(msg, { position: 'bottom-center', autoClose: 5000 });
    //     }
    //     hideSpinner();
    //   }
    // } catch {
    //   hideSpinner();
    // }

    router.push('/email-home-otp');
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
