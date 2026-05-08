'use client';

import type { UploadedFile } from './fileUpload.types';
import { formatFileSize, isImageFile, isPdfFile } from './fileUpload.utils';
import styles from './file-upload.module.scss';

interface Props {
  file: UploadedFile;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}

function SuccessIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#16a34a" />
      <path
        d="M8 12l3 3 5-5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function ErrorCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" fill="#dc2626" />
      <path d="M9 9l6 6M15 9l-6 6" stroke="white" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      className={styles.spinnerIcon}
      aria-label="Uploading"
    >
      <circle cx="12" cy="12" r="10" stroke="#e8e0ff" strokeWidth="3" />
      <path d="M12 2a10 10 0 0110 10" stroke="#280071" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

function RemoveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function RetryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 12a9 9 0 0115.36-6.36L21 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M3 12h4M21 3v4h-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function PdfItemIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="28" height="36" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
      <path d="M26 4v10h10" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="10" y="34" fontSize="10" fontWeight="700" fill="#ef4444" fontFamily="sans-serif">PDF</text>
    </svg>
  );
}

function DocItemIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="28" height="36" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
      <path d="M26 4v10h10" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 22h16M13 28h10" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FileUploadItem({ file, onRemove, onRetry }: Props) {
  const isSuccess = file.status === 'success';
  const isError = file.status === 'error';
  const isUploading = file.status === 'uploading';
  const canRetry = isError && !file.isValidationError;

  const itemClass = [
    styles.fileItem,
    isSuccess ? styles.fileItemSuccess : '',
    isError ? styles.fileItemError : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={itemClass} role="listitem">
      {/* Thumbnail or icon */}
      {file.previewUrl && isImageFile(file.file) ? (
        <img src={file.previewUrl} alt="" className={styles.fileThumbnail} aria-hidden="true" />
      ) : (
        <div className={styles.fileIconBox}>
          {isPdfFile(file.file) ? <PdfItemIcon /> : <DocItemIcon />}
        </div>
      )}

      {/* File info */}
      <div className={styles.fileInfo}>
        <div className={styles.fileNameRow}>
          <span className={styles.fileName} title={file.file.name}>
            {file.file.name}
          </span>
          <span className={styles.fileSize}>{formatFileSize(file.file.size)}</span>
        </div>

        {isUploading && (
          <div
            className={styles.progressBar}
            role="progressbar"
            aria-valuenow={file.progress}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label={`Uploading ${file.file.name}: ${file.progress}%`}
          >
            <div className={styles.progressFill} style={{ width: `${file.progress}%` }} />
          </div>
        )}

        {isError && file.errorMessage && (
          <p className={styles.fileError} role="alert">
            {file.errorMessage}
          </p>
        )}

        {isSuccess && <p className={styles.fileSuccessText}>Uploaded successfully</p>}
      </div>

      {/* Status indicator + actions */}
      <div className={styles.fileActions}>
        {isUploading && <SpinnerIcon />}
        {isSuccess && <SuccessIcon />}
        {isError && !canRetry && <ErrorCircleIcon />}

        {canRetry && (
          <button
            type="button"
            className={`${styles.actionBtn} ${styles.retryBtn}`}
            onClick={() => onRetry(file.id)}
            aria-label={`Retry uploading ${file.file.name}`}
            title="Retry"
          >
            <RetryIcon />
          </button>
        )}

        <button
          type="button"
          className={`${styles.actionBtn} ${styles.removeBtn}`}
          onClick={() => onRemove(file.id)}
          aria-label={`Remove ${file.file.name}`}
          title="Remove"
        >
          <RemoveIcon />
        </button>
      </div>
    </div>
  );
}
