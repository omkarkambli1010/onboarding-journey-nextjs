'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './email-home-screen.module.scss';

// EmailHomeScreen — equivalent to Angular EmailHomeScreenComponent
// Handles Google OAuth and email verification method selection

export default function EmailHomeScreen() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [responsePayload, setResponsePayload] = useState<any>(null);
  const [googlebtn, setGooglebtn] = useState(false);

  const utmSource = searchParams.get('utm_source') || 'NA';
  const utmMedium = searchParams.get('utm_medium') || 'NA';
  const utmCampaign = searchParams.get('utm_campaign') || 'NA';
  const emailVerified = searchParams.get('email_verified') || '';
  const emailParam = searchParams.get('email') || '';
  const nameParam = searchParams.get('name') || '';
  const emailError = searchParams.get('Error') || '';

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);

    if (emailParam && emailVerified === 'true') {
      const payload = { email: emailParam, email_verified: emailVerified, name: nameParam };
      setResponsePayload(payload);
      getEmailOtpVerify(payload);
    } else if (emailError) {
      toast.error('Google Authentication Failed, Please Try Again...', {
        position: 'bottom-center',
        autoClose: 5000,
      });
    }
  }, []);

  const decodeJwtResponse = (token: string) => {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  };

  const handleGoogleResponse = (response: any) => {
    try {
      if (response.credential) {
        const payload = decodeJwtResponse(response.credential);
        setResponsePayload(payload);
        if (payload.email_verified === true) {
          getEmailOtpVerify(payload);
        }
      }
    } catch (error) {
      toast.error('Google Authentication Failed', { position: 'bottom-center' });
    }
  };

  const initGoogleSignIn = () => {
    try {
      const google = (window as any).google;
      google.accounts.id.initialize({
        client_id: '652145000458-ebpj0tfffq6e2lolfl3ei5fu11mhr831.apps.googleusercontent.com',
        context: 'use',
        use_fedcm_for_prompt: true,
        callback: handleGoogleResponse,
        cancel_on_tap_outside: false,
        auto_select: false,
        itp_support: true,
      });
    } catch {}
  };

  const signInWithGoogle = () => {
    showSpinner();
    const google = (window as any).google;
    if (!google) { hideSpinner(); return; }

    google.accounts.id.cancel();

    const googleError = sessionStorage.getItem('GoogleError') || '';
    if (!googleError) {
      initGoogleSignIn();
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          const reason = notification.isNotDisplayed()
            ? (notification.getNotDisplayedReason?.() || 'Prompt Not Displayed')
            : (notification.getSkippedMomentReason?.() || 'Prompt Skipped');
          sessionStorage.setItem('GoogleError', reason);
          toast.warning('Please provide permission to fetch your data from Google or please enter Email ID manually', {
            position: 'bottom-center',
            autoClose: 3000,
          });
          setTimeout(hideSpinner, 2500);
        }
      });
      setTimeout(hideSpinner, 2500);
    } else {
      setGooglebtn(true);
      const formNumber = sessionStorage.getItem('FormNumber');
      const routeurl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      window.location.href = `${routeurl}GoogleAuthentication/GoogleSignIn.aspx?clientcode=${formNumber}`;
    }
  };

  const getEmailOtpVerify = async (payload: any) => {
    if (!payload) return;
    const reqData = {
      Flag: 'SaveGmail',
      emailid: payload.email,
      emailidverified: payload.email_verified,
      GmailProfileName: payload.name,
      Formnumber: sessionStorage.getItem('FormNumber'),
      mobileno: sessionStorage.getItem('mobile'),
      utm_source: utmSource,
      utm_medium: utmMedium,
      utm_campaign: utmCampaign,
    };
    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/oauth/service/otp/savegmail', reqData, hideSpinner);
      if (response?.status === true) {
        setTimeout(() => {
          router.push('/uploadProcess/1');
          hideSpinner();
        }, 200);
      } else {
        toast.error(response?.message || 'Error', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch {
      hideSpinner();
    }
  };

  const emailTextPage = () => {
    showSpinner();
    setTimeout(() => {
      router.push('/email-home-textpage');
      hideSpinner();
    }, 200);
  };

  return (
    <section aria-label="Email ID Verification — choose verification method" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-md-12 col-12 p-0 p-sm-0 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                <div className="d-flex flex-column align-items-start gap-2">
                  <h5>Email ID Verification</h5>
                  <p className="sub_title">
                    All communication related to your account will be sent to this email
                  </p>
                </div>
              </div>
            </div>

            <form aria-label="Email Verification Form" method="post">
              <div className="div">
                <div className="col-lg-12 col-md-12 col-12 desktop_css">
                  <div className="header_padding">
                    <div className="help_faq_css">
                      <div className="d-flex flex-column gap-2">
                        <h5>Email ID Verification</h5>
                        <p className="sub_title">
                          All communication related to your account will be sent to this email
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="desktop_css">
                  <div className="line_css"></div>
                </div>
                <div className="col-lg-12 col-md-12 col-12">
                  <div className="mobile_section">
                    <div className="desktop_align">
                      <div className="email_screen">
                        <div className="google_btn" onClick={signInWithGoogle} style={{ cursor: 'pointer' }}>
                          <span>
                            <img src="/assets/images/diy/google_icon_mini.png" alt="Google Icon Mini Image" aria-hidden="true" />
                          </span>
                          <span className="google_txt">Continue with Google</span>
                        </div>
                        <div className="desktop_css">
                          <img className="" src="/assets/images/diy/or_sec_img.png" alt="Or Sec Image" aria-hidden="true" />
                        </div>
                        <div className="mobile_css">
                          <img className="" src="/assets/images/diy/or_sec_img_mobile.png" alt="Or Sec Image" aria-hidden="true" />
                        </div>
                        <div className="email_text_section">
                          <h6 onClick={emailTextPage} style={{ cursor: 'pointer' }}>
                            Use another E-mail ID
                          </h6>
                          <h6>(Require OTP Verification)</h6>
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
