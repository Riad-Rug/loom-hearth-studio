"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { Section } from "@/components/layout/section";
import { ProductCard } from "@/features/catalog/product-card";
import { trackViewItem } from "@/lib/analytics/gtag";
import { getCategoryLabel } from "@/lib/catalog/helpers";
import {
  getTopRecommendationHistoryCategory,
  recordCategoryInterest,
} from "@/lib/catalog/recommendation-history";
import type {
  CatalogProductCardViewModel,
  MultiUnitProductDetailPageViewModel,
  ProductDetailPageViewModel,
} from "@/lib/catalog/contracts";
import type { ProductCategory } from "@/types/domain";

import styles from "./product-detail-page.module.css";

type ProductDetailPageViewProps = {
  product: ProductDetailPageViewModel;
};

type DisplayGalleryItem = ProductDetailPageViewModel["gallery"][number] & {
  tone?: "neutral" | "condition";
};

export function ProductDetailPageView({ product }: ProductDetailPageViewProps) {
  const gallery = useMemo(() => createDisplayGallery(product), [product]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [preferredHistoryCategory, setPreferredHistoryCategory] = useState<ProductCategory | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  useEffect(() => {
    setActiveImageIndex(0);
    setFailedImageIds(new Set());
    setIsLightboxOpen(false);
  }, [product.id]);

  const handleImageError = (id: string) => {
    setFailedImageIds((previous) => {
      if (previous.has(id)) {
        return previous;
      }
      return new Set(previous).add(id);
    });
  };

  useEffect(() => {
    setPreferredHistoryCategory(getTopRecommendationHistoryCategory());
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

    recordCategoryInterest(product.category);
  }, [product.category, product.id, product.name, product.priceUsd]);

  const activeImage = gallery[activeImageIndex] ?? gallery[0] ?? null;
  const activeImageBroken = activeImage ? failedImageIds.has(activeImage.id) : false;
  const activeImageAlt = activeImage?.altText || product.name;
  const displayedRecommendations = getDisplayedRecommendations(
    product.similarRugs,
    preferredHistoryCategory,
  );
  const displayedCrossSellRecommendations = getDisplayedCrossSellRecommendations(
    product.crossSellRecommendations,
    displayedRecommendations,
    preferredHistoryCategory,
  );
  const recommendationPresentation = getRecommendationPresentation(
    product,
    displayedRecommendations,
    preferredHistoryCategory,
  );
  const crossSellPresentation = getCrossSellPresentation(
    product,
    displayedCrossSellRecommendations,
    preferredHistoryCategory,
  );
  const specRows = buildSpecificationRows(product);

  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.layout}>
          <div className={styles.galleryColumn}>
            <div className={styles.primaryMedia}>
              {activeImage?.src && !activeImageBroken ? (
                <button
                  aria-label={`Zoom in on ${activeImageAlt}`}
                  className={styles.primaryMediaButton}
                  type="button"
                  onClick={() => setIsLightboxOpen(true)}
                >
                  <img
                    alt={activeImageAlt}
                    className={styles.primaryImage}
                    src={activeImage.src}
                    onError={() => handleImageError(activeImage.id)}
                  />
                </button>
              ) : (
                <PlaceholderMedia
                  alt={product.name}
                  aspectRatio="4 / 5"
                  label="Photo pending"
                  priority
                  sizes="(max-width: 1100px) 100vw, 56vw"
                  tone={activeImage?.tone === "condition" ? "condition" : "neutral"}
                />
              )}
            </div>

            <div className={styles.thumbnailGrid}>
              {gallery.map((item, index) => (
                <button
                  key={item.id}
                  aria-current={activeImageIndex === index ? "true" : undefined}
                  className={`${styles.thumbnailCard} ${
                    activeImageIndex === index ? styles.thumbnailCardActive : ""
                  }`}
                  type="button"
                  onClick={() => setActiveImageIndex(index)}
                >
                  {item.src && !failedImageIds.has(item.id) ? (
                    <img
                      alt={item.altText || `${product.name} ${item.label}`}
                      className={styles.thumbnailImage}
                      loading="lazy"
                      src={item.src}
                      onError={() => handleImageError(item.id)}
                    />
                  ) : (
                    <PlaceholderMedia
                      alt={item.label}
                      aspectRatio="1 / 1"
                      label={item.label}
                      sizes="6rem"
                      tone={item.tone === "condition" ? "condition" : "neutral"}
                    />
                  )}
                  <span className={styles.thumbnailLabel}>{item.label}</span>
                </button>
              ))}
            </div>

            {product.description ? (
              <section className={styles.descriptionSection} aria-label="Description">
                <p className={styles.panelEyebrow}>Description</p>
                <p>{product.description}</p>
              </section>
            ) : null}
          </div>

          <div className={styles.infoColumn}>
            <ProductBreadcrumb product={product} />

            <div className={styles.badges}>
              <span className={styles.monoBadge}>{product.status === "sold" ? "SOLD" : "1 OF 1"}</span>
              <span className={styles.catalogBadge}>{product.catalogNumber}</span>
            </div>

            <h1>{product.name}</h1>
            <p className={styles.subtitle}>{product.subtitle}</p>
            <p className={styles.price}>{product.priceUsdLabel}</p>

            <dl className={styles.specTable}>
              {specRows.map((row) => (
                <div key={row.label} className={styles.specRow}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>

            <section className={styles.verificationPanel} aria-label="Verification promise">
              <p className={styles.panelEyebrow}>Verification promise</p>
              <p>
                We send daylight photos of the exact piece, including wear and condition, before the charge is captured.
              </p>
            </section>

            {product.status === "sold" ? (
              <SoldPurchaseShell />
            ) : product.type === "rug" ? (
              <RugPurchaseShell product={product} />
            ) : (
              <MultiUnitPurchaseShell product={product} />
            )}

            <section className={styles.checklistSection} aria-label="Shipping and returns">
              <ul className={styles.checklist}>
                <li>Tracked shipping from Casablanca.</li>
                <li>Approval before payment capture.</li>
                <li>Condition is shown in photos, not softened in copy.</li>
                <li>Questions handled directly before dispatch.</li>
              </ul>
            </section>

            <section className={styles.founderNote}>
              <p className={styles.panelEyebrow}>Founder sourcing note</p>
              <p>{product.merchandisingNote}</p>
            </section>

            {product.detailSections.length > 0 && (
              <div className={styles.detailSections}>
                {product.detailSections.map((section) => (
                  <section key={section.title} className={styles.detailSection}>
                    <h3 className={styles.detailSectionTitle}>{section.title}</h3>
                    <p className={styles.detailSectionBody}>{section.body}</p>
                  </section>
                ))}
              </div>
            )}
          </div>
        </div>
      </Section>

      {displayedRecommendations.length ? (
        <Section width="wide">
          <div className={styles.recommendationSection}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>{recommendationPresentation.eyebrow}</p>
              <h2>{recommendationPresentation.heading}</h2>
            </div>
            <div className={styles.recommendationGrid} aria-label={recommendationPresentation.ariaLabel}>
              {displayedRecommendations.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {displayedCrossSellRecommendations.length ? (
        <Section width="wide">
          <div className={styles.recommendationSection}>
            <div className={styles.sectionHeader}>
              <p className={styles.eyebrow}>{crossSellPresentation.eyebrow}</p>
              <h2>{crossSellPresentation.heading}</h2>
            </div>
            <div className={styles.recommendationGrid} aria-label={crossSellPresentation.ariaLabel}>
              {displayedCrossSellRecommendations.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {product.status !== "sold" ? (
        <div className={styles.mobileStickyBar}>
          <span className={styles.mobileStickyPrice}>{product.priceUsdLabel}</span>
          <Link className={styles.mobileStickyAction} href={buildInquiryHref(product) as Route}>
            {product.type === "rug" ? "Reserve this piece" : "Request this piece"}
          </Link>
        </div>
      ) : null}

      {isLightboxOpen && activeImage?.src && !activeImageBroken ? (
        <ImageLightbox
          alt={activeImageAlt}
          src={activeImage.src}
          onClose={() => setIsLightboxOpen(false)}
        />
      ) : null}
    </div>
  );
}

function ImageLightbox({
  alt,
  src,
  onClose,
}: {
  alt: string;
  src: string;
  onClose: () => void;
}) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeButtonRef.current?.focus();

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return createPortal(
    <div className={styles.lightboxOverlay} role="dialog" aria-modal="true" onClick={onClose}>
      <button
        ref={closeButtonRef}
        aria-label="Close zoomed image"
        className={styles.lightboxClose}
        type="button"
        onClick={onClose}
      >
        Close
      </button>
      <img
        alt={alt}
        className={styles.lightboxImage}
        src={src}
        onClick={(event) => event.stopPropagation()}
      />
    </div>,
    document.body,
  );
}

const MIN_GALLERY_SLOTS = 5;

function createDisplayGallery(product: ProductDetailPageViewModel): DisplayGalleryItem[] {
  const allImages = product.gallery;

  const items: DisplayGalleryItem[] = allImages.map((item, index) => ({
    ...item,
    label: index === allImages.length - 1 ? "Condition" : item.label,
    tone: index === allImages.length - 1 ? ("condition" as const) : ("neutral" as const),
  }));

  const padded: DisplayGalleryItem[] = [...items];

  while (padded.length < MIN_GALLERY_SLOTS) {
    padded.push({
      id: `placeholder-${padded.length}`,
      label: padded.length === MIN_GALLERY_SLOTS - 1 ? "Condition" : `View ${padded.length + 1}`,
      src: "",
      publicId: "",
      altText: "",
      role: "placeholder",
      tone: padded.length === MIN_GALLERY_SLOTS - 1 ? ("condition" as const) : ("neutral" as const),
    });
  }

  return padded;
}

function buildSpecificationRows(product: ProductDetailPageViewModel) {
  const rows: { label: string; value: string }[] = [
    { label: "Size", value: product.type === "rug" ? product.dimensionsLabel : "See variant options" },
    { label: "Material", value: product.materialLabel || "See listing" },
    { label: "Origin", value: product.originLabel || "Morocco" },
  ];

  if (product.type === "rug") {
    rows.push({ label: "Style", value: product.rugStyle ?? "Handwoven rug" });
    if (product.techniqueLabel) {
      rows.push({ label: "Technique", value: product.techniqueLabel });
    }
  }

  rows.push(
    { label: "Age", value: product.category === "vintage" ? "Vintage" : "Handmade contemporary piece" },
    { label: "Condition", value: extractConditionNote(product) },
  );

  if (product.type === "rug") {
    rows.push({ label: "Weight", value: product.weightLabel });
  } else {
    rows.push({ label: "Availability", value: product.inventoryMessage });
  }

  return rows;
}

function extractConditionNote(product: ProductDetailPageViewModel) {
  const conditionSection =
    product.detailSections.find((section) => /condition/i.test(section.title))?.body ||
    product.descriptionSections.find((section) => /condition/i.test(section.title))?.body ||
    product.description;

  return `${conditionSection.split(/\n|(?<=[.!?])\s/u)[0]} Photo shown in the condition view.`;
}

function ProductBreadcrumb({ product }: { product: ProductDetailPageViewModel }) {
  const categoryPath = getProductCategoryHref(product);
  const items: Array<{ label: string; href?: Route }> = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: getCategoryLabel(product.category), href: categoryPath as Route },
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

function getDisplayedRecommendations(
  recommendations: CatalogProductCardViewModel[],
  preferredHistoryCategory: ProductCategory | null,
) {
  if (!preferredHistoryCategory) {
    return recommendations;
  }

  const matchingCategoryRecommendations = recommendations.filter(
    (item) => item.category === preferredHistoryCategory,
  );

  return matchingCategoryRecommendations.length ? matchingCategoryRecommendations : recommendations;
}

function getDisplayedCrossSellRecommendations(
  recommendations: CatalogProductCardViewModel[],
  displayedRecommendations: CatalogProductCardViewModel[],
  preferredHistoryCategory: ProductCategory | null,
) {
  const excludedIds = new Set(displayedRecommendations.map((item) => item.id));
  const filteredRecommendations = recommendations.filter((item) => !excludedIds.has(item.id));

  if (!preferredHistoryCategory) {
    return filteredRecommendations;
  }

  const nonPrimaryCategoryRecommendations = filteredRecommendations.filter(
    (item) => item.category !== preferredHistoryCategory,
  );

  return nonPrimaryCategoryRecommendations.length
    ? nonPrimaryCategoryRecommendations
    : filteredRecommendations;
}

function getRecommendationPresentation(
  product: ProductDetailPageViewModel,
  recommendations: CatalogProductCardViewModel[],
  preferredHistoryCategory: ProductCategory | null,
) {
  const displayedCategory = recommendations[0]?.category;
  const isHistoryLedCategory =
    preferredHistoryCategory !== null &&
    displayedCategory !== undefined &&
    displayedCategory === preferredHistoryCategory &&
    displayedCategory !== product.category;

  if (isHistoryLedCategory) {
    const categoryLabel = getCategoryLabel(displayedCategory);

    return {
      eyebrow: "Based on your browsing",
      heading: `More ${categoryLabel} from your recent browsing.`,
      ariaLabel: `${categoryLabel} based on your recent browsing`,
    };
  }

  return {
    eyebrow: "You may also like",
    heading: product.type === "rug" ? "Similar rugs to keep in view." : "Similar pieces to keep in view.",
    ariaLabel: "Similar product recommendations",
  };
}

function getCrossSellPresentation(
  product: ProductDetailPageViewModel,
  recommendations: CatalogProductCardViewModel[],
  preferredHistoryCategory: ProductCategory | null,
) {
  const displayedCategory = recommendations[0]?.category;
  const isHistoryLedUpsell =
    preferredHistoryCategory !== null &&
    displayedCategory !== undefined &&
    displayedCategory !== preferredHistoryCategory;

  if (isHistoryLedUpsell) {
    return {
      eyebrow: "Then consider",
      heading: `Add ${getCategoryLabel(displayedCategory)} as a next layer.`,
      ariaLabel: `${getCategoryLabel(displayedCategory)} as companion pieces`,
    };
  }

  return {
    eyebrow: "Pair with",
    heading: "Complete the room with pillows, poufs, or decor.",
    ariaLabel: "Complementary pieces",
  };
}

function getProductCategoryHref(product: ProductDetailPageViewModel): Route {
  return (product.category === "vintage" ? "/shop/vintage" : product.type === "rug" ? "/shop/rugs" : `/shop/${product.category}`) as Route;
}

function RugPurchaseShell({
  product,
}: {
  product: Extract<ProductDetailPageViewModel, { type: "rug" }>;
}) {
  return (
    <div className={styles.purchaseCard}>
      <Link className={styles.primaryAction} href={buildInquiryHref(product) as Route}>
        Reserve this piece — {product.priceUsdLabel}
      </Link>
      <p className={styles.purchaseMicrocopy}>
        Card authorized now, charged only after your approval.
      </p>
    </div>
  );
}

function SoldPurchaseShell() {
  return (
    <div className={styles.purchaseCard}>
      <strong>This piece is sold.</strong>
      <p className={styles.purchaseMicrocopy}>
        It remains in the catalog as a record. Browse the collection for available pieces.
      </p>
    </div>
  );
}

function MultiUnitPurchaseShell({
  product,
}: {
  product: MultiUnitProductDetailPageViewModel;
}) {
  return (
    <div className={styles.purchaseCard}>
      <Link className={styles.primaryAction} href={buildInquiryHref(product) as Route}>
        Request this piece — {product.priceUsdLabel}
      </Link>
      <p className={styles.purchaseMicrocopy}>
        Availability is confirmed before any charge is captured.
      </p>
    </div>
  );
}

function buildInquiryHref(product: ProductDetailPageViewModel) {
  const params = new URLSearchParams({
    inquiryType: "product-inquiry",
    productName: product.name,
    productHref: getProductPath(product),
  });

  return `/contact?${params.toString()}`;
}

function getProductPath(product: ProductDetailPageViewModel) {
  return `/shop/${product.category}/${product.slug}`;
}
