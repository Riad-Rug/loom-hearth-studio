import type { Metadata } from "next";

import { BlogIndexPageView } from "@/features/blog/blog-index-page-view";
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

export default function BlogPage() {
  return <BlogIndexPageView />;
}