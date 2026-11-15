import "server-only";

import { Prisma } from "@prisma/client";

import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import type { OrderRepository } from "@/lib/db/repositories/order-repository";
import { sendOrderConfirmationEmailFromCreatedOrder } from "@/lib/email/service";
import { orchestrateLaunchOrderFulfillment } from "@/lib/fulfillment/service";
import { parseCheckoutOrderDraftSnapshotFromMetadata } from "@/lib/order/checkout-draft-validation";
import { InventoryUnavailableError } from "@/lib/order/inventory-hold";
import type { OrderCreationRequest, OrderPersistenceRequest, PersistConfirmedOrderResult } from "@/lib/order/contracts";
import { recordPromoRedemption } from "@/lib/promos/service";
import {
  createLaunchOrderNumber,
  createOrderCreationRequestFromStripeConfirmation,
  createOrderPersistenceRequestFromOrderCreation,
} from "@/lib/order/helpers";
import { createStripeClient } from "@/lib/stripe/client";
import { readHoldExpiry, releasePaymentIntentHold } from "@/lib/stripe/payment-intent-hold";
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
    const creation = await createOrderTakingStock({
      repository,
      orderCreationRequest: orderCreationResult.request,
      persistenceRequest: persistenceResult.request,
    });

    if (creation.status === "declined") {
      return creation.result;
    }

    const persistedOrder = creation.order;
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
  event: Pick<StripePaymentIntentWebhookEvent, "type" | "paymentIntentId">;
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

    // A captured payment is recorded even when its piece now belongs to another
    // order; the order's hold then reads "conflict" for the studio to settle.
    const updatedOrder = await repository.updatePaymentTransition(
      order.id,
      { status: hasLeftTheStudio(order) ? order.status : "paid", paymentStatus: "paid" },
      { onUnavailable: "record-conflict" },
    );
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

  // A piece that already shipped stays shipped; its lapsed payment is for the studio to chase.
  const cancelledOrder = await repository.updatePaymentTransition(
    order.id,
    { status: hasLeftTheStudio(order) ? order.status : "cancelled", paymentStatus: "failed" },
    { onUnavailable: "record-conflict" },
  );

  return {
    status: "updated",
    order: cancelledOrder,
    fulfillmentResult: null,
    message: hasLeftTheStudio(order)
      ? "Payment hold lapsed after the order shipped: payment marked failed, order left as shipped."
      : "Payment hold released: order transitioned to cancelled.",
  };
}

function hasLeftTheStudio(order: Pick<Order, "status">) {
  return order.status === "shipped" || order.status === "delivered";
}

// Called both synchronously (right after the customer confirms payment on
// the Review step) and from the payment_intent.amount_capturable_updated
// webhook. Whichever fires first creates the order; the other sees the
// unique paymentIntentId constraint and returns the existing row instead of
// duplicating it.
export async function persistConfirmedStripePaymentIntentOrder(input: {
  paymentIntentId: string;
  repository?: OrderRepository;
  stripe?: ReturnType<typeof createStripeClient>;
}): Promise<PersistConfirmedOrderResult> {
  const repository = input.repository ?? createOrderRepository();

  const existingOrder = await repository.getByPaymentIntentId(input.paymentIntentId);

  if (existingOrder) {
    return {
      status: "already-persisted",
      orderCreationRequest: null,
      persistenceRequest: null,
      persistedOrder: existingOrder,
      emailDeliveryResult: null,
      fulfillmentResult: null,
      message: "PaymentIntent was already persisted as an order.",
    };
  }

  let stripe;
  let paymentIntent;

  try {
    stripe = input.stripe ?? createStripeClient();
    paymentIntent = await stripe.paymentIntents.retrieve(input.paymentIntentId, {
      expand: ["latest_charge"],
    });
  } catch (error) {
    return {
      status: "configuration-error",
      orderCreationRequest: null,
      persistenceRequest: null,
      persistedOrder: null,
      emailDeliveryResult: null,
      fulfillmentResult: null,
      message:
        error instanceof Error
          ? `Could not retrieve PaymentIntent ${input.paymentIntentId} from Stripe: ${error.message}`
          : `Could not retrieve PaymentIntent ${input.paymentIntentId} from Stripe.`,
    };
  }

  if (paymentIntent.status !== "requires_capture" && paymentIntent.status !== "succeeded") {
    return {
      status: "ignored",
      orderCreationRequest: null,
      persistenceRequest: null,
      persistedOrder: null,
      emailDeliveryResult: null,
      fulfillmentResult: null,
      message: `PaymentIntent ${input.paymentIntentId} is not authorized yet (status: ${paymentIntent.status}).`,
    };
  }

  const snapshot = parseCheckoutOrderDraftSnapshotFromMetadata(paymentIntent.metadata);

  if (!snapshot) {
    return {
      status: "configuration-error",
      orderCreationRequest: null,
      persistenceRequest: null,
      persistedOrder: null,
      emailDeliveryResult: null,
      fulfillmentResult: null,
      message: `PaymentIntent ${input.paymentIntentId} metadata did not include a valid order snapshot.`,
    };
  }

  const orderCreationRequest: OrderCreationRequest = {
    source: "stripe-payment-intent",
    checkoutMode: "guest",
    checkoutSessionId: null,
    paymentIntentId: input.paymentIntentId,
    paymentMethod: "stripe-payment-intent",
    paymentStatus: "authorized",
    customerEmail: snapshot.billingAddress.email,
    orderReference: null,
    lineItems: snapshot.items.map((item) => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity,
      unitAmountUsd: item.priceUsd,
    })),
    metadata: {
      stripeEventId: input.paymentIntentId,
      stripeEventType: "payment_intent.amount_capturable_updated",
      checkoutMode: "guest",
    },
    orderSnapshot: null,
  };

  const persistenceRequest: OrderPersistenceRequest = {
    source: "order-creation",
    paymentProvider: "stripe",
    orderNumber: createLaunchOrderNumber(),
    checkoutMode: "guest",
    checkoutSessionId: null,
    paymentIntentId: input.paymentIntentId,
    orderReference: null,
    customerEmail: snapshot.billingAddress.email,
    billingAddress: snapshot.billingAddress,
    shippingAddress: snapshot.shippingAddress,
    status: paymentIntent.status === "succeeded" ? "paid" : "pending",
    paymentStatus: paymentIntent.status === "succeeded" ? "paid" : "authorized",
    items: snapshot.items,
    promoCode: snapshot.promoCode,
    discountUsd: snapshot.discountUsd,
    subtotalUsd: snapshot.subtotalUsd,
    shippingUsd: snapshot.shippingUsd,
    taxUsd: snapshot.taxUsd,
    totalUsd: snapshot.totalUsd,
    currency: "USD",
    placedAt: new Date().toISOString(),
    holdExpiresAt: readHoldExpiry(paymentIntent) ?? undefined,
    metadata: orderCreationRequest.metadata,
  };

  try {
    const creation = await createOrderTakingStock({
      repository,
      orderCreationRequest,
      persistenceRequest,
      stripe,
    });

    if (creation.status === "declined") {
      return creation.result;
    }

    const persistedOrder = creation.order;

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
      orderCreationRequest,
    });

    // Authorized (hold-then-capture) orders are not fulfilled until the
    // payment is captured; fulfillment is triggered by payment_intent.succeeded.
    return {
      status: "created",
      orderCreationRequest,
      persistenceRequest,
      persistedOrder,
      emailDeliveryResult,
      fulfillmentResult: null,
      message:
        emailDeliveryResult.status === "sent"
          ? "Confirmed PaymentIntent authorization persisted a launch order and triggered the confirmation email."
          : "Confirmed PaymentIntent authorization persisted a launch order, but confirmation email delivery did not complete.",
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const duplicatedOrder = await repository.getByPaymentIntentId(input.paymentIntentId);

      if (duplicatedOrder) {
        return {
          status: "already-persisted",
          orderCreationRequest,
          persistenceRequest,
          persistedOrder: duplicatedOrder,
          emailDeliveryResult: null,
          fulfillmentResult: null,
          message: "PaymentIntent was already persisted as an order.",
        };
      }
    }

    throw error;
  }
}

