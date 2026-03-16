import { faqItems } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function FaqPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>FAQ</p>
        <h2>Frequently asked questions</h2>
      </section>

      <section className={styles.faqList}>
        {faqItems.map((item) => (
          <article key={item.id} className={styles.faqItem}>
            <h2>{item.question}</h2>
            <p className={styles.faqAnswer}>{item.answer}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
