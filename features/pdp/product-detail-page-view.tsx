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
import NextImage from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent, RefObject } from "react";

import { CompareAtPrice } from "@/components/commerce/compare-at-price";
import { NewsletterSignupIntentForm } from "@/components/analytics/newsletter-signup-intent-form";
import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { Section } from "@/components/layout/section";
import { useCart } from "@/features/cart/cart-provider";
import { ProductCard, recommendationRailCardSizes } from "@/features/catalog/product-card";
import { getRugStyleCollection } from "@/features/catalog/rug-style-collections";
import { trackViewItem } from "@/lib/analytics/gtag";
import { unavailableCopy, type ProductAvailability, type UnavailableReason } from "@/lib/catalog/availability";
import { formatMultiUnitDimensions, getCategoryLabel } from "@/lib/catalog/helpers";
import { parseProductTitle } from "@/lib/catalog/product-card-name";
import { normalizeSlug } from "@/lib/catalog/product-validation";
import type { RugPageLinks } from "@/lib/catalog/service";
import { calculateShippingUsd } from "@/lib/order/shipping";
import { storePromise, storePromiseCopy } from "@/lib/order/store-promise";
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
  /**
   * The rug's breadcrumb Region level and Type / Region row links, each only
   * while that page is indexed (getRugPageLinks, a live catalog read only the
   * rug route makes). Absent on the category route: no level, no links.
   */
  rugLinks?: RugPageLinks;
};

type GalleryItem = ProductDetailPageViewModel["gallery"][number];

const noRugLinks: RugPageLinks = {};

const PANEL_CARD = "grid gap-[var(--space-3)] p-[var(--space-4)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-panel)]";
const PANEL_EYEBROW = "text-[var(--color-green)] text-[0.72rem] font-semibold tracking-[0.08em] uppercase";
const PRIMARY_ACTION = "inline-flex items-center justify-center min-h-[3rem] px-[1rem] py-[0.8rem] border border-[color:var(--color-green)] rounded-[4px] bg-[var(--color-green)] text-[var(--color-bg)] font-medium";
const SECONDARY_ACTION = "inline-flex items-center justify-center min-h-[3rem] px-[1rem] py-[0.8rem] border border-[color:var(--color-green)] rounded-[4px] bg-transparent text-[var(--color-green)] font-medium";
const PURCHASE_MICROCOPY = "text-[var(--color-text-muted)] text-[0.92rem]";
const APPROVAL_MICROCOPY = "Card authorized at checkout, charged only after your approval.";
const LIGHTBOX_CONTROL = "px-[1rem] py-[0.6rem] border border-[color:var(--color-bg)] rounded-full bg-transparent text-[var(--color-bg)] text-[0.85rem] cursor-pointer";

