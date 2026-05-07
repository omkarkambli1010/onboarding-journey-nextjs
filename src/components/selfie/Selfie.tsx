'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Webcam from 'react-webcam';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from '@/services/toast.service';
import navigationService from '@/services/navigation.service';
import styles from './selfie.module.scss';

const DOS = [
  { img: '/assets/images/diy/good_lightening_icon.png', label: 'Good lighting' },
  { img: '/assets/images/diy/white_bg_icon.png',        label: 'White background' },
  { img: '/assets/images/diy/align_face_icon.png',      label: 'Align face in the centre' },
];

const DONTS = [
  { img: '/assets/images/diy/no_blurry_pic.png',   label: 'No blurry photo' },
  { img: '/assets/images/diy/no_cap_icon.png',     label: 'No cap' },
  { img: '/assets/images/diy/no_eyewear_icon.png', label: 'No eyewear' },
];

function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12H19" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 18" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 6" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12H19" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M13 6L19 12L13 18" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LocationPinIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <path
        d="M16 3C11.03 3 7 7.03 7 12c0 7.25 9 17 9 17s9-9.75 9-17c0-4.97-4.03-9-9-9zm0 12a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"
        fill="#280071"
      />
    </svg>
  );
}

function LocationModal({ onClose }: { onClose: () => void }) {
  return (
    <div className={styles.locationOverlay} onClick={onClose}>
      <div className={styles.locationModalCard} onClick={(e) => e.stopPropagation()} data-lenis-prevent>
        <div className={styles.locationModalTop}>
          <div className={styles.locationIconBox}>
            <LocationPinIcon />
          </div>
          <h2 className={styles.locationModalTitle}>Enable Location Permission</h2>
        </div>
        <div className={styles.locationModalBody}>
          <p>Location access is required to proceed with selfie capture.</p>
          <ol>
            <li>Tap the <strong>lock icon/site info icon</strong> on the left of the address bar.</li>
            <li>Go to <strong>Site Settings/Permissions</strong>.</li>
            <li>Set Location permission to <strong>Allow</strong>.</li>
            <li>Once enabled, tap <strong>Refresh Now</strong> to continue</li>
          </ol>
        </div>
        <button
          type="button"
          className={styles.locationRefreshBtn}
          onClick={() => window.location.reload()}
        >
          Refresh Now
        </button>
      </div>
    </div>
  );
}

function BadgeDo() {
  return (
    <span className={styles.badgeDo} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#22c55e" />
        <path d="M4.5 8l2.5 2.5 4.5-5" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function BadgeDont() {
  return (
    <span className={styles.badgeDont} aria-hidden="true">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="8" fill="#ef4444" />
        <path d="M5 5l6 6M11 5l-6 6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

export default function Selfie() {
  const router = useRouter();
  const params = useParams();
  const formNumber = params?.formNumber as string;
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [step, setStep] = useState<1 | 2>(1);
  const [imageDataUrl, setImageDataUrl] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
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

  const goToCapture = () => {
    if (!navigator.geolocation) {
      setShowLocationModal(true);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      () => router.push('/CaptureSelfie/2'),
      () => setShowLocationModal(true),
      { timeout: 5000 }
    );
  };

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

  const uploadSelfie = () => {
    if (!imageDataUrl) {
      toast.warning('Please capture a selfie first.', { position: 'bottom-center', autoClose: 2000 });
      return;
    }
    showSpinner();
    if (rejectStatus !== 'R') {
      router.push('/uploadSignature');
    } else {
      navigationService.navigateToNextStep();
    }
    hideSpinner();
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
            MOBILE LAYOUT
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
              <div className={styles.mobTitleRow}>
                <p className={styles.mobTitle}>Get set for a quick selfie</p>
                <button type="button" className={styles.needHelpChip}>Need Help?</button>
              </div>
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
                    <div className={styles.iconWrap}>
                      <img src={d.img} alt={d.label} />
                      <BadgeDo />
                    </div>
                    <p>{d.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Don'ts */}
            <div className={styles.mobGuideSection}>
              <p className={styles.mobGuideTitle}>Dont&apos;s</p>
              <div className={styles.mobGuideItemRow}>
                {DONTS.map((d) => (
                  <div key={d.label} className={styles.mobGuideItem}>
                    <div className={styles.iconWrap}>
                      <img src={d.img} alt={d.label} />
                      <BadgeDont />
                    </div>
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

        {showLocationModal && <LocationModal onClose={() => setShowLocationModal(false)} />}

        {/* ══════════════════════════════════════════════════════════
            DESKTOP LAYOUT
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
                <div className={styles.deskTitleRow}>
                  <h5>Get set for a quick selfie</h5>
                  <button type="button" className={styles.needHelpChip}>Need Help?</button>
                </div>
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
                          <div className={styles.iconWrap}>
                            <img src={d.img} alt={d.label} />
                            <BadgeDo />
                          </div>
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
                          <div className={styles.iconWrap}>
                            <img src={d.img} alt={d.label} />
                            <BadgeDont />
                          </div>
                          <p>{d.label}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* "No webcam" banner — clickable, leads to mobile flow */}
              <button type="button" className={styles.noWebcamBanner} onClick={continueWithMobile}>
                <p>No webcam? No problem, <strong>Continue with mobile</strong></p>
                <div className={styles.bannerArrow}>
                  <ArrowRight />
                </div>
              </button>

              {/* Single "Capture Now" button */}
              <div className={styles.deskBtnRow}>
                <button type="button" className={styles.captureNowBtn} onClick={goToCapture}>
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
