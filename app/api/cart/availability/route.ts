import { NextResponse } from "next/server";

import { getProductAvailability, type ProductAvailability } from "@/lib/catalog/availability";
import { createProductRepository } from "@/lib/db/repositories/product-repository";

const maxProductIds = 50;

// What each product in a shopper's cart can be bought as right now. A product
// the storefront no longer lists (unpublished or deleted) cannot be bought.
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { productIds?: unknown } | null;
  const productIds = body?.productIds;

  if (!Array.isArray(productIds) || productIds.length > maxProductIds || !productIds.every((id) => typeof id === "string")) {
    return NextResponse.json({ message: `productIds must be at most ${maxProductIds} product ids.` }, { status: 400 });
  }

  const productById = new Map((await createProductRepository().listAll()).map((product) => [product.id, product]));
  const availability: Record<string, ProductAvailability> = Object.fromEntries(
    productIds.map((id: string) => {
      const product = productById.get(id);

      return [id, product ? getProductAvailability(product) : "outOfStock"];
    }),
  );

  return NextResponse.json({ availability });
}
