import {
  Prisma,
  OrderStatus as PrismaOrderStatus,
  PaymentStatus as PrismaPaymentStatus,
} from "@prisma/client";

import { createRepositoryContext, type RepositoryContext } from "@/lib/db";
import type { OrderPersistenceRequest } from "@/lib/order";
import type { Order } from "@/types/domain";
import type { ProductVariant as DomainProductVariant } from "@/types/domain/product";

export interface OrderRepository {
  create(input: OrderPersistenceRequest): Promise<Order>;
  getById(orderId: string): Promise<Order | null>;
  getByCheckoutSessionId(checkoutSessionId: string): Promise<Order | null>;
  getByCustomerEmail(customerEmail: string): Promise<Order[]>;
  updateStatus(orderId: string, status: Order["status"]): Promise<Order>;
}

type OrderRecordWithLineItems = Prisma.OrderRecordGetPayload<{
  include: {
    lineItems: true;
  };
}>;

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly context: RepositoryContext) {}

  async create(input: OrderPersistenceRequest) {
    const createdOrder = await this.context.client.orderRecord.create({
      data: mapOrderPersistenceRequestToCreateInput(input),
      include: {
        lineItems: true,
      },
    });

    return mapOrderRecordToDomainOrder(createdOrder);
  }

  async getById(orderId: string) {
    const order = await this.context.client.orderRecord.findUnique({
      where: {
        id: orderId,
      },
      include: {
        lineItems: true,
      },
    });

    return order ? mapOrderRecordToDomainOrder(order) : null;
  }

  async getByCheckoutSessionId(checkoutSessionId: string) {
    const order = await this.context.client.orderRecord.findUnique({
      where: {
        checkoutSessionId,
      },
      include: {
        lineItems: true,
      },
    });

    return order ? mapOrderRecordToDomainOrder(order) : null;
  }

  async getByCustomerEmail(customerEmail: string) {
    const orders = await this.context.client.orderRecord.findMany({
      where: {
        customerEmail,
      },
      include: {
        lineItems: true,
      },
      orderBy: {
        placedAt: "desc",
      },
    });

    return orders.map(mapOrderRecordToDomainOrder);
  }

  async updateStatus(orderId: string, status: Order["status"]) {
    const updatedOrder = await this.context.client.orderRecord.update({
      where: {
        id: orderId,
      },
      data: {
        status: mapOrderStatusToPrisma(status),
      },
      include: {
        lineItems: true,
      },
    });

    return mapOrderRecordToDomainOrder(updatedOrder);
  }
}

export function createOrderRepository(context = createRepositoryContext()) {
  return new PrismaOrderRepository(context);
}

export const orderRepositoryTodo =
  "TODO: Extend the PrismaOrderRepository only when real order-persistence boundary consumption is wired into the webhook/order pipeline.";

function mapOrderPersistenceRequestToCreateInput(
  input: OrderPersistenceRequest,
): Prisma.OrderRecordCreateInput {
  return {
    orderNumber: input.orderNumber,
    checkoutMode: "guest",
    checkoutSessionId: input.checkoutSessionId,
    paymentIntentId: input.paymentIntentId ?? null,
    status: mapOrderStatusToPrisma(input.status),
    paymentStatus: mapPaymentStatusToPrisma(input.paymentStatus),
    customerEmail: input.shippingAddress.email,
    shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
    subtotalUsd: createPrismaDecimal(input.subtotalUsd),
    shippingUsd: createPrismaDecimal(input.shippingUsd),
    taxUsd: createPrismaDecimal(input.taxUsd),
    totalUsd: createPrismaDecimal(input.totalUsd),
    currency: input.currency,
    stripeEventId: input.metadata.stripeEventId,
    stripeEventType: input.metadata.stripeEventType,
    placedAt: new Date(input.placedAt),
    lineItems: {
      create: input.items.map((item) => ({
        cartItemId: item.id,
        productId: item.productId,
        productType: item.productType,
        name: item.name,
        slug: item.slug,
        priceUsd: createPrismaDecimal(item.priceUsd),
        quantity: item.quantity,
        variant: item.variant ? (item.variant as Prisma.InputJsonValue) : Prisma.JsonNull,
      })),
    },
  };
}

function mapOrderRecordToDomainOrder(order: OrderRecordWithLineItems): Order {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    items: order.lineItems.map((item) => ({
      id: item.cartItemId,
      productId: item.productId,
      productType: item.productType as Order["items"][number]["productType"],
      name: item.name,
      slug: item.slug,
      priceUsd: Number(item.priceUsd),
      quantity: item.quantity,
      variant: item.variant ? (item.variant as unknown as DomainProductVariant) : undefined,
    })),
    status: mapPrismaOrderStatus(order.status),
    paymentStatus: mapPrismaPaymentStatus(order.paymentStatus),
    shippingAddress: order.shippingAddress as Order["shippingAddress"],
    subtotalUsd: Number(order.subtotalUsd),
    shippingUsd: Number(order.shippingUsd) as Order["shippingUsd"],
    taxUsd: Number(order.taxUsd),
    totalUsd: Number(order.totalUsd),
    currency: order.currency as Order["currency"],
    placedAt: order.placedAt.toISOString(),
    stripePaymentIntentId: order.paymentIntentId ?? undefined,
  };
}

function mapOrderStatusToPrisma(status: Order["status"]) {
  switch (status) {
    case "pending":
      return PrismaOrderStatus.pending;
    case "paid":
      return PrismaOrderStatus.paid;
    case "processing":
      return PrismaOrderStatus.processing;
    case "shipped":
      return PrismaOrderStatus.shipped;
    case "delivered":
      return PrismaOrderStatus.delivered;
    case "cancelled":
      return PrismaOrderStatus.cancelled;
    case "refunded":
      return PrismaOrderStatus.refunded;
  }
}

function mapPrismaOrderStatus(status: PrismaOrderStatus): Order["status"] {
  return status;
}

function mapPaymentStatusToPrisma(status: Order["paymentStatus"]) {
  switch (status) {
    case "pending":
      return PrismaPaymentStatus.pending;
    case "authorized":
      return PrismaPaymentStatus.authorized;
    case "paid":
      return PrismaPaymentStatus.paid;
    case "failed":
      return PrismaPaymentStatus.failed;
    case "refunded":
      return PrismaPaymentStatus.refunded;
  }
}

function mapPrismaPaymentStatus(status: PrismaPaymentStatus): Order["paymentStatus"] {
  return status;
}

function createPrismaDecimal(value: number) {
  return new Prisma.Decimal(value);
}
