import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "shipping-policy",
    title: "Shipping Policy",
    description:
      "Shipping policy for Loom & Hearth Studio orders shipped from Morocco, including pre-shipment verification, customs guidance, and delivery support.",
    path: "/shipping-policy",
  });
}

export default function ShippingPolicyPage() {
  return <PolicyPageView slug="shipping-policy" />;
}