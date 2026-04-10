'use client';

import { useRouter } from 'next/navigation';
import styles from './passport-upload.module.scss';

// ─── Illustration assets ────────────────────────────────────────────────────
// Figma: Onboarding / Step 10 / Passport Proof — Document Upload
// Source node: 13098899_Upload_file_concept_illustration 1
// TODO: Download and move to /public/assets/images/diy/ before production.
//       URLs below expire after 7 days (Figma MCP temporary assets).
const ILL_BASE = 'https://www.figma.com/api/mcp/asset/c61b4545-2952-44d2-ad3b-3efc16006b3c'; // Layer_1 — full-size base
const ILL_L3   = 'https://www.figma.com/api/mcp/asset/5192f38c-6c1c-4b44-8bed-1cf7281b763c'; // Layer_3 group overlay
const ILL_L2   = 'https://www.figma.com/api/mcp/asset/b1f1100f-ffa1-4323-8175-d81e410ea01e'; // Layer_2 overlay
const ILL_L4A  = 'https://www.figma.com/api/mcp/asset/2f450e87-1c22-42bb-95fc-9e94e5fe4982'; // Layer_4 left cluster
const ILL_L4B  = 'https://www.figma.com/api/mcp/asset/9731371b-b2a8-4c5f-9e6c-b32c1f7d5e6d'; // Layer_4 bottom-right

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

// ─── Illustration — composited layers (percentage insets scale both sizes) ──
// Rendered inside .mobileIllustration (210×160) or .desktopIllustration (267×200)
function Illustration({ className }: { className: string }) {
  return (
    <div className={className} aria-hidden="true">
      {/* Layer_1 — full-bleed base */}
      <img className={styles.illBase} src={ILL_BASE} alt="" />

      {/* Layer_3 group — inset: top 19.08% right 19.81% bottom 8.87% left 15.64% */}
      <div className={styles.illL3}>
        <img src={ILL_L3} alt="" />
      </div>

      {/* Layer_2 — inset: top 24.02% right 26.75% bottom 29.57% left 21.4% */}
      <div className={styles.illL2}>
        <img src={ILL_L2} alt="" />
      </div>

      {/* Layer_4 left cluster — inset: top 24.22% right 5.7% bottom 5.7% left 52.64% */}
      <div className={styles.illL4A}>
        <img src={ILL_L4A} alt="" />
      </div>

      {/* Layer_4 bottom-right — inset: top 55.02% right 76.07% bottom 6.8% left 6.14% */}
      <div className={styles.illL4B}>
        <img src={ILL_L4B} alt="" />
      </div>
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
