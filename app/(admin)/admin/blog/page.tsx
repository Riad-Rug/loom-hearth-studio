import { AdminBlogPageView } from "@/features/admin/admin-blog-page-view";
import { getAdminBlogPostsPageData } from "@/lib/admin/blog-posts";

export const dynamic = "force-dynamic";

export default async function AdminBlogPage() {
  const pageData = await getAdminBlogPostsPageData();

  return <AdminBlogPageView {...pageData} />;
}
