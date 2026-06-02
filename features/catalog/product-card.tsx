"use client";

import { useState, type SyntheticEvent } from "react";
import type { Route } from "next";
import Link from "next/link";

import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { getCategoryLabel } from "@/lib/catalog/helpers";

import styles from "./catalog-page.module.css";

type ProductCardProps = {
  product: CatalogProductCardViewModel;
};

export function ProductCard({ product }: ProductCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const [primaryImageLoaded, setPrimaryImageLoaded] = useState(false);
  const [secondaryImageFailed, setSecondaryImageFailed] = useState(false);
  const [secondaryImageLoaded, setSecondaryImageLoaded] = useState(false);
  const descriptor = getDescriptor(product.description, product.merchandisingNote);
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
        {product.type === "rug" ? (
          <span className={styles.productScarcityBadge}>One of a kind available now</span>
        ) : null}
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
            <div className={styles.productMediaOverlay} aria-hidden="true" />
            <div className={styles.productMetaOverlay} aria-hidden="true">
              <p className={styles.productOverlaySubtitle}>{product.subtitle}</p>
              {descriptor ? <p className={styles.productOverlaySummary}>{descriptor}</p> : null}
            </div>
          </>
        ) : (
          <div className={styles.productFallback}>
            <span className={styles.productFallbackNote}>Image coming soon</span>
          </div>
        )}
      </div>
      <div className={styles.productContent}>
        <div className={styles.productCardTopline}>
          <p className={styles.productCategory}>{getCategoryLabel(product.category)}</p>
          <span className={styles.productAvailability}>{product.availabilityLabel}</span>
        </div>
        <h3>{product.displayName}</h3>
        {product.dimensionsLabel ? (
          <p className={styles.productDimensions}>{product.dimensionsLabel}</p>
        ) : null}
        {descriptor ? <p className={styles.productDescriptor}>{descriptor}</p> : null}
        <p className={styles.productPrice}>{product.priceUsdLabel}</p>
      </div>
    </Link>
  );
}


function getDescriptor(description: string, merchandisingNote: string) {
  const candidates = [merchandisingNote, description]
    .map((value) => value.trim().replace(/\s+/g, " "))
    .filter(Boolean);

  for (const candidate of candidates) {
    const firstSentence = candidate.match(/.+?[.!?](?:\s|$)/)?.[0]?.trim() ?? candidate;

    if (!isUsefulDescriptor(firstSentence)) {
      continue;
    }

    return firstSentence.length > 110 ? `${firstSentence.slice(0, 107).trimEnd()}…` : firstSentence;
  }

  return null;
}

function isUsefulDescriptor(value: string) {
  const normalized = value.trim();

  if (normalized.length < 24) {
    return false;
  }

  if (!/[.!?,]/.test(normalized) && normalized === normalized.toLowerCase()) {
    return false;
  }

  return /wool|cotton|pile|woven|hand|rug|pouf|pillow|vessel|ceramic|Marrakech|Morocco|Atlas|room|sofa|shelf|table|floor/i.test(
    normalized,
  );
}

