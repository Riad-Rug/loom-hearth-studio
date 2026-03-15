import Link from "next/link";

import { Section } from "@/components/layout/section";
import {
  catalogCategories,
  catalogFilterLabels,
  catalogPlaceholderProducts,
  catalogSortOptions,
} from "@/features/catalog/catalog-data";
import { ProductCard } from "@/features/catalog/product-card";
import type { ProductCategory } from "@/types/domain";

import styles from "./catalog-page.module.css";

type CatalogPageViewProps = {
  category?: ProductCategory;
};

export function CatalogPageView({ category }: CatalogPageViewProps) {
  const categoryMeta = category
    ? catalogCategories.find((item) => item.key === category) ?? null
    : null;

  const products = category
    ? catalogPlaceholderProducts.filter((product) => product.category === category)
    : catalogPlaceholderProducts;

  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              {categoryMeta ? categoryMeta.label : "Shop"}
            </p>
            <h1>
              {categoryMeta
                ? `${categoryMeta.label} placeholder catalog`
                : "Browse the launch catalog structure"}
            </h1>
            <p className={styles.lede}>
              {categoryMeta
                ? categoryMeta.description
                : "This catalog slice uses static placeholder data only. It preserves the PRD browsing structure for shop and category pages without implementing real product retrieval, filtering logic, or cart behavior."}
            </p>
          </div>
          <div className={styles.heroPanel}>
            <p className={styles.heroPanelLabel}>Catalog scope</p>
            <ul className={styles.heroPanelList}>
              <li>Static placeholder products only</li>
              <li>Category browsing routes preserved</li>
              <li>Dynamic PDP routes remain scaffold-only</li>
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
          <aside className={styles.sidebar}>
            <div className={styles.sidebarCard}>
              <p className={styles.sidebarHeading}>Filters</p>
              <p className={styles.sidebarCopy}>
                UI shell only. The PRD supports filtered catalog states, but no filtering
                behavior is implemented in this slice.
              </p>
              <div className={styles.filterList}>
                {catalogFilterLabels.map((label) => (
                  <button key={label} className={styles.filterChip} type="button">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className={styles.catalogContent}>
            <div className={styles.catalogToolbar}>
              <p className={styles.toolbarCount}>
                {products.length} placeholder {products.length === 1 ? "item" : "items"}
              </p>
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
