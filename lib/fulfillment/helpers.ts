import type { Order } from "@/types/domain";

import type {
  FulfillmentOrchestrationBoundary,
  FulfillmentOrchestrationRequest,
  FulfillmentOrchestrationResult,
  FulfillmentOrchestrationTrigger,
} from "@/lib/fulfillment/contracts";

export function createFulfillmentOrchestrationBoundary(): FulfillmentOrchestrationBoundary {
  return {
    service: "LaunchFulfillmentOrchestrator",
    status: "ready-placeholder",
    acceptedTriggers: ["persisted-paid-order", "admin-status-update"],
    acceptedOrderStatuses: [
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "refunded",
    ],
  };
}

export function createFulfillmentOrchestrationRequest(input: {
  trigger: FulfillmentOrchestrationTrigger;
  order: Pick<Order, "id" | "orderNumber" | "status" | "paymentStatus" | "shippingAddress"> | null;
}): FulfillmentOrchestrationResult {
  const boundary = createFulfillmentOrchestrationBoundary();
  const { order } = input;

  if (!order) {
    return {
      status: "ignored",
      request: null,
      message: "Persisted order is required before fulfillment orchestration can be prepared.",
    };
  }

  if (!boundary.acceptedTriggers.includes(input.trigger)) {
    return {
      status: "ignored",
      request: null,
      message: "Fulfillment orchestration trigger is not supported in this launch boundary.",
    };
  }

  if (!boundary.acceptedOrderStatuses.includes(order.status as FulfillmentOrchestrationBoundary["acceptedOrderStatuses"][number])) {
    return {
      status: "ignored",
      request: null,
      message: `Order status ${order.status} does not hand off into launch fulfillment orchestration.`,
    };
  }

  const request: FulfillmentOrchestrationRequest = {
    trigger: input.trigger,
    orderId: order.id,
    orderNumber: order.orderNumber,
    orderStatus: order.status,
    paymentStatus: order.paymentStatus,
    customerEmail: order.shippingAddress.email,
  };

  return {
    status: "ready",
    request,
    message: "Persisted order is ready to hand off into the launch fulfillment orchestration boundary.",
  };
}
