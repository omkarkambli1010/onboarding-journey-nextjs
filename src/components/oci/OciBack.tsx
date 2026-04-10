'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './oci.module.scss';
import OciUploadSheet from './OciUploadSheet';
import AdditionalDocument from '@/components/additional-document/AdditionalDocument';

// OciBack — Screen 3: Upload OCI Back result (file chip + image preview)
// Figma: Onboarding-Mob-OCI/PIO-Upload-Back (0:40478)
//        Figma: Onboarding-Web-OCI/PIO-Upload-Back (0:40567)

// OCI back document image (Figma asset: imgImage3224 from node 0:40478)
// Figma dimensions: 196×136px
const OCI_BACK_IMG = 'https://www.figma.com/api/mcp/asset/7791f512-bbad-4190-8a62-f317dd244520';

// File icon + close chip icon (same as front)
const ICON_FILE       = 'https://www.figma.com/api/mcp/asset/ac1d0b5e-8e28-43b7-b805-b1103ef48238';
const ICON_CLOSE_CHIP = 'https://www.figma.com/api/mcp/asset/8bde4dee-630a-45cf-8db8-2d8aad4a7f21';

function IconBackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19 12H5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L5 12L12 5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OciBack() {
  const router = useRouter();
  const [showSheet, setShowSheet]           = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const handleBack     = () => router.back();
  const handleReupload = () => setShowSheet(true);
  // Opens Additional Document modal inline over this page
  const handleProceed  = () => setShowAdditional(true);

  return (
    <>
      {/* ═══ MOBILE ═══════════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Upload OCI Back">

        {/* Gray header */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>
            <div className={styles.mobileTopRow}>
              <button type="button" className={styles.mobileBackBtn} onClick={handleBack} aria-label="Go back">
                <IconBackArrow />
              </button>
            </div>
            <div className={styles.mobileTitleBlock}>
              <h1 className={styles.mobileTitle}>Upload OCI Back</h1>
              <p className={styles.mobileSubtitle}>
                Enter your details manually and upload your OCI/PIO (front and back) for verification.
              </p>
            </div>
          </div>
        </div>

        {/* White card — file chip + preview image */}
        <div className={styles.mobileCardUpload}>

          {/* File chip — "OCI.jpeg" */}
          <div className={styles.fileChip}>
            <img src={ICON_FILE} alt="" aria-hidden="true" width={16} height={16} />
            <span className={styles.fileChipName}>OCI.jpeg</span>
            <button type="button" className={styles.fileChipRemove} onClick={handleReupload} aria-label="Remove file">
              <img src={ICON_CLOSE_CHIP} alt="" aria-hidden="true" width={10} height={10} />
            </button>
          </div>

          {/* Dashed image preview zone */}
          <div className={styles.previewZone}>
            {/* Figma: 196×136px OCI back image */}
            <img
              src={OCI_BACK_IMG}
              alt="OCI card back"
              className={styles.previewImg}
              width={196}
              height={136}
            />
          </div>

        </div>

        {/* Fixed bottom — two buttons */}
        <div className={styles.mobileDoubleButtonArea}>
          <button
            type="button"
            className={styles.mobileProceedBtn}
            onClick={handleProceed}
          >
            Upload Additional Document
          </button>
          <button
            type="button"
            className={styles.mobileOutlineBtn}
            onClick={handleReupload}
          >
            Re-Upload
          </button>
        </div>

      </div>

      {/* ═══ DESKTOP ══════════════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Upload OCI Back">
        <div className={styles.desktopCard}>

          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={handleBack} aria-label="Go back">
              <IconBackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <h1 className={styles.desktopCardTitle}>Upload OCI Back</h1>
              <p className={styles.desktopCardSubtitle}>
                Enter your details manually and upload your OCI/PIO (front and back) for verification.
              </p>
            </div>
          </div>

          <div className={styles.desktopCardBody}>
            <div className={styles.desktopContentArea}>

              {/* File chip */}
              <div className={styles.fileChip}>
                <img src={ICON_FILE} alt="" aria-hidden="true" width={16} height={16} />
                <span className={styles.fileChipName}>OCI.jpeg</span>
                <button type="button" className={styles.fileChipRemove} onClick={handleReupload} aria-label="Remove file">
                  <img src={ICON_CLOSE_CHIP} alt="" aria-hidden="true" width={10} height={10} />
                </button>
              </div>

              {/* Preview zone */}
              <div className={styles.previewZone}>
                <img
                  src={OCI_BACK_IMG}
                  alt="OCI card back"
                  className={styles.previewImg}
                  width={196}
                  height={136}
                />
              </div>

            </div>

            <div className={styles.desktopDoubleButtonWrapper}>
              <button type="button" className={styles.desktopProceedBtn} onClick={handleProceed}>
                Upload Additional Document
              </button>
              <button type="button" className={styles.desktopOutlineBtn} onClick={handleReupload}>
                Re-Upload
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Re-upload back sheet modal */}
      {showSheet && (
        <OciUploadSheet
          side="back"
          onClose={() => setShowSheet(false)}
          onProceed={() => setShowSheet(false)}
        />
      )}

      {/* Additional Document modal overlay */}
      {showAdditional && (
        <AdditionalDocument
          onClose={() => setShowAdditional(false)}
          onProceed={() => router.push('/esign')}
          onSkip={() => router.push('/esign')}
        />
      )}
    </>
  );
}
