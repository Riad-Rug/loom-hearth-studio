import { getInventoryState } from "@/lib/catalog/helpers";
import type { Product } from "@/types/domain";

// The one answer to "can a shopper buy this, and if not, why", for every
// storefront surface (cards, filters, the product page, JSON-LD and feeds).
// "reserved" is a one-of-one piece an order holds while its buyer reviews
// photos; it can come back. Draft and archived pieces are not on sale either.
export type ProductAvailability = "available" | "reserved" | "sold" | "outOfStock";

export function getProductAvailability(product: Product): ProductAvailability {
  if (product.status === "reserved") return "reserved";
  if (product.status === "sold") return "sold";
  if (product.status !== "active") return "outOfStock";

  return product.type === "multiUnit" && getInventoryState(product) === "outOfStock" ? "outOfStock" : "available";
}
