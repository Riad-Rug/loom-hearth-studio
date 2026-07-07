import Link from "next/link";

import styles from "./content-pages.module.css";

export function LookbookPageView() {
  return (
    <div className={styles.page}>
      <section className={`${styles.sectionHeader} ${styles.lookbookIntro}`}>
        <p className={styles.eyebrow}>Lookbook</p>
        <h1>Moroccan rugs and decor in real interiors.</h1>
        <p className={styles.body}>
          Coming soon — real rooms only.
        </p>
      </section>

      <section className={styles.lookbookPlaceholder}>
        <p>We&apos;re waiting on real customer rooms and daylight photography before publishing this page.</p>
        <div className={styles.policyActions}>
          <Link className={styles.primaryAction} href="/shop">
            Shop the collection
          </Link>
          <Link className={styles.secondaryAction} href="/about">
            Read the story
          </Link>
        </div>
      </section>
    </div>
  );
}
