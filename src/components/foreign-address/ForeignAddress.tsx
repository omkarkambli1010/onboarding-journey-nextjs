'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from './foreign-address.module.scss';

// ForeignAddress — Enter Foreign Address form
// Figma: Onboarding-Mob-Foreignaddress (0:42951)
//        Onboarding-Web-Foreignaddress (0:43062)
// Route: /foreignAddress

// ── Figma assets ──────────────────────────────────────────────────────────
const ASSET_CALENDAR_MOB  = 'https://www.figma.com/api/mcp/asset/cf9972a9-6e44-4347-bee7-5ed571772c8c';
const ASSET_CALENDAR_DESK = 'https://www.figma.com/api/mcp/asset/bf48d4f4-619c-4d00-87ae-316c0c1946d1';
const ASSET_INFO_MOB      = 'https://www.figma.com/api/mcp/asset/9195c08d-d43f-4164-8dab-81ee8207af07';
const ASSET_INFO_DESK     = 'https://www.figma.com/api/mcp/asset/65e32e0e-acc6-4215-bf61-222139146838';
const ASSET_BACK_DESK     = 'https://www.figma.com/api/mcp/asset/3969d807-3118-439a-b579-6dd809493ef6';

const DOCUMENT_TYPES = ['Passport', 'OCI Card', 'PIO Card', 'Visa', 'Work Permit', 'Resident Permit'];
const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia',
  'Singapore', 'United Arab Emirates', 'Germany', 'France',
  'Japan', 'New Zealand', 'Switzerland', 'Netherlands',
  'Bahrain', 'Kuwait', 'Qatar', 'Saudi Arabia',
];

function CaretDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4 6l4 4 4-4" stroke="#999" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export default function ForeignAddress() {
  const router = useRouter();

  const [docType, setDocType]         = useState('');
  const [docNumber, setDocNumber]     = useState('');
  const [expiryDate, setExpiryDate]   = useState('');
  const [selCountry, setSelCountry]   = useState('');
  const [addrLine1, setAddrLine1]     = useState('');
  const [addrLine2, setAddrLine2]     = useState('');
  const [addrLine3, setAddrLine3]     = useState('');
  const [city, setCity]               = useState('');
  const [addrState, setAddrState]     = useState('');
  const [addrCountry, setAddrCountry] = useState('');
  const [pincode, setPincode]         = useState('');

  // Button label reflects selected document type — always enabled
  const btnLabel = `Upload '${docType || 'Select'}' Front`;

  // Always navigate — no validation gating
  const handleProceed = () => router.push('/oci/front');

  // ── MOBILE ────────────────────────────────────────────────────────────────
  const mobileLayout = (
    <div className={styles.mobilePage}>

      {/* Gray header */}
      <div className={styles.mobileHeader}>
        <div className={styles.mobileHeaderInner}>
          <button
            type="button"
            className={styles.mobileBackBtn}
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" stroke="#2b2b2b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div className={styles.mobileTitleBlock}>
            <h1 className={styles.mobileTitle}>Enter Foreign Address</h1>
            <p className={styles.mobileSubtitle}>
              Enter your details manually and upload any document (front and back) for verification.
            </p>
          </div>
        </div>
      </div>

      {/* White card form */}
      <div className={styles.mobileCard}>

        {/* Document Type */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-doc-type">Document Type</label>
          <div className={styles.fieldSelectWrap}>
            <select
              id="mob-doc-type"
              className={styles.fieldSelect}
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
            >
              <option value="" disabled>Select</option>
              {DOCUMENT_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
            <span className={styles.fieldSelectCaret}><CaretDown /></span>
          </div>
        </div>

        {/* Document Number */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-doc-number">Document Number</label>
          <input
            id="mob-doc-number"
            type="text"
            className={styles.fieldInput}
            placeholder="Enter number"
            value={docNumber}
            onChange={(e) => setDocNumber(e.target.value)}
          />
        </div>

        {/* Document Expiry Date */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-expiry">Document Expiry Date</label>
          <div className={styles.fieldCalendarWrap}>
            <input
              id="mob-expiry"
              type="date"
              className={styles.fieldCalendarInput}
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
            <span className={styles.fieldCalendarIcon}>
              <img src={ASSET_CALENDAR_MOB} alt="" aria-hidden="true" width={24} height={24} />
            </span>
          </div>
        </div>

        {/* Select Country */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-sel-country">Select Country</label>
          <div className={styles.fieldSelectWrap}>
            <select
              id="mob-sel-country"
              className={styles.fieldSelect}
              value={selCountry}
              onChange={(e) => setSelCountry(e.target.value)}
            >
              <option value="" disabled>Select</option>
              {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <span className={styles.fieldSelectCaret}><CaretDown /></span>
          </div>
        </div>

        {/* Address Line 1 */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-addr1">Address Line 1</label>
          <input
            id="mob-addr1"
            type="text"
            className={styles.fieldInput}
            placeholder="Enter address line 1"
            value={addrLine1}
            onChange={(e) => setAddrLine1(e.target.value)}
          />
        </div>

        {/* Address Line 2 */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-addr2">Address Line 2</label>
          <input
            id="mob-addr2"
            type="text"
            className={styles.fieldInput}
            placeholder="Enter address line 2"
            value={addrLine2}
            onChange={(e) => setAddrLine2(e.target.value)}
          />
        </div>

        {/* Address Line 3 */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-addr3">Address Line 3</label>
          <input
            id="mob-addr3"
            type="text"
            className={styles.fieldInput}
            placeholder="Enter address line 3"
            value={addrLine3}
            onChange={(e) => setAddrLine3(e.target.value)}
          />
        </div>

        {/* City + State — side by side, gap-24 */}
        <div className={styles.mobileRowGroup}>
          <div className={styles.mobileRowField}>
            <label className={styles.fieldLabel} htmlFor="mob-city">City</label>
            <input
              id="mob-city"
              type="text"
              className={styles.fieldInput}
              placeholder="Enter City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>
          <div className={styles.mobileRowField}>
            <label className={styles.fieldLabel} htmlFor="mob-state">State</label>
            <input
              id="mob-state"
              type="text"
              className={styles.fieldInput}
              placeholder="Enter State"
              value={addrState}
              onChange={(e) => setAddrState(e.target.value)}
            />
          </div>
        </div>

        {/* Country */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-addr-country">Country</label>
          <input
            id="mob-addr-country"
            type="text"
            className={styles.fieldInput}
            placeholder="Enter country"
            value={addrCountry}
            onChange={(e) => setAddrCountry(e.target.value)}
          />
        </div>

        {/* Pincode + hint */}
        <div className={styles.fieldGroup}>
          <label className={styles.fieldLabel} htmlFor="mob-pincode">Pincode</label>
          <input
            id="mob-pincode"
            type="text"
            inputMode="numeric"
            maxLength={10}
            className={styles.fieldInput}
            placeholder="Enter pincode"
            value={pincode}
            onChange={(e) => setPincode(e.target.value)}
          />
          <div className={styles.pincodeHint}>
            <img src={ASSET_INFO_MOB} alt="" aria-hidden="true" width={20} height={20} />
            <p className={styles.pincodeHintText}>
              In absence of PIN for foreign address, Enter pincode as &apos;111111&apos;.
            </p>
          </div>
        </div>

      </div>

      {/* Fixed bottom — always enabled */}
      <div className={styles.mobileProceedArea}>
        <button
          type="button"
          className={styles.mobileProceedBtn}
          onClick={handleProceed}
        >
          {btnLabel}
        </button>
      </div>
    </div>
  );

  // ── DESKTOP ───────────────────────────────────────────────────────────────
  const desktopLayout = (
    <div className={styles.desktopPage}>
      <div className={styles.desktopCard}>

        {/* Header */}
        <div className={styles.desktopCardHeader}>
          <button
            type="button"
            className={styles.desktopBackBtn}
            onClick={() => router.back()}
            aria-label="Go back"
          >
            <img src={ASSET_BACK_DESK} alt="" aria-hidden="true" width={24} height={24} />
          </button>
          <div className={styles.desktopTitleBlock}>
            <h1 className={styles.desktopCardTitle}>Enter Foreign Address</h1>
            <p className={styles.desktopCardSubtitle}>
              Enter your details manually and upload any document (front and back) for verification.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className={styles.desktopCardBody}>
          <div className={styles.desktopFormArea}>

            {/* Document Type */}
            <div className={styles.desktopFieldRow}>
              <p className={styles.desktopLabel}>Document Type</p>
              <div className={styles.desktopSelectWrap}>
                <select
                  className={styles.deskSelect}
                  value={docType}
                  onChange={(e) => setDocType(e.target.value)}
                  aria-label="Document Type"
                >
                  <option value="" disabled>Select</option>
                  {DOCUMENT_TYPES.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
                <span className={styles.deskSelectCaret}><CaretDown /></span>
              </div>
            </div>

            {/* Document Number */}
            <div className={styles.desktopFieldRow}>
              <p className={styles.desktopLabel}>Document Number</p>
              <input
                type="text"
                className={`${styles.deskInput} ${styles.desktopInputSingle}`}
                placeholder="Enter number"
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value)}
                aria-label="Document Number"
              />
            </div>

            {/* Document Expiry Date */}
            <div className={styles.desktopFieldRow}>
              <p className={styles.desktopLabel}>Document Expiry Date</p>
              <div className={styles.deskCalendarWrap}>
                <input
                  type="date"
                  className={styles.deskCalendarInput}
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  aria-label="Document Expiry Date"
                />
                <span className={styles.deskCalendarIcon}>
                  <img src={ASSET_CALENDAR_DESK} alt="" aria-hidden="true" width={24} height={24} />
                </span>
              </div>
            </div>

            {/* Select Country */}
            <div className={styles.desktopFieldRow}>
              <p className={styles.desktopLabel}>Select Country</p>
              <div className={styles.desktopSelectWrap}>
                <select
                  className={styles.deskSelect}
                  value={selCountry}
                  onChange={(e) => setSelCountry(e.target.value)}
                  aria-label="Select Country"
                >
                  <option value="" disabled>Select</option>
                  {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className={styles.deskSelectCaret}><CaretDown /></span>
              </div>
            </div>

            {/* Address — Line 1 + Line 2 inline */}
            <div className={styles.desktopFieldRow}>
              <p className={styles.desktopLabel}>Address</p>
              <div className={styles.desktopInputPair}>
                <input
                  type="text"
                  className={`${styles.deskInput} ${styles.desktopInputHalf}`}
                  placeholder="Enter address line 1"
                  value={addrLine1}
                  onChange={(e) => setAddrLine1(e.target.value)}
                  aria-label="Address Line 1"
                />
                <input
                  type="text"
                  className={`${styles.deskInput} ${styles.desktopInputHalf}`}
                  placeholder="Enter address line 2"
                  value={addrLine2}
                  onChange={(e) => setAddrLine2(e.target.value)}
                  aria-label="Address Line 2"
                />
              </div>
            </div>

            {/* Address Line 3 — offset, no label */}
            <div className={styles.desktopAddrLine3Row}>
              <input
                type="text"
                className={`${styles.deskInput} ${styles.desktopInputSingle}`}
                placeholder="Address line 3"
                value={addrLine3}
                onChange={(e) => setAddrLine3(e.target.value)}
                aria-label="Address Line 3"
              />
            </div>

            {/* City & State — inline */}
            <div className={styles.desktopFieldRow}>
              <p className={styles.desktopLabel}>City &amp; State</p>
              <div className={styles.desktopInputPair}>
                <input
                  type="text"
                  className={`${styles.deskInput} ${styles.desktopInputHalf}`}
                  placeholder="Enter city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  aria-label="City"
                />
                <input
                  type="text"
                  className={`${styles.deskInput} ${styles.desktopInputHalf}`}
                  placeholder="Enter state"
                  value={addrState}
                  onChange={(e) => setAddrState(e.target.value)}
                  aria-label="State"
                />
              </div>
            </div>

            {/* Country */}
            <div className={styles.desktopFieldRow}>
              <p className={styles.desktopLabel}>Country</p>
              <input
                type="text"
                className={`${styles.deskInput} ${styles.desktopInputSingle}`}
                placeholder="Enter country"
                value={addrCountry}
                onChange={(e) => setAddrCountry(e.target.value)}
                aria-label="Country"
              />
            </div>

            {/* Pincode + hint */}
            <div className={styles.fieldGroup}>
              <div className={styles.desktopFieldRow}>
                <p className={styles.desktopLabel}>Pincode</p>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={10}
                  className={`${styles.deskInput} ${styles.desktopInputSingle}`}
                  placeholder="Enter pincode"
                  value={pincode}
                  onChange={(e) => setPincode(e.target.value)}
                  aria-label="Pincode"
                />
              </div>
              <div className={styles.desktopPincodeHint}>
                <img src={ASSET_INFO_DESK} alt="" aria-hidden="true" width={20} height={20} />
                <p className={styles.desktopPincodeHintText}>
                  In absence of PIN for foreign address, Enter pincode as &apos;111111&apos;.
                </p>
              </div>
            </div>

          </div>

          {/* Proceed — always enabled */}
          <div className={styles.desktopProceedWrapper}>
            <button
              type="button"
              className={styles.desktopProceedBtn}
              onClick={handleProceed}
            >
              {btnLabel}
            </button>
          </div>
        </div>

      </div>
    </div>
  );

  return (
    <>
      {mobileLayout}
      {desktopLayout}
    </>
  );
}
