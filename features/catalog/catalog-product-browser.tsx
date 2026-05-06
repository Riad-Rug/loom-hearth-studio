"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/features/catalog/product-card";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./catalog-page.module.css";

const initialVisibleProductCount = 20;
const showMoreProductCount = 10;

type CatalogProductBrowserProps = {
  products: CatalogProductCardViewModel[];
};

export function CatalogProductBrowser({ products }: CatalogProductBrowserProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(products.length, initialVisibleProductCount),
  );

  useEffect(() => {
    setVisibleCount(Math.min(products.length, initialVisibleProductCount));
  }, [products]);

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
