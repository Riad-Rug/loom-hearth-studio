"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Section } from "@/components/layout/section";
import { CatalogFilterControls } from "@/features/catalog/catalog-filter-controls";
import {
  catalogCategories,
  catalogLanding,
  genericSizeFilterOptions,
  rugSizeFilterOptions,
  type CatalogPriceFilter,
  type CatalogSizeFilter,
  type CatalogSortOption,
} from "@/features/catalog/catalog-data";
import {
  matchesAvailability,
  matchesCategoryFilter,
  matchesPriceFilter,
  matchesSearchQuery,
  matchesSizeFilter,
  parseCategoryFilter,
  parsePriceFilter,
  parseSizeFilter,
  parseSortOption,
  serializeCategoryFilter,
  serializePriceFilter,
  serializeSizeFilter,
  sortCatalogProducts,
  toggleCategoryFilter,
  togglePriceFilter,
  toggleSizeFilter,
} from "@/features/catalog/catalog-filters";
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

// Stable identity so the category-disabled branch never invalidates memos.
const noCategoriesSelected: readonly ProductCategory[] = [];

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
  const [selectedCategories, setSelectedCategories] = useState<ProductCategory[]>(() =>
    parseCategoryFilter(searchParams.get("category")),
  );
  const [selectedPrices, setSelectedPrices] = useState<CatalogPriceFilter[]>(() =>
    parsePriceFilter(searchParams.get("price")),
  );
  const [selectedSizes, setSelectedSizes] = useState<CatalogSizeFilter[]>(() =>
    parseSizeFilter(searchParams.get("size")),
  );
  const [sortOption, setSortOption] = useState<CatalogSortOption>(() =>
    parseSortOption(searchParams.get("sort")),
  );
  const [hideSold, setHideSold] = useState(() => searchParams.get("availability") === "available");
  const categoryMeta =
    category ? catalogCategories.find((item) => item.key === category) ?? null : null;
  const heroTitle = collection?.title ?? (categoryMeta ? categoryMeta.title : catalogLanding.title);
  const heroCopy =
    collection?.description ?? (categoryMeta ? categoryMeta.description : catalogLanding.description);
  const hasExactCategoryLink = collection?.href
    ? catalogCategories.some((item) => item.href === collection.href)
    : false;
  // The category group is only a filter where the server actually loaded every
  // category — the general /shop route. Category routes render it as navigation
  // instead (see CatalogFilterControls), so nothing here may act on a selection.
  const isCategoryFilterEnabled = !category;
  const activeCategories = isCategoryFilterEnabled ? selectedCategories : noCategoriesSelected;
  const isRugOnlyView = products.length > 0 && products.every((product) => product.type === "rug");
  const sizeFilterOptions = isRugOnlyView ? rugSizeFilterOptions : genericSizeFilterOptions;
  const sizeBucketCounts = useMemo(() => {
    const counts: Record<CatalogSizeFilter, number> = {
      accent: 0,
      small: 0,
      medium: 0,
      large: 0,
      oversized: 0,
    };

    for (const product of products) {
      if (product.sizeBucket) {
        counts[product.sizeBucket] += 1;
      }
    }

    return counts;
  }, [products]);
  const visibleSizeFilterOptions = useMemo(
    () => sizeFilterOptions.filter((option) => sizeBucketCounts[option.value] > 0),
    [sizeBucketCounts, sizeFilterOptions],
  );
  // A single tier is not a choice — every piece in view is that tier.
  const showSizeFilter = visibleSizeFilterOptions.length > 1;
  const sortedProducts = useMemo(
    () => sortCatalogProducts(products, sortOption),
    [products, sortOption],
  );
  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => {
      if (!matchesSearchQuery(product, normalizedQuery)) {
        return false;
      }

      if (!matchesCategoryFilter(product, activeCategories)) {
        return false;
      }

      if (!matchesPriceFilter(product, selectedPrices)) {
        return false;
      }

      if (!matchesSizeFilter(product, selectedSizes)) {
        return false;
      }

      if (!matchesAvailability(product, hideSold)) {
        return false;
      }

      return true;
    });
  }, [activeCategories, hideSold, normalizedQuery, selectedPrices, selectedSizes, sortedProducts]);
  // How many products each category would contribute under the OTHER active
  // filters (price/size/search/availability), ignoring category selection
  // itself — so an option a shopper hasn't picked yet can be greyed out when
  // ticking it would add nothing, without touching options already checked
  // (which must stay clickable so a shopper can always uncheck their way back).
  const categoryAvailability = useMemo(() => {
    if (!isCategoryFilterEnabled) {
      return null;
    }

    const counts: Partial<Record<ProductCategory, number>> = {};

    for (const product of products) {
      if (!matchesSearchQuery(product, normalizedQuery)) {
        continue;
      }

      if (!matchesPriceFilter(product, selectedPrices)) {
        continue;
      }

      if (!matchesSizeFilter(product, selectedSizes)) {
        continue;
      }

      if (!matchesAvailability(product, hideSold)) {
        continue;
      }

      counts[product.category] = (counts[product.category] ?? 0) + 1;
    }

    return counts;
  }, [hideSold, isCategoryFilterEnabled, normalizedQuery, products, selectedPrices, selectedSizes]);
  const displayedProductCountLabel = `${filteredProducts.length} ${
    filteredProducts.length === 1 ? "piece" : "pieces"
  }`;
  const catalogDescription =
    category || hasExactCategoryLink
      ? heroCopy
      : "Handmade rugs, poufs, pillows, artisanal decor and antiques across Morocco.";
  const activeCategoryKey = serializeCategoryFilter(activeCategories);
  const activePriceKey = serializePriceFilter(selectedPrices);
  const activeSizeKey = serializeSizeFilter(selectedSizes);
  const activeFilterCount = [
    Boolean(searchQuery.trim()),
    activeCategories.length > 0,
    selectedPrices.length > 0,
    selectedSizes.length > 0,
    sortOption !== "newest",
    hideSold,
  ].filter(Boolean).length;
  const filterKey = `${searchQuery.trim()}|${activeCategoryKey}|${activePriceKey}|${activeSizeKey}|${sortOption}|${hideSold}`;
  const lookbookSceneId = searchParams.get("scene");
  const fromLookbook = searchParams.get("from") === "lookbook";
  const lookbookContext = useMemo(() => {
    if (!fromLookbook || !lookbookSceneId) {
      return null;
    }

    return lookbookSceneContext.find((item) => item.id === lookbookSceneId) ?? null;
  }, [fromLookbook, lookbookSceneId]);

  // Reflect the filters into the address bar without a Next.js navigation: a real
  // navigation here (router.replace/push) re-runs the server component and refetches the
  // whole catalog on every change. Debounced so rapid changes don't spam history writes.
  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextParams = new URLSearchParams(window.location.search);
      updateQueryParam(nextParams, "q", searchQuery.trim());
      updateQueryParam(nextParams, "category", activeCategoryKey);
      updateQueryParam(nextParams, "price", activePriceKey);
      updateQueryParam(nextParams, "size", activeSizeKey);
      updateQueryParam(nextParams, "sort", sortOption === "newest" ? "" : sortOption);
      updateQueryParam(nextParams, "availability", hideSold ? "available" : "");

      const nextQuery = nextParams.toString();
      const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentHref = `${window.location.pathname}${window.location.search}`;

      if (nextHref !== currentHref) {
        window.history.replaceState(null, "", nextHref);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [activeCategoryKey, activePriceKey, activeSizeKey, hideSold, pathname, searchQuery, sortOption]);

  // Adopt filters that changed outside this component: the header's persistent search
  // bar (same-tab; it dispatches SHOP_QUERY_SYNC_EVENT after patching the address bar)
  // and browser back/forward navigation (native popstate).
  useEffect(() => {
    function syncFromLocation() {
      const params = new URLSearchParams(window.location.search);
      const nextQuery = params.get("q") ?? "";
      const nextCategories = isCategoryFilterEnabled
        ? parseCategoryFilter(params.get("category"))
        : [];
      const nextCategoryKey = serializeCategoryFilter(nextCategories);
      const nextPrices = parsePriceFilter(params.get("price"));
      const nextPriceKey = serializePriceFilter(nextPrices);
      const nextSizes = parseSizeFilter(params.get("size"));
      const nextSizeKey = serializeSizeFilter(nextSizes);
      const nextSort = parseSortOption(params.get("sort"));
      const nextHideSold = params.get("availability") === "available";

      setSearchQuery((current) => (current === nextQuery ? current : nextQuery));
      // Compared by serialized value: a fresh array with the same keys must not
      // re-render the grid or reset "Show more" pagination.
      setSelectedCategories((current) =>
        serializeCategoryFilter(current) === nextCategoryKey ? current : nextCategories,
      );
      setSelectedPrices((current) =>
        serializePriceFilter(current) === nextPriceKey ? current : nextPrices,
      );
      setSelectedSizes((current) =>
        serializeSizeFilter(current) === nextSizeKey ? current : nextSizes,
      );
      setSortOption((current) => (current === nextSort ? current : nextSort));
      setHideSold((current) => (current === nextHideSold ? current : nextHideSold));
    }

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(SHOP_QUERY_SYNC_EVENT, syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(SHOP_QUERY_SYNC_EVENT, syncFromLocation);
    };
  }, [isCategoryFilterEnabled]);

  const handleCategoryToggle = (value: ProductCategory) => {
    setSelectedCategories((current) => toggleCategoryFilter(current, value));
  };

  const handlePriceToggle = (value: CatalogPriceFilter) => {
    setSelectedPrices((current) => togglePriceFilter(current, value));
  };

  const handleSizeToggle = (value: CatalogSizeFilter) => {
    setSelectedSizes((current) => toggleSizeFilter(current, value));
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setSelectedCategories([]);
    setSelectedPrices([]);
    setSelectedSizes([]);
    setSortOption("newest");
    setHideSold(false);
  };

  return (
    <div className={styles.page} id="shop-top">
      <CatalogHistoryRecorder category={category} />

      <Section className={styles.productsSection} id="shop-products" width="wide">
        <div className={styles.catalogLayout}>
          <aside aria-label="Filter and sort" className={styles.filterSidebar}>
            <CatalogFilterControls
              activeFilterCount={activeFilterCount}
              categoryAvailability={categoryAvailability}
              categoryMode={isCategoryFilterEnabled ? "select" : "navigate"}
              hideSold={hideSold}
              onCategoryToggle={handleCategoryToggle}
              onClearAll={clearAllFilters}
              onHideSoldChange={setHideSold}
              onPriceToggle={handlePriceToggle}
              onSizeToggle={handleSizeToggle}
              onSortOptionChange={setSortOption}
              selectedCategories={activeCategories}
              selectedPrices={selectedPrices}
              selectedSizes={selectedSizes}
              showSizeFilter={showSizeFilter}
              sizeOptions={visibleSizeFilterOptions}
              sortOption={sortOption}
            />
          </aside>

          <div className={styles.catalogContent}>
            <div className={styles.shopHeaderMain}>
              <div className={styles.shopHeaderTitleRow}>
                <h1>{heroTitle}</h1>
                <p aria-atomic="true" aria-live="polite">
                  {displayedProductCountLabel}
                </p>
              </div>
              <p className={styles.shopHeaderTrustNote}>
                Each piece is individually made and won&apos;t be restocked.
              </p>
              <p className={styles.lede}>{catalogDescription}</p>
            </div>

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
              <CatalogProductBrowser products={filteredProducts} filterKey={filterKey} />
            ) : (
              <div className={styles.emptyCatalogState}>
                <p className={styles.eyebrow}>No matches</p>
                <h2>Nothing matches these filters yet.</h2>
                <p>Clear the filters to return to the full studio edit.</p>
                <div className={styles.sidebarActions}>
                  <button className={styles.primaryAction} type="button" onClick={clearAllFilters}>
                    Show all pieces
                  </button>
                </div>
              </div>
            )}
          </div>
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
