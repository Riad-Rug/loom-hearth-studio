import type { Metadata } from "next";
import Link from "next/link";

import styles from "@/features/content-pages/content-pages.module.css";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "sourcing",
    title: "Sourcing & Authenticity",
    description:
      "How Loom & Hearth Studio approaches sourcing, authenticity, and product verification as the collection is assembled.",
    path: "/sourcing",
  });
}

const sourcingSections = [
  {
    eyebrow: "Sourcing approach",
    title: "Selected in Morocco, documented with care.",
    body:
      "Loom & Hearth Studio sources through long-standing relationships in Marrakech and reviews each piece before it enters the collection. As the catalog grows, each rug page will publish more specific information about origin, material, and what is known with confidence versus what is best understood as attribution.",
  },
  {
    eyebrow: "Authenticity",
    title: "We are building product pages to show more than a finished room image.",
    body:
      "The next stage of the site adds room for back-of-rug photography, close texture detail, construction notes, and product-specific verification details. The goal is to help customers understand what they are buying without relying on generic language.",
  },
  {
    eyebrow: "What to expect",
    title: "Collection detail will deepen as the final catalog is published.",
    body:
      "This page exists now to make the sourcing framework visible before the full catalog is loaded. Product-level attribution, provenance notes, and collection-specific guidance will be added as final rugs, photography, and descriptions are published.",
  },
] as const;

export default function SourcingPage() {
  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <p className={styles.eyebrow}>Sourcing & Authenticity</p>
        <h1>How the collection is sourced and how product detail will be shown.</h1>
        <div className={styles.heroBody}>
          <p className={styles.lede}>
            Loom & Hearth Studio is building a sourcing and authenticity layer designed to support
            careful buying. As final products are added, each rug and textile page will carry more
            precise information about construction, origin, visual detail, and verification.
          </p>
        </div>
        <div className={styles.contactActions}>
          <Link className={styles.primaryAction} href="/about">
            Read the studio story
          </Link>
          <Link className={styles.secondaryAction} href="/contact">
            Ask a sourcing question
          </Link>
        </div>
      </section>

      <section className={styles.twoColumn}>
        {sourcingSections.slice(0, 2).map((section) => (
          <article key={section.title} className={styles.card}>
            <p className={styles.eyebrow}>{section.eyebrow}</p>
            <h2>{section.title}</h2>
            <div className={styles.cardBody}>
              <p>{section.body}</p>
            </div>
          </article>
        ))}
      </section>

      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>{sourcingSections[2].eyebrow}</p>
        <h2>{sourcingSections[2].title}</h2>
        <p className={styles.body}>{sourcingSections[2].body}</p>
      </section>

      <section className={styles.contactActions}>
        <Link className={styles.primaryAction} href="/shop">
          Browse the collection
        </Link>
        <Link className={styles.secondaryAction} href="/faq">
          Read the FAQ
        </Link>
      </section>
    </div>
  );
}