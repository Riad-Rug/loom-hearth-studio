import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { LookbookPageView } from "@/features/content-pages/lookbook-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "lookbook",
    title: "Moroccan Interior Lookbook",
    description:
      "Real-room photography for Moroccan rugs, poufs, pillows, and antiques is coming soon.",
    path: "/lookbook",
  });
}

export default function LookbookPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Lookbook", path: "/lookbook" },
        ])}
      />
      <LookbookPageView />
    </>
  );
}
