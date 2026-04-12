import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "returns-policy",
    title: "Returns Policy",
    description:
      "Returns policy for Loom & Hearth Studio orders, including eligibility, timing, and refund handling.",
    path: "/returns-policy",
  });
}

export default function ReturnsPolicyPage() {
  return <PolicyPageView slug="returns-policy" />;
}