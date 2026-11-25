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
// a reserved one is held by an order while its buyer reviews photos, and an
// out-of-stock multi-unit piece has nothing left.
export function matchesAvailability(
  product: CatalogProductCardViewModel,
  availableOnly: boolean,
): boolean {
  if (!availableOnly) {
    return true;
  }

  return product.availability === "available";
}

/**
 * Whether a product counts toward its category's filter-sidebar availability.
 * An out-of-stock multi-unit piece never counts, so a category's checkbox does
 * not look tickable when ticking it would surface nothing a shopper can buy.
 */
export function countsTowardCategoryAvailability(
  product: CatalogProductCardViewModel,
  availableOnly: boolean,
): boolean {
  return availableOnly ? product.availability === "available" : product.availability !== "outOfStock";
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

/**
 * Type and Region filter options, in menu order (lib/catalog/rug-facets.ts).
 * Slugs are data-driven (regions are added in the admin), so the valid values
 * come from the options the server passed rather than a fixed list.
 */
export type RugFilterOption = {
  kind: "type" | "region";
  slug: string;
  label: string;
  /** Regions only: shown indented under this parent. */
  parentSlug?: string;
};

export function parseRugFacetFilter(value: string | null, options: readonly RugFilterOption[]): string[] {
  return parseMultiSelect(value, options.map((option) => option.slug));
}

export function serializeRugFacetFilter(selected: readonly string[], options: readonly RugFilterOption[]): string {
  return serializeMultiSelect(selected, options.map((option) => option.slug));
}

export function toggleRugFacetFilter(
  selected: readonly string[],
  slug: string,
  options: readonly RugFilterOption[],
): string[] {
  return toggleMultiSelect(selected, slug, options.map((option) => option.slug));
}

// Multi-select, no selection means every rug. A parent region matches its
// children's rugs because a card carries its region's parent slug too.
export function matchesRugTypeFilter(product: CatalogProductCardViewModel, selectedTypes: readonly string[]) {
  return !selectedTypes.length || (product.rugTypeSlug !== undefined && selectedTypes.includes(product.rugTypeSlug));
}

export function matchesRugRegionFilter(product: CatalogProductCardViewModel, selectedRegions: readonly string[]) {
  return !selectedRegions.length || (product.rugRegionSlugs ?? []).some((slug) => selectedRegions.includes(slug));
}

/**
 * The options worth offering for these products: each Type or Region with at
 * least one rug a shopper can buy, so an empty one never shows. A group with a
 * single option is no choice and is dropped by the caller.
 */
export function listOfferedRugFilterOptions(
  options: readonly RugFilterOption[],
  products: readonly CatalogProductCardViewModel[],
) {
  const buyable = products.filter((product) => product.availability === "available");

  return options.filter((option) =>
    buyable.some((product) =>
      option.kind === "type" ? product.rugTypeSlug === option.slug : product.rugRegionSlugs?.includes(option.slug),
    ),
  );
}
