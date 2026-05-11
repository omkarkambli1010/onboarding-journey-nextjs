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
import { SignatureUploadModal } from './SignatureUploadModal';
import { signatureStore, type PendingSignature } from './signatureStore';
import styles from './upload-signature.module.scss';

type VerifyFile = PendingSignature;

// UploadSignature — Draw / Upload / Verify signature in a single component.
// Figma draw: 0:39305 (desk) / 0:39223 (mob).
// Figma verify: 0:39533 (desk) / 0:44339 (mob).
// Uses signature_pad v5 for the canvas.

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
  const [uploadedImage, setUploadedImage] = useState<string>('');
  const [hasInk, setHasInk] = useState(false);
  const [isRejectStatus, setIsRejectStatus] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  // Verify state — when set, the page swaps to the "Verify your Signature" view
  // with the uploaded image preview + Reupload / Proceed buttons.
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

  // Initialize SignaturePad whenever the canvas mounts. Skipped while we're in
  // the verify state since the canvas isn't rendered.
  useEffect(() => {
    if (isDesktop === null || verifyFile) return;
    const canvas = canvasRef.current;
    if (!canvas || uploadedImage) return;

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
  }, [isDesktop, uploadedImage, verifyFile, resizeCanvas]);

  // ── Signature API calls disabled for now (kept for future reference) ──────
  // useEffect(() => {
  //   loadExistingSignature();
  // }, []);

  // Restore prior signature on mount.
  //   1. Module store — set when the info page's modal handed us a file.
  //   2. sessionStorage — set the last time the user clicked Proceed, so
  //      coming back from /support-document brings the signature back.
  const consumedRef = useRef(false);
  useEffect(() => {
    if (consumedRef.current) return;
    consumedRef.current = true;

    const staged = signatureStore.take();
    if (staged) {
      setVerifyFile(staged);
      return;
    }

    const savedBase64 = sessionStorage.getItem('signatureBase64');
    if (!savedBase64) return;
    const savedSource = sessionStorage.getItem('signatureSource');
    if (savedSource === 'upload') {
      setVerifyFile({
        name: sessionStorage.getItem('signatureName') || 'signature.png',
        dataUrl: savedBase64,
        type: sessionStorage.getItem('signatureType') || 'image/png',
        size: 0,
      });
    } else {
      // Draw — show the prior strokes as a preview in the pad area. Erase
      // clears it so the user can draw afresh.
      setUploadedImage(savedBase64);
      setHasInk(true);
    }
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
  //     const base64 = response?.data?.[0]?.Image || response?.data?.[0]?.SignatureImage;
  //     if (response?.status === true && base64) {
  //       const dataUrl = base64.startsWith('data:') ? base64 : `data:image/png;base64,${base64}`;
  //       setUploadedImage(dataUrl);
  //       setHasInk(true);
  //     }
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
    setUploadedImage('');
    setHasInk(false);
  };

  const onUploadClick = () => setShowUploadModal(true);

  const onModalUploaded = (file: { name: string; dataUrl: string; type: string; size: number }) => {
    setVerifyFile({
      name: file.name,
      dataUrl: file.dataUrl,
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

  const getSignatureBase64 = (): string | null => {
    if (verifyFile) return verifyFile.dataUrl;
    if (uploadedImage) return uploadedImage;
    const pad = padRef.current;
    if (!pad || pad.isEmpty()) return null;
    return pad.toDataURL('image/png');
  };

  const proceed = async () => {
    const base64 = getSignatureBase64();
    if (!base64) {
      toast.warning('Please draw or upload your signature.');
      return;
    }

    // Persist the signature to sessionStorage so /support-document (and any
    // subsequent step) can read it. Source = 'draw' for canvas strokes,
    // 'upload' for an uploaded image / PDF.
    const source: 'draw' | 'upload' = verifyFile ? 'upload' : 'draw';
    const name = verifyFile?.name ?? 'signature.png';
    const type = verifyFile?.type ?? 'image/png';
    try {
      sessionStorage.setItem('signatureBase64', base64);
      sessionStorage.setItem('signatureName', name);
      sessionStorage.setItem('signatureType', type);
      sessionStorage.setItem('signatureSource', source);
    } catch {
      // Most likely QuotaExceededError on a large uploaded file. Surface it
      // so the user can pick a smaller file rather than failing silently.
      toast.error('Signature is too large to save. Please try a smaller file.');
      return;
    }

    showSpinner();

    // ── Signature upload API disabled for now (kept for future reference) ──
    // const reqData = {
    //   formNumber: sessionStorage.getItem('FormNumber') || '',
    //   flag: 'docBase64String',
    //   docType: 'SIGNATURE',
    //   base64String: base64,
    // };
    // try {
    //   const response = await apiService.postRequest(
    //     'api/v1/uploadDocument/upload',
    //     reqData,
    //     hideSpinner,
    //   );
    //   if (response?.status === true) {
    //     toast.success('Signature uploaded successfully!');
    //     setTimeout(() => {
    //       router.push('/support-document');
    //       hideSpinner();
    //     }, 200);
    //   } else {
    //     toast.error(response?.message || 'Upload failed');
    //     hideSpinner();
    //   }
    // } catch {
    //   hideSpinner();
    // }

    // Stub flow — advance to /support-document without hitting the API.
    toast.success('Signature uploaded successfully!');
    setTimeout(() => {
      router.push('/support-document');
      hideSpinner();
    }, 200);
  };

  const canProceed = hasInk || !!uploadedImage;

  // ── Reusable building blocks ───────────────────────────────────────────────

  const padBlock = (wrapClass: string, boxClass: string) => (
    <div className={wrapClass}>
      <div className={boxClass}>
        {uploadedImage ? (
          <img src={uploadedImage} alt="Uploaded signature" className={styles.padPreview} />
        ) : (
          <canvas ref={canvasRef} className={styles.padCanvas} />
        )}
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
        <img src={verifyFile.dataUrl} alt="Uploaded signature" className={styles.previewImg} />
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
