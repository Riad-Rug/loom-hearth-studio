import { getAdminOrdersModuleData } from "@/lib/admin/orders";
import { AdminOrdersModuleView } from "@/features/admin/admin-orders-module-view";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const ordersModuleData = await getAdminOrdersModuleData();

  return (
    <AdminOrdersModuleView
      description={ordersModuleData.description}
      cards={ordersModuleData.cards}
      items={ordersModuleData.items}
    />
  );
}
