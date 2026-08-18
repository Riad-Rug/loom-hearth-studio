import { db } from "@/lib/db/client";
import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import type { FulfillmentOrchestrationResult } from "@/lib/fulfillment/contracts";
import { orchestrateLaunchOrderFulfillment } from "@/lib/fulfillment/service";
import type { Order } from "@/types/domain";

export const adminOrderStatusOptions = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
  "refunded",
] as const satisfies ReadonlyArray<Order["status"]>;

export type AdminOrderStatusOption = (typeof adminOrderStatusOptions)[number];

// Terminal statuses represent the end of an order's normal lifecycle. Moving
// one of these back into an in-progress status via the plain status dropdown
// is unusual enough to warrant a confirmation step rather than a silent save.
export const terminalOrderStatuses = [
  "delivered",
  "cancelled",
  "refunded",
] as const satisfies ReadonlyArray<AdminOrderStatusOption>;

export function isTerminalOrderStatus(status: AdminOrderStatusOption): boolean {
  return (terminalOrderStatuses as readonly AdminOrderStatusOption[]).includes(status);
}

// Guard rail for the admin status dropdown: the common forward progression
// (pending -> paid/cancelled -> processing -> shipped -> delivered) should
// save without friction. Two situations get a confirmation step instead of a
// silent save, because they can't be casually reversed and carry real
// customer/financial weight:
//   1. Applying "cancelled" or "refunded" to any order.
//   2. Moving an order out of a terminal status (delivered/cancelled/refunded)
//      back into a non-terminal, in-progress status.
export function orderStatusTransitionNeedsConfirmation(
  currentStatus: AdminOrderStatusOption,
  nextStatus: AdminOrderStatusOption,
): boolean {
  if (currentStatus === nextStatus) {
    return false;
  }

  if (nextStatus === "cancelled" || nextStatus === "refunded") {
    return true;
  }

  if (isTerminalOrderStatus(currentStatus) && !isTerminalOrderStatus(nextStatus)) {
    return true;
  }

  return false;
}

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

export type AdminOrderFulfillmentHistoryEntry = {
  id: string;
  createdAtLabel: string;
  orderStatusLabel: string;
  triggerLabel: string;
  actionLabel: string;
  resultLabel: string;
  notes: string;
};

export type AdminOrderLineItemView = {
  id: string;
  productId: string;
  name: string;
  variantLabel: string | null;
  quantityLabel: string;
  unitPriceLabel: string;
};

export type AdminOrderShippingAddressView = {
  fullName: string;
  phone: string | null;
  // One line per row of a shipping label: street line(s), then city/state/postal, then country.
  addressLines: string[];
};

export type AdminOrderManagementItem = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerNotes: string | null;
  itemCountLabel: string;
  items: AdminOrderLineItemView[];
  shippingAddress: AdminOrderShippingAddressView;
  status: Order["status"];
  statusLabel: string;
  paymentStatus: Order["paymentStatus"];
  paymentLabel: string;
  totalUsd: number;
  totalPaidLabel: string;
  estimatedCostLabel: string;
  estimatedProfitLabel: string;
  estimatedMarginLabel: string;
  placedAtLabel: string;
  allowedStatuses: AdminOrderStatusOption[];
  costEntryNote: string;
  history: AdminOrderFulfillmentHistoryEntry[];

  // Photo/fulfillment tracking
  photosSentAt: string | null;
  photosSentAtLabel: string | null;

  // Shipment tracking
  trackingNumber: string | null;
  carrier: string | null;
  shippedAtLabel: string | null;

  // Cost tracking (margin calculation) — raw values for pre-filling the cost form
  productCostUsd: number | null;
  shippingCostUsd: number | null;
  packagingCostUsd: number | null;
  paymentFeeUsd: number | null;
  otherCostUsd: number | null;
  costsUpdatedAtLabel: string | null;
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

export type AdminOrderPhotosSentUpdateRequest = {
  orderId: string;
};

export type AdminOrderPhotosSentUpdateResult = {
  status: "updated" | "invalid-request";
  order: Order | null;
  message: string;
};

