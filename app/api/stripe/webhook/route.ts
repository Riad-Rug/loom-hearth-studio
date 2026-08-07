import { NextResponse } from "next/server";

import {
  applyStripePaymentIntentTransition,
  persistConfirmedStripeCheckoutOrder,
  persistConfirmedStripePaymentIntentOrder,
} from "@/lib/order/service";
import {
  createStripeCheckoutWebhookReceipt,
  getStripeWebhookSignatureHeader,
  parseStripePaymentIntentWebhookEvent,
  stripeConfirmationTodo,
} from "@/lib/stripe";
import { createStripeClient } from "@/lib/stripe/client";
import { getStripeServerConfig } from "@/lib/stripe/config";
import { verifyStripeCheckoutWebhookSignature } from "@/lib/stripe/service";

export async function POST(request: Request) {
  const payload = await request.text();
  const signatureHeader = getStripeWebhookSignatureHeader({
    headers: request.headers,
  });

  // New embedded-payment flow: verify via the official SDK and handle the
  // "authorized" event for manual-capture PaymentIntents. Anything that
  // isn't this event type (including every legacy Checkout Session event)
  // falls through unchanged to the hand-rolled verification path below.
  const webhookSecret = getStripeServerConfig().webhookSecret;

  if (signatureHeader && webhookSecret) {
    try {
      const stripe = createStripeClient();
      const event = stripe.webhooks.constructEvent(payload, signatureHeader, webhookSecret);

      if (event.type === "payment_intent.amount_capturable_updated") {
        const paymentIntentId = (event.data.object as { id: string }).id;
        const result = await persistConfirmedStripePaymentIntentOrder({ paymentIntentId });

        return NextResponse.json(
          {
            status: result.status,
            eventType: event.type,
            eventId: event.id,
            message: result.message,
          },
          { status: 200 },
        );
      }
    } catch {
      // Not verifiable/relevant via the official SDK path — fall through.
    }
  }

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
