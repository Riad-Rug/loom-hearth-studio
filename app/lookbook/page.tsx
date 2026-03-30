import type { Metadata } from "next";

import { LookbookPageView } from "@/features/content-pages/lookbook-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Moroccan Interior Lookbook",
  description:
    "See Moroccan rugs and decor in real interiors, and shop the pieces shown across rugs, vintage finds, and decor.",
  path: "/lookbook",
});

export default function LookbookPage() {
  return <LookbookPageView />;
}