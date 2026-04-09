'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './email-home-otp-screen.module.scss';

// EmailHomeOtpScreen — equivalent to Angular EmailHomeOtpScreenComponent
// OTP verification for email

export default function EmailHomeOtpScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [otp, setOtp] = useState('');
  const [displayEmail, setDisplayEmail] = useState('00:30');
  const [timeroff1, setTimeroff1] = useState(true);
  const [isEmailVerifyBtn, setIsEmailVerifyBtn] = useState(true);
  const [isWrongOTP, setIsWrongOTP] = useState(false);
  const [isRightOTP, setIsRightOTP] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const emailRef = useRef('');
  const mobileRef = useRef('');

  const utmSource = searchParams.get('utm_source') || 'NA';
  const utmMedium = searchParams.get('utm_medium') || 'NA';
  const utmCampaign = searchParams.get('utm_campaign') || 'NA';

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    if (typeof window !== 'undefined') {
      emailRef.current = sessionStorage.getItem('email') || '';
      mobileRef.current = sessionStorage.getItem('mobile') || '';
    }
    startTimerEmail();
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const startTimerEmail = () => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    let seconds = 30;
    let statSec = 30;
    setDisplayEmail('00:30');
    setTimeroff1(true);

    intervalRef.current = setInterval(() => {
      seconds--;
      if (statSec !== 0) statSec--;
      else statSec = 29;
      const textSec = statSec < 10 ? '0' + statSec : String(statSec);
      setDisplayEmail(`00:${textSec}`);
      if (seconds === 0) {
        setTimeroff1(false);
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 1000);
  };

  const handleOtpChange = (val: string) => {
    const numVal = val.replace(/\D/g, '').slice(0, 6);
    setOtp(numVal);
    setIsEmailVerifyBtn(numVal.length !== 6);
    setIsWrongOTP(false);
    setIsRightOTP(false);
  };

  const editEmailID = () => {
    showSpinner();
    setTimeout(() => {
      router.push('/email-home-textpage');
      hideSpinner();
    }, 200);
  };

  const getEmailOtp = async (isRetry: boolean) => {
    showSpinner();
    setOtp('');
    setIsEmailVerifyBtn(true);
    setIsWrongOTP(false);
    setIsRightOTP(false);
    if (intervalRef.current) clearInterval(intervalRef.current);

    const reqData = {
      Flag: 'InsertOtpEmail',
      emailid: emailRef.current,
      mobileno: mobileRef.current,
      isRetry,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      Formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/oauth/service/otp/send', reqData, hideSpinner);
      startTimerEmail();
      if (response?.status === false) {
        const msg = response.message;
        if (msg === 'Internal server error') {
          toast.error('Internal Server Error!', { position: 'bottom-center', autoClose: 2000 });
        } else {
          toast.warning(msg, { position: 'bottom-center', autoClose: 5000 });
        }
        hideSpinner();
      }
    } catch {
      hideSpinner();
    }
  };

  const getEmailOtpVerify = async (isRetry: boolean) => {
    setIsWrongOTP(false);
    setIsRightOTP(false);
    setIsEmailVerifyBtn(false);

    const reqData = {
      Flag: 'VerifyOTPEmail',
      Formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      emailid: emailRef.current,
      mobileno: mobileRef.current,
      isRetry,
      otp,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    };
    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/oauth/service/otp/verify', reqData, hideSpinner);
      if (response?.status === false) {
        toast.error(response.message, { position: 'bottom-center', autoClose: 4000 });
        setIsEmailVerifyBtn(true);
        return;
      }
      if (response?.message === 'OTP Verify successfully' && response?.status === true) {
        if (typeof window !== 'undefined') sessionStorage.removeItem('email');
        if (intervalRef.current) clearInterval(intervalRef.current);
        setShowSuccessModal(true);
        setTimeout(() => {
          setShowSuccessModal(false);
          router.push('/uploadProcess/1');
          hideSpinner();
        }, 2000);
      } else if (response?.status === false) {
        const msg = response?.message;
        if (msg === 'Wrong Otp') {
          setIsWrongOTP(true);
        } else if (msg === 'OTP Limit Exceeded') {
          toast.warning(msg, { position: 'bottom-center', autoClose: 2000 });
        } else {
          toast.info(msg, { position: 'bottom-center', autoClose: 2000 });
        }
        setIsEmailVerifyBtn(true);
      } else {
        setTimeout(() => {
          router.push('/email-home-textpage');
          hideSpinner();
        }, 200);
        toast.error(response?.message, { position: 'bottom-center', autoClose: 3000 });
      }
    } catch {
      hideSpinner();
    }
  };

  return (
    <>
      <section aria-label="Email OTP Verification" className="pan_details_form">
        <div className="container">
          <div className="row">
            <div className="col-lg-8 col-md-12 col-12 p-0 p-sm-0 m-auto">
              <div className="mobile_css">
                <div className="back_cls">
                  <div className="d-flex flex-column align-items-start gap-2">
                    <h5>OTP Verification</h5>
                    <p className="sub_title">You will receive OTP on your Email ID</p>
                  </div>
                </div>
              </div>

              <form aria-label="Email OTP Verification Form" method="post">
                <div className="div">
                  <div className="col-lg-12 col-md-12 col-12 desktop_css">
                    <div className="header_padding">
                      <div className="help_faq_css">
                        <div className="d-flex flex-column gap-2">
                          <h5>OTP Verification</h5>
                          <p className="sub_title">You will receive OTP on your Email ID</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="desktop_css"><div className="line_css"></div></div>
                  <div className="col-lg-12 col-md-12 col-12">
                    <div className="mobile_section">
                      <div className="desktop_align">
                        <div className="mobile_otp_screen">
                          <div className="otp_section">
                            <div className="mobile_input">
                              <h6>{emailRef.current}</h6>
                              <p
                                role="button"
                                tabIndex={0}
                                style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}
                                onClick={editEmailID}
                                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') editEmailID(); }}
                              >
                                <span>
                                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path fillRule="evenodd" clipRule="evenodd" d="M12.6087 3.49506C12.9705 3.3452 13.3583 3.26807 13.7499 3.26807C14.1415 3.26807 14.5293 3.3452 14.8911 3.49506C15.2529 3.64492 15.5816 3.86457 15.8585 4.14148C16.1354 4.41839 16.3551 4.74712 16.5049 5.10892C16.6548 5.47072 16.7319 5.85849 16.7319 6.25009C16.7319 6.64169 16.6548 7.02946 16.5049 7.39126C16.3551 7.75306 16.1354 8.08179 15.8585 8.3587L7.10853 17.1087C6.99132 17.2259 6.83235 17.2918 6.66659 17.2918H3.33325C2.98807 17.2918 2.70825 17.0119 2.70825 16.6668V13.3334C2.70825 13.1677 2.7741 13.0087 2.89131 12.8915L11.6413 4.14148C11.9182 3.86457 12.247 3.64492 12.6087 3.49506Z" fill="#280071" />
                                  </svg>
                                </span>
                                <span className="edit">Edit</span>
                              </p>
                            </div>
                            <div className="otp_input_box">
                              <span>Enter OTP</span>
                              <div>
                                <input
                                  type="text"
                                  inputMode="numeric"
                                  maxLength={6}
                                  value={otp}
                                  onChange={(e) => handleOtpChange(e.target.value)}
                                  onKeyDown={(e) => { if (e.key === 'Enter') getEmailOtpVerify(false); }}
                                  aria-label="Enter 6-digit OTP sent to your email"
                                  className={`otp-input form-control ${isRightOTP ? 'is-valid' : ''} ${isWrongOTP ? 'is-invalid' : ''}`}
                                  style={{ letterSpacing: '0.3em', fontSize: '1.2rem', textAlign: 'center' }}
                                />
                              </div>
                            </div>
                            {isWrongOTP && (
                              <div className="mb-2 d-block">
                                <div className="otp_cls">
                                  <img src="/assets/images/diy/invalid_otp.png" alt="" />
                                  <span className="alert_msg">Invalid OTP. Enter the valid 6-digit OTP sent on your Email</span>
                                </div>
                              </div>
                            )}
                            <div className="otp_align">
                              <div><span>Didn&apos;t receive the OTP?</span></div>
                              <div>
                                {timeroff1 ? (
                                  <span>Resend OTP : {displayEmail + ' sec'}</span>
                                ) : (
                                  <span onClick={() => getEmailOtp(true)} className="otp_confirmation" style={{ cursor: 'pointer' }}>
                                    Resend OTP
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="stickybtn_desk desktop_css">
                        <button
                          className="btn btn_cls"
                          onClick={() => getEmailOtpVerify(false)}
                          aria-disabled={isEmailVerifyBtn}
                          disabled={isEmailVerifyBtn}
                        >
                          Verify
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </form>
              <div className="stickybtn mobile_css">
                <button
                  className="btn btn_cls"
                  onClick={() => getEmailOtpVerify(false)}
                  aria-disabled={isEmailVerifyBtn}
                  disabled={isEmailVerifyBtn}
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Email Success Modal */}
      {showSuccessModal && (
        <div className="modal fade emailBox show" style={{ display: 'block' }} aria-modal="true">
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-body">
                <div className="email_content" style={{ textAlign: 'center', padding: '20px' }}>
                  <div>
                    <svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100" fill="none">
                      <g clipPath="url(#clip0_success)">
                        <path d="M50 93.75C38.3968 93.75 27.2688 89.1406 19.0641 80.9359C10.8594 72.7312 6.25 61.6032 6.25 50C6.25 38.3968 10.8594 27.2688 19.0641 19.0641C27.2688 10.8594 38.3968 6.25 50 6.25C61.6032 6.25 72.7312 10.8594 80.9359 19.0641C89.1406 27.2688 93.75 38.3968 93.75 50C93.75 61.6032 89.1406 72.7312 80.9359 80.9359C72.7312 89.1406 61.6032 93.75 50 93.75Z" stroke="#039855" strokeWidth="2" fill="none" />
                        <path d="M27.0257 52.3938L43.5632 68.9375L75.2569 37.625" stroke="#039855" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                      </g>
                      <defs><clipPath id="clip0_success"><rect width="100" height="100" fill="white" /></clipPath></defs>
                    </svg>
                  </div>
                  <div><h5>Email Verification</h5></div>
                  <div><p>Your Email ID been verified successfully</p></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
