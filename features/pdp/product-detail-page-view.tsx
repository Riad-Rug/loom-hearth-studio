"use client";

import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  Tab,
  TabGroup,
  TabList,
  TabPanel,
  TabPanels,
} from "@headlessui/react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useMemo, useState } from "react";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { Section } from "@/components/layout/section";
import { useCart } from "@/features/cart/cart-provider";
import { ProductCard } from "@/features/catalog/product-card";
import { trackViewItem } from "@/lib/analytics/gtag";
import { formatMultiUnitDimensions, getCategoryLabel } from "@/lib/catalog/helpers";
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

import "./tailwind.css";

type ProductDetailPageViewProps = {
  product: ProductDetailPageViewModel;
};

type DisplayGalleryItem = ProductDetailPageViewModel["gallery"][number] & {
  tone?: "neutral" | "condition";
};

const PANEL_CARD = "grid gap-[var(--space-3)] p-[var(--space-4)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-panel)]";
const PANEL_EYEBROW = "text-[var(--color-green)] text-[0.72rem] font-semibold tracking-[0.08em] uppercase";
const PRIMARY_ACTION = "inline-flex items-center justify-center min-h-[3rem] px-[1rem] py-[0.8rem] border border-[color:var(--color-green)] rounded-[4px] bg-[var(--color-green)] text-[var(--color-bg)] font-medium";
const PURCHASE_MICROCOPY = "text-[var(--color-text-muted)] text-[0.92rem]";

