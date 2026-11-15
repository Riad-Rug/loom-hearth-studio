import { NextResponse } from "next/server";

import type { CartLineStock } from "@/features/cart/cart-items";
import { getProductAvailability } from "@/lib/catalog/availability";
import { createProductRepository } from "@/lib/db/repositories/product-repository";
import { getPurchasableQuantity, isOneOfOne } from "@/lib/order/inventory-hold";
import type { Product } from "@/types/domain";

const maxLines = 50;

type CartLineRequest = { id: string; productId: string; variantName?: string };

// What each line of a shopper's cart can be bought as right now, and for a
// multi-unit piece how many units. A product the storefront no longer lists
// (unpublished or deleted) cannot be bought, and its stock is not shared.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { lines?: unknown } | null;
  const lines = body?.lines;

  if (!Array.isArray(lines) || lines.length > maxLines || !lines.every(isCartLineRequest)) {
    return NextResponse.json({ message: `lines must be at most ${maxLines} cart lines.` }, { status: 400 });
  }

  const products = await createProductRepository().listListedByIds([...new Set(lines.map((line) => line.productId))]);
  const productById = new Map(products.map((product) => [product.id, product]));
  const stock: Record<string, CartLineStock> = Object.fromEntries(
    lines.map((line) => {
      const product = productById.get(line.productId);

      return [line.id, product ? describeLineStock(product, line.variantName) : { availability: "outOfStock" }];
    }),
  );

  return NextResponse.json({ lines: stock });
}

function describeLineStock(product: Product, variantName?: string): CartLineStock {
  const availability = getProductAvailability(product);

  if (availability !== "available" || isOneOfOne(product)) {
    return { availability };
  }

  const availableQuantity = getPurchasableQuantity(product, variantName);

  return availableQuantity > 0 ? { availability, availableQuantity } : { availability: "outOfStock" };
}

function isCartLineRequest(value: unknown): value is CartLineRequest {
  const line = value as Partial<CartLineRequest> | null;

  return (
    typeof line?.id === "string" &&
    typeof line.productId === "string" &&
    (line.variantName === undefined || typeof line.variantName === "string")
  );
}
