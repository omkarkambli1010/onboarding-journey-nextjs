// UploadModal — shared bottom-sheet (mobile) / dialog (desktop) for document upload
// Figma: Onboarding-Mob-Document-Front-Upload (0:44270)
//        Upload dialog overlay in Onboarding-Web-PermanentAddress-Noselection-Upload (0:43914)

import styles from './permanent-address.module.scss';

// Figma assets — camera icon + cloud upload icon + close X
const ASSET_CAMERA  = 'https://www.figma.com/api/mcp/asset/eb9e403b-2c47-4ea1-80a4-181fd0098d05';
const ASSET_UPLOAD  = 'https://www.figma.com/api/mcp/asset/fc1a19bc-16f2-494a-a603-6ee8148eae6c';
const ASSET_CLOSE   = 'https://www.figma.com/api/mcp/asset/84b05b17-a183-4213-8d8b-30f6bd9370a3';

type UploadModalProps = {
  title: string;        // e.g. "Upload Driving license Front"
  onClose: () => void;
  onUpload: () => void; // confirms upload → navigates to next screen
};

// Inner content — same markup for mobile sheet and desktop modal
function ModalContent({ title, onClose, onUpload }: UploadModalProps) {
  return (
    <div className={styles.modalContent}>
      {/* Mobile-only drag handle — hidden on desktop via media query */}
      <div className={styles.modalHandle} aria-hidden="true" />

      {/* Header: title + close */}
      {/* Figma: 20px SemiBold #2b2b2b + 24×24 X icon */}
      <div className={styles.modalHeader}>
        <h2 className={styles.modalTitle}>{title}</h2>
        <button
          type="button"
          className={styles.modalCloseBtn}
          onClick={onClose}
          aria-label="Close upload dialog"
        >
          <img src={ASSET_CLOSE} alt="" width={24} height={24} aria-hidden="true" />
        </button>
      </div>

      {/* Upload option boxes: Camera (left) + Cloud upload (right) */}
      {/* Figma: 80×80 each, bg #f3f1ff, border dashed #e1e8f1, rounded-8, gap-48 */}
      <div className={styles.modalIcons}>
        {/* Camera — display only (no real camera API needed) */}
        <div className={styles.modalIconBox} aria-label="Take photo">
          <img src={ASSET_CAMERA} alt="Camera" width={26} height={24} />
        </div>
        {/* Upload file — triggers onUpload which navigates forward */}
        <button
          type="button"
          className={styles.modalIconBox}
          onClick={onUpload}
          aria-label="Upload file from device"
        >
          <img src={ASSET_UPLOAD} alt="Upload" width={24} height={24} />
        </button>
      </div>

      {/* File constraints */}
      {/* Figma: 12px Regular #666, flex-col gap-8 */}
      <div className={styles.modalInfo}>
        <p className={styles.modalInfoText}>Files supported: JPG, PNG &amp; PDF</p>
        <p className={styles.modalInfoText}>Maximum size less than 5 MB</p>
        <p className={styles.modalInfoText}>
          Please ensure that you don&apos;t upload password protected documents
        </p>
      </div>
    </div>
  );
}

// Mobile bottom sheet — full overlay, sheet slides from bottom
export function MobileUploadModal({ title, onClose, onUpload }: UploadModalProps) {
  return (
    // Backdrop — click outside closes
    <div className={styles.mobileSheetOverlay} onClick={onClose}>
      {/* Sheet panel — stop propagation so clicks inside don't close */}
      {/* Figma: bg white, border #ddd, rounded-top-20px, shadow 3px 4px 10px rgba(0,0,0,0.15) */}
      <div className={styles.mobileSheet} onClick={(e) => e.stopPropagation()}>
        <ModalContent title={title} onClose={onClose} onUpload={onUpload} />
      </div>
    </div>
  );
}

// Desktop modal — centered overlay dialog
// Figma: dim background + centered white card (0:43914 shows this layout)
export function DesktopUploadModal({ title, onClose, onUpload }: UploadModalProps) {
  return (
    <div className={styles.desktopModalOverlay} onClick={onClose}>
      <div className={styles.desktopModal} onClick={(e) => e.stopPropagation()}>
        <ModalContent title={title} onClose={onClose} onUpload={onUpload} />
      </div>
    </div>
  );
}
