'use client';

import { useRouter } from 'next/navigation';
import styles from './permanent-address.module.scss';

// Screen 3 — Back Document Uploaded + Full Details Review
// Figma: Onboarding-Mob-Document-OCIBack-Uploaded (0:44322)
//        Onboarding-Web-Document-OCIBack-Uploaded (0:44428)
// Route: /permanentAddress/review

// Figma assets
const ASSET_DL_BACK   = 'https://www.figma.com/api/mcp/asset/f747e345-5153-4040-9728-e8915d1b4c29';
const ASSET_PAPERCLIP = 'https://www.figma.com/api/mcp/asset/3fb1b3fe-72c9-4194-a220-40da5744b539';
const ASSET_CLOSE_SM  = 'https://www.figma.com/api/mcp/asset/41a7174d-22a4-4cb2-9fc4-2c0e70d6a8ea';
const ASSET_EDIT_V1   = 'https://www.figma.com/api/mcp/asset/e6cebdbf-5ad9-4e97-aea3-1d206b929f4d';
const ASSET_EDIT_V2   = 'https://www.figma.com/api/mcp/asset/2f196222-78c2-4903-8247-392739f6d8c3';

// Hardcoded details from Figma (dummy values shown in design)
const DUMMY_DETAILS = [
  { label: 'Document Type',   value: 'OCI Card' },
  { label: 'Document Number', value: '1212323' },
  { label: 'Expiry Date',     value: '04/03/2020' },
  { label: 'Country',         value: 'India' },
  { label: 'Address',         value: 'Lorem Ipsume' },
  { label: 'City',            value: 'Mumbai' },
  { label: 'State',           value: 'Maharashtra' },
  { label: 'Pincode',         value: '111111' },
];

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

export default function PermanentAddressReview() {
  const router = useRouter();

  const proofType =
    (typeof window !== 'undefined' && sessionStorage.getItem('pa_proofType')) ||
    'Driving License';

  // ── MOBILE ─────────────────────────────────────────────────────────────────
  const mobileLayout = (
    <div className={styles.mobilePage}>

      {/* Header */}
      {/* Figma: title "Upload Driving License Back", subtitle about Aadhaar/Digilocker */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderInner}>
          <button
            type="button"
            className={styles.mobileBackBtn}
            onClick={() => router.push('/permanentAddress/upload')}
            aria-label="Go back"
          >
            <BackArrow />
          </button>
          <div className={styles.mobileTitleBlock}>
            {/* Figma: 16px SemiBold #2b2b2b */}
            <h1 className={styles.mobileTitle}>Upload {proofType} Back</h1>
            {/* Figma: 12px Regular #2b2b2b */}
            <p className={styles.mobileSubtitle}>
              We need your Aadhaar image, since Digilocker service is down.
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
          {/* × → goes back to step-1 to re-upload back */}
          <button
            type="button"
            className={styles.fileChipClose}
            onClick={() => router.push('/permanentAddress/upload')}
            aria-label="Remove uploaded file"
          >
            <img src={ASSET_CLOSE_SM} alt="" width={10} height={10} aria-hidden="true" />
          </button>
        </div>

        {/* DL back image preview */}
        {/* Figma: border dashed #d9d9d9, rounded-16, py-16, image 222×137 */}
        <div className={styles.imagePreview}>
          <img src={ASSET_DL_BACK} alt="Driving License Back" className={styles.imagePreviewImg} />
        </div>

        {/* Full details box */}
        {/* Figma: bg rgba(236,238,255,0.5), border dashed #c3c7ed, rounded-8, p-16 */}
        {/* Contains: Document Type, Document Number, Expiry Date, Country, Address, City, State, Pincode */}
        <div className={styles.infoBox}>
          <button type="button" className={styles.infoBoxEditBtn} aria-label="Edit details">
            <EditIcon />
          </button>
          {/* Figma: each row = 14px Regular "Label: " + 14px SemiBold "Value", line-height 21px */}
          {DUMMY_DETAILS.map(({ label, value }) => (
            <p key={label} className={styles.infoBoxText}>
              <span className={styles.infoLabel}>{label}: </span>
              <span className={styles.infoValue}>{value}</span>
            </p>
          ))}
        </div>

      </div>

      {/* Fixed bottom buttons: Proceed (primary) + Re-upload (outline) */}
      {/* Figma: gap-12, pb-16 */}
      <div className={styles.mobileProceedArea}>
        {/* Figma: "Proceed" — bg #280071, h-48, w-328, 16px SemiBold white */}
        <button
          type="button"
          className={styles.mobileProceedBtn}
          onClick={() => router.push('/next-route')}
        >
          Proceed
        </button>
        {/* Figma: "Re-upload" — border #280071, h-48, w-328, 16px Regular #280071 */}
        <button
          type="button"
          className={styles.mobileOutlineBtn}
          onClick={() => router.push('/permanentAddress/upload')}
        >
          Re-upload
        </button>
      </div>

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
            onClick={() => router.push('/permanentAddress/upload')}
            aria-label="Go back"
          >
            <BackArrow />
          </button>
          <div className={styles.desktopTitleBlock}>
            <h1 className={styles.desktopCardTitle}>Upload {proofType} Back</h1>
            <p className={styles.desktopCardSubtitle}>
              Scan your Passport to auto-fill details instantly, or enter them yourself
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
                onClick={() => router.push('/permanentAddress/upload')}
                aria-label="Remove uploaded file"
              >
                <img src={ASSET_CLOSE_SM} alt="" width={10} height={10} aria-hidden="true" />
              </button>
            </div>

            {/* DL back image */}
            <div className={styles.imagePreview}>
              <img src={ASSET_DL_BACK} alt="Driving License Back" className={styles.imagePreviewImg} />
            </div>

            {/* Full details box */}
            <div className={styles.infoBox}>
              <button type="button" className={styles.infoBoxEditBtn} aria-label="Edit details">
                <EditIcon />
              </button>
              {DUMMY_DETAILS.map(({ label, value }) => (
                <p key={label} className={styles.infoBoxText}>
                  <span className={styles.infoLabel}>{label}: </span>
                  <span className={styles.infoValue}>{value}</span>
                </p>
              ))}
            </div>

          </div>

          {/* Dual button row: Re-Upload (outline, left) + Proceed (primary, right) */}
          {/* Figma (Web 0:44428): Re-Upload + Proceed */}
          <div className={styles.desktopDualBtnRow}>
            <button
              type="button"
              className={styles.desktopOutlineBtn}
              onClick={() => router.push('/permanentAddress/upload')}
            >
              Re-Upload
            </button>
            <button
              type="button"
              className={styles.desktopProceedBtn}
              onClick={() => router.push('/next-route')}
            >
              Proceed
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
}
