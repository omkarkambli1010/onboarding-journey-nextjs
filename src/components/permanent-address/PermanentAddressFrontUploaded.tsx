'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './permanent-address.module.scss';
import { MobileUploadModal, DesktopUploadModal } from './UploadModal';

// Screen 2 — Front Document Uploaded (preview + extracted address)
// Figma: Onboarding-Mob-PermanentAddress-Noselection (0:43330)
//        Onboarding-Web-PermanentAddress-Noselection (0:43428)
// Route: /permanentAddress/step-1

// Figma assets
const ASSET_DL_FRONT  = 'https://www.figma.com/api/mcp/asset/50e89294-f123-4ebc-8629-8974094f6474';
const ASSET_PAPERCLIP = 'https://www.figma.com/api/mcp/asset/e645770c-4330-41f8-9599-5501e1552bba';
const ASSET_CLOSE_SM  = 'https://www.figma.com/api/mcp/asset/29705c5d-55fc-492f-9a31-8c9070fa0c2f';
const ASSET_EDIT_V1   = 'https://www.figma.com/api/mcp/asset/c6d9386d-6208-49bf-ae91-37c418e7ba37';
const ASSET_EDIT_V2   = 'https://www.figma.com/api/mcp/asset/38e4bfb7-e215-4e1a-91ff-0190c2a5b60f';

// Dummy address from Figma
const DUMMY_ADDRESS = 'Lorem Ipsum is simply dummy text of the printing and typesetting industry.';

function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18l-6-6 6-6" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EditIcon() {
  return (
    <div className={styles.editIcon} aria-hidden="true">
      <img src={ASSET_EDIT_V1} alt="" className={styles.editIconPath} />
      <img src={ASSET_EDIT_V2} alt="" className={styles.editIconDot} />
    </div>
  );
}

