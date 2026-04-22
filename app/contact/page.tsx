import type { Metadata } from "next";

import { ContactPageView } from "@/features/content-pages/contact-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

import { submitContactInquiry } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "contact",
    title: "Contact Loom & Hearth Studio",
    description:
      "Get in touch with Loom & Hearth Studio about handmade Moroccan rugs, trade projects, and order help.",
    path: "/contact",
  });
}

type ContactPageProps = {
  searchParams?: Promise<{
    inquiryType?: string;
    message?: string;
    productName?: string;
  }>;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  return (
    <ContactPageView
      defaults={{
        inquiryType: sanitizeContactField(resolvedSearchParams?.inquiryType, 40),
        productName: sanitizeContactField(resolvedSearchParams?.productName, 120),
        message: buildDefaultMessage(resolvedSearchParams),
      }}
      submitAction={submitContactInquiry}
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
  if (!productName) {
    return undefined;
  }

  return `Hello, I would like to inquire about ${productName}.`;
}
