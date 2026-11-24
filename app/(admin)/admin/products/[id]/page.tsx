import { notFound } from "next/navigation";

import { updateAdminProductAction } from "@/app/(admin)/admin/products/actions";
import { AdminProductForm } from "@/features/admin/admin-product-form";
import { createRugRegionRepository } from "@/lib/db/repositories/rug-region-repository";
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
  const [pageData, regions] = await Promise.all([
    getAdminProductFormPageData(resolvedParams.id),
    createRugRegionRepository().listAll(),
  ]);

  if (!pageData) {
    notFound();
  }

  return (
    <AdminProductForm
      action={updateAdminProductAction.bind(null, resolvedParams.id, pageData.loaded)}
      description={pageData.description}
      heldByOrderNumber={pageData.heldByOrderNumber}
      mode="edit"
      product={pageData.product}
      regions={regions}
      title={pageData.title}
    />
  );
}
