import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { getRugStyleCollection } from "@/features/catalog/rug-style-collections";
import { listRugStyleProductCards } from "@/lib/catalog/service";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

type RugStylePageProps = {
  params: Promise<{
    style: string;
  }>;
};

export async function generateMetadata({
  params,
}: RugStylePageProps): Promise<Metadata> {
  const style = normalizeSlug((await params).style);
  const collection = getRugStyleCollection(style);

  if (!collection) {
    return buildMetadata({
      title: "Rugs",
      description:
        "Browse handcrafted Moroccan rugs sourced in Marrakech and prepared for review-first buying.",
      path: "/shop/rugs",
    });
  }

  // Every canonical rug style has a collection page, but one-of-a-kind stock
  // means a style can legitimately stand at zero pieces for a while. Same rule
  // that was applied by hand to /shop/decor — don't let an indexable page show
  // "0 pieces" — except computed live per style, because which styles are empty
  // changes every time a rug sells or lands.
  //
  // This is a second read of the same rows the page body loads below: nothing in
  // this codebase wraps repository reads in React cache(), and service.ts leans
  // on noStore() rather than memoisation, so generateMetadata and the render
  // each issue their own query. Accepted deliberately — the alternative is
  // hardcoding today's empty styles into the source, which is exactly the
  // staleness this change removes.
  const products = await listRugStyleProductCards({ style });
  // Mirrors isPurchasableProduct against the card view model: active, and not an
  // out-of-stock multi-unit listing.
  const hasPurchasableProducts = products.some(
    (product) => product.status === "active" && !product.isOutOfStock,
  );

  return buildManagedMetadata({
    entityType: "category",
    entityKey: `rugs-${style}`,
    title: collection.title,
    description: collection.description,
    path: `/shop/rugs/${style}`,
    noIndex: !hasPurchasableProducts,
  });
}

export default async function RugStylePage({ params }: RugStylePageProps) {
  const style = normalizeSlug((await params).style);
  const collection = getRugStyleCollection(style);

  if (!collection) {
    notFound();
  }

  const products = await listRugStyleProductCards({ style });

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: "Rugs", path: "/shop/rugs" },
            { name: collection.title, path: `/shop/rugs/${style}` },
          ]),
          itemListSchema({
            path: `/shop/rugs/${style}`,
            name: collection.title,
            items: products.map((product) => ({
              name: product.name,
              path: product.href,
              image: product.primaryImage?.src,
            })),
          }),
        ]}
      />
      <CatalogPageView
        category={collection.category}
        collection={{
          eyebrow: "Collection",
          title: collection.title,
          description: collection.description,
          bullets: collection.bullets,
          href: `/shop/rugs/${style}`,
        }}
        products={products}
      />
    </>
  );
}
