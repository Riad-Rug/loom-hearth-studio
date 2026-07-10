import "server-only";

import { Prisma } from "@prisma/client";

import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import type { OrderRepository } from "@/lib/db/repositories/order-repository";
import { sendOrderConfirmationEmailFromCreatedOrder } from "@/lib/email/service";
import { orchestrateLaunchOrderFulfillment } from "@/lib/fulfillment/service";
import type { PersistConfirmedOrderResult } from "@/lib/order/contracts";
import { recordPromoRedemption } from "@/lib/promos/service";
import {
  createOrderCreationRequestFromStripeConfirmation,
  createOrderPersistenceRequestFromOrderCreation,
} from "@/lib/order/helpers";
import type {
  StripeCheckoutPaymentConfirmation,
  StripePaymentIntentWebhookEvent,
} from "@/lib/stripe";
import type { Order } from "@/types/domain";

export async function persistConfirmedStripeCheckoutOrder(input: {
  confirmation: StripeCheckoutPaymentConfirmation | null;
  repository?: OrderRepository;
}): Promise<PersistConfirmedOrderResult> {
  const repository = input.repository ?? createOrderRepository();
  const orderCreationResult = createOrderCreationRequestFromStripeConfirmation(
    input.confirmation,
  );

  if (orderCreationResult.status !== "ready" || !orderCreationResult.request) {
    return {
      status:
        orderCreationResult.status === "configuration-error"
          ? "configuration-error"
          : "ignored",
      orderCreationRequest: orderCreationResult.request,
      persistenceRequest: null,
      persistedOrder: null,
      emailDeliveryResult: null,
      fulfillmentResult: null,
      message: orderCreationResult.message,
    };
  }

  const existingOrder = await repository.getByCheckoutSessionId(
    orderCreationResult.request.checkoutSessionId,
  );

  if (existingOrder) {
    return {
      status: "already-persisted",
      orderCreationRequest: orderCreationResult.request,
      persistenceRequest: null,
      persistedOrder: existingOrder,
      emailDeliveryResult: null,
      fulfillmentResult: null,
      message: "Stripe Checkout session was already persisted as a launch order.",
    };
  }

  const persistenceResult = createOrderPersistenceRequestFromOrderCreation(
    orderCreationResult.request,
  );

  if (persistenceResult.status !== "ready" || !persistenceResult.request) {
    return {
      status:
        persistenceResult.status === "configuration-error"
          ? "configuration-error"
          : "ignored",
      orderCreationRequest: orderCreationResult.request,
      persistenceRequest: persistenceResult.request,
      persistedOrder: persistenceResult.persistedOrder,
      emailDeliveryResult: null,
      fulfillmentResult: null,
      message: persistenceResult.message,
    };
  }

  try {
    const persistedOrder = await repository.create(persistenceResult.request);
    if (persistedOrder.promoCode && persistedOrder.discountUsd > 0) {
      await recordPromoRedemption({
        promoCode: persistedOrder.promoCode,
        discountUsd: persistedOrder.discountUsd,
        orderId: persistedOrder.id,
        customerEmail: persistedOrder.shippingAddress.email,
      });
    }
    const emailDeliveryResult = await sendOrderConfirmationEmailFromCreatedOrder({
      order: persistedOrder,
      orderCreationRequest: orderCreationResult.request,
    });
    // Authorized (hold-then-capture) orders are not fulfilled until the
    // payment is captured; fulfillment is triggered by payment_intent.succeeded.
    const fulfillmentResult =
      persistedOrder.paymentStatus === "paid"
        ? await orchestrateLaunchOrderFulfillment({
            trigger: "persisted-paid-order",
            order: persistedOrder,
          })
        : null;

    return {
      status: "created",
      orderCreationRequest: orderCreationResult.request,
      persistenceRequest: persistenceResult.request,
      persistedOrder,
      emailDeliveryResult,
      fulfillmentResult,
      message:
        emailDeliveryResult.status === "sent"
          ? fulfillmentResult?.status === "recorded" || fulfillmentResult?.status === "already-recorded"
            ? "Confirmed Stripe Checkout event persisted a launch order, triggered the confirmation email, and recorded the manual fulfillment action."
            : "Confirmed Stripe Checkout event persisted a launch order and triggered the confirmation email."
          : fulfillmentResult?.status === "recorded" || fulfillmentResult?.status === "already-recorded"
            ? "Confirmed Stripe Checkout event persisted a launch order and recorded the manual fulfillment action, but confirmation email delivery did not complete."
            : "Confirmed Stripe Checkout event persisted a launch order, but confirmation email delivery did not complete.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const duplicatedOrder = await repository.getByCheckoutSessionId(
        orderCreationResult.request.checkoutSessionId,
      );

      if (duplicatedOrder) {
        return {
          status: "already-persisted",
          orderCreationRequest: orderCreationResult.request,
          persistenceRequest: persistenceResult.request,
          persistedOrder: duplicatedOrder,
          emailDeliveryResult: null,
          fulfillmentResult: null,
          message: "Stripe Checkout session was already persisted as a launch order.",
        };
      }
    }

    throw error;
  }
}

export type StripePaymentIntentTransitionResult = {
  status: "updated" | "ignored" | "not-found";
  order: Order | null;
  fulfillmentResult: Awaited<ReturnType<typeof orchestrateLaunchOrderFulfillment>> | null;
  message: string;
};

export async function applyStripePaymentIntentTransition(input: {
  event: StripePaymentIntentWebhookEvent;
  repository?: OrderRepository;
}): Promise<StripePaymentIntentTransitionResult> {
  const repository = input.repository ?? createOrderRepository();
  const order = await repository.getByPaymentIntentId(input.event.paymentIntentId);

  if (!order) {
    return {
      status: "not-found",
      order: null,
      fulfillmentResult: null,
      message: `No launch order matches payment intent ${input.event.paymentIntentId}.`,
    };
  }

  if (input.event.type === "payment_intent.succeeded") {
    if (order.paymentStatus === "paid") {
      return {
        status: "ignored",
        order,
        fulfillmentResult: null,
        message: "Order is already marked as paid.",
      };
    }

    const updatedOrder = await repository.updatePaymentTransition(order.id, {
      status: "paid",
      paymentStatus: "paid",
    });
    const fulfillmentResult = await orchestrateLaunchOrderFulfillment({
      trigger: "persisted-paid-order",
      order: updatedOrder,
    });

    return {
      status: "updated",
      order: updatedOrder,
      fulfillmentResult,
      message: "Payment captured: order transitioned from authorized to paid.",
    };
  }

  // payment_intent.canceled: the hold was released (declined after review
  // or expired without capture). Never downgrade an order that already paid.
  if (order.paymentStatus === "paid") {
    return {
      status: "ignored",
      order,
      fulfillmentResult: null,
      message: "Cancellation event ignored because the order is already paid.",
    };
  }

  const cancelledOrder = await repository.updatePaymentTransition(order.id, {
    status: "cancelled",
    paymentStatus: "failed",
  });

  return {
    status: "updated",
    order: cancelledOrder,
    fulfillmentResult: null,
    message: "Payment hold released: order transitioned to cancelled.",
  };
}
