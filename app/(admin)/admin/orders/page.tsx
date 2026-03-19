import { AdminOrdersModuleView } from "@/features/admin/admin-orders-module-view";
import { getAdminOrdersModuleData } from "@/lib/admin/orders";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  const ordersModuleData = await getAdminOrdersModuleData();

  return <AdminOrdersModuleView {...ordersModuleData} />;
}