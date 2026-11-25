import type { Metadata, Route } from "next";
import { notFound, permanentRedirect } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { CatalogPageView } from "@/features/catalog/catalog-page-view";
import { allRugsNavLink, getRugStyleCollection } from "@/features/catalog/rug-style-collections";
import { retiredRugPageRedirects, type RugFacet } from "@/lib/catalog/rug-facets";
import {
  getRugFacetPage,
  getRugFacetTitle,
  listIndexableRugFacetSlugs,
  listRugFacetLinks,
  listRugFacetProductCards,
  listRugFilterOptions,
} from "@/lib/catalog/service";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import { categoryOgImage } from "@/lib/seo/category-og-image";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";
import { breadcrumbSchema, itemListSchema } from "@/lib/seo/schema";

/**
 * A rug Type (/shop/rugs/pile) or Region (/shop/rugs/azilal) page. The old
 * style URLs that match a Type or Region slug (azilal, zemmour, beni-ourain,
 * boujad, boucherouite, flatweave-hanbel, mixed-technique) are these pages, at
 * the same address; retired ones redirect (next.config.ts and below).
 */
type RugFacetPageProps = {
  params: Promise<{
    style: string;
  }>;
};

async function resolveFacet(rawSlug: string): Promise<RugFacet> {
  const slug = normalizeSlug(rawSlug);
  const redirectTo = retiredRugPageRedirects[slug];

  if (redirectTo) {
    permanentRedirect(redirectTo as Route);
  }

  const facet = await getRugFacetPage(slug);

  if (!facet) {
    notFound();
  }

  return facet;
}

/** Written copy when the slug has it, else a plain header built from the Type or Region name. */
function getFacetCopy(facet: RugFacet) {
  const collection = getRugStyleCollection(facet.slug);
  const title = getRugFacetTitle(facet);
  const fallbackDescription =
    facet.kind === "type"
      ? `Moroccan ${facet.name.toLowerCase()} rugs. Each rug is the exact piece photographed, reviewed as an individual piece before it is listed.`
      : `Moroccan rugs from ${facet.name}. Each rug is the exact piece photographed, reviewed as an individual piece before it is listed.`;

  return {
    title,
    heading: collection?.page?.heading ?? title,
    metaTitle: collection?.page?.metaTitle ?? title,
    description: collection?.description ?? fallbackDescription,
    metaDescription: collection?.page?.metaDescription ?? collection?.description ?? fallbackDescription,
    bullets: collection?.bullets ?? [],
    guide: collection?.page?.guide,
  };
}

export async function generateMetadata({ params }: RugFacetPageProps): Promise<Metadata> {
  const slug = normalizeSlug((await params).style);
  const facet = await getRugFacetPage(slug);

  if (!facet) {
    return buildMetadata({
      title: "Rugs",
      description: "Browse handcrafted Moroccan rugs sourced in Morocco and prepared for review-first buying.",
      path: "/shop/rugs",
    });
  }

  // Indexed only while the page has its written guide copy and a piece whose
  // own page is indexable (lib/seo/index-policy.ts); otherwise noindex, follow.
  const [products, indexableSlugs] = await Promise.all([
    listRugFacetProductCards({ facet }),
    listIndexableRugFacetSlugs(new Date()),
  ]);
  const copy = getFacetCopy(facet);

  return buildManagedMetadata({
    entityType: "category",
    entityKey: `rugs-${facet.slug}`,
    title: copy.metaTitle,
    description: copy.metaDescription,
    path: `/shop/rugs/${facet.slug}`,
    noIndexFollow: !indexableSlugs.has(facet.slug),
    ...categoryOgImage(products),
  });
}

export default async function RugFacetPage({ params }: RugFacetPageProps) {
  const facet = await resolveFacet((await params).style);
  const [products, facetLinks, filterOptions] = await Promise.all([
    listRugFacetProductCards({ facet }),
    listRugFacetLinks(),
    listRugFilterOptions(),
  ]);
  const copy = getFacetCopy(facet);
  const path = `/shop/rugs/${facet.slug}`;

  // Every stocked Type and Region page links to every other one under the
  // same anchor the menu uses; ones with nothing to buy are left out.
  const siblingLinks = facetLinks.filter((link) => link.slug !== facet.slug);

  return (
    <>
      <JsonLd
        data={[
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Shop", path: "/shop" },
            { name: "Rugs", path: "/shop/rugs" },
            { name: copy.title, path },
          ]),
          itemListSchema({
            path,
            name: copy.title,
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
        collection={{
          eyebrow: facet.kind === "type" ? "Rug type" : "Rug region",
          title: copy.heading,
          description: copy.description,
          bullets: copy.bullets,
          href: path,
          guide: copy.guide,
        }}
        products={products}
        rugFilterOptions={filterOptions}
        styleLinks={siblingLinks.length ? [allRugsNavLink, ...siblingLinks] : undefined}
        styleNavLabel="Other rug types and regions"
      />
    </>
  );
}
