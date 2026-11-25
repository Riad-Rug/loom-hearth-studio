import { normalizeSlug } from "@/lib/catalog/product-validation";
import { formatCmAsFeetInches, formatCmAsInches } from "@/lib/catalog/size-format";
import type { MultiUnitProduct, Product, ProductCategory, RugProduct } from "@/types/domain";

export type LaunchInventoryState = "inStock" | "lowStock" | "outOfStock";

export function formatProductPriceUsd(priceUsd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceUsd);
}

/**
 * The struck-through "was" price, or undefined when the piece is not on sale.
 * Only a compare-at price above the current price counts.
 */
export function getCompareAtPriceUsd(product: { priceUsd: number; compareAtPriceUsd?: number }) {
  return product.compareAtPriceUsd !== undefined && product.compareAtPriceUsd > product.priceUsd
    ? product.compareAtPriceUsd
    : undefined;
}

export function getCompareAtPriceUsdLabel(product: { priceUsd: number; compareAtPriceUsd?: number }) {
  const compareAtPriceUsd = getCompareAtPriceUsd(product);

  return compareAtPriceUsd === undefined ? undefined : formatProductPriceUsd(compareAtPriceUsd);
}

export function getProductRoutePath(product: Product) {
  return product.type === "rug" && product.category === "vintage"
    ? `/shop/vintage/${product.slug}`
    : product.type === "rug"
    ? `/shop/rugs/${normalizeSlug(product.rugStyle)}/${product.slug}`
    : `/shop/${product.category}/${product.slug}`;
}

export function getProductRoutePattern(product: Product) {
  return product.type === "rug" && product.category !== "vintage"
    ? "/shop/rugs/[style]/[slug]"
    : "/shop/[category]/[slug]";
}

export function getProductBadgeLabel(product: Product) {
  return getCategoryLabel(product.category);
}

export function getCategoryLabel(category: ProductCategory) {
  switch (category) {
    case "rugs":
      return "Moroccan rugs";
    case "vintage":
      return "Vintage rugs";
    case "decor":
      return "Decor & antiques";
    case "pillows":
      return "Pillows";
    case "poufs":
      return "Poufs";
  }
}

export function getInventoryState(product: MultiUnitProduct): LaunchInventoryState {
  if (product.inventory <= 0) {
    return "outOfStock";
  }

  if (product.inventory <= product.lowStockThreshold) {
    return "lowStock";
  }

  return "inStock";
}

/** Landing route for a category, e.g. "decor" -> "/shop/decor". */
export function getCategoryRoutePath(category: ProductCategory) {
  return `/shop/${category}`;
}

export function formatRugDimensions(product: RugProduct) {
  const multiplicationSymbol = "\u00d7";

  return `${product.dimensionsCm.length} ${multiplicationSymbol} ${product.dimensionsCm.width} cm (approx. ${formatCmAsFeetInches(product.dimensionsCm.length)} ${multiplicationSymbol} ${formatCmAsFeetInches(product.dimensionsCm.width)})`;
}

export function formatRugWeight(product: RugProduct) {
  return `${product.weightKg.toFixed(1)} kg`;
}

export function formatMultiUnitDimensions(dimensionsCm: { length: number; width: number }) {
  const multiplicationSymbol = "×";
  return `${dimensionsCm.length} ${multiplicationSymbol} ${dimensionsCm.width} cm (${formatCmAsInches(dimensionsCm.length)} ${multiplicationSymbol} ${formatCmAsInches(dimensionsCm.width)})`;
}




