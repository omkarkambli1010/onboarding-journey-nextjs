'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
// import { toast } from '@/services/toast.service';
// import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './manual-bankdetails.module.scss';

// ManualBankDetails — Add bank details manually
// Figma: MzSMJbkZfKDT6S8z3G0rVU
//   Desktop node 0-99176 · Mobile node 0-100804

const DUMMY_ADDRESS = 'SBI Bank, Sector 20 Anand Vihar Co-Operative Society, Borivali, Mumbai, Maharashtra 400703';

function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M5 12H19" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 18" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 6" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="#280071" strokeWidth="1.2" />
      <path d="M8 7v4" stroke="#280071" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="#280071" />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M2.5 10C2.5 10 5 5 10 5C15 5 17.5 10 17.5 10C17.5 10 15 15 10 15C5 15 2.5 10 2.5 10Z" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" stroke="#666666" strokeWidth="1.2" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M3 3L17 17" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8.23 5.1A7.5 7.5 0 0110 5c5 0 7.5 5 7.5 5a13.3 13.3 0 01-2.14 3.06M5.8 6.8A13.4 13.4 0 002.5 10s2.5 5 7.5 5a7.5 7.5 0 004.2-1.27" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8.5 8.55A2.5 2.5 0 0111.5 11.5" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

interface BankSectionProps {
  title: string;
  accountNo: string;
  reAccountNo: string;
  ifsc: string;
  showAccount: boolean;
  onChange: (field: 'accountNo' | 'reAccountNo' | 'ifsc', value: string) => void;
  onToggleShow: () => void;
}

