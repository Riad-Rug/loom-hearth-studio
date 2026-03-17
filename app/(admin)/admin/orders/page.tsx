import { getAdminOrdersModuleData } from "@/lib/admin/orders";
import { AdminModulePageView } from "@/features/admin/admin-module-page-view";
import { adminModules } from "@/features/admin/admin-data";

export default async function AdminOrdersPage() {
  const ordersModuleData = await getAdminOrdersModuleData();

  return (
    <AdminModulePageView
      moduleKey="orders"
      moduleOverride={{
        ...adminModules.orders,
        description: ordersModuleData.description,
        cards: ordersModuleData.cards,
      }}
    />
  );
}
