import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { lookbookItems } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function LookbookPageView() {
  return (
    <div className={styles.page}>
      <section className={`${styles.sectionHeader} ${styles.lookbookIntro}`}>
        <p className={styles.eyebrow}>Lookbook</p>
        <h1>Moroccan rugs and decor in real interiors.</h1>
        <p className={styles.body}>
          Interiors built around hand-knotted rugs, woven textiles, and pieces brought
          back from Morocco. Each scene links to the category it came from.
        </p>
      </section>

      <section className={styles.lookbookGrid} aria-label="Editorial Moroccan lookbook">
        {lookbookItems.map((item, index) => (
          <Link
            key={item.id}
            aria-label={`${item.ctaLabel} - ${item.title}`}
            className={styles.lookbookTile}
            href={`${item.href}?from=lookbook&scene=${item.id}` as Route}
          >
            <div className={styles.lookbookMedia}>
              <Image
                alt={item.imageAlt}
                className={styles.lookbookImage}
                fill
                loading={index < 2 ? "eager" : "lazy"}
                priority={index < 2}
                sizes="(max-width: 1100px) 100vw, 50vw"
                style={item.imagePosition ? { objectPosition: item.imagePosition } : undefined}
                src={item.imageSrc}
              />
              <div className={styles.lookbookMediaOverlay} aria-hidden="true" />
            </div>
            <div className={styles.lookbookBody}>
              <p className={styles.lookbookRoomLabel}>{item.roomLabel}</p>
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
          <h2>Start with the collection.</h2>
        </div>
        <div className={styles.policyActions}>
          <Link className={styles.primaryAction} href="/shop">
            Shop the full collection
          </Link>
          <Link className={styles.secondaryAction} href="/shop/rugs">
            Browse all rugs
          </Link>
        </div>
      </section>
    </div>
  );
}
