'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useSpinner } from '@/components/spinner/Spinner';
import apiService from '@/services/api.service';
import aesService from '@/services/aes.service';
import moengagesdkService from '@/services/moengagesdk.service';
import styles from './digilocker-screen.module.scss';

// DigiLocker Screen — equivalent to Angular DigilockerScreenComponent
// Shows DigiLocker verification instructions and redirects user to DigiLocker

export default function DigilockerScreen() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [nameSubmitted, setNameSubmitted] = useState('');

  const clientid =
    typeof window !== 'undefined' ? sessionStorage.getItem('clientid') ?? '' : '';

  useEffect(() => {
    document.title = 'Digilocker Screen - Onboarding-DIY-PWA';
    getDigilockerName();
  }, []);

  const getDigilockerName = async () => {
    try {
      const response = await apiService.postRequest('api/v1/masters/get', {
        flag: 'Getnameasperpan',
        FormNumber: sessionStorage.getItem('FormNumber'),
      });
      if (response?.status === true) {
        const decrypted = JSON.parse(aesService.decrypt(response.data, clientid, clientid));
        setNameSubmitted(decrypted?.data?.[0]?.nameasperpan ?? '');
      }
    } catch {
      // silently fail
    }
  };

  const faqHelpBtn = (stageName: string) => {
    const encodedStageName = btoa(stageName);
    window.location.href = `/faq?stageName=${encodeURIComponent(encodedStageName)}`;
  };

  const redirectDigiLocker = async () => {
    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/Digilocker/getRedirectURL', {
        formNumber: sessionStorage.getItem('FormNumber'),
      });

      if (response?.status === true) {
        const decrypted = JSON.parse(
          JSON.parse(aesService.decrypt(response.data, clientid, clientid))
        );
        const redirectUrl = decrypted?.data;

        moengagesdkService.trackEvent('Digilocker Redirection', {
          product_id: sessionStorage.getItem('FormNumber') ?? '',
          product_name: 'Onboarding DIY',
          category: 'Digilocker Redirection',
          Redirection_URL: redirectUrl,
        });

        if (redirectUrl) {
          window.location.href = redirectUrl;
        } else {
          toast.warning(response.message, { position: 'bottom-center', autoClose: 2000 });
          hideSpinner();
        }
      } else {
        toast.warning(response?.message, { position: 'bottom-center', autoClose: 2000 });
        hideSpinner();
      }
    } catch {
      hideSpinner();
    }
  };

  return (
    <section aria-label="DigiLocker Aadhaar and PAN Verification" className={`${styles.panDetailsForm} pan_details_form`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-8 col-md-12 col-12 p-0 p-sm-0 m-auto">
            {/* Mobile header */}
            <div className="mobile_css">
              <div className={styles.headerPadding}>
                <div className={styles.helpFaqCss}>
                  <div>
                    <Image
                      src="/assets/images/diy/digilocker_img.png"
                      alt="DigiLocker logo"
                      width={120}
                      height={40}
                    />
                  </div>
                  <div>
                    <button
                      className={styles.helpBtn}
                      onClick={() => faqHelpBtn('Digilocker')}
                    >
                      Need Help?
                    </button>
                  </div>
                </div>
                <p className="sub_title">Verify your Aadhaar &amp; PAN via Digilocker</p>
              </div>
            </div>

            {/* Desktop header */}
            <div className="desktop_css">
              <div className={styles.headerPadding}>
                <div className={styles.helpFaqCss}>
                  <div className={styles.desktopAlignHeader}>
                    <div>
                      <Image
                        src="/assets/images/diy/digilocker_img.png"
                        alt="DigiLocker logo"
                        width={120}
                        height={40}
                      />
                      <p className="sub_title">Verify your Aadhaar &amp; PAN via Digilocker</p>
                    </div>
                    <div>
                      <button
                        className={styles.helpBtn}
                        onClick={() => faqHelpBtn('Digilocker')}
                      >
                        Need Help?
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="desktop_css">
              <div className="line_css"></div>
            </div>

            {/* Main content */}
            <div className="col-lg-12 col-md-12 col-12">
              <div className={styles.mobileSection}>
                <div className={styles.desktopAlign}>
                  <div className={styles.mainHeading}>
                    Enter Aadhaar number for{' '}
                    <span style={{ textTransform: 'capitalize' }}>&apos;{nameSubmitted}&apos;</span>
                  </div>
                  <div>
                    <Image
                      src="/assets/images/diy/aadhar_card_sample_img.png"
                      alt="Sample Aadhaar card"
                      width={340}
                      height={200}
                      draggable={false}
                      style={{ width: '100%', height: 'auto' }}
                    />
                  </div>
                  <p className={styles.subHeading}>
                    In the next step, OTP will be sent to your Aadhaar linked Mobile number
                  </p>
                </div>

                <div className={styles.digilockerVideoSection}>
                  <div className={styles.section}>
                    <p className={styles.header}>
                      Select <span>Aadhaar and PAN</span> on the next screen
                    </p>
                    <div>
                      <Image
                        src="/assets/images/diy/digilocker_toogle_video.gif"
                        alt="DigiLocker selection guide animation"
                        width={300}
                        height={200}
                        draggable={false}
                        style={{ width: '100%', height: 'auto' }}
                      />
                    </div>
                    <p className={styles.bottomText}>
                      Create a 6-digit M-PIN (for new DigiLocker users)
                    </p>
                  </div>
                </div>

                <div className={`stickybtn_desk desktop_css`}>
                  <button className="btn btn_cls" onClick={redirectDigiLocker}>
                    Verify with Digilocker
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky mobile button */}
      <div className="stickybtn mobile_css">
        <button className="btn btn_cls" onClick={redirectDigiLocker}>
          Verify with Digilocker
        </button>
      </div>
    </section>
  );
}
