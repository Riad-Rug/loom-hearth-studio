import type { Metadata } from "next";

import { BlogIndexPageView } from "@/features/blog/blog-index-page-view";
import { getBlogPostsState } from "@/lib/blog/posts";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "blog",
    title: "Moroccan Rug Guides & Sourcing Stories",
    description:
      "Guides to Beni Ourain, Azilal and kilim rugs, care, sizing and sourcing stories from Morocco.",
    path: "/blog",
  });
}

export default async function BlogPage() {
  const { posts } = await getBlogPostsState();

  return <BlogIndexPageView posts={posts} />;
}