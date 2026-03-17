import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import type { Order } from "@/types/domain";

export type AdminOrdersModuleCardData = {
  title: string;
  body: string;
  lines?: string[];
};

export type AdminOrdersModuleData = {
  description: string;
  cards: AdminOrdersModuleCardData[];
};

export async function getAdminOrdersModuleData(): Promise<AdminOrdersModuleData> {
  const orders = await createOrderRepository().listAll();

  return {
    description:
      "Persisted launch orders now load into the admin orders surface. Order mutations and fulfillment actions remain out of scope.",
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
