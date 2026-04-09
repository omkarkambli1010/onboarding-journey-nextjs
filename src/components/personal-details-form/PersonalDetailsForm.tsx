'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
// PersonalDetailsForm — step 1: Marital Status
// Equivalent to Angular PersonalDetailsFormComponent

export default function PersonalDetailsForm() {
  const router = useRouter();
  const params = useParams();
  const step = params?.step as string;
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [maritalResponse, setMaritalResponse] = useState<any[]>([]);
  const [selectedMarital, setSelectedMarital] = useState('');
  const [guid, setGuid] = useState('');

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    getPersonalDetails();
    getMaritalData();
  }, []);

  const getMaritalData = async () => {
    showSpinner();
    const reqData = {
      flag: 'Maritalstatus',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqData, hideSpinner);
      if (response?.status === true && response?.message === 'Data found' && response?.data?.length) {
        setSelectedMarital(response.data[0].MaritialStauts || '');
      }
    } catch { hideSpinner(); }
  };

  const getPersonalDetails = async () => {
    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/masters/get', { flag: 'all' }, hideSpinner);
      if (response) {
        setGuid(response.request_id || '');
        if (response?.status === true && response?.data) {
          setMaritalResponse(response.data.data13 || []);
        }
      }
    } catch { hideSpinner(); }
  };

  const getDigilockerStatus = async () => {
    showSpinner();
    const reqData = {
      flag: 'IsDigilocker',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqData, hideSpinner);
      if (response?.status === true && response?.message === 'Data found' && response?.data?.length) {
        if (response.data[0].IsDigilocker === 1 || response.data[0].isKraBenefit?.toUpperCase() === 'Y') {
          router.push('/aadhar');
        } else {
          router.push('/uploadProcess/1');
        }
      } else {
        router.push('/aadhar');
      }
      hideSpinner();
    } catch { hideSpinner(); }
  };

  const redirectAadhaar = () => {
    showSpinner();
    setTimeout(() => {
      getDigilockerStatus();
    }, 200);
  };

  const PersonalDetailsave = async (flag: string, declaration: string) => {
    showSpinner();
    const reqData = {
      Flag: flag,
      MaritialStatus: declaration,
      FormNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      utm_source: 'search-engine',
      utm_medium: 'organic',
      utm_campaign: 'Onboarding-DIY',
      Guid: guid,
      Stage: '1',
    };
    try {
      const response = await apiService.postRequest('api/v1/personalDetail/save', reqData, hideSpinner);
      if (response?.status === true) {
        setSelectedMarital(declaration);
        if (rejectStatus !== 'R') {
          setTimeout(() => {
            router.push('/personalDetailsForm/2');
            hideSpinner();
          }, 200);
        } else {
          navigationService.navigateToNextStep();
        }
      } else {
        toast.error(response?.message || 'Error', { position: 'bottom-center', autoClose: 4000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  return (
    <section aria-label="Marital Status Selection" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">

            {/* Mobile: back button + title on gray background */}
            <div className="mobile_css">
              <div className="back_cls">
                {rejectStatus !== 'R' && (
                  <button type="button" className="figma-card-back" onClick={redirectAadhaar} aria-label="Go back">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M5 12H19" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 12L11 18" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M5 12L11 6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                )}
                {rejectStatus === 'R' && <div className="back_cls2" />}
                <div>
                  <h5>Marital Status</h5>
                  <p className="sub_title">Select any one from the below</p>
                </div>
              </div>
            </div>

            <div className="figma-card">
              {/* Desktop: header inside card (hidden on mobile via desktop_css) */}
              <div className="figma-card-header desktop_css">
                <div className="figma-card-title-row">
                  {rejectStatus !== 'R' && (
                    <button
                      type="button"
                      className="figma-card-back"
                      onClick={redirectAadhaar}
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
                    <h5>Marital Status</h5>
                    <p>Select any one from the below</p>
                  </div>
                </div>
              </div>
              <div className="figma-card-body">
                <div className="figma-option-grid" role="group" aria-label="Marital Status options">
                  {maritalResponse.map((item: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      className={`figma-option-btn${selectedMarital === item?.maritalStatus ? ' selected' : ''}`}
                      onClick={() => PersonalDetailsave('maritial', item?.maritalStatus)}
                      aria-pressed={selectedMarital === item?.maritalStatus}
                    >
                      {item?.maritalStatus || 'Unknown'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
