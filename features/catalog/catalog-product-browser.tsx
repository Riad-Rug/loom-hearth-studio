"use client";

import { useEffect, useState } from "react";

import { ProductCard } from "@/features/catalog/product-card";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./catalog-page.module.css";

const initialVisibleProductCount = 15;
const showMoreProductCount = 10;

type CatalogProductBrowserProps = {
  products: CatalogProductCardViewModel[];
};

export function CatalogProductBrowser({ products }: CatalogProductBrowserProps) {
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(products.length, initialVisibleProductCount),
  );
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    setVisibleCount(Math.min(products.length, initialVisibleProductCount));
  }, [products]);

  useEffect(() => {
    function handleScroll() {
      setShowBackToTop(window.scrollY > 720);
    }

    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

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

      <a
        aria-hidden={!showBackToTop}
        aria-label="Back to top"
        className={`${styles.backToTopButton} ${
          showBackToTop ? styles.backToTopButtonVisible : ""
        }`}
        href="#shop-top"
        tabIndex={showBackToTop ? 0 : -1}
      >
        Top
      </a>
    </>
  );
}
