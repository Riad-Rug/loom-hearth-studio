import { NextResponse } from "next/server";

import {
  updateAdminOrderTracking,
  type AdminOrderTrackingUpdateRequest,
} from "@/lib/admin/orders";
import { requireAdminRoleForMutation } from "@/lib/auth/service";

export async function POST(request: Request) {
  const access = await requireAdminRoleForMutation();

  if (access.status === "requires-auth") {
    return NextResponse.json(
      {
        status: "requires-auth",
        order: null,
        message: "Admin authentication is required before tracking info can be saved.",
      },
      { status: 401 },
    );
  }

  if (access.status === "requires-role") {
    return NextResponse.json(
      {
        status: "requires-role",
        order: null,
        message: "An admin role is required before tracking info can be saved.",
      },
      { status: 403 },
    );
  }

  const payload = (await request.json()) as Partial<AdminOrderTrackingUpdateRequest>;

  if (
    typeof payload.orderId !== "string" ||
    !payload.orderId ||
    typeof payload.trackingNumber !== "string" ||
    typeof payload.carrier !== "string"
  ) {
    return NextResponse.json(
      {
        status: "invalid-request",
        order: null,
        message: "That tracking update request was invalid.",
      },
      { status: 400 },
    );
  }

  const result = await updateAdminOrderTracking({
    orderId: payload.orderId,
    trackingNumber: payload.trackingNumber,
    carrier: payload.carrier,
  });

  return NextResponse.json(result, {
    status: result.status === "updated" ? 200 : 400,
  });
}
