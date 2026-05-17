'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import SignaturePad from 'signature_pad';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from '@/services/toast.service';
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept for the
// commented-out signature API calls below; restore when re-enabling.
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import { buildFaqUrl } from '@/lib/faq-link';
import { SignatureUploadModal, type UploadedSignature } from './SignatureUploadModal';
import { signatureStore, type PendingSignature } from './signatureStore';
import styles from './upload-signature.module.scss';

type VerifyFile = PendingSignature;

// UploadSignature — Draw / Upload / Verify signature in a single component.
// Figma draw: 0:39305 (desk) / 0:39223 (mob).
// Figma verify: 0:39533 (desk) / 0:44339 (mob).
// Uses signature_pad v5 for the canvas.
//
// The uploaded image lives entirely as a Blob + objectURL — no base64,
// no sessionStorage persistence.

function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12H19" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 18" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 6" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MobBackChevron() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 6L9 12L15 18" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EraseIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M8.5 1.5L10.5 3.5L4.5 9.5L2 9.5L2 7L8.5 1.5Z"
        stroke="#280071"
        strokeWidth="1"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M1 11H11" stroke="#280071" strokeWidth="1" strokeLinecap="round" />
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

function TickIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="9" fill="#22c55e" />
      <path d="M6 10.5L9 13.5L14 7.5" stroke="#fff" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function SmallXIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
      <path d="M2 2L8 8" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 2L2 8" stroke="#666" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

const DESKTOP_MQ = '(min-width: 992px)';

