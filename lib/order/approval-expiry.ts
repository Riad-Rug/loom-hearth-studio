import "server-only";

import type Stripe from "stripe";

import { createOrderRepository, type OrderRepository } from "@/lib/db/repositories/order-repository";
import { applyStripePaymentIntentTransition } from "@/lib/order/service";
import { storePromise } from "@/lib/order/store-promise";
import { createStripeClient } from "@/lib/stripe/client";
import { releasePaymentIntentHold } from "@/lib/stripe/payment-intent-hold";
import type { Order } from "@/types/domain";

const dayMs = 24 * 60 * 60 * 1000;

export type AwaitingApprovalAction = "release-hold" | "record-captured" | "record-released" | "wait";

export type ApprovalExpiryRunResult = {
  checked: number;
  expired: string[];
  reconciled: string[];
  waiting: number;
  failed: Array<{ orderNumber: string; reason: string }>;
};

// The decision window opens when the photos are sent, the same clock as the
// "approve by" date on the buyer's account page. Until photos are sent the buyer
// has not had their window, so the order waits; Stripe expiring the card hold
// still closes it, and this run catches that up if the webhook was missed.
export function decideAwaitingApprovalAction(input: {
  photosSentAt: string | undefined;
  paymentIntentStatus: Stripe.PaymentIntent.Status;
  now: Date;
}): AwaitingApprovalAction {
  if (input.paymentIntentStatus === "succeeded") return "record-captured";
  if (input.paymentIntentStatus === "canceled") return "record-released";
  if (input.paymentIntentStatus !== "requires_capture" || !input.photosSentAt) return "wait";

  const decisionDeadline =
    new Date(input.photosSentAt).getTime() + storePromise.decisionWindowDays * dayMs;

  return input.now.getTime() >= decisionDeadline ? "release-hold" : "wait";
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
    failed: [],
  };

  for (const order of orders) {
    try {
      const outcome = await settleAwaitingApprovalOrder({ order, now, repository, stripe });

      if (outcome === "expired") result.expired.push(order.orderNumber);
      else if (outcome === "reconciled") result.reconciled.push(order.orderNumber);
      else if (outcome === "waiting") result.waiting += 1;
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
}): Promise<"expired" | "reconciled" | "waiting" | { failed: string }> {
  const paymentIntentId = input.order.stripePaymentIntentId;

  if (!paymentIntentId) {
    return { failed: "Order has no Stripe PaymentIntent to check." };
  }

  const paymentIntent = await input.stripe.paymentIntents.retrieve(paymentIntentId);
  const action = decideAwaitingApprovalAction({
    photosSentAt: input.order.photosSentAt,
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