export function ProductDetailPageView({
  product,
  rugLinks = noRugLinks,
}: ProductDetailPageViewProps) {
  const gallery = product.gallery;
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [preferredHistoryCategory, setPreferredHistoryCategory] = useState<ProductCategory | null>(null);
  const [failedImageIds, setFailedImageIds] = useState<Set<string>>(new Set());
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isPointerFine, setIsPointerFine] = useState(false);
  const enlargeButtonRef = useRef<HTMLButtonElement | null>(null);
  const { reserve: reserveProduct } = usePurchaseActions(product);
  const purchaseState = product.availability;
  const shippingCopy = getShippingCopy(product.priceUsd);
  const contentsNote = getContentsNote(product);
  const title = parseProductTitle(product.name);

  useEffect(() => {
    setActiveImageIndex(0);
    setFailedImageIds(new Set());
    setIsLightboxOpen(false);
  }, [product.id]);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(hover: hover) and (pointer: fine)");

    function syncPointerMode() {
      setIsPointerFine(mediaQuery.matches);
    }

    syncPointerMode();
    mediaQuery.addEventListener("change", syncPointerMode);

    return () => {
      mediaQuery.removeEventListener("change", syncPointerMode);
    };
  }, []);

  const handleImageError = (id: string) => {
    setFailedImageIds((previous) => {
      if (previous.has(id)) {
        return previous;
      }
      return new Set(previous).add(id);
    });

    // The lightbox only renders a photo that loads. If the one it shows fails,
    // move on to the next good photo, or close, so the open state never
    // outlives the dialog and reopens it on the next thumbnail click.
    if (isLightboxOpen && gallery[activeImageIndex]?.id === id) {
      const nextIndex = findAdjacentViewableIndex(gallery, new Set(failedImageIds).add(id), activeImageIndex, 1);

      if (nextIndex === null) {
        closeLightbox();
      } else {
        setActiveImageIndex(nextIndex);
      }
    }
  };

  function closeLightbox() {
    setIsLightboxOpen(false);
    // Headless UI returns focus to the button that opened the dialog, but that
    // button unmounts once the shopper moves to another photo.
    requestAnimationFrame(() => enlargeButtonRef.current?.focus());
  }

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
  const viewableImageIndexes = gallery.flatMap((item, index) =>
    item.src && !failedImageIds.has(item.id) ? [index] : [],
  );
  const activeViewablePosition = viewableImageIndexes.indexOf(activeImageIndex);

  function showAdjacentImage(step: 1 | -1) {
    const nextIndex = findAdjacentViewableIndex(gallery, failedImageIds, activeImageIndex, step);

    if (nextIndex !== null) {
      setActiveImageIndex(nextIndex);
    }
  }

  function handleLightboxKeyDown(event: ReactKeyboardEvent<HTMLDivElement>) {
    if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
      event.preventDefault();
      showAdjacentImage(event.key === "ArrowLeft" ? -1 : 1);
    }
  }
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
  const specRows = buildSpecificationRows(product, rugLinks);

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
                        `relative block aspect-square p-0 border-0 rounded-[var(--radius-md)] bg-[var(--color-panel)] overflow-hidden focus:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-green)] focus-visible:ring-offset-2 ${
                          selected
                            ? "ring-2 ring-inset ring-[color:var(--color-green)]"
                            : "ring-1 ring-inset ring-[color:var(--color-border)]"
                        }`
                      }
                    >
                      {item.src && !failedImageIds.has(item.id) ? (
                        <NextImage
                          alt={item.altText || product.name}
                          className="block object-cover object-center"
                          fill
                          loading="lazy"
                          sizes="5rem"
                          src={item.thumbSrc}
                          onError={() => handleImageError(item.id)}
                        />
                      ) : (
                        <PlaceholderMedia
                          alt={`${product.name}, ${item.label}`}
                          aspectRatio="1 / 1"
                          label={item.label}
                          sizes="5rem"
                        />
                      )}
                    </Tab>
                  ))}
                </TabList>

                <TabPanels as={Fragment}>
                  {gallery.map((item, index) => (
                    <TabPanel
                      key={item.id}
                      className="h-[min(78vh,40rem)] max-[700px]:h-[60vh] flex items-center justify-center overflow-hidden border border-[color:var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-panel)] max-[700px]:order-1"
                    >
                      <ProductHeroImage
                        enlargeButtonRef={index === activeImageIndex ? enlargeButtonRef : undefined}
                        isBroken={failedImageIds.has(item.id)}
                        isPointerFine={isPointerFine}
                        item={item}
                        priority={index === 0}
                        productName={product.name}
                        onImageError={handleImageError}
                        onOpenLightbox={() => setIsLightboxOpen(true)}
                      />
                    </TabPanel>
                  ))}
                </TabPanels>
              </div>
            </TabGroup>

            {isPointerFine ? (
              <p className="mt-[0.6rem] text-[var(--color-text-subtle)] text-[0.78rem]">
                Hover the photo to inspect the weave.
              </p>
            ) : null}
          </div>

          <div
            className="grid gap-[var(--space-4)] p-[var(--space-5)] border border-[color:var(--color-border)] rounded-[var(--radius-lg)] bg-[var(--color-bg)] col-start-2 row-start-1 row-span-3 self-start sticky top-[var(--site-header-scroll-offset)] max-[1100px]:static max-[1100px]:col-start-auto max-[1100px]:row-start-auto max-[1100px]:row-span-1"
          >
            <ProductBreadcrumb product={product} rugLinks={rugLinks} />

            <div className="flex flex-wrap gap-[0.6rem]">
              <span className="inline-flex items-center justify-center px-[0.45rem] py-[0.28rem] border border-[color:var(--color-green)] rounded-full text-[var(--color-green)] [font-family:var(--font-mono)] text-[0.68rem] tracking-[0.08em] uppercase">
                {getStatusPillLabel(product, purchaseState)}
              </span>
              <span className="inline-flex items-center justify-center px-[0.45rem] py-[0.28rem] border border-[color:var(--color-border)] rounded-full text-[var(--color-text-subtle)] [font-family:var(--font-mono)] text-[0.68rem] tracking-[0.08em] uppercase">
                {product.catalogNumber}
              </span>
            </div>

            <h1 className="text-[clamp(1.65rem,4vw,3.5rem)]">
              {title.name}
              {title.size ? (
                <>
                  {" "}
                  <span className="block mt-[0.4rem] [font-family:var(--font-body)] text-[clamp(1rem,1.6vw,1.2rem)] text-[var(--color-text-muted)]">
                    {title.size}
                  </span>
                </>
              ) : null}
            </h1>
            <div className="grid gap-[0.35rem]">
              <p className="text-[var(--color-green)] text-[clamp(1.8rem,3vw,2.3rem)] leading-[1.26]">
                {product.priceUsdLabel}
                <CompareAtPrice
                  className="ml-[0.6rem] text-[var(--color-text-muted)] text-[0.6em] align-middle"
                  label={product.compareAtPriceUsdLabel}
                />
                {product.compareAtPriceUsdLabel ? (
                  <span className="ml-[0.6rem] align-middle inline-block rounded-full border border-[color:var(--color-green)] px-[0.55rem] py-[0.1rem] text-[0.42em] uppercase tracking-[0.08em]">
                    Sale
                  </span>
                ) : null}
              </p>
              {purchaseState === "available" ? (
                <p className={PURCHASE_MICROCOPY}>{shippingCopy.full}</p>
              ) : null}
              {contentsNote ? (
                <p className="text-[var(--color-ink)] font-medium">{contentsNote.value}</p>
              ) : null}
            </div>

            {purchaseState !== "available" ? (
              <UnavailablePurchaseShell product={product} state={purchaseState} />
            ) : product.type === "rug" ? (
              <RugPurchaseShell product={product} />
            ) : (
              <MultiUnitPurchaseShell product={product} />
            )}

            <p className="text-[var(--color-text-muted)] text-base leading-[1.7]">{product.subtitle}</p>

            <section className={PANEL_CARD} aria-label="Verification promise">
              <p className={PANEL_EYEBROW}>Verification promise</p>
              <p>
                We send {storePromise.approvalMedia} of the exact piece, including wear and condition,{" "}
                {storePromiseCopy.approvalTurnaround} of your order. Your card is charged only after you approve.
              </p>
            </section>

            <section className={PANEL_CARD} aria-label="Shipping and returns">
              <p className={PANEL_EYEBROW}>Shipping and returns</p>
              <ul className="grid gap-[0.6rem] m-0 pl-[1.1rem] text-[var(--color-ink)] marker:text-[var(--color-green)]">
                <li>
                  {storePromiseCopy.shipsFrom} to {storePromise.shipsToLabel}. Dispatched within{" "}
                  {storePromiseCopy.dispatchWindow} of your approval; delivery usually takes{" "}
                  {storePromiseCopy.deliveryWindow} after dispatch.
                </li>
                <li>{storePromiseCopy.shipping}.</li>
                <li>{storePromiseCopy.duties}</li>
                <li>
                  {storePromiseCopy.returns}{" "}
                  <Link className="underline underline-offset-2 text-[var(--color-green)]" href="/returns-policy">
                    Read the returns policy
                  </Link>
                </li>
              </ul>
            </section>
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
                  <dd className="m-0 text-[var(--color-ink)] leading-[1.65]">
                    {row.href ? <Link href={row.href}>{row.value}</Link> : row.value}
                  </dd>
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
                  <h2 className={PANEL_EYEBROW}>{section.title}</h2>
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
                <ProductCard
                  key={item.id}
                  product={item}
                  sizes={recommendationRailCardSizes}
                  titleAs="p"
                />
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
                <ProductCard
                  key={item.id}
                  product={item}
                  sizes={recommendationRailCardSizes}
                  titleAs="p"
                />
              ))}
            </div>
          </div>
        </Section>
      ) : null}

      {purchaseState === "available" ? (
        <div
          className="pdp-sticky-buy hidden max-[700px]:fixed max-[700px]:inset-x-0 max-[700px]:bottom-0 max-[700px]:z-40 max-[700px]:flex max-[700px]:items-center max-[700px]:justify-between max-[700px]:gap-[var(--space-3)] max-[700px]:px-[var(--space-4)] max-[700px]:py-[var(--space-3)] max-[700px]:pb-[calc(var(--space-3)_+_env(safe-area-inset-bottom))] max-[700px]:border-t max-[700px]:border-[color:var(--color-border)] max-[700px]:bg-[var(--color-bg)] max-[700px]:shadow-[0_-4px_12px_rgba(20,20,20,0.12)]"
        >
          <span className="grid">
            <span className="text-[var(--color-green)] text-[1.1rem] font-semibold whitespace-nowrap">
              {product.priceUsdLabel}
              <CompareAtPrice
                className="ml-[0.4rem] text-[var(--color-text-muted)] text-[0.8rem] font-normal"
                label={product.compareAtPriceUsdLabel}
              />
            </span>
            <span className="text-[var(--color-text-muted)] text-[0.78rem]">{shippingCopy.short}</span>
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
          onClose={closeLightbox}
          onKeyDown={handleLightboxKeyDown}
        >
          <DialogBackdrop className="fixed inset-0 bg-[rgba(20,20,20,0.9)]" />
          <div className="fixed inset-0 flex items-center justify-center p-[var(--space-5)]">
            <button
              aria-label="Close zoomed image"
              className={`absolute top-[var(--space-4)] right-[var(--space-4)] ${LIGHTBOX_CONTROL}`}
              type="button"
              onClick={closeLightbox}
            >
              Close
            </button>
            {/* Headless UI closes the dialog on clicks outside the panel, so the
                previous and next controls live inside it. */}
            <DialogPanel className="grid justify-items-center gap-[var(--space-3)]">
              <img
                alt={activeImageAlt}
                className="block w-auto h-auto max-w-[92vw] max-h-[78vh] object-contain"
                src={activeImage.src}
                onError={() => handleImageError(activeImage.id)}
              />
              {viewableImageIndexes.length > 1 ? (
                <div className="flex items-center gap-[var(--space-3)] text-[var(--color-bg)]">
                  <button
                    aria-label="Previous image"
                    className={LIGHTBOX_CONTROL}
                    type="button"
                    onClick={() => showAdjacentImage(-1)}
                  >
                    Previous
                  </button>
                  <p aria-live="polite" className="m-0 text-[var(--color-bg)] text-[0.85rem] tabular-nums">
                    {activeViewablePosition + 1} of {viewableImageIndexes.length}
                  </p>
                  <button
                    aria-label="Next image"
                    className={LIGHTBOX_CONTROL}
                    type="button"
                    onClick={() => showAdjacentImage(1)}
                  >
                    Next
                  </button>
                </div>
              ) : null}
            </DialogPanel>
          </div>
        </Dialog>
      ) : null}
    </div>
  );
}

