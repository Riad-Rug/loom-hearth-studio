"use client";

import { useState, type SyntheticEvent } from "react";
import type { Route } from "next";
import Link from "next/link";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./catalog-page.module.css";

type ProductCardProps = {
  product: CatalogProductCardViewModel;
};

export function ProductCard({ product }: ProductCardProps) {
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
            <img
              alt={primaryImage.altText || product.name}
              className={`${styles.productImage} ${styles.productImagePrimary} ${
                primaryImageLoaded ? styles.productImageLoaded : ""
              }`}
              loading="lazy"
              onError={handlePrimaryImageError}
              onLoad={() => setPrimaryImageLoaded(true)}
              src={primaryImage.src}
            />
            {showSecondaryImage ? (
              <img
                alt=""
                aria-hidden="true"
                className={`${styles.productImage} ${styles.productImageSecondary} ${
                  secondaryImageLoaded ? styles.productImageLoaded : ""
                }`}
                loading="lazy"
                onError={handleSecondaryImageError}
                onLoad={() => setSecondaryImageLoaded(true)}
                src={secondaryImage.src}
              />
            ) : null}
          </>
        ) : (
          <PlaceholderMedia
            alt={`${product.name} placeholder`}
            aspectRatio="4 / 5"
            label="Photo pending"
            sizes="(max-width: 700px) 100vw, (max-width: 1100px) 50vw, 25vw"
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

