// Pure filtering/sorting helpers for the shop page's category, price, size,
// availability, and sort controls, plus tolerant URL-param parsers for each. Kept
// dependency-free (no React) so they're trivial to reason about and reuse from
// catalog-page-view.tsx.
import {
  catalogCategoryFilterOptions,
  catalogPriceFilterOptions,
  genericSizeFilterOptions,
  type CatalogPriceFilter,
  type CatalogSizeFilter,
  type CatalogSortOption,
} from "@/features/catalog/catalog-data";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import type { ProductCategory } from "@/types/domain";

function matchesPriceBucket(
  product: CatalogProductCardViewModel,
  bucket: CatalogPriceFilter,
): boolean {
  switch (bucket) {
    case "under-300":
      return product.priceUsd < 300;
    case "300-600":
      return product.priceUsd >= 300 && product.priceUsd <= 600;
    case "600-plus":
      return product.priceUsd > 600;
    default:
      return true;
  }
}

// Multi-select, same shape as category: no selection means "every price".
export function matchesPriceFilter(
  product: CatalogProductCardViewModel,
  selectedPrices: readonly CatalogPriceFilter[],
): boolean {
  if (!selectedPrices.length) {
    return true;
  }

  return selectedPrices.some((bucket) => matchesPriceBucket(product, bucket));
}

export function matchesSearchQuery(
  product: CatalogProductCardViewModel,
  normalizedQuery: string,
): boolean {
  if (!normalizedQuery) {
    return true;
  }

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

  return haystack.includes(normalizedQuery);
}

// Multi-select, same shape as category and price: no selection means "every
// size", which is also how products without dimensions (no sizeBucket) stay in
// the unfiltered view.
export function matchesSizeFilter(
  product: CatalogProductCardViewModel,
  selectedSizes: readonly CatalogSizeFilter[],
): boolean {
  if (!selectedSizes.length) {
    return true;
  }

  if (!product.sizeBucket) {
    return false;
  }

  return selectedSizes.includes(product.sizeBucket);
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

/**
 * Whether a product counts toward its category's filter-sidebar availability.
 * Stricter than matchesAvailability on purpose: an out-of-stock multi-unit piece
 * still belongs in the grid (it keeps its unavailable/notify-me treatment on the
 * card), but it must not make a category's checkbox look tickable when checking
 * it would surface nothing a shopper can buy. Rugs are quantity-1 pieces with no
 * inventory, so they keep the plain matchesAvailability behaviour.
 */
export function countsTowardCategoryAvailability(
  product: CatalogProductCardViewModel,
  hideSold: boolean,
): boolean {
  return matchesAvailability(product, hideSold) && !product.isOutOfStock;
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

/**
 * Reads a comma-separated multi-select param into a de-duplicated list, in the
 * canonical option order so the value the URL round-trips to is stable no matter
 * what order the shopper ticked the boxes in. Unknown values are dropped. Shared
 * by the category, price, and size filters, which all work this way.
 */
function parseMultiSelect<T extends string>(value: string | null, validValues: readonly T[]): T[] {
  if (!value) {
    return [];
  }

  const requested = new Set(
    value
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean),
  );

  return validValues.filter((candidate) => requested.has(candidate));
}

function serializeMultiSelect<T extends string>(
  selected: readonly T[],
  validValues: readonly T[],
): string {
  return validValues.filter((candidate) => selected.includes(candidate)).join(",");
}

function toggleMultiSelect<T extends string>(
  selected: readonly T[],
  value: T,
  validValues: readonly T[],
): T[] {
  const next = selected.includes(value)
    ? selected.filter((candidate) => candidate !== value)
    : [...selected, value];

  return validValues.filter((candidate) => next.includes(candidate));
}

const categoryValues = catalogCategoryFilterOptions.map((option) => option.value);

export function parseCategoryFilter(value: string | null): ProductCategory[] {
  return parseMultiSelect(value, categoryValues);
}

export function serializeCategoryFilter(selectedCategories: readonly ProductCategory[]): string {
  return serializeMultiSelect(selectedCategories, categoryValues);
}

export function toggleCategoryFilter(
  selectedCategories: readonly ProductCategory[],
  category: ProductCategory,
): ProductCategory[] {
  return toggleMultiSelect(selectedCategories, category, categoryValues);
}

const priceValues = catalogPriceFilterOptions.map((option) => option.value);

export function parsePriceFilter(value: string | null): CatalogPriceFilter[] {
  return parseMultiSelect(value, priceValues);
}

export function serializePriceFilter(selectedPrices: readonly CatalogPriceFilter[]): string {
  return serializeMultiSelect(selectedPrices, priceValues);
}

export function togglePriceFilter(
  selectedPrices: readonly CatalogPriceFilter[],
  price: CatalogPriceFilter,
): CatalogPriceFilter[] {
  return toggleMultiSelect(selectedPrices, price, priceValues);
}

// The rug-only and generic option lists carry the same five tiers in the same
// order (only their labels/hints differ), so either one defines the canonical
// order for the URL param.
const sizeValues = genericSizeFilterOptions.map((option) => option.value);

export function parseSizeFilter(value: string | null): CatalogSizeFilter[] {
  return parseMultiSelect(value, sizeValues);
}

export function serializeSizeFilter(selectedSizes: readonly CatalogSizeFilter[]): string {
  return serializeMultiSelect(selectedSizes, sizeValues);
}

export function toggleSizeFilter(
  selectedSizes: readonly CatalogSizeFilter[],
  size: CatalogSizeFilter,
): CatalogSizeFilter[] {
  return toggleMultiSelect(selectedSizes, size, sizeValues);
}
