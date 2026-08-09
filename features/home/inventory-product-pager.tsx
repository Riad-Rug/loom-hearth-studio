"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { Route } from "next";

import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { ArrowIcon } from "@/components/icons/arrow-icon";

import { LiveProductCardImage } from "./live-product-card-image";
import styles from "./home-page.module.css";

type InventoryProductPagerProps = {
  products: CatalogProductCardViewModel[];
  pageSize?: number;
};

function chunk<T>(items: T[], size: number): T[][] {
  const result: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    result.push(items.slice(i, i + size));
  }
  return result;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function InventoryProductPager({ products, pageSize = 8 }: InventoryProductPagerProps) {
  const pages = chunk(products, pageSize);
  const [activeIndex, setActiveIndex] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const trackElement = trackRef.current;
    if (!trackElement) return;

    function handleScroll() {
      const currentTrack = trackRef.current;
      if (!currentTrack) return;
      const nextIndex = Math.round(currentTrack.scrollLeft / Math.max(currentTrack.clientWidth, 1));
      setActiveIndex((currentIndex) => (currentIndex === nextIndex ? currentIndex : nextIndex));
    }

    trackElement.addEventListener("scroll", handleScroll, { passive: true });
    return () => trackElement.removeEventListener("scroll", handleScroll);
  }, []);

  if (!products.length) {
    return null;
  }

  function goToPage(index: number) {
    const track = trackRef.current;
    if (!track) return;
    const nextIndex = Math.min(Math.max(index, 0), pages.length - 1);
    track.scrollTo({
      left: track.clientWidth * nextIndex,
      behavior: prefersReducedMotion() ? "auto" : "smooth",
    });
    setActiveIndex(nextIndex);
  }

  function handleTrackKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToPage(activeIndex - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      goToPage(activeIndex + 1);
    } else if (event.key === "Home") {
      event.preventDefault();
      goToPage(0);
    } else if (event.key === "End") {
      event.preventDefault();
      goToPage(pages.length - 1);
    }
  }

  const rangeStart = activeIndex * pageSize + 1;
  const rangeEnd = Math.min((activeIndex + 1) * pageSize, products.length);

  return (
    <div role="group" aria-roledescription="carousel" aria-label="In the warehouse now">
      <div
        ref={trackRef}
        className={styles.inventoryTrack}
        role="group"
        aria-label="Inventory pages"
        tabIndex={0}
        onKeyDown={handleTrackKeyDown}
      >
        {pages.map((page, pageIndex) => (
          <div
            key={pageIndex}
            className={styles.inventoryPage}
            role="group"
            aria-roledescription="slide"
            aria-label={`Page ${pageIndex + 1} of ${pages.length}`}
          >
            {page.map((product) => (
              <Link key={product.id} className={styles.productCard} href={product.href as Route}>
                <div className={styles.productImageWrap}>
                  <LiveProductCardImage
                    primaryImage={product.primaryImage}
                    productName={product.name}
                    secondaryImage={product.secondaryImage}
                  />
                </div>
                <div className={styles.productMeta}>
                  <div className={styles.productTitleRow}>
                    <h3>{product.displayName}</h3>
                    {product.status === "sold" ? (
                      <span className={styles.productBadge}>SOLD</span>
                    ) : null}
                  </div>
                  <p className={styles.productSubtitle}>{product.subtitle}</p>
                  <p className={styles.productPrice}>{product.priceUsdLabel}</p>
                </div>
              </Link>
            ))}
          </div>
        ))}
      </div>

      {pages.length > 1 ? (
        <div className={styles.inventoryControls}>
          <p className={styles.inventoryCounter} aria-live="polite">
            Pieces {rangeStart}–{rangeEnd} of {products.length}
          </p>
          <div className={styles.inventoryDots} aria-label="Inventory page">
            {pages.map((_, pageIndex) => (
              <button
                key={pageIndex}
                type="button"
                className={`${styles.inventoryDot} ${pageIndex === activeIndex ? styles.inventoryDotActive : ""}`}
                aria-label={`Show pieces ${pageIndex * pageSize + 1}–${Math.min((pageIndex + 1) * pageSize, products.length)}`}
                aria-current={pageIndex === activeIndex ? "true" : undefined}
                onClick={() => goToPage(pageIndex)}
              />
            ))}
          </div>
          <div className={styles.inventoryArrows}>
            <button
              type="button"
              className={styles.inventoryArrow}
              aria-label="Show previous 8 pieces"
              disabled={activeIndex === 0}
              onClick={() => goToPage(activeIndex - 1)}
            >
              <ArrowIcon direction="left" />
            </button>
            <button
              type="button"
              className={styles.inventoryArrow}
              aria-label="Show next 8 pieces"
              disabled={activeIndex === pages.length - 1}
              onClick={() => goToPage(activeIndex + 1)}
            >
              <ArrowIcon direction="right" />
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
