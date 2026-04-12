import type { Metadata } from "next";

import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "category",
    entityKey: "decor",
    title: "Decor",
    description:
      "Browse supporting Moroccan decor pieces selected to sit alongside rugs, poufs, and collected textile interiors.",
    path: "/shop/decor",
  });
}

export default async function DecorPage() {
  const products = await listCatalogProductCards({ category: "decor" });

  return <CatalogPageView category="decor" products={products} />;
}