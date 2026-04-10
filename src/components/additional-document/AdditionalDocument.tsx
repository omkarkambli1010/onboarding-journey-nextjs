'use client';

import { useState } from 'react';
import styles from './additional-document.module.scss';

// AdditionalDocument — TRUE MODAL OVERLAY (not a page)
// Figma: desktop dialog 0:48996 (inside 0:48751)
//        mobile sheet   0:49036
//
// Props:
//   onClose   — close the modal (backdrop click, X button)
//   onProceed — upload complete → proceed to next step
//   onSkip    — skip this optional document → proceed

// ── Figma assets ──────────────────────────────────────────────────────────

// Mobile sheet (0:49036)
const ASSET_DASH       = 'https://www.figma.com/api/mcp/asset/b385b6e3-0476-4b9b-adf6-7d5e3edb08ea';
const ASSET_CLOSE_MOB  = 'https://www.figma.com/api/mcp/asset/d4a0771b-47c8-4b4a-9ef0-4ad02cdf0a1d';
const ASSET_CAMERA     = 'https://www.figma.com/api/mcp/asset/3aa91b5c-0668-4c02-a2e1-ae4443981aa2';
const ASSET_UPLOAD_MOB = 'https://www.figma.com/api/mcp/asset/82ad56e8-e409-41e3-a181-2d1a11f641a3';

// Desktop dialog (0:48996)
const ASSET_CLOSE_DESK  = 'https://www.figma.com/api/mcp/asset/00ab8bfc-91f6-4e85-835e-68ae5f93a847';
const ASSET_UPLOAD_DESK = 'https://www.figma.com/api/mcp/asset/9211ad52-aec1-4e47-af44-90b3d1fd7391';

// Uploading state — file chip icons
const ASSET_FILE_ICON  = 'https://www.figma.com/api/mcp/asset/363d4a31-140d-4ff8-9c92-842bc2843056';
const ASSET_CHIP_CLOSE = 'https://www.figma.com/api/mcp/asset/91d5a5f3-8c72-486b-8f49-30955ba43663';

// ── Types ─────────────────────────────────────────────────────────────────
type DocState = 'choose' | 'uploading' | 'uploaded' | 'error';

function IconError() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="#d32f2f" strokeWidth="1.4" />
      <path d="M8 4.5v4M8 10.5v1" stroke="#d32f2f" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

interface AdditionalDocumentProps {
  onClose: () => void;
  onProceed: () => void;
  onSkip?: () => void; // defaults to onProceed if not provided
}

