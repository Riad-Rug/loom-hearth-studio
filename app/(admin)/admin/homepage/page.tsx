import { AdminHomepageForm } from "@/features/admin/admin-homepage-form";
import { getHomepageContentState } from "@/lib/homepage/content";

export const dynamic = "force-dynamic";

export default async function AdminHomepagePage() {
  const pageData = await getHomepageContentState();

  return <AdminHomepageForm initialContent={pageData.content} source={pageData.source} />;
}
