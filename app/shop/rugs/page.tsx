import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards, listRugFacetLinks, listRugFilterOptions } from "@/lib/catalog/service";
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
  const [products, facetLinks, filterOptions] = await Promise.all([
    listCatalogProductCards({ category: "rugs" }),
    listRugFacetLinks(),
    listRugFilterOptions(),
  ]);

  // Crawlable links to every Type and Region page with something to buy, under
  // the same anchor the menu and the sibling strips use. The filters in the
  // sidebar narrow this page in place; these links go to the indexable pages.
  const typeLinks = facetLinks.filter((link) => link.kind === "type");
  const regionLinks = facetLinks.filter((link) => link.kind === "region");

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
      <CatalogPageView
        category="rugs"
        products={products}
        rugFilterOptions={filterOptions}
        styleLinks={typeLinks.length ? typeLinks : undefined}
        styleNavLabel="Shop by type"
        secondaryStyleLinks={regionLinks.length ? regionLinks : undefined}
        secondaryStyleNavLabel="Shop by region"
      />
    </>
  );
}
