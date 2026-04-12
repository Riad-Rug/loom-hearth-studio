import { NextResponse } from "next/server";

import { validatePromoCode } from "@/lib/promos/service";

export async function POST(request: Request) {
  const payload = (await request.json()) as {
    code?: string;
    subtotalUsd?: number;
    items?: Array<{
      productId: string;
      productCategory: "rugs" | "poufs" | "pillows" | "decor" | "vintage";
      quantity: number;
      priceUsd: number;
    }>;
  };

  const result = await validatePromoCode({
    code: payload.code ?? "",
    subtotalUsd: Number(payload.subtotalUsd ?? 0),
    items: Array.isArray(payload.items) ? payload.items : [],
  });

  return NextResponse.json(result, { status: result.status === 'valid' ? 200 : 400 });
}
