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
        <p className={styles.eyebrow}>Policy</p>
        <h1>{page.title}</h1>
        <div className={styles.policyBody}>
          {page.body.split("\n\n").map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </article>
    </div>
  );
}
