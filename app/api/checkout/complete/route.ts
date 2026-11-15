import { NextResponse } from "next/server";

import { persistConfirmedStripePaymentIntentOrder } from "@/lib/order/service";

export async function POST(request: Request) {
  const body = (await request.json()) as { paymentIntentId?: string };

  if (typeof body.paymentIntentId !== "string" || !body.paymentIntentId.startsWith("pi_")) {
    return NextResponse.json(
      { status: "invalid-request", order: null, message: "A valid paymentIntentId is required." },
      { status: 400 },
    );
  }

  const result = await persistConfirmedStripePaymentIntentOrder({
    paymentIntentId: body.paymentIntentId,
  });

  // Another order holds a unit. "unavailable": nothing was saved and cardHold says
  // whether the buyer's hold was released. "oversold": the payment had already
  // been captured, so orderNumber names the order the studio will refund.
  if (result.status === "unavailable" || result.status === "oversold") {
    return NextResponse.json(
      {
        status: result.status,
        order: null,
        orderNumber: result.persistedOrder?.orderNumber ?? null,
        cardHold: result.authorizationRelease ?? "unresolved",
        unavailableItems: (result.persistenceRequest?.items ?? [])
          .filter((item) => result.unavailableProductIds?.includes(item.productId))
          .map((item) => ({ productId: item.productId, name: item.name })),
        message: result.message,
      },
      { status: 409 },
    );
  }

  if (result.status !== "created" && result.status !== "already-persisted") {
    return NextResponse.json(
      { status: result.status, order: null, message: result.message },
      { status: result.status === "configuration-error" ? 503 : 502 },
    );
  }

  const order = result.persistedOrder;

  if (!order) {
    return NextResponse.json(
      { status: "api-error", order: null, message: "Order was not available after persistence." },
      { status: 502 },
    );
  }

  return NextResponse.json({
    status: "created",
    order: {
      orderNumber: order.orderNumber,
      totalUsd: order.totalUsd,
      currency: order.currency,
      paymentIntentId: body.paymentIntentId,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        sku: item.variant?.sku ?? null,
      })),
    },
    message: result.message,
  });
}
