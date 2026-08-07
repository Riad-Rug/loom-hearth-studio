import { NextResponse } from "next/server";

import { createOrderRepository } from "@/lib/db/repositories/order-repository";

const maxNotesLength = 2000;

export async function POST(request: Request) {
  const body = (await request.json()) as { paymentIntentId?: string; notes?: string };

  if (typeof body.paymentIntentId !== "string" || !body.paymentIntentId.startsWith("pi_")) {
    return NextResponse.json(
      { status: "invalid-request", message: "A valid paymentIntentId is required." },
      { status: 400 },
    );
  }

  if (typeof body.notes !== "string" || body.notes.length > maxNotesLength) {
    return NextResponse.json(
      { status: "invalid-request", message: `Notes must be a string of ${maxNotesLength} characters or fewer.` },
      { status: 400 },
    );
  }

  const repository = createOrderRepository();
  const order = await repository.updateCustomerNotesByPaymentIntentId(body.paymentIntentId, body.notes.trim());

  if (!order) {
    return NextResponse.json(
      { status: "not-found", message: "No order matches this payment." },
      { status: 404 },
    );
  }

  return NextResponse.json({ status: "saved", message: "Notes saved." });
}
