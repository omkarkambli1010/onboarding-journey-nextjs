'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './passport-upload.module.scss';

// PassportFrontEdit — Editable passport front details form
// Figma: 0:38363 (named "UploadAadhaar" in Figma but is passport front edit)
// Desktop: Onboarding-Web-Passport-Front-Edit (0:37265)

// ─── Passport front image (from Figma) ──────────────────────────────────────
const PASSPORT_FRONT_IMG = 'https://www.figma.com/api/mcp/asset/ce16443f-9026-4259-8592-68760de290f3';

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
export default function PassportFrontEdit() {
  const router = useRouter();
  const [fields, setFields] = useState(INITIAL_FIELDS);

  const handleBack = () => router.back();

  const handleChange = (key: string, value: string) => {
    setFields((prev) => prev.map((f) => (f.key === key ? { ...f, value } : f)));
  };

  const handleReupload = () => router.push('/passportUpload/upload-front');
  const handleNext = () => router.push('/passportUpload/upload-back');

  return (
    <>
      {/* ═══ MOBILE LAYOUT ══════════════════════════════════════════════════════
          Figma: 0:38363 — Passport Front Edit (360 × 800)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Edit Passport Front Details">

        {/* Gray header */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>
            <div className={styles.mobileTopRow}>
              <button type="button" className={styles.mobileBackBtn} onClick={handleBack} aria-label="Go back">
                <IconBackArrow />
              </button>
            </div>
            <div className={styles.mobileTitleBlock}>
              <h1 className={styles.mobileTitle}>Upload Passport Front</h1>
            </div>
          </div>
        </div>

        {/* White card — scrollable edit form */}
        <div className={styles.mobileCardEdit}>

          {/* Passport front thumbnail */}
          <div className={styles.editImgWrapper}>
            <img
              src={PASSPORT_FRONT_IMG}
              alt="Passport front page"
              className={styles.editPreviewImg}
              width={100}
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
          <button type="button" className={styles.mobileProceedBtn} onClick={handleNext}>
            Upload Passport Back
          </button>
          <button type="button" className={styles.mobileOutlineBtn} onClick={handleReupload}>
            Re-upload
          </button>
        </div>

      </div>

      {/* ═══ DESKTOP LAYOUT ═════════════════════════════════════════════════════
          Figma: 0:37265 — Onboarding-Web-Passport-Front-Edit
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Edit Passport Front Details">
        <div className={styles.desktopCard}>

          {/* Card header */}
          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={handleBack} aria-label="Go back">
              <IconBackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <h1 className={styles.desktopCardTitle}>Upload Passport Front</h1>
            </div>
          </div>

          {/* Card body */}
          <div className={styles.desktopCardBody}>
            <div className={styles.desktopContentArea}>

              {/* Side-by-side: image + fields */}
              <div className={styles.desktopEditRow}>
                <div className={styles.desktopEditImgWrapper}>
                  <img
                    src={PASSPORT_FRONT_IMG}
                    alt="Passport front page"
                    className={styles.desktopEditPreviewImg}
                    width={100}
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
              <button type="button" className={styles.desktopProceedBtn} onClick={handleNext}>
                Upload Passport Back
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
