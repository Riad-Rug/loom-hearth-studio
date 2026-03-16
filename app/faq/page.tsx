import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { faqItems } from "@/features/content-pages/content-pages-data";
import { FaqPageView } from "@/features/content-pages/faq-page-view";
import { buildMetadata } from "@/lib/seo/metadata";
import { faqSchema } from "@/lib/seo/schema";

export const metadata: Metadata = buildMetadata({
  title: "FAQ",
  description: "Frequently asked questions for Loom & Hearth Studio.",
  path: "/faq",
});

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
