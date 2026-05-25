'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './oci.module.scss';
import OciUploadSheet from './OciUploadSheet';
import { ociStore, type OciFile, type OciSide } from './ociStore';

// OciFront — Screen 2: Upload OCI Front result (file chip + image preview)
// Figma: Onboarding-Mob-OCI/PIO-Upload-Front (0:40145)
//        Figma: Onboarding-Web-OCI/PIO-Upload-Front (0:40234)

function IconBackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19 12H5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L5 12L12 5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconFile() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M13.333 7.333 7.667 13a3 3 0 0 1-4.241-4.243l5.83-5.83a2 2 0 0 1 2.83 2.83L6.4 11.643a1 1 0 0 1-1.414-1.414l5.057-5.057"
        stroke="#280071" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"
      />
    </svg>
  );
}

function IconCloseChip() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M7.5 2.5L2.5 7.5M2.5 2.5L7.5 7.5" stroke="#2B2B2B" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function FileChip({ filename, onRemove }: { filename: string; onRemove: () => void }) {
  return (
    <div className={styles.fileChip}>
      <IconFile />
      <span className={styles.fileChipName}>{filename}</span>
      <button type="button" className={styles.fileChipRemove} onClick={onRemove} aria-label="Remove file">
        <IconCloseChip />
      </button>
    </div>
  );
}

export default function OciFront() {
  const router = useRouter();
  const [file, setFile] = useState<OciFile | null>(null);
  // `uploadSheet` is the side currently being uploaded. 'front' re-uploads in
  // place; 'back' advances to /oci/back via the sheet's onProceed.
  const [uploadSheet, setUploadSheet] = useState<OciSide | null>(null);

  // Hard reload empties the store — bounce back to the OCI form.
  useEffect(() => {
    const f = ociStore.get('front');
    if (!f) {
      router.replace('/oci');
      return;
    }
    setFile(f);
  }, [router]);

  const handleBack = () => router.back();
  const handleReupload = () => setUploadSheet('front');
  const handleUploadBack = () => setUploadSheet('back');

  // 'front' refreshes the preview in place; 'back' advances to the back screen.
  const handleSheetProceed = () => {
    if (uploadSheet === 'front') {
      setFile(ociStore.get('front'));
      setUploadSheet(null);
    } else {
      router.push('/oci/back');
    }
  };

  if (!file) return null;

  const previewContent =
    file.type === 'application/pdf' ? (
      <p className={styles.pdfPreviewNote}>PDF uploaded — preview not available</p>
    ) : (
      <img src={file.objectUrl} alt="OCI card front" className={styles.previewImg} />
    );

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
          <FileChip filename={file.name} onRemove={handleReupload} />
          <div className={styles.previewZone}>{previewContent}</div>
        </div>

        {/* Fixed bottom — two buttons */}
        <div className={styles.mobileDoubleButtonArea}>
          <button type="button" className={styles.mobileProceedBtn} onClick={handleUploadBack}>
            Upload OCI Back
          </button>
          <button type="button" className={styles.mobileOutlineBtn} onClick={handleReupload}>
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
              <FileChip filename={file.name} onRemove={handleReupload} />
              <div className={styles.previewZone}>{previewContent}</div>
            </div>

            <div className={styles.desktopDoubleButtonWrapper}>
              <button type="button" className={styles.desktopProceedBtn} onClick={handleUploadBack}>
                Upload OCI Back
              </button>
              <button type="button" className={styles.desktopOutlineBtn} onClick={handleReupload}>
                Re-upload
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Upload sheet — 'front' re-uploads in place, 'back' advances to /oci/back */}
      {uploadSheet && (
        <OciUploadSheet
          side={uploadSheet}
          onClose={() => setUploadSheet(null)}
          onProceed={handleSheetProceed}
        />
      )}
    </>
  );
}
