import type { OrderDraft } from "@/features/checkout/checkout-provider";
import type {
  StripeCheckoutPaymentDraft,
  StripeOrderPaymentInput,
} from "@/lib/stripe";

import type {
  OrderCreationBoundary,
  OrderCreationRequest,
  OrderCreationResult,
  OrderPersistenceBoundary,
  OrderPersistenceRequest,
  OrderPersistenceResult,
  OrderSubmissionFailure,
  OrderSubmissionPayload,
  OrderSubmissionPreview,
} from "@/lib/order/contracts";
import type { StripeCheckoutPaymentConfirmation } from "@/lib/stripe";

export function createOrderSubmissionPayload(input: {
  orderDraft: OrderDraft;
  stripePaymentDraft: StripeCheckoutPaymentDraft;
  stripeOrderPaymentInput: StripeOrderPaymentInput;
}): OrderSubmissionPayload | null {
  const { orderDraft, stripePaymentDraft, stripeOrderPaymentInput } = input;

  if (!orderDraft.shippingAddress || !orderDraft.shippingMethod) {
    return null;
  }

  return {
    checkoutMode: orderDraft.checkoutMode,
    email: orderDraft.shippingAddress.email,
    items: orderDraft.items.map((item, index) => ({
      id: stripeOrderPaymentInput.lineItems[index]?.id ?? item.id,
      productId: item.productId,
      productType: item.productType,
      name: item.name,
      quantity: item.quantity,
      unitAmountUsd: item.priceUsd,
      variantName: item.variantName,
    })),
    shippingAddress: orderDraft.shippingAddress,
    shippingMethod: orderDraft.shippingMethod,
    paymentMethod: orderDraft.paymentMethod,
    paymentStatus: stripePaymentDraft.paymentStatus,
    promoCode: orderDraft.promoCode ?? undefined,
    discountUsd: orderDraft.discountUsd,
    subtotalUsd: orderDraft.subtotalUsd,
    shippingUsd: orderDraft.shippingUsd,
    taxUsd: orderDraft.taxUsd,
    totalUsd: orderDraft.totalUsd,
    currency: orderDraft.currency,
  };
}

export function createOrderSubmissionPreview(
  payload: OrderSubmissionPayload | null,
): OrderSubmissionPreview | null {
  if (!payload) {
    return null;
  }

  return {
    status: "placeholder",
    orderReference: "LH-ORDER-DRAFT",
    paymentStatus: payload.paymentStatus,
    confirmationLabel: "Order submission placeholder only",
  };
}

export function createOrderSubmissionFailure(input: {
  hasPayload: boolean;
  hasPaymentConfig: boolean;
}): OrderSubmissionFailure | null {
  if (!input.hasPayload) {
    return {
      status: "placeholder",
      code: "missing-payload",
      message: "Order submission payload is incomplete. Review the checkout details before retrying.",
    };
  }

  if (!input.hasPaymentConfig) {
    return {
      status: "placeholder",
      code: "missing-payment-config",
      message:
        "Stripe publishable key is still missing in this placeholder environment, so the submission attempt cannot proceed beyond the boundary state.",
    };
  }

  return null;
}

export function createOrderCreationBoundary(): OrderCreationBoundary {
  return {
    source: "stripe-checkout-confirmation",
    paymentProvider: "stripe",
    status: "ready-placeholder",
    acceptedPaymentStatuses: ["paid"],
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

  if (confirmation.paymentStatus !== "paid") {
    return {
      status: "ignored",
      request: null,
      message:
        "Only confirmed paid Stripe Checkout events can hand off into backend order creation.",
    };
  }

  const request: OrderCreationRequest = {
    source: "stripe-checkout-webhook",
    checkoutMode: confirmation.checkoutMode,
    checkoutSessionId: confirmation.checkoutSessionId,
    paymentIntentId: confirmation.paymentIntentId,
    paymentMethod: "stripe-checkout",
    paymentStatus: boundary.acceptedPaymentStatuses[0],
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
    acceptedOrderStatuses: ["paid"],
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
    status: boundary.acceptedOrderStatuses[0],
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

function createLaunchOrderNumber() {
  const timestamp = new Date().toISOString().replace(/\D/g, "").slice(0, 14);
  const suffix = Math.random().toString(36).slice(2, 8).toUpperCase();

  return `LH-${timestamp}-${suffix}`;
}
