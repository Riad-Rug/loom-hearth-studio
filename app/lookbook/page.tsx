import type { Metadata } from "next";

import { LookbookPageView } from "@/features/content-pages/lookbook-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Moroccan Interior Lookbook",
  description:
    "Explore curated Moroccan interiors, discover handcrafted rugs in context, and shop editorial looks across rugs, vintage finds, and decor.",
  path: "/lookbook",
});

export default function LookbookPage() {
  return <LookbookPageView />;
}