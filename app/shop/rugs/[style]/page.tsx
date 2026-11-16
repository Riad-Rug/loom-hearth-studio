import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import {
  allRugsNavLink,
  getRugStyleCollection,
} from "@/features/catalog/rug-style-collections";
import {
  listIndexableRugStyleSlugs,
  listRugStyleNavLinks,
  listRugStyleProductCards,
} from "@/lib/catalog/service";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import { categoryOgImage } from "@/lib/seo/category-og-image";
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
        "Browse handcrafted Moroccan rugs sourced in Morocco and prepared for review-first buying.",
      path: "/shop/rugs",
    });
  }

  // One-of-a-kind stock means a style can stand at zero pieces for a while. The
  // page stays indexed while a piece is for sale or sold recently enough to still
  // rank (lib/seo/index-policy.ts), then asks to be dropped but keeps its links
  // followed, since they all point at pages that want crawl signal. The rug rows
  // read here are the ones the body below reuses (listRugRows in service.ts).
  const [products, indexableStyles] = await Promise.all([
    listRugStyleProductCards({ style }),
    listIndexableRugStyleSlugs(new Date()),
  ]);

  return buildManagedMetadata({
    entityType: "category",
    entityKey: `rugs-${style}`,
    title: collection.page?.metaTitle ?? collection.title,
    description: collection.page?.metaDescription ?? collection.description,
    path: `/shop/rugs/${style}`,
    noIndexFollow: !indexableStyles.has(style),
    ...categoryOgImage(products),
  });
}

export default async function RugStylePage({ params }: RugStylePageProps) {
  const style = normalizeSlug((await params).style);
  const collection = getRugStyleCollection(style);

  if (!collection) {
    notFound();
  }

  const [products, styleNavLinks] = await Promise.all([
    listRugStyleProductCards({ style }),
    listRugStyleNavLinks(),
  ]);

  // Before this strip existed each style page had exactly one inbound internal
  // link, from the chip row on /shop/rugs, which left the six pages that should
  // rank for "beni ourain rug" and its siblings starved while /shop and
  // /shop/rugs absorbed the weight. Every stocked style now links to every other
  // one under its own keyword-exact anchor. Styles with nothing to buy are
  // omitted rather than greyed, since this strip has no fixed slots to hold
  // open. They rejoin on their own the moment stock lands.
  const siblingStyleLinks = styleNavLinks.filter(
    (link) => link.available && link.slug !== style,
  );

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
          title: collection.page?.heading ?? collection.title,
          description: collection.description,
          bullets: collection.bullets,
          href: `/shop/rugs/${style}`,
          guide: collection.page?.guide,
        }}
        products={products}
        styleLinks={
          siblingStyleLinks.length ? [allRugsNavLink, ...siblingStyleLinks] : undefined
        }
        styleNavLabel="Other rug types"
      />
    </>
  );
}
