import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

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

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: "Poufs", path: "/shop/poufs" },
          ]),
          itemListSchema({
            path: "/shop/poufs",
            name: "Poufs",
            items: products.map((product) => ({
              name: product.name,
              path: product.href,
              image: product.primaryImage?.src,
            })),
          }),
        ]}
      />
      <CatalogPageView category="poufs" products={products} />
    </>
  );
}