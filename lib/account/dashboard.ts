import type { AuthenticatedUser } from "@/lib/auth";
import type {
  AccountDashboardData,
  AccountOrderHistoryData,
} from "@/lib/account/dashboard-shared";
import { createOrderRepository } from "@/lib/db/repositories/order-repository";
import type { Order } from "@/types/domain";
import type { OrderStatus } from "@/types/domain/order";

export async function getAccountDashboardData(
  user: AuthenticatedUser | null,
): Promise<AccountDashboardData | null> {
  if (!user) {
    return null;
  }

  const orders = await createOrderRepository().getByCustomerEmail(user.email);

  return {
    overview: {
      greeting: "Welcome back",
      statusLabel: "Signed-in account with persisted order history",
      accountEmail: user.email,
    },
    orders: createAccountOrderHistoryData(orders),
    profile: {
      fullName: orders[0]?.shippingAddress.fullName ?? "Customer name placeholder",
      email: user.email,
      phone: orders[0]?.shippingAddress.phone ?? null,
    },
  };
}

function createAccountOrderHistoryData(orders: Order[]): AccountOrderHistoryData {
  const items = orders.map((order) => ({
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    statusLabel: formatOrderStatusLabel(order.status),
    placedAtLabel: `Placed ${formatOrderPlacedAtLabel(order.placedAt)}`,
    totalLabel: formatOrderTotal(order.totalUsd),
  }));

  if (!items.length) {
    return {
      statusLabel: "No persisted orders found for this account email",
      orderCountLabel: "0 persisted orders",
      latestOrderLabel: "No persisted orders",
      items,
    };
  }

  return {
    statusLabel: "Persisted order history loaded",
    orderCountLabel: `${items.length} persisted order${items.length === 1 ? "" : "s"}`,
    latestOrderLabel: items[0].orderNumber,
    items,
  };
}

function formatOrderPlacedAtLabel(placedAt: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(new Date(placedAt));
}

function formatOrderTotal(totalUsd: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(totalUsd);
}

function formatOrderStatusLabel(status: OrderStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
