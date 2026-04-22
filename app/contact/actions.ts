"use server";

import { contactData } from "@/features/content-pages/content-pages-data";
import { sendTransactionalEmailMessage } from "@/lib/email/service";

const inquiryTypeLabels = {
  "product-inquiry": "Product",
  "trade-request": "Trade / project",
  "order-question": "Order help",
} as const;

type InquiryType = keyof typeof inquiryTypeLabels;

type ContactSubmissionState = {
  tone: "success" | "error";
  message: string;
  name?: string;
  email?: string;
  values?: ContactFormValues;
};

type ContactFormValues = {
  inquiryType?: InquiryType;
  name?: string;
  email?: string;
  studioName?: string;
  message?: string;
  productName?: string;
};

type InquiryProjectContext = {
  studioName: string | null;
  productName: string | null;
};

export async function submitContactInquiry(
  _state: ContactSubmissionState | null,
  formData: FormData,
): Promise<ContactSubmissionState> {
  const honeypot = sanitizeContactField(formData.get("ref_40"), 120);

  if (honeypot) {
    return {
      tone: "success",
      message: "Thanks. We will reply personally within 24 hours.",
    };
  }

  const name = sanitizeContactField(formData.get("name"), 120);
  const email = sanitizeContactField(formData.get("email"), 160);
  const inquiryType = sanitizeInquiryType(formData.get("inquiryType"));
  const projectContext = sanitizeProjectContext(formData);
  const message = sanitizeContactField(formData.get("message"), 2000);
  const submittedValues = createSubmittedValues({
    inquiryType: inquiryType ?? undefined,
    name: name ?? undefined,
    email: email ?? undefined,
    studioName: projectContext.studioName ?? undefined,
    message: message ?? undefined,
    productName: projectContext.productName ?? undefined,
  });

  if (!name || !email || !inquiryType || !message || message.length < 10 || !isValidEmail(email)) {
    return {
      tone: "error",
      message:
        "Please add your name, a valid email, and a short message before sending.",
      name: name ?? undefined,
      email: email ?? undefined,
      values: submittedValues,
    };
  }

  const requestNumber = createContactRequestNumber();
  const inquiryTypeLabel = inquiryTypeLabels[inquiryType];
  const studioDeliveryResult = await sendTransactionalEmailMessage({
    to: contactData.emailLabel,
    subject: `Contact message ${requestNumber}: ${inquiryTypeLabel} from ${name}`,
    html: createContactInquiryHtml({
      requestNumber,
      name,
      email,
      inquiryTypeLabel,
      projectContext,
      message,
    }),
    text: createContactInquiryText({
      requestNumber,
      name,
      email,
      inquiryTypeLabel,
      projectContext,
      message,
    }),
  });

  if (studioDeliveryResult.status !== "sent") {
    return {
      tone: "error",
      message:
        studioDeliveryResult.status === "configuration-error"
          ? `The contact form is not configured to send yet. Please email ${contactData.emailLabel} directly.`
          : `Something went wrong on our end. Please try again, or email ${contactData.emailLabel}.`,
      name,
      email,
      values: submittedValues,
    };
  }

  const confirmationDeliveryResult = await sendTransactionalEmailMessage({
    to: email,
    subject: `We received your Loom & Hearth Studio message (${requestNumber})`,
    html: createContactConfirmationHtml({ name, email, message, requestNumber }),
    text: createContactConfirmationText({ name, email, message, requestNumber }),
  });

  const firstName = name.split(/\s+/)[0] ?? name;

  if (confirmationDeliveryResult.status !== "sent") {
    return {
      tone: "success",
      message: `Thanks, ${firstName}. We received your message and will reply personally within 24 hours - usually with photos or a short video of the piece you asked about.`,
      name,
      email,
    };
  }

  return {
    tone: "success",
    message: `Thanks, ${firstName}. We've sent a confirmation to ${email} and will reply personally within 24 hours - usually with photos or a short video of the piece you asked about.`,
    name,
    email,
  };
}

