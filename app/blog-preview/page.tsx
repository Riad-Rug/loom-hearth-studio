import type { Metadata } from "next";

import { getDefaultBlogAuthor } from "@/lib/blog/author";
import { requireAuthenticatedAdminUser } from "@/lib/auth/service";

import { BlogPreviewClient } from "./preview-client";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function BlogPreviewPage() {
  await requireAuthenticatedAdminUser();

  const author = await getDefaultBlogAuthor();

  return <BlogPreviewClient author={author} />;
}
