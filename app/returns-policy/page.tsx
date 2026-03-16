import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Returns Policy",
  description: "Returns policy placeholder page for Loom & Hearth Studio.",
  path: "/returns-policy",
});

export default function ReturnsPolicyPage() {
  return <PolicyPageView slug="returns-policy" />;
}
