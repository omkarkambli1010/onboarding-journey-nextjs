'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Splide, SplideSlide } from '@splidejs/react-splide';
import styles from './plan-preference.module.scss';

// ─── Static Plan Data ──────────────────────────────────────────

const PLAN_NAMES = ['Basic', 'Special', 'Premium'];

const PLAN_STATIC = [
  {
    desktopPrice: '0',
    priceGst: 'Excl. GST',
    feeLabel: 'Account Opening Fees',
    brokerageMain: '₹20',
    brokerageNote: '*On Equity Intraday Trades',
    highlighted: false,
    mobilePriceGst: '',
    benefits: [
      { text: '0.50% on Delivery Trade' },
      { text: '₹50/Lot on Options' },
      { text: '0.50% on E-Margin', sub: '*0% interest for 23 trading days' },
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
    benefits: [
      { text: '0.20% on Equity Delivery' },
      { text: '₹20/Order on Carry Forward Options' },
      { text: '0.50% on E-Margin', sub: '*0% interest for 23 trading days' },
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
    benefits: [
      { text: '₹20 on Equity Intraday' },
      { text: '0.20% on Equity Delivery' },
      { text: '₹20/Order on Carry Forward Options' },
      { text: '0.40% on E-Margin', sub: '*0% interest for 23 trading days' },
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

const CloseIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke="#222" strokeWidth="1.5" strokeLinecap="round" />
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

const DoneIcon = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="6" cy="6" r="6" fill="#280071" fillOpacity="0.12" />
    <path d="M3.5 6.2l1.8 1.8 3.2-3.8" stroke="#280071" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="8" cy="8" r="7.5" stroke="#9d76ff" />
    <path d="M4.5 8.5l2.5 2.5 4.5-5" stroke="#280071" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ModalDoneIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="10" cy="10" r="9.5" stroke="#280071" strokeOpacity="0.3" />
    <path d="M6 10.5l3 3 5-6" stroke="#280071" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ICON_FILLS = ['#E5E5E5', '#FFE5EE', '#EBE5FF'];
const ICON_TEXTS = ['#666666', '#C0448A', '#280071'];

const PlanIcon = ({ index, size = 28 }: { index: number; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 28 28" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="14" cy="14" r="14" fill={ICON_FILLS[index]} />
    <text
      x="14" y="19"
      textAnchor="middle"
      fontSize="12"
      fontWeight="700"
      fill={ICON_TEXTS[index]}
      fontFamily="sans-serif"
    >
      {PLAN_NAMES[index][0]}
    </text>
  </svg>
);

// ─── Component ────────────────────────────────────────────────

export default function PlanPreference() {
  const router = useRouter();
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [showKnowMore, setShowKnowMore] = useState(false);
  const [knowMoreIndex, setKnowMoreIndex] = useState(0);

  const rejectStatus = typeof window !== 'undefined' ? sessionStorage.getItem('RejectStatus') : null;

  const proceedWithPlan = () => {
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
          <div className={styles.mobileHeaderTop}>
            {rejectStatus !== 'R' && (
              <button className={styles.mobileBackBtn} onClick={backToDeclaration} aria-label="Back">
                <BackArrow />
              </button>
            )}
            <button className={styles.dpTariffBtn} type="button">
              <PdfIcon />
              DP Tariff
            </button>
          </div>
          <div>
            <p className={styles.mobileTitle}>Plan Selection</p>
            <p className={styles.mobileSubtitle}>Select a plan that works best for your investment and trading needs</p>
          </div>
        </div>

        <div className={styles.mobilePlanCard}>
          {/* Splide carousel — one plan card per slide */}
          <div className={styles.splideWrapper}>
            <Splide
              options={{
                type: 'loop',
                perPage: 1,
                perMove: 1,
                pagination: true,
                arrows: false,
                gap: '16px',
                padding: { left: '16px', right: '40px' },
                autoWidth: false,
              }}
            >
              {PLAN_STATIC.map((s, i) => {
                const isSelected = selectedIndex === i;
                const cardClass = [
                  styles.slideCard,
                  s.highlighted ? styles.slideCardHighlighted : '',
                ].filter(Boolean).join(' ');
                return (
                  <SplideSlide key={i}>
                    <div className={cardClass}>
                      {/* Icon + name + badge */}
                      <div className={styles.slideIconRow}>
                        <PlanIcon index={i} size={28} />
                        <p className={styles.slidePlanName}>{PLAN_NAMES[i]}</p>
                        {isSelected && (
                          <span className={styles.slideBadge}>
                            <CheckCircleIcon />
                            Selected
                          </span>
                        )}
                      </div>

                      {/* Price */}
                      <div className={styles.slidePriceRow}>
                        <div className={styles.slidePriceAmount}>
                          {s.desktopPrice === '0' ? (
                            <span style={{ fontSize: 32, fontWeight: 600, color: '#222', lineHeight: 'normal' }}>ZERO</span>
                          ) : (
                            <span className={styles.slidePriceValue}>{s.desktopPrice}</span>
                          )}
                          {s.mobilePriceGst && <span className={styles.slidePriceGst}>{s.mobilePriceGst}</span>}
                        </div>
                        <p className={styles.slideFeeLabel}>{s.feeLabel}</p>
                      </div>

                      <div className={styles.slideDivider} />

                      {/* Brokerage */}
                      <div className={styles.slideBrokerageBlock}>
                        <p>
                          <span className={styles.brokerageMain}>{s.brokerageMain}</span>
                          {' '}
                          <span className={styles.brokerageLabel}>Brokerage</span>
                        </p>
                        <span className={styles.brokerageNote}>{s.brokerageNote}</span>
                      </div>

                      <div className={styles.slideDivider} />

                      {/* Benefits */}
                      <div className={styles.slideBenefits}>
                        <p className={styles.slideBenefitsTitle}>Lifetime Benefits Include:</p>
                        {s.benefits.map((b, bi) => (
                          <div key={bi} className={styles.slideBenefitItem}>
                            <DoneIcon size={12} />
                            <div>
                              <p>{b.text}</p>
                              {b.sub && <span className={styles.subLine}>{b.sub}</span>}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Actions */}
                      <div className={styles.slideActions}>
                        <button
                          type="button"
                          className={styles.slideProceedBtn}
                          onClick={() => { setSelectedIndex(i); proceedWithPlan(); }}
                        >
                          Proceed
                        </button>
                        <button type="button" className={styles.slideKnowMore} onClick={() => openKnowMore(i)}>
                          Know More
                        </button>
                      </div>
                    </div>
                  </SplideSlide>
                );
              })}
            </Splide>
          </div>

          {/* Comparison table */}
          <div className={styles.comparisonBanner}>
            <p><strong>ZERO</strong> Interest for 23 trading days for Margin Trading</p>
            <p>and <strong>FREE</strong> AMC for 1 year</p>
          </div>

          <div className={styles.comparisonScrollArea}>
            <div className={styles.comparisonSectionHeader}><p>Equity</p></div>
            <div className={styles.comparisonDataRow}>
              {PLAN_STATIC.map((s, i) => (
                <div key={i} className={`${styles.comparisonCol} ${i === 1 ? styles.comparisonColMiddle : ''}`}>
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
                <div key={i} className={`${styles.comparisonCol} ${i === 1 ? styles.comparisonColMiddle : ''}`}>
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

        <div className={styles.mobileProceedArea}>
          <button type="button" className={styles.mobileProceedBtn} onClick={proceedWithPlan}>
            Proceed
          </button>
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
            {PLAN_STATIC.map((s, i) => {
              const isSelected = selectedIndex === i;
              const cardClass = [
                styles.planCard,
                s.highlighted ? styles.planCardHighlighted : '',
              ].filter(Boolean).join(' ');
              return (
                <div key={i} className={cardClass}>
                  <div className={styles.planCardInner}>
                    <div className={styles.planTopSection}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: '100%' }}>
                        <div className={styles.planIconRow}>
                          <PlanIcon index={i} size={31} />
                          <p className={styles.planName}>{PLAN_NAMES[i]}</p>
                          {isSelected && (
                            <span className={styles.planBadge}>
                              <CheckCircleIcon />
                              Selected
                            </span>
                          )}
                        </div>
                        <div className={styles.planPriceRow}>
                          <div className={styles.planPriceAmount}>
                            <span className={styles.planPriceValue}>{s.desktopPrice}</span>
                            <span className={styles.planPriceGst}>{s.priceGst}</span>
                          </div>
                          <p className={styles.planFeeLabel}>{s.feeLabel}</p>
                        </div>
                      </div>

                      <div className={styles.planMiddleSection}>
                        <div className={styles.planDivider} />
                        <div className={styles.planBrokerageBlock}>
                          <p>
                            <span className={styles.brokerageMain}>{s.brokerageMain}</span>
                            {' '}
                            <span className={styles.brokerageLabel}>Brokerage</span>
                          </p>
                          <span className={styles.brokerageNote}>{s.brokerageNote}</span>
                        </div>
                        <div className={styles.planDivider} />
                      </div>

                      <div className={styles.planBenefitsSection}>
                        <p className={styles.planBenefitsTitle}>Lifetime Benefits Include:</p>
                        {s.benefits.map((b, bi) => (
                          <div key={bi} className={styles.planBenefitItem}>
                            <DoneIcon />
                            <div>
                              <p>{b.text}</p>
                              {b.sub && <span className={styles.subLine}>{b.sub}</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className={styles.planActionsSection}>
                      <button
                        type="button"
                        className={styles.planProceedBtn}
                        onClick={() => { setSelectedIndex(i); proceedWithPlan(); }}
                      >
                        Proceed
                      </button>
                      <button type="button" className={styles.planKnowMore} onClick={() => openKnowMore(i)}>
                        Know More
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
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
            <div className={styles.modalDash} aria-hidden="true" />

            <div className={styles.modalCloseRow}>
              <button className={styles.modalCloseBtn} onClick={() => setShowKnowMore(false)} aria-label="Close">
                <CloseIcon />
              </button>
              <p className={styles.modalTitle}>{kmName} Plan Details</p>
            </div>

            <div className={styles.modalPlanHeader}>
              <PlanIcon index={knowMoreIndex} size={30} />
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
                        <div className={styles.modalItemDivider} />
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
                        <div className={styles.modalItemDivider} />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile: single-column list */}
              <div className={styles.modalListMobile}>
                <p className={styles.modalColumnHeader}>Equity</p>
                {kmStat.equity.map((item, fi) => (
                  <div key={fi}>
                    <div className={styles.modalListItem}>
                      <ModalDoneIcon />
                      <p><strong>{item.val}</strong> {item.lbl}</p>
                    </div>
                    <div className={styles.modalItemDivider} />
                  </div>
                ))}
                <p className={styles.modalColumnHeader} style={{ marginTop: 16 }}>Derivatives (F&amp;O)</p>
                {kmStat.derivatives.map((item, fi) => (
                  <div key={fi}>
                    <div className={styles.modalListItem}>
                      <ModalDoneIcon />
                      <p><strong>{item.val}</strong> {item.lbl}</p>
                    </div>
                    <div className={styles.modalItemDivider} />
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
