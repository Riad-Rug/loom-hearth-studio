"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import Image from "next/image";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./home-page.module.css";

type ProductImage = NonNullable<CatalogProductCardViewModel["primaryImage"]>;

type LiveProductCardImageProps = {
  productName: string;
  primaryImage?: ProductImage;
  secondaryImage?: ProductImage;
};

// Mirrors the `.inventoryPage` grid in home-page.module.css: two columns below
// 1100px, four columns above it, capped by the 84rem page container at 1376px.
const inventoryCardSizes =
  "(max-width: 700px) calc(50vw - 38px), (max-width: 1100px) calc(50vw - 64px), (max-width: 1376px) calc(25vw - 36px), 308px";

function isRenderableImageSrc(value: string) {
  return value.startsWith("https://") || (value.startsWith("/") && !value.startsWith("//"));
}

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

  const showPrimaryImage = Boolean(
    primaryImage && isRenderableImageSrc(primaryImage.src) && !primaryImageFailed,
  );
  const showSecondaryImage = Boolean(
    showPrimaryImage &&
      secondaryImage &&
      primaryImage &&
      isRenderableImageSrc(secondaryImage.src) &&
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

  const handleImageLoad = (
    event: SyntheticEvent<HTMLImageElement>,
    setFailed: (value: boolean) => void,
  ) => {
    if (event.currentTarget.naturalWidth === 0) {
      handleImageError(event, setFailed);
    }
  };

  if (!showPrimaryImage || !primaryImage) {
    return (
      <PlaceholderMedia
        alt={`${productName} placeholder`}
        aspectRatio="4 / 5"
        label="Image coming soon"
        sizes={inventoryCardSizes}
      />
    );
  }

  return (
    <>
      <Image
        alt={primaryImage.altText || productName}
        className={`${styles.productImage} ${styles.liveProductImagePrimary}`}
        fill
        loading="lazy"
        onError={(event) => handleImageError(event, setPrimaryImageFailed)}
        onLoad={(event) => handleImageLoad(event, setPrimaryImageFailed)}
        sizes={inventoryCardSizes}
        src={primaryImage.src}
      />
      {showSecondaryImage && secondaryImage ? (
        <Image
          alt=""
          aria-hidden="true"
          className={`${styles.productImage} ${styles.liveProductImageSecondary}`}
          fill
          loading="lazy"
          onError={(event) => handleImageError(event, setSecondaryImageFailed)}
          onLoad={(event) => handleImageLoad(event, setSecondaryImageFailed)}
          sizes={inventoryCardSizes}
          src={secondaryImage.src}
        />
      ) : null}
    </>
  );
}
