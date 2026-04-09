'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './upload-supporting.module.scss';

// UploadSupporting — Upload supporting financial document for F&O
// Equivalent to Angular UploadSupportingComponent

export default function UploadSupporting() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [imagePreview, setImagePreview] = useState('');
  const [imageBase64, setImageBase64] = useState('');
  const [isProceedDisabled, setIsProceedDisabled] = useState(true);
  const [selectedDocType, setSelectedDocType] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const documents = [
    { id: 'bankStatemntSixMonths', label: 'Bank Statement (last 6 months)' },
    { id: 'copyofITRAcknowledge', label: 'Copy of ITR Acknowledgement' },
    { id: 'copyofFormSixteen', label: 'Copy of Form 16' },
    { id: 'netWorthCertificate', label: 'Networth Certificate' },
    { id: 'copyofDematHoldingAcc', label: 'Copy of Demat Account Holding Statement' },
    { id: 'copyofAnnualAcc', label: 'Copy of Annual Accounts' },
  ];

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const base64 = ev.target?.result as string;
      setImagePreview(base64);
      setImageBase64(base64);
      setIsProceedDisabled(!selectedDocType);
    };
    reader.readAsDataURL(file);
  };

  const upload = async () => {
    if (!selectedDocType) {
      toast.warning('Please select a document type.', { position: 'bottom-center', autoClose: 2000 });
      return;
    }
    if (!imageBase64) {
      toast.warning('Please upload a document.', { position: 'bottom-center', autoClose: 2000 });
      return;
    }
    showSpinner();
    const reqData = {
      formNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      flag: 'docBase64String',
      docType: selectedDocType,
      base64String: imageBase64,
    };
    try {
      const response = await apiService.postRequest('api/v1/uploadDocument/upload', reqData, hideSpinner);
      if (response?.status === true) {
        toast.success('Document uploaded successfully!', { position: 'bottom-center', autoClose: 2000 });
        setTimeout(() => { navigationService.navigateToNextStep(); hideSpinner(); }, 200);
      } else {
        toast.error(response?.message || 'Upload failed', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  return (
    <section aria-label="Upload Supporting Document" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                <div className="d-flex flex-column align-items-start gap-2">
                  <h5>Upload Supporting Document</h5>
                  <p className="sub_title">Upload a financial document to verify your net worth for F&O activation</p>
                </div>
              </div>
            </div>
            <form aria-label="Upload Supporting Document Form" method="post">
              <div>
                <div className="col-lg-12 col-md-12 col-12 desktop_css">
                  <div className="d-flex flex-column align-items-start gap-2">
                    <h5>Upload Supporting Document</h5>
                    <p className="sub_title">Upload a financial document to verify your net worth for F&O activation</p>
                  </div>
                </div>
                <hr className="desktop_css" />
                <div className="my-3">
                  <label className="form-label">Select Document Type</label>
                  {documents.map((doc) => (
                    <div key={doc.id} className="square-box p-2 mb-2" style={{ cursor: 'pointer' }} onClick={() => { setSelectedDocType(doc.id); if (imageBase64) setIsProceedDisabled(false); }}>
                      <div className="pan_details_align">
                        <input type="radio" name="docType" className="radio-button" checked={selectedDocType === doc.id} readOnly />
                        <label className="upload_css" style={{ cursor: 'pointer' }}>{doc.label}</label>
                      </div>
                    </div>
                  ))}
                </div>
                <div
                  className="upload_box"
                  onClick={() => fileInputRef.current?.click()}
                  style={{ cursor: 'pointer', border: '2px dashed #ccc', borderRadius: 8, padding: 24, textAlign: 'center' }}
                >
                  {imagePreview ? (
                    <img src={imagePreview.startsWith('data:image') ? imagePreview : '/assets/images/diy/pdf-icon.png'} alt="Document preview" style={{ maxWidth: '100%', maxHeight: 200 }} />
                  ) : (
                    <p>Click to upload document</p>
                  )}
                  <input ref={fileInputRef} type="file" accept="image/*,application/pdf" style={{ display: 'none' }} onChange={handleFileChange} />
                </div>
              </div>
              <div className="stickybtn_desk desktop_css">
                <button className="btn btn_cls" disabled={isProceedDisabled} onClick={upload}>Proceed</button>
              </div>
            </form>
          </div>
          <div className="stickybtn mobile_css">
            <button className="btn btn_cls" disabled={isProceedDisabled} onClick={upload}>Proceed</button>
          </div>
        </div>
      </div>
    </section>
  );
}
