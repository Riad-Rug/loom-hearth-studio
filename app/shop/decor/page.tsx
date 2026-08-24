import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "category",
    entityKey: "decor",
    title: "Decor",
    description:
      "Browse supporting Moroccan decor pieces selected to sit alongside rugs, poufs, and collected textile interiors.",
    path: "/shop/decor",
    noIndex: true,
  });
}

export default async function DecorPage() {
  const products = await listCatalogProductCards({ category: "decor" });

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: "Decor", path: "/shop/decor" },
          ]),
          itemListSchema({
            path: "/shop/decor",
            name: "Decor",
            items: products.map((product) => ({
              name: product.name,
              path: product.href,
              image: product.primaryImage?.src,
            })),
          }),
        ]}
      />
      <CatalogPageView category="decor" products={products} />
    </>
  );
}