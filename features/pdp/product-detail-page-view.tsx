"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { Section } from "@/components/layout/section";
import { trackViewItem } from "@/lib/analytics/gtag";
import { getCategoryLabel } from "@/lib/catalog/helpers";
import type {
  MultiUnitProductDetailPageViewModel,
  ProductDetailPageViewModel,
} from "@/lib/catalog/contracts";

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
    trackViewItem({
      currency: "USD",
      value: product.priceUsd,
      items: [
        {
          item_id: product.id,
          item_name: product.name,
          item_category: product.category,
          price: product.priceUsd,
          quantity: 1,
        },
      ],
    });
  }, [product.category, product.id, product.name, product.priceUsd]);

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
            <p className={styles.eyebrow}>{getCategoryLabel(product.category)}</p>
            <div className={styles.titleBlock}>
              <h1>{product.name}</h1>
              <p className={styles.valueLine}>{valueLine}</p>
            </div>
            <p className={styles.price}>{product.priceUsdLabel}</p>
            <p className={styles.summary}>{product.description}</p>

            {product.type === "rug" ? (
              <RugPurchaseShell product={product} />
            ) : (
              <MultiUnitPurchaseShell product={product} />
            )}

            <div className={styles.metaGrid}>
              {product.specifications.map((spec) => (
                <div key={spec.label} className={styles.metaItem}>
                  <span className={styles.metaLabel}>{spec.label}</span>
                  <p className={styles.metaValue}>{spec.value}</p>
                </div>
              ))}
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

      {product.supportPanels.length ? (
        <Section width="wide">
          <div className={styles.supportGrid}>
            {product.supportPanels.map((panel) => (
              <article key={panel.id} className={styles.supportCard}>
                <p className={styles.eyebrow}>{panel.eyebrow}</p>
                <h2 className={styles.supportCardHeading}>{panel.title}</h2>
                <p className={styles.supportCardBody}>{panel.body}</p>
                {panel.items.length ? (
                  <ul className={styles.supportList}>
                    {panel.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </Section>
      ) : null}

      <Section width="wide">
        <div className={styles.detailsGrid}>
          {product.detailSections.map((section) => (
            <article key={section.title} className={styles.detailCard}>
              <h2 className={styles.detailCardHeading}>{section.title}</h2>
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
              <Link key={item.href} className={styles.relatedCard} href={item.href as Route}>
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
            <h2>More from the collection</h2>
          </div>
          <div className={styles.relatedGrid}>
            {product.recentlyViewed.map((item) => (
              <Link key={item.href} className={styles.relatedCard} href={item.href as Route}>
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
    return `${product.materialLabel} | ${product.originLabel} | One-of-one piece`;
  }

  return `${product.materialLabel} | ${product.originLabel} | ${
    product.inventoryState === "outOfStock" ? "Currently unavailable" : "Made for project review"
  }`;
}

function RugPurchaseShell({
  product,
}: {
  product: Extract<ProductDetailPageViewModel, { type: "rug" }>;
}) {
  return (
    <div className={styles.purchaseCard}>
      <p className={styles.purchaseNote}>
        This is a one-of-one piece. Before your payment is taken, we review the actual rug with
        you so you can confirm the color, texture, and scale for your space.
      </p>
      <Link className={styles.primaryAction} href={buildInquiryHref(product, { quantity: 1 }) as Route}>
        Start rug inquiry
      </Link>
      <Link className={styles.secondaryAction} href="/trade">
        Trade and project inquiries
      </Link>
    </div>
  );
}

function MultiUnitPurchaseShell({
  product,
}: {
  product: MultiUnitProductDetailPageViewModel;
}) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(product.variants[0]?.name);
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
        <span className={styles.metaLabel}>Desired quantity</span>
        <div className={styles.quantityShell}>
          <button
            className={styles.quantityButton}
            type="button"
            onClick={() =>
              setQuantity((currentQuantity) => Math.max(product.quantityMin, currentQuantity - 1))
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
        <p className={styles.purchaseNote}>
          {isOutOfStock
            ? "This piece is not available for direct purchase. Use the inquiry flow to ask about restock timing or similar pieces."
            : "Purchasing is handled through inquiry so the studio can confirm availability, destination, lead time, and delivery conditions before payment is captured."}
        </p>
      </div>

      <Link
        className={isOutOfStock ? styles.secondaryAction : styles.primaryAction}
        href={buildInquiryHref(product, { quantity, variantName: selectedVariant }) as Route}
      >
        {isOutOfStock ? "Ask about availability" : "Request details"}
      </Link>
    </div>
  );
}

function buildInquiryHref(
  product: ProductDetailPageViewModel,
  options?: {
    quantity?: number;
    variantName?: string;
  },
) {
  const params = new URLSearchParams({
    inquiryType: "product-inquiry",
    productName: product.name,
  });

  if (options?.quantity) {
    params.set("quantity", String(options.quantity));
  }

  if (options?.variantName) {
    params.set("variant", options.variantName);
  }

  return `/contact?${params.toString()}`;
}
