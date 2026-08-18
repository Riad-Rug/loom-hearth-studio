import type { AuthenticatedUser } from "@/lib/auth";
import type {
  AccountDashboardData,
  AccountOrderHistoryData,
  AccountOrderHistoryItem,
  AccountOrderLineItemView,
  AccountOrderReservationPanel,
  AccountOrderStageStep,
  AccountOrderStageTimeline,
  AccountOrderTotalsView,
  AccountOrderTrackingView,
} from "@/lib/account/dashboard-shared";
import { getProductRoutePath } from "@/lib/catalog/helpers";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import { createProductRepository } from "@/lib/db/repositories/product-repository";
import type { Order } from "@/types/domain";
import type { OrderStatus, PaymentStatus } from "@/types/domain/order";
import type { MediaAsset } from "@/types/domain/common";
import type { Product } from "@/types/domain/product";

export async function getAccountDashboardData(
  user: AuthenticatedUser | null,
): Promise<AccountDashboardData | null> {
  if (!user) {
    return null;
  }

  const orders = await createOrderRepository().getByCustomerEmail(user.email);
  const productMap = await loadProductMapForOrders(orders);
  const orderHistory = createAccountOrderHistoryData(orders, productMap);
  const mostRecentOrder = orderHistory.items[0] ?? null;

  return {
    overview: {
      greeting: "Welcome back",
      statusLabel: orders.length
        ? "Your orders are saved to this account."
        : "Your orders will appear here once you have placed one.",
      accountEmail: user.email,
      recentOrder: mostRecentOrder
        ? {
            orderNumber: mostRecentOrder.orderNumber,
            statusLabel: mostRecentOrder.statusLabel,
            contactHref: mostRecentOrder.contactHref,
          }
        : null,
    },
    orders: orderHistory,
    profile: {
      fullName: orders[0]?.shippingAddress.fullName ?? "Name not provided",
      email: user.email,
      phone: orders[0]?.shippingAddress.phone ?? null,
    },
  };
}

async function loadProductMapForOrders(orders: Order[]): Promise<Map<string, Product>> {
  const referencedProductIds = new Set(
    orders.flatMap((order) => order.items.map((item) => item.productId)),
  );

  if (!referencedProductIds.size) {
    return new Map();
  }

  const products = await createProductRepository().listAll();

  return new Map(
    products.filter((product) => referencedProductIds.has(product.id)).map((product) => [product.id, product]),
  );
}

function createAccountOrderHistoryData(
  orders: Order[],
  productMap: Map<string, Product>,
): AccountOrderHistoryData {
  const items = orders.map((order) => createAccountOrderHistoryItem(order, productMap));

  if (!items.length) {
    return {
      statusLabel: "Your orders will appear here once you have placed one.",
      orderCountLabel: "0 orders",
      latestOrderLabel: "No orders yet",
      items,
    };
  }

  return {
    statusLabel: "Order history loaded",
    orderCountLabel: `${items.length} order${items.length === 1 ? "" : "s"}`,
    latestOrderLabel: items[0].orderNumber,
    items,
  };
}

function createAccountOrderHistoryItem(
  order: Order,
  productMap: Map<string, Product>,
): AccountOrderHistoryItem {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    statusLabel: formatOrderStatusLabel(order.status, order.paymentStatus),
    placedAtLabel: `Placed ${formatOrderPlacedAtLabel(order.placedAt)}`,
    totalLabel: formatOrderTotal(order.totalUsd),
    items: createOrderLineItems(order, productMap),
    totals: createOrderTotals(order),
    // Only render the reservation/pre-auth panel while the order is genuinely still
    // reserved. Keying on paymentStatus alone is wrong: an admin cancellation only
    // flips `status` to "cancelled" and leaves `paymentStatus` at "authorized" (see
    // resolvePaymentStatusForOrderStatus in lib/admin/orders.ts), which would otherwise
    // show "Cancelled" and the pre-auth/approval-window copy at the same time.
    reservationPanel:
      order.status === "pending" && order.paymentStatus === "authorized"
        ? createReservationPanel(order.placedAt, order.photosSentAt)
        : null,
    stageTimeline: createStageTimeline(order.status, order.photosSentAt),
    tracking: createOrderTrackingView(order),
    customerNote: order.customerNotes?.trim() || null,
    contactHref: createOrderContactHref(order.orderNumber),
  };
}

