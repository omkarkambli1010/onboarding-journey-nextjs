'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './oci.module.scss';
import OciUploadSheet from './OciUploadSheet';

// OciFront — Screen 2: Upload OCI Front result (file chip + image preview)
// Figma: Onboarding-Mob-OCI/PIO-Upload-Front (0:40145)
//        Figma: Onboarding-Web-OCI/PIO-Upload-Front (0:40234)

// OCI front document image (Figma asset: imgImage3225 from node 0:40145)
const OCI_FRONT_IMG = 'https://www.figma.com/api/mcp/asset/99f64bd2-ccd8-44aa-b5ba-3f5de4f5adfa';

// File icon (from Figma: imgFrame48096388)
const ICON_FILE = 'https://www.figma.com/api/mcp/asset/ac1d0b5e-8e28-43b7-b805-b1103ef48238';
// Close × icon (from Figma: imgFrame48096389)
const ICON_CLOSE_CHIP = 'https://www.figma.com/api/mcp/asset/8bde4dee-630a-45cf-8db8-2d8aad4a7f21';

function IconBackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19 12H5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L5 12L12 5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function OciFront() {
  const router = useRouter();
  const [showSheet, setShowSheet] = useState(false);

  const handleBack    = () => router.back();
  const handleReupload = () => setShowSheet(true); // Re-upload → go back to choose state via sheet

  return (
    <>
      {/* ═══ MOBILE ═══════════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Upload OCI Front">

        {/* Gray header */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>
            <div className={styles.mobileTopRow}>
              <button type="button" className={styles.mobileBackBtn} onClick={handleBack} aria-label="Go back">
                <IconBackArrow />
              </button>
            </div>
            <div className={styles.mobileTitleBlock}>
              <h1 className={styles.mobileTitle}>Upload OCI Front</h1>
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
            {/* Figma: 99×136px OCI front image */}
            <img
              src={OCI_FRONT_IMG}
              alt="OCI card front"
              className={styles.previewImg}
              width={99}
              height={136}
            />
          </div>

        </div>

        {/* Fixed bottom — two buttons */}
        <div className={styles.mobileDoubleButtonArea}>
          <button
            type="button"
            className={styles.mobileProceedBtn}
            onClick={() => setShowSheet(true)}
          >
            Upload OCI Back
          </button>
          <button
            type="button"
            className={styles.mobileOutlineBtn}
            onClick={handleReupload}
          >
            Re-upload
          </button>
        </div>

      </div>

      {/* ═══ DESKTOP ══════════════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Upload OCI Front">
        <div className={styles.desktopCard}>

          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={handleBack} aria-label="Go back">
              <IconBackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <h1 className={styles.desktopCardTitle}>Upload OCI Front</h1>
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
                  src={OCI_FRONT_IMG}
                  alt="OCI card front"
                  className={styles.previewImg}
                  width={99}
                  height={136}
                />
              </div>

            </div>

            <div className={styles.desktopDoubleButtonWrapper}>
              <button type="button" className={styles.desktopProceedBtn} onClick={() => setShowSheet(true)}>
                Upload OCI Back
              </button>
              <button type="button" className={styles.desktopOutlineBtn} onClick={handleReupload}>
                Re-upload
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* ── Upload back sheet modal (renders inline over this page) ──────── */}
      {showSheet && (
        <OciUploadSheet
          side="back"
          onClose={() => setShowSheet(false)}
          onProceed={() => router.push('/oci/back')}
        />
      )}
    </>
  );
}
