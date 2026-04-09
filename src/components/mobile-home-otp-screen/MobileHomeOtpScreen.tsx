'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { InputOtp } from 'primereact/inputotp';
import { toast } from 'react-toastify';
import { useSpinner } from '@/components/spinner/Spinner';
import apiService from '@/services/api.service';
import styles from './mobile-home-otp-screen.module.scss';

// MobileHomeOtpScreen — equivalent to Angular MobileHomeOtpScreenComponent
// OTP verification screen for mobile number

export default function MobileHomeOtpScreen() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [otp, setOtp] = useState<string | number | undefined>('');
  const [isWrongOTP, setIsWrongOTP] = useState(false);
  const [isRightOTP, setIsRightOTP] = useState(false);
  const [isMobileVerifyBtn, setIsMobileVerifyBtn] = useState(true);
  const [timeroff, setTimeroff] = useState(true);
  const [displayMobile, setDisplayMobile] = useState(30);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const sendMobileOtp = {
    mobile: typeof window !== 'undefined' ? sessionStorage.getItem('mobile') ?? '' : '',
    fullname: typeof window !== 'undefined' ? sessionStorage.getItem('NameSubmitted') ?? '' : '',
  };

  useEffect(() => {
    document.title =
      'Open Demat Account - Free Demat & Trading Account Opening Online | SBI Securities';
    startTimer();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  const startTimer = () => {
    setTimeroff(true);
    setDisplayMobile(30);
    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayMobile((prev) => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!);
          setTimeroff(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const onOtpChangeMobile = (value: string | number | undefined) => {
    setOtp(value);
    const otpStr = String(value ?? '');
    setIsMobileVerifyBtn(otpStr.length !== 6);
    if (isWrongOTP) setIsWrongOTP(false);
  };

  const editMobileNumber = () => {
    router.push('/');
  };

  const getMobileOtp = async (isResend: boolean) => {
    showSpinner();
    try {
      const response = await apiService.postRequest('SendMobileOTP', {
        mobile: sendMobileOtp.mobile,
        fullname: sendMobileOtp.fullname,
        isResend,
      }, hideSpinner);
      if (response) {
        startTimer();
        setOtp('');
        setIsMobileVerifyBtn(true);
        toast.success('OTP sent successfully!', { position: 'bottom-center', autoClose: 2000 });
      }
    } catch {
      hideSpinner();
    }
  };

  const getMobileOtpVerify = async (isResend: boolean) => {
    showSpinner();
    try {
      const clientid = sessionStorage.getItem('clientid') ?? '';
      const response = await apiService.postRequest('VerifyMobileOTP', {
        mobile: sendMobileOtp.mobile,
        otp: String(otp),
        clientid,
      }, hideSpinner);

      if (response) {
        setIsRightOTP(true);
        setIsWrongOTP(false);
        if (response.token) sessionStorage.setItem('token', response.token);
        const routes: string[] = response.routes ?? [];
        sessionStorage.setItem('allowedRoutes', JSON.stringify(routes));
        router.push(routes[0] ?? '/email');
      } else {
        setIsWrongOTP(true);
        setIsRightOTP(false);
        hideSpinner();
      }
    } catch {
      hideSpinner();
    }
  };

  return (
    <section aria-label="Mobile OTP Verification" className={`${styles.panDetailsForm} pan_details_form`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-md-12 col-12 p-0 p-sm-0 m-auto">
            {/* Mobile: header */}
            <div className={`mobile_css ${styles.mobileCss}`}>
              <div className={styles.backCls}>
                <div className="d-flex flex-column align-items-start gap-2">
                  <h5>OTP Verification</h5>
                  <p className="sub_title">You will receive OTP on your mobile number</p>
                </div>
              </div>
            </div>

            <form aria-label="Mobile OTP Verification Form" method="post">
              <div>
                {/* Desktop: header */}
                <div className="col-lg-12 col-md-12 col-12 desktop_css">
                  <div className={styles.headerPadding}>
                    <div className={styles.helpFaqCss}>
                      <div className="d-flex flex-column gap-2">
                        <h5>OTP Verification</h5>
                        <p className="sub_title">You will receive OTP on your mobile number</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="desktop_css">
                  <div className="line_css"></div>
                </div>

                <div className="col-lg-12 col-md-12 col-12">
                  <div className={styles.mobileSection}>
                    <div className={styles.desktopAlign}>
                      <div className={styles.mobileOtpScreen}>
                        <div className={styles.otpSection}>
                          {/* Mobile display & edit */}
                          <div className={styles.mobileInput}>
                            <h6>{sendMobileOtp.mobile}</h6>
                            <p
                              style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
                              onClick={editMobileNumber}
                            >
                              <span>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
                                  <path fillRule="evenodd" clipRule="evenodd" d="M12.6087 3.49506C12.9705 3.3452 13.3583 3.26807 13.7499 3.26807C14.1415 3.26807 14.5293 3.3452 14.8911 3.49506C15.2529 3.64492 15.5816 3.86457 15.8585 4.14148C16.1354 4.41839 16.3551 4.74712 16.5049 5.10892C16.6548 5.47072 16.7319 5.85849 16.7319 6.25009C16.7319 6.64169 16.6548 7.02946 16.5049 7.39126C16.3551 7.75306 16.1354 8.08179 15.8585 8.3587L7.10853 17.1087C6.99132 17.2259 6.83235 17.2918 6.66659 17.2918H3.33325C2.98807 17.2918 2.70825 17.0119 2.70825 16.6668V13.3334C2.70825 13.1677 2.7741 13.0087 2.89131 12.8915L11.6413 4.14148C11.9182 3.86457 12.247 3.64492 12.6087 3.49506Z" fill="#280071"/>
                                  <path fillRule="evenodd" clipRule="evenodd" d="M10.8081 4.97481C11.0521 4.73073 11.4479 4.73073 11.6919 4.97481L15.0253 8.30814C15.2694 8.55222 15.2694 8.94795 15.0253 9.19202C14.7812 9.4361 14.3855 9.4361 14.1414 9.19202L10.8081 5.85869C10.564 5.61461 10.564 5.21888 10.8081 4.97481Z" fill="#280071"/>
                                </svg>
                              </span>
                              <span className="edit">Edit</span>
                            </p>
                          </div>

                          {/* OTP Input */}
                          <div className={styles.otpInputBox}>
                            <span>Enter OTP</span>
                            <div>
                              <InputOtp
                                value={otp}
                                onChange={(e) => onOtpChangeMobile(e.value ?? '')}
                                length={6}
                                integerOnly
                                className={isWrongOTP ? 'is-error' : isRightOTP ? 'is-success' : ''}
                              />
                            </div>
                          </div>

                          {/* Wrong OTP error */}
                          {isWrongOTP && (
                            <div className="mb-2 d-block">
                              <div className="otp_cls">
                                <img src="/assets/images/diy/invalid_otp.png" alt="Mobile Invalid OTP" aria-hidden />
                                <span className="alert_msg">
                                  Please enter the valid 6 digit OTP sent to your mobile number.
                                </span>
                              </div>
                            </div>
                          )}

                          {/* Timer / Resend */}
                          <div className={styles.otpAlign}>
                            <div>
                              <span>Didn&apos;t receive the OTP?</span>
                            </div>
                            <div>
                              {timeroff ? (
                                <span>Resend OTP : {displayMobile} sec</span>
                              ) : (
                                <span
                                  onClick={() => getMobileOtp(true)}
                                  className="otp_confirmation"
                                >
                                  Resend OTP
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop button */}
                    <div className={`stickybtn_desk desktop_css`}>
                      <button
                        className="btn btn_cls"
                        onClick={() => getMobileOtpVerify(false)}
                        disabled={isMobileVerifyBtn}
                        aria-disabled={isMobileVerifyBtn}
                      >
                        Verify
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>

            {/* Mobile sticky button */}
            <div className="stickybtn mobile_css">
              <button
                className="btn btn_cls"
                onClick={() => getMobileOtpVerify(false)}
                disabled={isMobileVerifyBtn}
                aria-disabled={isMobileVerifyBtn}
              >
                Verify
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
