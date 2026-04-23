import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listRugStyleProductCards } from "@/lib/catalog/service";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";

type RugStylePageProps = {
  params: Promise<{
    style: string;
  }>;
};

const rugStyleCollections = {
  "beni-ourain": {
    title: "Beni Ourain Rugs",
    description:
      "Browse Beni Ourain rugs selected for hand-knotted wool construction, pale fields, and restrained geometric pattern. Each rug is reviewed as an individual piece before it is listed.",
    bullets: [
      "Hand-knotted wool pile rugs with visible construction notes",
      "One-of-one pieces sourced through Marrakech",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "rugs",
  },
  vintage: {
    title: "Vintage Moroccan Rugs",
    description:
      "Browse vintage Moroccan rugs selected for structure, patina, and exact-piece character. These are collected pieces, not repeatable stock.",
    bullets: [
      "One-of-one vintage rugs with condition notes",
      "Selected for structural integrity, not age alone",
      "Final colour and condition confirmed before payment is captured",
    ],
    category: "vintage",
  },
} as const;

export async function generateMetadata({
  params,
}: RugStylePageProps): Promise<Metadata> {
  const style = normalizeSlug((await params).style);
  const collection = rugStyleCollections[style as keyof typeof rugStyleCollections];

  if (!collection) {
    return buildMetadata({
      title: "Rugs",
      description:
        "Browse handcrafted Moroccan rugs sourced in Marrakech and prepared for review-first buying.",
      path: "/shop/rugs",
    });
  }

  return buildManagedMetadata({
    entityType: "category",
    entityKey: `rugs-${style}`,
    title: collection.title,
    description: collection.description,
    path: `/shop/rugs/${style}`,
  });
}

export default async function RugStylePage({ params }: RugStylePageProps) {
  const style = normalizeSlug((await params).style);
  const collection = rugStyleCollections[style as keyof typeof rugStyleCollections];

  if (!collection) {
    notFound();
  }

  const products = await listRugStyleProductCards({ style });

  return (
    <CatalogPageView
      category={collection.category}
      collection={{
        eyebrow: "Collection",
        title: collection.title,
        description: collection.description,
        bullets: collection.bullets,
      }}
      products={products}
    />
  );
}
