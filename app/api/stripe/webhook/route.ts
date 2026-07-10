import { NextResponse } from "next/server";

import {
  applyStripePaymentIntentTransition,
  persistConfirmedStripeCheckoutOrder,
} from "@/lib/order/service";
import {
  createStripeCheckoutWebhookReceipt,
  getStripeWebhookSignatureHeader,
  parseStripePaymentIntentWebhookEvent,
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

  if (signatureVerification.status === "verified") {
    const paymentIntentEvent = parseStripePaymentIntentWebhookEvent(payload);

    if (paymentIntentEvent) {
      const transitionResult = await applyStripePaymentIntentTransition({
        event: paymentIntentEvent,
      });

      return NextResponse.json(
        {
          status: transitionResult.status,
          eventType: paymentIntentEvent.type,
          eventId: paymentIntentEvent.id,
          message: transitionResult.message,
        },
        { status: 200 },
      );
    }
  }

  const receipt = createStripeCheckoutWebhookReceipt({
    payload,
    signatureHeader,
    signatureVerification,
  });
  const orderPersistenceResult =
    receipt.confirmationResult?.status === "confirmed"
      ? await persistConfirmedStripeCheckoutOrder({
          confirmation: receipt.confirmationResult.confirmation,
        })
      : null;

  return NextResponse.json(
    {
      ...receipt,
      orderPersistenceResult,
      todo: stripeConfirmationTodo.route,
    },
    {
      status:
        orderPersistenceResult?.status === "configuration-error"
          ? 503
          : receipt.status === "accepted" || receipt.status === "ignored"
          ? 200
          : receipt.status === "invalid-payload"
            ? 400
            : receipt.confirmationResult?.status === "signature-error"
              ? 400
              : 503,
    },
  );
}
