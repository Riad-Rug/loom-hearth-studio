import type { Metadata } from "next";

import { ContactPageView } from "@/features/content-pages/contact-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Contact Loom & Hearth Studio",
  description:
    "Contact Loom & Hearth Studio for inquiries about handmade Moroccan rugs, custom sourcing, vintage textiles, and curated home decor.",
  path: "/contact",
});

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
        message: sanitizeContactField(resolvedSearchParams?.message, 800),
        productName: sanitizeContactField(resolvedSearchParams?.productName, 120),
      }}
    />
  );
}

function sanitizeContactField(value: string | undefined, maxLength: number) {
  if (!value) {
    return undefined;
  }

  return value.trim().slice(0, maxLength);
}
