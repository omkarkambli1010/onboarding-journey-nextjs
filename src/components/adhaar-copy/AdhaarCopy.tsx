'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './adhaar-copy.module.scss';

// AdhaarCopy — Upload Aadhaar card (front + back) or choose DigiLocker
// Equivalent to Angular AdhaarCopyComponent

export default function AdhaarCopy() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [showUploadOption, setShowUploadOption] = useState(false);
  const [isDigilockerAvailable, setIsDigilockerAvailable] = useState(false);

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    checkDigilockerStatus();
  }, []);

  const checkDigilockerStatus = async () => {
    showSpinner();
    const reqData = {
      flag: 'IsDigilocker',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqData, hideSpinner);
      if (response?.status === true && response?.data?.length) {
        const isDigilocker = response.data[0].IsDigilocker === 1;
        setIsDigilockerAvailable(isDigilocker);
      }
      hideSpinner();
    } catch { hideSpinner(); }
  };

  const goToDigilocker = () => {
    showSpinner();
    setTimeout(() => { router.push('/digilocker-screen'); hideSpinner(); }, 200);
  };

  const goToAadhaarUpload = () => {
    showSpinner();
    setTimeout(() => { router.push('/aadhaar-front'); hideSpinner(); }, 200);
  };

  const backToPersonalDetails = () => {
    showSpinner();
    setTimeout(() => { router.push('/personalDetailsForm/5'); hideSpinner(); }, 200);
  };

  const faqHelpBtn = (stageName: string) => {
    const encodedStageName = btoa(stageName);
    window.location.href = `faq?stageName=${encodeURIComponent(encodedStageName)}`;
  };

  return (
    <section aria-label="Aadhaar Verification" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                {rejectStatus !== 'R' && (
                  <div onClick={backToPersonalDetails} style={{ cursor: 'pointer' }}>
                    <img src="/assets/images/diy/ChevronLeft.png" alt="" aria-hidden="true" /> Back
                  </div>
                )}
                {rejectStatus === 'R' && <div className="back_cls2"></div>}
                <div className="mobile_header_padding">
                  <div className="help_faq_css">
                    <div className="d-flex flex-column gap-2">
                      <h5>Aadhaar Verification</h5>
                      <p className="sub_title">Choose how you want to verify your Aadhaar</p>
                    </div>
                    <div>
                      <div className="help_btn" onClick={() => faqHelpBtn('Aadhaar')} style={{ cursor: 'pointer' }}>Need Help?</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <form aria-label="Aadhaar Verification Form" method="post">
              <div>
                <div className="col-lg-12 col-md-12 col-12 desktop_css">
                  <div className="mobile_header_padding">
                    <div className="help_faq_css">
                      <div className="d-flex gap-2">
                        {rejectStatus !== 'R' && (
                          <div onClick={backToPersonalDetails} style={{ cursor: 'pointer' }}>
                            <span>
                              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_aadhar)">
                                  <path d="M5 12.5H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 6.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs><clipPath id="clip0_aadhar"><rect width="24" height="24" fill="white" transform="translate(0 0.5)" /></clipPath></defs>
                              </svg>
                            </span>
                          </div>
                        )}
                        <div className="heading">
                          <h5>Aadhaar Verification</h5>
                          <p className="sub_title">Choose how you want to verify your Aadhaar</p>
                        </div>
                      </div>
                      <div>
                        <div className="help_btn" onClick={() => faqHelpBtn('Aadhaar')} style={{ cursor: 'pointer' }}>Need Help?</div>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="desktop_css" />

                <div className="mobile_section">
                  <div className="desktop_align">
                    {isDigilockerAvailable && (
                      <div
                        className="square-box p-3 mb-3"
                        onClick={goToDigilocker}
                        style={{ cursor: 'pointer' }}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToDigilocker(); }}
                      >
                        <div className="pan_details_align">
                          <img src="/assets/images/diy/digilocker-icon.png" alt="DigiLocker" width={40} />
                          <div className="upload_css">
                            <h5>Fetch via DigiLocker</h5>
                            <p className="sub_title">Instantly verify using your DigiLocker account</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div
                      className="square-box p-3"
                      onClick={goToAadhaarUpload}
                      style={{ cursor: 'pointer' }}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToAadhaarUpload(); }}
                    >
                      <div className="pan_details_align">
                        <img src="/assets/images/diy/upload-doc.png" alt="Upload Aadhaar" width={40} />
                        <div className="upload_css">
                          <h5>Upload Aadhaar Copy</h5>
                          <p className="sub_title">Upload front and back of your Aadhaar card</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
