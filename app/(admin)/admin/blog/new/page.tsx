import { createAdminBlogPostAction } from "@/app/(admin)/admin/blog/actions";
import { AdminBlogPostEditor } from "@/features/admin/admin-blog-post-editor";
import { getNewAdminBlogPostFormPageData } from "@/lib/admin/blog-posts";

export const dynamic = "force-dynamic";

export default function NewAdminBlogPostPage() {
  const pageData = getNewAdminBlogPostFormPageData();

  return (
    <AdminBlogPostEditor
      action={createAdminBlogPostAction}
      description={pageData.description}
      mode="create"
      post={pageData.post}
      title={pageData.title}
    />
  );
}
