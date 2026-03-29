import { contactData } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

type ContactPageViewProps = {
  defaults?: {
    inquiryType?: string;
    message?: string;
    productName?: string;
  };
  submitAction: (formData: FormData) => Promise<void>;
  submissionState?: {
    tone: "success" | "error";
    message: string;
  };
};

export function ContactPageView({
  defaults,
  submitAction,
  submissionState,
}: ContactPageViewProps) {
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
            {defaults?.productName ? (
              <p className={styles.body}>
                Inquiry prepared for <strong>{defaults.productName}</strong>.
              </p>
            ) : null}
          </div>

          <form action={submitAction} className={styles.contactForm}>
            {submissionState ? (
              <p
                className={`${styles.contactFormNote} ${
                  submissionState.tone === "success"
                    ? styles.contactFormSuccess
                    : styles.contactFormError
                }`}
                role="status"
              >
                {submissionState.message}
              </p>
            ) : null}

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-name">
                Name
              </label>
              <input
                id="contact-name"
                autoComplete="name"
                className={styles.contactInput}
                name="name"
                placeholder="Your name"
                required
                type="text"
              />
            </div>

            <div className={styles.contactFieldGroup}>
              <label className={styles.contactLabel} htmlFor="contact-email">
                Email
              </label>
              <input
                id="contact-email"
                autoComplete="email"
                className={styles.contactInput}
                name="email"
                placeholder="name@example.com"
                required
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
                defaultValue={defaults?.inquiryType ?? ""}
                name="inquiryType"
                required
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
                defaultValue={defaults?.message}
                placeholder="Tell us about your inquiry, sourcing question, or product interest."
                required
                rows={7}
              />
            </div>

            <div className={styles.contactFormFooter}>
              <button className={styles.primaryAction} type="submit">
                {contactData.ctaLabel}
              </button>
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
