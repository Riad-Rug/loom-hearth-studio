import type { ProductCategory } from "@/types/domain";

// Category affinity used for cross-sell / upsell surfaces: given the
// category of what's already in hand (a PDP's product, or a checkout cart),
// which other categories are worth suggesting, ranked best-first.
//
// Single source of truth for this mapping — used by the PDP cross-sell cards
// (lib/catalog/service.ts's createCrossSellRecommendationCards) and by the
// checkout "add to order" suggestions (lib/catalog/service.ts's
// listAddToOrderCandidateProducts).
export function getUpsellCategoryOrder(category: ProductCategory): ProductCategory[] {
  const categoryOrder: Record<ProductCategory, ProductCategory[]> = {
    rugs: ["pillows", "poufs", "decor"],
    vintage: ["pillows", "poufs", "decor"],
    poufs: ["pillows", "decor", "rugs"],
    pillows: ["poufs", "decor", "rugs"],
    decor: ["pillows", "poufs", "rugs"],
  };

  return categoryOrder[category];
}
