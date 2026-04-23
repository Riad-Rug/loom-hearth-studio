import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { lookbookItems } from "@/features/content-pages/content-pages-data";
import { LookbookPageView } from "@/features/content-pages/lookbook-page-view";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { itemListSchema } from "@/lib/seo/schema";

const lookbookOgImage = "/lookbook/opengraph-image";
const lookbookOgImageAlt =
  "A low-furnished Moroccan living room anchored by an ivory Beni Ourain rug in natural light.";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "lookbook",
    title: "Moroccan Interior Lookbook",
    description:
      "Hand-knotted rugs, vintage textiles, and Moroccan decor photographed in real interiors. Shop the collections they came from.",
    path: "/lookbook",
    ogImageUrl: lookbookOgImage,
    ogImageAlt: lookbookOgImageAlt,
    ogImageWidth: 1200,
    ogImageHeight: 630,
  });
}

export default function LookbookPage() {
  return (
    <>
      <JsonLd
        data={itemListSchema({
          path: "/lookbook",
          name: "Moroccan Interior Lookbook",
          items: lookbookItems.map((item) => ({
            name: item.title,
            path: item.href,
            image: item.imageSrc,
          })),
        })}
      />
      <LookbookPageView />
    </>
  );
}
