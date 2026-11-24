import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { categoryOgImage } from "@/lib/seo/category-og-image";
import { storePromise } from "@/lib/order/store-promise";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  const products = await listCatalogProductCards({ category: "poufs" });

  return buildManagedMetadata({
    entityType: "category",
    entityKey: "poufs",
    title: "Moroccan Poufs Sewn from Handwoven Wool",
    description: `Handmade Moroccan poufs sewn from wool flatweaves and pile rugs, each one of a kind. See your exact pouf before payment; ships worldwide, free from $${storePromise.freeShippingThresholdUsd}.`,
    path: "/shop/poufs",
    ...categoryOgImage(products),
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