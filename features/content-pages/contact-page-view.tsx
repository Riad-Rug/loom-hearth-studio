import { contactData } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function ContactPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroBody}>
          <p className={styles.eyebrow}>{contactData.eyebrow}</p>
          <h1>{contactData.title}</h1>
          <p className={styles.lede}>{contactData.body}</p>
        </div>
      </section>

      <section className={styles.contactGrid}>
        <div className={`${styles.card} ${styles.contactPanel}`}>
          <div className={styles.cardBody}>
            <h2>{contactData.formTitle}</h2>
            <p className={styles.body}>{contactData.formBody}</p>
          </div>

          <form className={styles.contactForm}>
            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                className={styles.contactInput}
                name="name"
                placeholder="Your name"
                type="text"
              />
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                className={styles.contactInput}
                name="email"
                placeholder="name@example.com"
                type="email"
              />
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-inquiry-type">
                Inquiry type
              </label>
              <select
                id="contact-inquiry-type"
                className={styles.contactInput}
                defaultValue=""
                name="inquiryType"
              >
                <option value="" disabled>
                  Select an inquiry type
                </option>
                <option value="product-inquiry">Product inquiry</option>
                <option value="custom-request">Custom request</option>
                <option value="order-question">Order question</option>
              </select>
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-message">
                Message
              </label>
              <textarea
                id="contact-message"
                className={styles.contactTextarea}
                name="message"
                placeholder="Tell us about your inquiry, sourcing question, or product interest."
                rows={7}
              />
            </div>

            <div className={styles.contactFormFooter}>
              <button className={styles.primaryAction} type="button">
                {contactData.ctaLabel}
              </button>
              <p className={styles.contactFormNote}>
                Form submission is a structured placeholder for now. Backend delivery is not yet
                implemented.
              </p>
            </div>
          </form>
        </div>

        <div className={`${styles.card} ${styles.contactMeta}`} id="contact-details">
          <div className={styles.cardBody}>
            <h2>{contactData.supportTitle}</h2>
            <p className={styles.body}>{contactData.supportBody}</p>
          </div>

          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Email</span>
            <p>{contactData.emailLabel}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Business hours</span>
            <p>{contactData.hoursLabel}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Brand context</span>
            <p>{contactData.locationLabel}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{contactData.reassuranceLabel}</span>
            <p>{contactData.reassuranceText}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>{contactData.responseTimeLabel}</span>
            <p>{contactData.responseTimeText}</p>
          </div>
        </div>
      </section>
    </div>
  );
}