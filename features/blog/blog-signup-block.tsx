import { NewsletterSignupIntentForm } from "@/components/analytics/newsletter-signup-intent-form";

import styles from "./blog.module.css";

/** Closing signup for a post. The site footer stands down on post pages so only one form is on screen. */
export function BlogSignupBlock() {
  return (
    <section className={styles.signupBlock} aria-labelledby="blog-signup-heading">
      <div className={styles.relatedHeader}>
        <p className={styles.eyebrow}>Join the list</p>
        <h2 id="blog-signup-heading">Stories and new arrivals, in your inbox.</h2>
        <p>Each piece is one of one. Join to see new arrivals before they sell.</p>
      </div>
      <NewsletterSignupIntentForm
        ctaLabel="JOIN"
        inputLabel="Email address"
        inputPlaceholder="Your email address"
      />
    </section>
  );
}
