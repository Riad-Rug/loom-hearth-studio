import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards, listRugStyleNavLinks } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "category",
    entityKey: "rugs",
    title: "Rugs",
    description:
      "Browse handcrafted Moroccan rugs sourced in Marrakech, including ONE OF A KIND pieces prepared for review-first buying.",
    path: "/shop/rugs",
  });
}

export default async function RugsPage() {
  const [products, styleNavLinks] = await Promise.all([
    listCatalogProductCards({ category: "rugs" }),
    listRugStyleNavLinks(),
  ]);

  // Only styles that currently have a purchasable piece get a link: a chip
  // leading to an empty (and noindex) collection page is a dead end. Labels come
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
