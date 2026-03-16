import { NextResponse } from "next/server";

import type { StripeCheckoutSessionRequest } from "@/lib/stripe/contracts";
import { createStripeCheckoutSessionWithResult } from "@/lib/stripe/service";

export async function POST(request: Request) {
  const payload = (await request.json()) as StripeCheckoutSessionRequest;
  const result = await createStripeCheckoutSessionWithResult(payload);

  return NextResponse.json(result, {
    status:
      result.status === "created"
        ? 200
        : result.status === "configuration-error"
          ? 503
          : 502,
  });
}
