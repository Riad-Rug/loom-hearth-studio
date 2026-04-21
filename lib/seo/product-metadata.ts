import type { ProductDetailPageViewModel } from "@/lib/catalog/contracts";

export function buildProductMetaDescription(product: ProductDetailPageViewModel) {
  const productLabel = product.type === "rug" ? "rug" : product.category;
  const dimensions = product.type === "rug" ? `, ${product.dimensionsLabel}` : "";

  return `One-of-one Moroccan ${productLabel}${dimensions}, ${product.priceUsdLabel} USD. Ships from Morocco in 5-7 business days, duties included to US/CA/AU, 14-day returns. Exact-piece video before payment.`;
}
