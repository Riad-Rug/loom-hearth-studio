import { notFound } from "next/navigation";

import { updateAdminProductAction } from "@/app/(admin)/admin/products/actions";
import { AdminProductForm } from "@/features/admin/admin-product-form";
import { getAdminProductFormPageData } from "@/lib/admin/products";

export const dynamic = "force-dynamic";

type AdminProductDetailPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function AdminProductDetailPage({
  params,
}: AdminProductDetailPageProps) {
  const resolvedParams = await params;
  const pageData = await getAdminProductFormPageData(resolvedParams.id);

  if (!pageData) {
    notFound();
  }

  return (
    <AdminProductForm
      action={updateAdminProductAction.bind(null, resolvedParams.id)}
      description={pageData.description}
      mode="edit"
      product={pageData.product}
      title={pageData.title}
    />
  );
}
