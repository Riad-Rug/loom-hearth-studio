import Link from "next/link";

import styles from "./cart-page.module.css";

export function CartPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.shell}>
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>Inquiry only</p>
            <h1>Direct checkout is currently paused</h1>
            <p className={styles.lede}>
              The storefront catalog remains visible, but orders are currently handled through the
              studio inquiry flow so availability and shipping details can be confirmed directly.
            </p>
          </div>
          <div className={styles.headerActions}>
            <Link className={styles.secondaryAction} href="/shop">
              Continue browsing
            </Link>
            <Link className={styles.primaryAction} href="/contact?inquiryType=product-inquiry">
              Contact the studio
            </Link>
          </div>
        </div>

        <div className={styles.emptyState}>
          <h2>Ask about any piece you're considering.</h2>
          <p>
            Product pages now route into the contact experience so customers can request details,
            confirm availability, and discuss next steps without being sent into a dead-end cart or
            checkout flow.
          </p>
          <Link className={styles.primaryAction} href="/shop">
            Explore the shop
          </Link>
        </div>
      </section>
    </div>
  );
}

