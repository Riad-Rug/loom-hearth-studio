"use client";

import type { Route } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { useEffect, useId, useState } from "react";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { CustomerReviewCarousel } from "@/components/reviews/customer-review-carousel";
import { Section } from "@/components/layout/section";
import { ProductCard } from "@/features/catalog/product-card";
import { trackViewItem } from "@/lib/analytics/gtag";
import { getCategoryLabel } from "@/lib/catalog/helpers";
import type {
  MultiUnitProductDetailPageViewModel,
  ProductDetailPageViewModel,
} from "@/lib/catalog/contracts";
import { customerReviews } from "@/lib/reviews/customer-reviews";

import styles from "./product-detail-page.module.css";

type ProductDetailPageViewProps = {
  product: ProductDetailPageViewModel;
};

type GalleryItem = ProductDetailPageViewModel["gallery"][number];

type GalleryImageProps = {
  alt: string;
  className: string;
  fallbackClassName: string;
  fallbackLabel: string;
  item: GalleryItem;
  src: string;
};

function GalleryImage(props: GalleryImageProps) {
  const [hasFailed, setHasFailed] = useState(false);

  useEffect(() => {
    setHasFailed(false);
  }, [props.src]);

  if (hasFailed) {
    return (
      <div className={props.fallbackClassName}>
        <span>{props.fallbackLabel}</span>
      </div>
    );
  }

  return (
    <img
      className={props.className}
      alt={props.alt}
      src={props.src}
      title={props.item.label}
      onError={() => setHasFailed(true)}
    />
  );
}

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
                  <GalleryImage
                    key={activeImage.id}
                    alt={activeImage.altText || product.name}
                    className={styles.primaryImage}
                    fallbackClassName={styles.primaryImageFallback}
                    fallbackLabel="Image unavailable"
                    item={activeImage}
                    src={activeImage.src}
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
                  aria-label={`Show ${item.label}`}
                  onClick={() => selectImage(index)}
                >
                  <GalleryImage
                    className={styles.thumbnailImage}
                    alt={item.altText || `${product.name} ${item.label}`}
                    fallbackClassName={styles.thumbnailFallback}
                    fallbackLabel={item.label}
                    item={item}
                    src={item.src}
                  />
                </button>
              ))}
            </div>
            {product.type === "rug" ? (
              <div className={styles.paletteStrip} aria-label={`${product.name} color palette`}>
                {product.palette.map((swatch) => (
                  <div
                    key={`${swatch.hex}-${swatch.label}`}
                    className={styles.swatch}
                    style={{ "--c": swatch.hex } as CSSProperties}
                  >
                    <span>{swatch.label}</span>
                  </div>
                ))}
              </div>
            ) : null}
          </div>

          <div className={styles.infoColumn}>
            <ProductBreadcrumb product={product} />
            <Link className={`${styles.eyebrow} ${styles.categoryLink}`} href={getProductCategoryHref(product)}>
              {getCategoryLabel(product.category)}
            </Link>
            <div className={styles.titleBlock}>
              <h1>{product.name}</h1>
              <p className={styles.valueLine}>{product.subtitle}</p>
            </div>
            <p className={styles.price}>
              {product.priceUsdLabel} <span>USD</span>
            </p>
            <DecisionTrustStrip />
            {product.type === "rug" ? (
              <p className={styles.scarcityLine}>One-of-one. When sold, this exact rug does not return.</p>
            ) : null}
            <p className={styles.summary}>{product.description}</p>
            {product.type === "rug" ? <p className={styles.placementNote}>{product.placementNote}</p> : null}

            {product.type === "rug" ? (
              <RugPurchaseShell product={product} />
            ) : (
              <MultiUnitPurchaseShell product={product} />
            )}
          </div>
        </div>

        <div className={styles.productDetailsPanel}>
          <div className={styles.sectionHeader}>
            <div>
              <p className={styles.eyebrow}>Piece notes</p>
              <h2>Materials, construction, and buying details.</h2>
            </div>
            <p className={styles.sectionHeaderIntro}>
              The technical facts, in plain language. Expand any section for more detail.
            </p>
          </div>

          <div className={styles.productDetailsGrid}>
            <div className={styles.productDetailsColumn}>
              <div className={styles.descriptionAccordion}>
                {product.descriptionSections.map((section, index) => (
                  <PdpAccordionPanel
                    key={section.title}
                    body={section.body}
                    defaultOpen={index <= 1}
                    title={section.title}
                    variant="description"
                  />
                ))}
              </div>
            </div>

            <aside className={styles.productDetailsAside} aria-label="Shipping and care notes">
              <ShippingReturnsAccordion />
              <CareAtAGlance />
            </aside>
          </div>
        </div>

        <div className={styles.reviewBand}>
          <CustomerReviewCarousel
            reviews={customerReviews}
            variant="pdp"
            eyebrow="Customer reviews"
            title="Notes from buyers after the piece arrived."
          />
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
                <GalleryImage
                  key={`${activeImage.id}-lightbox`}
                  alt={activeImage.altText || product.name}
                  className={styles.lightboxImage}
                  fallbackClassName={styles.lightboxImageFallback}
                  fallbackLabel="Image unavailable"
                  item={activeImage}
                  src={activeImage.src}
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
                    aria-label={`Show ${item.label}`}
                    onClick={() => selectImage(index)}
                  >
                    <GalleryImage
                      className={styles.thumbnailImage}
                      alt={item.altText || `${product.name} ${item.label}`}
                      fallbackClassName={styles.thumbnailFallback}
                      fallbackLabel={item.label}
                      item={item}
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
        <Section className={styles.standardBandGap} width="wide">
          <div className={styles.supportSection}>
            <div className={styles.sectionHeader}>
              <div>
                <p className={styles.eyebrow}>How it works</p>
                <h2>How This Piece Is Verified and Shipped.</h2>
              </div>
              <p className={styles.sectionHeaderIntro}>
                Every one-of-one goes through the same three-step verification before we take payment.
              </p>
            </div>
            <div className={styles.supportGrid}>
              {product.supportPanels.map((panel) => (
                <article key={panel.id} className={styles.supportCard}>
                  <p className={styles.eyebrow}>{panel.eyebrow}</p>
                  <h3 className={styles.supportCardHeading}>{panel.title}</h3>
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
          </div>
        </Section>
      ) : null}

      {product.similarRugs.length ? (
        <Section className={styles.standardBandGap} tone="muted" width="wide">
          <div className={styles.recommendationSection}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>You may also like</p>
              <h2>Similar Rugs to Keep in View.</h2>
            </div>
            <div
              className={styles.recommendationCarousel}
              aria-label="Similar rug recommendations"
            >
              {product.similarRugs.map((item) => (
                <div key={item.id} className={styles.recommendationSlide}>
                  <ProductCard product={item} />
                </div>
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      <Section className={styles.standardBandGap} width="wide">
        <ClosingBand product={product} />
      </Section>
    </div>
  );
}

function ProductBreadcrumb({ product }: { product: ProductDetailPageViewModel }) {
  const categoryPath = getProductCategoryHref(product);
  const items: Array<{ label: string; href?: Route }> = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: product.type === "rug" ? "Rugs" : getCategoryLabel(product.category), href: categoryPath as Route },
    { label: product.name },
  ];

  return (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb">
      <ol>
        {items.map((item) => (
          <li key={item.label}>
            {item.href ? <Link href={item.href}>{item.label}</Link> : <span aria-current="page">{item.label}</span>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

function getProductCategoryHref(product: ProductDetailPageViewModel): Route {
  return (product.type === "rug" ? "/shop/rugs" : `/shop/${product.category}`) as Route;
}

function ShippingReturnsAccordion() {
  return (
    <PdpAccordionPanel
      body={
        <ul>
          <li>Ships from Morocco in 5 to 7 business days.</li>
          <li>DHL tracked delivery.</li>
          <li>Duties included to US, CA, and AU.</li>
          <li>14-day returns.</li>
        </ul>
      }
      title="Shipping & Returns"
      variant="shipping"
    />
  );
}

function DecisionTrustStrip() {
  const items = ["Ships in 5 to 7 business days", "DHL tracked", "Duties included", "14-day returns"];

  return (
    <ul className={styles.decisionTrustStrip} aria-label="Shipping and returns highlights">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

function PdpAccordionPanel({
  body,
  defaultOpen = false,
  title,
  variant,
}: {
  body: ReactNode;
  defaultOpen?: boolean;
  title: string;
  variant: "description" | "shipping";
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const panelId = useId();
  const headingId = useId();
  const className = variant === "shipping" ? styles.shippingPanel : styles.descriptionPanel;

  return (
    <section className={className} aria-labelledby={headingId}>
      <h3 id={headingId} className={styles.accordionHeading}>
        <button
          aria-controls={panelId}
          aria-expanded={isOpen}
          className={styles.accordionButton}
          type="button"
          onClick={() => setIsOpen((current) => !current)}
        >
          {title}
        </button>
      </h3>
      <div id={panelId} hidden={!isOpen}>
        {typeof body === "string" ? renderAccordionBody(title, body) : body}
      </div>
    </section>
  );
}

function CareAtAGlance() {
  const items = [
    "Vacuum on low suction without a beater bar.",
    "Rotate seasonally so sunlight and foot traffic wear evenly.",
    "Blot spills immediately and use a professional rug cleaner for deep cleaning.",
  ];

  return (
    <aside className={styles.careCallout} aria-label="Care at a glance">
      <p className={styles.metaLabel}>Care at a glance</p>
      <ul>
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </aside>
  );
}

function renderAccordionBody(title: string, body: string) {
  if (title !== "Provenance" && title !== "Condition") {
    return <p>{body}</p>;
  }

  const rows = body
    .split(/\n+/u)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [label, ...valueParts] = line.split(":");

      return {
        label: valueParts.length ? label.trim() : "",
        value: valueParts.length ? valueParts.join(":").trim() : line,
      };
    });

  return (
    <dl className={styles.provenanceList}>
      {rows.map((row) => (
        <div key={`${row.label}-${row.value}`}>
          {row.label ? (
            <dt>{row.label === "Sourcing" ? <Link href="/sourcing">Sourcing</Link> : row.label}</dt>
          ) : null}
          <dd>{row.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function RugPurchaseShell({
  product,
}: {
  product: Extract<ProductDetailPageViewModel, { type: "rug" }>;
}) {
  return (
    <div className={styles.purchaseCard}>
      <Link className={styles.primaryAction} href={buildInquiryHref(product, { quantity: 1 }) as Route}>
        Reserve - no payment yet
      </Link>
      <p className={styles.purchaseReassurance}>
        This is a one-of-one piece. Reserve holds it for you - we film the exact rug, you approve the
        video, and only then is payment captured. 24-hour reply.
      </p>
    </div>
  );
}

function ClosingBand({ product }: { product: ProductDetailPageViewModel }) {
  return (
    <section className={styles.closingBand} aria-label="Reserve or ask about this piece">
      <p className={styles.closingBandPrompt}>Ready to reserve this piece, or have a question first?</p>
      <div className={styles.closingBandActions}>
        <Link className={styles.primaryAction} href={buildInquiryHref(product, { quantity: 1 }) as Route}>
          Reserve - no payment yet
        </Link>
        <Link className={styles.secondaryAction} href="/trade">
          Trade &amp; project inquiries
        </Link>
      </div>
    </section>
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
