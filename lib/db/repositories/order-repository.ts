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
  getByCheckoutSessionId(checkoutSessionId: string | null): Promise<Order | null>;
  getByPaymentIntentId(paymentIntentId: string): Promise<Order | null>;
  getByCustomerEmail(customerEmail: string): Promise<Order[]>;
  listAll(): Promise<Order[]>;
  updateStatus(orderId: string, status: Order["status"]): Promise<Order>;
  updatePaymentTransition(
    orderId: string,
    transition: { status: Order["status"]; paymentStatus: Order["paymentStatus"] },
  ): Promise<Order>;
  updateCustomerNotesByPaymentIntentId(paymentIntentId: string, notes: string): Promise<Order | null>;
  markPhotosSent(orderId: string): Promise<Order>;
  updateTrackingInfo(
    orderId: string,
    input: { trackingNumber: string; carrier: string; shippedAt?: Date },
  ): Promise<Order>;
  updateOrderCosts(
    orderId: string,
    input: {
      // `undefined`/absent = leave unchanged, `null` = explicitly clear the
      // field, a number = set it. See AdminOrderCostsUpdateRequest in
      // lib/admin/orders.ts for the full rationale.
      productCostUsd?: number | null;
      shippingCostUsd?: number | null;
      packagingCostUsd?: number | null;
      paymentFeeUsd?: number | null;
      otherCostUsd?: number | null;
    },
  ): Promise<Order>;
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

  async getByCheckoutSessionId(checkoutSessionId: string | null) {
    if (!checkoutSessionId) {
      return null;
    }

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

  async getByPaymentIntentId(paymentIntentId: string) {
    const order = await this.context.client.orderRecord.findUnique({
      where: {
        paymentIntentId,
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

  async listAll() {
    const orders = await this.context.client.orderRecord.findMany({
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

  async updatePaymentTransition(
    orderId: string,
    transition: { status: Order["status"]; paymentStatus: Order["paymentStatus"] },
  ) {
    const updatedOrder = await this.context.client.orderRecord.update({
      where: {
        id: orderId,
      },
      data: {
        status: mapOrderStatusToPrisma(transition.status),
        paymentStatus: mapPaymentStatusToPrisma(transition.paymentStatus),
      },
      include: {
        lineItems: true,
      },
    });

    return mapOrderRecordToDomainOrder(updatedOrder);
  }

  async updateCustomerNotesByPaymentIntentId(paymentIntentId: string, notes: string) {
    try {
      const updatedOrder = await this.context.client.orderRecord.update({
        where: {
          paymentIntentId,
        },
        data: {
          customerNotes: notes,
          customerNotesSubmittedAt: new Date(),
        },
        include: {
          lineItems: true,
        },
      });

      return mapOrderRecordToDomainOrder(updatedOrder);
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2025") {
        return null;
      }

      throw error;
    }
  }

  // Always overwrites photosSentAt with the current time — the caller
  // (markAdminOrderPhotosSent in lib/admin/orders.ts) is responsible for
  // only invoking this a second time when the admin has explicitly
  // confirmed an overwrite, since re-recording moves the customer-visible
  // "approve by" deadline.
  async markPhotosSent(orderId: string) {
    const updatedOrder = await this.context.client.orderRecord.update({
      where: {
        id: orderId,
      },
      data: {
        photosSentAt: new Date(),
      },
      include: {
        lineItems: true,
      },
    });

    return mapOrderRecordToDomainOrder(updatedOrder);
  }

  async updateTrackingInfo(
    orderId: string,
    input: { trackingNumber: string; carrier: string; shippedAt?: Date },
  ) {
    // The ship date is set the first time tracking is saved for an order,
    // then preserved on every later save (e.g. fixing a tracking-number
    // typo) — without this, saving tracking again would reset `shippedAt`
    // to "now" even on an order that actually shipped days ago. An explicit
    // `input.shippedAt` still wins when a caller passes one.
    const existingOrder = await this.context.client.orderRecord.findUnique({
      where: {
        id: orderId,
      },
      select: {
        shippedAt: true,
      },
    });

    const shippedAt = input.shippedAt ?? existingOrder?.shippedAt ?? new Date();

    const updatedOrder = await this.context.client.orderRecord.update({
      where: {
        id: orderId,
      },
      data: {
        trackingNumber: input.trackingNumber,
        carrier: input.carrier,
        shippedAt,
      },
      include: {
        lineItems: true,
      },
    });

    return mapOrderRecordToDomainOrder(updatedOrder);
  }

  async updateOrderCosts(
    orderId: string,
    input: {
      productCostUsd?: number | null;
      shippingCostUsd?: number | null;
      packagingCostUsd?: number | null;
      paymentFeeUsd?: number | null;
      otherCostUsd?: number | null;
    },
  ) {
    const updatedOrder = await this.context.client.orderRecord.update({
      where: {
        id: orderId,
      },
      data: {
        // A key is only included when the caller actually provided a value
        // for it (undefined means "leave unchanged, don't include in the
        // update at all"). Within an included key, `null` explicitly clears
        // the column back to NULL in the database — distinct from a number,
        // which sets it — so Prisma actually receives `null` for a cleared
        // field rather than the field being silently skipped.
        ...(input.productCostUsd !== undefined && {
          productCostUsd: input.productCostUsd === null ? null : createPrismaDecimal(input.productCostUsd),
        }),
        ...(input.shippingCostUsd !== undefined && {
          shippingCostUsd:
            input.shippingCostUsd === null ? null : createPrismaDecimal(input.shippingCostUsd),
        }),
        ...(input.packagingCostUsd !== undefined && {
          packagingCostUsd:
            input.packagingCostUsd === null ? null : createPrismaDecimal(input.packagingCostUsd),
        }),
        ...(input.paymentFeeUsd !== undefined && {
          paymentFeeUsd: input.paymentFeeUsd === null ? null : createPrismaDecimal(input.paymentFeeUsd),
        }),
        ...(input.otherCostUsd !== undefined && {
          otherCostUsd: input.otherCostUsd === null ? null : createPrismaDecimal(input.otherCostUsd),
        }),
        costsUpdatedAt: new Date(),
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
    billingAddress: input.billingAddress ? (input.billingAddress as Prisma.InputJsonValue) : Prisma.JsonNull,
    shippingAddress: input.shippingAddress as Prisma.InputJsonValue,
    promoCode: input.promoCode ?? null,
    discountUsd: createPrismaDecimal(input.discountUsd),
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
    billingAddress: order.billingAddress
      ? (order.billingAddress as unknown as Order["billingAddress"])
      : undefined,
    shippingAddress: order.shippingAddress as Order["shippingAddress"],
    customerNotes: order.customerNotes ?? undefined,
    customerNotesSubmittedAt: order.customerNotesSubmittedAt?.toISOString() ?? undefined,
    promoCode: order.promoCode ?? undefined,
    discountUsd: Number(order.discountUsd),
    subtotalUsd: Number(order.subtotalUsd),
    shippingUsd: Number(order.shippingUsd) as Order["shippingUsd"],
    taxUsd: Number(order.taxUsd),
    totalUsd: Number(order.totalUsd),
    currency: order.currency as Order["currency"],
    placedAt: order.placedAt.toISOString(),
    stripePaymentIntentId: order.paymentIntentId ?? undefined,
    photosSentAt: order.photosSentAt?.toISOString() ?? undefined,
    trackingNumber: order.trackingNumber ?? undefined,
    carrier: order.carrier ?? undefined,
    shippedAt: order.shippedAt?.toISOString() ?? undefined,
    productCostUsd: order.productCostUsd != null ? Number(order.productCostUsd) : undefined,
    shippingCostUsd: order.shippingCostUsd != null ? Number(order.shippingCostUsd) : undefined,
    packagingCostUsd: order.packagingCostUsd != null ? Number(order.packagingCostUsd) : undefined,
    paymentFeeUsd: order.paymentFeeUsd != null ? Number(order.paymentFeeUsd) : undefined,
    otherCostUsd: order.otherCostUsd != null ? Number(order.otherCostUsd) : undefined,
    costsUpdatedAt: order.costsUpdatedAt?.toISOString() ?? undefined,
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
