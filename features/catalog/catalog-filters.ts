// Pure filtering/sorting helpers for the shop page's price, size, availability,
// and sort controls, plus tolerant URL-param parsers for each. Kept dependency-free
// (no React) so they're trivial to reason about and reuse from catalog-page-view.tsx.
import type {
  CatalogPriceFilter,
  CatalogSizeFilter,
  CatalogSortOption,
} from "@/features/catalog/catalog-data";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

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

export function parseSizeFilter(value: string | null): CatalogSizeFilter {
  return value === "small" || value === "medium" || value === "large" ? value : "all";
}
