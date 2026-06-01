'use client';

import { ReactNode, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import DateField from '@/components/date-field/DateField';
import { FileUploadCard } from '@/components/file-upload/FileUploadCard';
import type { UploadedFile } from '@/components/file-upload/fileUpload.types';
import { toast } from '@/services/toast.service';
import styles from './visa.module.scss';

// VisaUpload — all-in-one Visa screen (mirrors the manual-bankdetails layout).
// One route (/visa) replaces the prior /visa, /visa/front, /visa/back and
// /visa/front-edit pages: two FileUploadCards (Front + Back) on top, the
// 8 editable visa-detail fields below, single Proceed at the bottom.

// ── Upload constraints ──────────────────────────────────────────────────────
const ACCEPTED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/heic', 'image/heif'];
const MAX_SIZE = 5 * 1024 * 1024;
const ACCEPTED_LABEL = 'PDF, JPG, JPEG, HEIC & PNG';
const SIZE_ERR = 'File size exceeds 5MB. Please upload PDF, JPG, JPEG, HEIC, PNG only.';
const TYPE_ERR = 'Unsupported file type. Please upload PDF, JPG, JPEG, HEIC, PNG only.';

// ── Validation ──────────────────────────────────────────────────────────────
const DOC_NUMBER_RE = /^[A-Z0-9]{5,15}$/;
const PINCODE_RE = /^\d{4,10}$/;
const TEXT_RE = /^[A-Za-z ,.\-/]+$/;

interface VisaDetails {
  documentType:   string;
  documentNumber: string;
  expiryDate:     string;
  country:        string;
  address:        string;
  city:           string;
  state:          string;
  pincode:        string;
}

type FieldErrors = Partial<Record<keyof VisaDetails, string>>;

function validateDetails(d: VisaDetails): FieldErrors {
  const errs: FieldErrors = {};

  if (!d.documentType.trim()) errs.documentType = 'Document type is required';

  if (!d.documentNumber.trim()) errs.documentNumber = 'Document number is required';
  else if (!DOC_NUMBER_RE.test(d.documentNumber.trim())) {
    errs.documentNumber = '5–15 letters or digits (A–Z, 0–9)';
  }

  if (!d.expiryDate) errs.expiryDate = 'Expiry date is required';
  else if (Number.isNaN(new Date(d.expiryDate).getTime())) errs.expiryDate = 'Enter a valid date';

  if (!d.country.trim()) errs.country = 'Country is required';
  else if (!TEXT_RE.test(d.country.trim())) errs.country = 'Only letters and spaces are allowed';

  if (!d.address.trim()) errs.address = 'Address is required';

  if (!d.city.trim()) errs.city = 'City is required';
  else if (!TEXT_RE.test(d.city.trim())) errs.city = 'Only letters and spaces are allowed';

  if (!d.state.trim()) errs.state = 'State is required';
  else if (!TEXT_RE.test(d.state.trim())) errs.state = 'Only letters and spaces are allowed';

  if (!d.pincode.trim()) errs.pincode = 'Pincode is required';
  else if (!PINCODE_RE.test(d.pincode.trim())) errs.pincode = '4–10 digits';

  return errs;
}

// ── Date helpers — Calendar wants Date, the form keeps ISO strings ─────────
const isoToDate = (s: string): Date | null => (s ? new Date(s) : null);
const dateToIso = (d: Date | null | undefined): string => {
  if (!d) return '';
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

function isExpired(iso: string): boolean {
  if (!iso) return false;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

// ── Icons ───────────────────────────────────────────────────────────────────
function IconBackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M19 12H5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L5 12L12 5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function IconExclamationCircle() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="#ff2e00" strokeWidth="1.5" />
      <path d="M12 8v4" stroke="#ff2e00" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="12" cy="16" r="0.5" fill="#ff2e00" stroke="#ff2e00" strokeWidth="1" />
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

// Format ISO (YYYY-MM-DD) → DD/MM/YYYY for read-only display; falls back to raw.
const formatDateForDisplay = (iso: string): string => {
  if (!iso) return '';
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[3]}/${m[2]}/${m[1]}` : iso;
};

// Read-only "Label: value" row used when a section is not in edit mode.
function ReadOnlyRow({ label, value }: { label: string; value: string }) {
  return (
    <p className={styles.extractedInlineRow}>
      {label}: <span className={styles.extractedInlineValue}>{value || '—'}</span>
    </p>
  );
}

// ── Field row — mobile stacks label/input, desktop renders side-by-side ────
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

export default function VisaUpload() {
  const router = useRouter();
  // /visa entry hands the picked expiry over as ?expiry=<iso>. Read it once
  // for the initial state so the user doesn't have to re-pick on this page.
  const searchParams = useSearchParams();
  const initialExpiry = searchParams?.get('expiry') ?? '';

  const [frontFiles, setFrontFiles] = useState<UploadedFile[]>([]);
  const [backFiles, setBackFiles]   = useState<UploadedFile[]>([]);

  // Fields start blank ("—" in read-only mode) — they fill when the
  // corresponding upload completes (mock OCR below). expiryDate is still
  // pre-seeded from the entry-screen pick so the user doesn't lose it.
  const [documentType,   setDocumentType]   = useState('');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate,     setExpiryDate]     = useState(initialExpiry);
  const [country,        setCountry]        = useState('');
  const [address,        setAddress]        = useState('');
  const [city,           setCity]           = useState('');
  const [stateField,     setStateField]     = useState('');
  const [pincode,        setPincode]        = useState('');

  const [errors, setErrors] = useState<FieldErrors>({});

  // Each section starts read-only ("locked"); the pencil flips it to editable.
  const [frontEditMode, setFrontEditMode] = useState(false);
  const [backEditMode,  setBackEditMode]  = useState(false);

  const expired = isExpired(expiryDate);
  const frontUploaded = frontFiles.some(f => f.status === 'success');
  const backUploaded  = backFiles.some(f => f.status === 'success');

  // Mock OCR — once the corresponding upload succeeds we populate the empty
  // fields. We never overwrite a value the user (or query param) already set,
  // so re-uploading doesn't clobber edits.
  useEffect(() => {
    if (!frontUploaded) return;
    setDocumentType(v => v || 'Visa Card');
    setDocumentNumber(v => v || 'IND121233H');
    setExpiryDate(v => v || '2030-03-04');
    setCountry(v => v || 'India');
  }, [frontUploaded]);

  useEffect(() => {
    if (!backUploaded) return;
    setAddress(v => v || 'Lorem Ipsum, 123 Main St');
    setCity(v => v || 'Mumbai');
    setStateField(v => v || 'Maharashtra');
    setPincode(v => v || '400001');
  }, [backUploaded]);

  // Proceed gate — both files uploaded and every required field has a value.
  // Expired dates are informational (warning shown), not blocking — matches
  // the original /visa entry behaviour.
  const isDisabled =
    !frontUploaded ||
    !backUploaded ||
    !documentType.trim() ||
    !documentNumber.trim() ||
    !expiryDate ||
    !country.trim() ||
    !address.trim() ||
    !city.trim() ||
    !stateField.trim() ||
    !pincode.trim();

  const onFieldChange = (key: keyof VisaDetails) => {
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleBack = () => router.back();

  const handleProceed = () => {
    const current: VisaDetails = {
      documentType,
      documentNumber,
      expiryDate,
      country,
      address,
      city,
      state: stateField,
      pincode,
    };
    const errs = validateDetails(current);
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      toast.error('Please fix the highlighted fields and try again');
      return;
    }
    router.push('/esign');
  };

  const inputCls = (key: keyof VisaDetails) =>
    `${styles.editFieldInput}${errors[key] ? ` ${styles.editFieldInputError}` : ''}`;

  // Section header — title aligned left, pencil/check toggle aligned right.
  // The icon's tooltip + aria-label flip with `editing` so screen readers know
  // whether clicking will start or finish editing.
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

  // ─── Front section ───────────────────────────────────────────────────────
  // Mirrors manual-bankdetails' per-account section: title row (with the
  // edit-mode pencil), the upload card, then 4 detail rows that flip between
  // read-only "Label: value" and editable inputs.
  const frontSection = (
    <div className={styles.section}>
      <SectionHeader
        title="Upload Visa Front"
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

      {frontEditMode ? (
        <>
          <FieldRow id="documentType" label="Document Type" error={errors.documentType}>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => { setDocumentType(e.target.value); onFieldChange('documentType'); }}
              className={inputCls('documentType')}
              aria-invalid={!!errors.documentType}
            >
              <option value="">Select</option>
              <option value="Visa">Visa</option>
              <option value="Visa Card">Visa Card</option>
            </select>
          </FieldRow>

          <FieldRow id="documentNumber" label="Document Number" error={errors.documentNumber}>
            <input
              id="documentNumber"
              type="text"
              maxLength={15}
              value={documentNumber}
              onChange={(e) => {
                setDocumentNumber(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                onFieldChange('documentNumber');
              }}
              className={inputCls('documentNumber')}
              aria-invalid={!!errors.documentNumber}
              placeholder="e.g. IND121233H"
              autoComplete="off"
            />
          </FieldRow>

          <FieldRow id="expiryDate" label="Expiry Date" error={errors.expiryDate}>
            <DateField
              inputId="expiryDate"
              value={isoToDate(expiryDate)}
              onChange={(d) => { setExpiryDate(dateToIso(d)); onFieldChange('expiryDate'); }}
              dateFormat="dd/mm/yy"
              placeholder="DD/MM/YYYY"
              showIcon
              iconPos="right"
              touchUI
              panelClassName="p-prime-cal-sm"
              className={`p-prime-cal${errors.expiryDate ? ' p-prime-cal-error' : ''}${expired ? ` ${styles.expiredCalendar}` : ''}`}
            />
            {expired && !errors.expiryDate && (
              <div className={styles.expiryErrorRow} role="alert">
                <span className={styles.expiryErrorIcon}>
                  <IconExclamationCircle />
                </span>
                <p className={styles.expiryErrorText}>Visa has already expired</p>
              </div>
            )}
          </FieldRow>

          <FieldRow id="country" label="Country" error={errors.country}>
            <input
              id="country"
              type="text"
              value={country}
              onChange={(e) => { setCountry(e.target.value); onFieldChange('country'); }}
              className={inputCls('country')}
              aria-invalid={!!errors.country}
              placeholder="e.g. India"
              autoComplete="country-name"
            />
          </FieldRow>
        </>
      ) : (
        <div className={styles.readOnlyList}>
          <ReadOnlyRow label="Document Type"   value={documentType} />
          <ReadOnlyRow label="Document Number" value={documentNumber} />
          <ReadOnlyRow label="Expiry Date"     value={formatDateForDisplay(expiryDate)} />
          <ReadOnlyRow label="Country"         value={country} />
          {expired && (
            <div className={styles.expiryErrorRow} role="alert">
              <span className={styles.expiryErrorIcon}>
                <IconExclamationCircle />
              </span>
              <p className={styles.expiryErrorText}>Visa has already expired</p>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ─── Back section ────────────────────────────────────────────────────────
  // Address block — typically printed on the visa's back page.
  const backSection = (
    <div className={styles.section}>
      <SectionHeader
        title="Upload Visa Back"
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

      {backEditMode ? (
        <>
          <FieldRow id="address" label="Address" error={errors.address}>
            <input
              id="address"
              type="text"
              value={address}
              onChange={(e) => { setAddress(e.target.value); onFieldChange('address'); }}
              className={inputCls('address')}
              aria-invalid={!!errors.address}
              autoComplete="street-address"
            />
          </FieldRow>

          <FieldRow id="city" label="City" error={errors.city}>
            <input
              id="city"
              type="text"
              value={city}
              onChange={(e) => { setCity(e.target.value); onFieldChange('city'); }}
              className={inputCls('city')}
              aria-invalid={!!errors.city}
              autoComplete="address-level2"
            />
          </FieldRow>

          <FieldRow id="state" label="State" error={errors.state}>
            <input
              id="state"
              type="text"
              value={stateField}
              onChange={(e) => { setStateField(e.target.value); onFieldChange('state'); }}
              className={inputCls('state')}
              aria-invalid={!!errors.state}
              autoComplete="address-level1"
            />
          </FieldRow>

          <FieldRow id="pincode" label="Pincode" error={errors.pincode}>
            <input
              id="pincode"
              type="text"
              inputMode="numeric"
              maxLength={10}
              value={pincode}
              onChange={(e) => { setPincode(e.target.value.replace(/\D/g, '')); onFieldChange('pincode'); }}
              className={inputCls('pincode')}
              aria-invalid={!!errors.pincode}
              autoComplete="postal-code"
            />
          </FieldRow>
        </>
      ) : (
        <div className={styles.readOnlyList}>
          <ReadOnlyRow label="Address" value={address} />
          <ReadOnlyRow label="City"    value={city} />
          <ReadOnlyRow label="State"   value={stateField} />
          <ReadOnlyRow label="Pincode" value={pincode} />
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ═══ MOBILE LAYOUT ════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Visa Details">

        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>
            <div className={styles.mobileTopRow}>
              <button type="button" className={styles.mobileBackBtn} onClick={handleBack} aria-label="Go back">
                <IconBackArrow />
              </button>
            </div>
            <div className={styles.mobileTitleBlock}>
              <h1 className={styles.mobileTitle}>Visa Details</h1>
              <p className={styles.mobileSubtitle}>
                Upload your Visa (front &amp; back) and confirm the details below.
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
            className={`${styles.mobileProceedBtn}${isDisabled ? ` ${styles.mobileProceedBtnDisabled}` : ''}`}
            onClick={handleProceed}
            disabled={isDisabled}
            aria-disabled={isDisabled}
          >
            Proceed
          </button>
        </div>

      </div>

      {/* ═══ DESKTOP LAYOUT ═══════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Visa Details">
        <div className={styles.desktopCard}>

          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={handleBack} aria-label="Go back">
              <IconBackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <h1 className={styles.desktopCardTitle}>Visa Details</h1>
              <p className={styles.desktopCardSubtitle}>
                Upload your Visa (front &amp; back) and confirm the details below.
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
                className={`${styles.desktopProceedBtn}${isDisabled ? ` ${styles.desktopProceedBtnDisabled}` : ''}`}
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
