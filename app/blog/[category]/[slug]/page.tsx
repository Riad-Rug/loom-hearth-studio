import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { JsonLd } from "@/components/seo/json-ld";
import { BlogPostPageView } from "@/features/blog/blog-post-page-view";
import { getDefaultBlogAuthor } from "@/lib/blog/author";
import { getBlogPostByParams, getBlogPosts } from "@/lib/blog/posts";
import { buildManagedMetadata, buildMetadata } from "@/lib/seo/metadata";
import { articleSchema, breadcrumbSchema } from "@/lib/seo/schema";

type BlogPostPageProps = {
  params: Promise<{
    category: string;
    slug: string;
  }>;
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const resolvedParams = await params;
  const posts = await getBlogPosts();
  const post =
    posts.find(
      (candidate) =>
        candidate.categorySlug === resolvedParams.category && candidate.slug === resolvedParams.slug,
    ) ?? null;

  if (!post) {
    notFound();
  }

  // Related links must come from the same published set as the post itself, never from
  // the placeholder data in features/blog/blog-post-data.ts, which links to paths that
  // do not exist in production.
  const relatedPosts = posts.filter((candidate) => candidate.id !== post.id).slice(0, 2);
  const author = await getDefaultBlogAuthor();

  return (
    <>
      <JsonLd
        data={[
          articleSchema({
            title: post.title,
            description: post.excerpt,
            path: `/blog/${post.categorySlug}/${post.slug}`,
            publishedAt: post.publishedAt,
            imageUrl: post.images[0]?.src || null,
            author: author.name ? { name: author.name, photoUrl: author.photoUrl } : null,
          }),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "Blog", path: "/blog" },
            { name: post.categoryLabel, path: `/blog/${post.categorySlug}/${post.slug}` },
          ]),
        ]}
      />
      <BlogPostPageView author={author} post={post} relatedPosts={relatedPosts} />
    </>
  );
}

export async function generateMetadata({
  params,
}: BlogPostPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const post = await getBlogPostByParams(resolvedParams.category, resolvedParams.slug);

  if (!post) {
    return buildMetadata({
      title: "Blog",
      description: "Editorial blog index for Loom & Hearth Studio.",
      path: "/blog",
    });
  }

  return buildManagedMetadata({
    entityType: "blog_post",
    entityKey: post.id,
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    path: `/blog/${post.categorySlug}/${post.slug}`,
    type: "article",
  });
}
