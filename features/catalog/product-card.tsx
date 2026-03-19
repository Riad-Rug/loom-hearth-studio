"use client";

import { useState } from "react";
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
  const descriptor = getDescriptor(product.description, product.merchandisingNote);
  const primaryImage = product.primaryImage;
  const showImage = primaryImage !== undefined && !imageFailed;

  return (
    <Link className={styles.productCard} href={product.href as Route}>
      <div className={styles.productMedia}>
        {showImage ? (
          <>
            <img
              alt={primaryImage.altText || product.name}
              className={styles.productImage}
              loading="lazy"
              onError={() => setImageFailed(true)}
              src={primaryImage.src}
            />
            <div className={styles.productMediaOverlay} aria-hidden="true" />
          </>
        ) : (
          <div className={styles.productFallback}>
            <PlaceholderMedia
              alt={product.name}
              aspectRatio="4 / 5"
              label="Loom & Hearth"
              sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
            />
            <div className={styles.productFallbackCopy}>
              <span className={styles.productFallbackEyebrow}>{formatCategory(product.category)}</span>
              <strong className={styles.productFallbackTitle}>{product.name}</strong>
              <span className={styles.productFallbackNote}>Studio image coming soon</span>
            </div>
          </div>
        )}
      </div>
      <div className={styles.productContent}>
        <p className={styles.productCategory}>{formatCategory(product.category)}</p>
        <h3>{product.name}</h3>
        <p className={styles.productPrice}>{product.priceUsdLabel}</p>
        <p className={styles.productSummary}>{descriptor}</p>
      </div>
    </Link>
  );
}

function formatCategory(category: string) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function getDescriptor(description: string, merchandisingNote: string) {
  const candidate = description.trim() || merchandisingNote.trim();
  const normalized = candidate.replace(/\s+/g, " ");
  const firstSentence = normalized.match(/.+?[.!?](?:\s|$)/)?.[0] ?? normalized;

  return firstSentence.length > 110 ? `${firstSentence.slice(0, 107).trimEnd()}...` : firstSentence;
}