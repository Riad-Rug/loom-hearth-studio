import Link from "next/link";

import { Section } from "@/components/layout/section";
import { catalogCategories, catalogFilterLabels, catalogLanding, catalogSortOptions } from "@/features/catalog/catalog-data";
import { ProductCard } from "@/features/catalog/product-card";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import type { ProductCategory } from "@/types/domain";

import styles from "./catalog-page.module.css";

type CatalogPageViewProps = {
  category?: ProductCategory;
  products: CatalogProductCardViewModel[];
};

export function CatalogPageView({ category, products }: CatalogPageViewProps) {
  const categoryMeta = category
    ? catalogCategories.find((item) => item.key === category) ?? null
    : null;
  const heroEyebrow = categoryMeta ? "Collection" : catalogLanding.eyebrow;
  const heroTitle = categoryMeta ? categoryMeta.title : catalogLanding.title;
  const heroCopy = categoryMeta ? categoryMeta.description : catalogLanding.description;
  const heroBullets = categoryMeta ? categoryMeta.bullets : catalogLanding.bullets;
  const heroParagraphs = heroCopy.split("\n\n");

  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{heroEyebrow}</p>
            <h1>{heroTitle}</h1>
            {heroParagraphs.map((paragraph) => (
              <p key={paragraph} className={styles.lede}>
                {paragraph}
              </p>
            ))}
          </div>
          <div className={styles.heroPanel}>
            <p className={styles.heroPanelLabel}>In this collection</p>
            <ul className={styles.heroPanelList}>
              {heroBullets.map((bullet) => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </div>
        </div>
      </Section>

      <Section tone="muted" width="wide">
        <div className={styles.categoryRail}>
          <Link
            className={`${styles.categoryChip} ${!category ? styles.categoryChipActive : ""}`}
            href="/shop"
          >
            All categories
          </Link>
          {catalogCategories.map((item) => {
            const isActive = item.key === category;

            return (
              <Link
                key={item.href}
                className={`${styles.categoryChip} ${isActive ? styles.categoryChipActive : ""}`}
                href={item.href}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
        <div className={styles.tradePanel}>
          <div className={styles.tradePanelCopy}>
            <p className={styles.heroPanelLabel}>Trade and project support</p>
            <h2>Working on a Client Project?</h2>
            <p>
              Use the trade route for sourcing questions, image requests, and project-specific
              inquiries before you present a piece or move into checkout.
            </p>
          </div>
          <div className={styles.tradePanelActions}>
            <Link className={styles.secondaryAction} href="/trade">
              View trade support
            </Link>
            <Link className={styles.primaryAction} href="/contact?inquiryType=trade-request">
              Start a trade inquiry
            </Link>
          </div>
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.catalogShell}>
          <div className={styles.catalogContent}>
            <div className={styles.catalogToolbar}>
              <div className={styles.toolbarIntro}>
                <p className={styles.toolbarCount}>
                  {products.length} {products.length === 1 ? "piece" : "pieces"}
                </p>
                <div className={styles.filterList} aria-label="Collection highlights">
                  {catalogFilterLabels.map((label) => (
                    <span key={label} className={styles.filterChip}>
                      {label}
                    </span>
                  ))}
                </div>
              </div>
              <div className={styles.sortShell}>
                <label htmlFor="catalog-sort">Sort</label>
                <select id="catalog-sort" className={styles.sortSelect} defaultValue="Featured">
                  {catalogSortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.productGrid}>
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </Section>
    </div>
  );
}
