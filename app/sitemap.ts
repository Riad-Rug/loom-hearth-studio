import type { MetadataRoute } from "next";

import { blogPosts } from "@/features/blog/blog-post-data";
import { policyPages } from "@/features/content-pages/content-pages-data";
import { listCatalogProductCards } from "@/lib/catalog/service";
import { absoluteUrl } from "@/lib/seo/metadata";

const staticRoutes = [
  "/",
  "/shop",
  "/shop/rugs",
  "/shop/poufs",
  "/shop/pillows",
  "/shop/decor",
  "/shop/vintage",
  "/blog",
  "/about",
  "/sourcing",
  "/trade",
  "/contact",
  "/faq",
  "/lookbook",
  "/accessibility-statement",
] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticEntries = staticRoutes.map((path) => ({
    url: absoluteUrl(path),
    changeFrequency: path === "/" || path === "/shop" ? "weekly" as const : "monthly" as const,
    priority: path === "/" ? 1 : path === "/shop" ? 0.9 : 0.7,
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.categorySlug}/${post.slug}`),
    lastModified: readValidLastModified(post.updatedAt),
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  const policyEntries = policyPages.map((page) => ({
    url: absoluteUrl(`/${page.slug}`),
    changeFrequency: "yearly" as const,
    priority: 0.4,
  }));

  const productCards = await listCatalogProductCards();
  const productEntries = productCards.map((product) => ({
    url: absoluteUrl(product.href),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  return [...staticEntries, ...blogEntries, ...policyEntries, ...productEntries];
}

function readValidLastModified(value: string) {
  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? undefined : date;
}
