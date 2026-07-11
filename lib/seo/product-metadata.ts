import type { ProductDetailPageViewModel } from "@/lib/catalog/contracts";

export function buildProductMetaDescription(product: ProductDetailPageViewModel) {
  const productLabel = product.type === "rug" ? "rug" : product.category;
  const dimensions = product.type === "rug" ? `, ${product.dimensionsLabel}` : "";

  return `ONE OF A KIND Moroccan ${productLabel}${dimensions}, ${product.priceUsdLabel} USD. Ships from Morocco in 5-7 business days, 14-day returns. Exact-piece photos before payment.`;
}

