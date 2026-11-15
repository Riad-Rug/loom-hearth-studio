import { Prisma } from "@prisma/client";

import {
  moveStock,
  type ProductStock,
  type StockLine,
  type StockMovement,
  type StockMovementResult,
} from "@/lib/order/inventory-hold";
import type { ProductVariant } from "@/types/domain/product";

type LockedProductRow = {
  id: string;
  type: string;
  status: string;
  inventory: number | null;
  variants: Prisma.JsonValue | null;
  soldAt: Date | null;
  updatedAt: Date;
};

// Locks every product the lines touch, in id order so two orders that share
// products cannot deadlock. A concurrent order for the same piece blocks on the
// lock, then reads the stock this transaction committed.
export async function moveStockForLines(
  tx: Prisma.TransactionClient,
  lines: StockLine[],
  movement: StockMovement,
  now: Date,
): Promise<StockMovementResult> {
  const productIds = [...new Set(lines.map((line) => line.productId))].sort();
  const rows = productIds.length
    ? await tx.$queryRaw<LockedProductRow[]>`
        SELECT "id", "type", "status", "inventory", "variants", "soldAt", "updatedAt"
        FROM "CatalogProduct"
        WHERE "id" IN (${Prisma.join(productIds)})
        ORDER BY "id"
        FOR UPDATE`
    : [];
  const result = moveStock(rows.map(toProductStock), lines, movement, now);
  const updatedAtById = new Map(rows.map((row) => [row.id, row.updatedAt] as const));

  if (result.status === "moved") {
    for (const { id, variants, ...update } of result.updates) {
      await tx.catalogProduct.update({
        where: { id },
        data: {
          ...update,
          ...(variants && { variants: variants as unknown as Prisma.InputJsonValue }),
          // The shop's default "newest" sort is updatedAt; an order moving stock
          // must not push the piece to the top of the grid.
          updatedAt: updatedAtById.get(id),
        },
      });
    }
  }

  return result;
}

function toProductStock(row: LockedProductRow): ProductStock {
  return {
    id: row.id,
    type: row.type,
    status: row.status,
    inventory: row.inventory,
    variants: Array.isArray(row.variants) ? (row.variants as unknown as ProductVariant[]) : [],
    soldAt: row.soldAt,
  };
}
