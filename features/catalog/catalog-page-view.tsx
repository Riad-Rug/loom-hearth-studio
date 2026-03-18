import Link from "next/link";

import { Section } from "@/components/layout/section";
import { catalogCategories, catalogFilterLabels, catalogSortOptions } from "@/features/catalog/catalog-data";
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
  const heroTitle = categoryMeta ? categoryMeta.label : "Shop the collection";
  const heroCopy = categoryMeta
    ? categoryMeta.description
    : "A curated edit of rugs, pillows, poufs, vintage textiles, and decor designed to bring warmth and texture home.";

  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              {categoryMeta ? "Collection" : "Storefront"}
            </p>
            <h1>{heroTitle}</h1>
            <p className={styles.lede}>{heroCopy}</p>
          </div>
          <div className={styles.heroPanel}>
            <p className={styles.heroPanelLabel}>In this collection</p>
            <ul className={styles.heroPanelList}>
              <li>Artisan-made textures and earthy palettes</li>
              <li>Collected pieces for layering, gifting, and everyday living</li>
              <li>Ready to browse by category or sort by what suits your space</li>
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