const LENS_SIZE = 180;
const LENS_ZOOM = 2.5;

function ProductHeroImage({
  enlargeButtonRef,
  item,
  productName,
  isBroken,
  isPointerFine,
  priority,
  onImageError,
  onOpenLightbox,
}: {
  enlargeButtonRef?: RefObject<HTMLButtonElement | null>;
  item: GalleryItem;
  productName: string;
  isBroken: boolean;
  isPointerFine: boolean;
  priority: boolean;
  onImageError: (id: string) => void;
  onOpenLightbox: () => void;
}) {
  const [naturalSize, setNaturalSize] = useState<{ width: number; height: number } | null>(null);
  const [isLensVisible, setIsLensVisible] = useState(false);
  const [isZoomReady, setIsZoomReady] = useState(false);
  const imageBoxRef = useRef<HTMLDivElement | null>(null);
  const lensRef = useRef<HTMLDivElement | null>(null);
  const pointerRef = useRef({ x: 0, y: 0 });
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  if (!item.src || isBroken) {
    return (
      <PlaceholderMedia
        alt={productName}
        aspectRatio="4 / 5"
        label="Photo pending"
        priority={priority}
        sizes="(max-width: 700px) 100vw, (max-width: 1100px) 90vw, 52vw"
      />
    );
  }

  const aspectRatio = naturalSize
    ? naturalSize.width / naturalSize.height
    : item.width && item.height
      ? item.width / item.height
      : 4 / 5;

  function updateLens() {
    frameRef.current = null;

    const box = imageBoxRef.current;
    const lens = lensRef.current;
    if (!box || !lens) {
      return;
    }

    const rect = box.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      return;
    }

    const half = LENS_SIZE / 2;
    const rawX = clamp(pointerRef.current.x - rect.left, 0, rect.width);
    const rawY = clamp(pointerRef.current.y - rect.top, 0, rect.height);

    const lensLeft = clamp(rawX - half, 0, Math.max(rect.width - LENS_SIZE, 0));
    const lensTop = clamp(rawY - half, 0, Math.max(rect.height - LENS_SIZE, 0));

    const bgWidth = rect.width * LENS_ZOOM;
    const bgHeight = rect.height * LENS_ZOOM;

    // background-position is relative to the lens's own box (180px), not the
    // image box, so the pan offset must center the cursor's *scaled* position
    // inside the lens, then clamp so no blank space past the image edges shows.
    const bgX = clamp(half - rawX * LENS_ZOOM, Math.min(LENS_SIZE - bgWidth, 0), 0);
    const bgY = clamp(half - rawY * LENS_ZOOM, Math.min(LENS_SIZE - bgHeight, 0), 0);

    lens.style.transform = `translate3d(${lensLeft}px, ${lensTop}px, 0)`;
    lens.style.backgroundSize = `${bgWidth}px ${bgHeight}px`;
    lens.style.backgroundPosition = `${bgX}px ${bgY}px`;
  }

  function scheduleLensUpdate(event: ReactPointerEvent<HTMLDivElement>) {
    pointerRef.current = { x: event.clientX, y: event.clientY };
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(updateLens);
    }
  }

  function handlePointerEnter(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isPointerFine || event.pointerType !== "mouse") {
      return;
    }

    if (!isZoomReady) {
      const preload = new Image();
      preload.onload = () => setIsZoomReady(true);
      preload.src = item.zoomSrc;
    }

    setIsLensVisible(true);
    scheduleLensUpdate(event);
  }

  function handlePointerMove(event: ReactPointerEvent<HTMLDivElement>) {
    if (!isPointerFine || event.pointerType !== "mouse") {
      return;
    }

    scheduleLensUpdate(event);
  }

  function handlePointerLeave() {
    if (frameRef.current !== null) {
      cancelAnimationFrame(frameRef.current);
      frameRef.current = null;
    }
    setIsLensVisible(false);
  }

  return (
    <div
      ref={imageBoxRef}
      className="relative max-w-full h-full"
      style={{ aspectRatio: String(aspectRatio) }}
      onPointerEnter={handlePointerEnter}
      onPointerLeave={handlePointerLeave}
      onPointerMove={handlePointerMove}
    >
      <button
        ref={enlargeButtonRef}
        aria-label={`Enlarge photo: ${item.altText || productName}`}
        className="block w-full h-full p-0 border-0 cursor-zoom-in focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--color-green)] focus-visible:ring-offset-2"
        type="button"
        onClick={onOpenLightbox}
      >
        <NextImage
          alt={item.altText || productName}
          className="block object-contain"
          fill
          priority={priority}
          // Matches the PlaceholderMedia fallback declared for this same slot
          // above, so the real photo and the placeholder reserve identical space.
          sizes="(max-width: 700px) 100vw, (max-width: 1100px) 90vw, 52vw"
          src={item.src}
          onError={() => onImageError(item.id)}
          onLoad={(event) => {
            // next/image forwards the underlying <img>'s load event, so
            // naturalWidth/naturalHeight are still readable here and continue to
            // drive the container's aspect ratio.
            const target = event.currentTarget;
            setNaturalSize({ width: target.naturalWidth, height: target.naturalHeight });
          }}
        />
      </button>

      {isPointerFine ? (
        <div
          ref={lensRef}
          aria-hidden="true"
          className={`absolute top-0 left-0 w-[180px] h-[180px] bg-no-repeat rounded-[var(--radius-md)] border-2 border-[color:var(--color-border)] shadow-[0_8px_20px_rgba(20,20,20,0.25)] pointer-events-none transition-opacity duration-75 motion-reduce:transition-none ${
            isLensVisible ? "opacity-100" : "opacity-0"
          }`}
          style={{ backgroundImage: `url(${isZoomReady ? item.zoomSrc : item.src})` }}
        />
      ) : null}
    </div>
  );
}

