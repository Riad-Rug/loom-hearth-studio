import { faqItems } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

const faqIntro =
  "Answers to the questions we get asked most often. If something is not here, send us a message \u2014 we respond within 24 hours.";

const faqGroups = ["Ordering", "Products", "Shipping", "Returns", "Rug Care"] as const;

export function FaqPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>FAQ</p>
        <h1>Frequently Asked Questions</h1>
        <p>{faqIntro}</p>
      </section>

      <section className={styles.faqList}>
        {faqGroups.map((group) => {
          const items = faqItems.filter((item) => item.group === group);

          if (!items.length) {
            return null;
          }

          return (
            <div key={group} className={styles.faqGroup}>
              <p className={styles.faqGroupTitle}>{group}</p>
              {items.map((item) => (
                <article key={item.id} className={styles.faqItem}>
                  <h2>{item.question}</h2>
                  <p className={styles.faqAnswer}>{item.answer}</p>
                </article>
              ))}
            </div>
          );
        })}
      </section>
    </div>
  );
}
