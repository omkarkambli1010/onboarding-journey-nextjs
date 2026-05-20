'use client';

import {
  ChangeEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useSpinner } from '@/components/spinner/Spinner';
import navigationService from '@/services/navigation.service';
import { FileUploadCard } from '@/components/file-upload/FileUploadCard';
import type { UploadedFile } from '@/components/file-upload/fileUpload.types';
import styles from './manual-bankdetails.module.scss';

// ── Constants ─────────────────────────────────────────────────────────────────

const DUMMY_IFSC_CODES = [
  { code: 'SBIN0000300', branch: 'SBI — Mumbai Main Branch' },
  { code: 'SBIN0001234', branch: 'SBI — Delhi Connaught Place' },
  { code: 'SBIN0002345', branch: 'SBI — Bangalore MG Road' },
  { code: 'SBIN0003456', branch: 'SBI — Chennai Anna Salai' },
  { code: 'SBIN0004567', branch: 'SBI — Kolkata Park Street' },
  { code: 'SBIN0005678', branch: 'SBI — Hyderabad Banjara Hills' },
  { code: 'SBIN0006789', branch: 'SBI — Pune FC Road' },
  { code: 'SBIN0007890', branch: 'SBI — Ahmedabad CG Road' },
  { code: 'SBIN0008901', branch: 'SBI — Jaipur MI Road' },
  { code: 'SBIN0009012', branch: 'SBI — Lucknow Hazratganj' },
] as const;

type IFSCEntry = (typeof DUMMY_IFSC_CODES)[number];

const STATEMENT_TYPES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/heic',
  'image/heif',
];
const STATEMENT_MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const STATEMENT_ACCEPTED_LABEL = 'PDF, JPG, JPEG, HEIC & PNG';
const STATEMENT_SIZE_ERR =
  'File size exceeds 5MB. Please upload PDF, JPG, JPEG, HEIC, PNG only.';
const STATEMENT_TYPE_ERR =
  'Unsupported file type. Please upload PDF, JPG, JPEG, HEIC, PNG only.';

// ── SVG Icons ─────────────────────────────────────────────────────────────────

function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 12H19" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 18" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 12L11 6" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="7" stroke="#280071" strokeWidth="1.2" />
      <path d="M8 7v4" stroke="#280071" strokeWidth="1.2" strokeLinecap="round" />
      <circle cx="8" cy="5" r="0.75" fill="#280071" />
    </svg>
  );
}

function EyeOpenIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M2.5 10C2.5 10 5 5 10 5C15 5 17.5 10 17.5 10C17.5 10 15 15 10 15C5 15 2.5 10 2.5 10Z" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="10" r="2.5" stroke="#666666" strokeWidth="1.2" />
    </svg>
  );
}

function EyeClosedIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 3L17 17" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8.23 5.1A7.5 7.5 0 0110 5c5 0 7.5 5 7.5 5a13.3 13.3 0 01-2.14 3.06M5.8 6.8A13.4 13.4 0 002.5 10s2.5 5 7.5 5a7.5 7.5 0 004.2-1.27" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" />
      <path d="M8.5 8.55A2.5 2.5 0 0111.5 11.5" stroke="#666666" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function AlertIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <circle cx="8" cy="8" r="7" stroke="#dc2626" strokeWidth="1.4" />
      <path d="M8 5v4" stroke="#dc2626" strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="8" cy="11" r="0.75" fill="#dc2626" />
    </svg>
  );
}

// ── IFSC Autocomplete ─────────────────────────────────────────────────────────

interface IFSCSelectProps {
  value: string;
  onChange: (code: string) => void;
}

