'use client';

import { DragEvent, KeyboardEvent } from 'react';
import type { FileUploadConfig, UploadedFile } from './fileUpload.types';
import { isImageFile, isPdfFile } from './fileUpload.utils';
import styles from './file-upload.module.scss';

interface Props {
  config: FileUploadConfig;
  activeFile?: UploadedFile;
  hasFiles: boolean;
  isDragOver: boolean;
  onDragEnter: (e: DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: DragEvent<HTMLDivElement>) => void;
  onClick: () => void;
  onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
}

function CloudUploadIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V10M12 10L9.5 12.5M12 10L14.5 12.5"
        stroke="#280071"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 18.5A4.5 4.5 0 016.07 9.6 6 6 0 0118 9a4 4 0 01-.5 7.97"
        stroke="#280071"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PdfPreviewIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="28" height="36" rx="4" fill="#fee2e2" stroke="#ef4444" strokeWidth="1.5" />
      <path d="M26 4v10h10" stroke="#ef4444" strokeWidth="1.5" strokeLinejoin="round" />
      <text x="10" y="34" fontSize="10" fontWeight="700" fill="#ef4444" fontFamily="sans-serif">PDF</text>
    </svg>
  );
}

function DocPreviewIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
      <rect x="6" y="4" width="28" height="36" rx="4" fill="#e0e7ff" stroke="#6366f1" strokeWidth="1.5" />
      <path d="M26 4v10h10" stroke="#6366f1" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M13 22h16M13 28h10M13 34h13" stroke="#6366f1" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

export function FileUploadDropzone({
  config,
  activeFile,
  hasFiles,
  isDragOver,
  onDragEnter,
  onDragOver,
  onDragLeave,
  onDrop,
  onClick,
  onKeyDown,
}: Props) {
  const isDisabled = !!config.disabled;
  const showFilePreview = activeFile && !activeFile.isValidationError;
  const showImagePreview =
    showFilePreview && activeFile.previewUrl && isImageFile(activeFile.file);
  const showDocPreview = showFilePreview && !isImageFile(activeFile.file);

  const dropzoneClass = [
    styles.dropzone,
    isDragOver ? styles.dropzoneDragOver : '',
    isDisabled ? styles.dropzoneDisabled : '',
    showFilePreview ? styles.dropzoneHasFile : '',
  ]
    .filter(Boolean)
    .join(' ');

  const ariaLabel = showFilePreview
    ? 'Upload area — click to replace file'
    : 'Upload area — drag and drop or click to browse';

  return (
    <div
      className={dropzoneClass}
      role="button"
      tabIndex={isDisabled ? -1 : 0}
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      suppressHydrationWarning
      onDragEnter={onDragEnter}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onClick={isDisabled ? undefined : onClick}
      onKeyDown={isDisabled ? undefined : onKeyDown}
    >
      {/* ── Drag-over overlay ── */}
      {isDragOver && (
        <div className={styles.dragOverContent}>
          <CloudUploadIcon />
          <p className={styles.dragOverText}>Drop your file here</p>
        </div>
      )}

      {/* ── Empty / add-more state ── */}
      {!isDragOver && !showFilePreview && (
        <div className={styles.dropzoneEmpty}>
          <div className={styles.uploadIconWrapper}>
            <CloudUploadIcon />
          </div>
          <div>
            <p className={styles.dropzoneMainText}>
              {hasFiles ? (
                <>
                  Drop <span className={styles.dropzoneBrowseLink}>more files</span> or click to
                  browse
                </>
              ) : (
                <>
                  Drag &amp; drop or{' '}
                  <span className={styles.dropzoneBrowseLink}>click to browse</span>
                </>
              )}
            </p>
            <p className={styles.dropzoneSubText}>
              {hasFiles ? 'Add another file to upload' : 'Drop your file here to upload'}
            </p>
          </div>
        </div>
      )}

      {/* ── Image preview ── */}
      {!isDragOver && showImagePreview && activeFile && (
        <div className={styles.dropzonePreviewWrap}>
          <img
            src={activeFile.previewUrl}
            alt={`Preview of ${activeFile.file.name}`}
            className={styles.previewImage}
          />
          <div className={styles.previewChangeOverlay}>
            <span className={styles.previewChangeText}>Click to change</span>
          </div>
        </div>
      )}

      {/* ── Non-image file preview ── */}
      {!isDragOver && showDocPreview && activeFile && (
        <div className={styles.dropzoneFilePreview}>
          {isPdfFile(activeFile.file) ? <PdfPreviewIcon /> : <DocPreviewIcon />}
          <p className={styles.dropzoneFileName}>{activeFile.file.name}</p>
          <p className={styles.dropzoneFileHint}>Click to change</p>
        </div>
      )}
    </div>
  );
}
