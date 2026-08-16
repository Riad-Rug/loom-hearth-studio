"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/features/catalog/product-card";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./catalog-page.module.css";

const initialVisibleProductCount = 20;
const showMoreProductCount = 10;

type CatalogProductBrowserProps = {
  products: CatalogProductCardViewModel[];
  // Composite of every active filter (search query, category, price, size, sort,
  // hide-sold) so any filter change resets pagination. Built by the parent (see
  // `filterKey` in catalog-page-view.tsx).
  filterKey: string;
};

export function CatalogProductBrowser({ products, filterKey }: CatalogProductBrowserProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(products.length, initialVisibleProductCount),
  );

  // Key off filterKey rather than the `products` array's identity: the array gets a new
  // identity on every parent re-render (e.g. from an unrelated RSC refetch), which would
  // otherwise silently reset "Show More" progress even though the filters are unchanged.
  useEffect(() => {
    setVisibleCount(Math.min(products.length, initialVisibleProductCount));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterKey]);

  const visibleProducts = products.slice(0, visibleCount);
  const hasMoreProducts = visibleCount < products.length;

  return (
    <>
      <div className={styles.productGrid} id="shop-grid">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {hasMoreProducts ? (
        <div className={styles.loadMoreShell}>
          <button
            className={styles.secondaryAction}
            type="button"
            onClick={() =>
              setVisibleCount((currentCount) =>
                Math.min(products.length, currentCount + showMoreProductCount),
              )
            }
          >
            Show More Pieces
          </button>
          <p className={styles.loadMoreSummary}>
            Showing {visibleCount} of {products.length} pieces
          </p>
        </div>
      ) : null}
    </>
  );
}
