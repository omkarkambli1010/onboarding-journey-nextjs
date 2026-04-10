'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './fatca.module.scss';
import FatcaUploadSheet from './FatcaUploadSheet';

// FatcaDetails — Screen 1: FATCA form with 5 fields
// Figma: Onboarding-Mob-FATCAdetail (0:48387)
//        Route: /fatca

const COUNTRIES = [
  'India',
  'United States',
  'United Kingdom',
  'Canada',
  'Australia',
  'Singapore',
  'UAE',
  'Germany',
  'France',
  'Japan',
];

// Inline chevron-down SVG
function CaretDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="#666" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function FatcaDetails() {
  const router = useRouter();

  const [countryOfBirth, setCountryOfBirth]       = useState('');
  const [citizenship, setCitizenship]             = useState('');
  const [taxResidence, setTaxResidence]           = useState('');
  const [tinIssuingCountry, setTinIssuingCountry] = useState('');
  const [tinNumber, setTinNumber]                 = useState('');
  const [showSheet, setShowSheet]                 = useState(false);

  const allFilled =
    countryOfBirth.trim() !== '' &&
    citizenship.trim() !== '' &&
    taxResidence.trim() !== '' &&
    tinIssuingCountry.trim() !== '' &&
    tinNumber.trim() !== '';

  const handleProceed = () => {
    if (allFilled) setShowSheet(true);
  };

  const title    = 'Enter FATCA Details';
  const subtitle = 'Enter your overseas address details manually.';

  // ── Mobile layout ──────────────────────────────────────────────────────────
  const mobileForm = (
    <div className={styles.mobilePage}>
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderInner}>
          <div className={styles.mobileTopRow}>
            <button
              type="button"
              className={styles.mobileBackBtn}
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className={styles.mobileTitleBlock}>
            <h1 className={styles.mobileTitle}>{title}</h1>
            <p className={styles.mobileSubtitle}>{subtitle}</p>
          </div>
        </div>
      </div>

      <div className={styles.mobileCard}>
        {/* Country of Birth */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-country-birth">Country of Birth</label>
          <div className={styles.fieldSelectWrap}>
            <select
              id="mob-country-birth"
              className={styles.fieldSelect}
              value={countryOfBirth}
              onChange={(e) => setCountryOfBirth(e.target.value)}
            >
              <option value="" disabled className={styles.fieldSelectPlaceholder}>Select</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className={styles.fieldSelectCaret}><CaretDown /></span>
          </div>
        </div>

        {/* Citizenship */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-citizenship">Cizitenship</label>
          <div className={styles.fieldSelectWrap}>
            <select
              id="mob-citizenship"
              className={styles.fieldSelect}
              value={citizenship}
              onChange={(e) => setCitizenship(e.target.value)}
            >
              <option value="" disabled className={styles.fieldSelectPlaceholder}>Select</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className={styles.fieldSelectCaret}><CaretDown /></span>
          </div>
        </div>

        {/* Country of TAX Residence */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-tax-residence">Country of TAX Residence</label>
          <div className={styles.fieldSelectWrap}>
            <select
              id="mob-tax-residence"
              className={styles.fieldSelect}
              value={taxResidence}
              onChange={(e) => setTaxResidence(e.target.value)}
            >
              <option value="" disabled className={styles.fieldSelectPlaceholder}>Select</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className={styles.fieldSelectCaret}><CaretDown /></span>
          </div>
        </div>

        {/* TIN Issuing Country */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-tin-country">TIN Issuing Country</label>
          <div className={styles.fieldSelectWrap}>
            <select
              id="mob-tin-country"
              className={styles.fieldSelect}
              value={tinIssuingCountry}
              onChange={(e) => setTinIssuingCountry(e.target.value)}
            >
              <option value="" disabled className={styles.fieldSelectPlaceholder}>Select</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className={styles.fieldSelectCaret}><CaretDown /></span>
          </div>
        </div>

        {/* TAX Identification Number */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-tin-number">
            TAX Identification Number (TIN)
          </label>
          <input
            id="mob-tin-number"
            type="text"
            className={styles.fieldInput}
            placeholder="Enter number"
            value={tinNumber}
            onChange={(e) => setTinNumber(e.target.value)}
          />
        </div>
      </div>

      <div className={styles.mobileProceedArea}>
        <button
          type="button"
          className={`${styles.mobileProceedBtn}${!allFilled ? ` ${styles.mobileProceedBtnDisabled}` : ''}`}
          onClick={handleProceed}
          disabled={!allFilled}
          aria-disabled={!allFilled}
        >
          Upload TIN Document
        </button>
      </div>
    </div>
  );

  // ── Desktop layout ─────────────────────────────────────────────────────────
  const desktopForm = (
    <div className={styles.desktopPage}>
      <div className={styles.desktopCard}>
        <div className={styles.desktopCardHeader}>
          <button
            type="button"
            className={styles.desktopBackBtn}
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className={styles.desktopTitleBlock}>
            <h1 className={styles.desktopCardTitle}>{title}</h1>
            <p className={styles.desktopCardSubtitle}>{subtitle}</p>
          </div>
        </div>

        <div className={styles.desktopCardBody}>
          <div className={styles.desktopContentArea}>
            <div className={styles.desktopFieldGrid}>
              {/* Country of Birth */}
              <div className={styles.desktopFieldGroup}>
                <label className={styles.fieldLabel} htmlFor="desk-country-birth">Country of Birth</label>
                <div className={styles.fieldSelectWrap}>
                  <select
                    id="desk-country-birth"
                    className={styles.fieldSelect}
                    value={countryOfBirth}
                    onChange={(e) => setCountryOfBirth(e.target.value)}
                  >
                    <option value="" disabled>Select</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className={styles.fieldSelectCaret}><CaretDown /></span>
                </div>
              </div>

              {/* Citizenship */}
              <div className={styles.desktopFieldGroup}>
                <label className={styles.fieldLabel} htmlFor="desk-citizenship">Cizitenship</label>
                <div className={styles.fieldSelectWrap}>
                  <select
                    id="desk-citizenship"
                    className={styles.fieldSelect}
                    value={citizenship}
                    onChange={(e) => setCitizenship(e.target.value)}
                  >
                    <option value="" disabled>Select</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className={styles.fieldSelectCaret}><CaretDown /></span>
                </div>
              </div>

              {/* Country of TAX Residence */}
              <div className={styles.desktopFieldGroup}>
                <label className={styles.fieldLabel} htmlFor="desk-tax-residence">Country of TAX Residence</label>
                <div className={styles.fieldSelectWrap}>
                  <select
                    id="desk-tax-residence"
                    className={styles.fieldSelect}
                    value={taxResidence}
                    onChange={(e) => setTaxResidence(e.target.value)}
                  >
                    <option value="" disabled>Select</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className={styles.fieldSelectCaret}><CaretDown /></span>
                </div>
              </div>

              {/* TIN Issuing Country */}
              <div className={styles.desktopFieldGroup}>
                <label className={styles.fieldLabel} htmlFor="desk-tin-country">TIN Issuing Country</label>
                <div className={styles.fieldSelectWrap}>
                  <select
                    id="desk-tin-country"
                    className={styles.fieldSelect}
                    value={tinIssuingCountry}
                    onChange={(e) => setTinIssuingCountry(e.target.value)}
                  >
                    <option value="" disabled>Select</option>
                    {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <span className={styles.fieldSelectCaret}><CaretDown /></span>
                </div>
              </div>

              {/* TAX Identification Number — full width */}
              <div className={styles.desktopFieldGroupFull}>
                <label className={styles.fieldLabel} htmlFor="desk-tin-number">
                  TAX Identification Number (TIN)
                </label>
                <input
                  id="desk-tin-number"
                  type="text"
                  className={styles.fieldInput}
                  placeholder="Enter number"
                  value={tinNumber}
                  onChange={(e) => setTinNumber(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className={styles.desktopProceedWrapper}>
            <button
              type="button"
              className={`${styles.desktopProceedBtn}${!allFilled ? ` ${styles.desktopProceedBtnDisabled}` : ''}`}
              onClick={handleProceed}
              disabled={!allFilled}
              aria-disabled={!allFilled}
            >
              Upload TIN Document
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileForm}
      {desktopForm}

      {showSheet && (
        <FatcaUploadSheet
          onClose={() => setShowSheet(false)}
          onProceed={() => router.push('/fatca/document')}
        />
      )}
    </>
  );
}
