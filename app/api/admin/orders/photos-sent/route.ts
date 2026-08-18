import { NextResponse } from "next/server";

import {
  markAdminOrderPhotosSent,
  type AdminOrderPhotosSentUpdateRequest,
} from "@/lib/admin/orders";
import { requireAdminRoleForMutation } from "@/lib/auth/service";

export async function POST(request: Request) {
  const access = await requireAdminRoleForMutation();

  if (access.status === "requires-auth") {
    return NextResponse.json(
      {
        status: "requires-auth",
        order: null,
        message: "Admin authentication is required before photos can be marked sent.",
      },
      { status: 401 },
    );
  }

  if (access.status === "requires-role") {
    return NextResponse.json(
      {
        status: "requires-role",
        order: null,
        message: "An admin role is required before photos can be marked sent.",
      },
      { status: 403 },
    );
  }

  const payload = (await request.json()) as Partial<AdminOrderPhotosSentUpdateRequest>;

  if (typeof payload.orderId !== "string" || !payload.orderId) {
    return NextResponse.json(
      {
        status: "invalid-request",
        order: null,
        message: "That photos-sent request was invalid.",
      },
      { status: 400 },
    );
  }

  const result = await markAdminOrderPhotosSent({ orderId: payload.orderId });

  return NextResponse.json(result, {
    status: result.status === "updated" ? 200 : 400,
  });
}
