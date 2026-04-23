import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { lookbookItems } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function LookbookPageView() {
  return (
    <div className={styles.page}>
      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>Lookbook</p>
        <h1>Moroccan rugs and decor in real interiors.</h1>
        <p className={styles.body}>
          Interiors built around hand-knotted rugs, woven textiles, and pieces brought
          back from Morocco. Each scene links into the collection it came from.
        </p>
      </section>

      <section className={styles.lookbookGrid} aria-label="Editorial Moroccan lookbook">
        {lookbookItems.map((item) => (
          <Link
            key={item.id}
            aria-label={`${item.ctaLabel} - ${item.title}`}
            className={styles.lookbookTile}
            href={item.href as Route}
          >
            <div className={styles.lookbookMedia}>
              <Image
                alt={item.imageAlt}
                className={styles.lookbookImage}
                fill
                sizes="(max-width: 1100px) 100vw, 50vw"
                src={item.imageSrc}
              />
            </div>
            <div className={styles.lookbookBody}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <span className={styles.lookbookCta}>{item.ctaLabel}</span>
            </div>
          </Link>
        ))}
      </section>

      <section className={styles.lookbookExit}>
        <div>
          <p className={styles.eyebrow}>Shop next</p>
          <h2>Start with the rugs.</h2>
        </div>
        <div className={styles.policyActions}>
          <Link className={styles.primaryAction} href="/shop/rugs">
            Browse all rugs
          </Link>
          <Link className={styles.secondaryAction} href="/shop/rugs/vintage">
            Browse vintage
          </Link>
        </div>
      </section>
    </div>
  );
}
