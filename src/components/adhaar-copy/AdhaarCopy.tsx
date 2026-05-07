'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './adhaar-copy.module.scss';

// AdhaarCopy — Aadhaar DigiLocker verification result screen
// Figma: 8TizndCcBb3VyE5CIJBEZe
//   Desktop node 0-25166 · Mobile node 0-25394

function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 12.5H19" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12.5L11 18.5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12.5L11 6.5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M8 1.33334L2 4.00001V8.00001C2 11.3 4.66667 14.3933 8 15.3333C11.3333 14.3933 14 11.3 14 8.00001V4.00001L8 1.33334Z" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5.33334 8L7.33334 10L10.6667 6.66666" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function AdhaarCopy() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [dob, setDob] = useState('');
  const [address, setAddress] = useState('');

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    fetchAadhaarData();
  }, []);

  const fetchAadhaarData = async () => {
    showSpinner();
    const reqData = {
      flag: 'AadhaarDetails',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqData, hideSpinner);
      if (response?.status === true && response?.data?.length) {
        setDob(response.data[0].DOB || '');
        setAddress(response.data[0].Address || '');
      }
      hideSpinner();
    } catch { hideSpinner(); }
  };

  const goBack = () => {
    showSpinner();
    setTimeout(() => { router.back(); hideSpinner(); }, 200);
  };

  const handleContinue = () => {
    showSpinner();
    setTimeout(() => {
      router.push('/personalDetailsForm/1');
      hideSpinner();
    }, 200);
  };

  const faqHelpBtn = (stageName: string) => {
    const encodedStageName = btoa(stageName);
    window.location.href = `faq?stageName=${encodeURIComponent(encodedStageName)}`;
  };

  const infoBox = (
    <div className={styles.infoBox}>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Date of Birth:</span>
        <span className={styles.infoValue}>{dob || '—'}</span>
      </div>
      <div className={styles.infoRow}>
        <span className={styles.infoLabel}>Address:</span>
        <span className={styles.infoValue}>{address || '—'}</span>
      </div>
    </div>
  );

  return (
    <>
      {/* ── MOBILE (< 768px) ─────────────────────────────────────────────────── */}
      <section aria-label="Aadhaar Verification" className={styles.mobilePage}>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileTopRow}>
            {rejectStatus !== 'R' ? (
              <button
                type="button"
                className={styles.mobileBackBtn}
                onClick={goBack}
                aria-label="Go back"
              >
                <BackArrow />
              </button>
            ) : (
              <div className={styles.backPlaceholder} aria-hidden="true" />
            )}
          </div>

          <div className={styles.mobileTitleRow}>
            <div className={styles.mobileTitleBlock}>
              <h1 className={styles.mobileTitle}>Verify using Aadhaar with DigiLocker</h1>
              <p className={styles.mobileSubtitle}>
                Enter your Aadhaar and verify using OTP sent to your Aadhaar linked Mobile Number
              </p>
            </div>
            <button
              type="button"
              className={styles.needHelpBtn}
              onClick={() => faqHelpBtn('Aadhaar')}
            >
              Need Help?
            </button>
          </div>
        </div>

        <div className={styles.mobileCard}>
          <div className={styles.aadhaarImageWrap}>
            <img
              src="/assets/images/diy/aadhar_card_sample_img.png"
              alt="Aadhaar card sample"
              width={328}
              height={207}
            />
          </div>
          {infoBox}
        </div>

        <div className={styles.mobileProceedArea}>
          <button
            type="button"
            className={styles.mobileProceedBtn}
            onClick={handleContinue}
          >
            Proceed to Personal Details
          </button>
        </div>
      </section>

      {/* ── DESKTOP (≥ 768px) ────────────────────────────────────────────────── */}
      <section aria-label="Aadhaar Verification" className={styles.desktopPage}>
        <div className={styles.desktopCard}>
          <div className={styles.desktopCardHeader}>
            {rejectStatus !== 'R' ? (
              <button
                type="button"
                className={styles.desktopBackBtn}
                onClick={goBack}
                aria-label="Go back"
              >
                <BackArrow />
              </button>
            ) : (
              <div className={styles.backPlaceholder} aria-hidden="true" />
            )}

            <div className={styles.desktopTitleBlock}>
              <h1 className={styles.desktopCardTitle}>Verify using Aadhaar with DigiLocker</h1>
              <p className={styles.desktopCardSubtitle}>
                Enter your Aadhaar and verify using OTP sent to your Aadhaar linked Mobile Number
              </p>
            </div>

            <button
              type="button"
              className={styles.needHelpBtn}
              onClick={() => faqHelpBtn('Aadhaar')}
            >
              Need Help?
            </button>
          </div>

          <div className={styles.desktopCardBody}>
            <div className={styles.contentTop}>
              <div className={styles.aadhaarImageWrap}>
                <img
                  src="/assets/images/diy/aadhar_card_sample_img.png"
                  alt="Aadhaar card sample"
                  width={328}
                  height={207}
                />
              </div>
              {infoBox}
            </div>

            <div className={styles.contentBottom}>
              <p className={styles.securityText}>
                <ShieldIcon />
                Your PAN details are safe and secure with us.
              </p>
              <button
                type="button"
                className={styles.proceedBtn}
                onClick={handleContinue}
              >
                Continue
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
