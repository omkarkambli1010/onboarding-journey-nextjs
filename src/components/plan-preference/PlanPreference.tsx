'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styles from './plan-preference.module.scss';

// ─── Static Plan Data ──────────────────────────────────────────

const PLAN_NAMES = ['Basic', 'Special', 'Premium'];

const PLAN_ICONS = [
  '/assets/plan-icons/plan-icon-basic.svg',
  '/assets/plan-icons/plan-icon-special.svg',
  '/assets/plan-icons/plan-icon-premium.svg',
];

type BenefitKind = 'solid' | 'carry' | 'open';

const PLAN_STATIC = [
  {
    desktopPrice: '0',
    priceGst: 'Excl. GST',
    feeLabel: 'Account Opening Fees',
    brokerageMain: '₹20',
    brokerageNote: '*On Equity Intraday Trades',
    highlighted: false,
    mobilePriceGst: '',
    innerGap: 45,
    actionsGap: 12,
    benefits: [
      { type: 'solid' as BenefitKind, text: '0.50% on Delivery Trade' },
      { type: 'solid' as BenefitKind, text: '₹50/Lot on Options' },
      { type: 'open' as BenefitKind, text: '0.50% on E-Margin', sub: '*0% interest for 23 trading days' },
    ],
    equity: [
      { val: '₹20/order', lbl: 'on Intraday' },
      { val: '0.50%', lbl: 'on Delivery' },
      { val: '₹20/order', lbl: 'on ETF' },
      { val: '0.50%', lbl: 'on E-Margin' },
    ],
    derivatives: [
      { val: '₹20/order', lbl: 'on Intraday' },
      { val: '₹50/Lot', lbl: 'on Options' },
      { val: '0.05%', lbl: 'on Futures' },
    ],
  },
  {
    desktopPrice: '99',
    priceGst: 'Excl. GST',
    feeLabel: 'One-time Account Opening Fees',
    brokerageMain: 'Zero',
    brokerageNote: '*On all Intraday Trades',
    highlighted: true,
    mobilePriceGst: '+ GST',
    innerGap: 42,
    actionsGap: 16,
    benefits: [
      { type: 'solid' as BenefitKind, text: '0.20% on Equity Delivery' },
      { type: 'carry' as BenefitKind, text: '₹20/Order on Carry Forward Options' },
      { type: 'open' as BenefitKind, text: '0.50% on E-Margin', sub: '*0% interest for 23 trading days' },
    ],
    equity: [
      { val: '₹0', lbl: 'on Intraday' },
      { val: '0.20%', lbl: 'on Delivery' },
      { val: '₹0', lbl: 'on ETF' },
      { val: '0.50%', lbl: 'on E-Margin' },
    ],
    derivatives: [
      { val: '₹0', lbl: 'on Intraday' },
      { val: '₹20/order', lbl: 'on Options' },
      { val: '₹20/order', lbl: 'on Futures' },
    ],
  },
  {
    desktopPrice: '10,000',
    priceGst: 'Excl. GST',
    feeLabel: 'One-time Account Opening Fees',
    brokerageMain: 'Zero',
    brokerageNote: '*Till 75 Lacs Delivery Trade Value',
    highlighted: false,
    mobilePriceGst: '+ GST',
    innerGap: 24,
    actionsGap: 12,
    benefits: [
      { type: 'solid' as BenefitKind, text: '₹20 on Equity Intraday' },
      { type: 'solid' as BenefitKind, text: '0.20% on Equity Delivery' },
      { type: 'carry' as BenefitKind, text: '₹20/Order on Carry Forward Options' },
      { type: 'open' as BenefitKind, text: '0.40% on E-Margin', sub: '*0% interest for 23 trading days' },
    ],
    equity: [
      { val: '₹20/order', lbl: 'on Intraday' },
      { val: '0.10%', lbl: 'on Delivery*' },
      { val: '₹0', lbl: 'on ETF' },
      { val: '0.40%', lbl: 'on E-Margin' },
    ],
    derivatives: [
      { val: '₹20/order', lbl: 'on Intraday' },
      { val: '₹20/order', lbl: 'on Options' },
      { val: '₹20/order', lbl: 'on Futures' },
    ],
  },
];

// ─── Inline SVG Icons ─────────────────────────────────────────

const BackArrow = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M5 12H19" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12L11 18" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M5 12L11 6" stroke="black" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


const PdfIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="1" width="9" height="12" rx="1" stroke="#280071" strokeWidth="1.2" />
    <path d="M9 1v4h4" stroke="#280071" strokeWidth="1.2" strokeLinejoin="round" />
    <path d="M9 1l4 4" stroke="#280071" strokeWidth="1.2" strokeLinecap="round" />
    <path d="M5 7.5h6M5 9.5h4" stroke="#280071" strokeWidth="1.1" strokeLinecap="round" />
  </svg>
);


