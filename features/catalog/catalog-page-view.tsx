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

  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>
              {categoryMeta ? categoryMeta.label : "Shop"}
            </p>
            <h1>
              {categoryMeta ? `${categoryMeta.label} launch collection` : "Browse the launch collection"}
            </h1>
            <p className={styles.lede}>
              {categoryMeta
                ? categoryMeta.description
                : "Shop and PDP routes now read from the committed launch catalog source of truth while cart validation, filtering behavior, and broader inventory workflows remain out of scope."}
            </p>
          </div>
          <div className={styles.heroPanel}>
            <p className={styles.heroPanelLabel}>Catalog scope</p>
            <ul className={styles.heroPanelList}>
              <li>Repository-backed launch products</li>
              <li>Type A and Type B product models</li>
              <li>Category and PDP routes wired to real retrieval</li>
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
                The PRD supports filtered catalog states, but filtering behavior remains a UI
                shell in this slice.
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
                {products.length} launch {products.length === 1 ? "item" : "items"}
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
