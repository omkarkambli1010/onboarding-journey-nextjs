'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUploadCard } from '@/components/file-upload/FileUploadCard';
import type { UploadedFile } from '@/components/file-upload/fileUpload.types';
import AdditionalDocument from '@/components/additional-document/AdditionalDocument';
import styles from './oci.module.scss';

// OciUploadAll — all-in-one OCI/PIO upload screen (passport-upload style).
// Reached from /oci (the Document Type + Card No. landing page). Two sections:
//   • Upload OCI Front — inline file-upload dropzone (FileUploadCard).
//   • Upload OCI Back  — inline file-upload dropzone (FileUploadCard).
// Both are required before the user can advance to the Additional Document step.

// ── Upload constraints ──────────────────────────────────────────────────────
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_LABEL = 'PDF, JPG, JPEG, HEIC & PNG';
const SIZE_ERR = 'File size exceeds 5MB. Please upload PDF, JPG, JPEG, HEIC, PNG only.';
const TYPE_ERR = 'Unsupported file type. Please upload PDF, JPG, JPEG, HEIC, PNG only.';

function IconBackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19 12H5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L5 12L12 5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OciUploadAll() {
  const router = useRouter();

  const [frontFiles, setFrontFiles] = useState<UploadedFile[]>([]);
  const [backFiles,  setBackFiles]  = useState<UploadedFile[]>([]);
  const [showAdditional, setShowAdditional] = useState(false);

  const frontUploaded = frontFiles.some((f) => f.status === 'success');
  const backUploaded  = backFiles.some((f) => f.status === 'success');

  const isDisabled = !frontUploaded || !backUploaded;

  const handleBack = () => router.back();

  // Mirrors the old OciBack flow — opens the Additional Document modal overlay.
  const handleProceed = () => {
    if (isDisabled) return;
    setShowAdditional(true);
  };

  // ── Front section ──────────────────────────────────────────────────────────
  const frontSection = (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Upload OCI Front</p>
      <FileUploadCard
        acceptedTypes={ACCEPTED_TYPES}
        maxSize={MAX_SIZE}
        acceptedLabel={ACCEPTED_LABEL}
        sizeErrorMessage={SIZE_ERR}
        typeErrorMessage={TYPE_ERR}
        cropImages
        onFilesChange={setFrontFiles}
      />
    </div>
  );

  // ── Back section ───────────────────────────────────────────────────────────
  const backSection = (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>Upload OCI Back</p>
      <FileUploadCard
        acceptedTypes={ACCEPTED_TYPES}
        maxSize={MAX_SIZE}
        acceptedLabel={ACCEPTED_LABEL}
        sizeErrorMessage={SIZE_ERR}
        typeErrorMessage={TYPE_ERR}
        cropImages
        onFilesChange={setBackFiles}
      />
    </div>
  );

  return (
    <>
      {/* ═══ MOBILE LAYOUT ════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Upload OCI/PIO">

        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>
            <div className={styles.mobileTopRow}>
              <button type="button" className={styles.mobileBackBtn} onClick={handleBack} aria-label="Go back">
                <IconBackArrow />
              </button>
            </div>
            <div className={styles.mobileTitleBlock}>
              <h1 className={styles.mobileTitle}>Upload OCI/PIO</h1>
              <p className={styles.mobileSubtitle}>
                Upload your OCI/PIO card (front &amp; back) for verification.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.mobileCard}>
          {frontSection}
          {backSection}
        </div>

        <div className={styles.mobileProceedArea}>
          <button
            type="button"
            className={`${styles.mobileProceedBtn}${isDisabled ? ` ${styles.mobileProceedBtnDisabled}` : ''}`}
            onClick={handleProceed}
            disabled={isDisabled}
            aria-disabled={isDisabled}
          >
            Upload Additional Document
          </button>
        </div>

      </div>

      {/* ═══ DESKTOP LAYOUT ═══════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Upload OCI/PIO">
        <div className={styles.desktopCard}>

          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={handleBack} aria-label="Go back">
              <IconBackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <h1 className={styles.desktopCardTitle}>Upload OCI/PIO</h1>
              <p className={styles.desktopCardSubtitle}>
                Upload your OCI/PIO card (front &amp; back) for verification.
              </p>
            </div>
          </div>

          <div className={styles.desktopCardBody}>
            <div className={styles.desktopContentArea}>
              {frontSection}
              {backSection}
            </div>

            <div className={styles.desktopProceedWrapper}>
              <button
                type="button"
                className={`${styles.desktopProceedBtn}${isDisabled ? ` ${styles.desktopProceedBtnDisabled}` : ''}`}
                onClick={handleProceed}
                disabled={isDisabled}
                aria-disabled={isDisabled}
              >
                Upload Additional Document
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Additional Document modal overlay — on successful upload the modal
          routes to the dedicated /additional-document/preview screen. */}
      {showAdditional && (
        <AdditionalDocument
          onClose={() => setShowAdditional(false)}
          onProceed={() => router.push('/additional-document/preview')}
          onSkip={() => router.push('/esign')}
        />
      )}
    </>
  );
}
