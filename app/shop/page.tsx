import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

type ShopPageProps = {
  searchParams?: Promise<{ q?: string | string[] }>;
};

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  // The header search form submits to /shop?q=..., and the legacy /search path 308s here
  // with its query intact. Every search someone runs would otherwise be a new crawlable,
  // indexable URL. Search results are noindexed but still followed so product links on
  // them keep being discovered; the canonical stays /shop.
  const isSearchResults = hasSearchQuery(resolvedSearchParams?.q);

  return buildManagedMetadata({
    entityType: "category",
    entityKey: "shop",
    title: "Shop",
    description:
      "Browse Moroccan rugs, poufs, pillows, and decor sourced in Marrakech and prepared for review-first buying.",
    path: "/shop",
    noIndexFollow: isSearchResults,
  });
}

function hasSearchQuery(value: string | string[] | undefined) {
  const query = Array.isArray(value) ? value[0] : value;
  return typeof query === "string" && query.trim().length > 0;
}

export default async function ShopPage() {
  const products = await listCatalogProductCards();

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
          ]),
          itemListSchema({
            path: "/shop",
            name: "Shop",
            items: products.map((product) => ({
              name: product.name,
              path: product.href,
              image: product.primaryImage?.src,
            })),
          }),
        ]}
      />
      <CatalogPageView products={products} />
    </>
  );
}