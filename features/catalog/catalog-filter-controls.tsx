"use client";

import Link from "next/link";
import { useEffect, useId, useState } from "react";

import {
  catalogCategoryFilterOptions,
  catalogPriceFilterOptions,
  catalogSortOptions,
  type CatalogPriceFilter,
  type CatalogSizeFilter,
  type CatalogSizeFilterOption,
  type CatalogSortOption,
} from "@/features/catalog/catalog-data";
import type { ProductCategory } from "@/types/domain";

// null when the category group isn't a filter at all (category-scoped routes);
// otherwise how many products each category would contribute under the other
// active filters, ignoring category selection itself. A missing/zero entry
// means ticking that option right now would add nothing to the grid.
export type CatalogCategoryAvailability = Partial<Record<ProductCategory, number>> | null;

import styles from "./catalog-page.module.css";

// Keep in sync with the site header's own collapse breakpoint (app/globals.css,
// ".site-header__menu-button" / ".site-header__mobile-menu" media query). Above it
// the panel is a persistent left sidebar; below it, a disclosure above the grid.
const MOBILE_LAYOUT_QUERY = "(max-width: 900px)";

/**
 * "select": the general /shop route holds every category, so the group is a
 * reload-free client-side multi-select.
 * "navigate": category routes were server-filtered to one category, so a
 * checkbox there could never reveal anything. The same options render as real
 * links to each category's route instead of a control that does nothing.
 */
export type CatalogCategoryFilterMode = "select" | "navigate";

type CatalogFilterControlsProps = {
  categoryMode: CatalogCategoryFilterMode;
  activeCategory?: ProductCategory;
  selectedCategories: readonly ProductCategory[];
  onCategoryToggle: (value: ProductCategory) => void;
  categoryAvailability: CatalogCategoryAvailability;
  selectedPrices: readonly CatalogPriceFilter[];
  onPriceToggle: (value: CatalogPriceFilter) => void;
  selectedSizes: readonly CatalogSizeFilter[];
  onSizeToggle: (value: CatalogSizeFilter) => void;
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
  categoryMode,
  activeCategory,
  selectedCategories,
  onCategoryToggle,
  categoryAvailability,
  selectedPrices,
  onPriceToggle,
  selectedSizes,
  onSizeToggle,
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
  const categoryLabelId = useId();
  const priceLabelId = useId();
  const sizeLabelId = useId();
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
        {categoryMode === "select" ? (
          <div
            aria-labelledby={categoryLabelId}
            className={styles.filterGroup}
            role="group"
          >
            <span className={styles.filterGroupLabel} id={categoryLabelId}>
              Category
            </span>
            <div className={styles.filterCheckList}>
              {catalogCategoryFilterOptions.map((option) => {
                const isChecked = selectedCategories.includes(option.value);
                // A category already ticked stays interactive even at zero count
                // under the current filters, so a shopper can always uncheck it.
                const isUnavailable = !isChecked && categoryAvailability?.[option.value] === undefined;

                return (
                  <label
                    key={option.value}
                    className={styles.filterCheck}
                    data-active={isChecked ? "true" : undefined}
                    data-unavailable={isUnavailable ? "true" : undefined}
                  >
                    <input
                      checked={isChecked}
                      className={styles.filterCheckInput}
                      disabled={isUnavailable}
                      type="checkbox"
                      onChange={() => onCategoryToggle(option.value)}
                    />
                    <span>{option.label}</span>
                  </label>
                );
              })}
            </div>
          </div>
        ) : (
          <nav aria-label="Category" className={styles.filterGroup}>
            <span className={styles.filterGroupLabel}>Category</span>
            <div className={styles.filterChipRow}>
              <Link className={styles.filterChip} href="/shop">
                All pieces
              </Link>
              {catalogCategoryFilterOptions.map((option) => {
                const isCurrent = option.value === activeCategory;

                // aria-current is "true", not "page": on /shop/rugs/[style] the
                // Rugs link is the current category but a broader page than the
                // one being viewed.
                return (
                  <Link
                    key={option.value}
                    aria-current={isCurrent ? "true" : undefined}
                    className={styles.filterChip}
                    data-active={isCurrent ? "true" : undefined}
                    href={option.href}
                  >
                    {option.label}
                  </Link>
                );
              })}
            </div>
          </nav>
        )}

        <div aria-labelledby={priceLabelId} className={styles.filterGroup} role="group">
          <span className={styles.filterGroupLabel} id={priceLabelId}>
            Price
          </span>
          <div className={styles.filterCheckList}>
            {catalogPriceFilterOptions.map((option) => {
              const isChecked = selectedPrices.includes(option.value);

              return (
                <label
                  key={option.value}
                  className={styles.filterCheck}
                  data-active={isChecked ? "true" : undefined}
                >
                  <input
                    checked={isChecked}
                    className={styles.filterCheckInput}
                    type="checkbox"
                    onChange={() => onPriceToggle(option.value)}
                  />
                  <span>{option.label}</span>
                </label>
              );
            })}
          </div>
        </div>

        {showSizeFilter ? (
          <div aria-labelledby={sizeLabelId} className={styles.filterGroup} role="group">
            <span className={styles.filterGroupLabel} id={sizeLabelId}>
              Size
            </span>
            <div className={styles.filterCheckList}>
              {sizeOptions.map((option) => {
                const isChecked = selectedSizes.includes(option.value);

                return (
                  <label
                    key={option.value}
                    className={styles.filterCheck}
                    data-active={isChecked ? "true" : undefined}
                  >
                    <input
                      // Rug-only views spell out the footprint range ("Small, 13
                      // to 17 square feet") so screen readers never read "ft²"
                      // raw from the visible hint line below the label.
                      aria-label={option.spokenLabel}
                      checked={isChecked}
                      className={styles.filterCheckInput}
                      type="checkbox"
                      onChange={() => onSizeToggle(option.value)}
                    />
                    {option.hint ? (
                      <span className={styles.filterCheckStack}>
                        <span>{option.label}</span>
                        <span aria-hidden="true" className={styles.filterCheckHint}>
                          {option.hint}
                        </span>
                      </span>
                    ) : (
                      <span>{option.label}</span>
                    )}
                  </label>
                );
              })}
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
