import { getInventoryState } from "@/lib/catalog/helpers";
import type { Product } from "@/types/domain";

// The one answer to "can a shopper buy this, and if not, why", for every
// storefront surface (cards, filters, the product page, the cart, JSON-LD and feeds).
// "reserved" is a one-of-one piece an order holds while its buyer reviews
// photos; it can come back. Draft and archived pieces are not on sale either.
export type ProductAvailability = "available" | "reserved" | "sold" | "outOfStock";

export type UnavailableReason = Exclude<ProductAvailability, "available">;

export function getProductAvailability(product: Product): ProductAvailability {
  if (product.status === "reserved") return "reserved";
  if (product.status === "sold") return "sold";
  if (product.status !== "active") return "outOfStock";

  return product.type === "multiUnit" && getInventoryState(product) === "outOfStock" ? "outOfStock" : "available";
}

// `label` is the badge on cards and cart lines and the product page pill.
export const unavailableCopy: Record<UnavailableReason, { label: string; headline: string; note?: string }> = {
  reserved: {
    label: "Reserved",
    headline: "This piece is reserved.",
    note: "This piece is reserved for an order. If that order doesn't go ahead, it comes back on the site.",
  },
  sold: { label: "Sold", headline: "This piece has sold.", note: "It stays in the catalog as a record." },
  outOfStock: { label: "Out of stock", headline: "This piece is out of stock." },
};