function IFSCSelect({ value, onChange }: IFSCSelectProps) {
  const [inputText, setInputText] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
  const optionRefs = useRef<(HTMLLIElement | null)[]>([]);
  const dropdownRef = useRef<HTMLUListElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const uid = useId();

  // Sync display text when parent resets value externally
  useEffect(() => {
    setInputText(value);
  }, [value]);

  // Calculate dropdown position when opened
  useEffect(() => {
    if (isOpen && inputRef.current) {
      const rect = inputRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + 4,
        left: rect.left,
        width: rect.width,
      });
    }
  }, [isOpen]);

  // Update dropdown position on scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleScroll = () => {
      if (inputRef.current) {
        const rect = inputRef.current.getBoundingClientRect();
        setDropdownPos({
          top: rect.bottom + 4,
          left: rect.left,
          width: rect.width,
        });
      }
    };

    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, [isOpen]);

  const filtered = useMemo<IFSCEntry[]>(() => {
    const q = inputText.trim().toUpperCase();
    if (!q) return [...DUMMY_IFSC_CODES];
    return DUMMY_IFSC_CODES.filter(
      item => item.code.includes(q) || item.branch.toUpperCase().includes(q)
    );
  }, [inputText]);

  const handleSelect = (item: IFSCEntry) => {
    setInputText(item.code);
    onChange(item.code);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setInputText(raw);
    onChange(''); // clear committed value while typing
    setIsOpen(true);
    setActiveIndex(-1);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'Enter')) {
      setIsOpen(true);
      return;
    }
    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        setActiveIndex(prev => {
          const next = Math.min(prev + 1, filtered.length - 1);
          // Scroll the option into view within the dropdown container
          setTimeout(() => {
            optionRefs.current[next]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }, 0);
          return next;
        });
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        setActiveIndex(prev => {
          const p = Math.max(prev - 1, 0);
          setTimeout(() => {
            optionRefs.current[p]?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
          }, 0);
          return p;
        });
        break;
      }
      case 'Enter': {
        e.preventDefault();
        if (activeIndex >= 0 && filtered[activeIndex]) {
          handleSelect(filtered[activeIndex]);
        }
        break;
      }
      case 'Escape': {
        setIsOpen(false);
        setActiveIndex(-1);
        break;
      }
    }
  };

  const handleBlur = () => {
    // Delay so mousedown on option fires before blur resets state
    setTimeout(() => {
      setIsOpen(false);
      const exact = DUMMY_IFSC_CODES.find(c => c.code === inputText);
      if (exact) {
        onChange(exact.code); // auto-commit exact typed match
      } else if (!value) {
        setInputText('');     // revert to empty if nothing committed
      } else {
        setInputText(value);  // revert to last committed value
      }
    }, 160);
  };

  const listboxId = `${uid}-ifsc-listbox`;

  return (
    <div className={styles.ifscWrapper}>
      <input
        ref={inputRef}
        type="text"
        className={`${styles.input} ${styles.ifscInput}`}
        placeholder="Search IFSC or branch name"
        value={inputText}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        maxLength={11}
        role="combobox"
        aria-expanded={isOpen}
        aria-autocomplete="list"
        aria-controls={listboxId}
        aria-activedescendant={activeIndex >= 0 ? `${uid}-opt-${activeIndex}` : undefined}
        suppressHydrationWarning
      />
      <span className={styles.ifscChevron} aria-hidden="true">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
          <path d="M6 9l6 6 6-6" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>

      {isOpen && (
        <ul
          ref={dropdownRef}
          id={listboxId}
          className={styles.ifscDropdown}
          role="listbox"
          aria-label="IFSC suggestions"
          style={{
            top: `${dropdownPos.top}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
          }}
          onWheel={e => e.stopPropagation()}
          onTouchMove={e => e.stopPropagation()}
        >
          {filtered.length === 0 ? (
            <li className={styles.ifscNoResults} role="option" aria-selected={false}>
              No matching IFSC codes found
            </li>
          ) : (
            filtered.map((item, i) => (
              <li
                key={item.code}
                id={`${uid}-opt-${i}`}
                ref={el => { optionRefs.current[i] = el; }}
                className={`${styles.ifscOption}${i === activeIndex ? ` ${styles.ifscOptionActive}` : ''}`}
                role="option"
                aria-selected={i === activeIndex}
                onMouseDown={e => {
                  e.preventDefault(); // prevent blur before selection
                  handleSelect(item);
                }}
              >
                <span className={styles.ifscCode}>{item.code}</span>
                <span className={styles.ifscBranch}>{item.branch}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}

// ── Bank Section ──────────────────────────────────────────────────────────────

interface BankSectionErrors {
  accountMismatch: boolean;   // account no ≠ confirm account no
  duplicateAccount: boolean;  // same account no as the other section
}

interface BankSectionProps {
  title: string;
  accountNo: string;
  reAccountNo: string;
  ifsc: string;
  showAccount: boolean;
  errors: BankSectionErrors;
  onChange: (field: 'accountNo' | 'reAccountNo' | 'ifsc', value: string) => void;
  onToggleShow: () => void;
}

function BankSection({
  title,
  accountNo,
  reAccountNo,
  ifsc,
  showAccount,
  errors,
  onChange,
  onToggleShow,
}: BankSectionProps) {
  const selectedBranch = DUMMY_IFSC_CODES.find(c => c.code === ifsc);

  return (
    <div className={styles.bankSection}>
      <p className={styles.sectionTitle}>{title}</p>

      {/* Account No. — numeric only, with eye toggle */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Enter your Account No.</label>
        <div className={styles.inputCol}>
          <div className={styles.inputWrapper}>
            <input
              type={showAccount ? 'text' : 'password'}
              inputMode="numeric"
              className={`${styles.input} ${styles.withEye}${errors.duplicateAccount ? ` ${styles.inputError}` : ''}`}
              placeholder="e.g. 00112233445566"
              value={accountNo}
              onChange={e => onChange('accountNo', e.target.value.replace(/[^0-9]/g, ''))}
              maxLength={20}
              aria-invalid={errors.duplicateAccount}
              suppressHydrationWarning
            />
            <button
              type="button"
              className={styles.eyeBtn}
              onClick={onToggleShow}
              aria-label={showAccount ? 'Hide account number' : 'Show account number'}
              suppressHydrationWarning
            >
              {showAccount ? <EyeOpenIcon /> : <EyeClosedIcon />}
            </button>
          </div>
          {errors.duplicateAccount && (
            <p className={styles.fieldError} role="alert">
              <AlertIcon />
              NRO and NRE account numbers must be different.
            </p>
          )}
        </div>
      </div>

      {/* Re-enter Account No. — no paste, numeric only */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Re-enter your Account No.</label>
        <div className={styles.inputCol}>
          <div className={styles.inputWrapper}>
            <input
              type="text"
              inputMode="numeric"
              className={`${styles.input}${errors.accountMismatch ? ` ${styles.inputError}` : ''}`}
              placeholder="e.g. 00112233445566"
              value={reAccountNo}
              onChange={e => onChange('reAccountNo', e.target.value.replace(/[^0-9]/g, ''))}
              onPaste={e => e.preventDefault()}
              maxLength={20}
              aria-invalid={errors.accountMismatch}
              suppressHydrationWarning
            />
          </div>
          {errors.accountMismatch && (
            <p className={styles.fieldError} role="alert">
              <AlertIcon />
              Account numbers do not match.
            </p>
          )}
        </div>
      </div>

      {/* IFSC Code — searchable autocomplete dropdown */}
      <div className={styles.fieldGroup}>
        <label className={styles.fieldLabel}>Enter IFSC Code</label>
        <div className={styles.inputCol}>
          <IFSCSelect value={ifsc} onChange={v => onChange('ifsc', v)} />
        </div>
      </div>

      {/* Branch address box — updates when IFSC is selected */}
      <div className={styles.addressBox}>
        <p className={styles.addressText}>
          {selectedBranch
            ? selectedBranch.branch
            : 'Select an IFSC code above to see branch details'}
        </p>
      </div>
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function ManualBankDetails() {
  const router = useRouter();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  // Modal state
  const [showModal, setShowModal] = useState(false);
  const modalTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => { if (modalTimerRef.current) clearTimeout(modalTimerRef.current); };
  }, []);

  // File upload state
  const [nroStatementFiles, setNroStatementFiles] = useState<UploadedFile[]>([]);
  const [nreStatementFiles, setNreStatementFiles] = useState<UploadedFile[]>([]);

  // NRO field state
  const [nroAccountNo, setNroAccountNo] = useState('');
  const [nroReAccountNo, setNroReAccountNo] = useState('');
  const [nroIfsc, setNroIfsc] = useState('');
  const [nroShowAccount, setNroShowAccount] = useState(false);

  // NRE field state
  const [nreAccountNo, setNreAccountNo] = useState('');
  const [nreReAccountNo, setNreReAccountNo] = useState('');
  const [nreIfsc, setNreIfsc] = useState('');
  const [nreShowAccount, setNreShowAccount] = useState(false);

  useEffect(() => {
    navigationService.setRouter(router, hideSpinner);
  }, []);

  const goBack = () => {
    showSpinner();
    setTimeout(() => { router.back(); hideSpinner(); }, 200);
  };

  const handleProceed = () => {
    setShowModal(true);
    modalTimerRef.current = setTimeout(() => {
      setShowModal(false);
      showSpinner();
      setTimeout(() => { router.push('/manualBankInfo'); hideSpinner(); }, 200);
    }, 2500);
  };

  const handleNroChange = (field: 'accountNo' | 'reAccountNo' | 'ifsc', value: string) => {
    if (field === 'accountNo') setNroAccountNo(value);
    else if (field === 'reAccountNo') setNroReAccountNo(value);
    else setNroIfsc(value);
  };

  const handleNreChange = (field: 'accountNo' | 'reAccountNo' | 'ifsc', value: string) => {
    if (field === 'accountNo') setNreAccountNo(value);
    else if (field === 'reAccountNo') setNreReAccountNo(value);
    else setNreIfsc(value);
  };

  // ── Inline error visibility (show only after user has typed something) ──────
  const nroAccountMismatch = nroReAccountNo.length > 0 && nroAccountNo !== nroReAccountNo;
  const nreAccountMismatch = nreReAccountNo.length > 0 && nreAccountNo !== nreReAccountNo;
  // Both accounts must differ from each other (show on both sections)
  const accountsAreDuplicate =
    nroAccountNo.length > 0 && nreAccountNo.length > 0 && nroAccountNo === nreAccountNo;

  // ── File upload validation ────────────────────────────────────────────────
  const nroFileUploaded = nroStatementFiles.some(f => f.status === 'success');
  const nreFileUploaded = nreStatementFiles.some(f => f.status === 'success');

  // ── Proceed gate — ALL conditions must be satisfied ───────────────────────
  const isDisabled =
    !nroAccountNo ||
    !nroReAccountNo ||
    !nroIfsc ||
    !nreAccountNo ||
    !nreReAccountNo ||
    !nreIfsc ||
    nroAccountNo !== nroReAccountNo ||   // NRO: account must match confirm
    nreAccountNo !== nreReAccountNo ||   // NRE: account must match confirm
    nroAccountNo === nreAccountNo ||     // NRO and NRE account numbers must differ
    !nroFileUploaded ||                  // NRO statement required
    !nreFileUploaded;                    // NRE statement required

  // ── Shared JSX fragments ──────────────────────────────────────────────────

  const uploadStatementsSection = (
    <div className={styles.uploadGrid}>
      <FileUploadCard
        title="Upload NRO Statement"
        acceptedTypes={STATEMENT_TYPES}
        maxSize={STATEMENT_MAX_SIZE}
        acceptedLabel={STATEMENT_ACCEPTED_LABEL}
        sizeErrorMessage={STATEMENT_SIZE_ERR}
        typeErrorMessage={STATEMENT_TYPE_ERR}
        cropImages
        onFilesChange={setNroStatementFiles}
      />
      <FileUploadCard
        title="Upload Non PIS NRE Statement"
        acceptedTypes={STATEMENT_TYPES}
        maxSize={STATEMENT_MAX_SIZE}
        acceptedLabel={STATEMENT_ACCEPTED_LABEL}
        sizeErrorMessage={STATEMENT_SIZE_ERR}
        typeErrorMessage={STATEMENT_TYPE_ERR}
        cropImages
        onFilesChange={setNreStatementFiles}
      />
    </div>
  );

  const nroSection = (
    <BankSection
      title="Enter NRO (Savings Account) details"
      accountNo={nroAccountNo}
      reAccountNo={nroReAccountNo}
      ifsc={nroIfsc}
      showAccount={nroShowAccount}
      errors={{ accountMismatch: nroAccountMismatch, duplicateAccount: accountsAreDuplicate }}
      onChange={handleNroChange}
      onToggleShow={() => setNroShowAccount(v => !v)}
    />
  );

  const nreSection = (
    <BankSection
      title="Enter Non PIS NRE (Savings Account) details"
      accountNo={nreAccountNo}
      reAccountNo={nreReAccountNo}
      ifsc={nreIfsc}
      showAccount={nreShowAccount}
      errors={{ accountMismatch: nreAccountMismatch, duplicateAccount: accountsAreDuplicate }}
      onChange={handleNreChange}
      onToggleShow={() => setNreShowAccount(v => !v)}
    />
  );

  // #sym:bankBanner
  // const bankBanner = (
  //   <div className={styles.bankBanner}>
  //     <InfoIcon />
  //     <span className={styles.bankBannerText}>State Bank of India</span>
  //   </div>
  // );

  const needHelpBtn = (
    <button type="button" className={styles.needHelpBtn} suppressHydrationWarning>
      Need Help?
    </button>
  );

  return (
    <>
      {/* ── MOBILE (< 768px) ─────────────────────────────────────────────────── */}
      <section aria-label="Add Bank Details Manually" className={styles.mobilePage} suppressHydrationWarning>
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderTop}>
            <button type="button" className={styles.mobileBackBtn} onClick={goBack} aria-label="Go back" suppressHydrationWarning>
              <BackArrow />
            </button>
            {needHelpBtn}
          </div>
          <div className={styles.mobileTitleBlock}>
            <h1 className={styles.mobileTitle}>Add your bank details manually</h1>
            <p className={styles.mobileSubtitle}>Enter bank account number and IFSC for bank verification</p>
          </div>
        </div>

        <div className={styles.mobileCard}>
          {/* {bankBanner} */}
          {uploadStatementsSection}
          {nroSection}
          {nreSection}
        </div>

        <div className={styles.mobileProceedArea}>
          <button
            type="button"
            className={`${styles.mobileProceedBtn}${isDisabled ? ` ${styles.btnDisabled}` : ''}`}
            onClick={handleProceed}
            disabled={isDisabled}
            suppressHydrationWarning
          >
            Proceed
          </button>
        </div>
      </section>

      {/* ── DESKTOP (≥ 768px) ────────────────────────────────────────────────── */}
      <section aria-label="Add Bank Details Manually" className={styles.desktopPage} suppressHydrationWarning>
        <div className={styles.desktopCard}>
          <div className={styles.desktopCardHeader}>
            <button type="button" className={styles.desktopBackBtn} onClick={goBack} aria-label="Go back" suppressHydrationWarning>
              <BackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              <div className={styles.desktopTitleRow}>
                <h1 className={styles.desktopCardTitle}>Add your bank details manually</h1>
                {needHelpBtn}
              </div>
              <p className={styles.desktopCardSubtitle}>
                Enter bank account number and IFSC for bank verification
              </p>
            </div>
          </div>

          <div className={styles.desktopCardBody}>
            <div className={styles.desktopScrollArea}>
              {/* {bankBanner} */}
              {uploadStatementsSection}
              {nroSection}
              {nreSection}
            </div>

            <div className={styles.desktopProceedWrapper}>
              <button
                type="button"
                className={`${styles.desktopProceedBtn}${isDisabled ? ` ${styles.btnDisabled}` : ''}`}
                onClick={handleProceed}
                disabled={isDisabled}
                suppressHydrationWarning
              >
                Proceed
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ── Verifying Details Modal ──────────────────────────────────────── */}
      {showModal && (
        <div
          className={styles.modalOverlay}
          role="dialog"
          aria-modal="true"
          aria-labelledby="verify-modal-title"
        >
          <div className={styles.modalCard}>
            {/* Dash handle — visible on mobile only */}
            <div className={styles.modalDash} aria-hidden="true" />

            {/* Shared content */}
            <div className={styles.modalContent}>
              <Image
                src="/verifying-animation.gif"
                alt=""
                width={300}
                height={75}
                unoptimized
                className={styles.modalAnimation}
                aria-hidden="true"
              />
              <p id="verify-modal-title" className={styles.modalTitle}>
                Verifying details
              </p>
              <p className={styles.modalSubtitle}>
                This usually takes less than a minute.
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
