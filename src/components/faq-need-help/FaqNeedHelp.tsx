'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSpinner } from '@/components/spinner/Spinner';
import apiService from '@/services/api.service';
import styles from './faq-need-help.module.scss';

interface FaqItem {
  question: string;
  answer: string;
  isOpen?: boolean;
}

export default function FaqNeedHelp() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { show: showSpinner, hide: hideSpinner } = useSpinner();

  const [stageName, setStageName] = useState('');
  const [faqList, setFaqList] = useState<FaqItem[]>([]);
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  useEffect(() => {
    document.title = 'FAQ & Need Help | SBI Securities';
    const stage = searchParams.get('stage') ?? '';
    setStageName(stage);
    loadFaqData(stage);
  }, []);

  const loadFaqData = async (stage: string) => {
    showSpinner();
    try {
      const response = await apiService.postRequest('api/v1/masters/get', {
        flag: 'GetFAQDetails',
        StageName: stage,
      }, hideSpinner);

      if (response?.status === true && Array.isArray(response?.data)) {
        setFaqList(response.data);
      }
    } catch {
      // error handled by apiService
    } finally {
      hideSpinner();
    }
  };

  const toggleFaq = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const goBack = () => {
    router.back();
  };

  return (
    <section aria-label="FAQ and Help" className={`pan_details_form ${styles.faqPage}`}>
      <div className="container">
        <div className="row">
          <div className="col-lg-10 col-12 m-auto">
            {/* Mobile header */}
            <div className="mobile_css">
              <div className="back_cls">
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={goBack}
                  aria-label="Go back"
                >
                  <Image
                    src="/assets/images/diy/back_arrow.svg"
                    alt="Back"
                    width={24}
                    height={24}
                  />
                </button>
                <h5>FAQ &amp; Help</h5>
              </div>
            </div>

            {/* Desktop header */}
            <div className="col-lg-12 col-md-12 col-12 desktop_css">
              <div className="d-flex align-items-center gap-2">
                <button
                  type="button"
                  className={styles.backBtn}
                  onClick={goBack}
                  aria-label="Go back"
                >
                  <Image
                    src="/assets/images/diy/back_arrow.svg"
                    alt="Back"
                    width={24}
                    height={24}
                  />
                </button>
                <h5>FAQ &amp; Help</h5>
              </div>
            </div>

            <hr className="desktop_css" />

            {/* FAQ accordion */}
            {faqList.length > 0 && (
              <div className={styles.faqList}>
                {faqList.map((faq, index) => (
                  <div key={index} className={styles.faqItem}>
                    <button
                      type="button"
                      className={styles.faqQuestion}
                      onClick={() => toggleFaq(index)}
                      aria-expanded={openIndex === index}
                    >
                      <span>{faq.question}</span>
                      <Image
                        src="/assets/images/diy/chevron_down.svg"
                        alt={openIndex === index ? 'Collapse' : 'Expand'}
                        width={20}
                        height={20}
                        className={openIndex === index ? styles.rotated : ''}
                      />
                    </button>
                    {openIndex === index && (
                      <div className={styles.faqAnswer}>
                        <p>{faq.answer}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {faqList.length === 0 && (
              <div className={styles.noFaq}>
                <p>No FAQs available for this section.</p>
              </div>
            )}

            {/* Need Help section */}
            <div className={styles.needHelp}>
              <h6>Still need help?</h6>
              <p>
                Contact our support team at{' '}
                <a href="mailto:helpdesk@sbicapsec.com">helpdesk@sbicapsec.com</a>
              </p>
              <p>
                Call us at{' '}
                <a href="tel:18001023327">1800 1023 327</a> (Toll Free)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
