import type { MetadataRoute } from "next";

import { policyPages } from "@/features/content-pages/content-pages-data";
import { getRugStyleCollection } from "@/features/catalog/rug-style-collections";
import {
  categoryHasPurchasableProducts,
  listAvailableRugStyleSlugs,
  listProductSitemapEntries,
} from "@/lib/catalog/service";
import { getBlogPostsState } from "@/lib/blog/posts";
import { absoluteUrl } from "@/lib/seo/metadata";

const staticRoutes = [
  "/",
  "/shop",
  "/shop/rugs",
  "/shop/vintage",
  "/shop/poufs",
  "/shop/pillows",
  "/blog",
  "/about",
  "/trade",
  "/contact",
  "/faq",
] as const;

// priority and changeFrequency are deliberately absent from every entry below:
// Google has stated it ignores both, so they are pure boilerplate here. Only
// url and (where a real timestamp exists) lastModified are emitted.
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticRoutes.map((path) => ({
    url: absoluteUrl(path),
  }));

  // Rug-style category routes are listed live rather than hardcoded: the pages
  // exist for every canonical style, but a style with nothing purchasable right
  // now is served noindex (see app/shop/rugs/[style]/page.tsx), so it must not
  // be advertised here either. Styles without a collection entry — "Unclassified"
  // is the admin catch-all — have no page to point at.
  const rugStyleEntries = [...(await listAvailableRugStyleSlugs())]
    .filter((style) => getRugStyleCollection(style))
    .sort()
    .map((style) => ({
      url: absoluteUrl(`/shop/rugs/${style}`),
    }));

  // /shop/decor gets the same treatment for the same reason, which is why it is
  // not in staticRoutes above: the page is served noindex while decor has nothing
  // purchasable (see app/shop/decor/page.tsx), and submitting a noindex URL here
  // is what Search Console reports as "Submitted URL marked noindex". Both sides
  // read categoryHasPurchasableProducts, so the entry reappears by itself as soon
  // as decor is stocked. The other category landings are always-on stock lines and
  // stay hardcoded.
  const decorEntries = (await categoryHasPurchasableProducts("decor"))
    ? [{ url: absoluteUrl("/shop/decor") }]
    : [];

  const { posts: blogPosts } = await getBlogPostsState();
  const blogEntries = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.categorySlug}/${post.slug}`),
    lastModified: readValidLastModified(post.updatedAt),
  }));

  const policyEntries = policyPages.map((page) => ({
    url: absoluteUrl(`/${page.slug}`),
  }));

  const productSitemapEntries = await listProductSitemapEntries();
  const productEntries = productSitemapEntries.map((product) => ({
    url: absoluteUrl(product.href),
    lastModified: product.updatedAt,
  }));

  return [
    ...staticEntries,
    ...decorEntries,
    ...rugStyleEntries,
    ...blogEntries,
    ...policyEntries,
    ...productEntries,
  ];
}

function readValidLastModified(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
