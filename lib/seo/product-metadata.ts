import type { ProductDetailPageViewModel } from "@/lib/catalog/contracts";
import { productNameHasDimensions } from "@/lib/catalog/product-card-name";
import type { ProductCategory } from "@/types/domain";

/**
 * Google truncates well before this, and the admin SEO field is free text, so
 * anything longer is cut at a word boundary rather than shipped whole.
 */
const metaDescriptionMaxLength = 160;

/**
 * Singular nouns for the fallback sentence. `getCategoryLabel` is the plural,
 * title-cased storefront label ("Poufs", "Decor & antiques") and reads wrong
 * mid-sentence after "one-of-a-kind Moroccan", so this map spells the noun.
 * Rugs are handled by product type first, since a rug filed under `vintage`
 * is still a rug.
 */
const categoryNouns: Record<ProductCategory, string> = {
  rugs: "rug",
  vintage: "rug",
  poufs: "pouf",
  pillows: "pillow cover",
  decor: "decor piece",
};

function truncateAtWordBoundary(value: string, maxLength: number) {
  if (value.length <= maxLength) {
    return value;
  }

  const truncated = value.slice(0, maxLength + 1);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const candidate =
    lastSpaceIndex > 0 ? truncated.slice(0, lastSpaceIndex) : value.slice(0, maxLength);

  return candidate.replace(/[\s,;:.\-–—]+$/u, "");
}

/**
 * The admin SEO description is required on new products
 * (lib/catalog/product-validation.ts) and is the copy a human wrote for this
 * exact piece, so it wins whenever it is present. Older rows predate the
 * requirement and can be blank, which is what the generated sentence below is
 * for: it still leads with the product name rather than the old fixed template.
 */
export function buildProductMetaDescription(product: ProductDetailPageViewModel) {
  const seoDescription = product.seoDescription.replace(/\s+/gu, " ").trim();

  if (seoDescription) {
    return truncateAtWordBoundary(seoDescription, metaDescriptionMaxLength);
  }

  const productLabel = product.type === "rug" ? "rug" : categoryNouns[product.category];
  // `dimensionsLabel` (formatRugDimensions) spends ~35 chars on the imperial
  // "(approx. 4'11" x 3'5")" half, which pushes the shipping and returns tail
  // past the 160-char cut for every rug, so the sentence states cm only.
  const sizeLabel =
    product.type === "rug"
      ? `${product.cartProduct.dimensionsCm.length} × ${product.cartProduct.dimensionsCm.width} cm`
      : "";
  const dimensions =
    sizeLabel && !productNameHasDimensions(product.name) ? `, ${sizeLabel}` : "";

  // Long product names can still overrun the budget, so the generated sentence
  // is held to the same limit as the admin field rather than shipped whole.
  return truncateAtWordBoundary(
    `${product.name}: one-of-a-kind Moroccan ${productLabel}${dimensions}, ${product.priceUsdLabel} USD. Exact-piece photos before payment, ships from Morocco to the US, 14-day returns.`,
    metaDescriptionMaxLength,
  );
}
