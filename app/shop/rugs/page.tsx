import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards, listRugStyleNavLinks } from "@/lib/catalog/service";
import { categoryOgImage } from "@/lib/seo/category-og-image";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  const products = await listCatalogProductCards({ category: "rugs" });

  return buildManagedMetadata({
    entityType: "category",
    entityKey: "rugs",
    title: "Moroccan Rugs: Beni Ourain, Azilal & Kilim",
    description:
      "Hand-knotted and flatweave Moroccan rugs by style and size. Every rug is the exact piece photographed; approve photos and video before you pay.",
    path: "/shop/rugs",
    ...categoryOgImage(products),
  });
}

export default async function RugsPage() {
  const [products, styleNavLinks] = await Promise.all([
    listCatalogProductCards({ category: "rugs" }),
    listRugStyleNavLinks(),
  ]);

  // Only styles with something to buy get a chip, since a chip leading to a
  // style with nothing to buy is a dead end. Labels come
  // from rugStyleNavLinks rather than the admin's rugStyle options, so the chip
  // here reads "Beni Ourain Rugs" — the same anchor the header, the homepage
  // strip and the sibling strips give that page, which is the whole point of
  // pushing link weight down to these six routes.
  const styleLinks = styleNavLinks.filter((link) => link.available);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: "Rugs", path: "/shop/rugs" },
          ]),
          itemListSchema({
            path: "/shop/rugs",
            name: "Rugs",
            items: products.map((product) => ({
              name: product.name,
              path: product.href,
              image: product.primaryImage?.src,
            })),
          }),
        ]}
      />
      <CatalogPageView category="rugs" products={products} styleLinks={styleLinks} />
    </>
  );
}
