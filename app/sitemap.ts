import type { MetadataRoute } from "next";

import { policyPages } from "@/features/content-pages/content-pages-data";
import {
  categoryHasPurchasableProducts,
  listIndexableRugFacetSlugs,
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
  // One clock for the whole file, so a sold rug and its style page cannot fall
  // on different sides of the index window within a single response.
  const now = new Date();
  const staticEntries = staticRoutes.map((path) => ({
    url: absoluteUrl(path),
  }));

  // Rug Type/Region and product pages follow lib/seo/index-policy.ts, the same rule
  // their robots tags read, so the policy never lists a page it noindexes. An
  // admin SEO setting with robotsIndex off is not read here and can still
  // noindex a listed page.
  const rugStyleEntries = [...(await listIndexableRugFacetSlugs(now))].sort().map((style) => ({
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

  const productSitemapEntries = await listProductSitemapEntries(now);
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
