import { contactData } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function ContactPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{contactData.eyebrow}</p>
        <h1>{contactData.title}</h1>
        <p className={styles.lede}>{contactData.body}</p>
      </section>

      <section className={styles.contactGrid}>
        <div className={`${styles.card} ${styles.contactPanel}`}>
          <h2>Reach the studio</h2>
          <p className={styles.body}>
            WhatsApp-first contact presentation is shown here as a UI shell only. Real
            messaging, forms, CAPTCHA, and provider wiring are not implemented.
          </p>
          <div className={styles.contactActions}>
            <a className={styles.primaryAction} href="#" role="button">
              {contactData.whatsappLabel}
            </a>
            <a className={styles.contactLink} href="#">
              Contact form placeholder
            </a>
          </div>
        </div>

        <div className={`${styles.card} ${styles.contactMeta}`}>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Email</span>
            <p>{contactData.emailLabel}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Studio hours</span>
            <p>{contactData.hoursLabel}</p>
          </div>
          <div className={styles.metaRow}>
            <span className={styles.metaLabel}>Launch market</span>
            <p>United States only</p>
          </div>
        </div>
      </section>
    </div>
  );
}
