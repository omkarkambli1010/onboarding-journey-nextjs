'use client';

import { ChangeEvent, DragEvent, KeyboardEvent, useRef, useState } from 'react';
import type { FileUploadConfig } from './fileUpload.types';
import { useFileUpload } from './useFileUpload';
import { FileUploadDropzone } from './FileUploadDropzone';
import { FileUploadItem } from './FileUploadItem';
import { deriveAcceptLabel, getAcceptString } from './fileUpload.utils';
import styles from './file-upload.module.scss';

interface FileUploadProps {
  title?: string;
  config: FileUploadConfig;
  className?: string;
}

export function FileUpload({ title, config, className }: FileUploadProps) {
  const { files, addFiles, removeFile, retryFile } = useFileUpload(config);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  // In single-file mode the dropzone transforms into the file preview
  const activeFile = !config.multiple ? files[0] : undefined;

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.length) {
      addFiles(Array.from(e.target.files));
      // Reset so the same file can be re-selected after removal
      e.target.value = '';
    }
  };

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounterRef.current++;
    if (!config.disabled) setIsDragOver(true);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDragLeave = () => {
    dragCounterRef.current--;
    if (dragCounterRef.current <= 0) {
      dragCounterRef.current = 0;
      setIsDragOver(false);
    }
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    dragCounterRef.current = 0;
    setIsDragOver(false);
    if (!config.disabled && e.dataTransfer?.files?.length) {
      addFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleClick = () => {
    if (!config.disabled) inputRef.current?.click();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  };

  const acceptLabel = config.acceptLabel ?? deriveAcceptLabel(config.accept);

  return (
    <div className={[styles.uploadSection, className].filter(Boolean).join(' ')}>
      {title && <p className={styles.uploadTitle}>{title}</p>}

      {/* Hidden native file input */}
      <input
        ref={inputRef}
        type="file"
        className={styles.hiddenInput}
        accept={getAcceptString(config.accept)}
        multiple={!!config.multiple}
        onChange={handleInputChange}
        aria-hidden="true"
        tabIndex={-1}
        suppressHydrationWarning
      />

      <FileUploadDropzone
        config={config}
        activeFile={activeFile}
        hasFiles={files.length > 0}
        isDragOver={isDragOver}
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      />

      {/* Metadata row — mirrors Figma "Files supported / Maximum size" */}
      <div className={styles.metaRow}>
        <span className={styles.metaText}>Files supported: {acceptLabel}</span>
        <span className={styles.metaText}>Maximum size less than {config.maxSizeMB} MB</span>
      </div>

      {/* File list */}
      {files.length > 0 && (
        <div className={styles.fileList} role="list" aria-label="Uploaded files">
          {files.map(f => (
            <FileUploadItem key={f.id} file={f} onRemove={removeFile} onRetry={retryFile} />
          ))}
        </div>
      )}
    </div>
  );
}
