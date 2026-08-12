import { unstable_noStore as noStore } from "next/cache";

import { blogPosts as defaultBlogPosts, type BlogPostRecord } from "@/features/blog/blog-post-data";
import { createBlogPostRepository } from "@/lib/db/repositories/blog-post-repository";

export async function getBlogPostsState(): Promise<{
  posts: BlogPostRecord[];
  source: "database" | "defaults";
}> {
  noStore();

  const posts = await createBlogPostRepository().listPublished();

  if (posts.length === 0) {
    return {
      posts: defaultBlogPosts,
      source: "defaults",
    };
  }

  return {
    posts,
    source: "database",
  };
}

export async function getBlogPosts() {
  return (await getBlogPostsState()).posts;
}

export async function getBlogPostByParams(categorySlug: string, slug: string) {
  const { posts } = await getBlogPostsState();

  return posts.find((post) => post.categorySlug === categorySlug && post.slug === slug) ?? null;
}
