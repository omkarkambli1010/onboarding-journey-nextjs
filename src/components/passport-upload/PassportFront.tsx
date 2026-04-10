'use client';

import { useRouter } from 'next/navigation';
import styles from './passport-upload.module.scss';

// PassportFront — Upload Passport Front screen
// Figma: Onboarding-Mob-Passport-Front (0:37551) + desktop (0:37656)

// ─── Passport front preview image ───────────────────────────────────────────
// TODO: Replace with actual uploaded image in production
const PASSPORT_FRONT_IMG = 'https://www.figma.com/api/mcp/asset/56f5665e-2106-488d-837d-13e011f620e8';

// ─── Extracted data (hardcoded — binding-friendly) ───────────────────────────
const EXTRACTED_DATA = [
  { label: 'Full Name',        value: 'Nishit Suresh Shah' },
  { label: 'Date of Birth',    value: '04/03/1986'         },
  { label: 'Passport Number',  value: 'IND121233H'         },
  { label: 'Issue Date',       value: '04/03/2020'         },
  { label: 'Expiry Date',      value: '04/03/2030'         },
  { label: 'Nationality',      value: 'Indian'             },
  { label: 'Gender',           value: 'Male'               },
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

// ─── SVG: file icon (for chip) ───────────────────────────────────────────────
function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M9.333 1.333H4a1.333 1.333 0 0 0-1.333 1.334v10.666A1.333 1.333 0 0 0 4 14.667h8a1.333 1.333 0 0 0 1.333-1.334V5.333L9.333 1.333Z"
        stroke="#280071" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M9.333 1.333v4h4" stroke="#280071" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── SVG: close (×) icon for chip ────────────────────────────────────────────
function IconClose() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#2B2B2B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

// ─── SVG: Edit icon (pencil) for extracted data card ─────────────────────────
function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M10.833 1.875a1.326 1.326 0 0 1 1.875 1.875L4.375 12.083l-2.5.625.625-2.5L10.833 1.875Z"
        stroke="#280071" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── File chip ───────────────────────────────────────────────────────────────
// Figma: bg #f3f1ff, border dashed #e1e8f1, h-47px, file icon + filename + ×
function FileChip({ filename, onRemove }: { filename: string; onRemove: () => void }) {
  return (
    <div className={styles.fileChip}>
      <IconFile />
      <span className={styles.fileChipName}>{filename}</span>
      <button type="button" className={styles.fileChipRemove} onClick={onRemove} aria-label="Remove file">
        <IconClose />
      </button>
    </div>
  );
}

// ─── Extracted data card ─────────────────────────────────────────────────────
// Figma: bg rgba(236,238,255,0.5), border dashed #c3c7ed, rounded-8px, p-16
function ExtractedDataCard({ onEdit }: { onEdit: () => void }) {
  return (
    <div className={styles.extractedCard}>
      <button type="button" className={styles.editBtn} onClick={onEdit} aria-label="Edit extracted data">
        <IconEdit />
      </button>
      <div className={styles.extractedRows}>
        {EXTRACTED_DATA.map(({ label, value }) => (
          <div key={label} className={styles.extractedRow}>
            <span className={styles.extractedLabel}>{label}</span>
            <span className={styles.extractedValue}>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function PassportFront() {
  const router = useRouter();

  const handleBack = () => router.back();
  const handleReupload = () => { /* TODO: trigger file picker */ };
  const handleNext = () => router.push('/passportUpload/upload-back');
  const handleEdit = () => router.push('/passportUpload/front-edit');

  return (
    <>
      {/* ═══ MOBILE LAYOUT ══════════════════════════════════════════════════════
          Figma: 0:37551 — Onboarding-Mob-Passport-Front (360 × 800)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Upload Passport Front">

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

        {/* White card — scrollable */}
        <div className={styles.mobileCardUpload}>
          {/* File chip */}
          <FileChip filename="Passport.jpeg" onRemove={handleReupload} />

          {/* Passport image preview zone */}
          <div className={styles.previewZone}>
            <img
              src={PASSPORT_FRONT_IMG}
              alt="Passport front page"
              className={styles.previewImg}
              width={100}
              height={137}
            />
          </div>

          {/* Extracted data */}
          <ExtractedDataCard onEdit={handleEdit} />
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
          Figma: 0:37656 — Desktop card
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Upload Passport Front">
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

              {/* File chip */}
              <FileChip filename="Passport.jpeg" onRemove={handleReupload} />

              {/* Side-by-side: preview + extracted data */}
              <div className={styles.desktopUploadRow}>
                <div className={styles.previewZone}>
                  <img
                    src={PASSPORT_FRONT_IMG}
                    alt="Passport front page"
                    className={styles.previewImg}
                    width={100}
                    height={137}
                  />
                </div>
                <ExtractedDataCard onEdit={handleEdit} />
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
