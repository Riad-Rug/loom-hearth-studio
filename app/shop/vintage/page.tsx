import type { Metadata } from "next";

import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "category",
    entityKey: "vintage",
    title: "Vintage Rugs",
    description:
      "Browse one-of-a-kind vintage Moroccan rugs with condition and provenance stated piece by piece.",
    path: "/shop/vintage",
  });
}

export default async function VintageRugsPage() {
  const products = await listCatalogProductCards({ category: "vintage" });

  return <CatalogPageView category="vintage" products={products} />;
}
