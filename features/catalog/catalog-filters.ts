// Pure filtering/sorting helpers for the shop page's category, price, size,
// availability, and sort controls, plus tolerant URL-param parsers for each. Kept
// dependency-free (no React) so they're trivial to reason about and reuse from
// catalog-page-view.tsx.
import {
  catalogCategoryFilterOptions,
  type CatalogPriceFilter,
  type CatalogSizeFilter,
  type CatalogSortOption,
} from "@/features/catalog/catalog-data";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import type { ProductCategory } from "@/types/domain";

export function matchesPriceFilter(
  product: CatalogProductCardViewModel,
  priceFilter: CatalogPriceFilter,
): boolean {
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

export function matchesSizeFilter(
  product: CatalogProductCardViewModel,
  sizeFilter: CatalogSizeFilter,
): boolean {
  if (sizeFilter === "all") {
    // Products without dimensions (no sizeBucket) still belong in the unfiltered view.
    return true;
  }

  if (!product.sizeBucket) {
    return false;
  }

  return product.sizeBucket === sizeFilter;
}

export function matchesCategoryFilter(
  product: CatalogProductCardViewModel,
  selectedCategories: readonly ProductCategory[],
): boolean {
  // No selection means "every category", the same way "all" works elsewhere.
  if (!selectedCategories.length) {
    return true;
  }

  return selectedCategories.includes(product.category);
}

export function matchesAvailability(
  product: CatalogProductCardViewModel,
  hideSold: boolean,
): boolean {
  if (!hideSold) {
    return true;
  }

  return product.status !== "sold";
}

export function sortCatalogProducts(
  products: CatalogProductCardViewModel[],
  sortOption: CatalogSortOption,
): CatalogProductCardViewModel[] {
  switch (sortOption) {
    case "price-asc":
      return [...products].sort((left, right) => left.priceUsd - right.priceUsd);
    case "price-desc":
      return [...products].sort((left, right) => right.priceUsd - left.priceUsd);
    case "newest":
    default:
      // Already in `updatedAt desc` order from the repository — no reorder needed.
      return products;
  }
}

export function parseSortOption(value: string | null): CatalogSortOption {
  return value === "price-asc" || value === "price-desc" ? value : "newest";
}

export function parsePriceFilter(value: string | null): CatalogPriceFilter {
  return value === "under-300" || value === "300-600" || value === "600-plus" ? value : "all";
}

const sizeFilterValues: readonly CatalogSizeFilter[] = [
  "accent",
  "small",
  "medium",
  "large",
  "oversized",
];

export function parseSizeFilter(value: string | null): CatalogSizeFilter {
  return sizeFilterValues.find((candidate) => candidate === value) ?? "all";
}

/**
 * Reads the comma-separated `category` param into a de-duplicated list, in the
 * canonical option order so the value the URL round-trips to is stable no matter
 * what order the shopper ticked the boxes in. Unknown keys are dropped.
 */
export function parseCategoryFilter(value: string | null): ProductCategory[] {
  if (!value) {
    return [];
  }

  const requested = new Set(
    value
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean),
  );

  return catalogCategoryFilterOptions
    .filter((option) => requested.has(option.value))
    .map((option) => option.value);
}

export function serializeCategoryFilter(selectedCategories: readonly ProductCategory[]): string {
  return catalogCategoryFilterOptions
    .filter((option) => selectedCategories.includes(option.value))
    .map((option) => option.value)
    .join(",");
}

export function toggleCategoryFilter(
  selectedCategories: readonly ProductCategory[],
  category: ProductCategory,
): ProductCategory[] {
  const next = selectedCategories.includes(category)
    ? selectedCategories.filter((candidate) => candidate !== category)
    : [...selectedCategories, category];

  return catalogCategoryFilterOptions
    .filter((option) => next.includes(option.value))
    .map((option) => option.value);
}
