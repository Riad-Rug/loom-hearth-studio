import { NextResponse } from "next/server";

import { applyMailchimpWebhookUpdate, isAuthorizedMailchimpWebhook } from "@/lib/newsletter/service";

export async function GET() {
  return new NextResponse("Mailchimp webhook endpoint ready.", { status: 200 });
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const secret = url.searchParams.get("secret");

  if (!isAuthorizedMailchimpWebhook(secret)) {
    return NextResponse.json({ status: "forbidden" }, { status: 403 });
  }

  const formData = await request.formData();
  const type = formData.get("type");
  const dataEmail = formData.get("data[email]");

  if (typeof type !== "string" || typeof dataEmail !== "string") {
    return NextResponse.json({ status: "ignored" }, { status: 200 });
  }

  if (type === "unsubscribe") {
    await applyMailchimpWebhookUpdate({ email: dataEmail, status: "unsubscribed" });
  }

  if (type === "cleaned") {
    await applyMailchimpWebhookUpdate({ email: dataEmail, status: "cleaned" });
  }

  if (type === "subscribe") {
    await applyMailchimpWebhookUpdate({ email: dataEmail, status: "subscribed" });
  }

  return NextResponse.json({ status: "ok" }, { status: 200 });
}
