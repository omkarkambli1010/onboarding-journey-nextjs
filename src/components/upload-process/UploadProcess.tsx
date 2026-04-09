'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'react-toastify';
import { useSpinner } from '@/components/spinner/Spinner';
import apiService from '@/services/api.service';
import styles from './upload-process.module.scss';

export default function UploadProcess() {
  const router = useRouter();
  const params = useParams();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [pan, setPan] = useState('');
  const [name, setName] = useState('');
  const [dob, setDob] = useState('');
  const [panError, setPanError] = useState('');
  const [nameError, setNameError] = useState('');
  const [dobError, setDobError] = useState('');
  const [formNumber, setFormNumber] = useState('');

  useEffect(() => {
    document.title = 'PAN Details | SBI Securities';
    const fn = params?.formNumber as string ?? sessionStorage.getItem('FormNumber') ?? '';
    setFormNumber(fn);
    if (fn) loadExistingData(fn);
  }, [params]);

  const loadExistingData = async (fn: string) => {
    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/masters/get', {
        flag: 'GetPanDetails',
        FormNumber: fn,
      }, hideSpinner);

      if (response?.status === true && response?.data) {
        const data = response.data;
        setPan(data.PAN ?? '');
        setName(data.Name ?? '');
        setDob(data.DOB ?? '');
      }
    } catch {
      // silent fail, user can fill manually
    } finally {
      hideSpinner();
    }
  };

  const validate = () => {
    let valid = true;
    if (!pan) { setPanError('PAN is required'); valid = false; }
    else if (!/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) { setPanError('Invalid PAN format'); valid = false; }
    else setPanError('');

    if (!name.trim()) { setNameError('Name is required'); valid = false; }
    else setNameError('');

    if (!dob) { setDobError('Date of Birth is required'); valid = false; }
    else setDobError('');

    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/pan/upload/manual', {
        PAN: pan,
        Name: name,
        DOB: dob,
        FormNumber: formNumber,
        flag: 'ManualPanEntry',
      }, hideSpinner);

      if (response?.status === true) {
        const nextRoute = response.data?.NextRoute ?? '/uploadPan';
        router.push(nextRoute);
      } else {
        toast.error(response?.message ?? 'Failed to save PAN details. Please try again.', {
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
    <section aria-label="PAN Details Entry" className={`pan_details_form ${styles.uploadProcessPage}`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                <h5>PAN Details</h5>
              </div>
            </div>
            <div className="col-lg-12 col-md-12 col-12 desktop_css">
              <h5>PAN Details</h5>
              <p>Enter your PAN card details manually</p>
            </div>
            <hr className="desktop_css" />

            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.formGroup}>
                <label htmlFor="panInput" className={styles.label}>
                  PAN Number <span className={styles.required}>*</span>
                </label>
                <input
                  id="panInput"
                  type="text"
                  maxLength={10}
                  value={pan}
                  onChange={(e) => {
                    setPan(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                    setPanError('');
                  }}
                  placeholder="e.g., ABCDE1234F"
                  className={`${styles.input} ${panError ? styles.inputError : ''}`}
                />
                {panError && <p className={styles.errorText}>{panError}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="nameInput" className={styles.label}>
                  Name as on PAN <span className={styles.required}>*</span>
                </label>
                <input
                  id="nameInput"
                  type="text"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setNameError('');
                  }}
                  placeholder="Enter name as on PAN card"
                  className={`${styles.input} ${nameError ? styles.inputError : ''}`}
                />
                {nameError && <p className={styles.errorText}>{nameError}</p>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="dobInput" className={styles.label}>
                  Date of Birth <span className={styles.required}>*</span>
                </label>
                <input
                  id="dobInput"
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
                  Save &amp; Proceed
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
