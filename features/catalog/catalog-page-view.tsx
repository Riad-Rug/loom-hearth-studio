"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Section } from "@/components/layout/section";
import { catalogCategories, catalogLanding } from "@/features/catalog/catalog-data";
import { CatalogHistoryRecorder } from "@/features/catalog/catalog-history-recorder";
import { CatalogProductBrowser } from "@/features/catalog/catalog-product-browser";
import { lookbookSceneContext } from "@/features/lookbook/lookbook-scene-context";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import type { ProductCategory } from "@/types/domain";

import styles from "./catalog-page.module.css";

// Fired by components/layout/site-header-client.tsx after it patches the address bar
// in place (history.pushState) while already on /shop, so this page can pick up the
// new search query without a full navigation/server refetch. Keep this event name in
// sync with that file.
const SHOP_QUERY_SYNC_EVENT = "lh:shop-query-sync";

type CatalogPageViewProps = {
  category?: ProductCategory;
  products: CatalogProductCardViewModel[];
  collection?: {
    eyebrow?: string;
    title: string;
    description: string;
    bullets: readonly string[];
    href?: string;
  };
};

export function CatalogPageView({ category, products, collection }: CatalogPageViewProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(() => searchParams.get("q") ?? "");
  const categoryMeta =
    category ? catalogCategories.find((item) => item.key === category) ?? null : null;
  const heroTitle = collection?.title ?? (categoryMeta ? categoryMeta.title : catalogLanding.title);
  const heroCopy =
    collection?.description ?? (categoryMeta ? categoryMeta.description : catalogLanding.description);
  const hasExactCategoryLink = collection?.href
    ? catalogCategories.some((item) => item.href === collection.href)
    : false;
  const filteredProducts = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    if (!normalizedQuery) {
      return products;
    }

    return products.filter((product) => {
      const haystack = [
        product.displayName,
        product.dimensionsLabel,
        product.subtitle,
        product.description,
        product.merchandisingNote,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [products, searchQuery]);
  const isSearchActive = Boolean(searchQuery.trim());
  const displayedProductCount = isSearchActive ? filteredProducts.length : products.length;
  const displayedProductCountLabel = `${displayedProductCount} ${
    displayedProductCount === 1 ? "piece" : "pieces"
  }`;
  const catalogDescription =
    category || hasExactCategoryLink
      ? heroCopy
      : "Handcrafted rugs, poufs, and decor from Marrakech. ONE OF A KIND pieces do not return once sold.";
  const lookbookSceneId = searchParams.get("scene");
  const fromLookbook = searchParams.get("from") === "lookbook";
  const lookbookContext = useMemo(() => {
    if (!fromLookbook || !lookbookSceneId) {
      return null;
    }

    return lookbookSceneContext.find((item) => item.id === lookbookSceneId) ?? null;
  }, [fromLookbook, lookbookSceneId]);

  // Reflect the search query into the address bar without a Next.js navigation: a real
  // navigation here (router.replace/push) re-runs the server component and refetches the
  // whole catalog on every change. Debounced so rapid changes don't spam history writes.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(window.location.search);
      updateQueryParam(nextParams, "q", searchQuery.trim());

      const nextQuery = nextParams.toString();
      const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentHref = `${window.location.pathname}${window.location.search}`;

      if (nextHref !== currentHref) {
        window.history.replaceState(null, "", nextHref);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [pathname, searchQuery]);

  // Adopt a search query that changed outside this component: the header's persistent
  // search bar (same-tab; it dispatches SHOP_QUERY_SYNC_EVENT after patching the address
  // bar) and browser back/forward navigation (native popstate).
  useEffect(() => {
    function syncFromLocation() {
      const nextQuery = new URLSearchParams(window.location.search).get("q") ?? "";
      setSearchQuery((current) => (current === nextQuery ? current : nextQuery));
    }

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(SHOP_QUERY_SYNC_EVENT, syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(SHOP_QUERY_SYNC_EVENT, syncFromLocation);
    };
  }, []);

  const clearSearch = () => {
    setSearchQuery("");
  };

  return (
    <div className={styles.page} id="shop-top">
      <CatalogHistoryRecorder category={category} />
      <Section className={styles.shopHeader} tone="muted" width="wide">
        <div className={styles.shopHeaderTitleRow}>
          <h1>{heroTitle}</h1>
          <p aria-atomic="true" aria-live="polite">
            {displayedProductCountLabel}
          </p>
        </div>
        <p className={styles.shopHeaderTrustNote}>
          Every rug is ONE OF A KIND. Sold pieces are not restocked.
        </p>
        <p className={styles.lede}>{catalogDescription}</p>
      </Section>

      <Section className={styles.productsSection} id="shop-products" width="wide">
        <div className={styles.catalogContent}>
          {lookbookContext ? (
            <div className={styles.lookbookContextBanner}>
              <p className={styles.lookbookContextEyebrow}>From the lookbook</p>
              <div className={styles.lookbookContextBannerBody}>
                <h2>{lookbookContext.title}</h2>
                <p>
                  This collection is where that {lookbookContext.roomLabel.toLowerCase()} scene
                  starts. Browse the related pieces without losing the room direction.
                </p>
              </div>
            </div>
          ) : null}

          {filteredProducts.length ? (
            <CatalogProductBrowser products={filteredProducts} searchQuery={searchQuery} />
          ) : (
            <div className={styles.emptyCatalogState}>
              <p className={styles.eyebrow}>No matches</p>
              <h2>Nothing matches this search yet.</h2>
              <p>Clear the current search to return to the full studio edit.</p>
              <div className={styles.sidebarActions}>
                <button className={styles.primaryAction} type="button" onClick={clearSearch}>
                  Show all pieces
                </button>
              </div>
            </div>
          )}
        </div>
      </Section>

      <Section className={styles.categoryTradeSection} tone="muted" width="wide">
        <div className={styles.tradePanel}>
          <div className={styles.tradePanelCopy}>
            <p className={styles.heroPanelLabel}>Trade and project support</p>
            <h2>Working on a Client Project?</h2>
            <p>
              Use the trade route for sourcing questions, image requests, and project-specific
              inquiries before you present a piece or move into checkout.
            </p>
          </div>
          <div className={styles.tradePanelActions}>
            <Link className={styles.secondaryAction} href="/trade">
              View trade support
            </Link>
            <Link className={styles.primaryAction} href="/contact?inquiryType=trade-request">
              Start a trade inquiry
            </Link>
          </div>
        </div>
      </Section>
    </div>
  );
}

function updateQueryParam(params: URLSearchParams, key: string, value: string) {
  if (value) {
    params.set(key, value);
    return;
  }

  params.delete(key);
}
