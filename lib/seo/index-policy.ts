import type { ProductStatus } from "@/types/domain";

/**
 * How long a sold one-of-a-kind piece keeps its place in search. Its page stays
 * up for good as a record (HTTP 200, still followed), but after this window it
 * asks to be dropped from the index and leaves the sitemap.
 */
export const soldIndexWindowDays = 90;

const soldIndexWindowMs = soldIndexWindowDays * 24 * 60 * 60 * 1000;

/**
 * What the index decision reads off a catalog row. `soldAt` is null on a sold row
 * only when it was marked sold before the column existed (checkout and the admin
 * form both record a date), so such a sale is older than the window.
 */
export type ProductIndexFacts = {
  status: ProductStatus;
  soldAt: Date | null;
};

export function isProductIndexable(product: ProductIndexFacts, now: Date): boolean {
  switch (product.status) {
    case "active":
    case "reserved":
      return true;
    case "sold":
      return product.soldAt !== null && now.getTime() - product.soldAt.getTime() <= soldIndexWindowMs;
    case "draft":
    case "archived":
      return false;
  }
}

/**
 * A rug-style page earns its place in search with its guide copy and the pieces
 * it shows. It stays indexable while any of those pieces' own pages is, so a
 * style whose last rug just sold keeps ranking alongside that rug, and both
 * retire together once nothing is left but old sales.
 */
export function isRugStylePageIndexable(
  page: { hasGuideCopy: boolean; pieces: readonly ProductIndexFacts[] },
  now: Date,
): boolean {
  return page.hasGuideCopy && page.pieces.some((piece) => isProductIndexable(piece, now));
}
