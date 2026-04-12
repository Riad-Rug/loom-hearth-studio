import type { Metadata } from "next";

import { PolicyPageView } from "@/features/content-pages/policy-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "accessibility-statement",
    title: "Accessibility Statement",
    description: "Accessibility statement for the Loom & Hearth Studio website.",
    path: "/accessibility-statement",
  });
}

export default function AccessibilityStatementPage() {
  return <PolicyPageView slug="accessibility-statement" />;
}