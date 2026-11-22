import { NextResponse } from "next/server";

import type { CartLineStock } from "@/features/cart/cart-items";
import { getProductAvailability } from "@/lib/catalog/availability";
import { createProductRepository } from "@/lib/db/repositories/product-repository";
import { getPurchasableQuantity, isOneOfOne } from "@/lib/order/inventory-hold";
import type { Product } from "@/types/domain";

const maxLines = 50;
const maxFieldLength = 200;
// Room for maxLines lines with every field at maxFieldLength.
const maxBodyLength = 64 * 1024;

type CartLineRequest = { id: string; productId: string; variantName?: string };

// What each line of a shopper's cart can be bought as right now, and for a
// multi-unit piece how many units. A product the storefront no longer lists
// (unpublished or deleted) cannot be bought, and its stock is not shared.
export async function POST(request: Request) {
  const body = await readJsonBody(request);
  const lines = body?.lines;

  if (!Array.isArray(lines) || lines.length > maxLines || !lines.every(isCartLineRequest)) {
    return NextResponse.json(
      { message: `lines must be at most ${maxLines} cart lines, each field at most ${maxFieldLength} characters.` },
      { status: 400 },
    );
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

async function readJsonBody(request: Request): Promise<{ lines?: unknown } | null> {
  if (Number(request.headers.get("content-length") ?? 0) > maxBodyLength) {
    return null;
  }

  const text = await request.text().catch(() => "");

  try {
    return text.length > maxBodyLength ? null : (JSON.parse(text) as { lines?: unknown } | null);
  } catch {
    return null;
  }
}

function isCartLineRequest(value: unknown): value is CartLineRequest {
  const line = (value ?? {}) as Partial<CartLineRequest>;

  return (
    isShortString(line.id) &&
    isShortString(line.productId) &&
    (line.variantName === undefined || isShortString(line.variantName))
  );
}

function isShortString(value: unknown): value is string {
  return typeof value === "string" && value.length <= maxFieldLength;
}
