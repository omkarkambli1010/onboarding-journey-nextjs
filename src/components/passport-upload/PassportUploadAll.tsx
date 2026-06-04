'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DateField from '@/components/date-field/DateField';
import { FileUploadCard } from '@/components/file-upload/FileUploadCard';
import type { UploadedFile } from '@/components/file-upload/fileUpload.types';
import { COUNTRIES } from '@/components/country-select/countries';
import { apiService } from '@/services/api.service';
import { toast } from '@/services/toast.service';
import styles from './passport-upload.module.scss';

// PassportUploadAll — all-in-one Passport screen (manual-bankdetails style).
// Reached from /passportUpload (intro). Two sections:
//   • Upload Passport Front — file upload + 7 OCR-style fields with a
//     read-only ↔ edit toggle (pencil / Save). Mock OCR auto-fills on success.
//   • Upload Passport Back  — file upload only (passport back has no text
//     fields to extract).

// ── Upload constraints ──────────────────────────────────────────────────────
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_LABEL = 'PDF, JPG, JPEG, HEIC & PNG';
const SIZE_ERR = 'File size exceeds 5MB. Please upload PDF, JPG, JPEG, HEIC, PNG only.';
const TYPE_ERR = 'Unsupported file type. Please upload PDF, JPG, JPEG, HEIC, PNG only.';

// ── Validation ──────────────────────────────────────────────────────────────
const NAME_RE = /^[A-Za-z ]+$/;
const PASSPORT_RE = /^[A-Z0-9]{8,9}$/;

interface PassportDetails {
  fullName:       string;
  dob:            string;
  passportNumber: string;
  issueDate:      string;
  expiryDate:     string;
  nationality:    string;
  gender:         string;
}

type FieldErrors = Partial<Record<keyof PassportDetails, string>>;

function validateDetails(d: PassportDetails): FieldErrors {
  const errs: FieldErrors = {};
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!d.fullName.trim()) errs.fullName = 'Full name is required';
  else if (!NAME_RE.test(d.fullName.trim())) errs.fullName = 'Only letters and spaces are allowed';

  if (!d.dob) errs.dob = 'Date of birth is required';
  else {
    const dob = new Date(d.dob);
    if (Number.isNaN(dob.getTime())) errs.dob = 'Enter a valid date';
    else if (dob >= today) errs.dob = 'Date of birth must be in the past';
    else {
      const age = (today.getTime() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
      if (age < 18) errs.dob = 'You must be at least 18 years old';
    }
  }

  if (!d.passportNumber.trim()) errs.passportNumber = 'Passport number is required';
  else if (!PASSPORT_RE.test(d.passportNumber.trim())) errs.passportNumber = '8–9 letters or digits (A–Z, 0–9)';

  if (!d.issueDate) errs.issueDate = 'Issue date is required';
  else {
    const iss = new Date(d.issueDate);
    if (Number.isNaN(iss.getTime())) errs.issueDate = 'Enter a valid date';
    else if (iss > today) errs.issueDate = 'Issue date must be in the past';
  }

  if (!d.expiryDate) errs.expiryDate = 'Expiry date is required';
  else {
    const exp = new Date(d.expiryDate);
    if (Number.isNaN(exp.getTime())) errs.expiryDate = 'Enter a valid date';
    else if (exp <= today) errs.expiryDate = 'Expiry date must be in the future';
    else if (d.issueDate && exp <= new Date(d.issueDate)) errs.expiryDate = 'Expiry must be after issue date';
  }

  if (!d.nationality.trim()) errs.nationality = 'Nationality is required';
  if (!d.gender.trim())      errs.gender = 'Gender is required';

  return errs;
}

// ── Date helpers ────────────────────────────────────────────────────────────
const isoToDate = (s: string): Date | null => (s ? new Date(s) : null);
const dateToIso = (d: Date | null | undefined): string => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const formatDateForDisplay = (iso: string): string => {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
};

// API dates may arrive as yyyy-mm-dd, dd/mm/yyyy, or a parseable string — coerce
// to the yyyy-mm-dd the form fields expect. Returns '' when unparseable.
const normalizeIso = (s: string): string => {
  if (!s) return '';
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const dmy = s.match(/^(\d{2})[/-](\d{2})[/-](\d{4})$/);
  if (dmy) return `${dmy[3]}-${dmy[2]}-${dmy[1]}`;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? '' : dateToIso(d);
};

