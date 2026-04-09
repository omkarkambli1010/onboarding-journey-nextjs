'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Carousel } from 'primereact/carousel';
import { InputOtp } from 'primereact/inputotp';
import { toast } from 'react-toastify';
import { useSpinner } from '@/components/spinner/Spinner';
import apiService from '@/services/api.service';
import aesService from '@/services/aes.service';
import moengagesdkService from '@/services/moengagesdk.service';
import styles from './home.module.scss';

// Home component — equivalent to Angular HomeComponent
// Handles: registration form (name + mobile), mobile OTP, email OTP, Google OAuth

const TESTIMONIALS = [
  {
    message:
      'We appreciate the innovative solutions and tools provided by SBI Securities, particularly the SBI Securities app. The app has been a game-changer for us, offering a seamless and intuitive trading experience.',
    author: 'Arun Kumar Mishra',
  },
  {
    message:
      'I am really thankful for your personal touch in understanding SBI Securities platform. Earlier, I was not aware about Infra Tracker, Reality Tracker, and other Trackers available in the platform which helped me to invest in a better manner.',
    author: 'Rajiv Ranjan',
  },
];

const VIDEOS = [
  {
    url: 'https://www.youtube.com/embed/0cfFB8d_n60?si=Mwd2ApOaaT1SXOhM',
    caption: 'Invest to your FULL POTENTIAL with the SBI Securities App!',
  },
  {
    url: 'https://www.youtube.com/embed/Rb7IE_P3UcA',
    caption:
      'E-Margin (Margin Trading Facility) - Up to 4x Buying Power at 0% Interest for 23 trading days',
  },
];

