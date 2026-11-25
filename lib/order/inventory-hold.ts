import type { InventoryHold } from "@prisma/client";

import { isOneOfOneUniquenessTier } from "@/lib/admin/category-form-copy";
import type { Order, Product } from "@/types/domain";
import type { ProductVariant } from "@/types/domain/product";

export type { InventoryHold };

// What an order's stock should be once a transition lands. "conflict" is never a
// target: it records that the order needed stock another order already had.
export type InventoryHoldTarget = Exclude<InventoryHold, "conflict">;

export type StockMovement = "take" | "sell" | "take-and-sell" | "restore";

export type StockLine = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export type ProductStock = {
  id: string;
  type: string;
  uniquenessTier: string | null;
  status: string;
  heldByOrderId: string | null;
  inventory: number | null;
  variants: ProductVariant[];
  soldAt: Date | null;
};

export type ProductStockUpdate = { id: string } & Partial<
  Pick<ProductStock, "status" | "heldByOrderId" | "inventory" | "variants" | "soldAt">
>;

export type StockMovementResult =
  | { status: "moved"; updates: ProductStockUpdate[] }
  | { status: "unavailable"; productIds: string[] };

export type StockLevels = {
  inventory: number | null;
  variants: ReadonlyArray<ProductVariant>;
};

// What an admin product form showed when it loaded, so a save can tell the
// admin's changes from what orders changed meanwhile.
export type ProductEditBase = StockLevels & { status: string };

export class InventoryUnavailableError extends Error {
  constructor(readonly productIds: string[]) {
    super(`No longer available: ${productIds.join(", ")}.`);
    this.name = "InventoryUnavailableError";
  }
}

// One-of-one pieces are tracked by status (active, reserved, sold) and by the
// order holding them, through "sold" too; everything else by unit count.
export function isOneOfOne(product: { type: string; uniquenessTier?: string | null }) {
  return product.type === "rug" || isOneOfOneUniquenessTier(product.uniquenessTier);
}

// How many units of a listed product (of one variant, when named) an order could
// take right now, by the rules moveStock applies when it takes them.
export function getPurchasableQuantity(product: Product, variantName?: string): number {
  if (product.status !== "active") return 0;
  if (product.type === "rug" || isOneOfOne(product)) return 1;
  if (!variantName) return Math.max(0, product.inventory);

  const variant = product.variants.find((candidate) => candidate.name === variantName);

  return variant ? Math.max(0, Math.min(product.inventory, variant.inventory)) : 0;
}

export function resolveInventoryHold(
  order: Pick<Order, "status" | "paymentStatus">,
): InventoryHoldTarget {
  // A shipped piece has left the studio whatever later happens to the payment.
  if (order.status === "shipped" || order.status === "delivered") {
    return "sold";
  }

  if (
    order.status === "cancelled" ||
    order.status === "refunded" ||
    order.paymentStatus === "failed" ||
    order.paymentStatus === "refunded"
  ) {
    return "released";
  }

  return order.paymentStatus === "paid" ? "sold" : "held";
}

export type HoldStep = { movement: StockMovement | null; next: InventoryHold };

const stay = (hold: InventoryHold): HoldStep => ({ movement: null, next: hold });

// Stock never moves out of sold: putting a captured or shipped piece back on sale
// is a deliberate admin product edit. When a sold order is cancelled or refunded
// it stops owning the units without moving them, so a later re-Paid must take
// the piece again and refunded covers stop counting as sold. A conflict holds
// nothing, so it too only settles when the order is released.
const holdSteps: Record<InventoryHold, Record<InventoryHoldTarget, HoldStep>> = {
  held: {
    held: stay("held"),
    sold: { movement: "sell", next: "sold" },
    released: { movement: "restore", next: "released" },
  },
  released: {
    held: { movement: "take", next: "held" },
    sold: { movement: "take-and-sell", next: "sold" },
    released: stay("released"),
  },
  sold: { held: stay("sold"), sold: stay("sold"), released: stay("released") },
  conflict: { held: stay("conflict"), sold: stay("conflict"), released: stay("released") },
};

// Null is an order placed before automatic reservation; its stock is managed by hand.
export function planHoldStep(current: InventoryHold | null, target: InventoryHoldTarget): HoldStep | null {
  return current ? holdSteps[current][target] : null;
}

export function toStockLines(
  items: ReadonlyArray<Pick<Order["items"][number], "productId" | "quantity" | "variant">>,
): StockLine[] {
  return items.map((item) => ({
    productId: item.productId,
    variantId: item.variant?.id ?? null,
    quantity: item.quantity,
  }));
}

