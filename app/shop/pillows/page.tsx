import type { Metadata } from "next";

import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "category",
    entityKey: "pillows",
    title: "Pillows",
    description:
      "Browse Moroccan pillows and textile accents designed to layer with rugs, poufs, and collected interiors.",
    path: "/shop/pillows",
  });
}

export default async function PillowsPage() {
  const products = await listCatalogProductCards({ category: "pillows" });

  return <CatalogPageView category="pillows" products={products} />;
}