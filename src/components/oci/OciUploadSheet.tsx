'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from '@/services/toast.service';
import { SignatureCropperModal } from '@/components/upload-signature/SignatureCropperModal';
import { ociStore, type OciSide } from './ociStore';
import styles from './oci.module.scss';

// OciUploadSheet — bottom-sheet for picking the OCI/PIO front or back page.
// Real file/camera pick → validation → progress → crop step (images only; PDFs
// skip it) → persist to ociStore and route to the preview. Mirrors
// PassportUploadSheet so both flows behave identically.

type SheetState = 'choose' | 'uploading';

interface OciUploadSheetProps {
  side: OciSide;
  onClose?: () => void;
  onProceed?: () => void;
}

const ACCEPTED_INPUT_HINT = 'image/*,application/pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,.pdf';
const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'pdf'];
const MAX_BYTES = 5 * 1024 * 1024;
const MAX_LABEL = '5 MB';
const DESKTOP_MQ = '(min-width: 768px)';

function isAcceptedFile(f: File): boolean {
  if (f.type) {
    if (f.type === 'application/pdf') return true;
    if (f.type.startsWith('image/')) return true;
  }
  const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
  return ACCEPTED_EXTENSIONS.includes(ext);
}

function isPdf(f: File): boolean {
  return f.type === 'application/pdf' || f.name.toLowerCase().endsWith('.pdf');
}

// ─── Inline SVG icons ────────────────────────────────────────────────────────

function IconCamera() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M4 8.5h3l1.5-2h7L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z"
        stroke="#280071" strokeWidth="1.5" strokeLinejoin="round"
      />
      <circle cx="12" cy="13.5" r="3" stroke="#280071" strokeWidth="1.5" />
    </svg>
  );
}

function IconUploadCloud() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M16.5 10.5h.5a4 4 0 0 1 0 8H6a4.5 4.5 0 0 1-1.1-8.86A6 6 0 0 1 16.4 9.5"
        stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M12 13v6" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 15.5L12 13l2.5 2.5" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6 6L18 18" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 6L6 18" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" />
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

