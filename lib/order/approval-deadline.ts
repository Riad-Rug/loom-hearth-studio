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
// later, so an approval that arrives at the last minute can still be captured,
// and never after Stripe would let the hold go anyway.
export function resolveAutoCancelMoment(input: { deadline: Date; holdExpiresAt: Date }): Date {
  return new Date(
    Math.min(input.deadline.getTime() + captureMarginHours * hourMs, input.holdExpiresAt.getTime()),
  );
}

// The promise must fit inside the card hold: photos at the latest turnaround,
// then the full decision window, then the capture margin. If the facts stop
// fitting, the buyer would be given less time than the site states.
const worstCaseHoldDays =
  storePromise.approvalTurnaroundHours.max / 24 + storePromise.decisionWindowDays + captureMarginHours / 24;

if (worstCaseHoldDays > cardHoldValidityDays) {
  throw new Error(
    `store promise does not fit the card hold: ${worstCaseHoldDays} days needed, ${cardHoldValidityDays} available`,
  );
}
