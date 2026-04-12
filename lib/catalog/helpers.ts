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
  return product.type === "rug"
    ? `/shop/rugs/${normalizeSlug(product.rugStyle)}/${product.slug}`
    : `/shop/${product.category}/${product.slug}`;
}

export function getProductRoutePattern(product: Product) {
  return product.type === "rug" ? "/shop/rugs/[style]/[slug]" : "/shop/[category]/[slug]";
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

  return product.variants.length
    ? "Multi-unit item with variant selection."
    : "Multi-unit item with quantity controls.";
}

export function getCategoryLabel(category: ProductCategory) {
  switch (category) {
    case "rugs":
      return "Moroccan rugs";
    case "vintage":
      return "Vintage rugs";
    case "decor":
      return "Decor";
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

export function getInventoryMessage(product: MultiUnitProduct) {
  const inventoryState = getInventoryState(product);

  switch (inventoryState) {
    case "outOfStock":
      return "This item is currently unavailable for launch orders.";
    case "lowStock":
      return `Only ${product.inventory} remaining in the current launch allocation.`;
    case "inStock":
      return "Available across the United States, Canada, and Australia launch markets.";
  }
}

export function formatRugDimensions(product: RugProduct) {
  const multiplicationSymbol = "\u00d7";

  return `${product.dimensionsCm.length} ${multiplicationSymbol} ${product.dimensionsCm.width} cm (approx. ${formatFeetAndInches(product.dimensionsCm.length)} ${multiplicationSymbol} ${formatFeetAndInches(product.dimensionsCm.width)})`;
}

export function formatRugWeight(product: RugProduct) {
  return `${product.weightKg.toFixed(1)} kg`;
}

function formatFeetAndInches(valueCm: number) {
  const totalInches = Math.round(valueCm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;

  // Merchant-facing rug dimensions read better when small remainders stay on the foot mark.
  if (inches <= 4) {
    return `${feet}'0"`;
  }

  return `${feet}'${inches}"`;
}


