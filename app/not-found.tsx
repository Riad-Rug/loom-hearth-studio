import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/features/content-pages/content-pages.module.css";

export const metadata: Metadata = {
  title: "Page not found",
  // Next adds its own noindex to every 404; null drops the layout's
  // "index, follow" so that tag is the only robots meta.
  robots: null,
};

export default function NotFound() {
  return (
    <div className={styles.page}>
      <article className={styles.policyShell}>
        <p className={styles.eyebrow}>404</p>
        <h1>This page could not be found</h1>
        <div className={styles.policyBody}>
          <p>
            The link may be old, or the piece may have sold. Browse what is in the studio now.
          </p>
        </div>
        <div className={styles.policyActions}>
          <Link className={styles.primaryAction} href="/shop">
            Shop the collection
          </Link>
          <Link className={styles.secondaryAction} href="/shop/rugs">
            Moroccan rugs
          </Link>
          <Link className={styles.secondaryAction} href="/shop/poufs">
            Poufs
          </Link>
          <Link className={styles.secondaryAction} href="/shop/pillows">
            Pillows
          </Link>
          <Link className={styles.secondaryAction} href="/blog">
            Read the blog
          </Link>
        </div>
      </article>
    </div>
  );
}
