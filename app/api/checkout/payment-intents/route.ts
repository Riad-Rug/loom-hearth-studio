import { NextResponse } from "next/server";
import Stripe from "stripe";

import type { CheckoutOrderDraftRequest } from "@/lib/order/checkout-draft-validation";
import {
  buildCheckoutOrderDraftSnapshotMetadata,
  validateCheckoutOrderDraft,
} from "@/lib/order/checkout-draft-validation";
import { createStripeClient } from "@/lib/stripe/client";

export async function POST(request: Request) {
  const body = (await request.json()) as CheckoutOrderDraftRequest & {
    paymentIntentId?: string;
  };
  const validation = await validateCheckoutOrderDraft({ draft: body });

  if (validation.status !== "ready") {
    return NextResponse.json(
      {
        status: "validation-error",
        clientSecret: null,
        paymentIntentId: null,
        totalUsd: null,
        issues: validation.issues,
        message: validation.message,
      },
      { status: 400 },
    );
  }

  const snapshot = validation.validatedDraft;
  const amount = Math.round(snapshot.totalUsd * 100);
  const metadata = buildCheckoutOrderDraftSnapshotMetadata(snapshot);

  try {
    const stripe = createStripeClient();

    // Hold-then-capture: authorize the card now, capture manually once the
    // customer approves the pre-shipment photos/video. Preserve this even
    // as the integration moves from hosted Checkout to embedded Elements.
    const createPaymentIntent = () =>
      stripe.paymentIntents.create({
        amount,
        currency: "usd",
        capture_method: "manual",
        automatic_payment_methods: { enabled: true },
        receipt_email: snapshot.billingAddress.email,
        metadata,
      });

    let paymentIntent;
    let status: "created" | "updated" = "created";

    if (body.paymentIntentId) {
      try {
        paymentIntent = await stripe.paymentIntents.update(body.paymentIntentId, { amount, metadata });
        status = "updated";
      } catch (updateError) {
        // Stripe refuses to change the amount once a PaymentIntent has moved
        // past requires_payment_method/requires_confirmation/requires_action
        // (e.g. it was already confirmed). Rather than dead-end the customer,
        // start a fresh PaymentIntent for the current cart instead.
        if (updateError instanceof Stripe.errors.StripeInvalidRequestError) {
          paymentIntent = await createPaymentIntent();
        } else {
          throw updateError;
        }
      }
    } else {
      paymentIntent = await createPaymentIntent();
    }

    return NextResponse.json({
      status,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      totalUsd: snapshot.totalUsd,
      issues: [],
      message: "PaymentIntent is ready for the embedded payment step.",
    });
  } catch (error) {
    const message =
      error instanceof Stripe.errors.StripeError
        ? error.message
        : "Stripe PaymentIntent request failed.";

    return NextResponse.json(
      {
        status: "api-error",
        clientSecret: null,
        paymentIntentId: null,
        totalUsd: null,
        issues: [],
        message,
      },
      { status: 502 },
    );
  }
}
