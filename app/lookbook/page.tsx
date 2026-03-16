import type { Metadata } from "next";

import { LookbookPageView } from "@/features/content-pages/lookbook-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Lookbook",
  description: "Lookbook gallery placeholder for Loom & Hearth Studio.",
  path: "/lookbook",
});

export default function LookbookPage() {
  return <LookbookPageView />;
}
