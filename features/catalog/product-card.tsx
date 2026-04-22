"use client";

import { useState } from "react";
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

  return (
    <Link className={styles.productCard} href={product.href as Route}>
      <div className={styles.productMedia}>
        {product.type === "rug" ? (
          <span className={styles.productScarcityBadge}>1 of 1 Available now</span>
        ) : null}
        {showImage ? (
          <>
            <img
              alt={primaryImage.altText || product.name}
              className={`${styles.productImage} ${styles.productImagePrimary} ${
                primaryImageLoaded ? styles.productImageLoaded : ""
              }`}
              loading="lazy"
              onError={() => setImageFailed(true)}
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
                onError={() => setSecondaryImageFailed(true)}
                onLoad={() => setSecondaryImageLoaded(true)}
                src={secondaryImage.src}
              />
            ) : null}
            <div className={styles.productMediaOverlay} aria-hidden="true" />
          </>
        ) : (
          <div className={styles.productFallback}>
            <span className={styles.productFallbackNote}>Image coming soon</span>
          </div>
        )}
      </div>
      <div className={styles.productContent}>
        <p className={styles.productCategory}>{getCategoryLabel(product.category)}</p>
        <h3>{product.name}</h3>
        <p className={styles.productPrice}>{product.priceUsdLabel}</p>
        <p className={styles.productSubtitle}>{product.subtitle}</p>
        <p className={styles.productSummary}>{descriptor}</p>
      </div>
    </Link>
  );
}


function getDescriptor(description: string, merchandisingNote: string) {
  const candidate = description.trim() || merchandisingNote.trim();
  const normalized = candidate.replace(/\s+/g, " ");
  const firstSentence = normalized.match(/.+?[.!?](?:\s|$)/)?.[0] ?? normalized;

  return firstSentence.length > 110 ? `${firstSentence.slice(0, 107).trimEnd()}...` : firstSentence;
}
