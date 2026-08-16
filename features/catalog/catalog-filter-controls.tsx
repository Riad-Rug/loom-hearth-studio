"use client";

import { useEffect, useId, useState } from "react";

import {
  catalogPriceFilterOptions,
  catalogSortOptions,
  type CatalogPriceFilter,
  type CatalogSizeFilter,
  type CatalogSortOption,
} from "@/features/catalog/catalog-data";

import styles from "./catalog-page.module.css";

// Keep in sync with the site header's own collapse breakpoint (app/globals.css,
// ".site-header__menu-button" / ".site-header__mobile-menu" media query).
const MOBILE_LAYOUT_QUERY = "(max-width: 900px)";

type CatalogSizeFilterOption = { value: CatalogSizeFilter; label: string };

type CatalogFilterControlsProps = {
  priceFilter: CatalogPriceFilter;
  onPriceFilterChange: (value: CatalogPriceFilter) => void;
  sizeFilter: CatalogSizeFilter;
  onSizeFilterChange: (value: CatalogSizeFilter) => void;
  sizeOptions: readonly CatalogSizeFilterOption[];
  showSizeFilter: boolean;
  sortOption: CatalogSortOption;
  onSortOptionChange: (value: CatalogSortOption) => void;
  hideSold: boolean;
  onHideSoldChange: (value: boolean) => void;
  activeFilterCount: number;
  onClearAll: () => void;
};

export function CatalogFilterControls({
  priceFilter,
  onPriceFilterChange,
  sizeFilter,
  onSizeFilterChange,
  sizeOptions,
  showSizeFilter,
  sortOption,
  onSortOptionChange,
  hideSold,
  onHideSoldChange,
  activeFilterCount,
  onClearAll,
}: CatalogFilterControlsProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMobileLayout, setIsMobileLayout] = useState(false);
  const sortSelectId = useId();
  const groupsId = useId();
  const hasActiveFilters = activeFilterCount > 0;

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_LAYOUT_QUERY);

    function syncLayout() {
      setIsMobileLayout(mediaQuery.matches);
    }

    syncLayout();
    mediaQuery.addEventListener("change", syncLayout);

    return () => {
      mediaQuery.removeEventListener("change", syncLayout);
    };
  }, []);

  return (
    <div className={styles.filterPanel}>
      <button
        aria-controls={groupsId}
        aria-expanded={isMobileOpen}
        className={styles.mobileFiltersToggle}
        type="button"
        onClick={() => setIsMobileOpen((current) => !current)}
      >
        Filters &amp; sort
        {hasActiveFilters ? (
          <span className={styles.mobileFiltersToggleBadge}>{activeFilterCount}</span>
        ) : null}
        <svg aria-hidden="true" className={styles.mobileFiltersToggleChevron} viewBox="0 0 12 8">
          <path d="m1 1.5 5 5 5-5" />
        </svg>
      </button>

      <div
        className={styles.filterGroups}
        data-open={isMobileOpen ? "true" : "false"}
        id={groupsId}
        inert={isMobileLayout && !isMobileOpen}
      >
        <div aria-label="Price" className={styles.filterGroup} role="group">
          <span className={styles.filterGroupLabel}>Price</span>
          <div className={styles.filterChipRow}>
            {catalogPriceFilterOptions.map((option) => (
              <button
                key={option.value}
                aria-pressed={priceFilter === option.value}
                className={styles.filterChip}
                data-active={priceFilter === option.value ? "true" : undefined}
                type="button"
                onClick={() => onPriceFilterChange(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {showSizeFilter ? (
          <div aria-label="Size" className={styles.filterGroup} role="group">
            <span className={styles.filterGroupLabel}>Size</span>
            <div className={styles.filterChipRow}>
              {sizeOptions.map((option) => (
                <button
                  key={option.value}
                  aria-pressed={sizeFilter === option.value}
                  className={styles.filterChip}
                  data-active={sizeFilter === option.value ? "true" : undefined}
                  type="button"
                  onClick={() => onSizeFilterChange(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        ) : null}

        <div className={styles.filterGroup}>
          <label className={styles.filterGroupLabel} htmlFor={sortSelectId}>
            Sort
          </label>
          <select
            className={styles.filterSortSelect}
            id={sortSelectId}
            value={sortOption}
            onChange={(event) => onSortOptionChange(event.currentTarget.value as CatalogSortOption)}
          >
            {catalogSortOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <button
          aria-pressed={hideSold}
          className={styles.filterChip}
          data-active={hideSold ? "true" : undefined}
          type="button"
          onClick={() => onHideSoldChange(!hideSold)}
        >
          Hide sold pieces
        </button>

        {hasActiveFilters ? (
          <p className={styles.filterSummary}>
            {activeFilterCount} {activeFilterCount === 1 ? "filter" : "filters"} ·{" "}
            <button className={styles.filterClearButton} type="button" onClick={onClearAll}>
              Clear all
            </button>
          </p>
        ) : null}
      </div>
    </div>
  );
}
