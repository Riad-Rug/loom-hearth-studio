/**
 * Rug Types and Regions as shop facets: the /shop/rugs/<slug> pages, the Type
 * and Region filters, the Rugs menu and the sitemap all read from here, so a
 * rug is found under exactly the Type and Region set on it in the admin.
 *
 * Pure (no database): callers pass the regions they loaded.
 */
import { rugTypeOptions, type RugRegionSummary, type RugType } from "@/lib/catalog/rug-taxonomy";

export type RugFacet = {
  kind: "type" | "region";
  /** URL slug: /shop/rugs/<slug>. Type slugs come from rugTypeOptions, region slugs from RugRegion. */
  slug: string;
  /** "Pile (hand-knotted)" / "Tiflet". */
  name: string;
  /** Regions only: the parent region's slug (Tiflet → zemmour). */
  parentSlug?: string;
  /**
   * False for "Morocco" (region not known) and for a region whose old page
   * redirects (Beni M'Guild): a filter option, never a page or menu entry.
   */
  hasLandingPage: boolean;
};

/** Regions shown as a filter option only. */
const filterOnlyRegionSlugs = new Set(["morocco"]);

/**
 * Old /shop/rugs/<slug> pages that now live elsewhere. Exact page paths only:
 * rug URLs under the old segment (/shop/rugs/beni-m-guild/<slug>) stay put.
 * Mirrored by the permanent redirects in next.config.ts.
 */
export const retiredRugPageRedirects: Readonly<Record<string, string>> = {
  "beni-m-guild": "/shop/rugs/middle-atlas",
  vintage: "/shop/vintage",
};

/** Slugs a new region may not take: Type pages and other /shop/rugs/<slug> routes own them. */
export const reservedRugPageSlugs: ReadonlySet<string> = new Set([
  ...rugTypeOptions.map((option) => option.slug),
  ...Object.keys(retiredRugPageRedirects),
  "unclassified",
]);

/** Types in their fixed order, then regions: each top-level region (Morocco last) followed by its children. */
export function buildRugFacets(regions: readonly RugRegionSummary[]): RugFacet[] {
  const typeFacets: RugFacet[] = rugTypeOptions.map((option) => ({
    kind: "type",
    slug: option.slug,
    name: option.label,
    hasLandingPage: true,
  }));

  const byName = (left: RugRegionSummary, right: RugRegionSummary) => left.name.localeCompare(right.name);
  const topLevel = regions
    .filter((region) => !region.parent)
    .sort((left, right) => {
      const leftLast = filterOnlyRegionSlugs.has(left.slug) ? 1 : 0;
      const rightLast = filterOnlyRegionSlugs.has(right.slug) ? 1 : 0;

      return leftLast - rightLast || byName(left, right);
    });
  const regionFacets = topLevel.flatMap((region) => [
    region,
    ...regions.filter((child) => child.parent?.id === region.id).sort(byName),
  ]);

  return [
    ...typeFacets,
    ...regionFacets.map(
      (region): RugFacet => ({
        kind: "region",
        slug: region.slug,
        name: region.name,
        ...(region.parent ? { parentSlug: region.parent.slug } : {}),
        // Beni M'Guild's old page redirects to Middle Atlas: a filter option, no page of its own.
        hasLandingPage: !filterOnlyRegionSlugs.has(region.slug) && !(region.slug in retiredRugPageRedirects),
      }),
    ),
  ];
}

/** The facet slugs one rug falls under: its Type, its Region and the Region's parent. */
export function getRugFacetSlugs(rug: { rugType?: RugType; region?: RugRegionSummary }) {
  const typeSlug = rug.rugType ? rugTypeOptions.find((option) => option.value === rug.rugType)?.slug : undefined;
  const regionSlugs = rug.region ? [rug.region.slug, ...(rug.region.parent ? [rug.region.parent.slug] : [])] : [];

  return { typeSlug, regionSlugs };
}

/** Choosing a parent region includes its children: Zemmour matches a Tiflet rug. */
export function rugMatchesFacet(rug: { rugType?: RugType; region?: RugRegionSummary }, facet: RugFacet) {
  const { typeSlug, regionSlugs } = getRugFacetSlugs(rug);

  return facet.kind === "type" ? typeSlug === facet.slug : regionSlugs.includes(facet.slug);
}
