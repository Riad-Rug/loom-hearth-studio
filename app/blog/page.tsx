import type { Metadata } from "next";

import { BlogIndexPageView } from "@/features/blog/blog-index-page-view";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata: Metadata = buildMetadata({
  title: "Blog",
  description: "Editorial blog index for Loom & Hearth Studio.",
  path: "/blog",
});

export default function BlogPage() {
  return <BlogIndexPageView />;
}
