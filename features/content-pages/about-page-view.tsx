import { aboutHero, aboutSections } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function AboutPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{aboutHero.eyebrow}</p>
        <h1>{aboutHero.title}</h1>
        <p className={styles.lede}>{aboutHero.body}</p>
      </section>

      <section className={styles.twoColumn}>
        {aboutSections.map((section) => (
          <article key={section.title} className={styles.card}>
            <p className={styles.eyebrow}>{section.eyebrow}</p>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
