import { NextResponse } from "next/server";
import type Stripe from "stripe";

import type { PersistConfirmedOrderResult } from "@/lib/order/contracts";
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
    let event: Stripe.Event | null = null;

    try {
      event = createStripeClient().webhooks.constructEvent(payload, signatureHeader, webhookSecret);
    } catch {
      // Not verifiable via the official SDK path — fall through.
    }

    // Outside the try so a persistence failure surfaces as a 500 and Stripe
    // retries the event, instead of falling through to a 200 "ignored".
    if (event?.type === "payment_intent.amount_capturable_updated") {
      const paymentIntentId = (event.data.object as { id: string }).id;
      const result = await persistConfirmedStripePaymentIntentOrder({ paymentIntentId });

      return NextResponse.json(
        {
          status: result.status,
          eventType: event.type,
          eventId: event.id,
          message: result.message,
        },
        { status: holdStillNeedsRelease(result) ? 500 : 200 },
      );
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
          : orderPersistenceResult && holdStillNeedsRelease(orderPersistenceResult)
          ? 500
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

// An order that lost the race for its last unit must not leave the buyer's card
// held. A non-2xx response makes Stripe redeliver the event, which retries the release.
function holdStillNeedsRelease(result: PersistConfirmedOrderResult) {
  return (
    (result.status === "unavailable" || result.status === "not-placed") && result.authorizationRelease === "unresolved"
  );
}
