"use client";

import { usePathname } from "next/navigation";

import { NewsletterSignupIntentForm } from "@/components/analytics/newsletter-signup-intent-form";

import styles from "./footer-newsletter.module.css";

/**
 * The signup form carries a fixed input id, so two copies on one page would
 * share it. The homepage already ends in its own newsletter section and blog
 * posts end in their own signup block, so the footer one stands down there.
 */
function hasOwnSignup(pathname: string) {
  return pathname === "/" || /^\/blog\/[^/]+\/[^/]+/u.test(pathname);
}

export function FooterNewsletter() {
  const pathname = usePathname();

  if (hasOwnSignup(pathname)) {
    return null;
  }

  return (
    <section className={styles.signup} aria-labelledby="site-footer-signup">
      <div className={styles.copy}>
        <h2 className={styles.heading} id="site-footer-signup">
          New arrivals, first
        </h2>
        <p>Each piece is one of one. Join the list to see new arrivals and sourcing stories before they sell.</p>
      </div>
      <NewsletterSignupIntentForm
        ctaLabel="JOIN"
        inputLabel="Email address"
        inputPlaceholder="Your email address"
      />
    </section>
  );
}
