"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { Section } from "@/components/layout/section";
import type { MultiUnitProductDetailPageViewModel, ProductDetailPageViewModel } from "@/lib/catalog/contracts";
import { useCart } from "@/features/cart/cart-provider";

import styles from "./product-detail-page.module.css";

type ProductDetailPageViewProps = {
  product: ProductDetailPageViewModel;
};

export function ProductDetailPageView({ product }: ProductDetailPageViewProps) {
  const primaryImage = product.gallery[0];

  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.layout}>
          <div className={styles.galleryColumn}>
            <div className={styles.primaryMedia}>
              {primaryImage ? (
                <img
                  alt={primaryImage.altText || product.name}
                  src={buildCloudinaryUrl(primaryImage.publicId)}
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
            <div className={styles.thumbnailGrid}>
              {product.gallery.map((item) => (
                <div key={item.id} className={styles.thumbnailCard}>
                  <img
                    alt={item.altText || `${product.name} ${item.label}`}
                    src={buildCloudinaryUrl(item.publicId)}
                    style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className={styles.infoColumn}>
            <p className={styles.eyebrow}>
              {product.type === "rug" ? "Type A rug" : "Type B multi-unit"}
            </p>
            <h1>{product.name}</h1>
            <p className={styles.price}>{product.priceUsdLabel}</p>
            <p className={styles.summary}>{product.description}</p>

            <div className={styles.metaGrid}>
              <div>
                <span className={styles.metaLabel}>Materials</span>
                <p>{product.materialsLabel}</p>
              </div>
              <div>
                <span className={styles.metaLabel}>Origin</span>
                <p>{product.originLabel}</p>
              </div>
              {product.type === "rug" ? (
                <>
                  <div>
                    <span className={styles.metaLabel}>Dimensions</span>
                    <p>{product.dimensionsLabel}</p>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Weight</span>
                    <p>{product.weightLabel}</p>
                  </div>
                </>
              ) : (
                <MultiUnitMeta product={product} />
              )}
            </div>

            {product.type === "rug" ? (
              <RugPurchaseShell product={product} quantityLabel={product.quantityLabel} />
            ) : (
              <MultiUnitPurchaseShell product={product} />
            )}

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
          setFeedbackMessage("Added to cart.");
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
      <div>
        <span className={styles.metaLabel}>Inventory state</span>
        <p>{product.inventoryState}</p>
      </div>
      <div>
        <span className={styles.metaLabel}>Quantity</span>
        <p>{product.quantityMin}+ allowed</p>
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
            setFeedbackMessage("Added to cart.");
          }}
        >
          Add to cart
        </button>
      )}
      {feedbackMessage ? <p className={styles.feedbackMessage}>{feedbackMessage}</p> : null}
    </div>
  );
}
