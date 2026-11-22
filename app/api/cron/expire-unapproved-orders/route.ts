import { timingSafeEqual } from "node:crypto";

import { NextResponse } from "next/server";

import { expireUnapprovedOrders } from "@/lib/order/approval-expiry";

export const dynamic = "force-dynamic";

// Scheduled daily in vercel.json. Vercel sends "Authorization: Bearer <CRON_SECRET>".
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json(
      { status: "configuration-error", message: "CRON_SECRET is not set." },
      { status: 503 },
    );
  }

  if (!hasBearerSecret(request.headers.get("authorization"), cronSecret)) {
    return NextResponse.json({ status: "unauthorized" }, { status: 401 });
  }

  const result = await expireUnapprovedOrders();

  if (result.failed.length > 0) {
    console.error("APPROVAL_EXPIRY_FAILED", result.failed);
  }

  return NextResponse.json(
    { status: result.failed.length > 0 ? "partial-failure" : "ok", ...result },
    { status: result.failed.length > 0 ? 500 : 200 },
  );
}

function hasBearerSecret(header: string | null, secret: string) {
  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header ?? "");

  return received.length === expected.length && timingSafeEqual(received, expected);
}
