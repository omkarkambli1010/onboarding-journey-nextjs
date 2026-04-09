'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Webcam from 'react-webcam';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './selfie.module.scss';

// Selfie — CaptureSelfie step 1 = prep screen, step 2 = webcam capture
// Equivalent to Angular SelfieComponent

export default function Selfie() {
  const router = useRouter();
  const params = useParams();
  const formNumber = params?.formNumber as string;
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [personalFormOne, setPersonalFormOne] = useState(false); // original form 1 (unused in new flow)
  const [personalFormTwo, setPersonalFormTwo] = useState(false); // prep/instructions screen
  const [personalFormThree, setPersonalFormThree] = useState(false); // webcam capture

  const [imageDataUrl, setImageDataUrl] = useState('');
  const [showWebcam, setShowWebcam] = useState(false);
  const [existingImage, setExistingImage] = useState('');
  const webcamRef = useRef<Webcam>(null);

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    setFormVisibility(formNumber);
  }, [formNumber]);

  const setFormVisibility = (step: string) => {
    setPersonalFormOne(false);
    setPersonalFormTwo(false);
    setPersonalFormThree(false);
    if (step === '1') {
      setPersonalFormTwo(true);
      getSelfieData();
    } else if (step === '2') {
      setPersonalFormThree(true);
      setShowWebcam(true);
    }
  };

  const getSelfieData = async () => {
    showSpinner();
    const reqData = {
      flag: 'selfie',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqData, hideSpinner);
      if (response?.status === true && response?.data?.[0]?.Image) {
        setExistingImage(response.data[0].Image);
      }
      hideSpinner();
    } catch { hideSpinner(); }
  };

  const capture = useCallback(() => {
    if (webcamRef.current) {
      const screenshot = webcamRef.current.getScreenshot();
      if (screenshot) {
        setImageDataUrl(screenshot);
        setShowWebcam(false);
      }
    }
  }, [webcamRef]);

  const retake = () => {
    setImageDataUrl('');
    setShowWebcam(true);
  };

  const uploadSelfieApiCall = async () => {
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
        if (rejectStatus !== 'R') {
          setTimeout(() => { router.push('/uploadSignature'); hideSpinner(); }, 200);
        } else {
          setTimeout(() => { navigationService.navigateToNextStep(); hideSpinner(); }, 200);
        }
      } else {
        toast.error(response?.message || 'Upload failed', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  const redirectPlanProcess = () => {
    showSpinner();
    setTimeout(() => { router.push('/planprocess/3'); hideSpinner(); }, 200);
  };

  const goToCapture = () => {
    router.push('/CaptureSelfie/2');
  };

  const faqHelpBtn = (stageName: string) => {
    const encodedStageName = btoa(stageName);
    window.location.href = `faq?stageName=${encodeURIComponent(encodedStageName)}`;
  };

  return (
    <>
      {/* Step 1: Preparation screen */}
      {personalFormTwo && !personalFormThree && (
        <section className="pan_details_form" aria-label="Take a Selfie — Preparation">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 col-12 m-auto">
                <div className="mobile_css">
                  <div className="back_cls">
                    {rejectStatus !== 'R' && (
                      <div onClick={redirectPlanProcess} style={{ cursor: 'pointer' }}>
                        <img src="/assets/images/diy/ChevronLeft.png" alt="" aria-hidden="true" /> Back
                      </div>
                    )}
                    {rejectStatus === 'R' && <div className="back_cls2"></div>}
                    <div className="mobile_header_padding">
                      <div className="help_faq_css">
                        <div className="d-flex gap-2">
                          <div className="d-flex flex-column gap-2">
                            <h5>Let&apos;s take a selfie</h5>
                          </div>
                        </div>
                        <div>
                          <div className="help_btn" onClick={() => faqHelpBtn('Selfie')} style={{ cursor: 'pointer' }}>Need Help?</div>
                        </div>
                      </div>
                      <p className="sub_title">Take a clear picture and upload it.</p>
                    </div>
                  </div>
                </div>

                <form aria-label="Selfie Preparation Form" method="post">
                  <div>
                    <div className="col-lg-12 col-md-12 col-12 desktop_css">
                      <div className="mobile_header_padding">
                        <div className="help_faq_css">
                          <div className="d-flex gap-2">
                            {rejectStatus !== 'R' && (
                              <div onClick={redirectPlanProcess} style={{ cursor: 'pointer' }}>
                                <span>
                                  <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <g clipPath="url(#clip0_selfie)">
                                      <path d="M5 12.5H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M5 12.5L11 18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                      <path d="M5 12.5L11 6.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </g>
                                    <defs><clipPath id="clip0_selfie"><rect width="24" height="24" fill="white" transform="translate(0 0.5)" /></clipPath></defs>
                                  </svg>
                                </span>
                              </div>
                            )}
                            <div className="heading">
                              <h5>Get set for a quick selfie</h5>
                              <p className="sub_title">Take a clear picture and upload it. Please ensure your selfie matches the photo on your Aadhar or Pan card</p>
                            </div>
                          </div>
                          <div>
                            <div className="help_btn" onClick={() => faqHelpBtn('Selfie')} style={{ cursor: 'pointer' }}>Need Help?</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <hr className="desktop_css" />
                    <div className="selfie_new">
                      <div className="left_section">
                        <img src="/assets/images/diy/selfie_guy.png" alt="Selfie guide illustration" />
                      </div>
                      <div className="right_section">
                        <div className="do_section">
                          <h6>Do&apos;s</h6>
                          <ul>
                            <li>Ensure good lighting</li>
                            <li>Face the camera directly</li>
                            <li>Keep a neutral expression</li>
                          </ul>
                        </div>
                        <div className="dont_section">
                          <h6>Don&apos;ts</h6>
                          <ul>
                            <li>Avoid wearing glasses</li>
                            <li>Don&apos;t cover your face</li>
                            <li>Avoid dark backgrounds</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                    {existingImage && (
                      <div className="text-center my-3">
                        <img src={existingImage} alt="Existing selfie" style={{ maxWidth: 200, borderRadius: 8 }} />
                      </div>
                    )}
                  </div>
                </form>
              </div>
              <div className="stickybtn">
                <button className="btn btn_cls" onClick={goToCapture}>Take Selfie</button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Step 2: Webcam capture */}
      {personalFormThree && (
        <section className="pan_details_form" aria-label="Capture Selfie">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 col-12 m-auto">
                <div className="mobile_header_padding">
                  <div className="help_faq_css">
                    <div className="d-flex gap-2">
                      <div onClick={() => router.push('/CaptureSelfie/1')} style={{ cursor: 'pointer' }}>
                        <span aria-hidden="true">
                          <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_selfie2)">
                              <path d="M5 12.5H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5 12.5L11 18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              <path d="M5 12.5L11 6.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </g>
                            <defs><clipPath id="clip0_selfie2"><rect width="24" height="24" fill="white" transform="translate(0 0.5)" /></clipPath></defs>
                          </svg>
                        </span>
                      </div>
                      <div className="heading">
                        <h5>Capture your selfie</h5>
                        <p className="sub_title">Position your face within the frame and click capture</p>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="desktop_css" />

                <div className="selfie_capture text-center">
                  {showWebcam && (
                    <Webcam
                      ref={webcamRef}
                      screenshotFormat="image/jpeg"
                      screenshotQuality={0.8}
                      videoConstraints={{ facingMode: 'user' }}
                      style={{ width: '100%', maxWidth: 400, borderRadius: 8 }}
                      onUserMediaError={() => {
                        toast.error('Camera access denied. Please enable camera permissions.', { position: 'bottom-center', autoClose: 3000 });
                        router.push('/CaptureSelfie/1');
                      }}
                    />
                  )}
                  {imageDataUrl && !showWebcam && (
                    <div>
                      <img src={imageDataUrl} alt="Captured selfie" style={{ width: '100%', maxWidth: 400, borderRadius: 8 }} />
                    </div>
                  )}
                </div>

                <div className="stickybtn">
                  {showWebcam ? (
                    <button className="btn btn_cls" onClick={capture}>Capture</button>
                  ) : (
                    <>
                      <button className="btn btn_cls_outline me-2" onClick={retake}>Retake</button>
                      <button className="btn btn_cls" onClick={uploadSelfieApiCall}>Upload</button>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      )}
    </>
  );
}
