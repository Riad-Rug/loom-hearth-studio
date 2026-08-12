import { AdminBlogAuthorForm } from "@/features/admin/admin-blog-author-form";
import { getDefaultBlogAuthorState } from "@/lib/blog/author";

export const dynamic = "force-dynamic";

export default async function AdminBlogAuthorPage() {
  const authorState = await getDefaultBlogAuthorState();

  return (
    <AdminBlogAuthorForm
      initialAuthor={authorState.author}
      source={authorState.source}
    />
  );
}