export default function OciUploadSheet({ side, onClose, onProceed }: OciUploadSheetProps) {
  const router = useRouter();

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  // Cropper layout switch — desktop renders a centred dialog, mobile a
  // bottom-sheet. Resolved client-side via matchMedia.
  const [isDesktop, setIsDesktop] = useState(false);

  const [sheetState, setSheetState] = useState<SheetState>('choose');
  const [displayName, setDisplayName] = useState('');
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Cropper state — when set the cropper opens and the sheet frame hides.
  const [croppingObjectUrl, setCroppingObjectUrl] = useState('');
  const [croppingName, setCroppingName] = useState('');

  const title = side === 'front' ? 'Upload OCI Front' : 'Upload OCI Back';

  // Mirror the live cropping URL into a ref so the unmount cleanup revokes the
  // latest value (an empty-deps effect would capture only the initial '').
  const croppingUrlRef = useRef('');
  useEffect(() => {
    croppingUrlRef.current = croppingObjectUrl;
  }, [croppingObjectUrl]);
  useEffect(() => {
    return () => {
      if (croppingUrlRef.current) URL.revokeObjectURL(croppingUrlRef.current);
    };
  }, []);

  // Lock background scroll while the sheet is mounted.
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Track viewport so the crop step matches the sheet's 768px dialog breakpoint
  // instead of always rendering as a mobile bottom-sheet.
  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  const revokeCropping = () => {
    if (croppingObjectUrl) URL.revokeObjectURL(croppingObjectUrl);
    setCroppingObjectUrl('');
    setCroppingName('');
  };

  const resetToChoose = () => {
    revokeCropping();
    setDisplayName('');
    setProgress(0);
    setUploading(false);
    setSheetState('choose');
  };

  const handleClose = () => {
    if (onClose) onClose();
    else router.back();
  };

  const advance = () => {
    if (onProceed) onProceed();
    else router.push(side === 'front' ? '/oci/front' : '/oci/back');
  };

  const startUpload = (f: File) => {
    if (!isAcceptedFile(f)) {
      toast.error('Unsupported file type. Please upload an image or PDF.');
      return;
    }
    if (f.size > MAX_BYTES) {
      toast.error(`File too large. Max size ${MAX_LABEL}.`);
      return;
    }

    revokeCropping();

    const pdf = isPdf(f);
    setDisplayName(f.name);
    setSheetState('uploading');
    setUploading(true);
    setProgress(0);

    // Randomised progress curve — visual continuity with the other upload flows.
    let pct = 0;
    const step = () => {
      pct = Math.min(pct + (Math.random() * 18 + 8), 94);
      setProgress(Math.round(pct));
      if (pct < 94) {
        window.setTimeout(step, 150 + Math.random() * 120);
      } else {
        window.setTimeout(finish, 350);
      }
    };
    const finish = () => {
      setProgress(100);
      setUploading(false);
      if (pdf) {
        // PDFs skip the cropper — persist and route straight to the preview.
        ociStore.set(side, { name: f.name, blob: f, type: 'application/pdf' });
        advance();
      } else {
        // Open the cropper with a transient objectURL for the source image.
        setCroppingObjectUrl(URL.createObjectURL(f));
        setCroppingName(f.name);
      }
    };
    window.setTimeout(step, 80);
  };

  const onFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    e.target.value = '';
    if (f) startUpload(f);
  };

  const onCropConfirm = (blob: Blob, _size: number, name: string) => {
    revokeCropping();
    // Skip the intermediate "Proceed" step — persist the cropped image and
    // route straight to the preview (matches the passport flow).
    ociStore.set(side, { name, blob, type: 'image/png' });
    advance();
  };

  const onCropCancel = () => {
    resetToChoose();
  };

  const showUploadFrame = !croppingObjectUrl;

  return (
    <>
      {showUploadFrame && (
        <div
          className={styles.sheetOverlay}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        >
          <div className={styles.sheetCard}>
            {/* Hidden inputs — the icon boxes below trigger these. */}
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_INPUT_HINT}
              onChange={onFilePicked}
              style={{ display: 'none' }}
              aria-hidden="true"
              tabIndex={-1}
            />
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={onFilePicked}
              style={{ display: 'none' }}
              aria-hidden="true"
              tabIndex={-1}
            />

            {/* Drag handle */}
            <div className={styles.sheetHandleRow}>
              <div className={styles.sheetHandle} />
            </div>

            {/* Title + close */}
            <div className={styles.sheetTitleRow}>
              <p className={styles.sheetTitle}>{title}</p>
              <button type="button" className={styles.sheetCloseBtn} onClick={handleClose} aria-label="Close">
                <IconClose />
              </button>
            </div>

            {sheetState === 'choose' ? (
              <>
                {/* Two icon boxes — open the real camera / file pickers */}
                <div className={styles.sheetIconRow}>
                  <button
                    type="button"
                    className={styles.sheetIconBox}
                    onClick={() => cameraInputRef.current?.click()}
                    aria-label="Take photo with camera"
                  >
                    <IconCamera />
                  </button>
                  <button
                    type="button"
                    className={styles.sheetIconBox}
                    onClick={() => fileInputRef.current?.click()}
                    aria-label="Upload from files"
                  >
                    <IconUploadCloud />
                  </button>
                </div>

                {/* Disclaimer */}
                <div className={styles.sheetDisclaimerBlock}>
                  <p className={styles.sheetDisclaimerLine}>Files supported: JPG, PNG &amp; PDF</p>
                  <p className={styles.sheetDisclaimerLine}>Maximum size less than {MAX_LABEL}</p>
                  <p className={styles.sheetDisclaimerLine}>
                    Please ensure that you don&apos;t upload password protected documents
                  </p>
                </div>
              </>
            ) : (
              <>
                {/* File chip + progress bar — auto-advances when finish() routes */}
                <div className={styles.sheetProgressBlock}>
                  <div className={styles.fileChip}>
                    <IconFile />
                    <span className={styles.fileChipName}>{displayName}</span>
                  </div>
                  <div className={styles.progressTrack}>
                    <div
                      className={styles.progressFill}
                      style={{ width: `${progress}%`, transition: 'width 0.3s ease' }}
                    />
                  </div>
                </div>

                {/* Reupload only — no Proceed; the sheet auto-advances after
                    crop confirm (images) or upload completion (PDFs). */}
                <div className={styles.sheetButtonRow}>
                  <button
                    type="button"
                    className={styles.reuploadBtn}
                    onClick={resetToChoose}
                    disabled={uploading}
                  >
                    Reupload
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Crop step — reuses the signature flow's cropper. */}
      <SignatureCropperModal
        open={!!croppingObjectUrl}
        isDesktop={isDesktop}
        src={croppingObjectUrl}
        fileName={croppingName}
        title="Crop your OCI/PIO card"
        subtitle="Adjust the box around your card."
        onCancel={onCropCancel}
        onConfirm={onCropConfirm}
      />
    </>
  );
}
