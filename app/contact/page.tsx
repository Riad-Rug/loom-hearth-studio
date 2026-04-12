import type { Metadata } from "next";

import { ContactPageView } from "@/features/content-pages/contact-page-view";
import { contactData } from "@/features/content-pages/content-pages-data";
import { buildManagedMetadata } from "@/lib/seo/metadata";

import { submitContactInquiry } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "contact",
    title: "Contact Loom & Hearth Studio",
    description:
      "Contact Loom & Hearth Studio for inquiries about handmade Moroccan rugs, custom sourcing, vintage textiles, and handmade home decor.",
    path: "/contact",
  });
}

type ContactPageProps = {
  searchParams?: Promise<{
    inquiryType?: string;
    message?: string;
    productName?: string;
    quantity?: string;
    variant?: string;
    requestVideoReview?: string;
    requestHold?: string;
    requestImages?: string;
    status?: string;
    reason?: string;
    request?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <ContactPageView
      defaults={{
        inquiryType: sanitizeContactField(resolvedSearchParams?.inquiryType, 40),
        productName: sanitizeContactField(resolvedSearchParams?.productName, 120),
        quantity: sanitizeNumericField(resolvedSearchParams?.quantity),
        variantName: sanitizeContactField(resolvedSearchParams?.variant, 120),
        requestVideoReview: sanitizeYesNoField(resolvedSearchParams?.requestVideoReview) ?? true,
        requestHold: sanitizeYesNoField(resolvedSearchParams?.requestHold),
        requestImages: sanitizeYesNoField(resolvedSearchParams?.requestImages),
        message: buildDefaultMessage(resolvedSearchParams),
      }}
      submitAction={submitContactInquiry}
      submissionState={buildSubmissionState(resolvedSearchParams)}
    />
  );
}

function sanitizeContactField(value: string | undefined, maxLength: number) {
  if (!value) {
    return undefined;
  }

  return value.trim().slice(0, maxLength);
}

function buildDefaultMessage(searchParams: Awaited<ContactPageProps["searchParams"]>) {
  const message = sanitizeContactField(searchParams?.message, 800);

  if (message) {
    return message;
  }

  const productName = sanitizeContactField(searchParams?.productName, 120);
  const quantity = sanitizeNumericField(searchParams?.quantity);
  const variantName = sanitizeContactField(searchParams?.variant, 120);

  if (!productName) {
    return undefined;
  }

  const details = [
    quantity ? `Quantity: ${quantity}` : null,
    variantName ? `Variant: ${variantName}` : null,
  ]
    .filter(Boolean)
    .join(" | ");

  return details
    ? `Hello, I would like to inquire about ${productName}.\n\n${details}`
    : `Hello, I would like to inquire about ${productName}.`;
}

function buildSubmissionState(searchParams: Awaited<ContactPageProps["searchParams"]>) {
  if (searchParams?.status === "sent") {
    const requestNumber = sanitizeRequestNumber(searchParams.request);

    return {
      tone: "success" as const,
      message: "Your inquiry has been sent. We will reply within 24 hours.",
      requestNumber,
    };
  }

  if (searchParams?.status !== "error") {
    return undefined;
  }

  return {
    tone: "error" as const,
    message:
      searchParams.reason === "configuration"
        ? `The contact form is not configured to send yet. Please email ${contactData.emailLabel} directly.`
        : `We could not send your inquiry. Please try again or email ${contactData.emailLabel} directly.`,
  };
}

function sanitizeRequestNumber(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return /^[A-Z0-9-]{8,32}$/.test(value) ? value : undefined;
}

function sanitizeNumericField(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  const sanitized = value.trim();

  return /^[0-9]{1,3}$/.test(sanitized) ? sanitized : undefined;
}

function sanitizeYesNoField(value: string | undefined) {
  if (!value) {
    return undefined;
  }

  return value === "yes";
}