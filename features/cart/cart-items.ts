import { unavailableCopy, type ProductAvailability, type UnavailableReason } from "@/lib/catalog/availability";
import { getCategoryLabel, getCompareAtPriceUsd, getProductRoutePath } from "@/lib/catalog/helpers";
import type { CommerceItem } from "@/lib/analytics/commerce-events";
import type { Product } from "@/types/domain";

export type CartStoreItem = {
  id: string;
  href: string;
  productId: string;
  productType: Product["type"];
  productCategory: Product["category"];
  name: string;
  priceUsd: number;
  /** Former price shown struck through; display only, never charged. */
  compareAtPriceUsd?: number;
  quantity: number;
  variantName?: string;
  imageUrl?: string;
  imageAlt?: string;
  /** Units in stock when the line was last added. Absent on carts saved before stock was recorded. */
  availableQuantity?: number;
};

// What POST /api/cart/availability says a cart line can be bought as right now.
// availableQuantity is set for a listed multi-unit piece on sale.
export type CartLineStock = { availability: ProductAvailability; availableQuantity?: number };

// The units a cart line can still have; 0 drops the line.
export type CartLineLimit = { id: string; availableQuantity: number };

export type AddCartProductInput = {
  product: Product;
  quantity: number;
  variantName?: string;
  // Callers pass a delivery URL because Cloudinary URLs can only be built on the server.
  imageUrl?: string;
  imageAlt?: string;
};

const productCategories: ReadonlyArray<Product["category"]> = [
  "rugs",
  "vintage",
  "decor",
  "pillows",
  "poufs",
];

/** "$549.00" while the line is still below its former price; undefined otherwise. */
export function getCartItemCompareAtLabel(item: CartStoreItem, format: (value: number) => string) {
  const compareAtPriceUsd = getCompareAtPriceUsd(item);

  return compareAtPriceUsd === undefined ? undefined : format(compareAtPriceUsd);
}

export function getMaxQuantity(item: CartStoreItem) {
  if (item.productType === "rug") {
    return 1;
  }

  return item.availableQuantity === undefined
    ? Number.POSITIVE_INFINITY
    : Math.max(1, item.availableQuantity);
}

export function createCartStoreItem({
  product,
  quantity,
  variantName,
  imageUrl,
  imageAlt,
}: AddCartProductInput): CartStoreItem {
  const item: CartStoreItem = {
    id:
      product.type === "multiUnit" && variantName
        ? `${product.id}::${variantName}`
        : product.id,
    href: getProductRoutePath(product),
    productId: product.id,
    productType: product.type,
    productCategory: product.category,
    name: product.name,
    priceUsd: product.priceUsd,
    compareAtPriceUsd: getCompareAtPriceUsd(product),
    quantity: 1,
    variantName,
    imageUrl,
    imageAlt,
    availableQuantity: getAvailableQuantity(product, variantName),
  };

  return { ...item, quantity: clampQuantity(item, quantity) };
}

export function addProductToCart(
  currentItems: CartStoreItem[],
  input: AddCartProductInput,
): CartStoreItem[] {
  const nextItem = createCartStoreItem(input);
  const existingItem = currentItems.find((item) => item.id === nextItem.id);

  if (!existingItem) {
    return [...currentItems, nextItem];
  }

  const mergedItem: CartStoreItem = {
    ...existingItem,
    availableQuantity: nextItem.availableQuantity,
    imageUrl: nextItem.imageUrl ?? existingItem.imageUrl,
    imageAlt: nextItem.imageUrl ? nextItem.imageAlt : existingItem.imageAlt,
  };

  return currentItems.map((item) =>
    item.id === nextItem.id
      ? { ...mergedItem, quantity: clampQuantity(mergedItem, existingItem.quantity + nextItem.quantity) }
      : item,
  );
}

export function getAddedCartLine(
  currentItems: CartStoreItem[],
  input: AddCartProductInput,
): { item: CartStoreItem; quantity: number } | null {
  const { id } = createCartStoreItem(input);
  const nextItem = addProductToCart(currentItems, input).find((item) => item.id === id);
  const previousQuantity = currentItems.find((item) => item.id === id)?.quantity ?? 0;
  const addedQuantity = (nextItem?.quantity ?? 0) - previousQuantity;

  return nextItem && addedQuantity > 0 ? { item: nextItem, quantity: addedQuantity } : null;
}

