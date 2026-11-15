import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

/**
 * Social image fields for a category or collection page: the first piece a
 * shopper can buy right now that has a photo, so the preview shows real stock
 * rather than the site-wide placeholder. Returns nothing when no piece
 * qualifies, which leaves the default share image in place.
 *
 * Product photos are 4:3 (the PDP passes the same 1600x1200).
 */
export function categoryOgImage(products: CatalogProductCardViewModel[]) {
  const representative = products.find(
    (product) => product.status === "active" && !product.isOutOfStock && product.primaryImage?.src,
  );

  if (!representative?.primaryImage) {
    return {};
  }

  return {
    ogImageUrl: representative.primaryImage.src,
    ogImageAlt: representative.primaryImage.altText || representative.name,
    ogImageWidth: 1600,
    ogImageHeight: 1200,
  };
}
