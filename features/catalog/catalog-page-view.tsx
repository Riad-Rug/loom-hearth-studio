"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Section } from "@/components/layout/section";
import {
  catalogCategories,
  catalogLanding,
  catalogSortOptions,
} from "@/features/catalog/catalog-data";
import { CatalogHistoryRecorder } from "@/features/catalog/catalog-history-recorder";
import { CatalogProductBrowser } from "@/features/catalog/catalog-product-browser";
import { lookbookSceneContext } from "@/features/lookbook/lookbook-scene-context";
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
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [sortOption, setSortOption] = useState<CatalogSortOption>(() =>
    parseSortOption(searchParams.get("sort")),
  );
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const [priceFilter, setPriceFilter] = useState<CatalogPriceFilter>(() =>
    parsePriceFilter(searchParams.get("price")),
  );
  const [sizeFilter, setSizeFilter] = useState<CatalogSizeFilter>(() =>
    parseSizeFilter(searchParams.get("size")),
  );
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
  const totalProductCountLabel = `${products.length} ${products.length === 1 ? "piece" : "pieces"}`;
  const resultCountLabel = `${filteredProducts.length} ${
    filteredProducts.length === 1 ? "piece" : "pieces"
  }`;
  const sidebarCopy =
    category || hasExactCategoryLink
      ? heroCopy
      : "Handcrafted rugs, poufs, and decor from Marrakech. ONE OF A KIND pieces do not return once sold.";
  const selectedCategoryHref =
    collection?.href && hasExactCategoryLink ? collection.href : categoryMeta?.href ?? "/shop";
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    priceFilter !== "all" ||
    sizeFilter !== "all" ||
    sortOption !== "Featured";
  const primaryHeroActionLabel = category || collection?.href ? "Browse all pieces" : "Shop rugs";
  const primaryHeroActionHref = category || collection?.href ? "#shop-products" : "/shop/rugs";
  const lookbookSceneId = searchParams.get("scene");
  const fromLookbook = searchParams.get("from") === "lookbook";
  const lookbookContext = useMemo(() => {
    if (!fromLookbook || !lookbookSceneId) {
      return null;
    }

    return lookbookSceneContext.find((item) => item.id === lookbookSceneId) ?? null;
  }, [fromLookbook, lookbookSceneId]);

  useEffect(() => {
    const nextParams = new URLSearchParams(searchParams.toString());
    const trimmedQuery = searchQuery.trim();

    updateQueryParam(nextParams, "q", trimmedQuery);
    updateQueryParam(nextParams, "price", priceFilter === "all" ? "" : priceFilter);
    updateQueryParam(nextParams, "size", sizeFilter === "all" ? "" : sizeFilter);
    updateQueryParam(nextParams, "sort", sortOption === "Featured" ? "" : sortOption);

    const nextQuery = nextParams.toString();
    const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
    const currentHref = `${pathname}${searchParams.toString() ? `?${searchParams.toString()}` : ""}`;

    if (nextHref !== currentHref) {
      router.replace(nextHref as Route, { scroll: false });
    }
  }, [pathname, priceFilter, router, searchParams, searchQuery, sizeFilter, sortOption]);

  const clearAllFilters = () => {
    setSearchQuery("");
    setPriceFilter("all");
    setSizeFilter("all");
    setSortOption("Featured");
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
          <p>{totalProductCountLabel}</p>
        </div>
        <p className={styles.mobileShopIntro}>
          Handcrafted rugs, poufs, pillows, and decor sourced from Marrakech.
        </p>
        {renderCategoryRail()}
        <div className={`${styles.catalogToolbar} ${styles.mobileCatalogToolbar}`}>
          <p className={styles.toolbarSummary}>
            <span className={styles.toolbarCount}>{resultCountLabel}</span>
            <span className={styles.toolbarTrustNote}>Every rug is ONE OF A KIND. Sold pieces are not restocked.</span>
          </p>
          <div className={styles.compactToolbarRow}>
            <div className={styles.searchInlineShell}>
              <label className={styles.srOnly} htmlFor="catalog-search-mobile">
                Search collection
              </label>
                <input
                  id="catalog-search-mobile"
                  name="q"
                  className={styles.searchInlineInput}
                  type="search"
                  placeholder="Search by name, size, or material"
                  value={searchQuery}
                  autoComplete="off"
                  onChange={(event) => setSearchQuery(event.currentTarget.value)}
                  spellCheck={false}
                />
            </div>
            <div className={styles.compactSelectShell}>
              <label className={styles.srOnly} htmlFor="catalog-category-mobile">
                Category
              </label>
                <select
                  id="catalog-category-mobile"
                  name="category"
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
                  name="price"
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
                  name="size"
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
                  name="sort"
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

      <Section className={styles.desktopShopHero} width="wide">
        <div className={styles.shopHeroPanel}>
          <div className={styles.shopHeroCopy}>
            <p className={styles.eyebrow}>{heroEyebrow}</p>
            <h1>{heroTitle}</h1>
            <p>{heroCopy}</p>
            <div className={styles.shopHeroActions}>
              <Link className={styles.primaryAction} href={primaryHeroActionHref as Route}>
                {primaryHeroActionLabel}
              </Link>
              <Link className={styles.secondaryAction} href="/sourcing">
                Read how we source
              </Link>
            </div>
          </div>
          <div className={styles.shopHeroAside} aria-label="Collection service details">
            <p className={styles.shopHeroCount}>{totalProductCountLabel}</p>
            <div className={styles.shopHeroHighlights}>
              <span>One of a kind inventory</span>
              <span>Colour verified before payment</span>
              <span>Ships from Morocco</span>
            </div>
          </div>
        </div>
      </Section>

      <Section className={styles.productsSection} id="shop-products" width="wide">
        <div className={styles.catalogShell}>
          <aside className={styles.catalogSidebar}>
            <div className={styles.sidebarPanel}>
              <p className={styles.sidebarHeading}>Categories</p>
              <p className={styles.sidebarPanelCopy}>{sidebarCopy}</p>
              <div className={styles.sidebarCategoryRail}>{renderCategoryRail()}</div>
            </div>
          </aside>

          <div className={styles.catalogContent}>
            {lookbookContext ? (
              <div className={styles.lookbookContextBanner}>
                <p className={styles.lookbookContextEyebrow}>From the lookbook</p>
                <div className={styles.lookbookContextBannerBody}>
                  <h2>{lookbookContext.title}</h2>
                  <p>
                    This collection is where that {lookbookContext.roomLabel.toLowerCase()} scene
                    starts. Browse the related pieces without losing the editorial thread.
                  </p>
                </div>
              </div>
            ) : null}
            <div className={styles.catalogToolbar}>
              <div className={styles.toolbarHeader}>
                <div>
                  <p className={styles.toolbarEyebrow}>Browse collection</p>
                  <h2>Find the piece that fits the room.</h2>
                </div>
                <p className={styles.toolbarSummary}>
                  <span className={styles.toolbarCount}>{resultCountLabel}</span>
                  <span className={styles.toolbarTrustNote}>One of a kind pieces are not restocked.</span>
                </p>
              </div>
              <div className={styles.compactToolbarRow}>
                <div className={styles.searchInlineShell}>
                  <label className={styles.srOnly} htmlFor="catalog-search">
                    Search collection
                  </label>
                  <input
                    id="catalog-search"
                    name="q"
                    className={styles.searchInlineInput}
                    type="search"
                    placeholder="Search by name, size, or material"
                    value={searchQuery}
                    autoComplete="off"
                    onChange={(event) => setSearchQuery(event.currentTarget.value)}
                    spellCheck={false}
                  />
                </div>
                <div className={styles.compactSelectShell}>
                  <label className={styles.srOnly} htmlFor="catalog-category">
                    Category
                  </label>
                  <select
                    id="catalog-category"
                    name="category"
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
                    name="price"
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
                    name="size"
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
                    name="sort"
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

function updateQueryParam(params: URLSearchParams, key: string, value: string) {
  if (value) {
    params.set(key, value);
    return;
  }

  params.delete(key);
}

function parseSortOption(value: string | null): CatalogSortOption {
  return catalogSortOptions.includes(value as CatalogSortOption)
    ? (value as CatalogSortOption)
    : "Featured";
}

function parsePriceFilter(value: string | null): CatalogPriceFilter {
  return value === "under-300" || value === "300-600" || value === "600-plus"
    ? value
    : "all";
}

function parseSizeFilter(value: string | null): CatalogSizeFilter {
  return value === "small" || value === "medium" || value === "large" ? value : "all";
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

