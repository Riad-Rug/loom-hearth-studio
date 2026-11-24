import { createAdminProductAction } from "@/app/(admin)/admin/products/actions";
import { AdminProductForm } from "@/features/admin/admin-product-form";
import { createRugRegionRepository } from "@/lib/db/repositories/rug-region-repository";
import { getNewAdminProductFormPageData } from "@/lib/admin/products";

export const dynamic = "force-dynamic";

type NewAdminProductPageProps = {
  searchParams: Promise<{
    type?: string;
  }>;
};

export default async function NewAdminProductPage({ searchParams }: NewAdminProductPageProps) {
  const resolvedSearchParams = await searchParams;
  const requestedType =
    resolvedSearchParams.type === "multiUnit" ? "multiUnit" : "rug";
  const pageData = getNewAdminProductFormPageData(requestedType);
  const regions = await createRugRegionRepository().listAll();

  return (
    <AdminProductForm
      action={createAdminProductAction}
      description={pageData.description}
      mode="create"
      product={pageData.product}
      regions={regions}
      title={pageData.title}
    />
  );
}
