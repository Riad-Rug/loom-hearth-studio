import type { InventoryHold } from "@prisma/client";

import type { Order } from "@/types/domain";
import type { ProductVariant } from "@/types/domain/product";

export type { InventoryHold };

export type StockMovement = "take" | "sell" | "take-and-sell" | "restore";

export type StockLine = {
  productId: string;
  variantId: string | null;
  quantity: number;
};

export type ProductStock = {
  id: string;
  type: string;
  status: string;
  inventory: number | null;
  variants: ProductVariant[];
  soldAt: Date | null;
};

export type ProductStockUpdate = { id: string } & Partial<
  Pick<ProductStock, "status" | "inventory" | "variants" | "soldAt">
>;

export type StockMovementResult =
  | { status: "moved"; updates: ProductStockUpdate[] }
  | { status: "unavailable"; productIds: string[] };

export class InventoryUnavailableError extends Error {
  constructor(readonly productIds: string[]) {
    super(`No longer available: ${productIds.join(", ")}.`);
    this.name = "InventoryUnavailableError";
  }
}

export function resolveInventoryHold(order: Pick<Order, "status" | "paymentStatus">): InventoryHold {
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

// Sold never moves on its own: once payment is captured the piece has left the
// shelf, and putting it back on sale is a deliberate admin product edit.
const stockMovementByHold: Record<InventoryHold, Record<InventoryHold, StockMovement | null>> = {
  held: { held: null, sold: "sell", released: "restore" },
  released: { held: "take", sold: "take-and-sell", released: null },
  sold: { held: null, sold: null, released: null },
};

export function planStockMovement(
  current: InventoryHold | null,
  target: InventoryHold,
): StockMovement | null {
  return current ? stockMovementByHold[current][target] : null;
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

export function moveStock(
  products: ReadonlyArray<ProductStock>,
  lines: ReadonlyArray<StockLine>,
  movement: StockMovement,
  now: Date,
): StockMovementResult {
  const originalById = new Map(products.map((product) => [product.id, product] as const));
  const movedById = new Map<string, ProductStock>();
  const unavailableIds = new Set<string>();

  for (const line of lines) {
    const product = movedById.get(line.productId) ?? originalById.get(line.productId);

    if (!product) {
      if (movement === "take" || movement === "take-and-sell") {
        unavailableIds.add(line.productId);
      }
      continue;
    }

    const moved = product.type === "rug" ? moveRug(product, movement, now) : moveUnits(product, line, movement);

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
      if (moved.soldAt !== original.soldAt) update.soldAt = moved.soldAt;
      if (moved.inventory !== original.inventory) update.inventory = moved.inventory;
      if (moved.variants !== original.variants) update.variants = moved.variants;

      return Object.keys(update).length > 1 ? [update] : [];
    }),
  };
}

function moveRug(product: ProductStock, movement: StockMovement, now: Date): ProductStock | null {
  switch (movement) {
    case "take":
      return product.status === "active" ? { ...product, status: "reserved" } : null;
    case "sell":
      return product.status === "sold" ? product : { ...product, status: "sold", soldAt: product.soldAt ?? now };
    case "take-and-sell": {
      const taken = moveRug(product, "take", now);
      return taken && moveRug(taken, "sell", now);
    }
    case "restore":
      // Only undo our own reservation; an admin may have moved the rug since.
      return product.status === "reserved" ? { ...product, status: "active" } : product;
  }
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

  const variant = product.variants[variantIndex];
  const variantInventory = variant.inventory + delta;

  if (variantInventory < 0) {
    return null;
  }

  return {
    ...product,
    inventory,
    variants: product.variants.map((current, index) =>
      index === variantIndex ? { ...current, inventory: variantInventory } : current,
    ),
  };
}
