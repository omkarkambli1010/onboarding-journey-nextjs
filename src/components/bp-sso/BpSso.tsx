'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSpinner } from '@/components/spinner/Spinner';
import apiService from '@/services/api.service';
import styles from './bp-sso.module.scss';

export default function BpSso() {
  const router = useRouter();
  const params = useParams();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [pan, setPan] = useState('');
  const [dob, setDob] = useState('');
  const [panError, setPanError] = useState('');
  const [dobError, setDobError] = useState('');
  const [formNumber, setFormNumber] = useState('');

  useEffect(() => {
    document.title = 'Branch Partner SSO | SBI Securities';
    const fn = params?.formNumber as string;
    setFormNumber(fn ?? '');
  }, [params]);

  const validatePan = (value: string) => {
    if (!value) return 'PAN is required';
    if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(value.toUpperCase())) return 'Enter a valid PAN (e.g., ABCDE1234F)';
    return '';
  };

  const validateDob = (value: string) => {
    if (!value) return 'Date of Birth is required';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const panErr = validatePan(pan);
    const dobErr = validateDob(dob);
    setPanError(panErr);
    setDobError(dobErr);
    if (panErr || dobErr) return;

    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/bp/sso/verify', {
        PAN: pan.toUpperCase(),
        DOB: dob,
        FormNumber: formNumber,
        flag: 'BPSSOVerify',
      }, hideSpinner);

      if (response?.status === true) {
        const data = response.data;
        sessionStorage.setItem('FormNumber', data?.FormNumber ?? formNumber);
        sessionStorage.setItem('clientid', data?.ClientId ?? '');
        sessionStorage.setItem('token', data?.Token ?? '');
        router.push(data?.NextRoute ?? '/home');
      } else {
        toast.error(response?.message ?? 'Verification failed. Please try again.', {
          position: 'bottom-center',
          autoClose: 3500,
        });
      }
    } catch {
      // error handled by apiService
    } finally {
      hideSpinner();
    }
  };

  return (
    <section aria-label="Branch Partner SSO" className={`pan_details_form ${styles.bpSsoPage}`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                <h5>Branch Partner Verification</h5>
              </div>
            </div>
            <div className="col-lg-12 col-md-12 col-12 desktop_css">
              <h5>Branch Partner Verification</h5>
              <p>Please verify your identity to proceed</p>
            </div>
            <hr className="desktop_css" />

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formGroup}>
                <label htmlFor="bpPan" className={styles.label}>
                  PAN Number <span className={styles.required}>*</span>
                </label>
                <input
                  id="bpPan"
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => {
                    setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    setPanError('');
                  }}
                  placeholder="Enter PAN (e.g., ABCDE1234F)"
                  className={`${styles.input} ${panError ? styles.inputError : ''}`}
                />
                {panError && <p className={styles.errorText}>{panError}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="bpDob" className={styles.label}>
                  Date of Birth <span className={styles.required}>*</span>
                </label>
                <input
                  id="bpDob"
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                    setDobError('');
                  }}
                  className={`${styles.input} ${dobError ? styles.inputError : ''}`}
                />
                {dobError && <p className={styles.errorText}>{dobError}</p>}
              </div>

              <div className={styles.proceedBtn}>
                <button type="submit" className="btn btn_cls">
                  Verify &amp; Proceed
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