export default function UploadSignature() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const padRef = useRef<SignaturePad | null>(null);

  const [isDesktop, setIsDesktop] = useState<boolean | null>(null);
  const [hasInk, setHasInk] = useState(false);
  const [isRejectStatus, setIsRejectStatus] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Verify state — when set, the page swaps to the "Verify your Signature"
  // view with the uploaded image preview + Reupload / Proceed buttons.
  const [verifyFile, setVerifyFile] = useState<VerifyFile | null>(null);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_MQ);
    const update = () => setIsDesktop(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    setIsRejectStatus(sessionStorage.getItem('RejectStatus') === 'R');
    navigationService.setRouter(router, hideSpinner);
  }, []);

  const resizeCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!canvas || !pad) return;
    const ratio = Math.max(window.devicePixelRatio || 1, 1);
    const { width, height } = canvas.getBoundingClientRect();
    if (!width || !height) return;
    const data = pad.toData();
    canvas.width = width * ratio;
    canvas.height = height * ratio;
    const ctx = canvas.getContext('2d');
    ctx?.scale(ratio, ratio);
    pad.clear();
    if (data.length) pad.fromData(data);
  }, []);

  // Initialize SignaturePad whenever the canvas mounts. Skipped while we're
  // in the verify state since the canvas isn't rendered.
  useEffect(() => {
    if (isDesktop === null || verifyFile) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const pad = new SignaturePad(canvas, {
      penColor: '#222222',
      backgroundColor: 'rgba(255,255,255,0)',
      minWidth: 1.2,
      maxWidth: 2.5,
    });
    padRef.current = pad;
    pad.addEventListener('endStroke', () => setHasInk(!pad.isEmpty()));

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      pad.off();
      padRef.current = null;
    };
  }, [isDesktop, verifyFile, resizeCanvas]);

  // ── Signature API calls disabled for now (kept for future reference) ──────
  // useEffect(() => {
  //   loadExistingSignature();
  // }, []);

  // Restore prior signature on mount from the module-level transfer slot —
  // populated when the info page's modal handed us a file. No
  // sessionStorage path: refreshing the page is expected to clear the
  // signature.
  const consumedRef = useRef(false);
  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;

    const staged = signatureStore.take();
    if (staged) {
      setVerifyFile(staged);
      return;
    }

    // Restore from sessionStorage on back-nav from /support-document.
    // Temporary persistence — once the upload API is wired up the page
    // will bind the image directly from the API response and this branch
    // can go away.
    const savedBase64 = sessionStorage.getItem('signatureBase64');
    if (!savedBase64) return;
    const savedName = sessionStorage.getItem('signatureName') || 'signature.png';
    const savedType = sessionStorage.getItem('signatureType') || 'image/png';
    fetch(savedBase64)
      .then((r) => r.blob())
      .then((blob) => {
        const objectUrl = URL.createObjectURL(blob);
        setVerifyFile({
          name: savedName,
          blob,
          objectUrl,
          type: savedType,
          size: blob.size,
        });
      })
      .catch(() => {
        // Bad / corrupted cached value — drop it silently.
        sessionStorage.removeItem('signatureBase64');
      });
  }, []);

  // Revoke the verify file's objectURL when it's replaced or the component
  // unmounts. The ref tracks the URL that owns lifecycle right now so we
  // don't free a fresh one after a replacement.
  const ownedUrlRef = useRef<string>('');
  useEffect(() => {
    if (verifyFile && verifyFile.objectUrl !== ownedUrlRef.current) {
      const prev = ownedUrlRef.current;
      ownedUrlRef.current = verifyFile.objectUrl;
      if (prev) URL.revokeObjectURL(prev);
    } else if (!verifyFile && ownedUrlRef.current) {
      URL.revokeObjectURL(ownedUrlRef.current);
      ownedUrlRef.current = '';
    }
  }, [verifyFile]);

  useEffect(() => {
    return () => {
      if (ownedUrlRef.current) URL.revokeObjectURL(ownedUrlRef.current);
    };
  }, []);

  // Legacy entry path — if someone navigates here with ?mode=upload but
  // without a staged file (e.g. deep link), open the modal directly.
  const autoOpenedRef = useRef(false);
  useEffect(() => {
    if (autoOpenedRef.current) return;
    if (isDesktop === null) return;
    if (searchParams?.get('mode') !== 'upload') return;
    if (verifyFile) return;
    autoOpenedRef.current = true;
    setShowUploadModal(true);
  }, [searchParams, isDesktop, verifyFile]);

  // Fetches an existing signature for the current form number.
  // Disabled for now — uncomment along with the useEffect above when the
  // backend wiring is ready.
  // const loadExistingSignature = async () => {
  //   showSpinner();
  //   try {
  //     const reqData = {
  //       flag: 'signature',
  //       formnumber: sessionStorage.getItem('FormNumber') || '',
  //     };
  //     const response = await apiService.postRequest(
  //       'api/v1/WorkflowDetails/getworkflowdata',
  //       reqData,
  //       hideSpinner,
  //     );
  //     // TODO: when re-enabling, convert response base64 → Blob via
  //     // fetch(`data:image/png;base64,${base64}`).then(r => r.blob()) and
  //     // call setVerifyFile with a fresh objectURL.
  //   } catch {
  //     /* ignore */
  //   } finally {
  //     hideSpinner();
  //   }
  // };

  const openFaq = () => router.push(buildFaqUrl(pathname || '/uploadSignature'));

  const goBack = () => {
    showSpinner();
    setTimeout(() => {
      if (verifyFile) {
        setVerifyFile(null);
        hideSpinner();
      } else {
        router.push('/uploadSignatureinfo');
        hideSpinner();
      }
    }, 200);
  };

  const erase = () => {
    padRef.current?.clear();
    setHasInk(false);
  };

  const onUploadClick = () => setShowUploadModal(true);

  const onModalUploaded = (file: UploadedSignature) => {
    setVerifyFile({
      name: file.name,
      blob: file.blob,
      objectUrl: file.objectUrl,
      type: file.type,
      size: file.size,
    });
    setShowUploadModal(false);
  };

  const onReupload = () => {
    setVerifyFile(null);
    setShowUploadModal(true);
  };

  const removeVerifyFile = () => {
    setVerifyFile(null);
  };

  // Returns the signature as a Blob — either the uploaded/cropped image, or
  // a PNG-encoded export of the canvas strokes.
  const getSignatureBlob = (): Promise<Blob | null> => {
    if (verifyFile) return Promise.resolve(verifyFile.blob);
    const canvas = canvasRef.current;
    const pad = padRef.current;
    if (!canvas || !pad || pad.isEmpty()) return Promise.resolve(null);
    return new Promise<Blob | null>((resolve) => {
      canvas.toBlob((b) => resolve(b), 'image/png');
    });
  };

  const proceed = async () => {
    const blob = await getSignatureBlob();
    if (!blob) {
      toast.warning('Please draw or upload your signature.');
      return;
    }

    // Hand off via the module-level slot so /support-document (or wherever
    // the next step pulls the signature from) can consume the same Blob.
    const source: 'draw' | 'upload' = verifyFile ? 'upload' : 'draw';
    const name = verifyFile?.name ?? 'signature.png';
    const type = verifyFile?.type ?? 'image/png';
    const objectUrl = verifyFile?.objectUrl ?? URL.createObjectURL(blob);

    signatureStore.set({ name, blob, objectUrl, type, size: blob.size });

    // The verify view's objectURL ownership transfers to the store; clear
    // our local owner so unmount cleanup doesn't double-free.
    if (verifyFile) {
      ownedUrlRef.current = '';
    }

    // Temporary persistence — until the upload API is wired up, cache the
    // signature as base64 in sessionStorage so coming back from
    // /support-document still shows the preview. The component state stays
    // Blob-based; this is purely a persistence boundary.
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(blob);
      });
      sessionStorage.setItem('signatureBase64', base64);
      sessionStorage.setItem('signatureName', name);
      sessionStorage.setItem('signatureType', type);
      sessionStorage.setItem('signatureSource', source);
    } catch {
      // QuotaExceededError or read failure — surface so the user can pick
      // a smaller file rather than failing silently downstream.
      toast.error('Signature is too large to save. Please try a smaller file.');
      return;
    }

    showSpinner();

    // ── Signature upload API disabled for now (kept for future reference) ──
    // const reqData = {
    //   formNumber: sessionStorage.getItem('FormNumber') || '',
    //   flag: 'docBase64String',
    //   docType: 'SIGNATURE',
    //   base64String: await blobToBase64(blob),
    // };
    // try { ... } catch { ... }

    // Stub flow — advance to /support-document without hitting the API.
    toast.success('Signature uploaded successfully!');
    setTimeout(() => {
      router.push('/support-document');
      hideSpinner();
    }, 200);
  };

  const canProceed = hasInk;

  // ── Reusable building blocks ───────────────────────────────────────────────

  const padBlock = (wrapClass: string, boxClass: string) => (
    <div className={wrapClass}>
      <div className={boxClass}>
        <canvas ref={canvasRef} className={styles.padCanvas} />
      </div>
      <button
        type="button"
        className={styles.eraseChip}
        onClick={erase}
        disabled={!canProceed}
        aria-label="Erase signature"
      >
        <span>Erase</span>
        <EraseIcon />
      </button>
    </div>
  );

  const filePill = (showTick: boolean) =>
    verifyFile && (
      <div className={styles.filePill}>
        <div className={styles.filePillMeta}>
          <PaperclipIcon />
          <span className={styles.filePillName} title={verifyFile.name}>{verifyFile.name}</span>
          {showTick && <TickIcon />}
        </div>
        <button
          type="button"
          className={styles.filePillRemove}
          onClick={removeVerifyFile}
          aria-label="Remove file"
        >
          <SmallXIcon />
        </button>
      </div>
    );

  const previewBox = verifyFile && (
    <div className={styles.previewBox}>
      {verifyFile.type === 'application/pdf' ? (
        <p className={styles.pdfText}>PDF preview not available — {verifyFile.name}</p>
      ) : (
        <img src={verifyFile.objectUrl} alt="Uploaded signature" className={styles.previewImg} />
      )}
    </div>
  );

  const uploadModal = (
    <SignatureUploadModal
      open={showUploadModal}
      isDesktop={!!isDesktop}
      onClose={() => setShowUploadModal(false)}
      onUploaded={onModalUploaded}
    />
  );

  if (isDesktop === null) {
    return (
      <section
        className="pan_details_form"
        aria-label="Draw or Upload Signature"
        style={{ background: '#f8f8f8', minHeight: 'calc(100vh - 90px)' }}
      />
    );
  }

  // ── Desktop layout ─────────────────────────────────────────────────────────
  if (isDesktop) {
    const title = verifyFile ? 'Verify your Signature' : 'Draw/Upload Signature';
    const subtitle = verifyFile
      ? 'Upload a clear image of Signature.'
      : 'Please sign below. Dots, lines or random shapes won’t be accepted.';

    return (
      <section
        className="pan_details_form"
        aria-label={verifyFile ? 'Verify Signature' : 'Draw or Upload Signature'}
        style={{ background: '#f8f8f8', minHeight: 'calc(100vh - 90px)', padding: 0 }}
      >
        {uploadModal}
        <div className={styles.deskCard}>
          <div className={styles.deskHeader}>
            {!isRejectStatus && (
              <button type="button" className={styles.backBtn} onClick={goBack} aria-label="Go back">
                <BackArrow />
              </button>
            )}
            <div className={styles.deskHeaderText}>
              <div className={styles.deskTitleRow}>
                <h5>{title}</h5>
                {!verifyFile && (
                  <button type="button" className={styles.needHelpChip} onClick={openFaq}>Need Help?</button>
                )}
              </div>
              <p>{subtitle}</p>
            </div>
          </div>

          <div className={styles.deskBody}>
            {verifyFile ? (
              <div className={styles.verifyBody}>
                {filePill(false)}
                {previewBox}
              </div>
            ) : (
              padBlock(styles.padWrap, styles.padBox)
            )}
          </div>

          <div className={styles.deskBtnFooter}>
            <div className={styles.deskBtnRow}>
              <button
                type="button"
                className={styles.btnOutline}
                onClick={verifyFile ? onReupload : onUploadClick}
              >
                {verifyFile ? 'Reupload' : 'Upload Signature'}
              </button>
              <button
                type="button"
                className={styles.btnFilled}
                disabled={!verifyFile && !canProceed}
                onClick={proceed}
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  // ── Mobile layout ──────────────────────────────────────────────────────────
  const mobTitle = verifyFile ? 'Verify your Signature' : 'Draw/Upload Signature';
  const mobSubtitle = verifyFile
    ? 'Upload a clear image of your Signature.'
    : 'Please sign below. Dots, lines or random shapes won’t be accepted.';

  return (
    <section
      className="pan_details_form"
      aria-label={verifyFile ? 'Verify Signature' : 'Draw or Upload Signature'}
      style={{
        background: '#f8f8f8',
        minHeight: 'calc(100vh - 90px)',
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {uploadModal}
      <div className={styles.mobGrayHeader}>
        {!isRejectStatus && (
          <div className={styles.mobBackRow}>
            <button type="button" className={styles.mobBackBtn} onClick={goBack} aria-label="Go back">
              <MobBackChevron />
            </button>
          </div>
        )}
        <div className={styles.mobTitleBlock}>
          <div className={styles.mobTitleRow}>
            <p className={styles.mobTitle}>{mobTitle}</p>
            {!verifyFile && (
              <button type="button" className={styles.needHelpChip} onClick={openFaq}>Need Help?</button>
            )}
          </div>
          <p className={styles.mobSubtitle}>{mobSubtitle}</p>
        </div>
      </div>

      <div className={styles.mobContentCard}>
        {verifyFile ? (
          <div className={styles.verifyBodyMob}>
            {filePill(true)}
            {previewBox}
            <div className={styles.mobInfoBlock}>
              <p className={styles.mobInfoLine}>Files supported: JPG, PNG & PDF</p>
              <p className={styles.mobInfoLine}>Maximum size less than 4 MB</p>
              <p className={styles.mobInfoLine}>
                Please ensure that you don&apos;t upload password protected documents
              </p>
            </div>
          </div>
        ) : (
          padBlock(styles.mobPadWrap, styles.mobPadBox)
        )}
      </div>

      <div className={verifyFile ? styles.mobBtnBarStack : styles.mobBtnBar}>
        {verifyFile ? (
          <>
            <button type="button" className={styles.mobBtnFilled} onClick={proceed}>
              Proceed
            </button>
            <button type="button" className={styles.mobBtnOutline} onClick={onReupload}>
              Re-upload
            </button>
          </>
        ) : (
          <>
            <button type="button" className={styles.mobBtnOutline} onClick={onUploadClick}>
              Upload Signature
            </button>
            <button
              type="button"
              className={styles.mobBtnFilled}
              disabled={!canProceed}
              onClick={proceed}
            >
              Proceed
            </button>
          </>
        )}
      </div>
    </section>
  );
}
