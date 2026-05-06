'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './link-bank-account.module.scss';

// LinkBankAccount — step 6: Select Bank Account Type ("Bank Details")
// Figma: Onboarding-Web-Permanentaddress-Aadhaar (0:22846) — desktop
//        Onboarding-Mob-Permanentaddress-Aadhaar (0:23063) — mobile
// Route: /personalDetailsForm/6

const ASSET_CHECK_ICON = 'https://www.figma.com/api/mcp/asset/a29b0ec8-33dd-4545-95e9-e78a45281469';

const ACCOUNT_TYPES = [
  { id: 'nro', label: 'NRO (Savings Account)' },
  { id: 'nre', label: 'Non PIS NRE (Savings Account)' },
];

function BackArrow() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M19 12H5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 19L5 12L12 5" stroke="#2B2B2B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckboxOption({
  label,
  checked,
  onToggle,
}: {
  label: string;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <div className={styles.checkboxItem}>
      <button
        type="button"
        className={styles.checkboxBtn}
        onClick={onToggle}
        aria-pressed={checked}
        aria-label={label}
      >
        <div className={`${styles.checkboxBox}${checked ? ` ${styles.checkboxBoxChecked}` : ''}`}>
          {checked && (
            <img src={ASSET_CHECK_ICON} alt="" aria-hidden="true" className={styles.checkIcon} />
          )}
        </div>
      </button>
      <span className={`${styles.checkboxLabel}${checked ? ` ${styles.checkboxLabelChecked}` : ''}`}>
        {label}
      </span>
    </div>
  );
}

export default function LinkBankAccount() {
  const router = useRouter();
  // Both pre-selected to match Figma default state
  const [selected, setSelected] = useState<string[]>(['nro', 'nre']);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleBack = () => router.push('/personalDetailsForm/5');
  const handleProceed = () => router.push('/PennyDrop/1');

  const isDisabled = selected.length === 0;

  return (
    <>
      {/* ═══ MOBILE ════════════════════════════════════════════════════════════
          Figma: 0:23063 — Onboarding-Mob-Permanentaddress-Aadhaar (360 × 800)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.mobilePage} aria-label="Bank Details">

        {/* Gray header */}
        <div className={styles.mobileHeader}>
          <div className={styles.mobileHeaderInner}>
            <button
              type="button"
              className={styles.mobileBackBtn}
              onClick={handleBack}
              aria-label="Go back"
            >
              <BackArrow />
            </button>
            <div className={styles.mobileTitleBlock}>
              {/* Figma: 16px SemiBold #2b2b2b */}
              <h1 className={styles.mobileTitle}>Bank Details</h1>
              {/* Figma: 12px Regular #2b2b2b */}
              <p className={styles.mobileSubtitle}>
                Make your fund transfer easy by just verifying your account!
              </p>
            </div>
          </div>
        </div>

        {/* White scrollable card */}
        {/* Figma: bg white, border-top-radius 24px, shadow, p-24, gap-16 */}
        <div className={styles.mobileCard}>
          {/* Figma: 14px Regular #666, line-height 20px */}
          <p className={styles.sectionLabel}>Select Bank Account Type</p>
          {/* Figma: flex-col, gap-16 */}
          <div className={styles.checkboxGroup}>
            {ACCOUNT_TYPES.map(({ id, label }) => (
              <CheckboxOption
                key={id}
                label={label}
                checked={selected.includes(id)}
                onToggle={() => toggle(id)}
              />
            ))}
          </div>
        </div>

        {/* Fixed bottom button */}
        {/* Figma: pb-16, w-328, h-48, bg #280071, 16px SemiBold white, rounded-8 */}
        <div className={styles.mobileProceedArea}>
          <button
            type="button"
            className={`${styles.mobileProceedBtn}${isDisabled ? ` ${styles.btnDisabled}` : ''}`}
            onClick={handleProceed}
            disabled={isDisabled}
          >
            Proceed
          </button>
        </div>

      </div>

      {/* ═══ DESKTOP ═══════════════════════════════════════════════════════════
          Figma: 0:22846 — Onboarding-Web-Permanentaddress-Aadhaar (1440 × 1024)
      ═══════════════════════════════════════════════════════════════════════ */}
      <div className={styles.desktopPage} aria-label="Bank Details">
        {/* Figma: w-800, rounded-24, border #d9d9d9, shadow, centered */}
        <div className={styles.desktopCard}>

          {/* Card header */}
          {/* Figma: p-24, flex, gap-8, border-bottom 0.5px #d9d9d9 */}
          <div className={styles.desktopCardHeader}>
            <button
              type="button"
              className={styles.desktopBackBtn}
              onClick={handleBack}
              aria-label="Go back"
            >
              <BackArrow />
            </button>
            <div className={styles.desktopTitleBlock}>
              {/* Figma: 18px SemiBold #222 */}
              <h1 className={styles.desktopCardTitle}>Bank Details</h1>
              {/* Figma: 14px Regular #666 */}
              <p className={styles.desktopCardSubtitle}>
                Make your fund transfer easy by just verifying your account!
              </p>
            </div>
          </div>

          {/* Card body */}
          {/* Figma: p-24, flex col, justify-between, h-581 */}
          <div className={styles.desktopCardBody}>
            <div className={styles.desktopContentArea}>
              {/* Figma: 14px Regular #666, line-height 20px */}
              <p className={styles.sectionLabel}>Select Bank Account Type</p>
              {/* Figma: flex-row, gap-16 */}
              <div className={styles.checkboxGroup}>
                {ACCOUNT_TYPES.map(({ id, label }) => (
                  <CheckboxOption
                    key={id}
                    label={label}
                    checked={selected.includes(id)}
                    onToggle={() => toggle(id)}
                  />
                ))}
              </div>
            </div>

            {/* Figma: centered, w-350, h-56, bg #280071, 16px SemiBold white, rounded-8 */}
            <div className={styles.desktopProceedWrapper}>
              <button
                type="button"
                className={`${styles.desktopProceedBtn}${isDisabled ? ` ${styles.btnDisabled}` : ''}`}
                onClick={handleProceed}
                disabled={isDisabled}
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