/** The next photo in `step` direction that has a source and has not failed, wrapping; null when there is none. */
function findAdjacentViewableIndex(
  gallery: GalleryItem[],
  failedImageIds: ReadonlySet<string>,
  fromIndex: number,
  step: 1 | -1,
) {
  for (let offset = 1; offset < gallery.length; offset += 1) {
    const index = (((fromIndex + step * offset) % gallery.length) + gallery.length) % gallery.length;
    const item = gallery[index];

    if (item?.src && !failedImageIds.has(item.id)) {
      return index;
    }
  }

  return null;
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function getContentsNote(product: ProductDetailPageViewModel): { label: string; value: string } | null {
  if (product.type !== "multiUnit") {
    return null;
  }

  switch (product.category) {
    case "poufs":
      return { label: "Ships as", value: "Flat and unstuffed. You fill it at home." };
    case "pillows":
      return product.cartProduct.insertIncluded
        ? { label: "Includes", value: "Cover and insert." }
        : { label: "Includes", value: "Cover only. No insert." };
    default:
      return null;
  }
}

/**
 * Older poufs carry their height only in the title ("24\" × 24\" × 14\"").
 * A recorded heightCm always wins.
 */
function formatMultiUnitSize(product: MultiUnitProductDetailPageViewModel) {
  const { heightCm } = product.cartProduct;
  const titleHeight = product.category === "poufs" ? parseProductTitle(product.name).height : undefined;
  const height = heightCm
    ? formatHeightInBothUnits(heightCm, "cm")
    : titleHeight
      ? formatTitleHeight(titleHeight)
      : undefined;
  const footprint = product.dimensionsCm ? formatMultiUnitDimensions(product.dimensionsCm) : undefined;

  if (!height) {
    return footprint;
  }

  return footprint ? `${footprint}, ${height} high` : `${height} high`;
}

/** "14\"" or "35 cm" from a title, in the footprint's "36 cm (14″)" form. Anything else is shown as written. */
function formatTitleHeight(height: string) {
  const match = /^(\d{1,3}(?:\.\d+)?)\s*(["”″]|inches|inch|in|cm)$/u.exec(height);

  if (!match) {
    return height;
  }

  return formatHeightInBothUnits(Number(match[1]), match[2] === "cm" ? "cm" : "in");
}

function formatHeightInBothUnits(value: number, unit: "cm" | "in") {
  return unit === "cm"
    ? `${value} cm (${Math.round(value / 2.54)}″)`
    : `${Math.round(value * 2.54)} cm (${value}″)`;
}

function buildSpecificationRows(product: ProductDetailPageViewModel, rugLinks: RugPageLinks) {
  const rows: { label: string; value: string; href?: Route }[] = [];

  const sizeValue =
    product.type === "rug" ? product.dimensionsLabel : formatMultiUnitSize(product);

  if (sizeValue) {
    rows.push({ label: "Size", value: sizeValue });
  }

  const contentsNote = getContentsNote(product);
  if (contentsNote) {
    rows.push(contentsNote);
  }

  rows.push(
    { label: "Material", value: product.materialLabel || "See listing" },
    { label: "Origin", value: product.originLabel || "Morocco" },
  );

  if (product.type === "rug") {
    // Type and Region come only from their own fields; an unset one is hidden.
    // Each links to its page while that page is indexed.
    if (product.typeLabel) {
      rows.push({
        label: "Type",
        value: product.typeLabel,
        ...(rugLinks.typeHref ? { href: rugLinks.typeHref as Route } : {}),
      });
    }

    if (product.regionLabel) {
      rows.push({
        label: "Region",
        value: product.regionLabel,
        ...(rugLinks.regionHref ? { href: rugLinks.regionHref as Route } : {}),
      });
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

  // The whole note: "Unused. No defects found." must not lose its second sentence.
  return conditionSection.replace(/\s*\n\s*/gu, " ").trim();
}

function ProductBreadcrumb({
  product,
  rugLinks,
}: {
  product: ProductDetailPageViewModel;
  rugLinks: RugPageLinks;
}) {
  const categoryPath = getProductCategoryHref(product);
  const styleCrumb = rugLinks.breadcrumb
    ? { label: rugLinks.breadcrumb.label, href: rugLinks.breadcrumb.href as Route }
    : null;
  const items: Array<{ label: string; href?: Route }> = [
    { label: "Home", href: "/" },
    { label: "Shop", href: "/shop" },
    { label: getCategoryLabel(product.category), href: categoryPath as Route },
    ...(styleCrumb ? [styleCrumb] : []),
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
  const { reserve } = usePurchaseActions(product);

  return (
    <div className={PANEL_CARD}>
      <button className={`${PRIMARY_ACTION} cursor-pointer`} type="button" onClick={reserve}>
        Reserve this piece — {product.priceUsdLabel}
      </button>
      <p className={PURCHASE_MICROCOPY}>{APPROVAL_MICROCOPY}</p>
    </div>
  );
}

/**
 * Checkout applies the free-shipping threshold to the cart subtotal after
 * discounts, so the page can only say what the piece does at full price.
 */
function getShippingCopy(priceUsd: number) {
  if (calculateShippingUsd(priceUsd) === 0) {
    return {
      short: "Qualifies for free shipping",
      full: `At full price, this piece qualifies for free shipping, wherever you are.`,
    };
  }

  return { short: storePromiseCopy.shipping, full: `${storePromiseCopy.shipping}.` };
}

function getStatusPillLabel(product: ProductDetailPageViewModel, purchaseState: ProductAvailability) {
  if (purchaseState !== "available") {
    return unavailableCopy[purchaseState].label;
  }

  return product.type === "rug" ? "1 OF 1" : `${product.cartProduct.inventory} AVAILABLE`;
}

function UnavailablePurchaseShell({
  product,
  state,
}: {
  product: ProductDetailPageViewModel;
  state: UnavailableReason;
}) {
  const similarInStock = product.similarRugs.slice(0, 3);
  const copy = unavailableCopy[state];

  return (
    <div className={PANEL_CARD}>
      <strong>{copy.headline}</strong>
      {copy.note ? <p className={PURCHASE_MICROCOPY}>{copy.note}</p> : null}
      <Link className={SECONDARY_ACTION} href={getProductCategoryHref(product)}>
        Shop {getCategoryLabel(product.category)}
      </Link>

      {similarInStock.length ? (
        <div className="grid gap-[var(--space-2)]">
          <p className={PANEL_EYEBROW}>Available now</p>
          <ul className="grid gap-[0.45rem] m-0 p-0 list-none">
            {similarInStock.map((item) => (
              <li key={item.id} className="flex flex-wrap justify-between gap-x-[var(--space-3)]">
                <Link className="underline underline-offset-2 text-[var(--color-ink)]" href={item.href as Route}>
                  {item.displayName}
                </Link>
                <span className="text-[var(--color-text-muted)]">{item.priceUsdLabel}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid gap-[var(--space-2)]">
        <p className="font-medium text-[var(--color-ink)]">Get an email when new pieces arrive</p>
        <NewsletterSignupIntentForm
          source="sold-piece"
          ctaLabel="Notify me"
          inputLabel="Email address"
          inputPlaceholder="Your email address"
        />
      </div>
    </div>
  );
}

function MultiUnitPurchaseShell({
  product,
}: {
  product: MultiUnitProductDetailPageViewModel;
}) {
  const { quantityInCart, reserve, addToCart } = usePurchaseActions(product);
  const [hasAddedToCart, setHasAddedToCart] = useState(false);
  const { inventory } = product.cartProduct;
  const isAllInCart = quantityInCart >= inventory;
  const cartStatus = isAllInCart ? `All ${inventory} available are in your cart.` : `${quantityInCart} in your cart.`;

  function handleAddToCart() {
    if (isAllInCart) {
      return;
    }

    addToCart();
    setHasAddedToCart(true);
  }

  return (
    <div className={PANEL_CARD}>
      <div className="grid grid-cols-2 gap-[var(--space-2)] max-[700px]:grid-cols-1">
        <button className={`${PRIMARY_ACTION} cursor-pointer`} type="button" onClick={reserve}>
          Reserve this piece
        </button>
        {/* aria-disabled, not disabled: a native disabled button drops the
            focus of the shopper who just pressed it to the page body. */}
        <button
          aria-disabled={isAllInCart}
          className={`${SECONDARY_ACTION} cursor-pointer aria-disabled:cursor-default aria-disabled:opacity-60`}
          type="button"
          onClick={handleAddToCart}
        >
          Add to cart
        </button>
      </div>
      {quantityInCart > 0 ? (
        <p className={PURCHASE_MICROCOPY}>
          {cartStatus}{" "}
          <Link className="underline underline-offset-2 text-[var(--color-green)]" href="/cart">
            View cart
          </Link>
        </p>
      ) : null}
      <p className="sr-only" role="status">
        {hasAddedToCart ? `Added to cart. ${cartStatus}` : ""}
      </p>
      <p className={PURCHASE_MICROCOPY}>
        {product.inventoryState === "lowStock" ? `${product.inventoryMessage} ` : ""}
        {APPROVAL_MICROCOPY}
      </p>
    </div>
  );
}

function usePurchaseActions(product: ProductDetailPageViewModel) {
  const { addProduct, items } = useCart();
  const router = useRouter();
  const quantityInCart = items
    .filter((item) => item.productId === product.id)
    .reduce((total, item) => total + item.quantity, 0);

  const image = product.gallery[0];
  const cartInput = {
    product: product.cartProduct,
    quantity: 1,
    imageUrl: image?.thumbSrc,
    imageAlt: image?.altText,
  };

  return {
    quantityInCart,
    // Reserve is "buy this now": with Add to cart beside it, adding again
    // would leave a shopper who clicked both with two of the piece.
    reserve() {
      if (quantityInCart === 0) {
        addProduct(cartInput);
      }
      router.push("/checkout");
    },
    addToCart() {
      addProduct(cartInput);
      // The mini cart in features/cart/cart-drawer.tsx opens on this event.
      window.dispatchEvent(new Event("loom-hearth:open-cart"));
    },
  };
}
