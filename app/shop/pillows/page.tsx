import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { categoryOgImage } from "@/lib/seo/category-og-image";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  const products = await listCatalogProductCards({ category: "pillows" });

  return buildManagedMetadata({
    entityType: "category",
    entityKey: "pillows",
    title: "Moroccan Pillow Covers: Kilim & Battania",
    description:
      "Handwoven Moroccan pillow covers cut from kilim and vintage Battania textiles. One of a kind, approved by you before payment.",
    path: "/shop/pillows",
    ...categoryOgImage(products),
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