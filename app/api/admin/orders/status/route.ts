import { NextResponse } from "next/server";

import {
  adminOrderStatusOptions,
  type AdminOrderStatusUpdateRequest,
  updateAdminOrderStatus,
} from "@/lib/admin/orders";

export async function POST(request: Request) {
  const payload = (await request.json()) as Partial<AdminOrderStatusUpdateRequest>;
  const requestedStatus = payload.status;

  if (
    typeof payload.orderId !== "string" ||
    !requestedStatus ||
    !adminOrderStatusOptions.includes(requestedStatus as (typeof adminOrderStatusOptions)[number])
  ) {
    return NextResponse.json(
      {
        status: "invalid-request",
        order: null,
        message: "Admin order status update request is invalid.",
      },
      { status: 400 },
    );
  }

  const result = await updateAdminOrderStatus({
    orderId: payload.orderId,
    status: requestedStatus,
  });

  return NextResponse.json(result, {
    status:
      result.status === "updated" || result.status === "ignored"
        ? 200
        : 400,
  });
}
