import { AdminRugRegionsPageView } from "@/features/admin/admin-rug-regions-page-view";
import { createRugRegionRepository } from "@/lib/db/repositories/rug-region-repository";

export const dynamic = "force-dynamic";

export default async function AdminRugRegionsPage() {
  const regions = await createRugRegionRepository().listWithUsage();

  return <AdminRugRegionsPageView regions={regions} />;
}
