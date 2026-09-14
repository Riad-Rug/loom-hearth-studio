import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { faqItems } from "@/features/content-pages/content-pages-data";
import { FaqPageView } from "@/features/content-pages/faq-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "faq",
    title: "FAQ: Buying Moroccan Rugs, Shipping & Returns",
    description:
      "Answers on approval-before-payment, US shipping from Morocco, customs, returns and how one-of-a-kind rugs are photographed.",
    path: "/faq",
  });
}

export default function FaqPage() {
  return (
    <>
      <JsonLd
        data={faqSchema(
          faqItems.map((item) => ({ question: item.question, answer: item.answer })),
        )}
      />
      <FaqPageView />
    </>
  );
}