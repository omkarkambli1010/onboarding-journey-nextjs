'use client';

import { useState } from 'react';
import styles from './oci.module.scss';

// OciUploadSheet — bottom-sheet modal for OCI/PIO document upload
// Figma: 0:39418 (choose state) + 0:39757 (uploading state)
//
// Props:
//   side     — 'front' | 'back'
//   onClose  — called when user taps dim area or X
//   onProceed — called when upload completes and user taps Proceed

type Side = 'front' | 'back';
type SheetState = 'choose' | 'uploading';

// Figma assets (node 0:39418)
const ASSET_CAMERA  = 'https://www.figma.com/api/mcp/asset/37083d30-0049-402f-bca5-25b9a272c5d5';
const ASSET_UPLOAD  = 'https://www.figma.com/api/mcp/asset/879a559d-42f4-4263-9f04-5ef9d74da969';
const ASSET_CLOSE   = 'https://www.figma.com/api/mcp/asset/6c930596-2ca6-42d0-acf3-dedb67ecad77';

// Inline SVG file icon for chip
function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9.333 1.333H4a1.333 1.333 0 0 0-1.333 1.334v10.666A1.333 1.333 0 0 0 4 14.667h8a1.333 1.333 0 0 0 1.333-1.334V5.333L9.333 1.333Z"
        stroke="#280071" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.333 1.333v4h4" stroke="#280071" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

interface OciUploadSheetProps {
  side: Side;
  onClose: () => void;
  onProceed: () => void;
}

export default function OciUploadSheet({ side, onClose, onProceed }: OciUploadSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>('choose');
  const [uploadComplete, setUploadComplete] = useState(false);

  const title    = side === 'front' ? 'Upload OCI Front' : 'Upload OCI Back';
  const subtitle = side === 'front'
    ? 'Upload a clear front image of your OCI Card.'
    : 'Upload a clear back image of your OCI Card.';

  const handlePickFile = () => {
    setSheetState('uploading');
    // Simulate upload completing after 2 s
    setTimeout(() => setUploadComplete(true), 2000);
  };

  const handleReupload = () => {
    setSheetState('choose');
    setUploadComplete(false);
  };

  return (
    <div
      className={styles.sheetOverlay}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.sheetCard}>

        {/* Drag handle */}
        <div className={styles.sheetHandleRow}>
          <div className={styles.sheetHandle} />
        </div>

        {/* Title + close */}
        <div className={styles.sheetTitleRow}>
          <p className={styles.sheetTitle}>{title}</p>
          <button type="button" className={styles.sheetCloseBtn} onClick={onClose} aria-label="Close">
            <img src={ASSET_CLOSE} alt="" aria-hidden="true" width={24} height={24} />
          </button>
        </div>

        {sheetState === 'choose' ? (
          <>
            {/* Camera + Upload boxes — gap-48px matching Figma */}
            <div className={styles.sheetIconRow}>
              <button type="button" className={styles.sheetIconBox} onClick={handlePickFile} aria-label="Take photo">
                <img src={ASSET_CAMERA} alt="" aria-hidden="true" width={26} height={24} />
              </button>
              <button type="button" className={styles.sheetIconBox} onClick={handlePickFile} aria-label="Upload file">
                <img src={ASSET_UPLOAD} alt="" aria-hidden="true" width={24} height={24} />
              </button>
            </div>

            {/* Disclaimer lines — Figma: 0:39432 area */}
            <div className={styles.sheetDisclaimerBlock}>
              <p className={styles.sheetDisclaimerLine}>Files supported: JPG, PNG &amp; PDF</p>
              <p className={styles.sheetDisclaimerLine}>Maximum size less than 2 MB</p>
              <p className={styles.sheetDisclaimerLine}>
                Please ensure that you don&apos;t upload password protected documents
              </p>
            </div>
          </>
        ) : (
          <>
            {/* File chip + progress bar */}
            <div className={styles.sheetProgressBlock}>
              <div className={styles.fileChip}>
                <IconFile />
                <span className={styles.fileChipName}>OCI.jpg</span>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: uploadComplete ? '100%' : '60%' }}
                />
              </div>
            </div>

            {/* Info lines — Figma uploading state (0:39757) */}
            <div className={styles.sheetInfoBlock}>
              <p className={styles.sheetInfoLine}>{subtitle}</p>
              <p className={styles.sheetInfoLine}>Files supported: JPG, PNG &amp; PDF</p>
              <p className={styles.sheetInfoLine}>Maximum size less than 4 MB</p>
            </div>

            {/* Reupload + Proceed */}
            <div className={styles.sheetButtonRow}>
              <button type="button" className={styles.reuploadBtn} onClick={handleReupload}>
                Reupload
              </button>
              <button
                type="button"
                className={`${styles.sheetProceedBtn}${!uploadComplete ? ` ${styles.sheetProceedBtnDisabled}` : ''}`}
                onClick={onProceed}
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
