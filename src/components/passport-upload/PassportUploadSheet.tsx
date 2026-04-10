'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './passport-upload.module.scss';

// PassportUploadSheet — bottom-sheet upload UI (choose → uploading → done states)
// Figma: Onboarding-Mob-Passport-Upload (0:38143) — choose state
//        Onboarding-Mob-Passport-Upload-Front (0:37918) — uploading state
// Rendered as a full-page route with a fixed overlay; works for both front and back.

type Side = 'front' | 'back';
type SheetState = 'choose' | 'uploading';

// ─── SVG: Camera icon ────────────────────────────────────────────────────────
function IconCamera() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2v11Z"
        stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="12" cy="13" r="4" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── SVG: Upload cloud icon ──────────────────────────────────────────────────
function IconUploadCloud() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <polyline points="16 16 12 12 8 16" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="12" x2="12" y2="21" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path
        d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"
        stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── SVG: Close × icon ───────────────────────────────────────────────────────
function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M12 4L4 12M4 4L12 12" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// ─── SVG: File icon (for chip) ───────────────────────────────────────────────
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

// ─── Main component ──────────────────────────────────────────────────────────
export default function PassportUploadSheet({ side }: { side: Side }) {
  const router = useRouter();
  const [sheetState, setSheetState] = useState<SheetState>('choose');
  // uploadComplete: true once the simulated upload finishes (enables Proceed)
  const [uploadComplete, setUploadComplete] = useState(false);

  const title = side === 'front' ? 'Upload Passport Front' : 'Upload Passport Back';
  const filename = side === 'front' ? 'Passport.jpg' : 'Passportback.jpg';

  const handleClose = () => router.back();

  const simulateUpload = () => {
    setSheetState('uploading');
    // Simulate upload completing after 2 seconds
    setTimeout(() => setUploadComplete(true), 2000);
  };

  const handleReupload = () => {
    setSheetState('choose');
    setUploadComplete(false);
  };

  const handleProceed = () => {
    if (side === 'front') {
      router.push('/passportUpload/front');
    } else {
      router.push('/passportUpload/back');
    }
  };

  return (
    // position:fixed covers the full viewport including the AppShell header.
    // Using min-height:100vh inside <main> would add to header height and push
    // the sheet card below the viewport (Bug 1 fix).
    <div className={styles.sheetPage} aria-label={title} role="dialog" aria-modal="true">
      <div className={styles.sheetCard}>

        {/* Drag handle */}
        <div className={styles.sheetHandleRow}>
          <div className={styles.sheetHandle} />
        </div>

        {/* Title + close */}
        <div className={styles.sheetTitleRow}>
          <p className={styles.sheetTitle}>{title}</p>
          <button type="button" className={styles.sheetCloseBtn} onClick={handleClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        {sheetState === 'choose' ? (
          <>
            {/* Two icon boxes: Camera + Upload */}
            <div className={styles.sheetIconRow}>
              <button
                type="button"
                className={styles.sheetIconBox}
                onClick={simulateUpload}
                aria-label="Take photo with camera"
              >
                <IconCamera />
                <span className={styles.sheetIconLabel}>Camera</span>
              </button>

              <button
                type="button"
                className={styles.sheetIconBox}
                onClick={simulateUpload}
                aria-label="Upload from files"
              >
                <IconUploadCloud />
                <span className={styles.sheetIconLabel}>Upload</span>
              </button>
            </div>

            {/* Disclaimer — {'\n'} renders as line breaks via white-space:pre-line (Bug 3 fix) */}
            <p className={styles.sheetDisclaimer}>
              {'Files supported: JPG, PNG & PDF\nMaximum size less than 5 MB\nPlease ensure that you don\'t upload password protected documents'}
            </p>
          </>
        ) : (
          <>
            {/* File chip + progress bar */}
            <div className={styles.sheetProgressBlock}>
              <div className={styles.fileChip}>
                <IconFile />
                <span className={styles.fileChipName}>{filename}</span>
              </div>
              <div className={styles.progressTrack}>
                {/* progressFill width animates to 100% when uploadComplete */}
                <div
                  className={styles.progressFill}
                  style={{ width: uploadComplete ? '100%' : '60%', transition: 'width 1.8s ease' }}
                />
              </div>
            </div>

            {/* Buttons — Proceed is disabled until upload completes (Bug 4 fix) */}
            <div className={styles.sheetButtonRow}>
              <button
                type="button"
                className={styles.reuploadBtn}
                onClick={handleReupload}
              >
                Reupload
              </button>
              <button
                type="button"
                className={`${styles.sheetProceedBtn}${!uploadComplete ? ` ${styles.sheetProceedBtnDisabled}` : ''}`}
                onClick={handleProceed}
                disabled={!uploadComplete}
                aria-disabled={!uploadComplete}
              >
                Proceed
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
