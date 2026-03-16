import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { BlogPostPageView } from "@/features/blog/blog-post-page-view";
import { getBlogPostByParams } from "@/features/blog/blog-post-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schema";

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

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.excerpt,
            path: `/blog/${post.categorySlug}/${post.slug}`,
            publishedAt: post.publishedAt,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.categoryLabel, path: `/blog/${post.categorySlug}/${post.slug}` },
          ]),
        ]}
      />
      <BlogPostPageView post={post} />
    </>
  );
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = getBlogPostByParams(resolvedParams.category, resolvedParams.slug);

  if (!post) {
    return buildMetadata({
      title: "Blog",
      description: "Editorial blog index for Loom & Hearth Studio.",
      path: "/blog",
    });
  }

  return buildMetadata({
    title: post.title,
    description: post.excerpt,
    path: `/blog/${post.categorySlug}/${post.slug}`,
    type: "article",
  });
}