const stageTimelineSteps: ReadonlyArray<{ id: AccountOrderStageStep["id"]; label: string }> = [
  { id: "reserved", label: "Reserved" },
  // "Photographed" only becomes reachable once `photosSentAt` is set — before that, the
  // order sits on "Reserved" (still being photographed). This is the sub-state that used
  // to be collapsed into "Reserved" before `photosSentAt` existed as a field.
  { id: "photographed", label: "Photographed" },
  { id: "approved", label: "Approved" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
];

function createStageTimeline(
  status: OrderStatus,
  photosSentAt: string | undefined,
): AccountOrderStageTimeline {
  if (status === "cancelled" || status === "refunded") {
    return {
      kind: "cancelled",
      label: status === "refunded" ? "Refunded" : "Cancelled",
    };
  }

  const currentStepIndex = resolveStageStepIndex(status, photosSentAt);

  return {
    kind: "steps",
    steps: stageTimelineSteps.map((step, index) => ({
      id: step.id,
      label: step.label,
      status:
        index < currentStepIndex ? "complete" : index === currentStepIndex ? "current" : "upcoming",
    })),
  };
}

function resolveStageStepIndex(status: OrderStatus, photosSentAt: string | undefined): number {
  if (status === "delivered") {
    return 4;
  }

  if (status === "shipped") {
    return 3;
  }

  // "processing" implies payment already completed, so it belongs with "paid" on the
  // Approved step.
  if (status === "paid" || status === "processing") {
    return 2;
  }

  // Still pending/authorized: distinguish "being photographed" from "photos sent,
  // awaiting your approval" using `photosSentAt`.
  if (photosSentAt) {
    return 1;
  }

  return 0;
}

function createOrderLineItems(order: Order, productMap: Map<string, Product>): AccountOrderLineItemView[] {
  return order.items.map((item) => {
    const product = productMap.get(item.productId);
    const primaryImage = product ? getPrimaryImageAsset(product) : undefined;

    return {
      id: item.id,
      name: item.name,
      href: product ? getProductRoutePath(product) : undefined,
      variantLabel: item.variant?.name,
      quantityLabel: `Qty ${item.quantity}`,
      priceLabel: formatOrderTotal(item.priceUsd),
      imageSrc: primaryImage
        ? buildCloudinaryUrl(primaryImage.publicId, {
            transformation: { c: "fill", g: "auto", w: 160, h: 160, q: "auto", f: "auto" },
          })
        : undefined,
      imageAlt: primaryImage?.altText || item.name,
    };
  });
}

function getPrimaryImageAsset(product: Product): MediaAsset | undefined {
  const heroImage = product.images.find((image) => image.role === "hero");

  return heroImage ?? product.images[0];
}

function createOrderTotals(order: Order): AccountOrderTotalsView {
  return {
    subtotalLabel: formatOrderTotal(order.subtotalUsd),
    shippingLabel: order.shippingUsd > 0 ? formatOrderTotal(order.shippingUsd) : "Free",
    taxLabel: formatOrderTotal(order.taxUsd),
    discountLabel: order.discountUsd > 0 ? `-${formatOrderTotal(order.discountUsd)}` : undefined,
    totalLabel: formatOrderTotal(order.totalUsd),
  };
}

const oneDayMs = 24 * 60 * 60 * 1000;
const approvalWindowDays = 5;

function createReservationPanel(
  placedAt: string,
  photosSentAt: string | undefined,
): AccountOrderReservationPanel {
  const placedDate = new Date(placedAt);

  if (photosSentAt) {
    const photosSentDate = new Date(photosSentAt);
    const approveByDate = new Date(photosSentDate.getTime() + approvalWindowDays * oneDayMs);

    return {
      title: "What happens next",
      lines: [
        "Your card is only pre-authorized — a temporary hold, like a hotel deposit. Nothing has been charged.",
        `Photos sent ${formatOrderDateTimeLabel(photosSentDate)} — you have until ${formatOrderDateTimeLabel(approveByDate)} to approve. You will not be charged before then.`,
        "Only once you approve is your card charged and the piece shipped — say no, or don't respond, and the hold releases automatically with nothing charged.",
      ],
    };
  }

  const photosExpectedByDate = new Date(placedDate.getTime() + oneDayMs);
  const approvalWindowClosesByDate = new Date(
    photosExpectedByDate.getTime() + approvalWindowDays * oneDayMs,
  );

  return {
    title: "What happens next",
    lines: [
      "Your card is only pre-authorized — a temporary hold, like a hotel deposit. Nothing has been charged.",
      `We personally photograph this exact piece and email you the photos. Expected by ${formatOrderDateTimeLabel(photosExpectedByDate)}.`,
      `You'll then have 5 days to approve. Only once you approve is your card charged and the piece shipped — say no, or don't respond, and the hold releases automatically with nothing charged (by around ${formatOrderDateTimeLabel(approvalWindowClosesByDate)}).`,
    ],
  };
}

const carrierTrackingUrlBuilders: ReadonlyArray<{
  matches: (normalizedCarrier: string) => boolean;
  buildHref: (trackingNumber: string) => string;
}> = [
  {
    matches: (carrier) => carrier === "usps",
    buildHref: (trackingNumber) =>
      `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(trackingNumber)}`,
  },
  {
    matches: (carrier) => carrier === "ups",
    buildHref: (trackingNumber) =>
      `https://www.ups.com/track?tracknum=${encodeURIComponent(trackingNumber)}`,
  },
  {
    matches: (carrier) => carrier === "fedex",
    buildHref: (trackingNumber) =>
      `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(trackingNumber)}`,
  },
  {
    matches: (carrier) => carrier === "dhl",
    buildHref: (trackingNumber) =>
      `https://www.dhl.com/us-en/home/tracking/tracking-express.html?submit=1&tracking-id=${encodeURIComponent(trackingNumber)}`,
  },
];

function resolveCarrierTrackingHref(carrier: string, trackingNumber: string): string | undefined {
  const normalizedCarrier = carrier.trim().toLowerCase();
  const builder = carrierTrackingUrlBuilders.find(({ matches }) => matches(normalizedCarrier));

  return builder?.buildHref(trackingNumber);
}

function createOrderTrackingView(order: Order): AccountOrderTrackingView | null {
  const isShippedOrDelivered = order.status === "shipped" || order.status === "delivered";

  if (!isShippedOrDelivered || !order.trackingNumber || !order.carrier) {
    return null;
  }

  const shippedAtLabel = order.shippedAt
    ? ` on ${formatOrderPlacedAtLabel(order.shippedAt)}`
    : "";

  return {
    summaryLabel: `Shipped via ${order.carrier}${shippedAtLabel} — tracking: ${order.trackingNumber}`,
    trackingNumber: order.trackingNumber,
    trackingHref: resolveCarrierTrackingHref(order.carrier, order.trackingNumber),
  };
}

function createOrderContactHref(orderNumber: string) {
  const message = `Regarding order ${orderNumber}: `;

  return `/contact?inquiryType=order-question&message=${encodeURIComponent(message)}`;
}

function formatOrderPlacedAtLabel(placedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(placedAt));
}

function formatOrderDateTimeLabel(date: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatOrderTotal(totalUsd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalUsd);
}

function formatOrderStatusLabel(status: OrderStatus, paymentStatus: PaymentStatus) {
  if (status === "pending" && paymentStatus === "authorized") {
    return "Reserved — card on hold, you have not been charged";
  }

  if (status === "paid" && paymentStatus === "paid") {
    return "Approved — payment complete, preparing to ship";
  }

  if (status === "shipped") {
    return "Shipped";
  }

  if (status === "delivered") {
    return "Delivered";
  }

  if (status === "cancelled" && paymentStatus === "failed") {
    return "Cancelled — hold released, you were not charged";
  }

  if (status === "refunded" || paymentStatus === "refunded") {
    return "Refunded";
  }

  if (status === "processing") {
    return "Processing — preparing your order";
  }

  if (status === "cancelled") {
    return "Cancelled";
  }

  return status.charAt(0).toUpperCase() + status.slice(1);
}