export type AdminOrderTrackingUpdateRequest = {
  orderId: string;
  trackingNumber: string;
  carrier: string;
};

export type AdminOrderTrackingUpdateResult = {
  status: "updated" | "invalid-request";
  order: Order | null;
  message: string;
};

export type AdminOrderCostsUpdateRequest = {
  orderId: string;
  productCostUsd?: number;
  shippingCostUsd?: number;
  packagingCostUsd?: number;
  paymentFeeUsd?: number;
  otherCostUsd?: number;
};

export type AdminOrderCostsUpdateResult = {
  status: "updated" | "invalid-request";
  order: Order | null;
  message: string;
};

export async function getAdminOrdersModuleData(): Promise<AdminOrdersModuleData> {
  const orders = await createOrderRepository().listAll();
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const paidRevenue = paidOrders.reduce((sum, order) => sum + order.totalUsd, 0);
  const averageOrderValue = paidOrders.length > 0 ? paidRevenue / paidOrders.length : 0;
  const historyByOrderId = await getFulfillmentHistoryByOrderId(orders.map((order) => order.id));

  const costedOrders = orders.filter((order) => computeOrderCostBreakdown(order).hasCostData);
  const totalEstimatedProfit = costedOrders.reduce(
    (sum, order) => sum + computeOrderCostBreakdown(order).profit,
    0,
  );

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
        value: formatUsd(totalEstimatedProfit),
        detail:
          orders.length > 0
            ? `${formatInteger(costedOrders.length)} of ${formatInteger(orders.length)} orders costed`
            : "No orders yet",
        tone: costedOrders.length > 0 ? "default" : "pending",
      },
      {
        label: "Average order value",
        value: formatUsd(averageOrderValue),
        detail: paidOrders.length > 0 ? "Paid orders only" : "No paid-order average yet",
      },
    ],
    costPanelTitle: "Cost tracking",
    costPanelDescription:
      "The main table shows revenue-side totals plus estimated cost and margin once costs are entered for an order.",
    mainTableFields: ["Total paid", "Estimated cost", "Estimated margin"],
    costCaptureFields: createCostCaptureFields(costedOrders.length, orders.length),
    costCapturePathNote:
      'Entry path: expand "Costs" on an order row, enter whichever of the five cost fields you have, and save — partial entries are fine.',
    tableStatusNote:
      orders.length > 0
        ? `${formatInteger(orders.length)} rows loaded`
        : "Zero-state table scaffold is live",
    items: orders.map((order) =>
      createAdminOrderManagementItem(order, historyByOrderId.get(order.id) ?? []),
    ),
  };
}

