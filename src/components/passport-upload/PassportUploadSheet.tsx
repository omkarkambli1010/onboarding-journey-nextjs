'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './passport-upload.module.scss';

// PassportUploadSheet — bottom-sheet modal overlay
// Figma: Onboarding-Mob-Passport-Upload (0:38143) — choose state
//        Onboarding-Mob-Passport-Upload-Front (0:37918) — uploading state
//
// Usage A — inline modal (renders over the parent page, previous content visible behind dim):
//   <PassportUploadSheet side="front" onClose={() => setOpen(false)} onProceed={() => router.push('/passportUpload/front')} />
//
// Usage B — standalone page route (upload-front/page.jsx, upload-back/page.jsx):
//   <PassportUploadSheet side="front" />   ← falls back to router.back() / router.push()

type Side = 'front' | 'back';
type SheetState = 'choose' | 'uploading';

interface PassportUploadSheetProps {
  side: Side;
  onClose?: () => void;   // override default router.back()
  onProceed?: () => void; // override default route navigation
}

// ─── Asset URLs from Figma (node 0:38143) ────────────────────────────────────
const ASSET_CAMERA   = 'https://www.figma.com/api/mcp/asset/37083d30-0049-402f-bca5-25b9a272c5d5';
const ASSET_UPLOAD   = 'https://www.figma.com/api/mcp/asset/879a559d-42f4-4263-9f04-5ef9d74da969';
const ASSET_DASH     = 'https://www.figma.com/api/mcp/asset/bfbfd670-2ca3-4edb-9e7f-f51df23d3da1';
const ASSET_CLOSE    = 'https://www.figma.com/api/mcp/asset/6c930596-2ca6-42d0-acf3-dedb67ecad77';

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
export default function PassportUploadSheet({ side, onClose, onProceed }: PassportUploadSheetProps) {
  const router = useRouter();
  const [sheetState, setSheetState] = useState<SheetState>('choose');
  const [uploadComplete, setUploadComplete] = useState(false);

  const title    = side === 'front' ? 'Upload Passport Front' : 'Upload Passport Back';
  const filename = side === 'front' ? 'Passport.jpg' : 'Passportback.jpg';

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      router.back();
    }
  };

  const handleProceed = () => {
    if (onProceed) {
      onProceed();
    } else if (side === 'front') {
      router.push('/passportUpload/front');
    } else {
      router.push('/passportUpload/back');
    }
  };

  const handlePickFile = () => {
    setSheetState('uploading');
    // Simulate upload completing after 2 s → enables Proceed
    setTimeout(() => setUploadComplete(true), 2000);
  };

  const handleReupload = () => {
    setSheetState('choose');
    setUploadComplete(false);
  };

  return (
    // position:fixed + inset:0 overlays the entire viewport including the AppShell
    // header. When rendered inline inside a parent page, the parent content is
    // visible behind the rgba(0,0,0,0.4) dim — matching the Figma bottom-sheet pattern.
    <div
      className={styles.sheetPage}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => {
        // Close when user taps the dim area (outside the card)
        if (e.target === e.currentTarget) handleClose();
      }}
    >
      <div className={styles.sheetCard}>

        {/* ── Drag handle ─────────────────────────────────────────────────── */}
        <div className={styles.sheetHandleRow}>
          {/* Using the exact Figma "Dash" asset */}
          <img src={ASSET_DASH} alt="" aria-hidden="true" className={styles.sheetHandleImg} />
        </div>

        {/* ── Title + close ────────────────────────────────────────────────── */}
        <div className={styles.sheetTitleRow}>
          <p className={styles.sheetTitle}>{title}</p>
          <button
            type="button"
            className={styles.sheetCloseBtn}
            onClick={handleClose}
            aria-label="Close"
          >
            {/* Using the exact Figma tabler-icon-x asset */}
            <img src={ASSET_CLOSE} alt="" aria-hidden="true" width={24} height={24} />
          </button>
        </div>

        {sheetState === 'choose' ? (
          <>
            {/* ── Two icon boxes ──────────────────────────────────────────── */}
            <div className={styles.sheetIconRow}>
              {/* Camera box */}
              <button
                type="button"
                className={styles.sheetIconBox}
                onClick={handlePickFile}
                aria-label="Take photo with camera"
              >
                <img src={ASSET_CAMERA} alt="" aria-hidden="true" width={26} height={24} />
              </button>

              {/* Upload box */}
              <button
                type="button"
                className={styles.sheetIconBox}
                onClick={handlePickFile}
                aria-label="Upload from files"
              >
                <img src={ASSET_UPLOAD} alt="" aria-hidden="true" width={24} height={24} />
              </button>
            </div>

            {/* ── Disclaimer — 3 separate lines matching Figma layout ──────── */}
            <div className={styles.sheetDisclaimerBlock}>
              <p className={styles.sheetDisclaimer}>Files supported: JPG, PNG &amp; PDF</p>
              <p className={styles.sheetDisclaimer}>Maximum size less than 5 MB</p>
              <p className={styles.sheetDisclaimer}>
                Please ensure that you don&apos;t upload password protected documents
              </p>
            </div>
          </>
        ) : (
          <>
            {/* ── File chip + progress bar ─────────────────────────────────── */}
            <div className={styles.sheetProgressBlock}>
              <div className={styles.fileChip}>
                <IconFile />
                <span className={styles.fileChipName}>{filename}</span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{
                    width: uploadComplete ? '100%' : '60%',
                    transition: 'width 1.8s ease',
                  }}
                />
              </div>
            </div>

            {/* ── Buttons ──────────────────────────────────────────────────── */}
            <div className={styles.sheetButtonRow}>
              <button type="button" className={styles.reuploadBtn} onClick={handleReupload}>
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
