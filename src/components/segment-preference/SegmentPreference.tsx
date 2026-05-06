'use client';

import { useRouter } from 'next/navigation';

// Figma static assets
const PROZERO_LOGO_MOB  = 'https://www.figma.com/api/mcp/asset/fb40d2da-b8a1-4ff5-a2ee-deef6cd49594';
const PROZERO_LOGO_DESK = 'https://www.figma.com/api/mcp/asset/7d7dc358-bba5-4382-8e2f-efc8e9f30508';
const CHECK_ICON        = 'https://www.figma.com/api/mcp/asset/aadd5994-f92c-4031-a13c-9a2daed4fab2';
const BACK_ARROW_DESK   = 'https://www.figma.com/api/mcp/asset/bb54649e-254e-4f15-88fc-17f331affbb5';

export default function SegmentPreference() {
  const router = useRouter();
  const handleProceed = () => router.push('/CaptureSelfie/1');
  const handleBack    = () => router.push('/planprocess/2');

  return (
    <>
      {/* ─────────────── MOBILE ─────────────── */}
      <div className="mobile_css">
        <section className="pan_details_form" aria-labelledby="seg-mob-title">

          {/* Gray header: back icon + title + subtitle */}
          <div className="back_cls">
            <button type="button" className="sp-back-btn" onClick={handleBack} aria-label="Go back">
              <img src="/assets/images/diy/ChevronLeft.png" alt="" />
            </button>
            <div className="sp-header-text">
              <h5 id="seg-mob-title">Segment Preference</h5>
              <p className="sub_title">
                Please select the segments you want to activate under your trading account.
              </p>
            </div>
          </div>

          {/* White content card */}
          <div className="sp-mob-card">

            {/* Plan Selected card */}
            <div className="sp-plan-card">
              <p className="sp-plan-label">Plan Selected</p>
              {/* Mobile: logo | name (flex-1) | Change (far right) */}
              <div className="sp-plan-row-mob">
                <div className="sp-plan-logo">
                  <img src={PROZERO_LOGO_MOB} alt="ProZERO" />
                </div>
                <span className="sp-plan-name-mob">ProZERO</span>
                <button type="button" className="sp-change-btn" onClick={handleBack}>
                  Change
                </button>
              </div>
            </div>

            {/* Segment row — mobile has border + padding */}
            <div className="sp-seg-row-mob">
              <div className="sp-checkbox">
                <img src={CHECK_ICON} alt="" width={18} height={18} />
              </div>
              <span className="sp-seg-label-mob">Equity &amp; MutualFund</span>
            </div>
          </div>

          {/* Sticky Proceed button */}
          <div className="stickybtn">
            <button type="button" onClick={handleProceed} className="btn btn_cls">
              Proceed
            </button>
          </div>
        </section>
      </div>

      {/* ─────────────── DESKTOP ─────────────── */}
      <div className="desktop_css">
        <section className="pan_details_form" aria-labelledby="seg-desk-title">

          {/* 800px centered card */}
          <div className="sp-desk-card">

            {/* Card header with border-bottom */}
            <div className="sp-desk-header">
              <button type="button" className="sp-back-btn" onClick={handleBack} aria-label="Go back">
                <img src={BACK_ARROW_DESK} alt="back" width={24} height={24} />
              </button>
              <div className="sp-header-text">
                <h5 id="seg-desk-title">Segment Preference</h5>
                <p className="sub_title">
                  Please select the segments you want to activate under your trading account.
                </p>
              </div>
            </div>

            {/* Card body — content grows, button stays at bottom */}
            <div className="sp-desk-body">

              {/* Inner content (grows to fill space) */}
              <div className="sp-desk-content">

                {/* Plan Selected card */}
                <div className="sp-plan-card">
                  <p className="sp-plan-label">Plan Selected</p>
                  {/* Desktop: logo | ProZERO + Change (inline, gap 12px) */}
                  <div className="sp-plan-row-desk">
                    <div className="sp-plan-logo">
                      <img src={PROZERO_LOGO_DESK} alt="ProZERO" />
                    </div>
                    <div className="sp-plan-name-desk-wrap">
                      <span className="sp-plan-name-desk">ProZERO</span>
                      <button type="button" className="sp-change-btn" onClick={handleBack}>
                        Change
                      </button>
                    </div>
                  </div>
                </div>

                {/* Segment row — desktop: NO border, just flex row */}
                <div className="sp-seg-row-desk">
                  <div className="sp-checkbox">
                    <img src={CHECK_ICON} alt="" width={18} height={18} />
                  </div>
                  <span className="sp-seg-label-desk">Equity and Mutual Fund</span>
                </div>
              </div>

              {/* Proceed button — pinned to bottom via flex */}
              <div className="sp-proceed-row">
                <button type="button" onClick={handleProceed} className="btn btn_cls sp-proceed-btn">
                  Proceed
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
