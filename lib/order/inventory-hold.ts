import type { InventoryHold } from "@prisma/client";

import { trueOneOffUniquenessTier } from "@/lib/admin/category-form-copy";
import type { Order } from "@/types/domain";
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
  reservedByOrderId: string | null;
  inventory: number | null;
  variants: ProductVariant[];
  soldAt: Date | null;
};

export type ProductStockUpdate = { id: string } & Partial<
  Pick<ProductStock, "status" | "reservedByOrderId" | "inventory" | "variants" | "soldAt">
>;

export type StockMovementResult =
  | { status: "moved"; updates: ProductStockUpdate[] }
  | { status: "unavailable"; productIds: string[] };

export type StockLevels = {
  inventory: number | null;
  variants: ReadonlyArray<Pick<ProductVariant, "id" | "inventory">>;
};

export class InventoryUnavailableError extends Error {
  constructor(readonly productIds: string[]) {
    super(`No longer available: ${productIds.join(", ")}.`);
    this.name = "InventoryUnavailableError";
  }
}

// One-of-one pieces are tracked by status (active, reserved, sold) and by the
// order holding them; everything else by unit count.
export function isOneOfOne(product: { type: string; uniquenessTier?: string | null }) {
  return product.type === "rug" || product.uniquenessTier === trueOneOffUniquenessTier;
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

// Sold never moves on its own: putting a captured or shipped piece back on sale
// is a deliberate admin product edit. A conflict holds nothing, so it only
// settles when the order is released.
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
  sold: { held: stay("sold"), sold: stay("sold"), released: stay("sold") },
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
      if (moved.reservedByOrderId !== original.reservedByOrderId) {
        update.reservedByOrderId = moved.reservedByOrderId;
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
  const heldByThisOrder = product.status === "reserved" && product.reservedByOrderId === orderId;

  switch (movement) {
    case "take":
      return product.status === "active"
        ? { ...product, status: "reserved", reservedByOrderId: orderId }
        : null;
    case "sell":
      return heldByThisOrder ? sellPiece(product, now) : null;
    case "take-and-sell":
      return product.status === "active" ? sellPiece(product, now) : null;
    case "restore":
      // Nothing to give back once the piece is no longer this order's.
      return heldByThisOrder ? { ...product, status: "active", reservedByOrderId: null } : product;
  }
}

function sellPiece(product: ProductStock, now: Date): ProductStock {
  return { ...product, status: "sold", reservedByOrderId: null, soldAt: product.soldAt ?? now };
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

// Three-way merge of an admin product save against stock that orders moved while
// the form was open. `loaded` is what the form showed, `submitted` what the admin
// saved, `current` what the database holds now. A count the admin left alone
// keeps current; a count only the admin changed takes theirs; a count both
// changed keeps current and is reported back.
export function mergeStockEdit(input: {
  loaded: StockLevels;
  submitted: { inventory: number; variants: ProductVariant[] };
  current: StockLevels;
}): { inventory: number; variants: ProductVariant[]; conflicts: string[] } {
  const conflicts: string[] = [];
  const pick = (label: string, loaded: number | undefined, submitted: number, current: number | undefined) => {
    if (loaded === undefined || current === undefined || current === loaded) return submitted;
    if (submitted !== loaded) conflicts.push(label);
    return current;
  };
  const loadedVariants = new Map(input.loaded.variants.map((variant) => [variant.id, variant.inventory]));
  const currentVariants = new Map(input.current.variants.map((variant) => [variant.id, variant.inventory]));

  return {
    inventory: pick(
      "Inventory",
      input.loaded.inventory ?? 0,
      input.submitted.inventory,
      input.current.inventory ?? 0,
    ),
    variants: input.submitted.variants.map((variant) => ({
      ...variant,
      inventory: pick(
        `${variant.name} inventory`,
        loadedVariants.get(variant.id),
        variant.inventory,
        currentVariants.get(variant.id),
      ),
    })),
    conflicts,
  };
}
