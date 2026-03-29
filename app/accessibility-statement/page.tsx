import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Accessibility Statement",
  description: "Accessibility statement for the Loom & Hearth Studio website.",
  path: "/accessibility-statement",
});

export default function AccessibilityStatementPage() {
  return <PolicyPageView slug="accessibility-statement" />;
}