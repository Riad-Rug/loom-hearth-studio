// Pure filtering/sorting helpers for the shop page's category, price, size,
// availability, and sort controls, plus tolerant URL-param parsers for each. Kept
// dependency-free (no React) so they're trivial to reason about and reuse from
// catalog-page-view.tsx.
import {
  catalogCategoryFilterOptions,
  catalogSortOptions,
  catalogPriceBands,
  genericSizeFilterOptions,
  type CatalogPriceFilter,
  type CatalogSizeFilter,
  type CatalogSortOption,
  defaultCatalogSortOption,
} from "@/features/catalog/catalog-data";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import type { ProductCategory } from "@/types/domain";

function matchesPriceBucket(
  product: CatalogProductCardViewModel,
  bucket: CatalogPriceFilter,
): boolean {
  const band = catalogPriceBands.find((candidate) => candidate.value === bucket);

  if (!band) {
    return true;
  }

  return product.priceUsd >= band.min && (band.max === null || product.priceUsd < band.max);
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

// "Available now" keeps only pieces a shopper can buy: a sold piece is gone and
// a reserved one is held by an order while its buyer reviews photos. The card
// carries a status rather than a full product, so this compares statuses instead
// of calling getProductAvailability.
export function matchesAvailability(
  product: CatalogProductCardViewModel,
  availableOnly: boolean,
): boolean {
  if (!availableOnly) {
    return true;
  }

  return product.status !== "sold" && product.status !== "reserved";
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
  availableOnly: boolean,
): boolean {
  return matchesAvailability(product, availableOnly) && !product.isOutOfStock;
}

function listedAtMs(product: CatalogProductCardViewModel): number {
  const parsed = product.createdAt ? Date.parse(product.createdAt) : Number.NaN;

  return Number.isNaN(parsed) ? Number.NEGATIVE_INFINITY : parsed;
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
      // Array.sort is stable, so pieces listed at the same moment (a bulk import
      // shares one createdAt) and pieces with no date keep the incoming order.
      return [...products].sort((left, right) => {
        const leftMs = listedAtMs(left);
        const rightMs = listedAtMs(right);

        return rightMs > leftMs ? 1 : rightMs < leftMs ? -1 : 0;
      });
    case "featured":
    default:
      return products;
  }
}

export function parseSortOption(value: string | null): CatalogSortOption {
  return catalogSortOptions.find((option) => option.value === value)?.value ?? defaultCatalogSortOption;
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

const priceValues = catalogPriceBands.map((band) => band.value);

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