// Defensive read of the first non-empty value across candidate keys — the GET
// /passport response field names aren't pinned down, so we accept common casings.
const pickField = (o: Record<string, unknown> | undefined, ...keys: string[]): string => {
  if (!o) return '';
  for (const k of keys) {
    const v = o[k];
    if (v != null && v !== '') return String(v);
  }
  return '';
};

// Resolve an arbitrary nationality string from the API (a country name, an
// iso2 code, or a demonym like "Indian") to a canonical country name from
// COUNTRIES so the dropdown shows it as selected. Falls back to raw if unmatched.
const resolveCountryName = (raw: string): string => {
  const q = raw.trim().toLowerCase();
  if (!q) return '';
  const exact = COUNTRIES.find((c) => c.name.toLowerCase() === q || c.iso2 === q);
  if (exact) return exact.name;
  const fuzzy = COUNTRIES.find(
    (c) => q.startsWith(c.name.toLowerCase()) || c.name.toLowerCase().startsWith(q),
  );
  return fuzzy ? fuzzy.name : raw;
};

// ── Icons ───────────────────────────────────────────────────────────────────
function IconBackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19 12H5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L5 12L12 5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path
        d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5Z"
        stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
      />
      <path d="M15 5l3 3" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <p className={styles.extractedInlineRow}>
      {label}: <span className={styles.extractedInlineValue}>{value || '—'}</span>
    </p>
  );
}

// Mobile stacks label/input; desktop renders label-left, input-right.
function FieldRow({
  id,
  label,
  error,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className={styles.fieldGroup}>
      <label htmlFor={id} className={styles.fieldRowLabel}>{label}</label>
      <div className={styles.inputCol}>
        {children}
        {error && <p className={styles.fieldError} role="alert">{error}</p>}
      </div>
    </div>
  );
}

