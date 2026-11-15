import "server-only";

import type Stripe from "stripe";

import { createOrderRepository, type OrderRepository } from "@/lib/db/repositories/order-repository";
import {
  resolveApprovalDeadline,
  resolveAutoCancelMoment,
  resolveHoldExpiry,
} from "@/lib/order/approval-deadline";
import { applyStripePaymentIntentTransition } from "@/lib/order/service";
import { createStripeClient } from "@/lib/stripe/client";
import { readHoldExpiry, releasePaymentIntentHold } from "@/lib/stripe/payment-intent-hold";
import type { Order } from "@/types/domain";

export type AwaitingApprovalAction = "release-hold" | "record-captured" | "record-released" | "wait";

export type ApprovalExpiryRunResult = {
  checked: number;
  expired: string[];
  reconciled: string[];
  waiting: number;
  // Orders with no PaymentIntent (the legacy hosted Checkout path) have no hold to manage.
  skipped: string[];
  failed: Array<{ orderNumber: string; reason: string }>;
};

// Stripe's own state wins: a captured or already-released hold just catches
// the order up. Otherwise the hold is released a capture margin after the
// buyer's deadline.
export function decideAwaitingApprovalAction(input: {
  deadline: Date;
  paymentIntentStatus: Stripe.PaymentIntent.Status;
  now: Date;
}): AwaitingApprovalAction {
  if (input.paymentIntentStatus === "succeeded") return "record-captured";
  if (input.paymentIntentStatus === "canceled") return "record-released";
  if (input.paymentIntentStatus !== "requires_capture") return "wait";

  return input.now.getTime() >= resolveAutoCancelMoment(input.deadline).getTime() ? "release-hold" : "wait";
}

export async function expireUnapprovedOrders(
  input: { now?: Date; repository?: OrderRepository; stripe?: Stripe } = {},
): Promise<ApprovalExpiryRunResult> {
  const now = input.now ?? new Date();
  const repository = input.repository ?? createOrderRepository();
  const stripe = input.stripe ?? createStripeClient();
  const orders = await repository.listAwaitingApproval();
  const result: ApprovalExpiryRunResult = {
    checked: orders.length,
    expired: [],
    reconciled: [],
    waiting: 0,
    skipped: [],
    failed: [],
  };

  for (const order of orders) {
    try {
      const outcome = await settleAwaitingApprovalOrder({ order, now, repository, stripe });

      if (outcome === "expired") result.expired.push(order.orderNumber);
      else if (outcome === "reconciled") result.reconciled.push(order.orderNumber);
      else if (outcome === "waiting") result.waiting += 1;
      else if (outcome === "skipped") result.skipped.push(order.orderNumber);
      else result.failed.push({ orderNumber: order.orderNumber, reason: outcome.failed });
    } catch (error) {
      result.failed.push({
        orderNumber: order.orderNumber,
        reason: error instanceof Error ? error.message : String(error),
      });
    }
  }

  return result;
}

async function settleAwaitingApprovalOrder(input: {
  order: Order;
  now: Date;
  repository: OrderRepository;
  stripe: Stripe;
}): Promise<"expired" | "reconciled" | "waiting" | "skipped" | { failed: string }> {
  const paymentIntentId = input.order.stripePaymentIntentId;

  if (!paymentIntentId) {
    return "skipped";
  }

  const paymentIntent = await input.stripe.paymentIntents.retrieve(paymentIntentId, {
    expand: ["latest_charge"],
  });
  const stripeHoldExpiresAt = readHoldExpiry(paymentIntent);

  // Orders placed before the expiry was stored get it filled in while Stripe can still supply it.
  if (stripeHoldExpiresAt && !input.order.holdExpiresAt) {
    await input.repository.recordHoldExpiry(input.order.id, stripeHoldExpiresAt);
  }

  const deadline = resolveApprovalDeadline({
    photosSentAt: input.order.photosSentAt,
    holdExpiresAt: resolveHoldExpiry({
      placedAt: input.order.placedAt,
      holdExpiresAt: stripeHoldExpiresAt ?? input.order.holdExpiresAt,
    }),
  });
  const action = decideAwaitingApprovalAction({
    deadline,
    paymentIntentStatus: paymentIntent.status,
    now: input.now,
  });

  if (action === "wait") {
    return "waiting";
  }

  // Release at Stripe before touching the order, so the piece never goes back on
  // sale while the buyer's card is still held for it.
  const release =
    action === "release-hold"
      ? await releasePaymentIntentHold(input.stripe, paymentIntentId, "abandoned")
      : action === "record-captured"
        ? "captured"
        : "released";

  if (release === "unresolved") {
    return { failed: "Stripe did not release the card hold." };
  }

  await applyStripePaymentIntentTransition({
    event: {
      type: release === "captured" ? "payment_intent.succeeded" : "payment_intent.canceled",
      paymentIntentId,
    },
    repository: input.repository,
  });

  return action === "release-hold" && release === "released" ? "expired" : "reconciled";
}
