'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './fatca.module.scss';
import FatcaUploadSheet from './FatcaUploadSheet';

// FatcaDetails — Screen 1: three roman-numbered FATCA sections, 5 fields each
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

const ROMAN = ['I', 'II', 'III'];

type FatcaSection = {
  countryOfBirth: string;
  citizenship: string;
  taxResidence: string;
  tinIssuingCountry: string;
  tinNumber: string;
};

const emptySection: FatcaSection = {
  countryOfBirth: '',
  citizenship: '',
  taxResidence: '',
  tinIssuingCountry: '',
  tinNumber: '',
};

// The four dropdown fields share an identical shape; the TIN number is a text input.
const SELECT_FIELDS: { field: keyof FatcaSection; label: string }[] = [
  { field: 'countryOfBirth', label: 'Country of Birth' },
  { field: 'citizenship', label: 'Cizitenship' },
  { field: 'taxResidence', label: 'Country of TAX Residence' },
  { field: 'tinIssuingCountry', label: 'TIN Issuing Country' },
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

  const [sections, setSections] = useState<FatcaSection[]>(() =>
    ROMAN.map(() => ({ ...emptySection }))
  );
  const [showSheet, setShowSheet] = useState(false);

  const updateSection = (index: number, field: keyof FatcaSection, value: string) => {
    setSections((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const sectionFilled = (s: FatcaSection) =>
    s.countryOfBirth.trim() !== '' &&
    s.citizenship.trim() !== '' &&
    s.taxResidence.trim() !== '' &&
    s.tinIssuingCountry.trim() !== '' &&
    s.tinNumber.trim() !== '';

  // Every field in all three sections is required before proceeding.
  const allFilled = sections.every(sectionFilled);

  const handleProceed = () => {
    if (allFilled) setShowSheet(true);
  };

  const title    = 'Enter FATCA Details';
  const subtitle = 'Enter your overseas address details manually.';

  // ── Field renderers (shared across mobile + desktop, and across sections) ────
  const renderSelect = (
    s: FatcaSection,
    index: number,
    field: keyof FatcaSection,
    label: string,
    idPrefix: string,
    groupClass: string
  ) => {
    const id = `${idPrefix}-${field}-${index}`;
    return (
      <div className={groupClass} key={field}>
        <label className={styles.fieldLabel} htmlFor={id}>{label}</label>
        <div className={styles.fieldSelectWrap}>
          <select
            id={id}
            className={styles.fieldSelect}
            value={s[field]}
            onChange={(e) => updateSection(index, field, e.target.value)}
          >
            <option value="" disabled>Select</option>
            {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <span className={styles.fieldSelectCaret}><CaretDown /></span>
        </div>
      </div>
    );
  };

  const renderTinInput = (
    s: FatcaSection,
    index: number,
    idPrefix: string,
    groupClass: string
  ) => {
    const id = `${idPrefix}-tinNumber-${index}`;
    return (
      <div className={groupClass}>
        <label className={styles.fieldLabel} htmlFor={id}>
          TAX Identification Number (TIN)
        </label>
        <input
          id={id}
          type="text"
          className={styles.fieldInput}
          placeholder="Enter number"
          value={s.tinNumber}
          onChange={(e) => updateSection(index, 'tinNumber', e.target.value)}
        />
      </div>
    );
  };

  const sectionHeader = (index: number) => (
    <div className={styles.sectionHeader}>
      <span className={styles.sectionRoman}>{ROMAN[index]}</span>
      <h2 className={styles.sectionTitle}>FATCA Details {ROMAN[index]}</h2>
    </div>
  );

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
        {sections.map((s, index) => (
          <div className={styles.section} key={index}>
            {sectionHeader(index)}
            {SELECT_FIELDS.map(({ field, label }) =>
              renderSelect(s, index, field, label, 'mob', styles.fieldGroup)
            )}
            {renderTinInput(s, index, 'mob', styles.fieldGroup)}
          </div>
        ))}
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
            {sections.map((s, index) => (
              <div className={styles.section} key={index}>
                {sectionHeader(index)}
                <div className={styles.desktopFieldGrid}>
                  {SELECT_FIELDS.map(({ field, label }) =>
                    renderSelect(s, index, field, label, 'desk', styles.desktopFieldGroup)
                  )}
                  {renderTinInput(s, index, 'desk', styles.desktopFieldGroupFull)}
                </div>
              </div>
            ))}
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
