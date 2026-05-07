'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from '@/services/toast.service';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './email-home-screen.module.scss';

// EmailHomeScreen — equivalent to Angular EmailHomeScreenComponent
// Email ID Verification — choose Google OAuth or manual email entry
// Figma: SEMI--FULL-NRE-NRO — Desktop 1:76220, Mobile 1:72658

const BackArrowSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M15 18L9 12L15 6" stroke="#2B2B2B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function EmailHomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const utmSource = searchParams.get('utm_source') || 'NA';
  const utmMedium = searchParams.get('utm_medium') || 'NA';
  const utmCampaign = searchParams.get('utm_campaign') || 'NA';
  const emailVerified = searchParams.get('email_verified') || '';
  const emailParam = searchParams.get('email') || '';
  const nameParam = searchParams.get('name') || '';
  const emailError = searchParams.get('Error') || '';

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);

    if (emailParam && emailVerified === 'true') {
      const payload = { email: emailParam, email_verified: emailVerified, name: nameParam };
      getEmailOtpVerify(payload);
    } else if (emailError) {
      toast.error('Google Authentication Failed, Please Try Again...', {
        position: 'bottom-center',
        autoClose: 5000,
      });
    }
  }, []);

  const decodeJwtResponse = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const handleGoogleResponse = (response: any) => {
    try {
      if (response.credential) {
        const payload = decodeJwtResponse(response.credential);
        if (payload.email_verified === true) {
          getEmailOtpVerify(payload);
        }
      }
    } catch {
      toast.error('Google Authentication Failed', { position: 'bottom-center' });
    }
  };

  const initGoogleSignIn = () => {
    try {
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: '652145000458-ebpj0tfffq6e2lolfl3ei5fu11mhr831.apps.googleusercontent.com',
        context: 'use',
        use_fedcm_for_prompt: true,
        callback: handleGoogleResponse,
        cancel_on_tap_outside: false,
        auto_select: false,
        itp_support: true,
      });
    } catch {}
  };

  const signInWithGoogle = () => {
    showSpinner();
    const google = (window as any).google;
    if (!google) { hideSpinner(); return; }

    google.accounts.id.cancel();

    const googleError = sessionStorage.getItem('GoogleError') || '';
    if (!googleError) {
      initGoogleSignIn();
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const reason = notification.isNotDisplayed()
            ? (notification.getNotDisplayedReason?.() || 'Prompt Not Displayed')
            : (notification.getSkippedMomentReason?.() || 'Prompt Skipped');
          sessionStorage.setItem('GoogleError', reason);
          toast.warning(
            'Please provide permission to fetch your data from Google or please enter Email ID manually',
            { position: 'bottom-center', autoClose: 3000 }
          );
          setTimeout(hideSpinner, 2500);
        }
      });
      setTimeout(hideSpinner, 2500);
    } else {
      const formNumber = sessionStorage.getItem('FormNumber');
      const routeurl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      window.location.href = `${routeurl}GoogleAuthentication/GoogleSignIn.aspx?clientcode=${formNumber}`;
    }
  };

  const getEmailOtpVerify = async (payload: any) => {
    if (!payload) return;
    const reqData = {
      Flag: 'SaveGmail',
      emailid: payload.email,
      emailidverified: payload.email_verified,
      GmailProfileName: payload.name,
      Formnumber: sessionStorage.getItem('FormNumber'),
      mobileno: sessionStorage.getItem('mobile'),
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    };
    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/oauth/service/otp/savegmail', reqData, hideSpinner);
      if (response?.status === true) {
        setTimeout(() => {
          router.push('/uploadProcess/1');
          hideSpinner();
        }, 200);
      } else {
        toast.error(response?.message || 'Error', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch {
      hideSpinner();
    }
  };

  const emailTextPage = () => {
    showSpinner();
    setTimeout(() => {
      router.push('/email-home-page');
      hideSpinner();
    }, 200);
  };

  const goBack = () => {
    sessionStorage.removeItem('mobile');
    sessionStorage.removeItem('NameSubmitted');
    router.push('/');
  };

  const googleButton = (
    <button type="button" className={styles.googleBtn} onClick={signInWithGoogle}>
      <img
        src="/assets/images/diy/google_icon_mini.png"
        alt="Google"
        className={styles.googleIcon}
      />
      <span>Continue with Google</span>
    </button>
  );

  const orDivider = (
    <div className={styles.orDivider}>
      <div className={styles.orLine} />
      <span className={styles.orText}>Or</span>
      <div className={styles.orLine} />
    </div>
  );

  const altEmail = (
    <div className={styles.altEmailBlock} onClick={emailTextPage} role="button" tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') emailTextPage(); }}>
      <span className={styles.altEmailLink}>Use another E-mail ID</span>
      <span className={styles.altEmailNote}>(Require OTP Verification)</span>
    </div>
  );

  return (
    <>
      {/* ── MOBILE  (< 768px) ── */}
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
          {googleButton}
          {orDivider}
          {altEmail}
        </div>
      </section>

      {/* ── DESKTOP  (≥ 768px) ── */}
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
            <div className={styles.desktopContentGroup}>
              {googleButton}
              {orDivider}
              {altEmail}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
