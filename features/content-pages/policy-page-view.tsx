import Link from "next/link";

import { renderMarkdownBody, renderPlainBody } from "@/components/content/markdown-body";
import { policyPages } from "@/features/content-pages/content-pages-data";
import type { PolicyPage } from "@/types/domain";

import styles from "./content-pages.module.css";

type PolicyPageViewProps = {
  slug: PolicyPage["slug"];
};

export function PolicyPageView({ slug }: PolicyPageViewProps) {
  const page = policyPages.find((item) => item.slug === slug);

  if (!page) {
    return null;
  }

  return (
    <div className={styles.page}>
      <article className={styles.policyShell}>
        {page.showPageHeader === false ? null : (
          <>
            <p className={styles.eyebrow}>Policy</p>
            <h1>{page.title}</h1>
          </>
        )}
        <div className={styles.policyBody}>
          {page.bodyFormat === "markdown"
            ? renderMarkdownBody(page.body)
            : renderPlainBody(page.body)}
        </div>
        <div className={styles.policyActions}>
          <Link className={styles.secondaryAction} href="/faq">
            Read the FAQ
          </Link>
          <Link className={styles.primaryAction} href="/contact">
            Contact the studio
          </Link>
        </div>
      </article>
    </div>
  );
}