function sanitizeContactField(value: FormDataEntryValue | null, maxLength: number) {
  if (typeof value !== "string") {
    return null;
  }

  const sanitized = value.trim().slice(0, maxLength);

  return sanitized ? sanitized : null;
}

function sanitizeInquiryType(value: FormDataEntryValue | null): InquiryType | null {
  if (typeof value !== "string") {
    return null;
  }

  return value in inquiryTypeLabels ? (value as InquiryType) : null;
}

function sanitizeProjectContext(formData: FormData): InquiryProjectContext {
  return {
    studioName: sanitizeContactField(formData.get("studioName"), 160),
    productName: sanitizeContactField(formData.get("productName"), 160),
  };
}

function createSubmittedValues(values: ContactFormValues): ContactFormValues {
  return Object.fromEntries(
    Object.entries(values).filter((entry): entry is [string, string] =>
      Boolean(entry[1]),
    ),
  ) as ContactFormValues;
}

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function createContactInquiryHtml(input: {
  requestNumber: string;
  name: string;
  email: string;
  inquiryTypeLabel: string;
  projectContext: InquiryProjectContext;
  message: string;
}) {
  const projectContextHtml = createProjectContextLines(input.projectContext)
    .map((line) => escapeHtml(line))
    .join("<br />");

  return [
    "<p>A new contact message was submitted from loomandhearthstudio.com.</p>",
    `<p><strong>Request number:</strong> ${escapeHtml(input.requestNumber)}</p>`,
    `<p><strong>Name:</strong> ${escapeHtml(input.name)}<br />`,
    `<strong>Email:</strong> ${escapeHtml(input.email)}<br />`,
    `<strong>Inquiry type:</strong> ${escapeHtml(input.inquiryTypeLabel)}</p>`,
    projectContextHtml ? `<p><strong>Context</strong><br />${projectContextHtml}</p>` : "",
    `<p><strong>Message</strong><br />${escapeHtml(input.message).replace(/\n/g, "<br />")}</p>`,
  ].join("");
}

function createContactInquiryText(input: {
  requestNumber: string;
  name: string;
  email: string;
  inquiryTypeLabel: string;
  projectContext: InquiryProjectContext;
  message: string;
}) {
  const projectContextLines = createProjectContextLines(input.projectContext);

  return [
    "A new contact message was submitted from loomandhearthstudio.com.",
    "",
    `Request number: ${input.requestNumber}`,
    "",
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Inquiry type: ${input.inquiryTypeLabel}`,
    ...(projectContextLines.length ? ["", "Context", ...projectContextLines] : []),
    "",
    "Message",
    input.message,
  ].join("\n");
}

function createContactConfirmationHtml(input: {
  requestNumber: string;
  name: string;
  email: string;
  message: string;
}) {
  return [
    `<p>Hi ${escapeHtml(input.name.split(/\s+/)[0] ?? input.name)},</p>`,
    "<p>We received your message and will reply personally within 24 hours.</p>",
    "<p>For rug inquiries, colour is confirmed before payment is taken. We may reply with photos or a short video of the actual piece.</p>",
    `<p><strong>Reference:</strong> ${escapeHtml(input.requestNumber)}</p>`,
    `<p><strong>Your message</strong><br />${escapeHtml(input.message).replace(/\n/g, "<br />")}</p>`,
  ].join("");
}

function createContactConfirmationText(input: {
  requestNumber: string;
  name: string;
  email: string;
  message: string;
}) {
  const firstName = input.name.split(/\s+/)[0] ?? input.name;

  return [
    `Hi ${firstName},`,
    "",
    "We received your message and will reply personally within 24 hours.",
    "",
    "For rug inquiries, colour is confirmed before payment is taken. We may reply with photos or a short video of the actual piece.",
    "",
    `Reference: ${input.requestNumber}`,
    "",
    "Your message",
    input.message,
  ].join("\n");
}

function createProjectContextLines(projectContext: InquiryProjectContext) {
  return [
    projectContext.productName ? `Product: ${projectContext.productName}` : null,
    projectContext.studioName ? `Studio or company: ${projectContext.studioName}` : null,
  ].filter((value): value is string => Boolean(value));
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
