import { lookbookItems } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function LookbookPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Lookbook</p>
        <h2>Gallery-style lookbook placeholder</h2>
      </section>

      <section className={styles.lookbookGrid}>
        {lookbookItems.map((item) => (
          <article key={item.id} className={styles.lookbookTile}>
            <div className={styles.lookbookMedia}>
              <span>Lookbook media placeholder</span>
            </div>
            <div className={styles.lookbookBody}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
