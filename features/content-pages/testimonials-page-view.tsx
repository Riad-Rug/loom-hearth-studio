import { testimonials } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function TestimonialsPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Testimonials</p>
        <h2>Customer stories placeholder</h2>
      </section>

      <section className={styles.testimonialsGrid}>
        {testimonials.map((item) => (
          <article key={item.id} className={styles.testimonialCard}>
            <blockquote>{item.quote}</blockquote>
            <p className={styles.testimonialMeta}>
              {item.customerName}
              {item.location ? `, ${item.location}` : ""}
            </p>
          </article>
        ))}
      </section>
    </div>
  );
}
