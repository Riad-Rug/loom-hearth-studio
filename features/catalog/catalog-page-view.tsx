"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { Section } from "@/components/layout/section";
import {
  catalogCategories,
  catalogFilterLabels,
  catalogLanding,
  catalogSortOptions,
} from "@/features/catalog/catalog-data";
import { CatalogHistoryRecorder } from "@/features/catalog/catalog-history-recorder";
import { CatalogProductBrowser } from "@/features/catalog/catalog-product-browser";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import type { ProductCategory } from "@/types/domain";

import styles from "./catalog-page.module.css";

type CatalogSortOption = (typeof catalogSortOptions)[number];

type CatalogPageViewProps = {
  category?: ProductCategory;
  products: CatalogProductCardViewModel[];
  collection?: {
    eyebrow?: string;
    title: string;
    description: string;
    bullets: readonly string[];
    href?: string;
  };
};

export function CatalogPageView({ category, products, collection }: CatalogPageViewProps) {
  const [sortOption, setSortOption] = useState<CatalogSortOption>("Featured");
  const categoryMeta =
    category ? catalogCategories.find((item) => item.key === category) ?? null : null;
  const heroEyebrow =
    collection?.eyebrow ?? (categoryMeta ? "Collection" : catalogLanding.eyebrow);
  const heroTitle = collection?.title ?? (categoryMeta ? categoryMeta.title : catalogLanding.title);
  const heroCopy =
    collection?.description ?? (categoryMeta ? categoryMeta.description : catalogLanding.description);
  const heroBullets =
    collection?.bullets ?? (categoryMeta ? categoryMeta.bullets : catalogLanding.bullets);
  const productCountLabel = `${products.length} ${products.length === 1 ? "piece" : "pieces"}`;
  const collectionStatusLabel = products.length > 6 ? "Full studio edit" : "Tight studio edit";
  const mobileFilterLabels = catalogFilterLabels.filter((label) => label !== "Decor");
  const hasExactCategoryLink = collection?.href
    ? catalogCategories.some((item) => item.href === collection.href)
    : false;
  const sortedProducts = useMemo(() => sortCatalogProducts(products, sortOption), [products, sortOption]);

  const renderCategoryRail = () => (
    <div className={styles.categoryRail}>
      <Link
        className={`${styles.categoryChip} ${styles.allCategoriesChip} ${
          !category ? styles.categoryChipActive : ""
        }`}
        href="/shop"
      >
        All categories
      </Link>
      {catalogCategories.map((item) => {
        const isActive =
          collection?.href && hasExactCategoryLink
            ? item.href === collection.href
            : item.key === category;

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
  );

  return (
    <div className={styles.page} id="shop-top">
      <CatalogHistoryRecorder category={category} />
      <Section className={styles.mobileShopHeader} tone="muted" width="wide">
        <div className={styles.mobileTitleRow}>
          <h1>{heroTitle}</h1>
          <p>{productCountLabel}</p>
        </div>
        {renderCategoryRail()}
        <div className={`${styles.catalogToolbar} ${styles.mobileCatalogToolbar}`}>
          <div className={styles.filterList} aria-label="Collection highlights">
            {mobileFilterLabels.map((label) => (
              <span key={label} className={styles.filterChip}>
                {label}
              </span>
            ))}
          </div>
          <div className={styles.sortShell}>
            <label htmlFor="catalog-sort-mobile">Sort</label>
            <select
              id="catalog-sort-mobile"
              className={styles.sortSelect}
              value={sortOption}
              onChange={(event) => setSortOption(event.currentTarget.value as CatalogSortOption)}
            >
              {catalogSortOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </Section>

      <Section className={styles.productsSection} width="wide">
        <div className={styles.catalogShell}>
          <aside className={styles.catalogSidebar}>
            <div className={styles.sidebarCard}>
              <p className={styles.eyebrow}>{heroEyebrow}</p>
              <h1>{heroTitle}</h1>
              <div className={styles.sidebarStatRow}>
                <p className={styles.sidebarCount}>{productCountLabel}</p>
                <p className={styles.sidebarStatus}>{collectionStatusLabel}</p>
              </div>
              <p className={styles.sidebarCopy}>{heroCopy}</p>
              <div className={styles.sidebarHighlights} aria-label="Collection service details">
                <span>Colour verified before payment</span>
                <span>Ships from Morocco</span>
              </div>
              <div className={styles.sidebarActions}>
                <a className={styles.primaryAction} href="#shop-grid">
                  Browse All {products.length} Pieces
                </a>
              </div>
            </div>

            <div className={styles.sidebarPanel}>
              <p className={styles.sidebarHeading}>Categories</p>
              <p className={styles.sidebarPanelCopy}>
                Keep the collection rail in view while you scan the product wall.
              </p>
              <div className={styles.sidebarCategoryRail}>{renderCategoryRail()}</div>
            </div>

            <div className={styles.sidebarPanel}>
              <p className={styles.sidebarHeading}>In this collection</p>
              <ul className={styles.heroPanelList}>
                {heroBullets.map((bullet) => (
                  <li key={bullet}>{bullet}</li>
                ))}
              </ul>
            </div>
          </aside>

          <div className={styles.catalogContent}>
            <div className={styles.catalogToolbar}>
              <div className={styles.toolbarIntro}>
                <p className={styles.toolbarCount}>{productCountLabel}</p>
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
                <select
                  id="catalog-sort"
                  className={styles.sortSelect}
                  value={sortOption}
                  onChange={(event) => setSortOption(event.currentTarget.value as CatalogSortOption)}
                >
                  {catalogSortOptions.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <CatalogProductBrowser products={sortedProducts} />
          </div>
        </div>
      </Section>

      <Section className={styles.categoryTradeSection} tone="muted" width="wide">
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
    </div>
  );
}

function sortCatalogProducts(
  products: CatalogProductCardViewModel[],
  sortOption: CatalogSortOption,
) {
  const sortableProducts = [...products];

  switch (sortOption) {
    case "Newest":
      return sortableProducts.reverse();
    case "Price: Low to High":
      return sortableProducts.sort((left, right) => left.priceUsd - right.priceUsd);
    case "Price: High to Low":
      return sortableProducts.sort((left, right) => right.priceUsd - left.priceUsd);
    case "Featured":
    default:
      return sortableProducts;
  }
}
