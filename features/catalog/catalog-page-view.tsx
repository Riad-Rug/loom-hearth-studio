"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

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
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(() =>
    Boolean(
      parsePriceFilter(searchParams.get("price")) !== "all" ||
        parseSizeFilter(searchParams.get("size")) !== "all" ||
        parseSortOption(searchParams.get("sort")) !== "Featured",
    ),
  );
  const categoryMeta =
    category ? catalogCategories.find((item) => item.key === category) ?? null : null;
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
  const isRugOnlyView =
    products.length > 0 && products.every((product) => product.type === "rug");
  const sizeFilterOptions = isRugOnlyView ? rugSizeFilterOptions : genericSizeFilterOptions;
  const sizeBucketCounts = useMemo(() => {
    const counts: Record<Exclude<CatalogSizeFilter, "all">, number> = {
      small: 0,
      medium: 0,
      large: 0,
    };

    for (const product of products) {
      if (product.sizeBucket) {
        counts[product.sizeBucket] += 1;
      }
    }

    return counts;
  }, [products]);
  const visibleSizeFilterOptions = sizeFilterOptions.filter(
    (option) => option.value === "all" || sizeBucketCounts[option.value] > 0,
  );
  const showSizeFilter = visibleSizeFilterOptions.length > 1;
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
  const hasActiveFilters =
    Boolean(searchQuery.trim()) ||
    priceFilter !== "all" ||
    sizeFilter !== "all" ||
    sortOption !== "Featured";
  const activeFilterCount = [
    Boolean(searchQuery.trim()),
    priceFilter !== "all",
    sizeFilter !== "all",
    sortOption !== "Featured",
  ].filter(Boolean).length;
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
      <Section className={styles.shopHeader} tone="muted" width="wide">
        <div className={styles.shopHeaderTitleRow}>
          <h1>{heroTitle}</h1>
          <p>{totalProductCountLabel}</p>
        </div>
        {renderCategoryRail()}
        <div className={styles.filterBar}>
          <div className={styles.filterControlsRow}>
            <div className={styles.filterSearchShell}>
              <svg aria-hidden="true" className={styles.filterSearchIcon} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" />
                <path d="m20.5 20.5-4.4-4.4" />
              </svg>
              <label className={styles.srOnly} htmlFor="catalog-search">
                Search collection
              </label>
              <input
                id="catalog-search"
                name="q"
                className={styles.filterSearchInput}
                type="search"
                placeholder="Search by name, size, or material"
                value={searchQuery}
                autoComplete="off"
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                spellCheck={false}
              />
            </div>
            <button
              aria-controls="catalog-filter-groups"
              aria-expanded={isFilterPanelOpen}
              className={styles.filtersToggle}
              type="button"
              onClick={() => setIsFilterPanelOpen((current) => !current)}
            >
              Filters
              {activeFilterCount > 0 ? (
                <span className={styles.filterCountBadge}>{activeFilterCount}</span>
              ) : null}
              <svg aria-hidden="true" className={styles.filtersToggleChevron} viewBox="0 0 12 8">
                <path d="m1 1.5 5 5 5-5" />
              </svg>
            </button>
            <div
              className={styles.filterGroups}
              data-open={isFilterPanelOpen ? "true" : "false"}
              id="catalog-filter-groups"
            >
              <div aria-labelledby="catalog-price-label" className={styles.filterGroup} role="group">
                <span className={styles.filterGroupLabel} id="catalog-price-label">
                  Price
                </span>
                <div className={styles.segmentedControl}>
                  {priceFilterOptions.map((option) => (
                    <button
                      key={option.value}
                      aria-pressed={priceFilter === option.value}
                      className={`${styles.segmentButton} ${
                        priceFilter === option.value ? styles.segmentButtonActive : ""
                      }`}
                      type="button"
                      onClick={() => setPriceFilter(option.value)}
                    >
                      {option.segmentLabel}
                    </button>
                  ))}
                </div>
              </div>
              {showSizeFilter ? (
                <div aria-labelledby="catalog-size-label" className={styles.filterGroup} role="group">
                  <span className={styles.filterGroupLabel} id="catalog-size-label">
                    Size
                  </span>
                  <div className={styles.segmentedControl}>
                    {visibleSizeFilterOptions.map((option) => (
                      <button
                        key={option.value}
                        aria-pressed={sizeFilter === option.value}
                        className={`${styles.segmentButton} ${
                          sizeFilter === option.value ? styles.segmentButtonActive : ""
                        }`}
                        type="button"
                        onClick={() => setSizeFilter(option.value)}
                      >
                        {option.segmentLabel}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              <div
                aria-labelledby="catalog-sort-mobile-label"
                className={`${styles.filterGroup} ${styles.sortGroupMobile}`}
                role="group"
              >
                <span className={styles.filterGroupLabel} id="catalog-sort-mobile-label">
                  Sort
                </span>
                <div className={styles.segmentedControl}>
                  {catalogSortOptions.map((option) => (
                    <button
                      key={option}
                      aria-pressed={sortOption === option}
                      className={`${styles.segmentButton} ${
                        sortOption === option ? styles.segmentButtonActive : ""
                      }`}
                      type="button"
                      onClick={() => setSortOption(option)}
                    >
                      {shortSortLabels[option]}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <SortDropdown value={sortOption} onChange={setSortOption} />
          </div>
          <div className={styles.filterResultsRow}>
            <p className={styles.toolbarSummary}>
              <span className={styles.toolbarCount}>{resultCountLabel}</span>
              <span className={styles.toolbarTrustNote}>
                Every rug is ONE OF A KIND. Sold pieces are not restocked.
              </span>
            </p>
            {hasActiveFilters ? (
              <button className={styles.clearFiltersButton} type="button" onClick={clearAllFilters}>
                Clear filters ({activeFilterCount})
              </button>
            ) : null}
          </div>
          {hasActiveFilters ? (
            <div className={styles.activeFilterChips}>
              {searchQuery.trim() ? (
                <ActiveFilterChip
                  label={`“${searchQuery.trim()}”`}
                  onRemove={() => setSearchQuery("")}
                />
              ) : null}
              {priceFilter !== "all" ? (
                <ActiveFilterChip
                  label={
                    priceFilterOptions.find((option) => option.value === priceFilter)?.segmentLabel ??
                    priceFilter
                  }
                  onRemove={() => setPriceFilter("all")}
                />
              ) : null}
              {sizeFilter !== "all" ? (
                <ActiveFilterChip
                  label={
                    sizeFilterOptions.find((option) => option.value === sizeFilter)?.segmentLabel ??
                    sizeFilter
                  }
                  onRemove={() => setSizeFilter("all")}
                />
              ) : null}
              {sortOption !== "Featured" ? (
                <ActiveFilterChip
                  label={shortSortLabels[sortOption]}
                  onRemove={() => setSortOption("Featured")}
                />
              ) : null}
            </div>
          ) : null}
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
                    starts. Browse the related pieces without losing the room direction.
                  </p>
                </div>
              </div>
            ) : null}

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
  segmentLabel: string;
  value: CatalogPriceFilter;
}> = [
  { label: "All prices", segmentLabel: "All", value: "all" },
  { label: "Under $300", segmentLabel: "Under $300", value: "under-300" },
  { label: "$300–$600", segmentLabel: "$300–$600", value: "300-600" },
  { label: "$600+", segmentLabel: "$600+", value: "600-plus" },
];

type SizeFilterOption = { label: string; segmentLabel: string; value: CatalogSizeFilter };

// Size buckets are category-relative: the server classifies each product against
// its own category's scale (see getProductSizeBucket in lib/catalog/service.ts).
// On rug-only views the segments speak the rug vocabulary shoppers actually use.
const rugSizeFilterOptions: SizeFilterOption[] = [
  { label: "All sizes", segmentLabel: "All", value: "all" },
  { label: "Accent · under 6 ft", segmentLabel: "Under 6 ft", value: "small" },
  { label: "Mid-size · 6–8 ft", segmentLabel: "6–8 ft", value: "medium" },
  { label: "Large · 8 ft +", segmentLabel: "8 ft +", value: "large" },
];

const genericSizeFilterOptions: SizeFilterOption[] = [
  { label: "All sizes", segmentLabel: "All", value: "all" },
  { label: "Small", segmentLabel: "Small", value: "small" },
  { label: "Medium", segmentLabel: "Medium", value: "medium" },
  { label: "Large", segmentLabel: "Large", value: "large" },
];

const shortSortLabels: Record<CatalogSortOption, string> = {
  Featured: "Featured",
  Newest: "Newest",
  "Price: Low to High": "Price low–high",
  "Price: High to Low": "Price high–low",
};

type SortDropdownProps = {
  value: CatalogSortOption;
  onChange: (option: CatalogSortOption) => void;
};

function SortDropdown({ value, onChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const shellRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (!shellRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        buttonRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    const selectedOption = shellRef.current?.querySelector<HTMLButtonElement>(
      "li button[data-selected='true']",
    );
    (selectedOption ?? shellRef.current?.querySelector<HTMLButtonElement>("li button"))?.focus();

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function handleMenuKeyDown(event: React.KeyboardEvent<HTMLUListElement>) {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") {
      return;
    }

    event.preventDefault();

    const options = Array.from(
      shellRef.current?.querySelectorAll<HTMLButtonElement>("li button") ?? [],
    );

    if (!options.length) {
      return;
    }

    const currentIndex = options.indexOf(document.activeElement as HTMLButtonElement);
    const nextIndex =
      event.key === "ArrowDown"
        ? (currentIndex + 1) % options.length
        : (currentIndex - 1 + options.length) % options.length;

    options[nextIndex]?.focus();
  }

  return (
    <div ref={shellRef} className={styles.sortShell}>
      <button
        ref={buttonRef}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        className={styles.sortButton}
        type="button"
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>
          Sort: <strong className={styles.sortButtonValue}>{shortSortLabels[value]}</strong>
        </span>
        <svg aria-hidden="true" className={styles.sortChevron} viewBox="0 0 12 8">
          <path d="m1 1.5 5 5 5-5" />
        </svg>
      </button>
      {isOpen ? (
        <ul
          aria-label="Sort products"
          className={styles.sortMenu}
          role="listbox"
          onKeyDown={handleMenuKeyDown}
        >
          {catalogSortOptions.map((option) => (
            <li key={option} aria-selected={option === value} role="option">
              <button
                className={`${styles.sortOption} ${
                  option === value ? styles.sortOptionSelected : ""
                }`}
                data-selected={option === value ? "true" : "false"}
                type="button"
                onClick={() => {
                  onChange(option);
                  setIsOpen(false);
                  buttonRef.current?.focus();
                }}
              >
                <svg aria-hidden="true" className={styles.sortCheck} viewBox="0 0 14 12">
                  <path d="m1.5 6.5 3.5 3.5L12.5 1.5" />
                </svg>
                {option}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

type ActiveFilterChipProps = {
  label: string;
  onRemove: () => void;
};

function ActiveFilterChip({ label, onRemove }: ActiveFilterChipProps) {
  return (
    <button
      aria-label={`Remove filter: ${label}`}
      className={styles.activeFilterChip}
      type="button"
      onClick={onRemove}
    >
      {label}
      <svg aria-hidden="true" className={styles.activeFilterChipIcon} viewBox="0 0 10 10">
        <path d="m1.5 1.5 7 7m0-7-7 7" />
      </svg>
    </button>
  );
}

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

  if (!product.sizeBucket) {
    return false;
  }

  return product.sizeBucket === sizeFilter;
}