export default function PermanentAddressFrontUploaded() {
  const router = useRouter();

  // Retrieve the selected proof type (saved by screen 1) or fall back to default
  const proofType =
    (typeof window !== 'undefined' && sessionStorage.getItem('pa_proofType')) ||
    'Driving License';

  const [showUploadModal, setShowUploadModal] = useState(false);

  // Modal title for uploading the BACK document
  const modalTitle = `Upload ${proofType} Back`;

  // After confirming back upload in modal → go to review screen
  const handleUploadConfirm = () => {
    router.push('/permanentAddress/review');
  };

  // ── MOBILE ─────────────────────────────────────────────────────────────────
  const mobileLayout = (
    <div className={styles.mobilePage}>

      {/* Header */}
      {/* Figma: title "Upload Driving License Front", subtitle same */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderInner}>
          <button
            type="button"
            className={styles.mobileBackBtn}
            onClick={() => router.push('/permanentAddress')}
            aria-label="Go back"
          >
            <BackArrow />
          </button>
          <div className={styles.mobileTitleBlock}>
            {/* Figma: 16px SemiBold #2b2b2b */}
            <h1 className={styles.mobileTitle}>Upload {proofType} Front</h1>
            {/* Figma: 12px Regular #2b2b2b */}
            <p className={styles.mobileSubtitle}>
              To fetch your Indian address using Aadhaar, your mobile number must be linked to Aadhaar
            </p>
          </div>
        </div>
      </div>

      {/* White scrollable card */}
      {/* Figma: bg white, border-top-radius 24px, shadow, p-24, gap-28 */}
      <div className={`${styles.mobileCard} ${styles.mobileCardGap28}`}>

        {/* File chip */}
        {/* Figma: bg #f3f1ff, border dashed #e1e8f1, rounded-8, h-47, px-16 */}
        <div className={styles.fileChip}>
          <div className={styles.fileChipLeft}>
            <img src={ASSET_PAPERCLIP} alt="" width={16} height={16} aria-hidden="true" />
            <span className={styles.fileChipName}>DrivingLicense.jpg</span>
          </div>
          {/* × removes the uploaded file → back to screen 1 */}
          <button
            type="button"
            className={styles.fileChipClose}
            onClick={() => router.push('/permanentAddress')}
            aria-label="Remove uploaded file"
          >
            <img src={ASSET_CLOSE_SM} alt="" width={10} height={10} aria-hidden="true" />
          </button>
        </div>

        {/* DL front image preview */}
        {/* Figma: border dashed #d9d9d9, rounded-16, py-16, image 221×137 */}
        <div className={styles.imagePreview}>
          <img src={ASSET_DL_FRONT} alt="Driving License Front" className={styles.imagePreviewImg} />
        </div>

        {/* Extracted address box */}
        {/* Figma: bg rgba(236,238,255,0.5), border dashed #c3c7ed, rounded-8, p-16, w-312 */}
        <div className={styles.infoBox}>
          <button type="button" className={styles.infoBoxEditBtn} aria-label="Edit address">
            <EditIcon />
          </button>
          {/* Figma: 14px Regular + SemiBold mix, line-height 21px */}
          <p className={styles.infoBoxText}>
            <span className={styles.infoLabel}>Address: </span>
            <span className={styles.infoValue}>{DUMMY_ADDRESS}</span>
          </p>
        </div>

      </div>

      {/* Fixed bottom buttons: primary + outline */}
      {/* Figma: gap-12, pb-16 */}
      <div className={styles.mobileProceedArea}>
        {/* Primary: "Upload Driving License Back" → opens upload modal for back doc */}
        {/* Figma: h-48, w-328, bg #280071, 16px SemiBold white */}
        <button
          type="button"
          className={styles.mobileProceedBtn}
          onClick={() => setShowUploadModal(true)}
        >
          Upload {proofType} Back
        </button>
        {/* Outline: "Re-upload" → goes back to screen 1 */}
        {/* Figma: h-48, w-328, border #280071, 16px Regular #280071 */}
        <button
          type="button"
          className={styles.mobileOutlineBtn}
          onClick={() => router.push('/permanentAddress')}
        >
          Re-upload
        </button>
      </div>

      {/* Mobile upload bottom sheet for back document */}
      {showUploadModal && (
        <MobileUploadModal
          title={modalTitle}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadConfirm}
        />
      )}
    </div>
  );

  // ── DESKTOP ────────────────────────────────────────────────────────────────
  const desktopLayout = (
    <div className={styles.desktopPage}>
      <div className={styles.desktopCard}>

        {/* Header */}
        {/* Figma: flex, gap-8, p-24, border-bottom 0.5px #d9d9d9 */}
        <div className={styles.desktopCardHeader}>
          <button
            type="button"
            className={styles.desktopBackBtn}
            onClick={() => router.push('/permanentAddress')}
            aria-label="Go back"
          >
            <BackArrow />
          </button>
          <div className={styles.desktopTitleBlock}>
            <h1 className={styles.desktopCardTitle}>Upload {proofType} Front</h1>
            <p className={styles.desktopCardSubtitle}>
              To fetch your Indian address using Aadhaar, your mobile number must be linked to Aadhaar
            </p>
          </div>
        </div>

        {/* Body */}
        <div className={styles.desktopCardBody}>
          <div className={styles.desktopUploadedArea}>

            {/* File chip */}
            <div className={styles.fileChip}>
              <div className={styles.fileChipLeft}>
                <img src={ASSET_PAPERCLIP} alt="" width={16} height={16} aria-hidden="true" />
                <span className={styles.fileChipName}>DrivingLicense.jpg</span>
              </div>
              <button
                type="button"
                className={styles.fileChipClose}
                onClick={() => router.push('/permanentAddress')}
                aria-label="Remove uploaded file"
              >
                <img src={ASSET_CLOSE_SM} alt="" width={10} height={10} aria-hidden="true" />
              </button>
            </div>

            {/* DL front image */}
            <div className={styles.imagePreview}>
              <img src={ASSET_DL_FRONT} alt="Driving License Front" className={styles.imagePreviewImg} />
            </div>

            {/* Extracted address box */}
            <div className={styles.infoBox}>
              <button type="button" className={styles.infoBoxEditBtn} aria-label="Edit address">
                <EditIcon />
              </button>
              <p className={styles.infoBoxText}>
                <span className={styles.infoLabel}>Address: </span>
                <span className={styles.infoValue}>{DUMMY_ADDRESS}</span>
              </p>
            </div>

          </div>

          {/* Dual button row: Re-Upload (outline) + Upload Back (primary) */}
          {/* Figma (Web 0:43428): Re-Upload left, Upload Driving License Back right */}
          <div className={styles.desktopDualBtnRow}>
            <button
              type="button"
              className={styles.desktopOutlineBtn}
              onClick={() => router.push('/permanentAddress')}
            >
              Re-Upload
            </button>
            <button
              type="button"
              className={styles.desktopProceedBtn}
              onClick={() => setShowUploadModal(true)}
            >
              Upload {proofType} Back
            </button>
          </div>
        </div>
      </div>

      {/* Desktop upload modal for back document */}
      {showUploadModal && (
        <DesktopUploadModal
          title={modalTitle}
          onClose={() => setShowUploadModal(false)}
          onUpload={handleUploadConfirm}
        />
      )}
    </div>
  );

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
}