const ModalDoneIcon = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="10" cy="10" r="9.5" stroke="#280071" strokeOpacity="0.3" />
    <path d="M6 10.5l3 3 5-6" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);


// ─── Desktop benefit item (Figma 0-49002) ─────────────────────

function DesktopBenefitItem({ type, text, sub }: { type: BenefitKind; text: string; sub?: string }) {
  if (type === 'carry') {
    return (
      <div className={styles.dBenefitCarry}>
        <img src="/assets/plan-icons/done-carry.svg" alt="" className={styles.dBenefitCarryIcon} width={12} height={12} />
        <div className={styles.dBenefitCarryText}>
          <p>{'₹20/Order on Carry Forward '}</p>
          <p>Options</p>
        </div>
      </div>
    );
  }
  if (type === 'open') {
    return (
      <div className={`${styles.dBenefitItem} ${styles.dBenefitItemTop}`}>
        <div className={styles.dBenefitOpenWrap}>
          <img src="/assets/plan-icons/done-open.svg" alt="" width={10} height={10} />
        </div>
        <div className={styles.dBenefitTextMulti}>
          <span>{text}</span>
          {sub && <span className={styles.dBenefitSub}>{sub}</span>}
        </div>
      </div>
    );
  }
  return (
    <div className={styles.dBenefitItem}>
      <div className={styles.dBenefitIconWrap}>
        <img src="/assets/plan-icons/done-solid.svg" alt="" width={12} height={12} />
      </div>
      <span className={styles.dBenefitText}>{text}</span>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────

export default function PlanPreference() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(1);
  const [showKnowMore, setShowKnowMore] = useState(false);

  useEffect(() => {
    const stored = sessionStorage.getItem('selectedPlan');
    if (stored !== null) setSelectedIndex(parseInt(stored, 10));
  }, []);
  const [knowMoreIndex, setKnowMoreIndex] = useState(0);

  const middleIndex = Math.floor(PLAN_STATIC.length / 2);

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  const proceedWithPlan = (idx?: number) => {
    const finalIdx = idx ?? selectedIndex ?? 1;
    sessionStorage.setItem('selectedPlan', String(finalIdx));
    router.push('/planprocess/3');
  };

  const backToDeclaration = () => {
    router.push('/planprocess/1');
  };

  const openKnowMore = (index: number) => {
    setKnowMoreIndex(index);
    setShowKnowMore(true);
  };

  const kmStat = PLAN_STATIC[knowMoreIndex];
  const kmName = PLAN_NAMES[knowMoreIndex];

  return (
    <>
      {/* ─── Mobile ────────────────────────────────────────── */}
      <main className={styles.mobilePage}>
        <div className={styles.mobileHeader}>
          {rejectStatus !== 'R' && (
            <button className={styles.mobileBackBtn} onClick={backToDeclaration} aria-label="Back">
              <BackArrow />
            </button>
          )}
          <div className={styles.mobileHeaderInfo}>
            <div className={styles.mobileHeaderTop}>
              <p className={styles.mobileTitle}>Plan Selection</p>
              <button className={styles.dpTariffBtn} type="button">
                <PdfIcon />
                DP Tariff
              </button>
            </div>
            <p className={styles.mobileSubtitle}>Select a plan that works best for your investment and trading needs</p>
          </div>
        </div>

        <div className={styles.mobilePlanCard}>
          {/* 3-column plan selector tabs */}
          <div className={styles.mobilePlanTabs}>
            {PLAN_STATIC.map((s, i) => {
              const isMiddle = i === middleIndex;
              const isSelected = selectedIndex === i;
              return (
                <div
                  key={i}
                  className={[
                    styles.mobilePlanTab,
                    isMiddle && !isSelected ? styles.mobilePlanTabMiddle : '',
                    isSelected ? styles.mobilePlanTabSelected : '',
                  ].filter(Boolean).join(' ')}
                >
                  <img src={PLAN_ICONS[i]} alt={PLAN_NAMES[i]} className={styles.tabIcon} />
                  <div className={styles.tabNamePrice}>
                    <p className={styles.tabName}>{PLAN_NAMES[i]}</p>
                    <div>
                      <p className={styles.tabPrice}>
                        {s.desktopPrice === '0'
                          ? 'ZERO'
                          : <>₹{s.desktopPrice}{s.mobilePriceGst && <span className={styles.tabPriceGst}> {s.mobilePriceGst}</span>}</>
                        }
                      </p>
                      <p className={styles.tabPriceSub}>
                        {s.desktopPrice === '0' ? 'Zero fees' : 'One-time fees'}
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={[styles.tabSelectBtn, isSelected ? styles.tabSelectBtnSelected : ''].filter(Boolean).join(' ')}
                    onClick={() => isSelected ? proceedWithPlan() : setSelectedIndex(i)}
                  >
                    {isSelected ? 'Selected' : 'Select'}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Comparison banner */}
          <div className={styles.comparisonBanner}>
            <p><strong>ZERO</strong> Interest for 23 trading days for Margin Trading</p>
            <p>and <strong>FREE</strong> AMC for 1 year</p>
          </div>

          <div className={styles.comparisonScrollArea}>
            <div className={styles.comparisonSectionHeader}><p>Equity</p></div>
            <div className={styles.comparisonDataRow}>
              {PLAN_STATIC.map((s, i) => (
                <div key={i} className={[styles.comparisonCol, selectedIndex === i ? styles.comparisonColSelected : i === middleIndex ? styles.comparisonColMiddle : ''].filter(Boolean).join(' ')}>
                  {s.equity.map((cell, ci) => (
                    <div key={ci} className={styles.comparisonCell}>
                      <p className={styles.cellVal}>{cell.val}</p>
                      <p className={styles.cellLbl}>{cell.lbl}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div className={styles.comparisonSectionHeader}><p>Derivatives (F&amp;O)</p></div>
            <div className={styles.comparisonDataRow}>
              {PLAN_STATIC.map((s, i) => (
                <div key={i} className={[styles.comparisonCol, selectedIndex === i ? styles.comparisonColSelected : i === middleIndex ? styles.comparisonColMiddle : ''].filter(Boolean).join(' ')}>
                  {s.derivatives.map((cell, ci) => (
                    <div key={ci} className={styles.comparisonCell}>
                      <p className={styles.cellVal}>{cell.val}</p>
                      <p className={styles.cellLbl}>{cell.lbl}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <p className={styles.comparisonFootnote}>
              *Zero Brokerage on Delivery till 75 lakh Delivery Trade Volume for Premium Plan
            </p>
          </div>
        </div>
      </main>

      {/* ─── Desktop ───────────────────────────────────────── */}
      <div className={styles.desktopPage}>
        <div className={styles.desktopCard}>
          <div className={styles.desktopCardHeader}>
            <div className={styles.desktopHeaderLeft}>
              {rejectStatus !== 'R' && (
                <button className={styles.desktopBackBtn} onClick={backToDeclaration} aria-label="Back">
                  <BackArrow />
                </button>
              )}
              <div>
                <p className={styles.desktopCardTitle}>Plan Selection</p>
                <p className={styles.desktopCardSubtitle}>
                  Basis your trading preferences, we recommend the below plans.<br />
                  Select 1 of these 3 plans to begin your investment journey.
                </p>
              </div>
            </div>
            <button className={styles.dpTariffBtn} type="button">
              <PdfIcon />
              DP Tariff
            </button>
          </div>

          <div className={styles.desktopCardBody}>
            <div className={styles.dCardsRow}>
              {PLAN_STATIC.map((s, i) => {
                const isSpecial = i === 1;
                const isPremium = i === 2;
                const isSelected = selectedIndex === i;
                return (
                  <div
                    key={i}
                    className={[
                      styles.dCard,
                      isSelected ? styles.dCardSelected : '',
                      isPremium ? styles.dCardPremium : '',
                    ].join(' ')}
                    onClick={() => setSelectedIndex(i)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div
                      className={`${styles.dCardInner} ${isPremium ? styles.dCardInnerPremium : ''}`}
                      style={{ gap: s.innerGap }}
                    >
                      <div className={styles.dCardTop}>
                        {/* Plan icon + name + selected badge */}
                        <div className={styles.dPlanHeader}>
                          <div className={styles.dTitleRow}>
                            <img src={PLAN_ICONS[i]} alt="" width={isSpecial ? 30 : 31} height={isSpecial ? 30 : 31} className={styles.dPlanIcon} />
                            <span className={styles.dPlanName}>{PLAN_NAMES[i]}</span>
                            {isSelected && (
                              <span className={styles.dSelectedBadge}>
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                                  <circle cx="8" cy="8" r="7.5" fill="#280071" stroke="#280071" />
                                  <path d="M4.5 8.5L6.5 10.5L11.5 5.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                Selected
                              </span>
                            )}
                          </div>

                          {/* Price */}
                          <div className={styles.dPriceSection}>
                            <div className={styles.dPriceRow}>
                              <div className={styles.dPriceAmount}>
                                <span className={styles.dPriceRupee}>₹</span>
                                <span className={styles.dPriceNumber}>{s.desktopPrice}</span>
                              </div>
                              <span className={styles.dPriceGst}>Excl. GST</span>
                            </div>
                            <span className={styles.dPriceLabel}>{s.feeLabel}</span>
                          </div>
                        </div>

                        {/* Brokerage */}
                        <div className={styles.dBrokerageSection}>
                          <div className={styles.dDivider} />
                          <div className={styles.dBrokerageText}>
                            <p>
                              <strong className={styles.dBrokerageHL}>{s.brokerageMain}</strong>
                              <span className={styles.dBrokerageBody}>{' Brokerage'}</span>
                            </p>
                            <p><span className={styles.dBrokerageNote}>{s.brokerageNote}</span></p>
                          </div>
                          <div className={styles.dDivider} />
                        </div>

                        {/* Benefits */}
                        <div className={styles.dBenefitsSection}>
                          <span className={styles.dBenefitsTitle}>Lifetime Benefits Include:</span>
                          {s.benefits.map((b, bi) => (
                            <DesktopBenefitItem key={bi} type={b.type} text={b.text} sub={'sub' in b ? b.sub : undefined} />
                          ))}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className={styles.dCardActions} style={{ gap: s.actionsGap }}>
                        <button
                          type="button"
                          className={styles.dProceedBtn}
                          onClick={(e) => { e.stopPropagation(); setSelectedIndex(i); proceedWithPlan(i); }}
                        >
                          Proceed
                        </button>
                        <button
                          type="button"
                          className={styles.dKnowMoreBtn}
                          onClick={(e) => { e.stopPropagation(); openKnowMore(i); }}
                        >
                          Know More
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            {PLAN_STATIC.length > 3 && (
              <div className={styles.dPaginationDots} aria-hidden="true">
                {PLAN_STATIC.map((_, i) => (
                  <span key={i} className={`${styles.dDot} ${selectedIndex === i ? styles.dDotActive : ''}`} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Know More Modal ───────────────────────────────── */}
      {showKnowMore && (
        <div
          className={styles.modalOverlay}
          onClick={() => setShowKnowMore(false)}
          role="dialog"
          aria-modal="true"
          aria-label={`${kmName} plan details`}
        >
          <div className={styles.modalSheet} onClick={(e) => e.stopPropagation()}>
            {/* Mobile: drag handle */}
            <div className={styles.modalDash} aria-hidden="true" />

            {/* Desktop: back arrow row */}
            <div className={styles.modalCloseRow}>
              <button className={styles.modalCloseBtn} onClick={() => setShowKnowMore(false)} aria-label="Close">
                <BackArrow />
              </button>
            </div>

            {/* Desktop: title row */}
            <div className={styles.modalTitleRow}>
              <p className={styles.modalTitle}>{kmName} Plan Details</p>
            </div>

            {/* Mobile: plan icon + name */}
            <div className={styles.modalPlanHeader}>
              <img src={PLAN_ICONS[knowMoreIndex]} alt="" width={30} height={30} />
              <p>{kmName}</p>
            </div>

            <div className={styles.modalScrollContent}>
              {/* Desktop: 2-column layout */}
              <div className={styles.modalColumnsRow}>
                <div style={{ flex: 1 }}>
                  <p className={styles.modalColumnHeader}>Equity</p>
                  <div className={styles.modalList}>
                    {kmStat.equity.map((item, fi) => (
                      <div key={fi}>
                        <div className={styles.modalListItem}>
                          <ModalDoneIcon />
                          <p><strong>{item.val}</strong> {item.lbl}</p>
                        </div>
                        {fi < kmStat.equity.length - 1 && <div className={styles.modalItemDivider} />}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ flex: 1 }}>
                  <p className={styles.modalColumnHeader}>Derivatives (F&amp;O)</p>
                  <div className={styles.modalList}>
                    {kmStat.derivatives.map((item, fi) => (
                      <div key={fi}>
                        <div className={styles.modalListItem}>
                          <ModalDoneIcon />
                          <p><strong>{item.val}</strong> {item.lbl}</p>
                        </div>
                        {fi < kmStat.derivatives.length - 1 && <div className={styles.modalItemDivider} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile: combined flat list — equity + derivatives, no section headers */}
              <div className={styles.modalListMobile}>
                {[...kmStat.equity, ...kmStat.derivatives].map((item, fi, arr) => (
                  <div key={fi}>
                    <div className={styles.modalListItem}>
                      <ModalDoneIcon size={16} />
                      <p><strong>{item.val}</strong> {item.lbl}</p>
                    </div>
                    {fi < arr.length - 1 && <div className={styles.modalItemDivider} />}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="button"
              className={styles.modalCloseActionBtn}
              onClick={() => setShowKnowMore(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
