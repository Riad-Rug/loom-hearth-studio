import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { getRugStyleCollection } from "@/features/catalog/rug-style-collections";
import { listRugStyleProductCards } from "@/lib/catalog/service";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema } from "@/lib/seo/schema";

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

  return buildManagedMetadata({
    entityType: "category",
    entityKey: `rugs-${style}`,
    title: collection.title,
    description: collection.description,
    path: `/shop/rugs/${style}`,
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
        data={breadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Shop", path: "/shop" },
          { name: "Rugs", path: "/shop/rugs" },
          { name: collection.title, path: `/shop/rugs/${style}` },
        ])}
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