async function getFulfillmentHistoryByOrderId(
  orderIds: string[],
): Promise<Map<string, AdminOrderFulfillmentHistoryEntry[]>> {
  const historyByOrderId = new Map<string, AdminOrderFulfillmentHistoryEntry[]>();

  if (orderIds.length === 0) {
    return historyByOrderId;
  }

  const records = await db.fulfillmentExecutionRecord.findMany({
    where: {
      orderId: {
        in: orderIds,
      },
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  for (const record of records) {
    const entry: AdminOrderFulfillmentHistoryEntry = {
      id: record.id,
      createdAtLabel: formatHistoryTimestamp(record.createdAt),
      orderStatusLabel: formatOrderStatus(record.orderStatus as Order["status"]),
      triggerLabel: formatFulfillmentTrigger(record.trigger),
      actionLabel: record.actionLabel,
      resultLabel: record.resultLabel,
      notes: record.notes,
    };

    const existingEntries = historyByOrderId.get(record.orderId);

    if (existingEntries) {
      existingEntries.push(entry);
    } else {
      historyByOrderId.set(record.orderId, [entry]);
    }
  }

  return historyByOrderId;
}

export async function updateAdminOrderStatus(
  input: AdminOrderStatusUpdateRequest,
): Promise<AdminOrderStatusUpdateResult> {
  if (!input.orderId || !adminOrderStatusOptions.includes(input.status)) {
    return {
      status: "invalid-request",
      order: null,
      fulfillmentResult: null,
      message: "That status update request was invalid.",
    };
  }

  const repository = createOrderRepository();
  const order = await repository.getById(input.orderId);

  if (!order) {
    return {
      status: "invalid-request",
      order: null,
      fulfillmentResult: null,
      message: "Order not found.",
    };
  }

  if (order.status === input.status) {
    return {
      status: "ignored",
      order,
      fulfillmentResult: null,
      message: "This order already has this status.",
    };
  }

  const paymentStatusForStatus = resolvePaymentStatusForOrderStatus(input.status);
  const updatedOrder = paymentStatusForStatus
    ? await repository.updatePaymentTransition(input.orderId, {
        status: input.status,
        paymentStatus: paymentStatusForStatus,
      })
    : await repository.updateStatus(input.orderId, input.status);
  const fulfillmentResult = await orchestrateLaunchOrderFulfillment({
    trigger: "admin-status-update",
    order: updatedOrder,
  });

  return {
    status: "updated",
    order: updatedOrder,
    fulfillmentResult,
    message: "Status updated.",
  };
}

// Keeps the local `paymentStatus` field consistent with an admin-driven status change.
// Only "paid" and "refunded" have an unambiguous payment-status counterpart; other
// statuses (processing, shipped, delivered, cancelled) don't imply a payment change.
function resolvePaymentStatusForOrderStatus(
  status: AdminOrderStatusOption,
): Order["paymentStatus"] | null {
  if (status === "paid") {
    return "paid";
  }

  if (status === "refunded") {
    return "refunded";
  }

  return null;
}

export async function markAdminOrderPhotosSent(
  input: Partial<AdminOrderPhotosSentUpdateRequest>,
): Promise<AdminOrderPhotosSentUpdateResult> {
  if (typeof input.orderId !== "string" || !input.orderId) {
    return {
      status: "invalid-request",
      order: null,
      message: "That photos-sent request was invalid.",
    };
  }

  const repository = createOrderRepository();
  const order = await repository.getById(input.orderId);

  if (!order) {
    return {
      status: "invalid-request",
      order: null,
      message: "Order not found.",
    };
  }

  const updatedOrder = await repository.markPhotosSent(input.orderId);

  return {
    status: "updated",
    order: updatedOrder,
    message: "Photos marked as sent.",
  };
}

export async function updateAdminOrderTracking(
  input: Partial<AdminOrderTrackingUpdateRequest>,
): Promise<AdminOrderTrackingUpdateResult> {
  const trackingNumber = input.trackingNumber?.trim();
  const carrier = input.carrier?.trim();

  if (typeof input.orderId !== "string" || !input.orderId || !trackingNumber || !carrier) {
    return {
      status: "invalid-request",
      order: null,
      message: "A tracking number and carrier are both required.",
    };
  }

  const repository = createOrderRepository();
  const order = await repository.getById(input.orderId);

  if (!order) {
    return {
      status: "invalid-request",
      order: null,
      message: "Order not found.",
    };
  }

  const updatedOrder = await repository.updateTrackingInfo(input.orderId, {
    trackingNumber,
    carrier,
  });

  return {
    status: "updated",
    order: updatedOrder,
    message: "Tracking info saved.",
  };
}

const orderCostFieldKeys = [
  "productCostUsd",
  "shippingCostUsd",
  "packagingCostUsd",
  "paymentFeeUsd",
  "otherCostUsd",
] as const satisfies ReadonlyArray<keyof AdminOrderCostsUpdateRequest>;

export async function updateAdminOrderCosts(
  input: Partial<AdminOrderCostsUpdateRequest>,
): Promise<AdminOrderCostsUpdateResult> {
  if (typeof input.orderId !== "string" || !input.orderId) {
    return {
      status: "invalid-request",
      order: null,
      message: "That cost update request was invalid.",
    };
  }

  const providedCosts: Partial<Record<(typeof orderCostFieldKeys)[number], number>> = {};

  for (const key of orderCostFieldKeys) {
    const value = input[key];

    if (value === undefined) {
      continue;
    }

    if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
      return {
        status: "invalid-request",
        order: null,
        message: "Cost values must be valid non-negative numbers.",
      };
    }

    providedCosts[key] = value;
  }

  if (Object.keys(providedCosts).length === 0) {
    return {
      status: "invalid-request",
      order: null,
      message: "Enter at least one cost value to save.",
    };
  }

  const repository = createOrderRepository();
  const order = await repository.getById(input.orderId);

  if (!order) {
    return {
      status: "invalid-request",
      order: null,
      message: "Order not found.",
    };
  }

  const updatedOrder = await repository.updateOrderCosts(input.orderId, providedCosts);

  return {
    status: "updated",
    order: updatedOrder,
    message: "Costs saved.",
  };
}

// The five founder-entered cost inputs, summed to get total cost. Unset
// fields are treated as 0 so a partially-costed order still yields a usable
// (if conservative) estimate once at least one field has a value.
//
// Profit/margin are measured against `totalUsd` (the full amount the
// customer paid, including shipping and tax they were charged) rather than
// `subtotalUsd`. This module already treats `totalUsd` as "revenue"
// elsewhere (the page-level Revenue and Average order value metrics both sum
// `totalUsd`), so using the same base here keeps "Estimated margin %" and
// "Estimated profit" consistent with the rest of the dashboard rather than
// introducing a second, narrower notion of revenue.
function computeOrderCostBreakdown(order: Order): {
  hasCostData: boolean;
  totalCost: number;
  profit: number;
  marginPct: number;
} {
  const costFields = [
    order.productCostUsd,
    order.shippingCostUsd,
    order.packagingCostUsd,
    order.paymentFeeUsd,
    order.otherCostUsd,
  ];
  const hasCostData = costFields.some((value) => value !== undefined);
  const totalCost = costFields.reduce((sum: number, value) => sum + (value ?? 0), 0);
  const profit = order.totalUsd - totalCost;
  const marginPct = order.totalUsd > 0 ? (profit / order.totalUsd) * 100 : 0;

  return { hasCostData, totalCost, profit, marginPct };
}

// Plain-text line items for an internal fulfillment tool — no product links or
// thumbnails needed here, unlike the customer-facing account dashboard's
// createOrderLineItems (lib/account/dashboard.ts), which is styled for shoppers.
function createAdminOrderLineItems(order: Order): AdminOrderLineItemView[] {
  return order.items.map((item) => ({
    id: item.id,
    productId: item.productId,
    name: item.name,
    variantLabel: item.variant?.name ?? null,
    quantityLabel: `Qty ${formatInteger(item.quantity)}`,
    unitPriceLabel: formatUsd(item.priceUsd),
  }));
}

function createAdminOrderShippingAddress(address: Order["shippingAddress"]): AdminOrderShippingAddressView {
  return {
    fullName: address.fullName,
    phone: address.phone?.trim() || null,
    addressLines: [
      address.address2 ? `${address.address1}, ${address.address2}` : address.address1,
      `${address.city}, ${address.state} ${address.postalCode}`,
      address.country,
    ],
  };
}

function createAdminOrderManagementItem(
  order: Order,
  history: AdminOrderFulfillmentHistoryEntry[],
): AdminOrderManagementItem {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const costBreakdown = computeOrderCostBreakdown(order);

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: order.shippingAddress.fullName,
    customerEmail: order.shippingAddress.email,
    customerNotes: order.customerNotes?.trim() || null,
    itemCountLabel: `${formatInteger(itemCount)} item${itemCount === 1 ? "" : "s"}`,
    items: createAdminOrderLineItems(order),
    shippingAddress: createAdminOrderShippingAddress(order.shippingAddress),
    status: order.status,
    statusLabel: formatOrderStatus(order.status),
    paymentStatus: order.paymentStatus,
    paymentLabel: formatPaymentStatus(order.paymentStatus),
    totalUsd: order.totalUsd,
    totalPaidLabel: formatTotalPaidLabel(order),
    estimatedCostLabel: costBreakdown.hasCostData
      ? formatUsd(costBreakdown.totalCost)
      : "No costs entered yet",
    estimatedProfitLabel: costBreakdown.hasCostData ? formatUsd(costBreakdown.profit) : "Pending",
    estimatedMarginLabel: costBreakdown.hasCostData
      ? formatPercent(costBreakdown.marginPct)
      : "Pending",
    placedAtLabel: formatPlacedAt(order.placedAt),
    allowedStatuses: [...adminOrderStatusOptions],
    costEntryNote: costBreakdown.hasCostData
      ? order.costsUpdatedAt
        ? `Costs updated ${formatHistoryTimestamp(new Date(order.costsUpdatedAt))}`
        : "Costs entered"
      : "No costs entered yet.",
    history,

    photosSentAt: order.photosSentAt ?? null,
    photosSentAtLabel: order.photosSentAt
      ? formatHistoryTimestamp(new Date(order.photosSentAt))
      : null,

    trackingNumber: order.trackingNumber ?? null,
    carrier: order.carrier ?? null,
    shippedAtLabel: order.shippedAt ? formatHistoryTimestamp(new Date(order.shippedAt)) : null,

    productCostUsd: order.productCostUsd ?? null,
    shippingCostUsd: order.shippingCostUsd ?? null,
    packagingCostUsd: order.packagingCostUsd ?? null,
    paymentFeeUsd: order.paymentFeeUsd ?? null,
    otherCostUsd: order.otherCostUsd ?? null,
    costsUpdatedAtLabel: order.costsUpdatedAt
      ? formatHistoryTimestamp(new Date(order.costsUpdatedAt))
      : null,
  };
}

function createCostCaptureFields(
  costedOrderCount: number,
  totalOrderCount: number,
): AdminOrderCostField[] {
  const captureStatusLabel =
    costedOrderCount > 0 ? `Entered on ${formatInteger(costedOrderCount)}` : "Available";
  const captureNote = `Entered per-order via the "Costs" action on each row (${formatInteger(costedOrderCount)} of ${formatInteger(totalOrderCount)} orders so far).`;

  return [
    createLiveCostField("product-cost", "Product cost", captureStatusLabel, captureNote),
    createLiveCostField("shipping-cost", "Shipping cost", captureStatusLabel, captureNote),
    createLiveCostField("packaging-cost", "Packaging / handling", captureStatusLabel, captureNote),
    createLiveCostField("payment-fee", "Payment fee", captureStatusLabel, captureNote),
    createLiveCostField("other-manual-cost", "Other manual cost", captureStatusLabel, captureNote),
    {
      key: "total-estimated-cost",
      label: "Total estimated cost",
      statusLabel: "Live",
      note: "Sum of the five cost inputs above, once at least one is entered for an order.",
    },
    {
      key: "estimated-net-profit",
      label: "Estimated net profit",
      statusLabel: "Live",
      note: "Total paid minus total estimated cost.",
    },
    {
      key: "estimated-margin",
      label: "Estimated margin %",
      statusLabel: "Live",
      note: "Estimated net profit divided by total paid.",
    },
  ];
}

function createLiveCostField(
  key: AdminOrderCostFieldKey,
  label: string,
  statusLabel: string,
  note: string,
): AdminOrderCostField {
  return {
    key,
    label,
    statusLabel,
    note,
  };
}

function formatPercent(value: number) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  }).format(value)}%`;
}

function formatPlacedAt(placedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(placedAt));
}

function formatHistoryTimestamp(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(value);
}

function formatFulfillmentTrigger(trigger: string) {
  if (trigger === "persisted-paid-order") {
    return "Payment confirmed";
  }

  if (trigger === "admin-status-update") {
    return "Admin status update";
  }

  return trigger;
}

function formatTotalPaidLabel(order: Order) {
  switch (order.paymentStatus) {
    case "paid":
      return formatUsd(order.totalUsd);
    case "authorized":
      return `Authorized — ${formatUsd(order.totalUsd)}`;
    case "refunded":
      return `Refunded — ${formatUsd(order.totalUsd)}`;
    case "failed":
      return "Payment failed";
    case "pending":
    default:
      return "Awaiting capture";
  }
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