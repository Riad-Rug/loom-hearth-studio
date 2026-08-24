import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { getRugStyleCollection } from "@/features/catalog/rug-style-collections";
import { listAvailableRugStyleSlugs, listCatalogProductCards } from "@/lib/catalog/service";
import { normalizeSlug, productRugStyleOptions } from "@/lib/catalog/product-validation";
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
  const [products, availableStyles] = await Promise.all([
    listCatalogProductCards({ category: "rugs" }),
    listAvailableRugStyleSlugs(),
  ]);

  // Only styles that currently have a purchasable piece get a link: a chip
  // leading to an empty (and noindex) collection page is a dead end. Driven off
  // the canonical dropdown order so the row reads the same way the admin does,
  // minus "Unclassified", which is an internal catch-all with no page.
  const styleLinks = productRugStyleOptions
    .map((style) => ({ label: style, slug: normalizeSlug(style) }))
    .filter(({ slug }) => availableStyles.has(slug) && getRugStyleCollection(slug))
    .map(({ label, slug }) => ({ label, href: `/shop/rugs/${slug}` }));

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
