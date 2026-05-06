"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { Section } from "@/components/layout/section";
import {
  catalogCategories,
  catalogLanding,
  catalogSortOptions,
} from "@/features/catalog/catalog-data";
import { CatalogHistoryRecorder } from "@/features/catalog/catalog-history-recorder";
import { CatalogProductBrowser } from "@/features/catalog/catalog-product-browser";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import type { ProductCategory } from "@/types/domain";

import styles from "./catalog-page.module.css";

type CatalogSortOption = (typeof catalogSortOptions)[number];
type CatalogPriceFilter = "all" | "under-300" | "300-600" | "600-plus";
type CatalogSizeFilter = "all" | "small" | "medium" | "large";

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
  const router = useRouter();
  const [sortOption, setSortOption] = useState<CatalogSortOption>("Featured");
  const [searchQuery, setSearchQuery] = useState("");
  const [priceFilter, setPriceFilter] = useState<CatalogPriceFilter>("all");
  const [sizeFilter, setSizeFilter] = useState<CatalogSizeFilter>("all");
  const categoryMeta =
    category ? catalogCategories.find((item) => item.key === category) ?? null : null;
  const heroEyebrow =
    collection?.eyebrow ?? (categoryMeta ? "Collection" : catalogLanding.eyebrow);
  const heroTitle = collection?.title ?? (categoryMeta ? categoryMeta.title : catalogLanding.title);
  const heroCopy =
    collection?.description ?? (categoryMeta ? categoryMeta.description : catalogLanding.description);
  const categoryCounts = useMemo(() => {
    return catalogCategories.reduce<Record<ProductCategory, number>>((accumulator, item) => {
      accumulator[item.key] = products.filter((product) => product.category === item.key).length;
      return accumulator;
    }, {} as Record<ProductCategory, number>);
  }, [products]);
  const hasExactCategoryLink = collection?.href
    ? catalogCategories.some((item) => item.href === collection.href)
    : false;
  const showCategoryCounts = !category && !hasExactCategoryLink;
  const visibleCategories = useMemo(
    () => {
      if (!showCategoryCounts) {
        return catalogCategories;
      }

      return catalogCategories.filter((item) => {
        const count = categoryCounts[item.key] ?? 0;
        const isCurrentCategory =
          item.key === category || (hasExactCategoryLink ? item.href === collection?.href : false);

        return count > 0 || isCurrentCategory;
      });
    },
    [category, categoryCounts, collection?.href, hasExactCategoryLink, showCategoryCounts],
  );
  const sortedProducts = useMemo(() => sortCatalogProducts(products, sortOption), [products, sortOption]);
  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return sortedProducts.filter((product) => {
      if (normalizedQuery) {
        const haystack = [
          product.displayName,
          product.dimensionsLabel,
          product.subtitle,
          product.description,
          product.merchandisingNote,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(normalizedQuery)) {
          return false;
        }
      }

      if (!matchesPriceFilter(product, priceFilter)) {
        return false;
      }

      if (!matchesSizeFilter(product, sizeFilter)) {
        return false;
      }

      return true;
    });
  }, [priceFilter, searchQuery, sizeFilter, sortedProducts]);
  const productCountLabel = `${filteredProducts.length} ${
    filteredProducts.length === 1 ? "piece" : "pieces"
  }`;
  const sidebarCopy =
    category || hasExactCategoryLink
      ? heroCopy
      : "Handcrafted rugs, poufs, and decor from Marrakech. One of one pieces do not return once sold.";
  const selectedCategoryHref =
    collection?.href && hasExactCategoryLink ? collection.href : categoryMeta?.href ?? "/shop";
  const hasActiveFilters = Boolean(searchQuery.trim()) || priceFilter !== "all" || sizeFilter !== "all";

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceFilter("all");
    setSizeFilter("all");
  };

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
      {visibleCategories.map((item) => {
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
            {showCategoryCounts ? `${item.label} (${categoryCounts[item.key] ?? 0})` : item.label}
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
          <p className={styles.toolbarSummary}>
            <span className={styles.toolbarCount}>{productCountLabel}</span>
            <span className={styles.toolbarTrustNote}>Every rug is one of one. Sold pieces are not restocked.</span>
          </p>
          <div className={styles.compactToolbarRow}>
            <div className={styles.searchInlineShell}>
              <label className={styles.srOnly} htmlFor="catalog-search-mobile">
                Search collection
              </label>
              <input
                id="catalog-search-mobile"
                className={styles.searchInlineInput}
                type="search"
                placeholder="Search by name, size, or material"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
              />
            </div>
            <div className={styles.compactSelectShell}>
              <label className={styles.srOnly} htmlFor="catalog-category-mobile">
                Category
              </label>
              <select
                id="catalog-category-mobile"
                className={styles.compactSelect}
                value={selectedCategoryHref}
                onChange={(event) => router.push(event.currentTarget.value as Route)}
              >
                <option value="/shop">Category: All</option>
                {visibleCategories.map((item) => (
                  <option key={item.href} value={item.href}>
                    {showCategoryCounts ? `${item.label} (${categoryCounts[item.key] ?? 0})` : item.label}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.compactSelectShell}>
              <label className={styles.srOnly} htmlFor="catalog-price-mobile">
                Price
              </label>
              <select
                id="catalog-price-mobile"
                className={styles.compactSelect}
                value={priceFilter}
                onChange={(event) => setPriceFilter(event.currentTarget.value as CatalogPriceFilter)}
              >
                {priceFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.compactLabel}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.compactSelectShell}>
              <label className={styles.srOnly} htmlFor="catalog-size-mobile">
                Size
              </label>
              <select
                id="catalog-size-mobile"
                className={styles.compactSelect}
                value={sizeFilter}
                onChange={(event) => setSizeFilter(event.currentTarget.value as CatalogSizeFilter)}
              >
                {sizeFilterOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.compactLabel}
                  </option>
                ))}
              </select>
            </div>
            <div className={`${styles.compactSelectShell} ${styles.compactSortShell}`}>
              <label className={styles.srOnly} htmlFor="catalog-sort-mobile">
                Sort
              </label>
              <select
                id="catalog-sort-mobile"
                className={styles.compactSelect}
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
            {hasActiveFilters ? (
              <button className={styles.secondaryAction} type="button" onClick={clearAllFilters}>
                Clear filters
              </button>
            ) : null}
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
              </div>
              <p className={styles.sidebarCopy}>{sidebarCopy}</p>
              <div className={styles.sidebarHighlights} aria-label="Collection service details">
                <span>Every rug is one of one and sold pieces are not restocked</span>
                <span>Colour verified before payment</span>
                <span>Ships from Morocco</span>
              </div>
              {hasActiveFilters ? (
                <div className={styles.sidebarActions}>
                  <button
                    className={styles.secondaryAction}
                    type="button"
                    onClick={clearAllFilters}
                  >
                    Clear all filters
                  </button>
                </div>
              ) : null}
            </div>

            <div className={styles.sidebarPanel}>
              <p className={styles.sidebarHeading}>Categories</p>
              <div className={styles.sidebarCategoryRail}>{renderCategoryRail()}</div>
            </div>
          </aside>

          <div className={styles.catalogContent}>
            <div className={styles.catalogToolbar}>
              <p className={styles.toolbarSummary}>
                <span className={styles.toolbarCount}>{productCountLabel}</span>
                <span className={styles.toolbarTrustNote}>Every rug is one of one. Sold pieces are not restocked.</span>
              </p>
              <div className={styles.compactToolbarRow}>
                <div className={styles.searchInlineShell}>
                  <label className={styles.srOnly} htmlFor="catalog-search">
                    Search collection
                  </label>
                  <input
                    id="catalog-search"
                    className={styles.searchInlineInput}
                    type="search"
                    placeholder="Search by name, size, or material"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  />
                </div>
                <div className={styles.compactSelectShell}>
                  <label className={styles.srOnly} htmlFor="catalog-category">
                    Category
                  </label>
                  <select
                    id="catalog-category"
                    className={styles.compactSelect}
                    value={selectedCategoryHref}
                    onChange={(event) => router.push(event.currentTarget.value as Route)}
                  >
                    <option value="/shop">Category: All</option>
                    {visibleCategories.map((item) => (
                      <option key={item.href} value={item.href}>
                        {showCategoryCounts ? `${item.label} (${categoryCounts[item.key] ?? 0})` : item.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.compactSelectShell}>
                  <label className={styles.srOnly} htmlFor="catalog-price">
                    Price
                  </label>
                  <select
                    id="catalog-price"
                    className={styles.compactSelect}
                    value={priceFilter}
                    onChange={(event) => setPriceFilter(event.currentTarget.value as CatalogPriceFilter)}
                  >
                    {priceFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.compactLabel}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={styles.compactSelectShell}>
                  <label className={styles.srOnly} htmlFor="catalog-size">
                    Size
                  </label>
                  <select
                    id="catalog-size"
                    className={styles.compactSelect}
                    value={sizeFilter}
                    onChange={(event) => setSizeFilter(event.currentTarget.value as CatalogSizeFilter)}
                  >
                    {sizeFilterOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.compactLabel}
                      </option>
                    ))}
                  </select>
                </div>
                <div className={`${styles.compactSelectShell} ${styles.compactSortShell}`}>
                  <label className={styles.srOnly} htmlFor="catalog-sort">
                    Sort
                  </label>
                  <select
                    id="catalog-sort"
                    className={styles.compactSelect}
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
                {hasActiveFilters ? (
                  <button className={styles.secondaryAction} type="button" onClick={clearAllFilters}>
                    Clear filters
                  </button>
                ) : null}
              </div>
            </div>

            {filteredProducts.length ? (
              <CatalogProductBrowser products={filteredProducts} />
            ) : (
              <div className={styles.emptyCatalogState}>
                <p className={styles.eyebrow}>No matches</p>
                <h2>Nothing matches this mix of filters yet.</h2>
                <p>
                  Clear the current search or widen the size and price filters to return to the full
                  studio edit.
                </p>
                <div className={styles.sidebarActions}>
                  <button className={styles.primaryAction} type="button" onClick={clearAllFilters}>
                    Show all pieces
                  </button>
                </div>
              </div>
            )}
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

const priceFilterOptions: Array<{
  label: string;
  compactLabel: string;
  value: CatalogPriceFilter;
}> = [
  { label: "All prices", compactLabel: "Price: All", value: "all" },
  { label: "Under $300", compactLabel: "Price: Under $300", value: "under-300" },
  { label: "$300–$600", compactLabel: "Price: $300–$600", value: "300-600" },
  { label: "$600+", compactLabel: "Price: $600+", value: "600-plus" },
];

const sizeFilterOptions: Array<{ label: string; compactLabel: string; value: CatalogSizeFilter }> = [
  { label: "All sizes", compactLabel: "Size: All", value: "all" },
  { label: "Small", compactLabel: "Size: Small", value: "small" },
  { label: "Medium", compactLabel: "Size: Medium", value: "medium" },
  { label: "Large", compactLabel: "Size: Large", value: "large" },
];

function matchesPriceFilter(
  product: CatalogProductCardViewModel,
  priceFilter: CatalogPriceFilter,
) {
  switch (priceFilter) {
    case "under-300":
      return product.priceUsd < 300;
    case "300-600":
      return product.priceUsd >= 300 && product.priceUsd <= 600;
    case "600-plus":
      return product.priceUsd > 600;
    case "all":
    default:
      return true;
  }
}

function matchesSizeFilter(product: CatalogProductCardViewModel, sizeFilter: CatalogSizeFilter) {
  if (sizeFilter === "all") {
    return true;
  }

  const sizeBucket = getProductSizeBucket(product);

  if (!sizeBucket) {
    return false;
  }

  return sizeBucket === sizeFilter;
}

function getProductSizeBucket(product: CatalogProductCardViewModel): Exclude<CatalogSizeFilter, "all"> | null {
  const sizeInCm = inferLargestDimensionCm(product);

  if (!sizeInCm) {
    return null;
  }

  if (sizeInCm <= 60) {
    return "small";
  }

  if (sizeInCm <= 180) {
    return "medium";
  }

  return "large";
}

function inferLargestDimensionCm(product: CatalogProductCardViewModel) {
  const label = product.dimensionsLabel;

  if (!label) {
    return null;
  }

  const pairedCentimeters = label.match(/(\d+(?:\.\d+)?)\s*[×x]\s*(\d+(?:\.\d+)?)\s*cm/i);

  if (pairedCentimeters) {
    return Math.max(
      Number.parseFloat(pairedCentimeters[1] ?? ""),
      Number.parseFloat(pairedCentimeters[2] ?? ""),
    );
  }

  const centimeterMatches = Array.from(label.matchAll(/(\d+(?:\.\d+)?)\s*cm/gi), (match) =>
    Number.parseFloat(match[1] ?? ""),
  ).filter((value) => Number.isFinite(value));

  if (centimeterMatches.length) {
    return Math.max(...centimeterMatches);
  }

  const pairedInches = label.match(/(\d+(?:\.\d+)?)"\s*[×x]\s*(\d+(?:\.\d+)?)"/i);

  if (pairedInches) {
    return (
      Math.max(
        Number.parseFloat(pairedInches[1] ?? ""),
        Number.parseFloat(pairedInches[2] ?? ""),
      ) * 2.54
    );
  }

  const inchMatches = Array.from(label.matchAll(/(\d+(?:\.\d+)?)"/g), (match) =>
    Number.parseFloat(match[1] ?? ""),
  ).filter((value) => Number.isFinite(value));

  if (!inchMatches.length) {
    return null;
  }

  return Math.max(...inchMatches) * 2.54;
}
