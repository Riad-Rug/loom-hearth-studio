import type {
  OrderCreationBoundary,
  OrderCreationRequest,
  OrderCreationResult,
  OrderPersistenceBoundary,
  OrderPersistenceRequest,
  OrderPersistenceResult,
} from "@/lib/order/contracts";
import type { StripeCheckoutPaymentConfirmation } from "@/lib/stripe";

export function createOrderCreationBoundary(): OrderCreationBoundary {
  return {
    source: "stripe-checkout-confirmation",
    paymentProvider: "stripe",
    status: "ready-placeholder",
    acceptedPaymentStatuses: ["paid", "authorized"],
  };
}

export function createOrderCreationRequestFromStripeConfirmation(
  confirmation: StripeCheckoutPaymentConfirmation | null,
): OrderCreationResult {
  const boundary = createOrderCreationBoundary();

  if (!confirmation) {
    return {
      status: "ignored",
      request: null,
      message: "Stripe Checkout confirmation is required before order creation can be prepared.",
    };
  }

  if (
    !boundary.acceptedPaymentStatuses.includes(
      confirmation.paymentStatus as (typeof boundary.acceptedPaymentStatuses)[number],
    )
  ) {
    return {
      status: "ignored",
      request: null,
      message:
        "Only confirmed paid or authorized Stripe Checkout events can hand off into backend order creation.",
    };
  }

  const request: OrderCreationRequest = {
    source: "stripe-checkout-webhook",
    checkoutMode: confirmation.checkoutMode,
    checkoutSessionId: confirmation.checkoutSessionId,
    paymentIntentId: confirmation.paymentIntentId,
    paymentMethod: "stripe-checkout",
    paymentStatus: confirmation.paymentStatus as OrderCreationRequest["paymentStatus"],
    customerEmail: confirmation.customerEmail,
    orderReference: confirmation.orderReference,
    lineItems: [],
    metadata: {
      stripeEventId: confirmation.eventId,
      stripeEventType: confirmation.eventType,
      checkoutMode: confirmation.checkoutMode,
    },
    orderSnapshot: confirmation.orderSnapshot,
  };

  return {
    status: "ready",
    request,
    message:
      "Stripe Checkout payment confirmation is ready to hand off into backend order creation.",
  };
}

export function createOrderPersistenceBoundary(): OrderPersistenceBoundary {
  return {
    source: "order-creation",
    repository: "OrderRepository",
    status: "ready-placeholder",
    acceptedOrderStatuses: ["paid", "pending"],
  };
}

export function createOrderPersistenceRequestFromOrderCreation(
  orderCreationRequest: OrderCreationRequest | null,
): OrderPersistenceResult {
  const boundary = createOrderPersistenceBoundary();

  if (!orderCreationRequest) {
    return {
      status: "ignored",
      request: null,
      persistedOrder: null,
      message: "Order creation request is required before order persistence can be prepared.",
    };
  }

  if (!orderCreationRequest.orderSnapshot) {
    return {
      status: "configuration-error",
      request: null,
      persistedOrder: null,
      message:
        "Order persistence requires a launch order snapshot with shipping address, items, and totals.",
    };
  }

  const request: OrderPersistenceRequest = {
    source: "order-creation",
    paymentProvider: "stripe",
    orderNumber: createLaunchOrderNumber(),
    checkoutMode: orderCreationRequest.checkoutMode,
    checkoutSessionId: orderCreationRequest.checkoutSessionId,
    paymentIntentId: orderCreationRequest.paymentIntentId,
    orderReference: orderCreationRequest.orderReference,
    customerEmail: orderCreationRequest.customerEmail,
    shippingAddress: orderCreationRequest.orderSnapshot.shippingAddress,
    status: orderCreationRequest.paymentStatus === "paid" ? "paid" : "pending",
    paymentStatus: orderCreationRequest.paymentStatus,
    items: orderCreationRequest.orderSnapshot.items,
    promoCode: orderCreationRequest.orderSnapshot.promoCode,
    discountUsd: orderCreationRequest.orderSnapshot.discountUsd,
    subtotalUsd: orderCreationRequest.orderSnapshot.subtotalUsd,
    shippingUsd: orderCreationRequest.orderSnapshot.shippingUsd,
    taxUsd: orderCreationRequest.orderSnapshot.taxUsd,
    totalUsd: orderCreationRequest.orderSnapshot.totalUsd,
    currency: orderCreationRequest.orderSnapshot.currency,
    placedAt: new Date().toISOString(),
    metadata: orderCreationRequest.metadata,
  };

  return {
    status: "ready",
    request,
    persistedOrder: null,
    message: "Order creation handoff is ready to pass into backend order persistence.",
  };
}

export function createLaunchOrderNumber() {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `LH-${timestamp}-${suffix}`;
}
