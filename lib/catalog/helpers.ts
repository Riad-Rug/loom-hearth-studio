import { normalizeSlug } from "@/lib/catalog/product-validation";
import type { MultiUnitProduct, Product, ProductCategory, RugProduct } from "@/types/domain";

export type LaunchInventoryState = "inStock" | "lowStock" | "outOfStock";

export function formatProductPriceUsd(priceUsd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(priceUsd);
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

export function getProductMerchandisingNote(product: Product) {
  if (product.type === "rug") {
    return "Unique item. Quantity is fixed to 1.";
  }

  if (product.inventory <= 0) {
    return "Currently unavailable. Notify-me presentation remains available.";
  }

  if (product.inventory <= product.lowStockThreshold) {
    return "Low-stock multi-unit item.";
  }

  return product.variants.length ? "Multi-unit item with variant selection." : "";
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

/**
 * Can a shopper actually buy this piece right now? Rugs are unique, quantity-1
 * items with no inventory field at all, so their availability lives entirely in
 * `status`; multi-unit pieces (poufs, pillows, decor) additionally need stock on
 * hand, using the same `inventory <= 0` semantics as getInventoryState's
 * "outOfStock". A published-but-empty listing (active, inventory 0) is a
 * notify-me presentation, not something purchasable.
 */
export function isPurchasableProduct(product: Product): boolean {
  if (product.status !== "active") {
    return false;
  }

  return product.type !== "multiUnit" || getInventoryState(product) !== "outOfStock";
}

/** Landing route for a category, e.g. "decor" -> "/shop/decor". */
export function getCategoryRoutePath(category: ProductCategory) {
  return `/shop/${category}`;
}

export function getInventoryMessage(product: MultiUnitProduct) {
  const inventoryState = getInventoryState(product);

  switch (inventoryState) {
    case "outOfStock":
      return "This item is currently unavailable for launch orders.";
    case "lowStock":
      return `Only ${product.inventory} remaining in the current launch allocation.`;
    case "inStock":
      return "Available across the United States for launch.";
  }
}

export function formatRugDimensions(product: RugProduct) {
  const multiplicationSymbol = "\u00d7";

  return `${product.dimensionsCm.length} ${multiplicationSymbol} ${product.dimensionsCm.width} cm (approx. ${formatFeetAndInches(product.dimensionsCm.length)} ${multiplicationSymbol} ${formatFeetAndInches(product.dimensionsCm.width)})`;
}

export function formatRugWeight(product: RugProduct) {
  return `${product.weightKg.toFixed(1)} kg`;
}

export function formatMultiUnitDimensions(dimensionsCm: { length: number; width: number }) {
  const multiplicationSymbol = "×";
  const formatInches = (valueCm: number) => `${Math.round(valueCm / 2.54)}″`;

  return `${dimensionsCm.length} ${multiplicationSymbol} ${dimensionsCm.width} cm (${formatInches(dimensionsCm.length)} ${multiplicationSymbol} ${formatInches(dimensionsCm.width)})`;
}

function formatFeetAndInches(valueCm: number) {
  const totalInches = Math.round(valueCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  // Merchant-facing long dimensions often read better on the foot mark,
  // but smaller widths should keep their actual inch remainder.
  if (feet >= 6 && inches <= 4) {
    return `${feet}'0"`;
  }

  return `${feet}'${inches}"`;
}



