import { NextResponse } from "next/server";

import {
  createStripeCheckoutWebhookReceipt,
  getStripeWebhookSignatureHeader,
  stripeConfirmationTodo,
} from "@/lib/stripe";
import { verifyStripeCheckoutWebhookSignature } from "@/lib/stripe/service";

export async function POST(request: Request) {
  const payload = await request.text();
  const signatureHeader = getStripeWebhookSignatureHeader({
    headers: request.headers,
  });
  const signatureVerification = verifyStripeCheckoutWebhookSignature({
    payload,
    signatureHeader,
  });
  const receipt = createStripeCheckoutWebhookReceipt({
    payload,
    signatureHeader,
    signatureVerification,
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
            : receipt.confirmationResult?.status === "signature-error"
              ? 400
              : 503,
    },
  );
}
