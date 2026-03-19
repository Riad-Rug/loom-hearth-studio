"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { Section } from "@/components/layout/section";
import type { MultiUnitProductDetailPageViewModel, ProductDetailPageViewModel } from "@/lib/catalog/contracts";
import { useCart } from "@/features/cart/cart-provider";

import styles from "./product-detail-page.module.css";

type ProductDetailPageViewProps = {
  product: ProductDetailPageViewModel;
};

export function ProductDetailPageView({ product }: ProductDetailPageViewProps) {
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setIsLightboxOpen(false);
  }, [product.id]);

  useEffect(() => {
    if (!isLightboxOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsLightboxOpen(false);
      }

      if (event.key === "ArrowRight") {
        setActiveImageIndex((currentIndex) =>
          product.gallery.length ? (currentIndex + 1) % product.gallery.length : 0,
        );
      }

      if (event.key === "ArrowLeft") {
        setActiveImageIndex((currentIndex) =>
          product.gallery.length
            ? (currentIndex - 1 + product.gallery.length) % product.gallery.length
            : 0,
        );
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isLightboxOpen, product.gallery.length]);

  const activeImage = product.gallery[activeImageIndex] ?? product.gallery[0] ?? null;
  const valueLine = createProductValueLine(product);

  function selectImage(index: number) {
    setActiveImageIndex(index);
  }

  function showPreviousImage() {
    setActiveImageIndex((currentIndex) =>
      product.gallery.length
        ? (currentIndex - 1 + product.gallery.length) % product.gallery.length
        : 0,
    );
  }

  function showNextImage() {
    setActiveImageIndex((currentIndex) =>
      product.gallery.length ? (currentIndex + 1) % product.gallery.length : 0,
    );
  }

  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.layout}>
          <div className={styles.galleryColumn}>
            <button
              className={styles.primaryMediaButton}
              type="button"
              onClick={() => setIsLightboxOpen(true)}
            >
              <div className={styles.primaryMedia}>
                {activeImage ? (
                  <img
                    key={activeImage.id}
                    alt={activeImage.altText || product.name}
                    src={activeImage.src}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                ) : (
                  <PlaceholderMedia
                    alt={product.name}
                    aspectRatio="4 / 3"
                    label={product.type === "rug" ? "Rug gallery" : "Product gallery"}
                    priority
                    sizes="(max-width: 1100px) 100vw, 55vw"
                  />
                )}
              </div>
            </button>
            <div className={styles.thumbnailGrid}>
              {product.gallery.map((item, index) => (
                <button
                  key={item.id}
                  className={`${styles.thumbnailCard} ${
                    activeImageIndex === index ? styles.thumbnailCardActive : ""
                  }`}
                  type="button"
                  aria-pressed={activeImageIndex === index}
                  onClick={() => selectImage(index)}
                >
                  <img
                    className={styles.thumbnailImage}
                    alt={item.altText || `${product.name} ${item.label}`}
                    src={item.src}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className={styles.infoColumn}>
            <p className={styles.eyebrow}>
              {product.type === "rug" ? "Type A rug" : "Type B multi-unit"}
            </p>
            <div className={styles.titleBlock}>
              <h1>{product.name}</h1>
              <p className={styles.valueLine}>{valueLine}</p>
            </div>
            <p className={styles.price}>{product.priceUsdLabel}</p>

            {product.type === "rug" ? (
              <RugPurchaseShell product={product} quantityLabel={product.quantityLabel} />
            ) : (
              <MultiUnitPurchaseShell product={product} />
            )}

            <p className={styles.summary}>{product.description}</p>

            <div className={styles.metaGrid}>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Materials</span>
                <p className={styles.metaValue}>{product.materialsLabel}</p>
              </div>
              <div className={styles.metaItem}>
                <span className={styles.metaLabel}>Origin</span>
                <p className={styles.metaValue}>{product.originLabel}</p>
              </div>
              {product.type === "rug" ? (
                <>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Dimensions</span>
                    <p className={styles.metaValue}>{product.dimensionsLabel}</p>
                  </div>
                  <div className={styles.metaItem}>
                    <span className={styles.metaLabel}>Weight</span>
                    <p className={styles.metaValue}>{product.weightLabel}</p>
                  </div>
                </>
              ) : (
                <MultiUnitMeta product={product} />
              )}
            </div>

            <div className={styles.shareBlock}>
              <span className={styles.metaLabel}>Share</span>
              <div className={styles.shareList}>
                {product.sharePlatforms.map((item) => (
                  <button key={item} className={styles.shareButton} type="button">
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Section>

      {isLightboxOpen && activeImage ? (
        <div
          className={styles.lightbox}
          role="dialog"
          aria-modal="true"
          aria-label={`${product.name} image viewer`}
          onClick={() => setIsLightboxOpen(false)}
        >
          <div className={styles.lightboxPanel} onClick={(event) => event.stopPropagation()}>
            <div className={styles.lightboxToolbar}>
              <p className={styles.lightboxCaption}>
                {activeImage.altText || `${product.name} image ${activeImageIndex + 1}`}
              </p>
              <button
                className={styles.lightboxClose}
                type="button"
                onClick={() => setIsLightboxOpen(false)}
              >
                Close
              </button>
            </div>

            <div className={styles.lightboxStage}>
              {product.gallery.length > 1 ? (
                <button
                  className={styles.lightboxNav}
                  type="button"
                  aria-label="Show previous image"
                  onClick={showPreviousImage}
                >
                  Prev
                </button>
              ) : null}

              <div className={styles.lightboxMedia}>
                <img
                  key={`${activeImage.id}-lightbox`}
                  alt={activeImage.altText || product.name}
                  src={activeImage.src}
                  style={{ width: "100%", height: "100%", objectFit: "contain", display: "block" }}
                />
              </div>

              {product.gallery.length > 1 ? (
                <button
                  className={styles.lightboxNav}
                  type="button"
                  aria-label="Show next image"
                  onClick={showNextImage}
                >
                  Next
                </button>
              ) : null}
            </div>

            {product.gallery.length > 1 ? (
              <div className={styles.lightboxThumbnails}>
                {product.gallery.map((item, index) => (
                  <button
                    key={`${item.id}-lightbox-thumb`}
                    className={`${styles.thumbnailCard} ${
                      activeImageIndex === index ? styles.thumbnailCardActive : ""
                    }`}
                    type="button"
                    aria-pressed={activeImageIndex === index}
                    onClick={() => selectImage(index)}
                  >
                    <img
                      className={styles.thumbnailImage}
                      alt={item.altText || `${product.name} ${item.label}`}
                      src={item.src}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      <Section width="wide">
        <div className={styles.detailsGrid}>
          {product.detailSections.map((section) => (
            <article key={section.title} className={styles.accordionCard}>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="muted" width="wide">
        <div className={styles.relatedSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Related</p>
            <h2>Related products</h2>
          </div>
          <div className={styles.relatedGrid}>
            {product.related.map((item) => (
              <Link
                key={item.href}
                className={styles.relatedCard}
                href={item.href as Route}
              >
                <span>{item.categoryLabel}</span>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.relatedSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Recently viewed</p>
            <h2>Recent launch products</h2>
          </div>
          <div className={styles.relatedGrid}>
            {product.recentlyViewed.map((item) => (
              <Link
                key={item.href}
                className={styles.relatedCard}
                href={item.href as Route}
              >
                <span>{item.categoryLabel}</span>
                <strong>{item.title}</strong>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    </div>
  );
}

function createProductValueLine(product: ProductDetailPageViewModel) {
  if (product.type === "rug") {
    return `${product.materialsLabel} · ${product.originLabel} · One-of-one piece`;
  }

  return `${product.materialsLabel} · ${product.originLabel} · ${
    product.inventoryState === "outOfStock" ? "Currently unavailable" : "Multi-unit piece"
  }`;
}

function RugPurchaseShell({
  product,
  quantityLabel,
}: {
  product: Extract<ProductDetailPageViewModel, { type: "rug" }>;
  quantityLabel: "1";
}) {
  const { addProduct } = useCart();
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  return (
    <div className={styles.purchaseCard}>
      <div className={styles.purchaseRow}>
        <span className={styles.metaLabel}>Quantity</span>
        <p className={styles.lockedQuantity}>{quantityLabel}</p>
      </div>
      <p className={styles.purchaseNote}>
        This Type A rug is a one-of-one launch item. Quantity is locked to 1 and no
        variants are available.
      </p>
      <button
        className={styles.primaryAction}
        type="button"
        onClick={() => {
          addProduct({ product: product.cartProduct, quantity: 1 });
          window.dispatchEvent(new Event("loom-hearth:open-cart"));
          setFeedbackMessage("Added to cart. Cart opened.");
        }}
      >
        Add to cart
      </button>
      {feedbackMessage ? <p className={styles.feedbackMessage}>{feedbackMessage}</p> : null}
    </div>
  );
}

function MultiUnitMeta({ product }: { product: MultiUnitProductDetailPageViewModel }) {
  return (
    <>
      <div className={styles.metaItem}>
        <span className={styles.metaLabel}>Inventory state</span>
        <p className={styles.metaValue}>{product.inventoryState}</p>
      </div>
      <div className={styles.metaItem}>
        <span className={styles.metaLabel}>Quantity</span>
        <p className={styles.metaValue}>{product.quantityMin}+ allowed</p>
      </div>
    </>
  );
}

function MultiUnitPurchaseShell({
  product,
}: {
  product: MultiUnitProductDetailPageViewModel;
}) {
  const { addProduct } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.name);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const isOutOfStock = product.inventoryState === "outOfStock";

  return (
    <div className={styles.purchaseCard}>
      {product.variants?.length ? (
        <div className={styles.purchaseGroup}>
          <span className={styles.metaLabel}>{product.variantLabel ?? "Variant"}</span>
          <div className={styles.variantList}>
            {product.variants.map((variant) => (
              <button
                key={variant.id}
                className={`${styles.variantButton} ${
                  selectedVariant === variant.name ? styles.variantButtonActive : ""
                }`}
                type="button"
                onClick={() => setSelectedVariant(variant.name)}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.purchaseGroup}>
        <span className={styles.metaLabel}>Quantity</span>
        <div className={styles.quantityShell}>
          <button
            className={styles.quantityButton}
            type="button"
            onClick={() =>
              setQuantity((currentQuantity) =>
                Math.max(product.quantityMin, currentQuantity - 1),
              )
            }
          >
            -
          </button>
          <span>{quantity}</span>
          <button
            className={styles.quantityButton}
            type="button"
            onClick={() => setQuantity((currentQuantity) => currentQuantity + 1)}
          >
            +
          </button>
        </div>
      </div>

      <div className={styles.inventoryStateBlock}>
        <span
          className={`${styles.inventoryPill} ${
            product.inventoryState === "lowStock"
              ? styles.inventoryPillWarning
              : product.inventoryState === "outOfStock"
                ? styles.inventoryPillMuted
                : styles.inventoryPillReady
          }`}
        >
          {product.inventoryState === "lowStock"
            ? "Low stock"
            : product.inventoryState === "outOfStock"
              ? "Out of stock"
              : "In stock"}
        </span>
        <p className={styles.purchaseNote}>{product.inventoryMessage}</p>
      </div>

      {isOutOfStock ? (
        <button className={styles.secondaryAction} type="button">
          {product.notifyMeLabel ?? "Notify me"}
        </button>
      ) : (
        <button
          className={styles.primaryAction}
          type="button"
          onClick={() => {
            addProduct({
              product: product.cartProduct,
              quantity,
              variantName: selectedVariant,
            });
            window.dispatchEvent(new Event("loom-hearth:open-cart"));
            setFeedbackMessage("Added to cart. Cart opened.");
          }}
        >
          Add to cart
        </button>
      )}
      {feedbackMessage ? <p className={styles.feedbackMessage}>{feedbackMessage}</p> : null}
    </div>
  );
}
