'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './email-home-page.module.scss';

// EmailHomePage — equivalent to Angular EmailHomePageComponent
// Handles manual email entry and OTP sending

export default function EmailHomePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [email, setEmail] = useState('');
  const [isEmailDisableBtn, setIsEmailDisableBtn] = useState(true);
  const [emailmultiplesymb, setEmailmultiplesymb] = useState(false);
  const [sbiemailFormatVal, setSbiemailFormatVal] = useState(false);
  const [emailReq, setEmailReq] = useState(false);
  const [emailFormatVal, setEmailFormatVal] = useState(false);
  const [emailspecialchars, setEmailspecialchars] = useState(false);

  const utmSource = searchParams.get('utm_source') || 'NA';
  const utmMedium = searchParams.get('utm_medium') || 'NA';
  const utmCampaign = searchParams.get('utm_campaign') || 'NA';

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    const savedEmail = sessionStorage.getItem('email') || '';
    setEmail(savedEmail);
  }, []);

  const checkAtSymbolCount = (inputString: string): number => {
    return (inputString.match(/@/g) || []).length;
  };

  const checkEmailSpecialchars = (emailVal: string): boolean => {
    const invalidCharsRegex = /[^a-z0-9_.@]/i;
    return invalidCharsRegex.test(emailVal);
  };

  const isEmailValid = (emailVal: string): boolean => {
    const emailRegex = /^[a-z](?!.*[_.]{2})[a-z0-9_.]*@[a-z0-9-]+(\.[a-z]{2,})+$/i;
    const isValidFormat = emailRegex.test(emailVal);
    const isExcludedDomain = emailVal.endsWith('@sbi.co.in');
    return isValidFormat && !isExcludedDomain;
  };

  const validateEmail = (val: string) => {
    const symbcount = checkAtSymbolCount(val);
    const multipleSymb = symbcount > 1;
    const req = val.length === 0;
    const formatVal = !req && !isEmailValid(val);
    const specialchars = checkEmailSpecialchars(val);
    const sbiformat = val.includes('sbi.co.in');

    setEmailmultiplesymb(multipleSymb);
    setEmailReq(req);
    setEmailFormatVal(formatVal);
    setEmailspecialchars(specialchars);
    setSbiemailFormatVal(sbiformat);
    setIsEmailDisableBtn(req || formatVal || sbiformat || multipleSymb || specialchars);
  };

  const handleEmailChange = (val: string) => {
    setEmail(val);
    validateEmail(val);
  };

  const emailScreen = () => {
    router.push('/email');
  };

  const getEmailOtp = async (isRetry: boolean) => {
    if (emailReq || emailFormatVal) return;
    sessionStorage.setItem('email', email);
    showSpinner();
    const reqData = {
      Flag: 'InsertOtpEmail',
      emailid: email,
      mobileno: sessionStorage.getItem('mobile'),
      isRetry,
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
      Formnumber: sessionStorage.getItem('FormNumber'),
    };
    try {
      const response = await apiService.postRequest('api/v1/oauth/service/otp/send', reqData, hideSpinner);
      if (response?.status === true) {
        setTimeout(() => {
          router.push('/email-home-otp');
          hideSpinner();
        }, 200);
      } else if (response?.status === false) {
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

  return (
    <section aria-label="Email ID Verification — enter your email address" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-md-12 col-12 p-0 p-sm-0 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                <div onClick={emailScreen} style={{ cursor: 'pointer' }}>
                  <img src="/assets/images/diy/ChevronLeft.png" alt="Previous Page" aria-hidden="true" /> Back
                </div>
                <div className="d-flex flex-column align-items-start gap-2">
                  <h5>Email ID Verification</h5>
                  <p className="sub_title">All communication related to your account will be sent to this email</p>
                </div>
              </div>
            </div>

            <form aria-label="Email ID Entry Form" method="post">
              <div className="div">
                <div className="col-lg-12 col-md-12 col-12 desktop_css">
                  <div className="header_padding">
                    <div className="help_faq_css">
                      <span onClick={emailScreen} style={{ cursor: 'pointer' }}>
                        <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <g clipPath="url(#clip0)">
                            <path d="M5 12.5H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 12.5L11 18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M5 12.5L11 6.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                          </g>
                          <defs><clipPath id="clip0"><rect width="24" height="24" fill="white" transform="translate(0 0.5)" /></clipPath></defs>
                        </svg>
                      </span>
                      <div className="d-flex flex-column gap-2">
                        <h5>Email ID Verification</h5>
                        <p className="sub_title">All communication related to your account will be sent to this email</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="desktop_css"><div className="line_css"></div></div>
                <div className="col-lg-12 col-md-12 col-12">
                  <div className="mobile_section">
                    <div className="desktop_align">
                      <div className="email_screen">
                        <form aria-label="Email ID Entry Form 2" method="post" className="email_form_css">
                          <div className="email_form">
                            <div>Email ID</div>
                            <div>
                              <input
                                type="email"
                                name="email"
                                autoComplete="email"
                                aria-label="example@gmail.com"
                                placeholder="example@gmail.com"
                                value={email}
                                onChange={(e) => handleEmailChange(e.target.value)}
                                onKeyDown={(e) => { if (e.key === 'Enter') getEmailOtp(false); }}
                              />
                            </div>
                          </div>
                        </form>
                      </div>
                    </div>
                    <div className="stickybtn_desk desktop_css">
                      <button
                        className="btn btn_cls"
                        onClick={() => getEmailOtp(false)}
                        aria-disabled={isEmailDisableBtn}
                        disabled={isEmailDisableBtn}
                      >
                        Send OTP
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </form>
            <div className="stickybtn mobile_css">
              <button
                className="btn btn_cls"
                onClick={() => getEmailOtp(false)}
                aria-disabled={isEmailDisableBtn}
                disabled={isEmailDisableBtn}
              >
                Send OTP
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
