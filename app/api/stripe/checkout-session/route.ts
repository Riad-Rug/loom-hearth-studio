import { NextResponse } from "next/server";

import { validateCheckoutSessionRequestAgainstLaunchCatalog } from "@/lib/catalog/validation";
import type { StripeCheckoutSessionRequest } from "@/lib/stripe/contracts";
import { createStripeCheckoutSessionWithResult } from "@/lib/stripe/service";

export async function POST(request: Request) {
  const payload = (await request.json()) as StripeCheckoutSessionRequest;
  const validation = await validateCheckoutSessionRequestAgainstLaunchCatalog({
    request: payload,
  });

  if (validation.status !== "ready" || !validation.validatedRequest) {
    return NextResponse.json(
      {
        status: "validation-error",
        session: null,
        redirectTarget: null,
        validationIssues: validation.issues,
        message: validation.message,
      },
      { status: 400 },
    );
  }

  const result = await createStripeCheckoutSessionWithResult(validation.validatedRequest);

  return NextResponse.json(result, {
    status:
      result.status === "created"
        ? 200
        : result.status === "validation-error"
          ? 400
        : result.status === "configuration-error"
          ? 503
          : 502,
  });
}
