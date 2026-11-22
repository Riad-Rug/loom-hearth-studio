import { AdminProductsPageView } from "@/features/admin/admin-products-page-view";
import styles from "@/features/admin/admin.module.css";
import { getAdminProductsPageData } from "@/lib/admin/products";

export const dynamic = "force-dynamic";

type AdminProductsPageProps = {
  searchParams: Promise<{ held?: string; invalid?: string }>;
};

// `held` and `invalid` name pieces a bulk action or delete skipped; see
// productListNoticeRoute in ./actions.ts.
export default async function AdminProductsPage({ searchParams }: AdminProductsPageProps) {
  const [pageData, { held, invalid }] = await Promise.all([getAdminProductsPageData(), searchParams]);
  const heldNames = splitNames(held);
  const invalidNames = splitNames(invalid);

  return (
    <>
      {heldNames.length || invalidNames.length ? (
        <div className={styles.gatePanel} role="status">
          <strong>Some pieces were skipped</strong>
          {heldNames.length ? (
            <p>
              {heldNames.join(", ")}: reserved or held by an open order. Their status changes when that order is
              captured, cancelled, or expires.
            </p>
          ) : null}
          {invalidNames.length ? (
            <p>{invalidNames.join(", ")}: the listing is incomplete for that status. Open each one to see what it needs.</p>
          ) : null}
        </div>
      ) : null}
      <AdminProductsPageView {...pageData} />
    </>
  );
}

function splitNames(value: string | undefined) {
  return value ? value.split("|").filter(Boolean).slice(0, 20) : [];
}