export function ProductDetailPageView({ product }: ProductDetailPageViewProps) {
  const gallery = useMemo(() => createDisplayGallery(product), [product]);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [preferredHistoryCategory, setPreferredHistoryCategory] = useState<ProductCategory | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const reserveProduct = useReserveProduct(product);

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
    <div className="grid gap-[var(--space-7)] max-[700px]:pb-[5rem]">
      <Section width="wide">
        <div className="grid grid-cols-[minmax(0,1.05fr)_minmax(20rem,0.95fr)] gap-[var(--space-7)] items-start max-[1100px]:grid-cols-1 max-[1100px]:gap-[var(--space-6)]">
          <div>
            <TabGroup as={Fragment} selectedIndex={activeImageIndex} onChange={setActiveImageIndex}>
              <div className="grid grid-cols-[5rem_1fr] gap-[var(--space-3)] items-start max-[700px]:grid-cols-1">
                <TabList className="grid gap-[8px] content-start max-[700px]:order-2 max-[700px]:grid-flow-col max-[700px]:auto-cols-[4.5rem] max-[700px]:overflow-x-auto max-[700px]:pb-[0.3rem]">
                  {gallery.map((item) => (
                    <Tab
                      key={item.id}
                      className={({ selected }) =>
                        `block aspect-square p-0 border-0 rounded-[var(--radius-md)] bg-[var(--color-panel)] overflow-hidden focus:outline-none ${
                          selected
                            ? "ring-2 ring-inset ring-[color:var(--color-green)]"
                            : "ring-1 ring-inset ring-[color:var(--color-border)]"
                        }`
                      }
                    >
                      {item.src && !failedImageIds.has(item.id) ? (
                        <img
                          alt={item.altText ? `${item.altText} — ${item.label}` : `${product.name} — ${item.label}`}
                          className="block w-full h-full object-cover object-center"
                          loading="lazy"
                          src={item.src}
                          onError={() => handleImageError(item.id)}
                        />
                      ) : (
                        <PlaceholderMedia
                          alt={`${product.name} — ${item.label}`}
                          aspectRatio="1 / 1"
                          label={item.label}
                          sizes="5rem"
                          tone={item.tone === "condition" ? "condition" : "neutral"}
                        />
                      )}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels as={Fragment}>
                  {gallery.map((item) => (
                    <TabPanel
                      key={item.id}
                      className="aspect-[4/5] overflow-hidden border border-[color:var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-panel)] max-[700px]:order-1"
                    >
                      {item.src && !failedImageIds.has(item.id) ? (
                        <button
                          aria-label={`Zoom in on ${item.altText || product.name}`}
                          className="block w-full h-full p-0 border-0 cursor-zoom-in"
                          type="button"
                          onClick={() => setIsLightboxOpen(true)}
                        >
                          <img
                            alt={item.altText || product.name}
                            className="block w-full h-full object-cover object-center"
                            src={item.src}
                            onError={() => handleImageError(item.id)}
                          />
                        </button>
                      ) : (
                        <PlaceholderMedia
                          alt={product.name}
                          aspectRatio="4 / 5"
                          label="Photo pending"
                          priority
                          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 90vw, 52vw"
                          tone={item.tone === "condition" ? "condition" : "neutral"}
                        />
                      )}
                    </TabPanel>
                  ))}
                </TabPanels>
              </div>
            </TabGroup>
          </div>

          <div
            className="grid gap-[var(--space-4)] p-[var(--space-5)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg)] col-start-2 row-start-1 row-span-3 self-start sticky top-[var(--site-header-scroll-offset)] max-[1100px]:static max-[1100px]:col-start-auto max-[1100px]:row-start-auto max-[1100px]:row-span-1"
          >
            <ProductBreadcrumb product={product} />

            <div className="flex flex-wrap gap-[0.6rem]">
              <span className="inline-flex items-center justify-center px-[0.45rem] py-[0.28rem] border border-[color:var(--color-green)] rounded-full text-[var(--color-green)] [font-family:var(--font-mono)] text-[0.68rem] tracking-[0.08em] uppercase">
                {product.status === "sold"
                  ? "SOLD"
                  : product.type === "rug"
                    ? "1 OF 1"
                    : "1 AVAILABLE"}
              </span>
              <span className="inline-flex items-center justify-center px-[0.45rem] py-[0.28rem] border border-[color:var(--color-border)] rounded-full text-[var(--color-text-subtle)] [font-family:var(--font-mono)] text-[0.68rem] tracking-[0.08em] uppercase">
                {product.catalogNumber}
              </span>
            </div>

            <h1 className="text-[clamp(2.35rem,4vw,3.5rem)]">{product.name}</h1>
            <p className="text-[var(--color-green)] text-[clamp(1.8rem,3vw,2.3rem)] leading-[1.05]">
              {product.priceUsdLabel}
            </p>

            {product.status === "sold" ? (
              <SoldPurchaseShell />
            ) : product.type === "rug" ? (
              <RugPurchaseShell product={product} />
            ) : (
              <MultiUnitPurchaseShell product={product} />
            )}

            <p className="text-[var(--color-text-muted)] text-base leading-[1.7]">{product.subtitle}</p>

            <section className={PANEL_CARD} aria-label="Verification promise">
              <p className={PANEL_EYEBROW}>Verification promise</p>
              <p>
                We send daylight photos of the exact piece, including wear and condition, before the charge is captured.
              </p>
            </section>

            <section className={PANEL_CARD} aria-label="Shipping and returns">
              <ul className="grid gap-[0.6rem] m-0 pl-[1.1rem] text-[var(--color-ink)] marker:text-[var(--color-green)]">
                <li>Tracked shipping from Casablanca.</li>
                <li>Approval before payment capture.</li>
                <li>Condition is shown in photos, not softened in copy.</li>
                <li>Questions handled directly before dispatch.</li>
              </ul>
            </section>

            {product.merchandisingNote ? (
              <section className={PANEL_CARD}>
                <p className={PANEL_EYEBROW}>Founder sourcing note</p>
                <p>{product.merchandisingNote}</p>
              </section>
            ) : null}
          </div>

          <div className="grid gap-[var(--space-3)]">
            <p className={PANEL_EYEBROW}>Specifications</p>
            <dl className="grid border-t border-b border-[color:var(--color-border)]">
              {specRows.map((row) => (
                <div
                  key={row.label}
                  className="grid grid-cols-[8rem_1fr] gap-[var(--space-3)] py-[0.8rem] border-t border-[color:var(--color-border-soft)] first:border-t-0 max-[700px]:grid-cols-1 max-[700px]:gap-[0.35rem]"
                >
                  <dt className="text-[var(--color-text-subtle)] text-[0.82rem] uppercase tracking-[0.08em]">
                    {row.label}
                  </dt>
                  <dd className="m-0 text-[var(--color-ink)] leading-[1.65]">{row.value}</dd>
                </div>
              ))}
            </dl>
          </div>

          {product.description || product.detailSections.length > 0 ? (
            <div className="grid gap-[var(--space-5)] max-w-[34rem]">
              {product.description ? (
                <section aria-label="Description">
                  <p className={PANEL_EYEBROW}>Description</p>
                  <p className="leading-[1.65]">{product.description}</p>
                </section>
              ) : null}

              {product.detailSections.map((section) => (
                <section key={section.title}>
                  <h3 className={PANEL_EYEBROW}>{section.title}</h3>
                  <p className="text-[var(--color-ink)] leading-[1.65]">{section.body}</p>
                </section>
              ))}
            </div>
          ) : null}
        </div>
      </Section>

      {displayedRecommendations.length ? (
        <Section width="wide">
          <div className="grid gap-[var(--space-4)]">
            <div className="grid gap-[var(--space-2)]">
              <p className={PANEL_EYEBROW}>{recommendationPresentation.eyebrow}</p>
              <h2 className="text-[clamp(1.8rem,3vw,2.6rem)]">{recommendationPresentation.heading}</h2>
            </div>
            <div
              className="grid grid-cols-4 gap-[var(--space-4)] max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1"
              aria-label={recommendationPresentation.ariaLabel}
            >
              {displayedRecommendations.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {displayedCrossSellRecommendations.length ? (
        <Section width="wide">
          <div className="grid gap-[var(--space-4)]">
            <div className="grid gap-[var(--space-2)]">
              <p className={PANEL_EYEBROW}>{crossSellPresentation.eyebrow}</p>
              <h2 className="text-[clamp(1.8rem,3vw,2.6rem)]">{crossSellPresentation.heading}</h2>
            </div>
            <div
              className="grid grid-cols-4 gap-[var(--space-4)] max-[1100px]:grid-cols-2 max-[700px]:grid-cols-1"
              aria-label={crossSellPresentation.ariaLabel}
            >
              {displayedCrossSellRecommendations.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {product.status !== "sold" ? (
        <div
          className="hidden max-[700px]:fixed max-[700px]:inset-x-0 max-[700px]:bottom-0 max-[700px]:z-40 max-[700px]:flex max-[700px]:items-center max-[700px]:justify-between max-[700px]:gap-[var(--space-3)] max-[700px]:px-[var(--space-4)] max-[700px]:py-[var(--space-3)] max-[700px]:pb-[calc(var(--space-3)_+_env(safe-area-inset-bottom))] max-[700px]:border-t max-[700px]:border-[color:var(--color-border)] max-[700px]:bg-[var(--color-bg)] max-[700px]:shadow-[0_-4px_12px_rgba(20,20,20,0.12)]"
        >
          <span className="text-[var(--color-green)] text-[1.1rem] font-semibold whitespace-nowrap">
            {product.priceUsdLabel}
          </span>
          <button
            className="inline-flex items-center justify-center min-h-[3rem] px-[1.2rem] py-[0.7rem] border border-[color:var(--color-green)] rounded-[4px] bg-[var(--color-green)] text-[var(--color-bg)] font-medium whitespace-nowrap cursor-pointer"
            type="button"
            onClick={reserveProduct}
          >
            Reserve this piece
          </button>
        </div>
      ) : null}

      {activeImage?.src && !activeImageBroken ? (
        <Dialog
          className="relative z-[1000]"
          open={isLightboxOpen}
          onClose={() => setIsLightboxOpen(false)}
        >
          <DialogBackdrop className="fixed inset-0 bg-[rgba(20,20,20,0.9)]" />
          <div className="fixed inset-0 flex items-center justify-center p-[var(--space-5)]">
            <button
              aria-label="Close zoomed image"
              className="absolute top-[var(--space-4)] right-[var(--space-4)] px-[1rem] py-[0.6rem] border border-[color:var(--color-bg)] rounded-full bg-transparent text-[var(--color-bg)] text-[0.85rem]"
              type="button"
              onClick={() => setIsLightboxOpen(false)}
            >
              Close
            </button>
            <DialogPanel className="max-w-full max-h-full">
              <img
                alt={activeImageAlt}
                className="block max-w-full max-h-full object-contain"
                src={activeImage.src}
              />
            </DialogPanel>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}

function createDisplayGallery(product: ProductDetailPageViewModel): DisplayGalleryItem[] {
  const allImages = product.gallery;

  return allImages.map((item, index) => ({
    ...item,
    label: index === allImages.length - 1 ? "Condition" : item.label,
    tone: index === allImages.length - 1 ? ("condition" as const) : ("neutral" as const),
  }));
}

function buildSpecificationRows(product: ProductDetailPageViewModel) {
  const rows: { label: string; value: string }[] = [];

  const sizeValue =
    product.type === "rug"
      ? product.dimensionsLabel
      : product.dimensionsCm
        ? formatMultiUnitDimensions(product.dimensionsCm)
        : undefined;

  if (sizeValue) {
    rows.push({ label: "Size", value: sizeValue });
  }

  rows.push(
    { label: "Material", value: product.materialLabel || "See listing" },
    { label: "Origin", value: product.originLabel || "Morocco" },
  );

  if (product.type === "rug") {
    rows.push({ label: "Style", value: product.rugStyle ?? "Handwoven rug" });
    if (product.techniqueLabel) {
      rows.push({ label: "Technique", value: product.techniqueLabel });
    }
  }

  rows.push({ label: "Age", value: product.category === "vintage" ? "Vintage" : "Handmade contemporary piece" });

  const conditionNote = extractConditionNote(product);
  if (conditionNote) {
    rows.push({ label: "Condition", value: conditionNote });
  }

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
    product.descriptionSections.find((section) => /condition/i.test(section.title))?.body;

  if (!conditionSection) {
    return undefined;
  }

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
    <nav aria-label="Breadcrumb">
      <ol className="flex flex-wrap gap-[0.35rem] m-0 p-0 list-none text-[var(--color-text-subtle)] text-[0.78rem]">
        {items.map((item) => (
          <li
            key={item.label}
            className="inline-flex gap-[0.35rem] items-center [&:not(:last-child)]:after:content-['/']"
          >
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
      eyebrow: "From the stockroom",
      heading: "More from the stockroom.",
      ariaLabel: `${categoryLabel} from the stockroom`,
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
  const reserve = useReserveProduct(product);

  return (
    <div className={PANEL_CARD}>
      <button className={`${PRIMARY_ACTION} cursor-pointer`} type="button" onClick={reserve}>
        Reserve this piece — {product.priceUsdLabel}
      </button>
      <p className={PURCHASE_MICROCOPY}>
        Card authorized now, charged only after your approval.
      </p>
    </div>
  );
}

function SoldPurchaseShell() {
  return (
    <div className={PANEL_CARD}>
      <strong>This piece is sold.</strong>
      <p className={PURCHASE_MICROCOPY}>
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
  const reserve = useReserveProduct(product);

  return (
    <div className={PANEL_CARD}>
      <button className={`${PRIMARY_ACTION} cursor-pointer`} type="button" onClick={reserve}>
        Reserve this piece — {product.priceUsdLabel}
      </button>
      <p className={PURCHASE_MICROCOPY}>
        Availability is confirmed before any charge is captured.
      </p>
    </div>
  );
}

function useReserveProduct(product: ProductDetailPageViewModel) {
  const { addProduct } = useCart();
  const router = useRouter();

  return () => {
    addProduct({ product: product.cartProduct, quantity: 1 });
    router.push("/checkout");
  };
}
