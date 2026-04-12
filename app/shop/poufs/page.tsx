import type { Metadata } from "next";

import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "category",
    entityKey: "poufs",
    title: "Poufs",
    description:
      "Browse Moroccan poufs and rug-based seating pieces sourced in Marrakech for layered, tactile interiors.",
    path: "/shop/poufs",
  });
}

export default async function PoufsPage() {
  const products = await listCatalogProductCards({ category: "poufs" });

  return <CatalogPageView category="poufs" products={products} />;
}