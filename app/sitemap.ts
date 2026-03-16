import type { MetadataRoute } from "next";

import { blogPosts } from "@/features/blog/blog-post-data";
import { policyPages } from "@/features/content-pages/content-pages-data";
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
  "/contact",
  "/faq",
  "/lookbook",
  "/testimonials",
];

export default function sitemap(): MetadataRoute.Sitemap {
  const staticEntries = staticRoutes.map((path) => ({
    url: absoluteUrl(path),
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: absoluteUrl(`/blog/${post.categorySlug}/${post.slug}`),
  }));

  const policyEntries = policyPages.map((page) => ({
    url: absoluteUrl(`/${page.slug}`),
  }));

  return [...staticEntries, ...blogEntries, ...policyEntries];
}
