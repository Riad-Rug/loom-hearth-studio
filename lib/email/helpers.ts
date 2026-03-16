import type {
  OrderConfirmationEmailBoundary,
  OrderConfirmationEmailDeliveryResult,
  OrderConfirmationEmailPayload,
  OrderConfirmationEmailPreview,
  OrderConfirmationEmailRequest,
} from "@/lib/email/contracts";
import type {
  OrderCreationRequest,
  OrderSubmissionPayload,
  OrderSubmissionPreview,
} from "@/lib/order";
import type { Order } from "@/types/domain";

export function createOrderConfirmationEmailPayload(input: {
  submissionPayload: OrderSubmissionPayload | null;
  submissionPreview: OrderSubmissionPreview | null;
}): OrderConfirmationEmailPayload | null {
  const { submissionPayload, submissionPreview } = input;

  if (!submissionPayload || !submissionPreview) {
    return null;
  }

  return {
    to: submissionPayload.email,
    orderReference: submissionPreview.orderReference,
    customerName: submissionPayload.shippingAddress.fullName,
    shippingLabel: submissionPayload.shippingMethod.label,
    totalUsd: submissionPayload.totalUsd,
    currency: submissionPayload.currency,
    itemCount: submissionPayload.items.reduce(
      (runningTotal, item) => runningTotal + item.quantity,
      0,
    ),
  };
}

export function createOrderConfirmationEmailPreview(
  payload: OrderConfirmationEmailPayload | null,
): OrderConfirmationEmailPreview | null {
  if (!payload) {
    return null;
  }

  return {
    status: "placeholder",
    subject: `Order confirmation ${payload.orderReference}`,
    message: {
      to: payload.to,
      subject: `Order confirmation ${payload.orderReference}`,
      html: `<p>Placeholder order confirmation for ${payload.customerName}.</p>`,
      text: `Placeholder order confirmation for ${payload.customerName}.`,
    },
  };
}

export function createOrderConfirmationEmailBoundary(): OrderConfirmationEmailBoundary {
  return {
    source: "order-creation",
    deliveryProvider: "unconfigured",
    status: "ready-placeholder",
    acceptedPaymentStatuses: ["paid"],
  };
}

export function createOrderConfirmationEmailRequestFromCreatedOrder(input: {
  order: Pick<
    Order,
    "id" | "orderNumber" | "items" | "paymentStatus" | "shippingAddress" | "totalUsd" | "currency"
  >;
  orderCreationRequest: OrderCreationRequest | null;
}): OrderConfirmationEmailDeliveryResult {
  const boundary = createOrderConfirmationEmailBoundary();
  const { order, orderCreationRequest } = input;

  if (!orderCreationRequest) {
    return {
      status: "ignored",
      request: null,
      message:
        "Order creation request is required before a confirmation email handoff can be prepared.",
    };
  }

  if (order.paymentStatus !== "paid") {
    return {
      status: "ignored",
      request: null,
      message: "Only created paid orders can hand off into confirmation email delivery.",
    };
  }

  const request: OrderConfirmationEmailRequest = {
    source: "created-order",
    orderId: order.id,
    orderNumber: order.orderNumber,
    to: order.shippingAddress.email,
    customerName: order.shippingAddress.fullName,
    shippingLabel: null,
    totalUsd: order.totalUsd,
    currency: order.currency,
    itemCount: order.items.reduce((runningTotal, item) => runningTotal + item.quantity, 0),
    paymentStatus: boundary.acceptedPaymentStatuses[0],
    message: {
      to: order.shippingAddress.email,
      subject: `Order confirmation ${order.orderNumber}`,
      html: `<p>Placeholder order confirmation for ${order.shippingAddress.fullName}.</p>`,
      text: `Placeholder order confirmation for ${order.shippingAddress.fullName}.`,
    },
  };

  return {
    status: "ready",
    request,
    message: "Created order is ready to hand off into confirmation email delivery.",
  };
}
