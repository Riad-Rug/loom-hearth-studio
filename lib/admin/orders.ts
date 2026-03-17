import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import type { FulfillmentOrchestrationResult } from "@/lib/fulfillment/contracts";
import { orchestrateLaunchOrderFulfillment } from "@/lib/fulfillment/service";
import type { Order } from "@/types/domain";

export const adminOrderStatusOptions = [
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const satisfies ReadonlyArray<Order["status"]>;

export type AdminOrderStatusOption = (typeof adminOrderStatusOptions)[number];

export type AdminOrdersModuleCardData = {
  title: string;
  body: string;
  lines?: string[];
};

export type AdminOrderManagementItem = {
  id: string;
  orderNumber: string;
  customerEmail: string;
  status: Order["status"];
  statusLabel: string;
  totalLabel: string;
  placedAtLabel: string;
  allowedStatuses: AdminOrderStatusOption[];
};

export type AdminOrdersModuleData = {
  description: string;
  cards: AdminOrdersModuleCardData[];
  items: AdminOrderManagementItem[];
};

export type AdminOrderStatusUpdateRequest = {
  orderId: string;
  status: AdminOrderStatusOption;
};

export type AdminOrderStatusUpdateResult = {
  status: "updated" | "ignored" | "invalid-request";
  order: Order | null;
  fulfillmentResult: FulfillmentOrchestrationResult | null;
  message: string;
};

export async function getAdminOrdersModuleData(): Promise<AdminOrdersModuleData> {
  const orders = await createOrderRepository().listAll();

  return {
    description:
      "Persisted launch orders now load into the admin orders surface, and launch-safe status updates are available. Fulfillment actions and broader automations remain out of scope.",
    cards: [
      {
        title: "Order list",
        body:
          orders.length > 0
            ? "Persisted launch orders are loaded from Prisma/PostgreSQL."
            : "No persisted launch orders are available yet.",
        lines: createAdminOrderSummaryLines(orders),
      },
      {
        title: "Recent persisted orders",
        body:
          orders.length > 0
            ? "Latest persisted orders are shown below for launch visibility."
            : "Recent order entries will appear here after paid Checkout webhooks persist orders.",
        lines: createRecentAdminOrderLines(orders),
      },
    ],
    items: orders.map(createAdminOrderManagementItem),
  };
}

export async function updateAdminOrderStatus(
  input: AdminOrderStatusUpdateRequest,
): Promise<AdminOrderStatusUpdateResult> {
  if (!input.orderId || !adminOrderStatusOptions.includes(input.status)) {
    return {
      status: "invalid-request",
      order: null,
      fulfillmentResult: null,
      message: "Admin order status update request is invalid.",
    };
  }

  const repository = createOrderRepository();
  const order = await repository.getById(input.orderId);

  if (!order) {
    return {
      status: "invalid-request",
      order: null,
      fulfillmentResult: null,
      message: "Persisted order was not found for admin status update.",
    };
  }

  if (order.status === input.status) {
    return {
      status: "ignored",
      order,
      fulfillmentResult: null,
      message: "Persisted order already has the requested admin status.",
    };
  }

  const updatedOrder = await repository.updateStatus(input.orderId, input.status);
  const fulfillmentResult = await orchestrateLaunchOrderFulfillment({
    trigger: "admin-status-update",
    order: updatedOrder,
  });

  return {
    status: "updated",
    order: updatedOrder,
    fulfillmentResult,
    message:
      fulfillmentResult.status === "ready"
        ? "Persisted order status updated through the admin orders boundary and handed off into fulfillment orchestration."
        : "Persisted order status updated through the admin orders boundary.",
  };
}

function createAdminOrderManagementItem(order: Order): AdminOrderManagementItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerEmail: order.shippingAddress.email,
    status: order.status,
    statusLabel: formatOrderStatus(order.status),
    totalLabel: formatUsd(order.totalUsd),
    placedAtLabel: formatPlacedAt(order.placedAt),
    allowedStatuses: [...adminOrderStatusOptions],
  };
}

function createAdminOrderSummaryLines(orders: Order[]) {
  if (!orders.length) {
    return ["0 persisted orders", "No latest order yet"];
  }

  return [
    `${orders.length} persisted order${orders.length === 1 ? "" : "s"}`,
    `Latest order: ${orders[0].orderNumber}`,
    `Latest customer: ${orders[0].shippingAddress.email}`,
  ];
}

function createRecentAdminOrderLines(orders: Order[]) {
  if (!orders.length) {
    return ["No paid Checkout orders have been persisted yet."];
  }

  return orders.slice(0, 5).map((order) => createRecentAdminOrderLine(order));
}

function createRecentAdminOrderLine(order: Order) {
  return [
    order.orderNumber,
    formatOrderStatus(order.status),
    order.shippingAddress.email,
    formatUsd(order.totalUsd),
    formatPlacedAt(order.placedAt),
  ].join(" | ");
}

function formatPlacedAt(placedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(placedAt));
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatOrderStatus(status: Order["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
