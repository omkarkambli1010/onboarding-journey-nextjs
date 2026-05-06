'use client';

import { useState } from 'react';
import styles from './fatca.module.scss';

// FatcaUploadSheet — bottom-sheet modal for TIN document upload
// Figma: 0:48051 (choose state) + 0:47718 (uploading state)
//
// Props:
//   onClose   — called when user taps dim area or X (choose state only)
//   onProceed — called when upload completes and user taps Proceed

type SheetState = 'choose' | 'uploading';

// Choose state assets (node 0:48051)
const ASSET_CAMERA = 'https://www.figma.com/api/mcp/asset/88bc17ea-c8be-4b60-8bf3-67176da879f7';
const ASSET_UPLOAD = 'https://www.figma.com/api/mcp/asset/17269d34-9155-42f9-8e62-cf47bd5b6090';
const ASSET_CLOSE  = 'https://www.figma.com/api/mcp/asset/b4da9cfc-bf42-4406-b681-4844e5ea92d5';

// Uploading state assets (node 0:47718)
const ASSET_UPLOAD_CLOUD = 'https://www.figma.com/api/mcp/asset/6fbd06db-ee99-4514-920a-5d10783e62d3';
const ASSET_FILE_ICON    = 'https://www.figma.com/api/mcp/asset/363d4a31-140d-4ff8-9c92-842bc2843056';
const ASSET_CHIP_CLOSE   = 'https://www.figma.com/api/mcp/asset/91d5a5f3-8c72-486b-8f49-30955ba43663';

interface FatcaUploadSheetProps {
  onClose: () => void;
  onProceed: () => void;
}

export default function FatcaUploadSheet({ onClose, onProceed }: FatcaUploadSheetProps) {
  const [sheetState, setSheetState] = useState<SheetState>('choose');
  const [uploadComplete, setUploadComplete] = useState(false);

  const handlePickFile = () => {
    setSheetState('uploading');
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
      aria-label="Upload TIN Document"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className={styles.sheetCard}>

        {/* Drag handle */}
        <div className={styles.sheetHandleRow}>
          <div className={styles.sheetHandle} />
        </div>

        {sheetState === 'choose' ? (
          <>
            {/* Title + close — choose state (Figma: 0:48064) */}
            <div className={styles.sheetTitleRow}>
              <p className={styles.sheetTitle}>Upload TIN Document</p>
              <button type="button" className={styles.sheetCloseBtn} onClick={onClose} aria-label="Close">
                <img src={ASSET_CLOSE} alt="" aria-hidden="true" width={24} height={24} />
              </button>
            </div>

            {/* Camera + Upload icon boxes — gap-48px (Figma: 0:48081) */}
            <div className={styles.sheetIconRow}>
              <button type="button" className={styles.sheetIconBox} onClick={handlePickFile} aria-label="Take photo">
                <img src={ASSET_CAMERA} alt="" aria-hidden="true" width={26} height={24} />
              </button>
              <button type="button" className={styles.sheetIconBox} onClick={handlePickFile} aria-label="Upload file">
                <img src={ASSET_UPLOAD} alt="" aria-hidden="true" width={24} height={24} />
              </button>
            </div>

            {/* Disclaimer lines (Figma: 0:48099) */}
            <div className={styles.sheetDisclaimerBlock}>
              <p className={styles.sheetDisclaimerLine}>Files supported: JPG, PNG &amp; PDF</p>
              <p className={styles.sheetDisclaimerLine}>Maximum size less than 5 MB</p>
              <p className={styles.sheetDisclaimerLine}>
                Please ensure that you don&apos;t upload password protected documents
              </p>
            </div>
          </>
        ) : (
          <>
            {/* Upload cloud icon — single, left-aligned (Figma: 0:47730) */}
            <div className={styles.sheetUploadIconRow}>
              <div className={styles.sheetUploadIconBox}>
                <img src={ASSET_UPLOAD_CLOUD} alt="" aria-hidden="true" width={24} height={24} />
              </div>
            </div>

            {/* Centered title (Figma: 0:47739) */}
            <p className={styles.sheetTitleCenter}>Upload TIN Document</p>

            {/* File chip + progress bar (Figma: 0:47752) */}
            <div className={styles.sheetProgressBlock}>
              <div className={styles.fileChip}>
                <img src={ASSET_FILE_ICON} alt="" aria-hidden="true" width={16} height={16} />
                <span className={styles.fileChipName}>tincopy.pdf</span>
                <button
                  type="button"
                  className={styles.fileChipRemove}
                  onClick={handleReupload}
                  aria-label="Remove file"
                >
                  <img src={ASSET_CHIP_CLOSE} alt="" aria-hidden="true" width={16} height={16} />
                </button>
              </div>
              <div className={styles.progressTrack}>
                <div
                  className={styles.progressFill}
                  style={{ width: uploadComplete ? '100%' : '42%' }}
                />
              </div>
            </div>

            {/* Disclaimer lines (Figma: 0:47765) */}
            <div className={styles.sheetDisclaimerBlock}>
              <p className={styles.sheetDisclaimerLine}>Files supported: JPG, PNG &amp; PDF</p>
              <p className={styles.sheetDisclaimerLine}>Maximum size less than 5 MB</p>
              <p className={styles.sheetDisclaimerLine}>
                Please ensure that you don&apos;t upload password protected documents
              </p>
            </div>

            {/* Reupload + Proceed (Figma: 0:47769) */}
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
