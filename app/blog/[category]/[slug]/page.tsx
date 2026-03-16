import { notFound } from "next/navigation";

import { BlogPostPageView } from "@/features/blog/blog-post-page-view";
import { getBlogPostByParams } from "@/features/blog/blog-post-data";

type BlogPostPageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const post = getBlogPostByParams(resolvedParams.category, resolvedParams.slug);

  if (!post) {
    notFound();
  }

  return <BlogPostPageView post={post} />;
}