export function moveStock(input: {
  products: ReadonlyArray<ProductStock>;
  lines: ReadonlyArray<StockLine>;
  movement: StockMovement;
  orderId: string;
  now: Date;
}): StockMovementResult {
  const originalById = new Map(input.products.map((product) => [product.id, product] as const));
  const movedById = new Map<string, ProductStock>();
  const unavailableIds = new Set<string>();

  for (const line of input.lines) {
    const product = movedById.get(line.productId) ?? originalById.get(line.productId);

    if (!product) {
      if (input.movement !== "restore") {
        unavailableIds.add(line.productId);
      }
      continue;
    }

    const moved = isOneOfOne(product)
      ? movePiece(product, input.movement, input.orderId, input.now)
      : moveUnits(product, line, input.movement);

    if (moved) {
      movedById.set(product.id, moved);
    } else {
      unavailableIds.add(product.id);
    }
  }

  if (unavailableIds.size > 0) {
    return { status: "unavailable", productIds: [...unavailableIds] };
  }

  return {
    status: "moved",
    updates: [...movedById.values()].flatMap((moved) => {
      const original = originalById.get(moved.id)!;
      const update: ProductStockUpdate = { id: moved.id };

      if (moved.status !== original.status) update.status = moved.status;
      if (moved.heldByOrderId !== original.heldByOrderId) {
        update.heldByOrderId = moved.heldByOrderId;
      }
      if (moved.soldAt !== original.soldAt) update.soldAt = moved.soldAt;
      if (moved.inventory !== original.inventory) update.inventory = moved.inventory;
      if (moved.variants !== original.variants) update.variants = moved.variants;

      return Object.keys(update).length > 1 ? [update] : [];
    }),
  };
}

function movePiece(
  product: ProductStock,
  movement: StockMovement,
  orderId: string,
  now: Date,
): ProductStock | null {
  const heldByThisOrder = product.heldByOrderId === orderId;

  switch (movement) {
    case "take":
      return product.status === "active"
        ? { ...product, status: "reserved", heldByOrderId: orderId }
        : null;
    case "sell":
      return product.status === "reserved" && heldByThisOrder ? sellPiece(product, orderId, now) : null;
    case "take-and-sell":
      // A piece still sold to this order (refunded, then marked paid again) is its own to take back.
      return product.status === "active" || (product.status === "sold" && heldByThisOrder)
        ? sellPiece(product, orderId, now)
        : null;
    case "restore":
      // Nothing to give back once the piece is no longer this order's.
      return product.status === "reserved" && heldByThisOrder
        ? { ...product, status: "active", heldByOrderId: null }
        : product;
  }
}

function sellPiece(product: ProductStock, orderId: string, now: Date): ProductStock {
  return { ...product, status: "sold", heldByOrderId: orderId, soldAt: product.soldAt ?? now };
}

function moveUnits(product: ProductStock, line: StockLine, movement: StockMovement): ProductStock | null {
  if (movement === "sell") {
    return product;
  }

  const taking = movement !== "restore";

  if (taking && product.status !== "active") {
    return null;
  }

  const delta = taking ? -line.quantity : line.quantity;
  const inventory = (product.inventory ?? 0) + delta;
  const variantIndex = line.variantId
    ? product.variants.findIndex((variant) => variant.id === line.variantId)
    : -1;

  if (taking && (inventory < 0 || (line.variantId && variantIndex < 0))) {
    return null;
  }

  if (variantIndex < 0) {
    return { ...product, inventory };
  }

  const variantInventory = product.variants[variantIndex].inventory + delta;

  if (variantInventory < 0) {
    return null;
  }

  return {
    ...product,
    inventory,
    variants: product.variants.map((variant, index) =>
      index === variantIndex ? { ...variant, inventory: variantInventory } : variant,
    ),
  };
}

// Three-way merges of an admin product save against what orders changed while
// the form was open: `loaded` is what the form showed, `submitted` what the
// admin saved, `current` what the database holds now. A value the admin left
// alone keeps current; a value only the admin changed takes theirs; a value both
// changed keeps current and is reported.
export function mergeStatusEdit(input: {
  loaded: string;
  submitted: string;
  current: string;
}): { status: string; conflict: boolean } {
  // Only an order sets or clears "reserved".
  if (input.current === "reserved" || input.submitted === "reserved") {
    return {
      status: input.current,
      conflict: input.current !== input.loaded && input.submitted !== input.loaded,
    };
  }

  if (input.current === input.loaded) return { status: input.submitted, conflict: false };
  if (input.submitted === input.loaded) return { status: input.current, conflict: false };
  return { status: input.current, conflict: true };
}

// Stock merges as one unit: the total and the variant counts move together, so
// a partial merge could leave them disagreeing.
export function mergeStockEdit(input: {
  loaded: StockLevels;
  submitted: { inventory: number; variants: ProductVariant[] };
  current: StockLevels;
}): { inventory: number; variants: ProductVariant[]; conflict: boolean } {
  if (sameStock(input.loaded, input.current)) {
    return { inventory: input.submitted.inventory, variants: input.submitted.variants, conflict: false };
  }

  const currentById = new Map(input.current.variants.map((variant) => [variant.id, variant.inventory]));

  if (sameStock(input.loaded, input.submitted)) {
    return {
      inventory: input.current.inventory ?? 0,
      variants: input.submitted.variants.map((variant) => ({
        ...variant,
        inventory: currentById.get(variant.id) ?? variant.inventory,
      })),
      conflict: false,
    };
  }

  return { inventory: input.current.inventory ?? 0, variants: [...input.current.variants], conflict: true };
}

function sameStock(left: StockLevels, right: StockLevels) {
  const rightById = new Map(right.variants.map((variant) => [variant.id, variant.inventory]));

  return (
    (left.inventory ?? 0) === (right.inventory ?? 0) &&
    left.variants.length === right.variants.length &&
    left.variants.every((variant) => rightById.get(variant.id) === variant.inventory)
  );
}