export default function PassportUploadAll() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Passport type chosen on /passportUpload/details and carried in ?type=
  // ("Indian" | "Foreign"). Sent verbatim to the upload API.
  const passportType = searchParams.get('type') ?? 'Indian';

  const [frontFiles, setFrontFiles] = useState<UploadedFile[]>([]);
  const [backFiles,  setBackFiles]  = useState<UploadedFile[]>([]);

  // Map a GET /passport response onto the seven form fields. Unrecognised /
  // missing values are left untouched (mock OCR fills any remaining gaps).
  const applyPassportDetails = (raw: unknown) => {
    const r = (raw ?? {}) as Record<string, unknown>;
    const d = (r.passport ?? r.data ?? r) as Record<string, unknown>;

    const name = pickField(d, 'holderName', 'fullName', 'name');
    const dobV = pickField(d, 'dob', 'dateOfBirth');
    const pno  = pickField(d, 'passportNumber', 'number');
    const iss  = pickField(d, 'issueDate', 'dateOfIssue');
    const exp  = pickField(d, 'expiryDate', 'dateOfExpiry');
    const nat  = pickField(d, 'nationality');
    const gen  = pickField(d, 'gender', 'sex');

    if (name) setFullName(name);
    if (dobV) setDob(normalizeIso(dobV));
    if (pno)  setPassportNumber(pno);
    if (iss)  setIssueDate(normalizeIso(iss));
    if (exp)  setExpiryDate(normalizeIso(exp));
    if (nat)  setNationality(resolveCountryName(nat));
    if (gen)  setGender(gen);
  };

  // Real upload — fires when the user confirms the crop (Crop & Continue). The
  // cropped image becomes Front/BackFile in a multipart POST; the API's status
  // message ("Uploaded Successfully!") is surfaced via a toast. After a Front
  // upload we also GET /passport to pull the parsed details into the form.
  const makeUploadFn =
    (field: 'FrontFile' | 'BackFile') =>
    async (file: File, onProgress: (p: number) => void) => {
      const applicationId =
        typeof window !== 'undefined' ? sessionStorage.getItem('applicationId') ?? '' : '';
      if (!applicationId) {
        // No application context — don't fire a malformed applications//passport
        // request. Surface it and mark the file as failed (thrown error → error state).
        toast.error('Your session has expired, please start again.');
        throw new Error('Missing application ID');
      }
      // A fresh Front upload re-locks the editor until its GET details arrive.
      if (field === 'FrontFile') {
        setDetailsFetched(false);
        setFrontEditMode(false);
      }
      const res = await apiService.uploadPassportFile(
        applicationId,
        field,
        file,
        passportType,
        onProgress,
      );
      onProgress(100);
      const message = res?.message ?? res?.detail ?? 'Uploaded Successfully!';
      toast.success(message);

      if (field === 'FrontFile') {
        const details = await apiService.getPassport(applicationId);
        applyPassportDetails(details);
        setDetailsFetched(true);
      }
    };

  // Blank by default — read-only "—" until mock OCR fires on upload success.
  const [fullName,       setFullName]       = useState('');
  const [dob,            setDob]            = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [issueDate,      setIssueDate]      = useState('');
  const [expiryDate,     setExpiryDate]     = useState('');
  const [nationality,    setNationality]    = useState('');
  const [gender,         setGender]         = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});

  // The Front section owns the 7 detail fields with a pencil/Save toggle; the
  // Back section is upload-only, so only Front has an edit mode.
  const [frontEditMode, setFrontEditMode] = useState(false);

  // The edit/pencil toggle stays disabled until the Front image uploads
  // successfully AND the GET /passport details have been fetched into the form.
  const [detailsFetched, setDetailsFetched] = useState(false);
  // True while a Save (POST /passport) is in flight.
  const [savingDetails, setSavingDetails] = useState(false);

  const frontUploaded = frontFiles.some(f => f.status === 'success');
  const backUploaded  = backFiles.some(f => f.status === 'success');

  // Mock OCR — fills empty fields when either upload succeeds. The "only if
  // empty" guard means whichever side uploads second won't clobber the values
  // the first side already populated, and re-uploading is safe.
  const fillMockDetails = () => {
    setFullName(v => v || 'Nishit Suresh Shah');
    setDob(v => v || '1986-03-04');
    setPassportNumber(v => v || 'IND121233H');
    setIssueDate(v => v || '2020-03-04');
    setExpiryDate(v => v || '2030-03-04');
    setNationality(v => v || 'India');
    setGender(v => v || 'Male');
  };

  useEffect(() => {
    if (frontUploaded) fillMockDetails();
  }, [frontUploaded]);

  useEffect(() => {
    if (backUploaded) fillMockDetails();
  }, [backUploaded]);

  const isDisabled =
    !frontUploaded ||
    !backUploaded ||
    !fullName.trim() ||
    !dob ||
    !passportNumber.trim() ||
    !issueDate ||
    !expiryDate ||
    !nationality.trim() ||
    !gender.trim();

  const onFieldChange = (key: keyof PassportDetails) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  // Always return to the passport-type selection (Indian / Foreign), not just
  // the previous history entry.
  const handleBack = () => router.push('/passportUpload/details');

  const handleProceed = () => {
    const current: PassportDetails = {
      fullName, dob, passportNumber, issueDate, expiryDate, nationality, gender,
    };
    const errs = validateDetails(current);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields and try again');
      return;
    }
    router.push('/esign');
  };

  // Front pencil/Save toggle. Pencil → enter edit mode (no API). Save →
  // validate, POST the edited details to /passport, then exit edit mode.
  const handleFrontEditToggle = async () => {
    if (!frontEditMode) {
      setFrontEditMode(true);
      return;
    }

    const current: PassportDetails = {
      fullName, dob, passportNumber, issueDate, expiryDate, nationality, gender,
    };
    const errs = validateDetails(current);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields and try again');
      return;
    }

    const applicationId =
      typeof window !== 'undefined' ? sessionStorage.getItem('applicationId') ?? '' : '';
    if (!applicationId) {
      toast.error('Your session has expired, please start again.');
      return;
    }

    setSavingDetails(true);
    try {
      const res = await apiService.updatePassport(applicationId, {
        holderName: fullName,
        dob,
        passportNumber,
        issueDate,
        expiryDate,
        nationality,
        gender,
      });
      toast.success(res?.message ?? 'Details updated successfully');
      setFrontEditMode(false);
    } catch {
      // apiService.handleError already surfaced the backend message.
    } finally {
      setSavingDetails(false);
    }
  };

  const inputCls = (key: keyof PassportDetails) =>
    `${styles.fieldInput}${errors[key] ? ` ${styles.fieldInputError}` : ''}`;

  // Section header — title left, pencil/Save toggle right. The toggle can be
  // disabled until the upload + details fetch make editing meaningful.
  function SectionHeader({
    title,
    editing,
    onToggle,
    disabled = false,
    saving = false,
  }: {
    title: string;
    editing: boolean;
    onToggle: () => void;
    disabled?: boolean;
    saving?: boolean;
  }) {
    return (
      <div className={styles.sectionHeader}>
        <p className={styles.sectionTitle}>{title}</p>
        <button
          type="button"
          className={styles.editToggleBtn}
          onClick={onToggle}
          disabled={disabled || saving}
          aria-disabled={disabled || saving}
          aria-label={editing ? 'Save details' : 'Edit details'}
          aria-pressed={editing}
          title={disabled ? 'Upload your passport front to edit' : editing ? 'Save' : 'Edit'}
        >
          {editing ? (saving ? 'Saving…' : 'Save') : <IconEdit />}
        </button>
      </div>
    );
  }

  // Editable form, rendered identically inside Front and Back sections.
  // `idPrefix` keeps native input ids unique across the two instances so each
  // label still targets exactly one control.
  const renderEditFields = (idPrefix: 'front' | 'back') => (
    <>
      <FieldRow id={`${idPrefix}-fullName`} label="Full Name" error={errors.fullName}>
        <input
          id={`${idPrefix}-fullName`}
          type="text"
          value={fullName}
          onChange={(e) => { setFullName(e.target.value); onFieldChange('fullName'); }}
          className={inputCls('fullName')}
          aria-invalid={!!errors.fullName}
          autoComplete="name"
        />
      </FieldRow>

      <FieldRow id={`${idPrefix}-dob`} label="Date of Birth" error={errors.dob}>
        <DateField
          inputId={`${idPrefix}-dob`}
          value={isoToDate(dob)}
          onChange={(d) => { setDob(dateToIso(d)); onFieldChange('dob'); }}
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          showIcon
          iconPos="right"
          touchUI
          panelClassName="p-prime-cal-sm"
          maxDate={new Date()}
          className={`p-prime-cal${errors.dob ? ' p-prime-cal-error' : ''}`}
        />
      </FieldRow>

      <FieldRow id={`${idPrefix}-passportNumber`} label="Passport Number" error={errors.passportNumber}>
        <input
          id={`${idPrefix}-passportNumber`}
          type="text"
          maxLength={9}
          value={passportNumber}
          onChange={(e) => {
            setPassportNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
            onFieldChange('passportNumber');
          }}
          className={inputCls('passportNumber')}
          aria-invalid={!!errors.passportNumber}
          placeholder="e.g. IND121233H"
          autoComplete="off"
        />
      </FieldRow>

      <FieldRow id={`${idPrefix}-issueDate`} label="Issue Date" error={errors.issueDate}>
        <DateField
          inputId={`${idPrefix}-issueDate`}
          value={isoToDate(issueDate)}
          onChange={(d) => { setIssueDate(dateToIso(d)); onFieldChange('issueDate'); }}
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          showIcon
          iconPos="right"
          touchUI
          panelClassName="p-prime-cal-sm"
          maxDate={new Date()}
          className={`p-prime-cal${errors.issueDate ? ' p-prime-cal-error' : ''}`}
        />
      </FieldRow>

      <FieldRow id={`${idPrefix}-expiryDate`} label="Expiry Date" error={errors.expiryDate}>
        <DateField
          inputId={`${idPrefix}-expiryDate`}
          value={isoToDate(expiryDate)}
          onChange={(d) => { setExpiryDate(dateToIso(d)); onFieldChange('expiryDate'); }}
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          showIcon
          iconPos="right"
          touchUI
          panelClassName="p-prime-cal-sm"
          minDate={isoToDate(issueDate) ?? undefined}
          className={`p-prime-cal${errors.expiryDate ? ' p-prime-cal-error' : ''}`}
        />
      </FieldRow>

      <FieldRow id={`${idPrefix}-nationality`} label="Nationality" error={errors.nationality}>
        <select
          id={`${idPrefix}-nationality`}
          value={nationality}
          onChange={(e) => { setNationality(e.target.value); onFieldChange('nationality'); }}
          className={`${styles.fieldSelect}${errors.nationality ? ` ${styles.fieldInputError}` : ''}`}
          aria-invalid={!!errors.nationality}
        >
          <option value="">Select country</option>
          {COUNTRIES.map((c) => (
            <option key={c.iso2} value={c.name}>{c.name}</option>
          ))}
        </select>
      </FieldRow>

      <FieldRow id={`${idPrefix}-gender`} label="Gender" error={errors.gender}>
        <select
          id={`${idPrefix}-gender`}
          value={gender}
          onChange={(e) => { setGender(e.target.value); onFieldChange('gender'); }}
          className={`${styles.fieldSelect}${errors.gender ? ` ${styles.fieldInputError}` : ''}`}
          aria-invalid={!!errors.gender}
        >
          <option value="">Select gender</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>
      </FieldRow>
    </>
  );

  // Read-only "Label: value" stack — shared between both sections.
  const readOnlyFields = (
    <div className={styles.readOnlyList}>
      <ReadOnlyRow label="Full Name"       value={fullName} />
      <ReadOnlyRow label="Date of Birth"   value={formatDateForDisplay(dob)} />
      <ReadOnlyRow label="Passport Number" value={passportNumber} />
      <ReadOnlyRow label="Issue Date"      value={formatDateForDisplay(issueDate)} />
      <ReadOnlyRow label="Expiry Date"     value={formatDateForDisplay(expiryDate)} />
      <ReadOnlyRow label="Nationality"     value={nationality} />
      <ReadOnlyRow label="Gender"          value={gender} />
    </div>
  );

  // ─── Front section ───────────────────────────────────────────────────────
  // SectionHeader + upload card + the same 7 fields (read-only or editable
  // based on this section's toggle).
  const frontSection = (
    <div className={styles.section}>
      <SectionHeader
        title="Upload Passport Front"
        editing={frontEditMode}
        onToggle={handleFrontEditToggle}
        disabled={!detailsFetched}
        saving={savingDetails}
      />

      <FileUploadCard
        acceptedTypes={ACCEPTED_TYPES}
        maxSize={MAX_SIZE}
        acceptedLabel={ACCEPTED_LABEL}
        sizeErrorMessage={SIZE_ERR}
        typeErrorMessage={TYPE_ERR}
        cropImages
        uploadFn={makeUploadFn('FrontFile')}
        onFilesChange={setFrontFiles}
      />

      {frontEditMode ? renderEditFields('front') : readOnlyFields}
    </div>
  );

  // ─── Back section ────────────────────────────────────────────────────────
  // Upload only — no edit/pencil toggle and no detail fields. The passport
  // details live under the Front section (populated from the GET there).
  const backSection = (
    <div className={styles.section}>
      <div className={styles.sectionHeader}>
        <p className={styles.sectionTitle}>Upload Passport Back</p>
      </div>

      <FileUploadCard
        acceptedTypes={ACCEPTED_TYPES}
        maxSize={MAX_SIZE}
        acceptedLabel={ACCEPTED_LABEL}
        sizeErrorMessage={SIZE_ERR}
        typeErrorMessage={TYPE_ERR}
        cropImages
        uploadFn={makeUploadFn('BackFile')}
        onFilesChange={setBackFiles}
      />
    </div>
  );

  return (
    <>
      {/* ═══ MOBILE LAYOUT ════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Passport Details">

        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>
            <div className={styles.mobileTopRow}>
              <button type="button" className={styles.mobileBackBtn} onClick={handleBack} aria-label="Go back">
                <IconBackArrow />
              </button>
            </div>
            <div className={styles.mobileTitleBlock}>
              <h1 className={styles.mobileTitle}>Passport Details</h1>
              <p className={styles.mobileSubtitle}>
                Upload your passport (front &amp; back) and confirm the details below.
              </p>
            </div>
          </div>
        </div>

        <div className={styles.mobileCard}>
          {frontSection}
          {backSection}
        </div>

        <div className={styles.mobileProceedArea}>
          <button
            type="button"
            className={`${styles.mobileProceedBtn}${isDisabled ? ` ${styles.proceedBtnDisabled}` : ''}`}
            onClick={handleProceed}
            disabled={isDisabled}
            aria-disabled={isDisabled}
          >
            Proceed
          </button>
        </div>

      </div>

      {/* ═══ DESKTOP LAYOUT ═══════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Passport Details">
        <div className={styles.desktopCard}>

          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={handleBack} aria-label="Go back">
              <IconBackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <h1 className={styles.desktopCardTitle}>Passport Details</h1>
              <p className={styles.desktopCardSubtitle}>
                Upload your passport (front &amp; back) and confirm the details below.
              </p>
            </div>
          </div>

          <div className={styles.desktopCardBody}>
            <div className={styles.desktopScrollArea}>
              {frontSection}
              {backSection}
            </div>

            <div className={styles.desktopProceedWrapper}>
              <button
                type="button"
                className={`${styles.desktopProceedBtn}${isDisabled ? ` ${styles.proceedBtnDisabled}` : ''}`}
                onClick={handleProceed}
                disabled={isDisabled}
                aria-disabled={isDisabled}
              >
                Proceed
              </button>
            </div>
          </div>

        </div>
      </div>
    </>
  );
}
