'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
// OccupDetails — step 4: Occupation Details
// Equivalent to Angular OccupDetailsComponent

const BackArrowIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M5 12H19" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12L11 18" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12L11 6" stroke="#222" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default function OccupDetails() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [occupationResponse, setOccupationResponse] = useState<any[]>([]);
  const [selectedOccupation, setSelectedOccupation] = useState('');
  const [guid, setGuid] = useState('');

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    getPersonalDetails();
    getOccupationData();
  }, []);

  const getOccupationData = async () => {
    showSpinner();
    const reqData = {
      flag: 'OCCUPATION',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqData, hideSpinner);
      if (response?.status === true && response?.message === 'Data found' && response?.data?.length) {
        setSelectedOccupation(response.data[0].OccupationDetail || '');
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
          setOccupationResponse(response.data.data7 || []);
        }
      }
    } catch { hideSpinner(); }
  };

  const PersonalDetailsave = async (flag: string, declaration: string) => {
    showSpinner();
    const reqData = {
      Flag: flag,
      Occupation: declaration,
      FormNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      utm_source: 'search-engine',
      utm_medium: 'organic',
      utm_campaign: 'Onboarding-DIY',
      Guid: guid,
      Stage: '4',
    };
    try {
      const response = await apiService.postRequest('api/v1/personalDetail/save', reqData, hideSpinner);
      if (response?.status === true) {
        setSelectedOccupation(declaration);
        if (rejectStatus !== 'R') {
          setTimeout(() => { router.push('/personalDetailsForm/5'); hideSpinner(); }, 200);
        } else {
          navigationService.navigateToNextStep();
        }
      } else {
        toast.error(response?.message || 'Error', { position: 'bottom-center', autoClose: 4000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  const BackToThree = () => {
    showSpinner();
    setTimeout(() => { router.push('/personalDetailsForm/3'); hideSpinner(); }, 200);
  };

  return (
    <section aria-label="Occupation Details Selection" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">

            {/* Mobile: back button + title on gray background */}
            <div className="mobile_css">
              <div className="back_cls">
                {rejectStatus !== 'R' && (
                  <button type="button" className="figma-card-back" onClick={BackToThree} aria-label="Go back">
                    <BackArrowIcon />
                  </button>
                )}
                {rejectStatus === 'R' && <div className="back_cls2" />}
                <div>
                  <h5>Occupation Details</h5>
                  <p className="sub_title">Select any one from the below</p>
                </div>
              </div>
            </div>

            <div className="figma-card">
              {/* Desktop: header inside card */}
              <div className="figma-card-header desktop_css">
                <div className="figma-card-title-row">
                  {rejectStatus !== 'R' && (
                    <button type="button" className="figma-card-back" onClick={BackToThree} aria-label="Go back">
                      <BackArrowIcon />
                    </button>
                  )}
                  <div className="figma-card-title-text">
                    <h5>Occupation Details</h5>
                    <p>Select any one from the below</p>
                  </div>
                </div>
              </div>

              <div className="figma-card-body">
                <div className="figma-option-grid" role="group" aria-label="Occupation options">
                  {occupationResponse.map((item: any, i: number) => (
                    <button
                      key={i}
                      type="button"
                      className={`figma-option-btn${selectedOccupation === item.ocupationType ? ' selected' : ''}`}
                      onClick={() => PersonalDetailsave('occupation', item.ocupationType)}
                      aria-pressed={selectedOccupation === item.ocupationType}
                    >
                      {item.ocupationType}
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
