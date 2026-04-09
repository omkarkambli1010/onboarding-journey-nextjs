'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import { toast } from 'react-toastify';
import apiService from '@/services/api.service';
import navigationService from '@/services/navigation.service';
import styles from './add-nominee.module.scss';

// AddNominee — Add nominee details during account opening
// Equivalent to Angular AddNomineeComponent

interface NomineeForm {
  name: string;
  relation: string;
  dob: string;
  percentage: string;
  address: string;
}

const EMPTY_NOMINEE: NomineeForm = { name: '', relation: '', dob: '', percentage: '100', address: '' };

const RELATION_OPTIONS = [
  'Spouse', 'Son', 'Daughter', 'Father', 'Mother',
  'Brother', 'Sister', 'Grand Son', 'Grand Daughter', 'Others',
];

export default function AddNominee() {
  const router = useRouter();
  const params = useParams();
  const formNumber = params?.formNumber as string;
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [nominees, setNominees] = useState<NomineeForm[]>([{ ...EMPTY_NOMINEE }]);
  const [optOut, setOptOut] = useState(false);
  const [isProceedDisabled, setIsProceedDisabled] = useState(false);

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
    loadExistingNominees();
  }, []);

  const loadExistingNominees = async () => {
    showSpinner();
    const reqData = {
      flag: 'nominee',
      formnumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
    };
    try {
      const response = await apiService.postRequestNominee('api/v1/nomineeservice/getnominee', reqData, hideSpinner);
      if (response?.status === true && response?.data?.length) {
        const existing: NomineeForm[] = response.data.map((n: any) => ({
          name: n.NomineeName || '',
          relation: n.Relation || '',
          dob: n.DOB || '',
          percentage: String(n.Percentage || '100'),
          address: n.Address || '',
        }));
        setNominees(existing);
      }
      hideSpinner();
    } catch { hideSpinner(); }
  };

  const updateNominee = (index: number, field: keyof NomineeForm, value: string) => {
    const updated = [...nominees];
    updated[index] = { ...updated[index], [field]: value };
    setNominees(updated);
  };

  const addNominee = () => {
    if (nominees.length >= 3) {
      toast.info('Maximum 3 nominees allowed.', { position: 'bottom-center', autoClose: 2000 });
      return;
    }
    const remaining = 100 - nominees.reduce((sum, n) => sum + Number(n.percentage || 0), 0);
    setNominees([...nominees, { ...EMPTY_NOMINEE, percentage: String(remaining) }]);
  };

  const removeNominee = (index: number) => {
    if (nominees.length === 1) return;
    const updated = nominees.filter((_, i) => i !== index);
    setNominees(updated);
  };

  const validateAndSave = async () => {
    if (optOut) {
      await saveNominees([]);
      return;
    }
    const totalPercentage = nominees.reduce((sum, n) => sum + Number(n.percentage || 0), 0);
    if (totalPercentage !== 100) {
      toast.warning('Total nominee percentage must equal 100%.', { position: 'bottom-center', autoClose: 3000 });
      return;
    }
    for (const [i, n] of nominees.entries()) {
      if (!n.name.trim()) { toast.warning(`Nominee ${i + 1}: Name is required.`, { position: 'bottom-center', autoClose: 2000 }); return; }
      if (!n.relation) { toast.warning(`Nominee ${i + 1}: Relation is required.`, { position: 'bottom-center', autoClose: 2000 }); return; }
      if (!n.dob) { toast.warning(`Nominee ${i + 1}: Date of birth is required.`, { position: 'bottom-center', autoClose: 2000 }); return; }
    }
    await saveNominees(nominees);
  };

  const saveNominees = async (nomineeData: NomineeForm[]) => {
    showSpinner();
    const reqData = {
      FormNumber: typeof window !== 'undefined' ? sessionStorage.getItem('FormNumber') : '',
      flag: optOut ? 'nomineeoptout' : 'addnominee',
      nominees: nomineeData.map((n) => ({
        NomineeName: n.name,
        Relation: n.relation,
        DOB: n.dob,
        Percentage: n.percentage,
        Address: n.address,
      })),
    };
    try {
      const response = await apiService.postRequestNominee('api/v1/nomineeservice/savenominee', reqData, hideSpinner);
      if (response?.status === true) {
        toast.success('Nominee details saved!', { position: 'bottom-center', autoClose: 2000 });
        if (rejectStatus !== 'R') {
          setTimeout(() => { navigationService.navigateToNextStep(); hideSpinner(); }, 200);
        } else {
          setTimeout(() => { navigationService.navigateToNextStep(); hideSpinner(); }, 200);
        }
      } else {
        toast.error(response?.message || 'Failed to save nominees.', { position: 'bottom-center', autoClose: 3000 });
        hideSpinner();
      }
    } catch { hideSpinner(); }
  };

  const faqHelpBtn = (stageName: string) => {
    const encodedStageName = btoa(stageName);
    window.location.href = `faq?stageName=${encodeURIComponent(encodedStageName)}`;
  };

  return (
    <section aria-label="Add Nominee" className="pan_details_form">
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            <div className="mobile_css">
              <div className="back_cls">
                {rejectStatus === 'R' && <div className="back_cls2"></div>}
                <div className="mobile_header_padding">
                  <div className="help_faq_css">
                    <div className="d-flex flex-column gap-2">
                      <h5>Add Nominee</h5>
                      <p className="sub_title">Add up to 3 nominees for your account</p>
                    </div>
                    <div>
                      <div className="help_btn" onClick={() => faqHelpBtn('Nominee')} style={{ cursor: 'pointer' }}>Need Help?</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-lg-12 col-md-12 col-12 desktop_css">
              <div className="mobile_header_padding">
                <div className="help_faq_css">
                  <div className="heading">
                    <h5>Add Nominee</h5>
                    <p className="sub_title">Add up to 3 nominees for your account</p>
                  </div>
                  <div>
                    <div className="help_btn" onClick={() => faqHelpBtn('Nominee')} style={{ cursor: 'pointer' }}>Need Help?</div>
                  </div>
                </div>
              </div>
            </div>
            <hr className="desktop_css" />

            <form aria-label="Add Nominee Form" method="post">
              <div className="mobile_section">
                {/* Opt-out checkbox */}
                <div className="form-check mb-3">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="nomineeOptOut"
                    checked={optOut}
                    onChange={(e) => setOptOut(e.target.checked)}
                  />
                  <label className="form-check-label" htmlFor="nomineeOptOut">
                    I do not wish to nominate (Opt-out)
                  </label>
                </div>

                {!optOut && nominees.map((nominee, index) => (
                  <div key={index} className="mb-4 p-3" style={{ border: '1px solid #e0e0e0', borderRadius: 8 }}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <h6>Nominee {index + 1}</h6>
                      {nominees.length > 1 && (
                        <button type="button" className="btn btn_cls_outline" style={{ width: 'auto', padding: '4px 12px', fontSize: 13 }} onClick={() => removeNominee(index)}>
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Full Name <span style={{ color: '#dc3545' }}>*</span></label>
                      <input
                        type="text"
                        className="form-control otp_field"
                        placeholder="Nominee full name"
                        value={nominee.name}
                        maxLength={100}
                        onChange={(e) => updateNominee(index, 'name', e.target.value.replace(/[^a-zA-Z\s]/g, ''))}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Relation <span style={{ color: '#dc3545' }}>*</span></label>
                      <select
                        className="form-control otp_field"
                        value={nominee.relation}
                        onChange={(e) => updateNominee(index, 'relation', e.target.value)}
                      >
                        <option value="">Select relation</option>
                        {RELATION_OPTIONS.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Date of Birth <span style={{ color: '#dc3545' }}>*</span></label>
                      <input
                        type="date"
                        className="form-control otp_field"
                        value={nominee.dob}
                        onChange={(e) => updateNominee(index, 'dob', e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Share Percentage <span style={{ color: '#dc3545' }}>*</span></label>
                      <input
                        type="number"
                        className="form-control otp_field"
                        placeholder="e.g., 100"
                        min={1}
                        max={100}
                        value={nominee.percentage}
                        onChange={(e) => updateNominee(index, 'percentage', e.target.value)}
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <textarea
                        className="form-control otp_field"
                        placeholder="Nominee address (optional)"
                        rows={2}
                        value={nominee.address}
                        onChange={(e) => updateNominee(index, 'address', e.target.value)}
                        style={{ resize: 'none' }}
                      />
                    </div>
                  </div>
                ))}

                {!optOut && nominees.length < 3 && (
                  <div className="text-center mb-3">
                    <button type="button" className="btn btn_cls_outline" onClick={addNominee}>
                      + Add Another Nominee
                    </button>
                  </div>
                )}
              </div>

              <div className="stickybtn_desk desktop_css">
                <button className="btn btn_cls" disabled={isProceedDisabled} onClick={validateAndSave}>Proceed</button>
              </div>
            </form>
          </div>
          <div className="stickybtn mobile_css">
            <button className="btn btn_cls" disabled={isProceedDisabled} onClick={validateAndSave}>Proceed</button>
          </div>
        </div>
      </div>
    </section>
  );
}
