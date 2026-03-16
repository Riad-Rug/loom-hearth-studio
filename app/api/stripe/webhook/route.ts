import { NextResponse } from "next/server";

import {
  createStripeCheckoutWebhookReceipt,
  getStripeWebhookSignatureHeader,
  stripeConfirmationTodo,
} from "@/lib/stripe";

export async function POST(request: Request) {
  const payload = await request.text();
  const signatureHeader = getStripeWebhookSignatureHeader({
    headers: request.headers,
  });
  const receipt = createStripeCheckoutWebhookReceipt({
    payload,
    signatureHeader,
  });

  return NextResponse.json(
    {
      ...receipt,
      todo: stripeConfirmationTodo.route,
    },
    {
      status:
        receipt.status === "accepted" || receipt.status === "ignored"
          ? 200
          : receipt.status === "invalid-payload"
            ? 400
            : 503,
    },
  );
}
