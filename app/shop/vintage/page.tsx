import type { Metadata } from "next";

import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "category",
    entityKey: "vintage",
    title: "Vintage",
    description:
      "Browse vintage Moroccan pieces with collected character, condition notes, and a review-first buying path.",
    path: "/shop/vintage",
  });
}

export default async function VintagePage() {
  const products = await listCatalogProductCards({ category: "vintage" });

  return <CatalogPageView category="vintage" products={products} />;
}