// Creates the order and takes its stock. When another order got there first:
// an uncaptured hold is released and nothing is saved, so the buyer is not left
// with money reserved for a piece they cannot have; a payment already captured
// is saved with a stock conflict instead, so that money always has an order the
// studio sees and refunds.
async function createOrderTakingStock(input: {
  repository: OrderRepository;
  orderCreationRequest: OrderCreationRequest;
  persistenceRequest: OrderPersistenceRequest;
  stripe?: ReturnType<typeof createStripeClient>;
}): Promise<{ status: "created"; order: Order } | { status: "declined"; result: PersistConfirmedOrderResult }> {
  const { persistenceRequest } = input;

  try {
    return { status: "created", order: await input.repository.create(persistenceRequest) };
  } catch (error) {
    if (!(error instanceof InventoryUnavailableError)) {
      throw error;
    }

    const authorizationRelease =
      persistenceRequest.paymentStatus === "paid"
        ? "captured"
        : persistenceRequest.paymentIntentId
          ? await releasePaymentIntentHold(input.stripe ?? createStripeClient(), persistenceRequest.paymentIntentId)
          : "unresolved";
    const unavailableNames = persistenceRequest.items
      .filter((item) => error.productIds.includes(item.productId))
      .map((item) => item.name);
    const subject = unavailableNames.length
      ? `${unavailableNames.join(", ")} ${unavailableNames.length > 1 ? "are" : "is"}`
      : "A piece in your order is";
    const declined = {
      orderCreationRequest: input.orderCreationRequest,
      persistenceRequest,
      emailDeliveryResult: null,
      fulfillmentResult: null,
      authorizationRelease,
      unavailableProductIds: error.productIds,
    };

    if (authorizationRelease === "captured") {
      const flaggedOrder = await input.repository.create(
        { ...persistenceRequest, status: "paid", paymentStatus: "paid" },
        { onUnavailable: "record-conflict" },
      );

      return {
        status: "declined",
        result: {
          ...declined,
          status: "oversold",
          persistedOrder: flaggedOrder,
          message: `${subject} no longer available: another buyer reserved it moments before your payment was taken. Your payment did go through, so we have recorded it as order ${flaggedOrder.orderNumber} and the studio will refund you in full.`,
        },
      };
    }

    if (authorizationRelease === "unresolved") {
      console.error("UNAVAILABLE_ORDER_HOLD_NOT_RELEASED", {
        paymentIntentId: persistenceRequest.paymentIntentId,
        productIds: error.productIds,
      });
    }

    return {
      status: "declined",
      result: {
        ...declined,
        status: "unavailable",
        persistedOrder: null,
        message:
          authorizationRelease === "released"
            ? `${subject} no longer available: another buyer reserved it moments before your order went through. The hold on your card has been released and you have not been charged.`
            : `${subject} no longer available: another buyer reserved it moments before your order went through. You have not been charged. The hold on your card has not been released yet; it lapses on its own within 7 days, or contact the studio to release it sooner.`,
      },
    };
  }
}
