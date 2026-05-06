'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './passport-upload.module.scss';

// PassportBackEdit — Editable passport back details form
// Figma: 0:36878 — Onboarding-Mob-Passport-Back-Edit
// Desktop: Onboarding-Web-Passport-Back-Edit (0:36487)

// ─── Passport back image (from Figma) ───────────────────────────────────────
const PASSPORT_BACK_IMG = 'https://www.figma.com/api/mcp/asset/267018a4-55a1-4b67-8188-35b4660c09ff';

// ─── Initial field values ────────────────────────────────────────────────────
const INITIAL_FIELDS = [
  { key: 'fullName',        label: 'Full Name',       value: 'Nishit Suresh Shah' },
  { key: 'dob',             label: 'Date of Birth',   value: '04/03/1986'         },
  { key: 'passportNumber',  label: 'Passport Number', value: 'IND121233H'         },
  { key: 'issueDate',       label: 'Issue Date',      value: '04/03/2020'         },
  { key: 'expiryDate',      label: 'Expiry Date',     value: '04/03/2030'         },
  { key: 'nationality',     label: 'Nationality',     value: 'Indian'             },
  { key: 'gender',          label: 'Gender',          value: 'Male'               },
];

// ─── SVG: back arrow ─────────────────────────────────────────────────────────
function IconBackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19 12H5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L5 12L12 5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function PassportBackEdit() {
  const router = useRouter();
  const [fields, setFields] = useState(INITIAL_FIELDS);

  const handleBack = () => router.back();

  const handleChange = (key: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
  };

  const handleReupload = () => router.push('/passportUpload/upload-back');
  const handleProceed = () => router.push('/personalDetailsForm/1');

  return (
    <>
      {/* ═══ MOBILE LAYOUT ══════════════════════════════════════════════════════
          Figma: 0:36878 — Onboarding-Mob-Passport-Back-Edit (360 × 800)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Edit Passport Back Details">

        {/* Gray header */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>
            <div className={styles.mobileTopRow}>
              <button type="button" className={styles.mobileBackBtn} onClick={handleBack} aria-label="Go back">
                <IconBackArrow />
              </button>
            </div>
            <div className={styles.mobileTitleBlock}>
              <h1 className={styles.mobileTitle}>Upload Passport Back</h1>
            </div>
          </div>
        </div>

        {/* White card — scrollable edit form */}
        <div className={styles.mobileCardEdit}>

          {/* Passport back thumbnail */}
          <div className={styles.editImgWrapper}>
            <img
              src={PASSPORT_BACK_IMG}
              alt="Passport back page"
              className={styles.editPreviewImg}
              width={99}
              height={137}
            />
          </div>

          {/* Editable fields */}
          <div className={styles.fieldList}>
            {fields.map(({ key, label, value }) => (
              <div key={key} className={styles.fieldItem}>
                <label htmlFor={`field-${key}`} className={styles.fieldLabel}>
                  {label}
                </label>
                <input
                  id={`field-${key}`}
                  type="text"
                  className={styles.fieldInput}
                  value={value}
                  onChange={(e) => handleChange(key, e.target.value)}
                />
              </div>
            ))}
          </div>

        </div>

        {/* Fixed bottom buttons */}
        <div className={styles.mobileDoubleButtonArea}>
          <button type="button" className={styles.mobileProceedBtn} onClick={handleProceed}>
            Proceed
          </button>
          <button type="button" className={styles.mobileOutlineBtn} onClick={handleReupload}>
            Re-upload
          </button>
        </div>

      </div>

      {/* ═══ DESKTOP LAYOUT ═════════════════════════════════════════════════════
          Figma: 0:36487 — Onboarding-Web-Passport-Back-Edit
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Edit Passport Back Details">
        <div className={styles.desktopCard}>

          {/* Card header */}
          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={handleBack} aria-label="Go back">
              <IconBackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <h1 className={styles.desktopCardTitle}>Upload Passport Back</h1>
            </div>
          </div>

          {/* Card body */}
          <div className={styles.desktopCardBody}>
            <div className={styles.desktopContentArea}>

              {/* Side-by-side: image + fields */}
              <div className={styles.desktopEditRow}>
                <div className={styles.desktopEditImgWrapper}>
                  <img
                    src={PASSPORT_BACK_IMG}
                    alt="Passport back page"
                    className={styles.desktopEditPreviewImg}
                    width={99}
                    height={137}
                  />
                </div>

                <div className={styles.desktopFieldList}>
                  {fields.map(({ key, label, value }) => (
                    <div key={key} className={styles.fieldItem}>
                      <label htmlFor={`desk-field-${key}`} className={styles.fieldLabel}>
                        {label}
                      </label>
                      <input
                        id={`desk-field-${key}`}
                        type="text"
                        className={styles.fieldInput}
                        value={value}
                        onChange={(e) => handleChange(key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Buttons */}
            <div className={styles.desktopDoubleButtonWrapper}>
              <button type="button" className={styles.desktopProceedBtn} onClick={handleProceed}>
                Proceed
              </button>
              <button type="button" className={styles.desktopOutlineBtn} onClick={handleReupload}>
                Re-upload
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
