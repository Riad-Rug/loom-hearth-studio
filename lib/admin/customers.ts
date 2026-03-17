import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import type { Order } from "@/types/domain";

export type AdminCustomersModuleCardData = {
  title: string;
  body: string;
  lines?: string[];
};

export type AdminCustomersModuleData = {
  description: string;
  cards: AdminCustomersModuleCardData[];
};

type PersistedCustomerSummary = {
  email: string;
  fullName: string;
  phone: string | null;
  orderCount: number;
  totalSpentUsd: number;
  latestOrderNumber: string;
  latestOrderPlacedAt: string;
};

export async function getAdminCustomersModuleData(): Promise<AdminCustomersModuleData> {
  const orders = await createOrderRepository().listAll();
  const customers = createPersistedCustomerSummaries(orders);

  return {
    description:
      "Persisted customer-related launch data now loads from order history. Customer mutations, auth-backed profiles, and messaging actions remain out of scope.",
    cards: [
      {
        title: "Customer records",
        body:
          customers.length > 0
            ? "Customer summaries are derived from persisted launch orders."
            : "No persisted customer-related order data is available yet.",
        lines: createCustomerSummaryLines(customers),
      },
      {
        title: "Recent customer activity",
        body:
          customers.length > 0
            ? "Recent persisted customer summaries are shown below for launch visibility."
            : "Customer activity entries will appear here after paid Checkout orders are persisted.",
        lines: createRecentCustomerLines(customers),
      },
    ],
  };
}

function createPersistedCustomerSummaries(orders: Order[]) {
  const customersByEmail = new Map<string, PersistedCustomerSummary>();

  for (const order of orders) {
    const email = order.shippingAddress.email;
    const existingCustomer = customersByEmail.get(email);

    if (!existingCustomer) {
      customersByEmail.set(email, {
        email,
        fullName: order.shippingAddress.fullName,
        phone: order.shippingAddress.phone ?? null,
        orderCount: 1,
        totalSpentUsd: order.totalUsd,
        latestOrderNumber: order.orderNumber,
        latestOrderPlacedAt: order.placedAt,
      });
      continue;
    }

    existingCustomer.orderCount += 1;
    existingCustomer.totalSpentUsd += order.totalUsd;

    if (new Date(order.placedAt).getTime() > new Date(existingCustomer.latestOrderPlacedAt).getTime()) {
      existingCustomer.fullName = order.shippingAddress.fullName;
      existingCustomer.phone = order.shippingAddress.phone ?? existingCustomer.phone;
      existingCustomer.latestOrderNumber = order.orderNumber;
      existingCustomer.latestOrderPlacedAt = order.placedAt;
    }
  }

  return Array.from(customersByEmail.values()).sort(
    (left, right) =>
      new Date(right.latestOrderPlacedAt).getTime() -
      new Date(left.latestOrderPlacedAt).getTime(),
  );
}

function createCustomerSummaryLines(customers: PersistedCustomerSummary[]) {
  if (!customers.length) {
    return ["0 persisted customer summaries", "No latest customer yet"];
  }

  return [
    `${customers.length} persisted customer summar${customers.length === 1 ? "y" : "ies"}`,
    `Latest customer: ${customers[0].email}`,
    `Latest order: ${customers[0].latestOrderNumber}`,
  ];
}

function createRecentCustomerLines(customers: PersistedCustomerSummary[]) {
  if (!customers.length) {
    return ["No persisted customer-related order data exists yet."];
  }

  return customers.slice(0, 5).map((customer) => createRecentCustomerLine(customer));
}

function createRecentCustomerLine(customer: PersistedCustomerSummary) {
  return [
    customer.email,
    customer.fullName,
    `${customer.orderCount} order${customer.orderCount === 1 ? "" : "s"}`,
    formatUsd(customer.totalSpentUsd),
    `Latest ${customer.latestOrderNumber}`,
    formatPlacedAt(customer.latestOrderPlacedAt),
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
