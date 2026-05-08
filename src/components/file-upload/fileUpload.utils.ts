import type { FileUploadConfig, UploadedFile } from './fileUpload.types';

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export function isImageFile(file: File): boolean {
  return /^image\/(jpeg|jpg|png|webp|gif)$/i.test(file.type);
}

export function isPdfFile(file: File): boolean {
  return file.type === 'application/pdf';
}

export function validateFile(
  file: File,
  config: Pick<FileUploadConfig, 'accept' | 'maxSizeMB' | 'errorMessages'>
): string | null {
  // Normalise image/jpg → image/jpeg (browsers always report image/jpeg)
  const normalizedType = file.type === 'image/jpg' ? 'image/jpeg' : file.type;

  if (config.accept.length > 0 && !config.accept.includes(normalizedType)) {
    if (config.errorMessages?.type) return config.errorMessages.type;
    const exts = config.accept
      .map(t => t.split('/')[1]?.toUpperCase())
      .filter(Boolean)
      .join(', ');
    return `Type not allowed. Accepted: ${exts}`;
  }

  if (file.size > config.maxSizeMB * 1024 * 1024) {
    return config.errorMessages?.size ?? `Exceeds ${config.maxSizeMB} MB limit`;
  }

  return null;
}

export function isDuplicateFile(file: File, existing: UploadedFile[]): boolean {
  return existing.some(f => f.file.name === file.name && f.file.size === file.size);
}

export function generateId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function getAcceptString(accept: string[]): string {
  return accept.join(',');
}

export function deriveAcceptLabel(accept: string[]): string {
  const labels = accept
    .map(t => {
      const sub = t.split('/')[1]?.toUpperCase();
      // Normalise JPEG → JPG for human-friendly display
      return sub === 'JPEG' ? 'JPG' : sub;
    })
    .filter((v): v is string => !!v)
    .filter((v, i, arr) => arr.indexOf(v) === i); // deduplicate

  if (labels.length === 0) return '';
  if (labels.length === 1) return labels[0];
  return `${labels.slice(0, -1).join(', ')} & ${labels[labels.length - 1]}`;
}
