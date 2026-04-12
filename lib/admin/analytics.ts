import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import { GA_MEASUREMENT_ID } from "@/lib/analytics/gtag";
import type { Order } from "@/types/domain";

export type AdminAnalyticsMetric = {
  label: string;
  value: string;
  detail: string;
};

export type AdminAnalyticsTopProduct = {
  productId: string;
  name: string;
  unitsSold: string;
  revenue: string;
};

export type AdminAnalyticsRecentOrder = {
  orderNumber: string;
  customerEmail: string;
  total: string;
  placedAt: string;
  status: string;
};

export type AdminAnalyticsPageData = {
  summaryMetrics: AdminAnalyticsMetric[];
  topProducts: AdminAnalyticsTopProduct[];
  recentOrders: AdminAnalyticsRecentOrder[];
  setupPills: string[];
  setupNotes: string[];
};

type ProductAggregate = {
  productId: string;
  name: string;
  units: number;
  revenue: number;
};

export async function getAdminAnalyticsPageData(): Promise<AdminAnalyticsPageData> {
  const orders = await createOrderRepository().listAll();
  const paidOrders = orders.filter((order) => order.paymentStatus === "paid");
  const customers = createCustomerSet(orders);
  const revenue30d = paidOrders
    .filter((order) => isWithinDays(order.placedAt, 30))
    .reduce((sum, order) => sum + order.totalUsd, 0);
  const orders30d = paidOrders.filter((order) => isWithinDays(order.placedAt, 30));
  const aov30d = orders30d.length ? revenue30d / orders30d.length : 0;
  const topProducts = aggregateProducts(paidOrders);

  return {
    summaryMetrics: [
      {
        label: "Paid revenue (30d)",
        value: formatUsd(revenue30d),
        detail: orders30d.length ? `${orders30d.length} paid orders in the last 30 days` : "No paid orders in the last 30 days",
      },
      {
        label: "Orders (30d)",
        value: formatInteger(orders30d.length),
        detail: paidOrders.length ? `${paidOrders.length} paid orders total` : "Waiting on the first paid order",
      },
      {
        label: "Average order value",
        value: formatUsd(aov30d),
        detail: orders30d.length ? "Based on paid 30-day orders" : "No recent orders yet",
      },
      {
        label: "Customers",
        value: formatInteger(customers.size),
        detail: customers.size ? "Derived from persisted order emails" : "No customer records yet",
      },
    ],
    topProducts: topProducts.slice(0, 5).map((product) => ({
      productId: product.productId,
      name: product.name,
      unitsSold: formatInteger(product.units),
      revenue: formatUsd(product.revenue),
    })),
    recentOrders: orders.slice(0, 6).map((order) => ({
      orderNumber: order.orderNumber,
      customerEmail: order.shippingAddress.email,
      total: formatUsd(order.totalUsd),
      placedAt: formatDate(order.placedAt),
      status: `${capitalize(order.status)} / ${capitalize(order.paymentStatus)}`,
    })),
    setupPills: [
      GA_MEASUREMENT_ID ? `GA4 configured: ${GA_MEASUREMENT_ID}` : "GA4 measurement ID missing",
      "Search Console setup remains external to admin",
      "Consent-aware analytics loading is active",
    ],
    setupNotes: [
      "This dashboard uses persisted order and customer data for commerce reporting.",
      "GA4 collection is loaded only after analytics consent is accepted.",
      "Traffic, landing-page, and source reporting can be added later through the GA4 Data API and Search Console API.",
    ],
  };
}

function createCustomerSet(orders: Order[]) {
  return new Set(orders.map((order) => order.shippingAddress.email));
}

function aggregateProducts(orders: Order[]): ProductAggregate[] {
  const products = new Map<string, ProductAggregate>();

  for (const order of orders) {
    for (const item of order.items) {
      const existing = products.get(item.productId);
      if (existing) {
        existing.units += item.quantity;
        existing.revenue += item.priceUsd * item.quantity;
        continue;
      }

      products.set(item.productId, {
        productId: item.productId,
        name: item.name,
        units: item.quantity,
        revenue: item.priceUsd * item.quantity,
      });
    }
  }

  return Array.from(products.values()).sort((left, right) => right.revenue - left.revenue);
}

function isWithinDays(value: string, days: number) {
  const timestamp = new Date(value).getTime();
  const now = Date.now();
  const windowMs = days * 24 * 60 * 60 * 1000;
  return now - timestamp <= windowMs;
}

function formatUsd(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
