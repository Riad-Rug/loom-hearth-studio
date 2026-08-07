import { NextResponse } from "next/server";

import { listAddToOrderCandidateProducts } from "@/lib/catalog/service";
import { createProductRepository } from "@/lib/db/repositories/product-repository";

// The client only ever sends product IDs already in the cart — a hint about
// *what* to suggest against, never a price. Price and category are always
// re-derived here from the live catalog, exactly like the rest of checkout
// (see lib/order/checkout-draft-validation.ts): a client-supplied floor
// price could otherwise be tampered with to unlock suggestions that aren't
// actually a meaningful discount off the real cart.
export async function GET(request: Request) {
  const productIdsParam = new URL(request.url).searchParams.get("productIds") ?? "";
  const productIds = Array.from(
    new Set(
      productIdsParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean),
    ),
  );

  if (!productIds.length) {
    return NextResponse.json({ candidates: [] });
  }

  try {
    const repository = createProductRepository();
    const allProducts = await repository.listAll();
    const cartProducts = allProducts.filter((product) => productIds.includes(product.id));

    if (!cartProducts.length) {
      return NextResponse.json({ candidates: [] });
    }

    const cartFloorPriceUsd = Math.min(...cartProducts.map((product) => product.priceUsd));
    const cartCategories = Array.from(new Set(cartProducts.map((product) => product.category)));

    const candidates = await listAddToOrderCandidateProducts({
      cartCategories,
      cartFloorPriceUsd,
      excludeProductIds: productIds,
      repository,
    });

    return NextResponse.json({ candidates });
  } catch {
    return NextResponse.json(
      { candidates: [], message: "Could not load add-to-order suggestions." },
      { status: 500 },
    );
  }
}
