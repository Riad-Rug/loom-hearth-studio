import { NextResponse } from "next/server";

import { updateAdminOrderCosts, type AdminOrderCostsUpdateRequest } from "@/lib/admin/orders";
import { requireAdminRoleForMutation } from "@/lib/auth/service";

const orderCostFieldKeys = [
  "productCostUsd",
  "shippingCostUsd",
  "packagingCostUsd",
  "paymentFeeUsd",
  "otherCostUsd",
] as const satisfies ReadonlyArray<keyof AdminOrderCostsUpdateRequest>;

export async function POST(request: Request) {
  const access = await requireAdminRoleForMutation();

  if (access.status === "requires-auth") {
    return NextResponse.json(
      {
        status: "requires-auth",
        order: null,
        message: "Admin authentication is required before costs can be saved.",
      },
      { status: 401 },
    );
  }

  if (access.status === "requires-role") {
    return NextResponse.json(
      {
        status: "requires-role",
        order: null,
        message: "An admin role is required before costs can be saved.",
      },
      { status: 403 },
    );
  }

  const payload = (await request.json()) as Partial<AdminOrderCostsUpdateRequest>;

  if (typeof payload.orderId !== "string" || !payload.orderId) {
    return NextResponse.json(
      {
        status: "invalid-request",
        order: null,
        message: "That cost update request was invalid.",
      },
      { status: 400 },
    );
  }

  const costs: Partial<AdminOrderCostsUpdateRequest> = { orderId: payload.orderId };

  for (const key of orderCostFieldKeys) {
    const value = payload[key];

    if (value === undefined || value === null) {
      continue;
    }

    if (typeof value !== "number") {
      return NextResponse.json(
        {
          status: "invalid-request",
          order: null,
          message: "Cost values must be valid non-negative numbers.",
        },
        { status: 400 },
      );
    }

    costs[key] = value;
  }

  const result = await updateAdminOrderCosts(costs);

  return NextResponse.json(result, {
    status: result.status === "updated" ? 200 : 400,
  });
}
