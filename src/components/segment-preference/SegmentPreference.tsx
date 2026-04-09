'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './segment-preference.module.scss';

// SegmentPreference — plan process step 2: Select trading segments (Equity, F&O etc.)
// Equivalent to Angular SegmentPreferenceComponent

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export default function SegmentPreference() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [segmentPreferenceResponse, setSegmentPreferenceResponse] = useState<any[]>([]);
  const [fetchedPlanName, setFetchedPlanName] = useState('');
  const [fetchedPlanImg, setFetchedPlanImg] = useState('');
  const [riskDisclosureData, setRiskDisclosureData] = useState('');

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    getSegmentPreferenceData();
  }, []);

  const getSegmentPreferenceData = async () => {
    showSpinner();
    // Get selected plan info
    const reqPlan = {
      flag: 'segmentpreference',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const planResp = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqPlan, hideSpinner);
      if (planResp?.status === true && planResp?.data?.[0]) {
        setFetchedPlanName(planResp.data[0].schemeType || '');
        setFetchedPlanImg(planResp.data[0].schemeTypeLogo || '');
      }
    } catch {}

    // Get all masters for segments
    const reqAll = {
      flag: 'all',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const allResp = await apiService.postRequest('api/v1/masters/get', reqAll, hideSpinner);
      if (allResp?.status === true) {
        const segments: any[] = allResp.data?.data6 || [];
        const trdSegmentsStr = typeof window !== 'undefined' ? sessionStorage.getItem('trdSegments') : null;
        if (trdSegmentsStr) {
          const trdSegments = JSON.parse(trdSegmentsStr);
          segments.forEach((seg: any) => {
            if (trdSegments.includes(seg.trdSegment)) seg.selected = true;
            else if (seg.trdSegment === 'Equity & Mutual Fund') seg.selected = true;
            else seg.selected = false;
          });
        } else {
          segments.forEach((seg: any) => {
            if (seg.trdSegment === 'Equity & Mutual Fund') seg.selected = true;
          });
        }
        setSegmentPreferenceResponse([...segments]);

        // Risk disclosure
        const riskModal: any[] = allResp.data?.data17 || [];
        const riskItem = riskModal.find((item: any) => item.Category === 'Risk disclosure');
        if (riskItem) setRiskDisclosureData(riskItem.Discription);
      }
    } catch {}
    hideSpinner();
  };

  const toggleSegment = (index: number, checked: boolean) => {
    const updated = [...segmentPreferenceResponse];
    updated[index].selected = checked;
    setSegmentPreferenceResponse(updated);
  };

  const planPreferenceForm = async () => {
    showSpinner();
    const selectedSegments = segmentPreferenceResponse
      .filter((seg: any) => seg.selected)
      .map((seg: any) => seg.trdSegment);

    if (typeof window !== 'undefined') sessionStorage.setItem('trdSegments', JSON.stringify(selectedSegments));

    const reqData = {
      flag: 'segmentselection',
      FormNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      trdSegments: selectedSegments,
    };
    try {
      const response = await apiService.postRequest('api/v1/schemeSegmentDetail/save', reqData, hideSpinner);
      if (response?.status === true) {
        if (rejectStatus !== 'R') {
          setTimeout(() => { router.push('/CaptureSelfie/1'); hideSpinner(); }, 200);
        } else {
          setTimeout(() => { navigationService.navigateToNextStep(); hideSpinner(); }, 200);
        }
      } else {
        toast.warning(response?.message || 'Error', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  const backToPlanPreference = () => {
    showSpinner();
    setTimeout(() => { router.push('/planprocess/2'); hideSpinner(); }, 200);
  };

  return (
    <>
      {/* Desktop */}
      <div className="desktop_css">
        <section className="pan_details_form" aria-labelledby="seg-pref-heading-desk">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 col-12 m-auto">
                <form method="post" aria-label="Segment Preference">
                  <div>
                    <div className="col-lg-12 col-md-12 col-12 desktop_css">
                      <div className="d-flex align-items-start gap-2">
                        {rejectStatus !== 'R' && (
                          <div onClick={backToPlanPreference} style={{ cursor: 'pointer' }}>
                            <span>
                              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_seg)">
                                  <path d="M5 12.5H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 6.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs><clipPath id="clip0_seg"><rect width="24" height="24" fill="white" transform="translate(0 0.5)" /></clipPath></defs>
                              </svg>
                            </span>
                          </div>
                        )}
                        <div className="d-flex flex-column align-items-start gap-2">
                          <h5 id="seg-pref-heading-desk">Segment Preference</h5>
                          <p className="sub_title">At the time of account opening by default we are providing Equity and Mutual Fund segment, if you wish to active F&O segment few additional documents will be required.</p>
                        </div>
                      </div>
                    </div>
                    <hr className="desktop_css" />
                    <div className="plan_selection_section">
                      <div className="plan_segment">
                        <div className="title">Plan Selected</div>
                        <div className="plan_selected">
                          <div className="plan">
                            {fetchedPlanImg && <img src={`${BASE_URL}${fetchedPlanImg}`} alt={fetchedPlanName} />}
                            <h6>{fetchedPlanName}</h6>
                          </div>
                          <button type="button" className="change_text" onClick={backToPlanPreference}>Change</button>
                        </div>
                      </div>
                    </div>
                    {segmentPreferenceResponse.map((seg: any, i: number) => (
                      <div key={i} className="col-lg-12">
                        <label htmlFor={`seg-${i}`} className="square-box p-3" style={{ cursor: 'pointer' }}>
                          <div className="pan_details_align">
                            <input
                              id={`seg-${i}`}
                              name={`seg-${i}`}
                              className="form-check-input"
                              type="checkbox"
                              checked={!!seg.selected}
                              disabled={seg.trdSegment === 'Equity & Mutual Fund'}
                              aria-disabled={seg.trdSegment === 'Equity & Mutual Fund'}
                              onChange={(e) => toggleSegment(i, e.target.checked)}
                            />
                            <div className="upload_css">
                              <h5>{seg.trdSegment}</h5>
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                    <div className="col-12">
                      <p style={{ fontSize: 14 }}>I hereby agree to active my respective segment subject to proper documentation provided by me.</p>
                    </div>
                  </div>
                  <div className="proceed_btn">
                    <button onClick={planPreferenceForm} className="btn btn_cls">Proceed</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile */}
      <div className="mobile_css">
        <section className="pan_details_form" aria-labelledby="seg-pref-heading-mob">
          <div className="container">
            <div className="row">
              <div className="back_cls">
                {rejectStatus !== 'R' && (
                  <div onClick={backToPlanPreference} style={{ cursor: 'pointer' }}>
                    <img src="/assets/images/diy/ChevronLeft.png" aria-hidden="true" /> Back
                  </div>
                )}
                {rejectStatus === 'R' && <div className="back_cls2"></div>}
                <div className="d-flex flex-column align-items-start gap-2">
                  <h5 id="seg-pref-heading-mob">Segment Preference</h5>
                  <p className="sub_title">At the time of account opening by default we are providing Equity and Mutual Fund segment, if you wish to active F&O segment few additional documents will be required.</p>
                </div>
              </div>

              <form method="post">
                <div className="plan_selection_section">
                  <div className="plan_segment">
                    <div className="title">Plan Selected</div>
                    <div className="plan_selected">
                      <div className="plan">
                        {fetchedPlanImg && <img src={`${BASE_URL}${fetchedPlanImg}`} alt={fetchedPlanName} />}
                        <h6>{fetchedPlanName}</h6>
                      </div>
                      <button type="button" className="change_text" onClick={backToPlanPreference}>Change</button>
                    </div>
                  </div>
                </div>
                {segmentPreferenceResponse.map((seg: any, i: number) => (
                  <div key={i} className="col-lg-12">
                    <div className="square-box p-3">
                      <div className="pan_details_align">
                        <input
                          id={`seg-mob-${i}`}
                          name={`seg-mob-${i}`}
                          className="form-check-input"
                          type="checkbox"
                          checked={!!seg.selected}
                          disabled={seg.trdSegment === 'Equity & Mutual Fund'}
                          aria-disabled={seg.trdSegment === 'Equity & Mutual Fund'}
                          onChange={(e) => toggleSegment(i, e.target.checked)}
                        />
                        <div className="upload_css">
                          <h5>{seg.trdSegment}</h5>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                <div className="col-12">
                  <p style={{ fontSize: 14 }}>I hereby agree to active my respective segment subject to proper documentation provided by me.</p>
                </div>
              </form>
              <div className="stickybtn">
                <button onClick={planPreferenceForm} className="btn btn_cls">Proceed</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
