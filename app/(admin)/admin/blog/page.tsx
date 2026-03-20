import { AdminBlogPageView } from "@/features/admin/admin-blog-page-view";
import { AdminBlogAuthorForm } from "@/features/admin/admin-blog-author-form";
import { getDefaultBlogAuthorState } from "@/lib/blog/author";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const authorState = await getDefaultBlogAuthorState();

  return (
    <>
      <AdminBlogAuthorForm
        initialAuthor={authorState.author}
        source={authorState.source}
      />
      <AdminBlogPageView />
    </>
  );
}