function BankSection({ title, accountNo, reAccountNo, ifsc, showAccount, onChange, onToggleShow }: BankSectionProps) {
  return (
    <div className={styles.bankSection}>
      <p className={styles.sectionTitle}>{title}</p>

      {/* Account No. — numeric only */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Enter your Account No.</label>
        <div className={styles.inputWrapper}>
          <input
            type={showAccount ? 'text' : 'password'}
            inputMode="numeric"
            className={`${styles.input} ${styles.withEye}`}
            placeholder="e.g. 00112233445566"
            value={accountNo}
            onChange={e => onChange('accountNo', e.target.value.replace(/[^0-9]/g, ''))}
            maxLength={20}
            suppressHydrationWarning
          />
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={onToggleShow}
            aria-label={showAccount ? 'Hide account number' : 'Show account number'}
            suppressHydrationWarning
          >
            {showAccount ? <EyeOpenIcon /> : <EyeClosedIcon />}
          </button>
        </div>
      </div>

      {/* Re-enter Account No. — numeric only, no paste */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Re-enter your Account No.</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            inputMode="numeric"
            className={styles.input}
            placeholder="e.g. 00112233445566"
            value={reAccountNo}
            onChange={e => onChange('reAccountNo', e.target.value.replace(/[^0-9]/g, ''))}
            onPaste={e => e.preventDefault()}
            maxLength={20}
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* IFSC Code — alphanumeric only, uppercase */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Enter IFSC Code</label>
        <div className={styles.inputWrapper}>
          <input
            type="text"
            className={styles.input}
            placeholder="e.g. SBIN0011223"
            value={ifsc}
            onChange={e => onChange('ifsc', e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase())}
            maxLength={11}
            suppressHydrationWarning
          />
        </div>
      </div>

      {/* Address info box */}
      <div className={styles.addressBox}>
        <p className={styles.addressText}>{DUMMY_ADDRESS}</p>
      </div>
    </div>
  );
}

export default function ManualBankDetails() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [nroAccountNo, setNroAccountNo] = useState('');
  const [nroReAccountNo, setNroReAccountNo] = useState('');
  const [nroIfsc, setNroIfsc] = useState('');
  const [nroShowAccount, setNroShowAccount] = useState(false);

  const [nreAccountNo, setNreAccountNo] = useState('');
  const [nreReAccountNo, setNreReAccountNo] = useState('');
  const [nreIfsc, setNreIfsc] = useState('');
  const [nreShowAccount, setNreShowAccount] = useState(false);

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
  }, []);

  // const saveBankDetails = async () => {
  //   showSpinner();
  //   const reqData = {
  //     NROAccountNo: nroAccountNo,
  //     NROIfsc: nroIfsc,
  //     NREAccountNo: nreAccountNo,
  //     NREIfsc: nreIfsc,
  //     FormNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
  //   };
  //   try {
  //     const response = await apiService.postRequest('api/v1/bankDetails/save', reqData, hideSpinner);
  //     if (response?.status === true) {
  //       setTimeout(() => { router.push('/PennyDrop/1'); hideSpinner(); }, 200);
  //     } else {
  //       toast.error(response?.message || 'Error', { autoClose: 4000 });
  //       hideSpinner();
  //     }
  //   } catch { hideSpinner(); }
  // };

  const goBack = () => {
    showSpinner();
    setTimeout(() => { router.back(); hideSpinner(); }, 200);
  };

  const handleProceed = () => {
    showSpinner();
    setTimeout(() => { router.push('/PennyDrop/1'); hideSpinner(); }, 200);
  };

  const handleNroChange = (field: 'accountNo' | 'reAccountNo' | 'ifsc', value: string) => {
    if (field === 'accountNo') setNroAccountNo(value);
    else if (field === 'reAccountNo') setNroReAccountNo(value);
    else setNroIfsc(value);
  };

  const handleNreChange = (field: 'accountNo' | 'reAccountNo' | 'ifsc', value: string) => {
    if (field === 'accountNo') setNreAccountNo(value);
    else if (field === 'reAccountNo') setNreReAccountNo(value);
    else setNreIfsc(value);
  };

  // All 6 fields must be non-empty
  const isDisabled =
    !nroAccountNo.trim() ||
    !nroReAccountNo.trim() ||
    !nroIfsc.trim() ||
    !nreAccountNo.trim() ||
    !nreReAccountNo.trim() ||
    !nreIfsc.trim();

  const bankBanner = (
    <div className={styles.bankBanner}>
      <InfoIcon />
      <span className={styles.bankBannerText}>State Bank of India</span>
    </div>
  );

  const needHelpBtn = (
    <button type="button" className={styles.needHelpBtn} suppressHydrationWarning>
      Need Help?
    </button>
  );

  return (
    <>
      {/* ── MOBILE (< 768px) ─────────────────────────────────────────────────── */}
      <section aria-label="Add Bank Details Manually" className={styles.mobilePage} suppressHydrationWarning>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderTop}>
            <button type="button" className={styles.mobileBackBtn} onClick={goBack} aria-label="Go back" suppressHydrationWarning>
              <BackArrow />
            </button>
            {needHelpBtn}
          </div>
          <div className={styles.mobileTitleBlock}>
            <h1 className={styles.mobileTitle}>Add your bank details manually</h1>
            <p className={styles.mobileSubtitle}>Enter bank account number and IFSC for bank verification</p>
          </div>
        </div>

        <div className={styles.mobileCard}>
          {bankBanner}

          <BankSection
            title="Enter NRO (Savings Account) details"
            accountNo={nroAccountNo}
            reAccountNo={nroReAccountNo}
            ifsc={nroIfsc}
            showAccount={nroShowAccount}
            onChange={handleNroChange}
            onToggleShow={() => setNroShowAccount(v => !v)}
          />

          <BankSection
            title="Enter Non PIS NRE (Savings Account) details"
            accountNo={nreAccountNo}
            reAccountNo={nreReAccountNo}
            ifsc={nreIfsc}
            showAccount={nreShowAccount}
            onChange={handleNreChange}
            onToggleShow={() => setNreShowAccount(v => !v)}
          />
        </div>

        <div className={styles.mobileProceedArea}>
          <button
            type="button"
            className={`${styles.mobileProceedBtn}${isDisabled ? ` ${styles.btnDisabled}` : ''}`}
            onClick={handleProceed}
            disabled={isDisabled}
            suppressHydrationWarning
          >
            Proceed
          </button>
        </div>
      </section>

      {/* ── DESKTOP (≥ 768px) ────────────────────────────────────────────────── */}
      <section aria-label="Add Bank Details Manually" className={styles.desktopPage} suppressHydrationWarning>
        <div className={styles.desktopCard}>
          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={goBack} aria-label="Go back" suppressHydrationWarning>
              <BackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <div className={styles.desktopTitleRow}>
                <h1 className={styles.desktopCardTitle}>Add your bank details manually</h1>
                {needHelpBtn}
              </div>
              <p className={styles.desktopCardSubtitle}>
                Enter bank account number and IFSC for bank verification
              </p>
            </div>
          </div>

          <div className={styles.desktopCardBody}>
            <div className={styles.desktopScrollArea}>
              {bankBanner}

              <BankSection
                title="Enter NRO (Savings Account) details"
                accountNo={nroAccountNo}
                reAccountNo={nroReAccountNo}
                ifsc={nroIfsc}
                showAccount={nroShowAccount}
                onChange={handleNroChange}
                onToggleShow={() => setNroShowAccount(v => !v)}
              />

              <BankSection
                title="Enter Non PIS NRE (Savings Account) details"
                accountNo={nreAccountNo}
                reAccountNo={nreReAccountNo}
                ifsc={nreIfsc}
                showAccount={nreShowAccount}
                onChange={handleNreChange}
                onToggleShow={() => setNreShowAccount(v => !v)}
              />
            </div>

            <div className={styles.desktopProceedWrapper}>
              <button
                type="button"
                className={`${styles.desktopProceedBtn}${isDisabled ? ` ${styles.btnDisabled}` : ''}`}
                onClick={handleProceed}
                disabled={isDisabled}
                suppressHydrationWarning
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