export default function AdditionalDocument({ onClose, onProceed, onSkip }: AdditionalDocumentProps) {
  const [docState, setDocState] = useState<DocState>('choose');
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleSkip = onSkip ?? onProceed;

  const handlePickFile = () => {
    setDocState('uploading');
    setUploadComplete(false);
    setTimeout(() => {
      setUploadComplete(true);
      setDocState('uploaded');
    }, 2000);
  };

  const handleReupload = () => {
    setDocState('choose');
    setUploadComplete(false);
  };

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-label="Upload Additional Document"
      onClick={handleBackdropClick}
    >
      <div className={styles.sheet}>

        {/* ── Drag handle — mobile only ─────────────────────────────────── */}
        <div className={styles.handleRow}>
          <img
            src={ASSET_DASH}
            alt=""
            aria-hidden="true"
            className={styles.handleImg}
          />
        </div>

        {/* ── Title + close ─────────────────────────────────────────────── */}
        <div className={styles.titleRow}>
          <p className={styles.title}>Upload Additional Document</p>
          {/* Mobile close (Figma: 0:49052) */}
          <button
            type="button"
            className={`${styles.closeBtn} d-md-none`}
            onClick={onClose}
            aria-label="Close"
          >
            <img src={ASSET_CLOSE_MOB} alt="" aria-hidden="true" width={24} height={24} />
          </button>
          {/* Desktop close (Figma: 0:49009) */}
          <button
            type="button"
            className={`${styles.closeBtn} d-none d-md-flex`}
            onClick={onClose}
            aria-label="Close"
          >
            <img src={ASSET_CLOSE_DESK} alt="" aria-hidden="true" width={24} height={24} />
          </button>
        </div>

        {/* ── Subtitle with (Optional) ────────────────────────────────────── */}
        <p className={styles.subtitle}>
          Requiring English translated copy for non‑English documents
          <span className={styles.subtitleOptional}> (Optional)</span>
        </p>

        {/* ── Choose state ─────────────────────────────────────────────────── */}
        {docState === 'choose' && (
          <>
            {/* Mobile: two 80×80 boxes — camera + upload (Figma: 0:49068) */}
            <div className={styles.iconRowMobile}>
              <button
                type="button"
                className={styles.iconBox}
                onClick={handlePickFile}
                aria-label="Take photo"
              >
                <img src={ASSET_CAMERA} alt="" aria-hidden="true" width={26} height={24} />
              </button>
              <button
                type="button"
                className={styles.iconBox}
                onClick={handlePickFile}
                aria-label="Upload file"
              >
                <img src={ASSET_UPLOAD_MOB} alt="" aria-hidden="true" width={24} height={24} />
              </button>
            </div>

            {/* Desktop: single 80×80 upload box (Figma: 0:49012) */}
            <div className={styles.iconBoxDesktopWrap}>
              <button
                type="button"
                className={styles.iconBox}
                onClick={handlePickFile}
                aria-label="Upload file"
              >
                <img src={ASSET_UPLOAD_DESK} alt="" aria-hidden="true" width={24} height={24} />
              </button>
            </div>
          </>
        )}

        {/* ── Uploading / Uploaded state ───────────────────────────────────── */}
        {(docState === 'uploading' || docState === 'uploaded') && (
          <>
            {/* 48×48 upload cloud icon, left-aligned */}
            <div className={styles.uploadingIconRow}>
              <div className={styles.uploadingIconBox}>
                <img src={ASSET_UPLOAD_MOB} alt="" aria-hidden="true" width={24} height={24} />
              </div>
            </div>

            {/* File chip + progress bar */}
            <div>
              <div className={styles.fileChip}>
                <img src={ASSET_FILE_ICON} alt="" aria-hidden="true" width={16} height={16} />
                <span className={styles.fileChipName}>additionaldoc.pdf</span>
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
                  style={{ width: uploadComplete ? '100%' : '45%' }}
                />
              </div>
            </div>
          </>
        )}

        {/* ── Error state ───────────────────────────────────────────────────── */}
        {docState === 'error' && (
          <>
            <div className={`${styles.fileChip} ${styles.fileChipError}`}>
              <IconError />
              <span className={styles.fileChipName}>additionaldoc.pdf</span>
              <button
                type="button"
                className={styles.fileChipRemove}
                onClick={handleReupload}
                aria-label="Remove file"
              >
                <img src={ASSET_CHIP_CLOSE} alt="" aria-hidden="true" width={16} height={16} />
              </button>
            </div>
            <p className={styles.errorMsg}>
              Upload failed. File may be too large or in an unsupported format.
            </p>
          </>
        )}

        {/* ── Disclaimers — always visible ──────────────────────────────────── */}
        {/* Mobile 12px → Desktop 14px via SCSS media query */}
        <div className={styles.disclaimerBlock}>
          <p className={styles.disclaimerLine}>Files supported: JPG, PNG &amp; PDF</p>
          <p className={styles.disclaimerLine}>Maximum size less than 5 MB</p>
          <p className={styles.disclaimerLine}>
            Please ensure that you don&apos;t upload password protected documents
          </p>
        </div>

        {/* ── Buttons ───────────────────────────────────────────────────────── */}
        <div className={styles.buttonBlock}>
          {/* Choose state: full-width Skip button */}
          {docState === 'choose' && (
            <button type="button" className={styles.primaryBtn} onClick={handleSkip}>
              Skip
            </button>
          )}

          {/* Uploading / Uploaded: Reupload + Proceed side by side */}
          {(docState === 'uploading' || docState === 'uploaded') && (
            <div className={styles.buttonRow}>
              <button type="button" className={styles.reuploadRowBtn} onClick={handleReupload}>
                Reupload
              </button>
              <button
                type="button"
                className={`${styles.proceedRowBtn}${!uploadComplete ? ` ${styles.proceedRowBtnDisabled}` : ''}`}
                onClick={onProceed}
                disabled={!uploadComplete}
                aria-disabled={!uploadComplete}
              >
                Proceed
              </button>
            </div>
          )}

          {/* Error: Try Again full-width */}
          {docState === 'error' && (
            <button type="button" className={styles.outlineBtn} onClick={handleReupload}>
              Try Again
            </button>
          )}
        </div>

      </div>
    </div>
  );
}
