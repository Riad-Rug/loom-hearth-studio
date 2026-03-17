import { getAdminCustomersModuleData } from "@/lib/admin/customers";
import { AdminModulePageView } from "@/features/admin/admin-module-page-view";
import { adminModules } from "@/features/admin/admin-data";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const customersModuleData = await getAdminCustomersModuleData();

  return (
    <AdminModulePageView
      moduleKey="customers"
      moduleOverride={{
        ...adminModules.customers,
        description: customersModuleData.description,
        cards: customersModuleData.cards,
      }}
    />
  );
}
