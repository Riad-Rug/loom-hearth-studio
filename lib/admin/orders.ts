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

export type AdminOrdersSummaryMetric = {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "pending";
};

export type AdminOrderCostFieldKey =
  | "product-cost"
  | "shipping-cost"
  | "packaging-cost"
  | "payment-fee"
  | "other-manual-cost"
  | "total-estimated-cost"
  | "estimated-net-profit"
  | "estimated-margin";

export type AdminOrderCostField = {
  key: AdminOrderCostFieldKey;
  label: string;
  statusLabel: string;
  note: string;
};

export type AdminOrderManagementItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  itemCountLabel: string;
  status: Order["status"];
  statusLabel: string;
  paymentStatus: Order["paymentStatus"];
  paymentLabel: string;
  totalPaidLabel: string;
  estimatedCostLabel: string;
  estimatedProfitLabel: string;
  estimatedMarginLabel: string;
  placedAtLabel: string;
  allowedStatuses: AdminOrderStatusOption[];
  financialSummary: string;
  costFields: AdminOrderCostField[];
};

export type AdminOrdersModuleData = {
  description: string;
  summaryMetrics: AdminOrdersSummaryMetric[];
  costPanelTitle: string;
  costPanelDescription: string;
  mainTableFields: string[];
  costCaptureFields: AdminOrderCostField[];
  costCapturePathNote: string;
  tableStatusNote: string;
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
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const paidRevenue = paidOrders.reduce((sum, order) => sum + order.totalUsd, 0);
  const averageOrderValue = paidOrders.length > 0 ? paidRevenue / paidOrders.length : 0;

  return {
    description: "Track order status, payment state, revenue, and margin readiness from one page.",
    summaryMetrics: [
      {
        label: "Total orders",
        value: formatInteger(orders.length),
        detail: orders.length > 0 ? "Persisted orders" : "No orders yet",
      },
      {
        label: "Paid orders",
        value: formatInteger(paidOrders.length),
        detail: paidOrders.length > 0 ? "Orders marked paid" : "No paid orders yet",
      },
      {
        label: "Revenue",
        value: formatUsd(paidRevenue),
        detail: paidOrders.length > 0 ? "From persisted paid totals" : "Waiting on paid orders",
      },
      {
        label: "Estimated profit",
        value: paidOrders.length > 0 ? "Awaiting costs" : formatUsd(0),
        detail: "Blocked until per-order costs are stored",
        tone: "pending",
      },
      {
        label: "Average order value",
        value: formatUsd(averageOrderValue),
        detail: paidOrders.length > 0 ? "Paid orders only" : "No paid-order average yet",
      },
    ],
    costPanelTitle: "Cost tracking setup",
    costPanelDescription:
      "The main table can already show revenue-side totals. Profit and margin need per-order cost inputs before they become actionable.",
    mainTableFields: ["Total paid", "Estimated cost", "Estimated margin"],
    costCaptureFields: createCostCaptureFields(),
    costCapturePathNote:
      "Planned entry path: open a future order detail panel from each row action, then store product, shipping, packaging, fee, and manual costs there.",
    tableStatusNote:
      orders.length > 0
        ? `${formatInteger(orders.length)} rows loaded`
        : "Zero-state table scaffold is live",
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
      fulfillmentResult.status === "recorded" || fulfillmentResult.status === "already-recorded"
        ? "Persisted order status updated through the admin orders boundary and recorded a manual fulfillment action."
        : "Persisted order status updated through the admin orders boundary.",
  };
}

function createAdminOrderManagementItem(order: Order): AdminOrderManagementItem {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.shippingAddress.fullName,
    customerEmail: order.shippingAddress.email,
    itemCountLabel: `${formatInteger(itemCount)} item${itemCount === 1 ? "" : "s"}`,
    status: order.status,
    statusLabel: formatOrderStatus(order.status),
    paymentStatus: order.paymentStatus,
    paymentLabel: formatPaymentStatus(order.paymentStatus),
    totalPaidLabel: formatUsd(order.totalUsd),
    estimatedCostLabel: "Awaiting costs",
    estimatedProfitLabel: "Pending",
    estimatedMarginLabel: "Pending",
    placedAtLabel: formatPlacedAt(order.placedAt),
    allowedStatuses: [...adminOrderStatusOptions],
    financialSummary: "Use a future order detail panel to enter cost inputs for this row.",
    costFields: createCostCaptureFields(),
  };
}

function createCostCaptureFields(): AdminOrderCostField[] {
  return [
    createPendingCostField("product-cost", "Product cost"),
    createPendingCostField("shipping-cost", "Shipping cost"),
    createPendingCostField("packaging-cost", "Packaging / handling"),
    createPendingCostField("payment-fee", "Payment fee"),
    createPendingCostField("other-manual-cost", "Other manual cost"),
    {
      key: "total-estimated-cost",
      label: "Total estimated cost",
      statusLabel: "Derived later",
      note: "Calculated after the cost inputs above are stored.",
    },
    {
      key: "estimated-net-profit",
      label: "Estimated net profit",
      statusLabel: "Derived later",
      note: "Calculated from total paid minus total estimated cost.",
    },
    {
      key: "estimated-margin",
      label: "Estimated margin %",
      statusLabel: "Derived later",
      note: "Calculated from estimated net profit divided by total paid.",
    },
  ];
}

function createPendingCostField(
  key: AdminOrderCostFieldKey,
  label: string,
): AdminOrderCostField {
  return {
    key,
    label,
    statusLabel: "Not stored",
    note: "Not available in the current order schema.",
  };
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

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 0,
  }).format(value);
}

function formatOrderStatus(status: Order["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatPaymentStatus(status: Order["paymentStatus"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}