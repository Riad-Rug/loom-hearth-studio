import { storePromise } from "@/lib/order/store-promise";

const hourMs = 60 * 60 * 1000;
const dayMs = 24 * hourMs;

// Stripe holds an online, customer-initiated card authorization for 7 days on
// Visa, Mastercard, American Express, and Discover, then refunds it uncaptured
// (docs.stripe.com/payments/place-a-hold-on-a-payment-method). The charge's
// payment_method_details.card.capture_before gives the exact moment.
export const cardHoldValidityDays = 7;

// Room for the studio to capture after a last-minute approval, before Stripe
// lets the hold go.
export const captureMarginHours = 24;

export function resolveHoldExpiry(order: { placedAt: string; holdExpiresAt?: string | null }): Date {
  return order.holdExpiresAt
    ? new Date(order.holdExpiresAt)
    : new Date(new Date(order.placedAt).getTime() + cardHoldValidityDays * dayMs);
}

// The buyer's "approve by" moment: the decision window from when photos were
// sent, cut short if the card hold would lapse first. Before photos are sent it
// is the last moment the order could still be approved and captured.
export function resolveApprovalDeadline(input: { photosSentAt?: string | null; holdExpiresAt: Date }): Date {
  const lastCaptureMoment = input.holdExpiresAt.getTime() - captureMarginHours * hourMs;
  const decisionWindowEnd = input.photosSentAt
    ? new Date(input.photosSentAt).getTime() + storePromise.decisionWindowDays * dayMs
    : Number.POSITIVE_INFINITY;

  return new Date(Math.min(lastCaptureMoment, decisionWindowEnd));
}

// The buyer is shown the deadline; the hold is released one capture margin
// later, so an approval that arrives at the last minute can still be captured.
// The deadline is never later than the hold expiry less that margin.
export function resolveAutoCancelMoment(deadline: Date): Date {
  return new Date(deadline.getTime() + captureMarginHours * hourMs);
}
