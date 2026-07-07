import styles from "./content-pages.module.css";

export function TestimonialsPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Testimonials</p>
        <h1>Customer reviews</h1>
        <p className={styles.body}>Reviews will appear here as orders are delivered.</p>
      </section>

      <section className={styles.testimonialPlaceholder}>
        <p>Until then, each product page shows condition notes and approval-before-capture terms instead of placeholder praise.</p>
      </section>
    </div>
  );
}
