'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'react-toastify';
import { useSpinner } from '@/components/spinner/Spinner';
import apiService from '@/services/api.service';
import styles from './esign.module.scss';

export default function Esign() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [esignUrl, setEsignUrl] = useState('');
  const [showIframe, setShowIframe] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [formNumber, setFormNumber] = useState('');

  useEffect(() => {
    document.title = 'E-Sign | SBI Securities';
    const fn = sessionStorage.getItem('FormNumber') ?? '';
    setFormNumber(fn);
    getEsignData(fn);
  }, []);

  const getEsignData = async (fn: string) => {
    if (!fn) {
      setErrorMsg('Form number not found. Please restart the process.');
      return;
    }
    showSpinner();
    try {
      const response = await apiService.postRequestEsign('', {
        FormNumber: fn,
        flag: 'GetEsignPDF',
      }, hideSpinner);

      if (response?.status === true && response?.data?.EsignURL) {
        setEsignUrl(response.data.EsignURL);
        setShowIframe(true);
      } else {
        setErrorMsg(response?.message ?? 'Unable to load e-sign document. Please try again.');
      }
    } catch {
      setErrorMsg('An error occurred while loading the e-sign document.');
    } finally {
      hideSpinner();
    }
  };

  const redirectDigiLocker = () => {
    showSpinner();
    router.push('/digilocker-screen');
  };

  const handleIframeMessage = (event: MessageEvent) => {
    if (event.data?.status === 'success') {
      router.push('/thankyou');
    } else if (event.data?.status === 'failure') {
      setErrorMsg('E-sign failed. Please try again.');
      setShowIframe(false);
    }
  };

  useEffect(() => {
    window.addEventListener('message', handleIframeMessage);
    return () => window.removeEventListener('message', handleIframeMessage);
  }, []);

  return (
    <section aria-label="E-Sign Document" className={`pan_details_form ${styles.esignPage}`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            {/* Mobile header */}
            <div className="mobile_css">
              <div className="back_cls">
                <h5>E-Sign</h5>
              </div>
            </div>

            {/* Desktop header */}
            <div className="col-lg-12 col-md-12 col-12 desktop_css">
              <div className="d-flex flex-column align-items-start gap-2">
                <h5>E-Sign</h5>
                <p>Please sign your application digitally</p>
              </div>
            </div>

            <hr className="desktop_css" />

            {/* Error state */}
            {errorMsg && (
              <div className={styles.errorState}>
                <Image
                  src="/assets/images/diy/invalid_icon.png"
                  alt="Error"
                  width={80}
                  height={80}
                />
                <p className="mt-3">{errorMsg}</p>
                <button
                  type="button"
                  className="btn btn_cls mt-3"
                  onClick={() => getEsignData(formNumber)}
                >
                  Retry
                </button>
              </div>
            )}

            {/* E-sign iframe */}
            {showIframe && esignUrl && (
              <div className={styles.iframeContainer}>
                <iframe
                  src={esignUrl}
                  title="E-Sign Document"
                  className={styles.esignFrame}
                  allow="camera; microphone"
                />
              </div>
            )}

            {/* DigiLocker option */}
            {!showIframe && !errorMsg && (
              <div className={styles.loadingState}>
                <p>Loading e-sign document...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
