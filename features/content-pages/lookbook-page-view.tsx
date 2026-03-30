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
          Photographs of Moroccan rugs, poufs, pillows, and decor in interior contexts. Each image links to the pieces shown, where available.
        </p>
      </section>

      <section className={styles.lookbookGrid} aria-label="Editorial Moroccan lookbook">
        {lookbookItems.map((item) => (
          <Link
            key={item.id}
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
              <div className={styles.lookbookOverlay}>
                <span className={styles.lookbookOverlayCta}>{item.ctaLabel}</span>
              </div>
            </div>
            <div className={styles.lookbookBody}>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <span className={styles.lookbookCta}>{item.ctaLabel}</span>
            </div>
          </Link>
        ))}
      </section>
    </div>
  );
}