import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

/**
 * Shared catalog search scoring. Used by the full /search results page and the
 * header live-suggestions endpoint so both rank products identically.
 */

export type CatalogSearchSuggestion = {
  id: string;
  href: string;
  name: string;
  dimensionsLabel?: string;
  priceUsdLabel: string;
  imageSrc: string | null;
  imageAlt: string;
};

export function searchCatalogProducts(
  products: CatalogProductCardViewModel[],
  query: string,
): CatalogProductCardViewModel[] {
  const terms = query
    .toLowerCase()
    .split(/\s+/u)
    .filter(Boolean);

  const normalizedQuery = query.toLowerCase();

  return products
    .map((product) => ({
      product,
      score: getProductSearchScore(product, terms, normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score)
    .map((entry) => entry.product);
}

export function buildCatalogSearchSuggestions(
  products: CatalogProductCardViewModel[],
  query: string,
  limit = 6,
): CatalogSearchSuggestion[] {
  return searchCatalogProducts(products, query)
    .slice(0, limit)
    .map((product) => ({
      id: product.id,
      href: product.href,
      name: product.displayName || product.name,
      dimensionsLabel: product.dimensionsLabel,
      priceUsdLabel: product.priceUsdLabel,
      imageSrc: product.primaryImage?.src ?? null,
      imageAlt: product.primaryImage?.altText ?? product.name,
    }));
}

export function getProductSearchScore(
  product: CatalogProductCardViewModel,
  terms: string[],
  normalizedQuery: string,
) {
  const title = product.name.toLowerCase();
  const description = product.description.toLowerCase();
  const subtitle = product.subtitle.toLowerCase();
  const supportingText = [
    product.merchandisingNote,
    product.badge,
    product.category,
    product.type,
    product.priceUsdLabel,
  ]
    .join(" ")
    .toLowerCase();

  let score = 0;

  if (title.includes(normalizedQuery)) {
    score += 120;
  }

  if (description.includes(normalizedQuery)) {
    score += 80;
  }

  if (subtitle.includes(normalizedQuery)) {
    score += 45;
  }

  for (const term of terms) {
    if (title.includes(term)) {
      score += 40;
    }

    if (description.includes(term)) {
      score += 24;
    }

    if (subtitle.includes(term)) {
      score += 14;
    }

    if (supportingText.includes(term)) {
      score += 6;
    }
  }

  return score;
}
