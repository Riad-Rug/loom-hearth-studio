import "server-only";

import type Stripe from "stripe";

export type PaymentIntentHoldRelease = "released" | "captured" | "unresolved";

// Cancelling an uncaptured PaymentIntent releases the hold on the buyer's card.
// Stripe rejects a cancel once the PaymentIntent is already canceled or
// captured, so a failed cancel reads where the PaymentIntent actually ended up.
export async function releasePaymentIntentHold(
  stripe: Stripe,
  paymentIntentId: string,
  cancellationReason?: Stripe.PaymentIntentCancelParams.CancellationReason,
): Promise<PaymentIntentHoldRelease> {
  try {
    await stripe.paymentIntents.cancel(
      paymentIntentId,
      cancellationReason ? { cancellation_reason: cancellationReason } : {},
    );
    return "released";
  } catch (cancelError) {
    try {
      const { status } = await stripe.paymentIntents.retrieve(paymentIntentId);

      if (status === "canceled") return "released";
      if (status === "succeeded") return "captured";
    } catch {
      // Fall through and report the original cancel failure.
    }

    console.error("STRIPE_HOLD_RELEASE_FAILED", {
      paymentIntentId,
      error: cancelError instanceof Error ? cancelError.message : String(cancelError),
    });
    return "unresolved";
  }
}

// ISO time Stripe refunds the uncaptured card hold, from a PaymentIntent
// retrieved with `expand: ["latest_charge"]`.
export function readHoldExpiry(paymentIntent: Stripe.PaymentIntent): string | null {
  const charge = paymentIntent.latest_charge;
  const captureBefore =
    charge && typeof charge === "object" ? charge.payment_method_details?.card?.capture_before : undefined;

  return captureBefore ? new Date(captureBefore * 1000).toISOString() : null;
}
