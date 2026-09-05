import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import {
  categoryHasPurchasableProducts,
  listCatalogProductCards,
} from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

export async function generateMetadata(): Promise<Metadata> {
  // Decor stands at zero purchasable pieces today, and an indexable page showing
  // "0 pieces" is the kind of thin result Google logs against the whole shop. The
  // check is live rather than a hardcoded flag — same rule the rug-style pages
  // apply per style (app/shop/rugs/[style]/page.tsx) — so the page starts asking
  // to be indexed again on its own the moment decor is stocked. app/sitemap.ts
  // gates the /shop/decor entry on this same helper, so the two never disagree.
  //
  // noIndexFollow, not noIndex: this page's links (breadcrumbs, nav, and any
  // companion products the view renders) all point at pages that do want crawl
  // signal, so there is nothing to gain from the "nofollow" half.
  const hasPurchasableProducts = await categoryHasPurchasableProducts("decor");

  return buildManagedMetadata({
    entityType: "category",
    entityKey: "decor",
    title: "Decor",
    description:
      "Browse supporting Moroccan decor pieces selected to sit alongside rugs, poufs, and collected textile interiors.",
    path: "/shop/decor",
    noIndexFollow: !hasPurchasableProducts,
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