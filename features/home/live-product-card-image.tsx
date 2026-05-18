"use client";

import { useEffect, useState, type SyntheticEvent } from "react";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./home-page.module.css";

type ProductImage = NonNullable<CatalogProductCardViewModel["primaryImage"]>;

type LiveProductCardImageProps = {
  productName: string;
  primaryImage?: ProductImage;
  secondaryImage?: ProductImage;
};

export function LiveProductCardImage({
  productName,
  primaryImage,
  secondaryImage,
}: LiveProductCardImageProps) {
  const [primaryImageFailed, setPrimaryImageFailed] = useState(false);
  const [secondaryImageFailed, setSecondaryImageFailed] = useState(false);

  useEffect(() => {
    setPrimaryImageFailed(false);
    setSecondaryImageFailed(false);
  }, [primaryImage?.src, secondaryImage?.src]);

  const showPrimaryImage = Boolean(primaryImage && !primaryImageFailed);
  const showSecondaryImage = Boolean(
    showPrimaryImage &&
      secondaryImage &&
      primaryImage &&
      secondaryImage.publicId !== primaryImage.publicId &&
      !secondaryImageFailed,
  );

  const handleImageError = (
    event: SyntheticEvent<HTMLImageElement>,
    setFailed: (value: boolean) => void,
  ) => {
    event.currentTarget.alt = "";
    event.currentTarget.style.display = "none";
    setFailed(true);
  };

  if (!showPrimaryImage || !primaryImage) {
    return (
      <PlaceholderMedia
        alt={`${productName} placeholder`}
        aspectRatio="4 / 5"
        label="Image coming soon"
        sizes="(max-width: 768px) 86vw, (max-width: 1100px) 42vw, 21vw"
      />
    );
  }

  return (
    <>
      <img
        alt={primaryImage.altText || productName}
        className={`${styles.productImage} ${styles.liveProductImagePrimary}`}
        loading="lazy"
        onError={(event) => handleImageError(event, setPrimaryImageFailed)}
        src={primaryImage.src}
      />
      {showSecondaryImage && secondaryImage ? (
        <img
          alt=""
          aria-hidden="true"
          className={`${styles.productImage} ${styles.liveProductImageSecondary}`}
          loading="lazy"
          onError={(event) => handleImageError(event, setSecondaryImageFailed)}
          src={secondaryImage.src}
        />
      ) : null}
    </>
  );
}
