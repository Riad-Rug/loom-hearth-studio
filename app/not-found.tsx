import type { Route } from "next";
import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/features/content-pages/content-pages.module.css";
import {
  getCategoryLabel,
  getCategoryRoutePath,
} from "@/lib/catalog/helpers";
import { listUnavailableCategoryHrefs } from "@/lib/catalog/service";
import { productCategoryOptions } from "@/lib/catalog/product-validation";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

export default async function NotFound() {
  const unavailableHrefs = new Set(await listUnavailableCategoryHrefs());
  const categories = productCategoryOptions.filter(
    (category) => !unavailableHrefs.has(getCategoryRoutePath(category)),
  );

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
          {categories.map((category) => (
            <Link
              key={category}
              className={styles.secondaryAction}
              href={getCategoryRoutePath(category) as Route}
            >
              {getCategoryLabel(category)}
            </Link>
          ))}
          <Link className={styles.secondaryAction} href="/blog">
            Read the blog
          </Link>
        </div>
      </article>
    </div>
  );
}
