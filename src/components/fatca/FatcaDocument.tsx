'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './fatca.module.scss';
import FatcaUploadSheet from './FatcaUploadSheet';
import AdditionalDocument from '@/components/additional-document/AdditionalDocument';

// FatcaDocument — Screen 2: TIN document uploaded preview
// Figma: Onboarding-Mob-Document-OCIfront-Uploaded (0:47385)
//        Route: /fatca/document

// Figma assets (node 0:47385)
const ASSET_TIN_IMAGE  = 'https://www.figma.com/api/mcp/asset/ce1c1757-539d-4587-a0fd-2526c6897c3a';
const ASSET_FILE_ICON  = 'https://www.figma.com/api/mcp/asset/151442dd-a11f-4307-8a1e-ab65635cc9fc';
const ASSET_CHIP_CLOSE = 'https://www.figma.com/api/mcp/asset/fcd15307-ab7c-4e36-8cd2-cd1131fe547e';

export default function FatcaDocument() {
  const router = useRouter();
  const [showSheet, setShowSheet]      = useState(false);
  const [showAdditional, setShowAdditional] = useState(false);

  const title    = 'Upload TIN Document';
  const subtitle = 'We need your Aadhaar image, since Digilocker service is down.';

  // ── Mobile layout ──────────────────────────────────────────────────────────
  const mobileView = (
    <div className={styles.mobilePage}>
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderInner}>
          <div className={styles.mobileTopRow}>
            <button
              type="button"
              className={styles.mobileBackBtn}
              onClick={() => router.back()}
              aria-label="Go back"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M15 18l-6-6 6-6" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <div className={styles.mobileTitleBlock}>
            <h1 className={styles.mobileTitle}>{title}</h1>
            <p className={styles.mobileSubtitle}>{subtitle}</p>
          </div>
        </div>
      </div>

      <div className={styles.mobileCardUpload}>
        {/* File chip — "tincopy.jpeg" + X to re-upload */}
        <div className={styles.fileChip}>
          <img src={ASSET_FILE_ICON} alt="" aria-hidden="true" width={16} height={16} />
          <span className={styles.fileChipName}>tincopy.jpeg</span>
          <button
            type="button"
            className={styles.fileChipRemove}
            onClick={() => setShowSheet(true)}
            aria-label="Re-upload TIN document"
          >
            <img src={ASSET_CHIP_CLOSE} alt="" aria-hidden="true" width={10} height={10} />
          </button>
        </div>

        {/* Dashed preview zone with TIN image */}
        <div className={styles.previewZone}>
          <img
            src={ASSET_TIN_IMAGE}
            alt="TIN document preview"
            className={styles.previewImg}
            width={100}
            height={137}
          />
        </div>
      </div>

      {/* Two stacked buttons */}
      <div className={styles.mobileDoubleButtonArea}>
        <button
          type="button"
          className={styles.mobileProceedBtn}
          onClick={() => setShowAdditional(true)}
        >
          Upload Additional Document
        </button>
        <button
          type="button"
          className={styles.mobileOutlineBtn}
          onClick={() => setShowSheet(true)}
        >
          Re-upload
        </button>
      </div>
    </div>
  );

  // ── Desktop layout ─────────────────────────────────────────────────────────
  const desktopView = (
    <div className={styles.desktopPage}>
      <div className={styles.desktopCard}>
        <div className={styles.desktopCardHeader}>
          <button
            type="button"
            className={styles.desktopBackBtn}
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className={styles.desktopTitleBlock}>
            <h1 className={styles.desktopCardTitle}>{title}</h1>
            <p className={styles.desktopCardSubtitle}>{subtitle}</p>
          </div>
        </div>

        <div className={styles.desktopCardBody}>
          <div className={styles.desktopUploadPreviewRow}>
            {/* File chip */}
            <div className={styles.fileChip}>
              <img src={ASSET_FILE_ICON} alt="" aria-hidden="true" width={16} height={16} />
              <span className={styles.fileChipName}>tincopy.jpeg</span>
              <button
                type="button"
                className={styles.fileChipRemove}
                onClick={() => setShowSheet(true)}
                aria-label="Re-upload TIN document"
              >
                <img src={ASSET_CHIP_CLOSE} alt="" aria-hidden="true" width={10} height={10} />
              </button>
            </div>

            {/* Dashed preview zone */}
            <div className={styles.previewZone}>
              <img
                src={ASSET_TIN_IMAGE}
                alt="TIN document preview"
                className={styles.previewImg}
                width={100}
                height={137}
              />
            </div>
          </div>

          <div className={styles.desktopDoubleButtonWrapper}>
            <button
              type="button"
              className={styles.desktopProceedBtn}
              onClick={() => setShowAdditional(true)}
            >
              Upload Additional Document
            </button>
            <button
              type="button"
              className={styles.desktopOutlineBtn}
              onClick={() => setShowSheet(true)}
            >
              Re-upload
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {mobileView}
      {desktopView}

      {showSheet && (
        <FatcaUploadSheet
          onClose={() => setShowSheet(false)}
          onProceed={() => setShowSheet(false)}
        />
      )}

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
