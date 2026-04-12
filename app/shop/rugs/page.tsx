import type { Metadata } from "next";

import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "category",
    entityKey: "rugs",
    title: "Rugs",
    description:
      "Browse handcrafted Moroccan rugs sourced in Marrakech, including one-of-one pieces prepared for review-first buying.",
    path: "/shop/rugs",
  });
}

export default async function RugsPage() {
  const products = await listCatalogProductCards({ category: "rugs" });

  return <CatalogPageView category="rugs" products={products} />;
}