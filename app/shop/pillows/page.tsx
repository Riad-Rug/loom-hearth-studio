import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

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

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: "Pillows", path: "/shop/pillows" },
          ]),
          itemListSchema({
            path: "/shop/pillows",
            name: "Pillows",
            items: products.map((product) => ({
              name: product.name,
              path: product.href,
              image: product.primaryImage?.src,
            })),
          }),
        ]}
      />
      <CatalogPageView category="pillows" products={products} />
    </>
  );
}