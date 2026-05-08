export type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

export interface UploadedFile {
  id: string;
  file: File;
  status: UploadStatus;
  progress: number;
  previewUrl?: string;
  errorMessage?: string;
  isValidationError?: boolean;
}

export interface FileUploadConfig {
  accept: string[];
  acceptLabel?: string;
  maxSizeMB: number;
  multiple?: boolean;
  disabled?: boolean;
  uploadFn?: (file: File, onProgress: (p: number) => void) => Promise<void>;
  onFilesChange?: (files: UploadedFile[]) => void;
  errorMessages?: {
    size?: string;
    type?: string;
  };
}
