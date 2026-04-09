'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import navigationService from '@/services/navigation.service';
import styles from './link-bank-account.module.scss';

// LinkBankAccount — step 6: Choose Bank Account Verification Method
// Equivalent to Angular LinkBankAccountComponent

export default function LinkBankAccount() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;
  const utmSource = typeof window !== 'undefined' ? sessionStorage.getItem('UTMSOURCE') || 'NA' : 'NA';

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
  }, []);

  const detectIOS = (): boolean => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isMac = /Macintosh/.test(userAgent) && /AppleWebKit/.test(userAgent) && !/iPad|iPhone|iPod/.test(userAgent);
    return isIOS || isMac;
  };

  const enterManually = () => {
    showSpinner();
    setTimeout(() => { router.push('/PennyDrop/1'); hideSpinner(); }, 200);
  };

  const enterPaymentGateway = () => {
    showSpinner();
    setTimeout(() => { router.push('/reversePennyDrop/1'); hideSpinner(); }, 200);
  };

  const BackToFive = () => {
    showSpinner();
    setTimeout(() => { router.push('/personalDetailsForm/5'); hideSpinner(); }, 200);
  };

  const faqHelpBtn = (stageName: string) => {
    const encodedStageName = btoa(stageName);
    window.location.href = `faq?stageName=${encodeURIComponent(encodedStageName)}`;
  };

  return (
    <section aria-label="Link Bank Account" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                {rejectStatus !== 'R' && (
                  <div role="button" tabIndex={0} onClick={BackToFive} onKeyDown={(e) => { if (e.key === 'Enter') BackToFive(); }} style={{ cursor: 'pointer' }}>
                    <img src="/assets/images/diy/ChevronLeft.png" alt="" aria-hidden="true" /> Back
                  </div>
                )}
                {rejectStatus === 'R' && <div className="back_cls2"></div>}
                <div className="mobile_header_padding">
                  <div className="help_faq_css">
                    <div className="d-flex gap-2">
                      <div className="d-flex flex-column gap-2">
                        <h5>Link your Bank Account</h5>
                      </div>
                    </div>
                    <div>
                      <div className="help_btn" onClick={() => faqHelpBtn('Bankaccount')} style={{ cursor: 'pointer' }}>
                        Need Help?
                      </div>
                    </div>
                  </div>
                  {utmSource !== 'PROPRIETOR' ? (
                    <p className="sub_title">Add Savings Account to transfer funds securely for trading and investing purpose.</p>
                  ) : (
                    <p className="sub_title">Add Current Account to transfer funds securely for trading and investing purpose.</p>
                  )}
                </div>
              </div>
            </div>

            <form aria-label="Link Bank Account Form" method="post">
              <div className="div">
                <div className="col-lg-12 col-md-12 col-12 desktop_css">
                  <div className="mobile_header_padding">
                    <div className="help_faq_css">
                      <div className="d-flex gap-2">
                        {rejectStatus !== 'R' && (
                          <div onClick={BackToFive} style={{ cursor: 'pointer' }}>
                            <span>
                              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_lba)">
                                  <path d="M5 12.5H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 6.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs><clipPath id="clip0_lba"><rect width="24" height="24" fill="white" transform="translate(0 0.5)" /></clipPath></defs>
                              </svg>
                            </span>
                          </div>
                        )}
                        <div className="heading">
                          <h5>Link your bank account</h5>
                          {utmSource !== 'PROPRIETOR' ? (
                            <p className="sub_title">Add Savings Account to transfer funds securely for trading and investing purpose.</p>
                          ) : (
                            <p className="sub_title">Add Current Account to transfer funds securely for trading and investing purpose.</p>
                          )}
                        </div>
                      </div>
                      <div>
                        <div className="help_btn" onClick={() => faqHelpBtn('Bankaccount')} style={{ cursor: 'pointer' }}>Need Help?</div>
                      </div>
                    </div>
                  </div>
                </div>
                <hr className="desktop_css" />
                <div className="div">
                  {utmSource !== 'PROPRIETOR' && (
                    <div className="col-lg-12 col-md-12 col-12">
                      <div className="square-box">
                        <span className="status">Recommended</span>
                        <div className="pan_details_align" onClick={enterPaymentGateway} style={{ cursor: 'pointer' }}>
                          <input id="uploadPanRadio" type="radio" name="radio-button_one" className="radio-button" readOnly />
                          <div className="upload_css">
                            <h5>Verify with UPI</h5>
                            <span>We&apos;ll debit from your account to verify bank details. It will be refunded within 3 working days.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="col-lg-12 col-md-12 col-12 my-3">
                    <div className="square-box">
                      <div role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter') enterManually(); }} className="pan_details_align" onClick={enterManually} style={{ cursor: 'pointer' }}>
                        <input id="uploadPanMan" type="radio" name="radio-button" className="radio-button" readOnly />
                        <div className="upload_css">
                          <h5>Add details manually</h5>
                          <span>Add your Account number, IFSC code</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-12 col-md-12 col-12 my-3">
                    <div className="pan_confirmation">
                      <span>
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 9H12.01M11 12H12V16H13M3 12C3 13.1819 3.23279 14.3522 3.68508 15.4442C4.13738 16.5361 4.80031 17.5282 5.63604 18.364C6.47177 19.1997 7.46392 19.8626 8.55585 20.3149C9.64778 20.7672 10.8181 21 12 21C13.1819 21 14.3522 20.7672 15.4442 20.3149C16.5361 19.8626 17.5282 19.1997 18.364 18.364C19.1997 17.5282 19.8626 16.5361 20.3149 15.4442C20.7672 14.3522 21 13.1819 21 12C21 9.61305 20.0518 7.32387 18.364 5.63604C16.6761 3.94821 14.3869 3 12 3C9.61305 3 7.32387 3.94821 5.63604 5.63604C3.94821 7.32387 3 9.61305 3 12Z" stroke="#222222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </span>
                      <p>Enjoy seamless fund transfer with your SBI account</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="confirm_check_box text-center">
                <label className="form-check-label">
                  Use your bank account details, which matches the name on your PAN CARD
                </label>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
