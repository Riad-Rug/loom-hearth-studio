import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Shipping Policy",
  description:
    "Shipping policy for Loom & Hearth Studio orders shipped from Morocco with customs handled to help prevent unexpected import charges for US buyers.",
  path: "/shipping-policy",
});

export default function ShippingPolicyPage() {
  return <PolicyPageView slug="shipping-policy" />;
}

