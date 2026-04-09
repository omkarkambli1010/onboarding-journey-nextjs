'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import SignatureCanvas from 'react-signature-canvas';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const SigCanvas = SignatureCanvas as any;
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './upload-signature.module.scss';

// UploadSignature — Capture or upload signature
// Equivalent to Angular UploadSignatureComponent

export default function UploadSignature() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const sigPadRef = useRef<SignatureCanvas>(null);
  const [signatureData, setSignatureData] = useState('');
  const [signatureExists, setSignatureExists] = useState(false);
  const [isSigEmpty, setIsSigEmpty] = useState(true);
  const [isRejectStatus, setIsRejectStatus] = useState(false);

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    setIsRejectStatus(rejectStatus === 'R');
    getSignatureData();
  }, []);

  const getSignatureData = async () => {
    showSpinner();
    const reqData = {
      flag: 'signature',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqData, hideSpinner);
      if (response?.status === true && response?.data?.[0]) {
        const base64Image = response.data[0].Image || response.data[0].SignatureImage;
        if (base64Image) {
          setSignatureData(base64Image);
          setSignatureExists(true);
          setIsSigEmpty(false);
          // Draw existing signature on canvas after mount
          setTimeout(() => {
            if (sigPadRef.current) {
              const canvas = sigPadRef.current.getCanvas();
              const ctx = canvas.getContext('2d');
              if (ctx) {
                const img = new Image();
                img.onload = () => {
                  canvas.width = canvas.offsetWidth;
                  canvas.height = canvas.offsetHeight;
                  const scale = Math.min(canvas.width / img.width, canvas.height / img.height);
                  ctx.clearRect(0, 0, canvas.width, canvas.height);
                  ctx.drawImage(img, 0, 0, img.width * scale, img.height * scale);
                };
                img.src = base64Image.startsWith('data:') ? base64Image : `data:image/png;base64,${base64Image}`;
              }
            }
          }, 200);
        }
      }
      hideSpinner();
    } catch { hideSpinner(); }
  };

  const onSignatureEnd = () => {
    if (sigPadRef.current && !sigPadRef.current.isEmpty()) {
      setIsSigEmpty(false);
    }
  };

  const clearSignature = () => {
    if (sigPadRef.current) sigPadRef.current.clear();
    setSignatureData('');
    setIsSigEmpty(true);
    setSignatureExists(false);
  };

  const uploadSignature = async () => {
    if (sigPadRef.current && sigPadRef.current.isEmpty() && !signatureData) {
      toast.warning('Please draw or upload your signature.', { position: 'bottom-center', autoClose: 2000 });
      return;
    }
    showSpinner();
    const base64 = sigPadRef.current && !sigPadRef.current.isEmpty()
      ? sigPadRef.current.getTrimmedCanvas().toDataURL('image/png')
      : signatureData;

    const reqData = {
      formNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      flag: 'docBase64String',
      docType: 'SIGNATURE',
      base64String: base64,
    };
    try {
      const response = await apiService.postRequest('api/v1/uploadDocument/upload', reqData, hideSpinner);
      if (response?.status === true) {
        toast.success('Signature uploaded successfully!', { position: 'bottom-center', autoClose: 2000 });
        if (rejectStatus !== 'R') {
          // Navigate based on what the next step requires (nominee or esign)
          setTimeout(() => { navigationService.navigateToNextStep(); hideSpinner(); }, 200);
        } else {
          setTimeout(() => { navigationService.navigateToNextStep(); hideSpinner(); }, 200);
        }
      } else {
        toast.error(response?.message || 'Upload failed', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  const backToSelfie = () => {
    showSpinner();
    setTimeout(() => { router.push('/CaptureSelfie/2'); hideSpinner(); }, 200);
  };

  const faqHelpBtn = (stageName: string) => {
    const encodedStageName = btoa(stageName);
    window.location.href = `faq?stageName=${encodeURIComponent(encodedStageName)}`;
  };

  return (
    <section aria-label="Upload Signature" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                {!isRejectStatus && (
                  <div onClick={backToSelfie} style={{ cursor: 'pointer' }}>
                    <img src="/assets/images/diy/ChevronLeft.png" alt="" aria-hidden="true" /> Back
                  </div>
                )}
                {isRejectStatus && <div className="back_cls2"></div>}
                <div className="mobile_header_padding">
                  <div className="help_faq_css">
                    <div className="d-flex gap-2">
                      <div className="d-flex flex-column gap-2">
                        <h5>Upload your Signature</h5>
                      </div>
                    </div>
                    <div>
                      <div className="help_btn" onClick={() => faqHelpBtn('Signature')} style={{ cursor: 'pointer' }}>Need Help?</div>
                    </div>
                  </div>
                  <p className="sub_title">Draw your signature in the box below</p>
                </div>
              </div>
            </div>

            <form aria-label="Upload Signature Form" method="post">
              <div>
                <div className="col-lg-12 col-md-12 col-12 desktop_css">
                  <div className="mobile_header_padding">
                    <div className="help_faq_css">
                      <div className="d-flex gap-2">
                        {!isRejectStatus && (
                          <div onClick={backToSelfie} style={{ cursor: 'pointer' }}>
                            <span>
                              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_sig)">
                                  <path d="M5 12.5H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 6.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs><clipPath id="clip0_sig"><rect width="24" height="24" fill="white" transform="translate(0 0.5)" /></clipPath></defs>
                              </svg>
                            </span>
                          </div>
                        )}
                        <div className="heading">
                          <h5>Upload your Signature</h5>
                          <p className="sub_title">Draw your signature in the box below</p>
                        </div>
                      </div>
                      <div>
                        <div className="help_btn" onClick={() => faqHelpBtn('Signature')} style={{ cursor: 'pointer' }}>Need Help?</div>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="desktop_css" />

                <div className="signature_section">
                  <div className="signature_box" style={{ border: '1px solid #ccc', borderRadius: 8, overflow: 'hidden' }}>
                    <SigCanvas
                      ref={sigPadRef}
                      penColor="black"
                      canvasProps={{ width: 500, height: 200, className: 'signature-canvas', style: { width: '100%', height: 200 } }}
                      onEnd={onSignatureEnd}
                    />
                  </div>
                  <div className="d-flex justify-content-end mt-2">
                    <button type="button" className="btn btn_cls_outline" onClick={clearSignature}>Clear</button>
                  </div>
                  <div className="pan_confirmation mt-3">
                    <p>Please ensure your signature matches the one on your PAN card and other official documents</p>
                  </div>
                </div>
              </div>

              <div className="stickybtn_desk desktop_css">
                <button className="btn btn_cls" disabled={isSigEmpty && !signatureData} onClick={uploadSignature}>
                  Upload
                </button>
              </div>
            </form>
          </div>
          <div className="stickybtn mobile_css">
            <button className="btn btn_cls" disabled={isSigEmpty && !signatureData} onClick={uploadSignature}>
              Upload
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
