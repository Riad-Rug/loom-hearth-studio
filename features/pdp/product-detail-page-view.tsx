import type { Route } from "next";
import Link from "next/link";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { Section } from "@/components/layout/section";
import type {
  MultiUnitPlaceholderProduct,
  PlaceholderProduct,
} from "@/features/pdp/pdp-data";

import styles from "./product-detail-page.module.css";

type ProductDetailPageViewProps = {
  product: PlaceholderProduct;
};

export function ProductDetailPageView({ product }: ProductDetailPageViewProps) {
  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.layout}>
          <div className={styles.galleryColumn}>
            <div className={styles.primaryMedia}>
              <PlaceholderMedia
                alt={product.name}
                aspectRatio="4 / 3"
                label={product.type === "rug" ? "Rug gallery" : "Product gallery"}
                priority
                sizes="(max-width: 1100px) 100vw, 55vw"
              />
            </div>
            <div className={styles.thumbnailGrid}>
              {product.gallery.map((item) => (
                <div key={item.id} className={styles.thumbnailCard}>
                  <PlaceholderMedia
                    alt={`${product.name} ${item.label}`}
                    aspectRatio="1 / 1"
                    label={item.label}
                    sizes="(max-width: 1100px) 50vw, 14vw"
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
            <p className={styles.summary}>{product.summary}</p>

            <div className={styles.metaGrid}>
              <div>
                <span className={styles.metaLabel}>Materials</span>
                <p>{product.materials}</p>
              </div>
              <div>
                <span className={styles.metaLabel}>Origin</span>
                <p>{product.origin}</p>
              </div>
              {product.type === "rug" ? (
                <>
                  <div>
                    <span className={styles.metaLabel}>Dimensions</span>
                    <p>{product.dimensionsCm}</p>
                  </div>
                  <div>
                    <span className={styles.metaLabel}>Weight</span>
                    <p>{product.weightKg}</p>
                  </div>
                </>
              ) : (
                <MultiUnitMeta product={product} />
              )}
            </div>

            {product.type === "rug" ? (
              <RugPurchaseShell quantityLabel={product.quantityLabel} />
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
            <h2>Placeholder related products</h2>
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
            <h2>Placeholder recently viewed UI</h2>
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

function RugPurchaseShell({ quantityLabel }: { quantityLabel: "1" }) {
  return (
    <div className={styles.purchaseCard}>
      <div className={styles.purchaseRow}>
        <span className={styles.metaLabel}>Quantity</span>
        <p className={styles.lockedQuantity}>{quantityLabel}</p>
      </div>
      <p className={styles.purchaseNote}>
        This Type A rug is a unique item. Quantity is locked to 1 and no variants are
        available.
      </p>
      <button className={styles.primaryAction} type="button">
        Add to cart UI placeholder
      </button>
    </div>
  );
}

function MultiUnitMeta({ product }: { product: MultiUnitPlaceholderProduct }) {
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
  product: MultiUnitPlaceholderProduct;
}) {
  const isOutOfStock = product.inventoryState === "outOfStock";

  return (
    <div className={styles.purchaseCard}>
      {product.variants?.length ? (
        <div className={styles.purchaseGroup}>
          <span className={styles.metaLabel}>{product.variantLabel ?? "Variant"}</span>
          <div className={styles.variantList}>
            {product.variants.map((variant) => (
              <button key={variant} className={styles.variantButton} type="button">
                {variant}
              </button>
            ))}
          </div>
        </div>
      ) : null}

      <div className={styles.purchaseGroup}>
        <span className={styles.metaLabel}>Quantity</span>
        <div className={styles.quantityShell}>
          <button className={styles.quantityButton} type="button">
            -
          </button>
          <span>1</span>
          <button className={styles.quantityButton} type="button">
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
        <button className={styles.primaryAction} type="button">
          Add to cart UI placeholder
        </button>
      )}
    </div>
  );
}
