import type { Metadata } from "next";

import { ContactPageView } from "@/features/content-pages/contact-page-view";
import { listHomepageFeaturedProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";

import { submitContactInquiry } from "@/app/contact/actions";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "trade_apply",
    title: "Trade Inquiry",
    description:
      "Start a trade inquiry with Loom & Hearth Studio for project sourcing, exact-piece review, and direct studio support.",
    path: "/trade/apply",
  });
}

type TradeApplyPageProps = {
  searchParams?: Promise<{
    message?: string;
    productName?: string;
  }>;
};

export default async function TradeApplyPage({ searchParams }: TradeApplyPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const recommendedProducts = await listHomepageFeaturedProductCards({ limit: 4 });

  return (
    <ContactPageView
      defaults={{
        inquiryType: "trade-request",
        message: sanitizeField(resolvedSearchParams?.message, 800),
        productName: sanitizeField(resolvedSearchParams?.productName, 120),
      }}
      formTitle="Start a trade inquiry"
      heroContent={{
        title: "Start a trade inquiry",
        body:
          "Share the category, room, size direction, destination market, or exact piece. The studio replies personally within one business day with the next sourcing step.",
      }}
      recommendationContent={{
        title: "Trade-supported categories",
        copy:
          "A few active pieces to keep in view while the studio reviews your project details.",
      }}
      recommendedProducts={recommendedProducts}
      submitAction={submitContactInquiry}
    />
  );
}

function sanitizeField(value: string | undefined, maxLength: number) {
  if (!value) {
    return undefined;
  }

  return value.trim().slice(0, maxLength);
}