export function setCartItemQuantity(
  currentItems: CartStoreItem[],
  id: string,
  quantity: number,
): CartStoreItem[] {
  return currentItems.flatMap((item) => {
    if (item.id !== id) {
      return [item];
    }

    return quantity < 1 ? [] : [{ ...item, quantity: clampQuantity(item, quantity) }];
  });
}

// Lowers each limited line to the units it can still have, its cap too, so the
// quantity control cannot climb back over them.
export function limitCartItems(currentItems: CartStoreItem[], limits: ReadonlyArray<CartLineLimit>): CartStoreItem[] {
  const limitById = new Map(limits.map((limit) => [limit.id, limit.availableQuantity]));

  return currentItems.flatMap((item) => {
    const availableQuantity = limitById.get(item.id);

    if (availableQuantity === undefined) {
      return [item];
    }

    return availableQuantity < 1
      ? []
      : [{ ...item, availableQuantity, quantity: Math.min(item.quantity, availableQuantity) }];
  });
}

export function parseStoredCartItem(value: unknown): value is CartStoreItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CartStoreItem>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.href === "string" &&
    typeof candidate.productId === "string" &&
    (candidate.productType === "rug" || candidate.productType === "multiUnit") &&
    productCategories.includes(candidate.productCategory as Product["category"]) &&
    typeof candidate.name === "string" &&
    typeof candidate.priceUsd === "number" &&
    typeof candidate.quantity === "number" &&
    Number.isInteger(candidate.quantity) &&
    candidate.quantity >= 1 &&
    isOptionalString(candidate.variantName) &&
    isOptionalString(candidate.imageUrl) &&
    isOptionalString(candidate.imageAlt) &&
    (candidate.availableQuantity === undefined || Number.isFinite(candidate.availableQuantity))
  );
}

export function getCartItemLabel(item: CartStoreItem) {
  return getCategoryLabel(item.productCategory);
}

export function getCartItemDetails(item: CartStoreItem) {
  return [`Qty ${item.quantity}`, item.variantName].filter(Boolean).join(" · ");
}

const notCountedNote = "Not included in your total.";

export const unavailableLineNote: Record<UnavailableReason, string> = {
  reserved: `${unavailableCopy.reserved.headline} ${unavailableCopy.reserved.note} ${notCountedNote}`,
  sold: `${unavailableCopy.sold.headline} ${notCountedNote}`,
  outOfStock: `${unavailableCopy.outOfStock.headline} ${notCountedNote}`,
};

export const unavailableCheckoutNote = "Some pieces can't be bought right now. Remove them from your cart to check out.";

export function getQuantityReducedNote(item: CartStoreItem) {
  return `Only ${getMaxQuantity(item)} left, so we changed your quantity.`;
}

export function getCartItemAvailabilityNote(
  item: CartStoreItem,
  availability: ProductAvailability,
  quantityReduced: boolean,
) {
  if (availability !== "available") {
    return unavailableLineNote[availability];
  }

  if (item.productType === "rug") {
    return "One of a kind";
  }

  if (quantityReduced) {
    return getQuantityReducedNote(item);
  }

  const maxQuantity = getMaxQuantity(item);

  if (!Number.isFinite(maxQuantity) || item.quantity < maxQuantity) {
    return null;
  }

  return maxQuantity === 1 ? "Only one available" : `Only ${maxQuantity} available`;
}

export function toCommerceItem(item: CartStoreItem): CommerceItem {
  return {
    id: item.productId,
    name: item.name,
    category: item.productCategory,
    variant: item.variantName,
    priceUsd: item.priceUsd,
    quantity: item.quantity,
  };
}

export function toCommerceItems(items: CartStoreItem[]) {
  return items.map(toCommerceItem);
}

function getAvailableQuantity(product: Product, variantName?: string) {
  if (product.type === "rug") {
    return 1;
  }

  const variant = variantName
    ? product.variants.find((candidate) => candidate.name === variantName)
    : undefined;

  return variant?.inventory ?? product.inventory;
}

function clampQuantity(item: CartStoreItem, quantity: number) {
  return Math.min(Math.max(1, quantity), getMaxQuantity(item));
}

function isOptionalString(value: unknown) {
  return value === undefined || typeof value === "string";
}
