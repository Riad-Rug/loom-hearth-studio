"use server";

import { redirect } from "next/navigation";

import { getSupportedInquiryCountry } from "@/config/inquiry-countries";
import { contactData } from "@/features/content-pages/content-pages-data";
import { sendTransactionalEmailMessage } from "@/lib/email/service";

const inquiryTypeLabels = {
  "product-inquiry": "Product inquiry",
  "trade-request": "Trade or project request",
  "sourcing-request": "Sourcing request",
  "order-question": "Order question",
} as const;

type InquiryDestination = {
  countryCode: string;
  countryLabel: string;
  city: string;
  region: string | null;
  postalCode: string | null;
  address1: string | null;
  shippingAvailabilityNote: string | null;
};

type InquiryProjectContext = {
  studioName: string | null;
  productName: string | null;
  variantName: string | null;
  quantity: string | null;
  roomType: string | null;
  desiredSize: string | null;
  projectTimeline: string | null;
  requestFlags: string[];
};

export async function submitContactInquiry(formData: FormData) {
  const name = sanitizeContactField(formData.get("name"), 120);
  const email = sanitizeContactField(formData.get("email"), 160);
  const inquiryType = sanitizeInquiryType(formData.get("inquiryType"));
  const destination = sanitizeInquiryDestination(formData);
  const projectContext = sanitizeProjectContext(formData);
  const message = sanitizeContactField(formData.get("message"), 2000);

  if (!name || !email || !inquiryType || !destination || !message || !isValidEmail(email)) {
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
      destination,
      projectContext,
      message,
    }),
    text: createContactInquiryText({
      requestNumber,
      name,
      email,
      inquiryTypeLabel: inquiryTypeLabels[inquiryType],
      destination,
      projectContext,
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

  return value in inquiryTypeLabels ? (value as keyof typeof inquiryTypeLabels) : null;
}

function sanitizeInquiryDestination(formData: FormData): InquiryDestination | null {
  const countryCodeValue = formData.get("country");

  if (typeof countryCodeValue !== "string") {
    return null;
  }

  const countryCode = countryCodeValue.trim();
  const country = getSupportedInquiryCountry(countryCode);

  if (!country) {
    return null;
  }

  const city = sanitizeContactField(formData.get("city"), 120);
  const region = sanitizeContactField(formData.get("region"), 120);
  const postalCode = sanitizeContactField(formData.get("postalCode"), 40);
  const address1 = sanitizeContactField(formData.get("address1"), 160);

  if (!city) {
    return null;
  }

  if (country.requiresRegion && !region) {
    return null;
  }

  if (country.requiresPostalCode && !postalCode) {
    return null;
  }

  return {
    countryCode: country.code,
    countryLabel: country.label,
    city,
    region,
    postalCode,
    address1,
    shippingAvailabilityNote: country.shippingAvailabilityNote,
  };
}

function sanitizeProjectContext(formData: FormData): InquiryProjectContext {
  const requestFlags = [
    formData.get("requestVideoReview") === "yes" ? "Video review requested" : null,
    formData.get("requestHold") === "yes" ? "Hold request" : null,
    formData.get("requestImages") === "yes" ? "High-resolution image request" : null,
  ].filter((value): value is string => Boolean(value));

  return {
    studioName: sanitizeContactField(formData.get("studioName"), 160),
    productName: sanitizeContactField(formData.get("productName"), 160),
    variantName: sanitizeContactField(formData.get("variantName"), 120),
    quantity: sanitizeNumericField(formData.get("quantity")),
    roomType: sanitizeContactField(formData.get("roomType"), 120),
    desiredSize: sanitizeContactField(formData.get("desiredSize"), 120),
    projectTimeline: sanitizeContactField(formData.get("projectTimeline"), 120),
    requestFlags,
  };
}

function sanitizeNumericField(value: FormDataEntryValue | null) {
  if (typeof value !== "string") {
    return null;
  }

  const sanitized = value.trim();

  return /^[0-9]{1,3}$/.test(sanitized) ? sanitized : null;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createContactInquiryHtml(input: {
  requestNumber: string;
  name: string;
  email: string;
  inquiryTypeLabel: string;
  destination: InquiryDestination;
  projectContext: InquiryProjectContext;
  message: string;
}) {
  const projectContextHtml = createProjectContextLines(input.projectContext)
    .map((line) => escapeHtml(line))
    .join("<br />");

  return [
    "<p>A new contact inquiry was submitted from loomandhearthstudio.com.</p>",
    `<p><strong>Request number:</strong> ${escapeHtml(input.requestNumber)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(input.name)}<br />`,
    `<strong>Email:</strong> ${escapeHtml(input.email)}<br />`,
    `<strong>Inquiry type:</strong> ${escapeHtml(input.inquiryTypeLabel)}</p>`,
    `<p><strong>Destination</strong><br />${escapeHtml(formatDestinationLabel(input.destination)).replace(/\n/g, "<br />")}</p>`,
    projectContextHtml ? `<p><strong>Project details</strong><br />${projectContextHtml}</p>` : "",
    `<p><strong>Message</strong><br />${escapeHtml(input.message).replace(/\n/g, "<br />")}</p>`,
  ].join("");
}

function createContactInquiryText(input: {
  requestNumber: string;
  name: string;
  email: string;
  inquiryTypeLabel: string;
  destination: InquiryDestination;
  projectContext: InquiryProjectContext;
  message: string;
}) {
  const projectContextLines = createProjectContextLines(input.projectContext);

  return [
    "A new contact inquiry was submitted from loomandhearthstudio.com.",
    "",
    `Request number: ${input.requestNumber}`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Inquiry type: ${input.inquiryTypeLabel}`,
    "",
    "Destination",
    formatDestinationLabel(input.destination),
    ...(projectContextLines.length ? ["", "Project details", ...projectContextLines] : []),
    "",
    "Message",
    input.message,
  ].join("\n");
}

function createProjectContextLines(projectContext: InquiryProjectContext) {
  return [
    projectContext.productName ? `Product: ${projectContext.productName}` : null,
    projectContext.variantName ? `Variant: ${projectContext.variantName}` : null,
    projectContext.quantity ? `Quantity: ${projectContext.quantity}` : null,
    projectContext.studioName ? `Studio or company: ${projectContext.studioName}` : null,
    projectContext.roomType ? `Room type: ${projectContext.roomType}` : null,
    projectContext.desiredSize ? `Desired size: ${projectContext.desiredSize}` : null,
    projectContext.projectTimeline ? `Timeline: ${projectContext.projectTimeline}` : null,
    ...projectContext.requestFlags,
  ].filter((value): value is string => Boolean(value));
}

function formatDestinationLabel(destination: InquiryDestination) {
  return [
    destination.countryLabel,
    destination.city,
    destination.region,
    destination.postalCode,
    destination.address1,
    destination.shippingAvailabilityNote,
  ]
    .filter(Boolean)
    .join("\n");
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