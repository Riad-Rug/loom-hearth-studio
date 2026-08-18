import type { AuthenticatedUser } from "@/lib/auth";
import type {
  AccountDashboardData,
  AccountOrderHistoryData,
  AccountOrderHistoryItem,
  AccountOrderLineItemView,
  AccountOrderReservationPanel,
  AccountOrderTotalsView,
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
    reservationPanel:
      order.paymentStatus === "authorized" ? createReservationPanel(order.placedAt) : null,
    contactHref: createOrderContactHref(order.orderNumber),
  };
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

function createReservationPanel(placedAt: string): AccountOrderReservationPanel {
  const placedDate = new Date(placedAt);
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
