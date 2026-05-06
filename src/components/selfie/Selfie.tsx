'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Webcam from 'react-webcam';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './selfie.module.scss';

// CaptureSelfie
// Step 1 (/CaptureSelfie/1) — prep/guidelines screen
// Step 2 (/CaptureSelfie/2) — webcam capture
//
// Figma desktop: node 0:7128  |  mobile: node 0:6537

// ── Static data ──────────────────────────────────────────────────────────────

const DOS = [
  { img: '/assets/images/diy/good_lightening_icon.png', label: 'Good lighting' },
  { img: '/assets/images/diy/white_bg_icon.png',        label: 'White background' },
  { img: '/assets/images/diy/align_face_icon.png',      label: 'Align face in the centre' },
];

const DONTS = [
  { img: '/assets/images/diy/no_blurry_pic.png',  label: 'No blurry photo' },
  { img: '/assets/images/diy/no_cap_icon.png',    label: 'No cap' },
  { img: '/assets/images/diy/no_eyewear_icon.png', label: 'No eyewear' },
];

// ── Back arrow SVG ────────────────────────────────────────────────────────────
function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12H19" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 18" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 6" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Shield icon SVG (Figma: tabler-icon-shield-check-filled) ─────────────────
function ShieldIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path
        d="M9.103 1.677a1.25 1.25 0 0 1 1.794 0l.76.794a1.25 1.25 0 0 0 .878.373l1.09-.01a1.25 1.25 0 0 1 1.268 1.268l-.01 1.09c-.003.33.13.645.373.878l.794.76a1.25 1.25 0 0 1 0 1.794l-.794.76a1.25 1.25 0 0 0-.373.878l.01 1.09a1.25 1.25 0 0 1-1.268 1.268l-1.09-.01a1.25 1.25 0 0 0-.878.373l-.76.794a1.25 1.25 0 0 1-1.794 0l-.76-.794a1.25 1.25 0 0 0-.878-.373l-1.09.01a1.25 1.25 0 0 1-1.268-1.268l.01-1.09a1.25 1.25 0 0 0-.373-.878l-.794-.76a1.25 1.25 0 0 1 0-1.794l.794-.76c.243-.233.376-.548.373-.878l-.01-1.09A1.25 1.25 0 0 1 6.375 4.902l1.09.01c.33.003.645-.13.878-.373l.76-.794Z"
        fill="#666"
      />
      <path d="M7.5 10l1.667 1.667L12.5 8.333" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ── Right-arrow SVG (banner) ──────────────────────────────────────────────────
function ArrowRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12H19" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 6L19 12L13 18" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function Selfie() {
  const router = useRouter();
  const params = useParams();
  const formNumber = params?.formNumber as string;
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [step, setStep] = useState<1 | 2>(1);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const webcamRef = useRef<Webcam>(null);

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    if (formNumber === '1') {
      setStep(1);
    } else if (formNumber === '2') {
      setStep(2);
      setShowWebcam(true);
    }
  }, [formNumber]);

  const goBack = () => {
    showSpinner();
    if (step === 1) {
      setTimeout(() => { router.push('/planprocess/3'); hideSpinner(); }, 200);
    } else {
      setTimeout(() => { router.push('/CaptureSelfie/1'); hideSpinner(); }, 200);
    }
  };

  const goToCapture = () => { router.push('/CaptureSelfie/2'); };

  const continueWithMobile = () => {
    toast.info('Please open this link on your mobile device to capture your selfie.', {
      position: 'bottom-center', autoClose: 3000,
    });
  };

  const capture = useCallback(() => {
    const screenshot = webcamRef.current?.getScreenshot();
    if (screenshot) {
      setImageDataUrl(screenshot);
      setShowWebcam(false);
    }
  }, []);

  const retake = () => {
    setImageDataUrl('');
    setShowWebcam(true);
  };

  const uploadSelfie = async () => {
    if (!imageDataUrl) {
      toast.warning('Please capture a selfie first.', { position: 'bottom-center', autoClose: 2000 });
      return;
    }
    showSpinner();
    const reqData = {
      formNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      flag: 'docBase64String',
      docType: 'SELFIE',
      base64String: imageDataUrl,
    };
    try {
      const response = await apiService.postRequest('api/v1/uploadDocument/upload', reqData, hideSpinner);
      if (response?.status === true) {
        toast.success('Selfie uploaded successfully!', { position: 'bottom-center', autoClose: 2000 });
        setTimeout(() => {
          if (rejectStatus !== 'R') router.push('/uploadSignature');
          else navigationService.navigateToNextStep();
          hideSpinner();
        }, 200);
      } else {
        toast.error(response?.message || 'Upload failed', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  // ── Step 1: Prep / Guidelines ───────────────────────────────────────────────
  if (step === 1) {
    return (
      <section
        className="pan_details_form"
        aria-label="Take a Selfie — Preparation"
        style={{ background: '#f8f8f8', minHeight: 'calc(100vh - 90px)', padding: '0' }}
      >

        {/* ══════════════════════════════════════════════════════════
            MOBILE LAYOUT  (hidden ≥768px via pan_details_form breakpoint)
            ══════════════════════════════════════════════════════════ */}
        <div className="mobile_css" style={{ width: '100%' }}>
          {/* Gray header */}
          <div className={styles.mobGrayHeader}>
            <div className={styles.mobBackRow}>
              {rejectStatus !== 'R' && (
                <button type="button" className={styles.mobBackBtn} onClick={goBack} aria-label="Go back">
                  <svg width="8" height="15" viewBox="0 0 8 15" fill="none" aria-hidden="true">
                    <path d="M7 1L1 7.5L7 14" stroke="#666666" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              )}
            </div>
            <div className={styles.mobTitleBlock}>
              <p className={styles.mobTitle}>Get set for a quick selfie</p>
              <p className={styles.mobSubtitle}>
                Take a clear picture and upload it. Please ensure your selfie matches the photo on your Aadhar or Pan card
              </p>
            </div>
          </div>

          {/* White content card */}
          <div className={styles.mobContentCard}>
            {/* Illustration */}
            <div className={styles.mobIllustration}>
              <img src="/assets/images/diy/selfie_illustration.png" alt="Selfie guide illustration" />
            </div>

            {/* Do's */}
            <div className={styles.mobGuideSection}>
              <p className={styles.mobGuideTitle}>Do&apos;s</p>
              <div className={styles.mobGuideItemRow}>
                {DOS.map((d) => (
                  <div key={d.label} className={styles.mobGuideItem}>
                    <img src={d.img} alt={d.label} />
                    <p>{d.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Dont's */}
            <div className={styles.mobGuideSection}>
              <p className={styles.mobGuideTitle}>Dont&apos;s</p>
              <div className={styles.mobGuideItemRow}>
                {DONTS.map((d) => (
                  <div key={d.label} className={styles.mobGuideItem}>
                    <img src={d.img} alt={d.label} />
                    <p>{d.label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sticky capture button */}
          <div className={styles.mobBtnBar}>
            <button type="button" className={styles.mobCaptureBtn} onClick={goToCapture}>
              Capture Now
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════
            DESKTOP LAYOUT  (hidden <768px)
            ══════════════════════════════════════════════════════════ */}
        <div className="desktop_css">
          <div className={styles.deskCard}>

            {/* Header */}
            <div className={styles.deskHeader}>
              {rejectStatus !== 'R' && (
                <button type="button" className={styles.backBtn} onClick={goBack} aria-label="Go back">
                  <BackArrow />
                </button>
              )}
              <div className={styles.deskHeaderText}>
                <h5>Get set for a quick selfie</h5>
                <p>
                  Take a clear picture and upload it. Please ensure your selfie matches the photo on your Aadhar or Pan card
                </p>
              </div>
            </div>

            {/* Body */}
            <div className={styles.deskBody}>

              {/* Two-column: illustration + guidelines */}
              <div className={styles.twoCol}>

                {/* Left: illustration */}
                <div className={styles.illustrationCol}>
                  <img src="/assets/images/diy/selfie_illustration.png" alt="Selfie guide illustration" />
                </div>

                {/* Right: guidelines */}
                <div className={styles.guidelinesCol}>

                  {/* Do's */}
                  <div className={styles.guideSection}>
                    <p className={styles.guideTitle}>Do&apos;s</p>
                    <div className={styles.guideItemRow}>
                      {DOS.map((d) => (
                        <div key={d.label} className={styles.guideItem}>
                          <img src={d.img} alt={d.label} />
                          <p>{d.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Dont's */}
                  <div className={styles.guideSection}>
                    <p className={styles.guideTitle}>Dont&apos;s</p>
                    <div className={styles.guideItemRow}>
                      {DONTS.map((d) => (
                        <div key={d.label} className={styles.guideItem}>
                          <img src={d.img} alt={d.label} />
                          <p>{d.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* "No webcam" banner */}
              <div className={styles.noWebcamBanner}>
                <p>No webcam? No problem, Continue with mobile</p>
                <div className={styles.bannerArrow}>
                  <ArrowRight />
                </div>
              </div>

              {/* Button row */}
              <div className={styles.deskBtnRow}>
                <button
                  type="button"
                  className={styles.continueWithMobileBtn}
                  onClick={continueWithMobile}
                >
                  Continue with Mobile
                </button>
                <button
                  type="button"
                  className={styles.captureNowBtn}
                  onClick={goToCapture}
                >
                  Capture Now
                </button>
              </div>

            </div>
          </div>
        </div>

      </section>
    );
  }

  // ── Step 2: Webcam capture ──────────────────────────────────────────────────
  return (
    <section className="pan_details_form" aria-label="Capture Selfie">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">

            {/* Mobile */}
            <div className="mobile_css">
              <div className="back_cls">
                <button type="button" onClick={goBack} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <img src="/assets/images/diy/ChevronLeft.png" alt="" aria-hidden="true" style={{ width: 15 }} /> Back
                </button>
                <div className="mobile_header_padding">
                  <h5>Capture your selfie</h5>
                  <p className="sub_title">Position your face in the oval and tap capture.</p>
                </div>
              </div>
            </div>

            <form method="post">
              <div className="col-lg-12 col-md-12 col-12 desktop_css">
                <div className="mobile_header_padding">
                  <div className="help_faq_css">
                    <div className="d-flex gap-2">
                      <button type="button" className="sp-back-btn" onClick={goBack} aria-label="Go back">
                        <BackArrow />
                      </button>
                      <div className="heading">
                        <h5>Capture your selfie</h5>
                        <p className="sub_title">Position your face in the oval and click capture.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <hr className="desktop_css" />

              <div className={styles.cameraWrap}>
                {showWebcam && (
                  <div className={styles.ovalFrame}>
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      screenshotQuality={0.85}
                      videoConstraints={{ facingMode: 'user' }}
                      className={styles.ovalVideo}
                      onUserMediaError={() => {
                        toast.error('Camera access denied. Please enable camera permissions.', {
                          position: 'bottom-center', autoClose: 3000,
                        });
                        router.push('/CaptureSelfie/1');
                      }}
                    />
                  </div>
                )}

                {imageDataUrl && !showWebcam && (
                  <img src={imageDataUrl} alt="Captured selfie" className={styles.previewImg} />
                )}

                <p className={styles.ovalHint}>
                  {showWebcam ? 'Position your face in the oval' : 'Selfie captured'}
                </p>

                {showWebcam && (
                  <button type="button" className={styles.captureBtn} onClick={capture} aria-label="Capture selfie">
                    <img src="/assets/images/diy/camera-icon.png" alt="" aria-hidden="true" />
                  </button>
                )}

                {!showWebcam && imageDataUrl && (
                  <div className={styles.captureActions}>
                    <button type="button" className={styles.retakeBtn} onClick={retake}>Retake</button>
                    <button type="button" className={styles.uploadBtn} onClick={uploadSelfie}>Upload</button>
                  </div>
                )}
              </div>

              <div className="stickybtn_desk desktop_css" style={{ marginTop: 24 }}>
                {showWebcam && (
                  <button type="button" className="btn btn_cls" style={{ maxWidth: 350 }} onClick={capture}>
                    Capture
                  </button>
                )}
                {!showWebcam && imageDataUrl && (
                  <div style={{ display: 'flex', gap: 12, maxWidth: 400, margin: '0 auto' }}>
                    <button type="button" className="btn btn_cls_outline" onClick={retake} style={{ flex: 1 }}>Retake</button>
                    <button type="button" className="btn btn_cls" onClick={uploadSelfie} style={{ flex: 1 }}>Upload</button>
                  </div>
                )}
              </div>
            </form>

          </div>

          <div className="stickybtn mobile_css">
            {showWebcam && (
              <button type="button" className="btn btn_cls" onClick={capture}>Capture</button>
            )}
            {!showWebcam && imageDataUrl && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button type="button" className="btn btn_cls_outline" onClick={retake} style={{ flex: 1 }}>Retake</button>
                <button type="button" className="btn btn_cls" onClick={uploadSelfie} style={{ flex: 1 }}>Upload</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
