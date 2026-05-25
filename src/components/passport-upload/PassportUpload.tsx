'use client';

import { useRouter } from 'next/navigation';
import styles from './passport-upload.module.scss';

// ─── Illustration asset ─────────────────────────────────────────────────────
// Figma: Onboarding / Step 10 / Passport Proof — Document Upload
// Source node: 13098899_Upload_file_concept_illustration 1 (0:122890)
// Flattened to a single local PNG — the original per-layer Figma MCP asset
// URLs were temporary (7-day expiry) and broke once they lapsed.
const UPLOAD_ILLUSTRATION = '/assets/images/diy/upload-docs-illustration.png';

// ─── Document list ──────────────────────────────────────────────────────────
// TODO: Replace with API data when available
const DOC_LIST: string[] = [
  'Passport - Indian or Foreign',
  'OCI/PIO',
  'Foreign Address Proof',
  'Permanent Address Proof',
  'Visa',
  'FATCA',
];

// ─── SVG: back arrow (← left arrow) ────────────────────────────────────────
function IconBackArrow() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M19 12H5"
        stroke="#2B2B2B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 19L5 12L12 5"
        stroke="#2B2B2B"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ─── Illustration — single flattened asset ──────────────────────────────────
// Rendered inside .mobileIllustration (210×160) or .desktopIllustration (267×200)
function Illustration({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden="true">
      <img className={styles.illImg} src={UPLOAD_ILLUSTRATION} alt="" />
    </div>
  );
}

// ─── Shared checklist section ────────────────────────────────────────────────
function ChecklistSection() {
  return (
    <div className={styles.checklistSection}>
      <div className={styles.checklistHeader}>
        <h2 className={styles.checklistTitle}>Required Documentation Checklist</h2>
        <p className={styles.checklistSubtitle}>
          Please ensure the following documents are prepared and ready for upload:
        </p>
      </div>
      <ol className={styles.docList} start={1}>
        {DOC_LIST.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ol>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
// Figma: Onboarding-Mob-UploadDocs (0:35651) + Onboarding-Web-UploadDocs (0:35319)
export default function PassportUpload() {
  const router = useRouter();

  const handleBack = () => {
    router.back();
  };

  const handleStartUploading = () => {
    router.push('/passportUpload/details');
  };

  return (
    <>
      {/* ═══ MOBILE LAYOUT — hidden at ≥ 768 px ══════════════════════════════
          Figma node: 0:35651 — Onboarding-Mob-UploadDocs (360 × 800)
          Layout: gray header (rounded-bottom) → white card (rounded-top) → fixed button
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Upload Passport Documents">

        {/* ── Gray header (rounded bottom-20px) ─────────────────────────── */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>

            {/* Back button row — sits above title */}
            <div className={styles.mobileTopRow}>
              <button
                type="button"
                className={styles.mobileBackBtn}
                onClick={handleBack}
                aria-label="Go back"
              >
                <IconBackArrow />
              </button>
            </div>

            {/* Title + subtitle */}
            <div className={styles.mobileTitleBlock}>
              <h1 className={styles.mobileTitle}>Upload the below documents</h1>
              <p className={styles.mobileSubtitle}>
                Enter your details according to the selected document and upload the required documents.
              </p>
            </div>

          </div>
        </div>

        {/* ── White card (rounded top-24px, shadow) ─────────────────────── */}
        <div className={styles.mobileCard}>
          {/* Upload concept illustration — 210 × 160 px */}
          <Illustration className={styles.mobileIllustration} />

          {/* Required Documentation Checklist */}
          <ChecklistSection />
        </div>

        {/* ── Fixed bottom button (matches Declaration pattern) ──────────── */}
        <div className={styles.mobileProceedArea}>
          <button
            type="button"
            className={styles.mobileProceedBtn}
            onClick={handleStartUploading}
          >
            Start Uploading
          </button>
        </div>

      </div>

      {/* ═══ DESKTOP LAYOUT — hidden below 768 px ════════════════════════════
          Figma node: 0:35506 — Frame 1000004634 — card inside Onboarding-Web-UploadDocs
          Layout: grey full-page bg → centred 800px card → header | body (row + button)
      ══════════════════════════════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Upload Passport Documents">

        {/* ── Card — 800 px max-width, border, shadow, rounded-24px ─────── */}
        <div className={styles.desktopCard}>

          {/* Card header: back arrow + title/subtitle */}
          <div className={styles.desktopCardHeader}>
            <button
              type="button"
              className={styles.desktopBackBtn}
              onClick={handleBack}
              aria-label="Go back"
            >
              <IconBackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <h1 className={styles.desktopCardTitle}>Upload the below documents</h1>
              <p className={styles.desktopCardSubtitle}>
                Enter your details according to the selected document and upload the required documents.
              </p>
            </div>
          </div>

          {/* Card body: illustration (left) + checklist (right), button below */}
          <div className={styles.desktopCardBody}>

            {/* Content area — flex-col, gap-24, items-center */}
            <div className={styles.desktopContentArea}>

              {/* Horizontal row: illustration left, checklist right */}
              <div className={styles.desktopContentRow}>
                {/* Upload concept illustration — 267 × 200 px */}
                <Illustration className={styles.desktopIllustration} />

                {/* Required Documentation Checklist */}
                <ChecklistSection />
              </div>

            </div>

            {/* Proceed button — 350 × 56 px, centred */}
            <div className={styles.desktopProceedWrapper}>
              <button
                type="button"
                className={styles.desktopProceedBtn}
                onClick={handleStartUploading}
              >
                Start Uploading
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
