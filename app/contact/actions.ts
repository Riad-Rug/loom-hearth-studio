"use server";

import { redirect } from "next/navigation";

import { contactData } from "@/features/content-pages/content-pages-data";
import { sendTransactionalEmailMessage } from "@/lib/email/service";

const inquiryTypeLabels = {
  "product-inquiry": "Product inquiry",
  "custom-request": "Custom request",
  "order-question": "Order question",
} as const;

export async function submitContactInquiry(formData: FormData) {
  const name = sanitizeContactField(formData.get("name"), 120);
  const email = sanitizeContactField(formData.get("email"), 160);
  const inquiryType = sanitizeInquiryType(formData.get("inquiryType"));
  const message = sanitizeContactField(formData.get("message"), 2000);

  if (!name || !email || !inquiryType || !message || !isValidEmail(email)) {
    redirect("/contact?status=error&reason=validation");
  }

  const requestNumber = createContactRequestNumber();

  const deliveryResult = await sendTransactionalEmailMessage({
    to: contactData.emailLabel,
    subject: `Contact inquiry ${requestNumber}: ${inquiryTypeLabels[inquiryType]} from ${name}`,
    html: createContactInquiryHtml({
      requestNumber,
      name,
      email,
      inquiryTypeLabel: inquiryTypeLabels[inquiryType],
      message,
    }),
    text: createContactInquiryText({
      requestNumber,
      name,
      email,
      inquiryTypeLabel: inquiryTypeLabels[inquiryType],
      message,
    }),
  });

  if (deliveryResult.status === "sent") {
    redirect(`/contact?status=sent&request=${encodeURIComponent(requestNumber)}`);
  }

  redirect(
    deliveryResult.status === "configuration-error"
      ? "/contact?status=error&reason=configuration"
      : "/contact?status=error&reason=delivery",
  );
}

function sanitizeContactField(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const sanitized = value.trim().slice(0, maxLength);

  return sanitized ? sanitized : null;
}

function sanitizeInquiryType(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  return value in inquiryTypeLabels
    ? (value as keyof typeof inquiryTypeLabels)
    : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createContactInquiryHtml(input: {
  requestNumber: string;
  name: string;
  email: string;
  inquiryTypeLabel: string;
  message: string;
}) {
  return [
    "<p>A new contact inquiry was submitted from loomandhearthstudio.com.</p>",
    `<p><strong>Request number:</strong> ${escapeHtml(input.requestNumber)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(input.name)}<br />`,
    `<strong>Email:</strong> ${escapeHtml(input.email)}<br />`,
    `<strong>Inquiry type:</strong> ${escapeHtml(input.inquiryTypeLabel)}</p>`,
    `<p><strong>Message</strong><br />${escapeHtml(input.message).replace(/\n/g, "<br />")}</p>`,
  ].join("");
}

function createContactInquiryText(input: {
  requestNumber: string;
  name: string;
  email: string;
  inquiryTypeLabel: string;
  message: string;
}) {
  return [
    "A new contact inquiry was submitted from loomandhearthstudio.com.",
    "",
    `Request number: ${input.requestNumber}`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Inquiry type: ${input.inquiryTypeLabel}`,
    "",
    "Message",
    input.message,
  ].join("\n");
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createContactRequestNumber() {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, "0");
  const day = String(now.getUTCDate()).padStart(2, "0");
  const randomSegment = crypto.randomUUID().slice(0, 8).toUpperCase();

  return `LH-${year}${month}${day}-${randomSegment}`;
}
