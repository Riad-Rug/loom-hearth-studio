import { unstable_noStore as noStore } from "next/cache";

import {
  DEFAULT_BLOG_AUTHOR,
  sanitizeBlogAuthor,
} from "@/features/blog/blog-author-data";
import { createBlogAuthorRepository } from "@/lib/db/repositories/blog-author-repository";
import type { BlogAuthor } from "@/types/domain";

export async function getDefaultBlogAuthorState(): Promise<{
  author: BlogAuthor;
  source: "database" | "defaults";
  updatedAt: Date | null;
}> {
  noStore();

  const record = await createBlogAuthorRepository().get();

  if (!record) {
    return {
      author: DEFAULT_BLOG_AUTHOR,
      source: "defaults",
      updatedAt: null,
    };
  }

  return {
    author: sanitizeBlogAuthor(record.content),
    source: "database",
    updatedAt: record.updatedAt,
  };
}

export async function getDefaultBlogAuthor() {
  return (await getDefaultBlogAuthorState()).author;
}

export async function saveDefaultBlogAuthor(author: BlogAuthor) {
  await createBlogAuthorRepository().save(author);
}