const RESPONSIVE_VIDEO_OPTIONS = [
  { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
  { breakpoint: '768px', numVisible: 1, numScroll: 1 },
  { breakpoint: '560px', numVisible: 1, numScroll: 1 },
];

const RESPONSIVE_OPTIONS = [
  { breakpoint: '1024px', numVisible: 2, numScroll: 1 },
  { breakpoint: '768px', numVisible: 1, numScroll: 1 },
];

export default function HomeComponent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  // Form state
  const [sendOtp, setSendOtp] = useState({ mobile: '', email: '', fullname: '' });
  const [moreThanTwoValues, setMoreThanTwoValues] = useState(false);
  const [panFullNameReqSpecial, setPanFullNameReqSpecial] = useState(false);
  const [panFullNameReqDigit, setPanFullNameReqDigit] = useState(false);
  const [panFullNameReqSpace, setPanFullNameReqSpace] = useState(false);
  const [mobileDigitReq, setMobileDigitReq] = useState(false);
  const [isDisabledLoginBtn, setIsDisabledLoginBtn] = useState(true);

  // OTP state
  const [otpMobile, setOtpMobile] = useState('');
  const [otpEmail, setOtpEmail] = useState('');
  const [isWrongOTP, setIsWrongOTP] = useState(false);
  const [isRightOTP, setIsRightOTP] = useState(false);
  const [isMobileVerifyBtn, setIsMobileVerifyBtn] = useState(true);
  const [isEmailDisableBtn, setIsEmailDisableBtn] = useState(true);

  // Timer state
  const [timeLeft, setTimeLeft] = useState(30);
  const [timeroff, setTimeroff] = useState(true);
  const [displayMobile, setDisplayMobile] = useState(30);

  // Email state
  const [googleHideBtn, setGoogleHideBtn] = useState(false);
  const [googlebtn, setGooglebtn] = useState(false);
  const [emailFormatVal, setEmailFormatVal] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const clientid = typeof window !== 'undefined' ? sessionStorage.getItem('clientid') ?? '' : '';

  useEffect(() => {
    document.title =
      'Open Demat Account - Free Demat & Trading Account Opening Online | SBI Securities';

    // Pre-fill from session
    const savedMobile = sessionStorage.getItem('mobile');
    const savedName = sessionStorage.getItem('NameSubmitted');
    if (savedMobile || savedName) {
      setSendOtp((prev) => ({
        ...prev,
        mobile: savedMobile ?? '',
        fullname: savedName ?? '',
      }));
    }

    // UTM source check — hide Google button if non-organic
    const utmSource = searchParams?.get('utm_source');
    if (!utmSource || ['search-engine', 'search_engine', 'NA', ''].includes(utmSource)) {
      setGoogleHideBtn(false);
    } else {
      setGoogleHideBtn(true);
    }

    // Handle status query params
    const status = searchParams?.get('status');
    if (status === 'exhausted') {
      toast.warning(
        'Your Mobile OTP request limit is exhausted, please retry to log in after 15 minutes',
        { position: 'bottom-center', autoClose: 5000 }
      );
    } else if (status === 'internal_server_error') {
      toast.error('Internal Server Error', { position: 'bottom-center', autoClose: 2000 });
    }

    // Handle Google OAuth callback params
    const emailVerified = searchParams?.get('email_verified');
    const emailParam = searchParams?.get('email');
    const emailError = searchParams?.get('Error');

    if (emailParam && emailVerified === 'true') {
      moengagesdkService.MoeInit();
      getEmailOtpVerify(false);
    } else if (emailError) {
      moengagesdkService.MoeInit();
      toast.error('Google Authentication Failed, Please Try Again...', {
        position: 'bottom-center',
        autoClose: 5000,
      });
    }
  }, []);

  // ===== Validation =====
  const checkInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    const hasSpecial = /[^a-zA-Z\s]/.test(val);
    const hasDigit = /\d/.test(val);
    setPanFullNameReqSpecial(hasSpecial && !hasDigit);
    setPanFullNameReqDigit(hasDigit);
    setMoreThanTwoValues(val.trim().length > 0 && val.trim().length < 3);
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const char = e.key;
    if (!/^[a-zA-Z\s]$/.test(char)) {
      e.preventDefault();
    }
  };

  const updateDisplayedName = (name: string) => {
    setSendOtp((prev) => ({ ...prev, fullname: name }));
    validateForm(name, sendOtp.mobile);
  };

  const updateDisplayedName2 = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value.trim();
    setPanFullNameReqSpace(val.length === 0 || val.split(' ').length < 2);
  };

  const mobileNoValidation = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 10);
    setSendOtp((prev) => ({ ...prev, mobile: val }));
    setMobileDigitReq(val.length > 0 && (val.length !== 10 || !/^[6-9]/.test(val)));
    validateForm(sendOtp.fullname, val);
  };

  const mobileNoValidation2 = (e: React.FocusEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setMobileDigitReq(val.length > 0 && (val.length !== 10 || !/^[6-9]/.test(val)));
  };

  const validateForm = (name: string, mobile: string) => {
    const nameValid = name.trim().length >= 3 && !/[^a-zA-Z\s]/.test(name);
    const mobileValid = mobile.length === 10 && /^[6-9]/.test(mobile);
    setIsDisabledLoginBtn(!(nameValid && mobileValid));
  };

  // ===== Mobile OTP =====
  const startTimer = () => {
    setTimeroff(true);
    setTimeLeft(30);
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

  const getMobileOtp = async (isResend: boolean) => {
    showSpinner();
    try {
      const payload = {
        mobile: sendOtp.mobile,
        fullname: sendOtp.fullname,
        utm_source: searchParams?.get('utm_source') || 'NA',
        utm_medium: searchParams?.get('utm_medium') || 'NA',
        utm_campaign: searchParams?.get('utm_campaign') || 'NA',
        isResend,
      };
      const response = await apiService.postRequest('SendMobileOTP', payload, hideSpinner);
      if (response) {
        sessionStorage.setItem('mobile', sendOtp.mobile);
        sessionStorage.setItem('NameSubmitted', sendOtp.fullname);
        sessionStorage.setItem('clientid', response.clientid ?? '');
        startTimer();
        // Open mobile OTP modal
        const modal = document.getElementById('mobileOTPModal');
        if (modal) {
          const bsModal = (window as any).bootstrap?.Modal?.getOrCreateInstance(modal);
          bsModal?.show();
        } else {
          router.push('/mobile-home-otp');
        }
      }
    } catch {
      hideSpinner();
    }
  };

  const getMobileOtpVerify = async (isResend: boolean) => {
    showSpinner();
    try {
      const payload = {
        mobile: sendOtp.mobile,
        otp: otpMobile,
        clientid,
      };
      const response = await apiService.postRequest('VerifyMobileOTP', payload, hideSpinner);
      if (response) {
        setIsRightOTP(true);
        setIsWrongOTP(false);
        sessionStorage.setItem('token', response.token ?? '');
        // Navigate to next step
        const routes: string[] = response.routes ?? [];
        sessionStorage.setItem('allowedRoutes', JSON.stringify(routes));
        router.push(routes[0] ?? '/email');
      } else {
        setIsWrongOTP(true);
        setIsRightOTP(false);
      }
    } catch {
      hideSpinner();
    }
  };

  const getEmailOtpVerify = async (isResend: boolean) => {
    showSpinner();
    try {
      const emailParam = searchParams?.get('email') ?? '';
      const payload = {
        email: emailParam || sendOtp.email,
        clientid,
      };
      const response = await apiService.postRequest('VerifyEmailOTP', payload, hideSpinner);
      if (response) {
        sessionStorage.setItem('token', response.token ?? '');
        const routes: string[] = response.routes ?? [];
        sessionStorage.setItem('allowedRoutes', JSON.stringify(routes));
        router.push(routes[0] ?? '/uploadProcess/1');
      }
    } catch {
      hideSpinner();
    }
  };

  // ===== Testimonial Template =====
  const testimonialTemplate = (item: (typeof TESTIMONIALS)[0]) => (
    <div className={styles.cardCss}>
      <p>{item.message}</p>
      <span>-{item.author}</span>
    </div>
  );

  const videoTemplate = (item: (typeof VIDEOS)[0]) => (
    <div className={styles.carouselCls}>
      <div className={styles.item}>
        <iframe
          width="560"
          height="245"
          src={item.url}
          title="YouTube video player"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
        <h6>{item.caption}</h6>
      </div>
    </div>
  );

  return (
    <>
      {/* Banner Section */}
      <section aria-label="Open Demat and Trading Account" className={`${styles.banner} banner`}>
        <div className="container">
          <div className={`row ${styles.bannerImg}`}>
            <div className="col-md-6 col-lg-6 col-12 px-0 px-xxl-2 px-lg-2 px-md-2 px-sm-0">
              <div className={styles.bannerTxt}>
                <div className={styles.desktopBanner}>
                  <Image
                    draggable={false}
                    src="/assets/images/diy/Website-Banner-DIY2-Foreground.webp"
                    alt="Open Demat Account"
                    width={600}
                    height={400}
                    loading="lazy"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
                <div className={styles.mobileBanner}>
                  <Image
                    draggable={false}
                    src="/assets/images/diy/Website-Banner-DIY2-Mobile-Foreground.webp"
                    alt="Open Demat Account"
                    width={400}
                    height={300}
                    loading="lazy"
                    style={{ width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-6 col-12">
              <div className={styles.mobileForm}>
                <form aria-label="Open Demat Account Registration Form">
                  <h1>Open Your Demat &amp; Trading Account Now</h1>

                  {/* Full Name Input */}
                  <div>
                    <input
                      type="text"
                      className="form-control otp_field"
                      id="EnterFullNameCard"
                      aria-label="Full Name as per PAN"
                      aria-required="true"
                      name="fullname_as_pancard"
                      placeholder="Full Name as per PAN"
                      value={sendOtp.fullname}
                      onChange={(e) => {
                        updateDisplayedName(e.target.value);
                        checkInput(e);
                      }}
                      onKeyPress={onKeyPress}
                      onBlur={updateDisplayedName2}
                      onPaste={(e) => e.preventDefault()}
                      maxLength={100}
                      autoComplete="name"
                    />
                    {moreThanTwoValues && (
                      <span className="red_warning">More than 2 characters are allowed</span>
                    )}
                    {panFullNameReqSpecial && (
                      <span className="red_warning">Special characters are not allowed</span>
                    )}
                    {panFullNameReqDigit && (
                      <span className="red_warning">Digits are not allowed</span>
                    )}
                    {panFullNameReqSpace && (
                      <span className="red_warning">*Please enter your name as per your PAN</span>
                    )}
                  </div>

                  {/* Mobile Input */}
                  <div>
                    <input
                      type="text"
                      className="form-control otp_field"
                      id="mobile-number"
                      aria-label="Mobile Number"
                      aria-required="true"
                      name="MobileNo"
                      placeholder="Mobile Number"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      value={sendOtp.mobile}
                      onChange={mobileNoValidation}
                      onBlur={mobileNoValidation2}
                    />
                    {mobileDigitReq && (
                      <span className="red_warning">
                        *Please enter your valid 10 digit mobile number.
                      </span>
                    )}
                  </div>

                  <div className={styles.btnAlign}>
                    <button
                      type="button"
                      className="btn btn_cls"
                      disabled={isDisabledLoginBtn}
                      aria-disabled={isDisabledLoginBtn}
                      onClick={() => getMobileOtp(false)}
                    >
                      Get Started
                    </button>
                    <div className="terms_css">
                      By clicking on &apos;Get Started&apos;, I agree to the{' '}
                      <a
                        href="https://www.sbisecurities.in/fileserver/regulation/terms-and-conditions.html"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Terms &amp; Condition
                      </a>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Open Demat Section */}
      <section
        aria-label="Why Open Demat Account With SBI Securities"
        className={styles.whyOpenDemat}
      >
        <div className="container">
          <div className="row">
            <div className={styles.align}>
              <h2 className="page-heading">Why Open Demat Account With SBI Securities?</h2>
              <div className={styles.cardAlign}>
                {[
                  { src: '/assets/images/diy/trusticon-1.avif', alt: 'SBI Legacy & Trust', label: "SBI's Legacy & Trust" },
                  { src: '/assets/images/diy/communityicon-1.avif', alt: 'SBI Investors Community', label: 'Community of 6+ million investors' },
                  { src: '/assets/images/diy/productsicon-1.avif', alt: 'SBI Securities Trading App', label: 'Invest in multiple products with a single app' },
                  { src: '/assets/images/diy/networkicon-1.avif', alt: 'Wide Network of SBI Securities Branches', label: 'Wide Network of 160+ Branches across India' },
                  { src: '/assets/images/diy/researchstocksicon-1.avif', alt: 'Well Researched Investment Recommendations', label: 'Research recommended stocks' },
                ].map((card) => (
                  <div key={card.label} className={styles.cardCls}>
                    <div>
                      <Image src={card.src} alt={card.alt} width={60} height={60} draggable={false} />
                    </div>
                    <div>
                      <p>{card.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Easy Demat Process Section */}
      <section
        aria-label="Easy Demat Account Opening Process"
        className={styles.ezdemat}
      >
        <div className="container">
          <div className="row">
            <div className={styles.align}>
              <h2>Easy Demat Account Opening Process</h2>
              <div className={styles.cardAlign}>
                {[
                  { src: '/assets/images/diy/add-user.png', alt: 'Sign Up For SBI Demat Account', label: 'Sign Up' },
                  { src: '/assets/images/diy/verify-bank.png', alt: 'Verify Your Bank Account', label: 'Verify Bank A/C' },
                  { src: '/assets/images/diy/select-plan.png', alt: 'Select Brokerage Plan', label: 'Select Plan' },
                  { src: '/assets/images/diy/upload-doc.png', alt: 'Upload Documents for Demat Account', label: 'Upload Documents' },
                  { src: '/assets/images/diy/esign.png', alt: 'E-sign for your Demat Account', label: 'E-Sign' },
                ].reduce<React.ReactNode[]>((acc, card, idx, arr) => {
                  acc.push(
                    <div key={card.label} className={styles.cardCls}>
                      <Image src={card.src} alt={card.alt} width={60} height={60} draggable={false} />
                      <p>{card.label}</p>
                    </div>
                  );
                  if (idx < arr.length - 1) {
                    acc.push(
                      <div key={`arrow-${idx}`} className={styles.cardClsArrow}>
                        <Image src="/assets/images/diy/Line.png" alt="" width={30} height={10} aria-hidden draggable={false} />
                      </div>
                    );
                  }
                  return acc;
                }, [])}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Documents Required Section */}
      <section
        aria-label="Documents Required for Demat Account"
        className={styles.whyOpenDemat}
      >
        <div className="container">
          <div className="row">
            <div className={styles.align}>
              <h2 className="page-heading">
                Documents Required for Opening Demat Account with SBI Securities
              </h2>
              <div className={styles.cardAlign}>
                {[
                  { src: '/assets/images/diy/pancardicon.png', alt: 'Identity Proof', subheading: 'Identity Proof', label: 'PAN Card' },
                  { src: '/assets/images/diy/addressprooficon-1.png', alt: 'Address Proof', subheading: 'Address Proof', label: 'Aadhar Card' },
                  { src: '/assets/images/diy/nominee-icon.png', alt: 'Add Nominee', subheading: 'Nominee Addition', label: "Nominee's Proof of Identity" },
                  { src: '/assets/images/diy/signatureicon-1.png', alt: 'Add Your Signature', subheading: 'Signature', label: 'Sign on a White paper' },
                  { src: '/assets/images/diy/cancelled-cheque.png', alt: 'Cancelled Cheque', subheading: 'Cancelled cheque', label: 'Only if bank verification fails' },
                ].map((card) => (
                  <div key={card.subheading} className={styles.cardCls}>
                    <div>
                      <Image src={card.src} alt={card.alt} width={60} height={60} draggable={false} />
                    </div>
                    <div>
                      <h6 className={styles.cardSubheading}>{card.subheading}</h6>
                      <p>{card.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Videos Section */}
      <section aria-label="Educational Videos" className={styles.benefitsSection}>
        <div className="container">
          <div className={styles.trustCss}>
            <h2 className="page-heading">Videos</h2>
            <Carousel
              value={VIDEOS}
              numVisible={2}
              numScroll={1}
              circular={false}
              autoplayInterval={0}
              responsiveOptions={RESPONSIVE_VIDEO_OPTIONS}
              itemTemplate={videoTemplate}
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section aria-label="Customer Testimonials" className={styles.trustSection}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2 className="page-heading">Trust Aur Growth, Dono</h2>
              <h6>India&apos;s trusted investment partner of choice</h6>
            </div>
            <div className="col-lg-12">
              <Carousel
                value={TESTIMONIALS}
                numVisible={2}
                numScroll={1}
                circular={false}
                autoplayInterval={0}
                responsiveOptions={RESPONSIVE_OPTIONS}
                itemTemplate={testimonialTemplate}
              />
            </div>
          </div>
        </div>
      </section>

      {/* What is Demat Section */}
      <section aria-label="What is a Demat Account" className={styles.dematSection}>
        <div className="container">
          <div className="row">
            <div className="col-lg-12">
              <h2 className="page-heading">What is Demat Account?</h2>
            </div>
            <div>
              <br />
            </div>
            <div>
              <p>
                A Demat account, short for &quot;Dematerialized account,&quot; is like a digital
                vault for your stocks and securities. It holds them in electronic form instead of
                physical certificates. It makes buying, selling, and transferring shares easier in
                the stock market, eliminating the need for paperwork.
              </p>
              <p>
                Dematerialisation is the process by which physical certificates are converted into
                electronic balances. That way, you do not have to hold physical certificates of
                shares or bonds, but instead hold them just as a credit entry in your demat account
                opened with NSDL or with CDSL.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section aria-label="Frequently Asked Questions" className={styles.faqSection}>
        <div className="container">
          <div className="col-md-12">
            <h2 className="text-center pb-5 page-heading">FAQs</h2>
            <div className="row justify-content-center">
              <div className="col-lg-11">
                <div className="accordion" id="accordionExample">
                  {[
                    {
                      id: 'Three',
                      question: 'How does a Demat account work?',
                      answer:
                        'Imagine your Demat account as a secure digital locker for your investments, like stocks and bonds. Instead of physical certificates, these investments are stored electronically. When you buy or sell stocks, it is like moving them in or out of this digital locker.',
                    },
                    {
                      id: 'Four',
                      question: 'What are the benefits of a Demat account?',
                      answer:
                        'A Demat account offers multiple benefits including safe storage of securities, easy transfer of shares, elimination of risks associated with physical certificates, quick settlement of trades, and the ability to access your portfolio from anywhere at any time.',
                    },
                    {
                      id: 'Five',
                      question: 'Is there any fee for opening a Demat account with SBI Securities?',
                      answer:
                        'SBI Securities offers a free Demat account opening with Zero AMC for the first year. Flat brokerage of ₹20/order* and ₹0 brokerage till ₹75 lakh trades.',
                    },
                  ].map((faq) => (
                    <div
                      key={faq.id}
                      className="accordion-item"
                      itemScope
                      itemProp="mainEntity"
                      itemType="https://schema.org/Question"
                    >
                      <h3 className="accordion-header" id={`heading${faq.id}`}>
                        <button
                          className="accordion-button collapsed"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target={`#collapse${faq.id}`}
                          aria-expanded="false"
                          aria-controls={`collapse${faq.id}`}
                          itemProp="name"
                        >
                          {faq.question}
                        </button>
                      </h3>
                      <div
                        id={`collapse${faq.id}`}
                        className="accordion-collapse collapse"
                        aria-labelledby={`heading${faq.id}`}
                        data-bs-parent="#accordionExample"
                        itemScope
                        itemProp="acceptedAnswer"
                        itemType="https://schema.org/Answer"
                      >
                        <p className="accordion-body" itemProp="text">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
