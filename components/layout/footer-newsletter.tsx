"use client";

import { usePathname } from "next/navigation";

import { NewsletterSignupIntentForm } from "@/components/analytics/newsletter-signup-intent-form";

import styles from "./footer-newsletter.module.css";

/**
 * The homepage and blog posts already end in their own signup section, directly
 * above the footer, so a second form there would stack two signups at the page
 * bottom. The footer one stands down on those pages.
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
        source="footer"
        ctaLabel="JOIN"
        inputLabel="Email address"
        inputPlaceholder="Your email address"
      />
    </section>
  );
}
