'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './upload-aadhaar-front.module.scss';

// UploadAadhaarFront — Upload front side of Aadhaar card
// Equivalent to Angular UploadAadhaarFrontComponent

export default function UploadAadhaarFront() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isProceedDisabled, setIsProceedDisabled] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    getAadhaarFrontData();
  }, []);

  const getAadhaarFrontData = async () => {
    showSpinner();
    const reqData = {
      flag: 'AADHARFRONT',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqData, hideSpinner);
      if (response?.status === true && response?.data?.[0]?.Image) {
        setImagePreview(response.data[0].Image);
        setIsProceedDisabled(false);
      }
      hideSpinner();
    } catch { hideSpinner(); }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
      setIsProceedDisabled(false);
    };
    reader.readAsDataURL(file);
  };

  const upload = async () => {
    if (!imageBase64 && !imagePreview) {
      toast.warning('Please upload your Aadhaar front image.', { position: 'bottom-center', autoClose: 2000 });
      return;
    }
    showSpinner();
    const reqData = {
      formNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      flag: 'docBase64String',
      docType: 'AADHARFRONT',
      base64String: imageBase64 || imagePreview,
    };
    try {
      const response = await apiService.postRequest('api/v1/uploadDocument/upload', reqData, hideSpinner);
      if (response?.status === true) {
        toast.success('Aadhaar front uploaded!', { position: 'bottom-center', autoClose: 2000 });
        setTimeout(() => { router.push('/aadhaar-back'); hideSpinner(); }, 200);
      } else {
        toast.error(response?.message || 'Upload failed', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  const faqHelpBtn = (stageName: string) => {
    const encodedStageName = btoa(stageName);
    window.location.href = `faq?stageName=${encodeURIComponent(encodedStageName)}`;
  };

  const backToAadhar = () => {
    showSpinner();
    setTimeout(() => { router.push('/aadhar'); hideSpinner(); }, 200);
  };

  return (
    <section aria-label="Upload Aadhaar Front" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                {rejectStatus !== 'R' && (
                  <div onClick={backToAadhar} style={{ cursor: 'pointer' }}>
                    <img src="/assets/images/diy/ChevronLeft.png" alt="" aria-hidden="true" /> Back
                  </div>
                )}
                {rejectStatus === 'R' && <div className="back_cls2"></div>}
                <div className="mobile_header_padding">
                  <div className="help_faq_css">
                    <div className="d-flex flex-column gap-2">
                      <h5>Upload Aadhaar (Front)</h5>
                    </div>
                    <div>
                      <div className="help_btn" onClick={() => faqHelpBtn('Aadhaar')} style={{ cursor: 'pointer' }}>Need Help?</div>
                    </div>
                  </div>
                  <p className="sub_title">Upload the front side of your Aadhaar card</p>
                </div>
              </div>
            </div>

            <form aria-label="Upload Aadhaar Front Form" method="post">
              <div>
                <div className="col-lg-12 col-md-12 col-12 desktop_css">
                  <div className="mobile_header_padding">
                    <div className="help_faq_css">
                      <div className="d-flex gap-2">
                        {rejectStatus !== 'R' && (
                          <div onClick={backToAadhar} style={{ cursor: 'pointer' }}>
                            <span>
                              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_aadhar_front)">
                                  <path d="M5 12.5H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 6.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs><clipPath id="clip0_aadhar_front"><rect width="24" height="24" fill="white" transform="translate(0 0.5)" /></clipPath></defs>
                              </svg>
                            </span>
                          </div>
                        )}
                        <div className="heading">
                          <h5>Upload Aadhaar (Front)</h5>
                          <p className="sub_title">Upload the front side of your Aadhaar card</p>
                        </div>
                      </div>
                      <div>
                        <div className="help_btn" onClick={() => faqHelpBtn('Aadhaar')} style={{ cursor: 'pointer' }}>Need Help?</div>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="desktop_css" />

                <div className="upload_section">
                  <div
                    className="upload_box"
                    onClick={() => fileInputRef.current?.click()}
                    style={{ cursor: 'pointer', border: '2px dashed #ccc', borderRadius: 8, padding: 24, textAlign: 'center' }}
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="Aadhaar front preview" style={{ maxWidth: '100%', maxHeight: 300, borderRadius: 8 }} />
                    ) : (
                      <div>
                        <img src="/assets/images/diy/upload-icon.png" alt="Upload" />
                        <p>Click to upload Aadhaar front side</p>
                        <p style={{ fontSize: 12, color: '#999' }}>Supported formats: JPG, PNG, PDF</p>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*,application/pdf"
                      style={{ display: 'none' }}
                      onChange={handleFileChange}
                    />
                  </div>
                  {imagePreview && (
                    <div className="reupload_css mt-2 text-center" onClick={() => fileInputRef.current?.click()} style={{ cursor: 'pointer' }}>
                      Re-upload
                    </div>
                  )}
                </div>
              </div>

              <div className="stickybtn_desk desktop_css">
                <button className="btn btn_cls" disabled={isProceedDisabled} onClick={upload}>Proceed</button>
              </div>
            </form>
          </div>
          <div className="stickybtn mobile_css">
            <button className="btn btn_cls" disabled={isProceedDisabled} onClick={upload}>Proceed</button>
          </div>
        </div>
      </div>
    </section>
  );
}
