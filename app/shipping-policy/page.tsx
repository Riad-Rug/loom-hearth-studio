import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Shipping Policy",
  description: "Shipping policy placeholder page for Loom & Hearth Studio.",
  path: "/shipping-policy",
});

export default function ShippingPolicyPage() {
  return <PolicyPageView slug="shipping-policy" />;
}
