"use client";

import { useState, type SyntheticEvent } from "react";
import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./catalog-page.module.css";

/**
 * Rendered width of `.productMedia` in the shop grid, measured with Playwright
 * at 360/390/500/700/768/860/900/901/1000/1100/1150/1170/1176/1200/1300/1376/
 * 1440/1920px and fitted per breakpoint band. `.productGrid` is fluid
 * (`repeat(auto-fill, minmax(min(100%, 17rem), 1fr))`), so the bands are the
 * points where the column count actually changes rather than design breakpoints:
 *   - <=768px   2 cols, tight gutter      -> 50vw - 26px  (768 -> 358px)
 *   - <=900px   2 cols, wider gutter      -> 50vw - 30px  (900 -> 420px)
 *   - <=1175px  2 cols + 15.5rem sidebar  -> 50vw - 170px (1000 -> 330px)
 *   - <=1376px  3 cols (17rem floor fits) -> 33.33vw - 122px (1200 -> 278px)
 *   - above     3 cols, 84rem container caps the grid -> flat 337px
 */
const catalogCardSizes =
  "(max-width: 768px) calc(50vw - 26px), (max-width: 900px) calc(50vw - 30px), (max-width: 1175px) calc(50vw - 170px), (max-width: 1376px) calc(33.33vw - 122px), 337px";

/**
 * The PDP "similar rugs"/cross-sell rails use their own Tailwind grid
 * (`grid-cols-4 max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1`) inside the
 * same wide container, so the card is much wider on phones and much narrower on
 * desktop than in the shop grid. Measured the same way at 360/390/500/620/660/
 * 690/701/715/768/900/1000/1050/1090/1101/1120/1200/1376/1440/1920px.
 */
export const recommendationRailCardSizes =
  "(max-width: 700px) calc(100vw - 34px), (max-width: 1100px) calc(50vw - 26px), (max-width: 1376px) calc(25vw - 22px), 322px";

type ProductCardProps = {
  product: CatalogProductCardViewModel;
  /** Defaults to the shop-grid geometry; rails pass their own measured value. */
  sizes?: string;
};

export function ProductCard({ product, sizes = catalogCardSizes }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [primaryImageLoaded, setPrimaryImageLoaded] = useState(false);
  const [secondaryImageFailed, setSecondaryImageFailed] = useState(false);
  const [secondaryImageLoaded, setSecondaryImageLoaded] = useState(false);
  const primaryImage = product.primaryImage;
  const secondaryImage = product.secondaryImage;
  const showImage = primaryImage !== undefined && !imageFailed;
  const showSecondaryImage =
    showImage &&
    secondaryImage !== undefined &&
    secondaryImage.publicId !== primaryImage.publicId &&
    !secondaryImageFailed;

  const handlePrimaryImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.alt = "";
    event.currentTarget.style.display = "none";
    setImageFailed(true);
  };

  const handleSecondaryImageError = (event: SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.alt = "";
    event.currentTarget.style.display = "none";
    setSecondaryImageFailed(true);
  };

  return (
    <Link className={styles.productCard} href={product.href as Route}>
      <div className={styles.productMedia}>
        {showImage ? (
          <>
            <Image
              alt={primaryImage.altText || product.name}
              className={`${styles.productImage} ${styles.productImagePrimary} ${
                primaryImageLoaded ? styles.productImageLoaded : ""
              }`}
              fill
              loading="lazy"
              onError={handlePrimaryImageError}
              onLoad={() => setPrimaryImageLoaded(true)}
              sizes={sizes}
              src={primaryImage.src}
            />
            {showSecondaryImage ? (
              <Image
                alt=""
                aria-hidden="true"
                className={`${styles.productImage} ${styles.productImageSecondary} ${
                  secondaryImageLoaded ? styles.productImageLoaded : ""
                }`}
                fill
                loading="lazy"
                onError={handleSecondaryImageError}
                onLoad={() => setSecondaryImageLoaded(true)}
                sizes={sizes}
                src={secondaryImage.src}
              />
            ) : null}
          </>
        ) : (
          <PlaceholderMedia
            alt={`${product.name} placeholder`}
            aspectRatio="4 / 5"
            label="Photo pending"
            sizes={sizes}
          />
        )}
      </div>
      <div className={styles.productContent}>
        <div className={styles.productTitleRow}>
          <h3>{product.displayName}</h3>
          {product.status === "sold" ? (
            <span className={styles.productMonoBadge}>SOLD</span>
          ) : null}
        </div>
        <p className={styles.productDimensions}>{product.subtitle}</p>
        <p className={styles.productPrice}>{product.priceUsdLabel}</p>
      </div>
    </Link>
  );
}

