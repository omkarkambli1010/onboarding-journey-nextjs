'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar } from 'primereact/calendar';
import { FileUploadCard } from '@/components/file-upload/FileUploadCard';
import type { UploadedFile } from '@/components/file-upload/fileUpload.types';
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

  const [frontFiles, setFrontFiles] = useState<UploadedFile[]>([]);
  const [backFiles,  setBackFiles]  = useState<UploadedFile[]>([]);

  // Blank by default — read-only "—" until mock OCR fires on upload success.
  const [fullName,       setFullName]       = useState('');
  const [dob,            setDob]            = useState('');
  const [passportNumber, setPassportNumber] = useState('');
  const [issueDate,      setIssueDate]      = useState('');
  const [expiryDate,     setExpiryDate]     = useState('');
  const [nationality,    setNationality]    = useState('');
  const [gender,         setGender]         = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});

  // Both sections render the same 7 fields against shared state, but each
  // section has its own pencil/Save toggle so the user can choose which side
  // to edit from. Editing in one is reflected in the other.
  const [frontEditMode, setFrontEditMode] = useState(false);
  const [backEditMode,  setBackEditMode]  = useState(false);

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
    setNationality(v => v || 'Indian');
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

  const handleBack = () => router.back();

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

  const inputCls = (key: keyof PassportDetails) =>
    `${styles.fieldInput}${errors[key] ? ` ${styles.fieldInputError}` : ''}`;

  // Section header — title left, pencil/Save toggle right.
  function SectionHeader({
    title,
    editing,
    onToggle,
  }: {
    title: string;
    editing: boolean;
    onToggle: () => void;
  }) {
    return (
      <div className={styles.sectionHeader}>
        <p className={styles.sectionTitle}>{title}</p>
        <button
          type="button"
          className={styles.editToggleBtn}
          onClick={onToggle}
          aria-label={editing ? 'Save details' : 'Edit details'}
          aria-pressed={editing}
          title={editing ? 'Save' : 'Edit'}
        >
          {editing ? 'Save' : <IconEdit />}
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
        <Calendar
          inputId={`${idPrefix}-dob`}
          value={isoToDate(dob)}
          onChange={(e) => { setDob(dateToIso(e.value as Date | null)); onFieldChange('dob'); }}
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          showIcon
          iconPos="right"
          touchUI
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
        <Calendar
          inputId={`${idPrefix}-issueDate`}
          value={isoToDate(issueDate)}
          onChange={(e) => { setIssueDate(dateToIso(e.value as Date | null)); onFieldChange('issueDate'); }}
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          showIcon
          iconPos="right"
          touchUI
          maxDate={new Date()}
          className={`p-prime-cal${errors.issueDate ? ' p-prime-cal-error' : ''}`}
        />
      </FieldRow>

      <FieldRow id={`${idPrefix}-expiryDate`} label="Expiry Date" error={errors.expiryDate}>
        <Calendar
          inputId={`${idPrefix}-expiryDate`}
          value={isoToDate(expiryDate)}
          onChange={(e) => { setExpiryDate(dateToIso(e.value as Date | null)); onFieldChange('expiryDate'); }}
          dateFormat="dd/mm/yy"
          placeholder="DD/MM/YYYY"
          showIcon
          iconPos="right"
          touchUI
          minDate={isoToDate(issueDate) ?? undefined}
          className={`p-prime-cal${errors.expiryDate ? ' p-prime-cal-error' : ''}`}
        />
      </FieldRow>

      <FieldRow id={`${idPrefix}-nationality`} label="Nationality" error={errors.nationality}>
        <input
          id={`${idPrefix}-nationality`}
          type="text"
          value={nationality}
          onChange={(e) => { setNationality(e.target.value); onFieldChange('nationality'); }}
          className={inputCls('nationality')}
          aria-invalid={!!errors.nationality}
          autoComplete="country-name"
        />
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
        onToggle={() => setFrontEditMode((v) => !v)}
      />

      <FileUploadCard
        acceptedTypes={ACCEPTED_TYPES}
        maxSize={MAX_SIZE}
        acceptedLabel={ACCEPTED_LABEL}
        sizeErrorMessage={SIZE_ERR}
        typeErrorMessage={TYPE_ERR}
        cropImages
        onFilesChange={setFrontFiles}
      />

      {frontEditMode ? renderEditFields('front') : readOnlyFields}
    </div>
  );

  // ─── Back section ────────────────────────────────────────────────────────
  // Mirrors Front: same SectionHeader (own pencil/Save), upload card, and the
  // same 7 fields against shared state — editing in either side updates both.
  const backSection = (
    <div className={styles.section}>
      <SectionHeader
        title="Upload Passport Back"
        editing={backEditMode}
        onToggle={() => setBackEditMode((v) => !v)}
      />

      <FileUploadCard
        acceptedTypes={ACCEPTED_TYPES}
        maxSize={MAX_SIZE}
        acceptedLabel={ACCEPTED_LABEL}
        sizeErrorMessage={SIZE_ERR}
        typeErrorMessage={TYPE_ERR}
        cropImages
        onFilesChange={setBackFiles}
      />

      {backEditMode ? renderEditFields('back') : readOnlyFields}
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
