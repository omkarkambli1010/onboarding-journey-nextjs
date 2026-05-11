'use client';

import { ChangeEvent, useEffect, useRef, useState } from 'react';
import { toast } from '@/services/toast.service';
import styles from './signature-upload-modal.module.scss';

// SignatureUploadModal — desktop modal / mobile bottom-sheet for picking a
// signature file. Empty state shows the upload tile(s); during upload it
// shows a filename row with progress bar + Reupload / Proceed buttons.
// Figma: desktop empty 0:37409, desktop uploading 0:37362,
//        mobile empty 0:44235, mobile uploading 0:44287.

export interface SignatureUploadModalProps {
  open: boolean;
  isDesktop: boolean;
  onClose: () => void;
  onUploaded: (file: { name: string; dataUrl: string; type: string; size: number }) => void;
}

// Accept all image MIME types plus PDF. The `accept` attribute on the input
// uses the same set, plus explicit extensions as a fallback for files whose
// MIME type the OS reports as empty (rare on desktop, common on some mobile
// flows).
const ACCEPTED_INPUT_HINT = 'image/*,application/pdf,.jpg,.jpeg,.png,.heic,.heif,.webp,.pdf';
const ACCEPTED_EXTENSIONS = ['jpg', 'jpeg', 'png', 'heic', 'heif', 'webp', 'pdf'];
const MAX_BYTES = 4 * 1024 * 1024;
const ACCEPT_LABEL = 'JPG, PNG & PDF';
const MAX_LABEL = '4 MB';

function isAcceptedFile(f: File): boolean {
  if (f.type) {
    if (f.type === 'application/pdf') return true;
    if (f.type.startsWith('image/')) return true;
  }
  // MIME type missing — fall back to checking the extension.
  const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
  return ACCEPTED_EXTENSIONS.includes(ext);
}

function XIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6L18 18" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M18 6L6 18" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

