import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

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

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: "Vintage Rugs", path: "/shop/vintage" },
          ]),
          itemListSchema({
            path: "/shop/vintage",
            name: "Vintage Rugs",
            items: products.map((product) => ({
              name: product.name,
              path: product.href,
              image: product.primaryImage?.src,
            })),
          }),
        ]}
      />
      <CatalogPageView category="vintage" products={products} />
    </>
  );
}
