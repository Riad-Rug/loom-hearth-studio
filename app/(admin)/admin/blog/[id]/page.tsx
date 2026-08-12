import { notFound } from "next/navigation";

import { updateAdminBlogPostAction } from "@/app/(admin)/admin/blog/actions";
import { AdminBlogPostEditor } from "@/features/admin/admin-blog-post-editor";
import { getAdminBlogPostFormPageData } from "@/lib/admin/blog-posts";

export const dynamic = "force-dynamic";

type AdminBlogPostDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminBlogPostDetailPage({
  params,
}: AdminBlogPostDetailPageProps) {
  const resolvedParams = await params;
  const pageData = await getAdminBlogPostFormPageData(resolvedParams.id);

  if (!pageData) {
    notFound();
  }

  return (
    <AdminBlogPostEditor
      action={updateAdminBlogPostAction.bind(null, resolvedParams.id)}
      description={pageData.description}
      mode="edit"
      post={pageData.post}
      title={pageData.title}
    />
  );
}
