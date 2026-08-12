import type { Metadata } from "next";

import { BlogIndexPageView } from "@/features/blog/blog-index-page-view";
import { getBlogPostsState } from "@/lib/blog/posts";
import { buildManagedMetadata } from "@/lib/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "blog",
    title: "Blog",
    description:
      "Journal articles from Loom & Hearth Studio on Moroccan rugs, sourcing, interiors, and collected living.",
    path: "/blog",
  });
}

export default async function BlogPage() {
  const { posts } = await getBlogPostsState();

  return <BlogIndexPageView posts={posts} />;
}