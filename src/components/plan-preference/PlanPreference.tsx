'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './plan-preference.module.scss';

// PlanPreference — Brokerage plan selection screen
// Equivalent to Angular PlanPreferenceComponent

const BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

interface Plan {
  schemeCode: string;
  schemeType: string;
  schemeTypeLogo: string;
  description?: string;
  features?: string[];
  selected?: boolean;
}

export default function PlanPreference() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [plans, setPlans] = useState<Plan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState('');
  const [isProceedDisabled, setIsProceedDisabled] = useState(true);

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    getPlanData();
  }, []);

  const getPlanData = async () => {
    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/masters/get', {
        flag: 'all',
        formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      }, hideSpinner);

      if (response?.status === true && response?.data) {
        const planList: Plan[] = response.data.data5 || [];
        // Get previously selected plan
        const reqPlan = {
          flag: 'segmentpreference',
          formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
        };
        try {
          const planResp = await apiService.postRequest('api/v1/WorkflowDetails/getworkflowdata', reqPlan, hideSpinner);
          if (planResp?.status === true && planResp?.data?.[0]?.schemeType) {
            const prevSelected = planResp.data[0].schemeType;
            planList.forEach((p: Plan) => { p.selected = p.schemeType === prevSelected; });
            setSelectedPlan(prevSelected);
            setIsProceedDisabled(false);
          }
        } catch {}
        setPlans(planList);
      }
    } catch {}
    hideSpinner();
  };

  const selectPlan = (plan: Plan) => {
    const updated = plans.map((p) => ({ ...p, selected: p.schemeCode === plan.schemeCode }));
    setPlans(updated);
    setSelectedPlan(plan.schemeType);
    setIsProceedDisabled(false);
  };

  const proceedWithPlan = async () => {
    if (!selectedPlan) {
      toast.warning('Please select a plan to continue.', { position: 'bottom-center', autoClose: 2000 });
      return;
    }
    showSpinner();
    const selectedPlanObj = plans.find((p) => p.schemeType === selectedPlan);
    const reqData = {
      flag: 'schemeselection',
      FormNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      schemeCode: selectedPlanObj?.schemeCode || '',
      schemeType: selectedPlan,
    };
    try {
      const response = await apiService.postRequest('api/v1/schemeSegmentDetail/save', reqData, hideSpinner);
      if (response?.status === true) {
        if (rejectStatus !== 'R') {
          setTimeout(() => { router.push('/planprocess/3'); hideSpinner(); }, 200);
        } else {
          setTimeout(() => { navigationService.navigateToNextStep(); hideSpinner(); }, 200);
        }
      } else {
        toast.warning(response?.message || 'Error', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  const backToDeclaration = () => {
    showSpinner();
    setTimeout(() => { router.push('/planprocess/1'); hideSpinner(); }, 200);
  };

  return (
    <>
      {/* Desktop */}
      <div className="desktop_css">
        <section className="pan_details_form" aria-labelledby="plan-pref-heading-desk">
          <div className="container">
            <div className="row">
              <div className="col-lg-10 col-12 m-auto">
                <form method="post" aria-label="Plan Preference">
                  <div>
                    <div className="col-lg-12 col-md-12 col-12">
                      <div className="d-flex align-items-start gap-2">
                        {rejectStatus !== 'R' && (
                          <div onClick={backToDeclaration} style={{ cursor: 'pointer' }}>
                            <span>
                              <svg width="24" height="25" viewBox="0 0 24 25" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <g clipPath="url(#clip0_plan)">
                                  <path d="M5 12.5H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 18.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                  <path d="M5 12.5L11 6.5" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </g>
                                <defs><clipPath id="clip0_plan"><rect width="24" height="24" fill="white" transform="translate(0 0.5)" /></clipPath></defs>
                              </svg>
                            </span>
                          </div>
                        )}
                        <div className="d-flex flex-column align-items-start gap-2">
                          <h5 id="plan-pref-heading-desk">Select Your Plan</h5>
                          <p className="sub_title">Choose the brokerage plan that suits you best</p>
                        </div>
                      </div>
                    </div>
                    <hr />
                    {plans.map((plan, i) => (
                      <div key={plan.schemeCode || i} className="col-lg-12 mb-3">
                        <label
                          htmlFor={`plan-desk-${i}`}
                          className={`square-box p-3 d-block ${plan.selected ? 'selected' : ''}`}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className="pan_details_align">
                            <input
                              id={`plan-desk-${i}`}
                              name="plan"
                              className="form-check-input"
                              type="radio"
                              checked={!!plan.selected}
                              onChange={() => selectPlan(plan)}
                            />
                            <div className="upload_css">
                              {plan.schemeTypeLogo && (
                                <img src={`${BASE_URL}${plan.schemeTypeLogo}`} alt={plan.schemeType} style={{ height: 40, marginBottom: 8 }} />
                              )}
                              <h5>{plan.schemeType}</h5>
                              {plan.description && <p className="sub_title">{plan.description}</p>}
                            </div>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  <div className="proceed_btn">
                    <button className="btn btn_cls" disabled={isProceedDisabled} onClick={proceedWithPlan}>Proceed</button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Mobile */}
      <div className="mobile_css">
        <section className="pan_details_form" aria-labelledby="plan-pref-heading-mob">
          <div className="container">
            <div className="row">
              <div className="back_cls">
                {rejectStatus !== 'R' && (
                  <div onClick={backToDeclaration} style={{ cursor: 'pointer' }}>
                    <img src="/assets/images/diy/ChevronLeft.png" aria-hidden="true" alt="" /> Back
                  </div>
                )}
                {rejectStatus === 'R' && <div className="back_cls2"></div>}
                <div className="d-flex flex-column align-items-start gap-2">
                  <h5 id="plan-pref-heading-mob">Select Your Plan</h5>
                  <p className="sub_title">Choose the brokerage plan that suits you best</p>
                </div>
              </div>
              <form method="post">
                <div className="group_btn">
                  {plans.map((plan, i) => (
                    <div
                      key={plan.schemeCode || i}
                      className="square-box p-3"
                      style={{ cursor: 'pointer' }}
                      onClick={() => selectPlan(plan)}
                    >
                      <div className="pan_details_align">
                        <input
                          id={`plan-mob-${i}`}
                          name="plan"
                          className="form-check-input"
                          type="radio"
                          checked={!!plan.selected}
                          onChange={() => selectPlan(plan)}
                        />
                        <div className="upload_css">
                          {plan.schemeTypeLogo && (
                            <img src={`${BASE_URL}${plan.schemeTypeLogo}`} alt={plan.schemeType} style={{ height: 40, marginBottom: 8 }} />
                          )}
                          <h5>{plan.schemeType}</h5>
                          {plan.description && <p className="sub_title">{plan.description}</p>}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </form>
              <div className="stickybtn">
                <button className="btn btn_cls" disabled={isProceedDisabled} onClick={proceedWithPlan}>Proceed</button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