function UploadCloudIcon({ size = 24 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M16.5 10.5h.5a4 4 0 0 1 0 8H6a4.5 4.5 0 0 1-1.1-8.86A6 6 0 0 1 16.4 9.5"
        stroke="#280071"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M12 13v6" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M9.5 15.5L12 13l2.5 2.5" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CameraIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 8.5h3l1.5-2h7L17 8.5h3a1 1 0 0 1 1 1V18a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5a1 1 0 0 1 1-1Z"
        stroke="#280071"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="13.5" r="3" stroke="#280071" strokeWidth="1.5" />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M11.5 5.5L6.7 10.3a1.5 1.5 0 0 0 2.1 2.1l5-5a3 3 0 0 0-4.2-4.2l-5.3 5.3a4.5 4.5 0 0 0 6.4 6.4l4.6-4.6"
        stroke="#280071"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SmallXIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 4L12 12" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M12 4L4 12" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function SignatureUploadModal({
  open,
  isDesktop,
  onClose,
  onUploaded,
}: SignatureUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const cameraInputRef = useRef<HTMLInputElement | null>(null);

  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [dataUrl, setDataUrl] = useState('');

  // Reset internal state every time the modal closes.
  useEffect(() => {
    if (!open) {
      setFile(null);
      setProgress(0);
      setUploading(false);
      setDataUrl('');
    }
  }, [open]);

  // Lock background scroll while modal is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const validate = (f: File) => {
    if (!isAcceptedFile(f)) {
      toast.error('Unsupported file type. Please upload an image or PDF.');
      return false;
    }
    if (f.size > MAX_BYTES) {
      toast.error(`File too large. Max size ${MAX_LABEL}.`);
      return false;
    }
    return true;
  };

  const startUpload = (f: File) => {
    if (!validate(f)) return;
    setFile(f);
    setUploading(true);
    setProgress(0);

    // Kick off file read in parallel — we don't await it for the progress
    // animation, just for stashing the data URL.
    let readResult: string | null = null;
    let readDone = false;
    const reader = new FileReader();
    reader.onload = () => {
      readResult = String(reader.result || '');
      readDone = true;
    };
    reader.onerror = () => {
      readDone = true;
    };
    reader.readAsDataURL(f);

    // Randomized progress curve — mirrors manual-bankdetails useFileUpload.
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
      if (!readDone) {
        // Wait briefly for the FileReader to finish.
        window.setTimeout(finish, 80);
        return;
      }
      if (!readResult) {
        setUploading(false);
        setFile(null);
        toast.error('Could not read file. Please try again.');
        return;
      }
      setProgress(100);
      setDataUrl(readResult);
      setUploading(false);
    };

    window.setTimeout(step, 80);
  };

  const onFilePicked = (e: ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    const f = e.target.files?.[0];
    e.target.value = '';
    if (!f) return;
    startUpload(f);
  };

  // Only close the modal when the backdrop itself is clicked — NOT when a
  // bubbled click reaches it (e.g. from the programmatic click on the hidden
  // file input, which would otherwise close the modal mid-pick).
  const onOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  const reupload = () => {
    setFile(null);
    setProgress(0);
    setDataUrl('');
    fileInputRef.current?.click();
  };

  const proceed = () => {
    if (!file || !dataUrl) return;
    onUploaded({ name: file.name, dataUrl, type: file.type, size: file.size });
  };

  const cardClass = isDesktop ? styles.deskCard : styles.mobSheet;

  return (
    <div
      className={isDesktop ? styles.overlay : styles.overlayMob}
      role="dialog"
      aria-modal="true"
      aria-label="Upload signature"
      onClick={onOverlayClick}
    >
      <div className={cardClass} onClick={(e) => e.stopPropagation()}>
        {/* Hidden inputs live inside the card so the card's stopPropagation
            catches the bubbled click event from `inputRef.current.click()`
            — keeps the overlay's backdrop-click-to-close from firing
            mid-pick. */}
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_INPUT_HINT}
          onChange={onFilePicked}
          onClick={(e) => e.stopPropagation()}
          className={styles.hiddenInput}
          aria-hidden="true"
          tabIndex={-1}
        />
        {/* Camera input — `capture` opens the camera on mobile/tablet; on
            desktop browsers without a capture device it falls back to the
            normal file picker, which still works. */}
        <input
          ref={cameraInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={onFilePicked}
          onClick={(e) => e.stopPropagation()}
          className={styles.hiddenInput}
          aria-hidden="true"
          tabIndex={-1}
        />
        {!isDesktop && <div className={styles.dashHandle} aria-hidden="true" />}

        {/* Header */}
        {file ? (
          // Uploading / uploaded state — small icon top-left, X top-right
          <div className={styles.headerUploading}>
            <div className={styles.smallUploadIcon}>
              <UploadCloudIcon size={20} />
            </div>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <XIcon />
            </button>
          </div>
        ) : (
          <div className={styles.headerEmpty}>
            <h2 className={styles.modalTitle}>
              {isDesktop ? 'Upload Signature' : 'Upload your signature'}
            </h2>
            <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close">
              <XIcon />
            </button>
          </div>
        )}

        {/* Subtitle (uploading state - desktop also shows title+subtitle below icon) */}
        {file ? (
          <div className={styles.uploadingTitleBlock}>
            <p className={styles.modalTitleAlt}>Upload your signature</p>
            <p className={styles.modalSubtitle}>Sign on a plane white paper and upload it</p>
          </div>
        ) : (
          <p className={styles.modalSubtitle}>Sign on a plane white paper and upload it</p>
        )}

        {/* Body */}
        {file ? (
          <div className={styles.fileRow}>
            <div className={styles.fileRowTop}>
              <div className={styles.fileMeta}>
                <PaperclipIcon />
                <span className={styles.fileName} title={file.name}>{file.name}</span>
              </div>
              <button
                type="button"
                className={styles.fileRemoveBtn}
                onClick={reupload}
                aria-label="Remove file"
              >
                <SmallXIcon />
              </button>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
          </div>
        ) : (
          <div className={styles.tileRow}>
            <button
              type="button"
              className={styles.uploadTileWrap}
              onClick={() => cameraInputRef.current?.click()}
              aria-label="Take a photo"
            >
              <span className={styles.uploadTile}>
                <CameraIcon />
              </span>
              <span className={styles.tileLabel}>Take a photo</span>
            </button>
            <button
              type="button"
              className={styles.uploadTileWrap}
              onClick={() => fileInputRef.current?.click()}
              aria-label="Choose a file"
            >
              <span className={styles.uploadTile}>
                <UploadCloudIcon />
              </span>
              <span className={styles.tileLabel}>Upload file</span>
            </button>
          </div>
        )}

        {/* Info text */}
        <div className={styles.infoBlock}>
          <p className={styles.infoLine}>Files supported: {ACCEPT_LABEL}</p>
          <p className={styles.infoLine}>Maximum size less than {MAX_LABEL}</p>
          {!isDesktop && (
            <p className={styles.infoLine}>
              Please ensure that you don&apos;t upload password protected documents
            </p>
          )}
        </div>

        {/* Action buttons — only visible after a file is picked */}
        {file && (
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.btnOutlineMuted}
              onClick={reupload}
              disabled={uploading}
            >
              Reupload
            </button>
            <button
              type="button"
              className={styles.btnFilledMuted}
              onClick={proceed}
              disabled={uploading || !dataUrl}
            >
              Proceed
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
