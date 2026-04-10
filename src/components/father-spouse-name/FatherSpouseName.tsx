'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './father-spouse-name.module.scss';

// FatherSpouseName — step 5: Father/Spouse Name (KYC)
// Equivalent to Angular FatherSpouseNameComponent

const SAMPLE_FATHER_NAME = 'Kevin S Shah';

export default function FatherSpouseName() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [fatherName, setFatherName] = useState(SAMPLE_FATHER_NAME);
  const [isPersonalForm, setIsPersonalForm] = useState(false);
  const [showEmptyWarning, setShowEmptyWarning] = useState(false);
  const [fatherNameSpecial, setFatherNameSpecial] = useState(false);
  const [fatherNameDigit, setFatherNameDigit] = useState(false);
  const [fatherNameSpace, setFatherNameSpace] = useState(false);
  const [guid, setGuid] = useState('');

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    getFatherSpouseData();
  }, []);

  const getFatherSpouseData = async () => {
    showSpinner();
    const reqData = {
      flag: 'ParentsName',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqData, hideSpinner);
      if (response?.status === true && response?.message === 'Data found' && response?.data?.[0]) {
        const name = response.data[0].FatherName || '';
        setFatherName(name);
        updateFatherName(name, 'change');
      }
      hideSpinner();
    } catch { hideSpinner(); }
  };

  const updateFatherName = (value: string, flag: string) => {
    let trimmedValue = value.trim().replace(/\s{2,}/g, ' ');
    const specialCharRegex = /[!@#$%^&*()\-+={}[\]:;"'<>,.?\/|\\]/;
    const hasSpecialChar = specialCharRegex.test(trimmedValue);
    const hasDigit = /\d/.test(trimmedValue);
    const hasMultipleSpaces = /\s{2,}/.test(trimmedValue);

    setFatherNameSpecial(hasSpecialChar);
    setFatherNameDigit(hasDigit);
    setFatherNameSpace(hasMultipleSpaces);

    if (trimmedValue.length > 0 && !hasMultipleSpaces && !hasSpecialChar && !hasDigit) {
      if (flag === 'fout') setFatherName(value.toUpperCase());
      setIsPersonalForm(false);
      setShowEmptyWarning(false);
    } else {
      if (flag === 'fout') setShowEmptyWarning(trimmedValue === '');
      setIsPersonalForm(true);
    }
  };

  const checkInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (/^\s/.test(value)) value = value.trimStart();
    value = value.replace(/\s{2,}/g, ' ');
    value = value.replace(/[^a-zA-Z\s]/g, '');
    setFatherName(value);
    updateFatherName(value, 'change');
  };

  const onKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const regExp = /^[a-zA-Z\s]*$/;
    if (!regExp.test(e.key)) e.preventDefault();
  };

  const PersonalDetailsave = async () => {
    showSpinner();
    const reqData = {
      Flag: 'nameMF',
      FatherName: fatherName,
      MotherName: '',
      FormNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      utm_source: 'search-engine',
      utm_medium: 'organic',
      utm_campaign: 'Onboarding-DIY',
      Guid: guid,
      Stage: '5',
    };
    try {
      const response = await apiService.postRequest('api/v1/personalDetail/save', reqData, hideSpinner);
      if (response?.status === true) {
        const mode = typeof window !== 'undefined' ? sessionStorage.getItem('mode') : '';
        const yonobankstatus = typeof window !== 'undefined' ? sessionStorage.getItem('yonobank') : '';
        const IsYonoClient = typeof window !== 'undefined' ? sessionStorage.getItem('IsYono') : '';

        if (rejectStatus === 'R') {
          hideSpinner();
          navigationService.navigateToNextStep();
        } else if (yonobankstatus === 'UNIQUE' && (IsYonoClient === 'YONO' || IsYonoClient === 'Branch Portal')) {
          setTimeout(() => { router.push('/planprocess/1'); hideSpinner(); }, 200);
        } else {
          if (mode === 'Penny Drop') {
            setTimeout(() => { router.push('/PennyDrop/2'); hideSpinner(); }, 200);
          } else if (mode === 'RevPennyDrop') {
            setTimeout(() => { router.push('/reversePennyDrop/2'); hideSpinner(); }, 200);
          } else {
            setTimeout(() => { router.push('/personalDetailsForm/6'); hideSpinner(); }, 200);
          }
        }
      } else {
        toast.error(response?.message || 'Error', { position: 'bottom-center', autoClose: 4000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  const BackToFour = () => {
    showSpinner();
    setTimeout(() => { router.push('/personalDetailsForm/4'); hideSpinner(); }, 200);
  };

  const hasInputError = showEmptyWarning || fatherNameSpecial || fatherNameDigit || fatherNameSpace;

  return (
    <section aria-label="KYC Details — Father or Spouse Name" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">

            {/* Mobile: back button + title on gray background — matches Declaration (planprocess/1) mobile pattern */}
            <div className="mobile_css">
              <div className="back_cls">
                {rejectStatus !== 'R' && (
                  <button type="button" className="figma-card-back" onClick={BackToFour} aria-label="Go back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 12L11 18" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 12L11 6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                {rejectStatus === 'R' && <div className="back_cls2" />}
                <div>
                  <h5>Details required to finish KYC</h5>
                  <p className="sub_title">It&apos;s a mandatory requirement</p>
                </div>
              </div>
            </div>

            <div className="figma-card">

              {/* Card header — desktop only (mobile uses back_cls above) */}
              <div className="figma-card-header desktop_css">
                <div className="figma-card-title-row">
                  {rejectStatus !== 'R' && (
                    <button
                      type="button"
                      className="figma-card-back"
                      onClick={BackToFour}
                      aria-label="Go back"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M5 12H19" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 12L11 18" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M5 12L11 6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  )}
                  <div className="figma-card-title-text">
                    <h5>Details required to finish KYC</h5>
                    <p>It&apos;s a mandatory requirement</p>
                  </div>
                </div>
              </div>

              {/* Card body — fields only */}
              <form aria-label="Father or Spouse Name Form" method="post">
                <div className={styles.cardBody}>
                  <div className={styles.cardContent}>

                    {/* Field row: label + input */}
                    <div className={styles.fieldRow}>
                      <label htmlFor="Father" className={styles.fieldLabel}>
                        Father/Spouse Name
                      </label>
                      <div className={styles.fieldInputWrapper}>
                        <input
                          type="text"
                          id="Father"
                          className={`${styles.fieldInput}${hasInputError ? ` ${styles.inputError}` : ''}`}
                          aria-label="Enter Father or Spouse Name"
                          aria-required="true"
                          name="Father"
                          placeholder="Enter Father/Spouse Name"
                          value={fatherName}
                          onChange={checkInput}
                          onBlur={() => updateFatherName(fatherName, 'fout')}
                          onPaste={(e) => e.preventDefault()}
                          maxLength={100}
                          onKeyPress={onKeyPress}
                        />
                        {showEmptyWarning && <span className="red_warning">*Please enter Father/Spouse Name</span>}
                        {fatherNameSpecial && <span className="red_warning">*Special character not allowed</span>}
                        {fatherNameDigit && <span className="red_warning">*Digit not allowed</span>}
                        {fatherNameSpace && <span className="red_warning">*Blank space not allowed</span>}
                      </div>
                    </div>

                  </div>

                  {/* Desktop: Proceed button inside card (pinned to bottom via justify-between) */}
                  <div className={`${styles.proceedRow} ${styles.desktopProceed}`}>
                    <button
                      type="button"
                      className={styles.proceedBtn}
                      disabled={isPersonalForm}
                      aria-disabled={isPersonalForm}
                      onClick={PersonalDetailsave}
                    >
                      Proceed
                    </button>
                  </div>
                </div>
              </form>

            </div>

            {/* Mobile: Proceed button outside card, on gray background */}
            <div className={styles.mobileProceedRow}>
              <button
                type="button"
                className={styles.mobileProceedBtn}
                disabled={isPersonalForm}
                aria-disabled={isPersonalForm}
                onClick={PersonalDetailsave}
              >
                Proceed
              </button>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
