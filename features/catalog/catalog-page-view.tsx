"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { renderInline } from "@/components/content/markdown-body";
import { Section } from "@/components/layout/section";
import { CatalogFilterControls } from "@/features/catalog/catalog-filter-controls";
import {
  catalogBelowGridEssays,
  catalogCategories,
  type CatalogGuide,
  type CatalogIntroParagraph,
  catalogIntros,
  catalogLanding,
  catalogShippingScopeNote,
  type CatalogViewport,
  genericSizeFilterOptions,
  rugSizeFilterOptions,
  type CatalogPriceFilter,
  type CatalogSizeFilter,
  type CatalogSortOption,
  defaultCatalogSortOption,
} from "@/features/catalog/catalog-data";
import {
  countsTowardCategoryAvailability,
  listOfferedRugFilterOptions,
  matchesAvailability,
  matchesCategoryFilter,
  matchesPriceFilter,
  matchesRugRegionFilter,
  matchesRugTypeFilter,
  matchesSizeFilter,
  parseCategoryFilter,
  parsePriceFilter,
  parseRugFacetFilter,
  parseSizeFilter,
  parseSortOption,
  type RugFilterOption,
  serializeCategoryFilter,
  serializePriceFilter,
  serializeRugFacetFilter,
  serializeSizeFilter,
  sortCatalogProducts,
  toggleCategoryFilter,
  togglePriceFilter,
  toggleRugFacetFilter,
  toggleSizeFilter,
} from "@/features/catalog/catalog-filters";
import { CatalogHistoryRecorder } from "@/features/catalog/catalog-history-recorder";
import { CatalogProductBrowser } from "@/features/catalog/catalog-product-browser";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { searchCatalogProducts } from "@/lib/catalog/search";
import type { ProductCategory } from "@/types/domain";

import styles from "./catalog-page.module.css";

// Fired by components/layout/site-header-client.tsx after it patches the address bar
// in place (history.pushState) while already on /shop, so this page can pick up the
// new search query without a full navigation/server refetch. Keep this event name in
// sync with that file.
const SHOP_QUERY_SYNC_EVENT = "lh:shop-query-sync";

// Stable identity so the category-disabled branch never invalidates memos.
const noCategoriesSelected: readonly ProductCategory[] = [];
const noRugFilterOptions: readonly RugFilterOption[] = [];

type CatalogPageViewProps = {
  category?: ProductCategory;
  products: CatalogProductCardViewModel[];
  collection?: {
    eyebrow?: string;
    title: string;
    description: string;
    bullets: readonly string[];
    href?: string;
    guide?: CatalogGuide;
  };
  /**
   * Optional sub-category navigation rendered under the page lede — currently
   * the rug-style collections on /shop/rugs. Links, not filters: each one is a
   * separate indexable route, so they navigate rather than toggle. The server
   * decides which ones exist (only styles with stock are passed in).
   */
  styleLinks?: readonly { label: string; href: string }[];
  /**
   * Heading for that navigation. The rugs landing page is offering the shopper a
   * way in ("Shop by style"), while a style page is offering the way sideways to
   * its siblings ("Other rug types"), and the two read wrong under one label.
   */
  styleNavLabel?: string;
  /** A second link row under the first (/shop/rugs: "Shop by region" under "Shop by type"). */
  secondaryStyleLinks?: readonly { label: string; href: string }[];
  secondaryStyleNavLabel?: string;
  /**
   * Rug Type and Region filter options (every facet, in menu order). Only the
   * ones with a buyable rug in this view are shown; a group with one option
   * is left out.
   */
  rugFilterOptions?: readonly RugFilterOption[];
  /**
   * Where to send a shopper whose search found nothing: the categories and rug
   * styles that currently have stock, decided by the server like `styleLinks`.
   * Without it the empty search state only offers to clear the search.
   */
  searchFallbackLinks?: {
    categories: readonly { label: string; href: string }[];
    styles: readonly { label: string; href: string }[];
  };
};

export function CatalogPageView({
  category,
  products,
  collection,
  styleLinks,
  styleNavLabel = "Shop by style",
  secondaryStyleLinks,
  secondaryStyleNavLabel,
  rugFilterOptions = noRugFilterOptions,
  searchFallbackLinks,
}: CatalogPageViewProps) {
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
  const [availableOnly, setAvailableOnly] = useState(() => searchParams.get("availability") === "available");
  const [selectedRugTypes, setSelectedRugTypes] = useState<string[]>(() =>
    parseRugFacetFilter(searchParams.get("type"), rugFilterOptions),
  );
  const [selectedRugRegions, setSelectedRugRegions] = useState<string[]>(() =>
    parseRugFacetFilter(searchParams.get("region"), rugFilterOptions),
  );
  const offeredRugFilterOptions = useMemo(
    () => listOfferedRugFilterOptions(rugFilterOptions, products),
    [products, rugFilterOptions],
  );
  const rugTypeOptions = offeredRugFilterOptions.filter((option) => option.kind === "type");
  const rugRegionOptions = offeredRugFilterOptions.filter((option) => option.kind === "region");
  const [isEssayExpanded, setIsEssayExpanded] = useState(false);
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
  const trimmedQuery = searchQuery.trim();
  // Search results arrive best match first. That order stands for the default
  // sort; an explicit newest or price sort reorders them.
  const searchedProducts = useMemo(
    () => (trimmedQuery ? searchCatalogProducts(products, trimmedQuery) : products),
    [products, trimmedQuery],
  );
  const sortedProducts = useMemo(
    () => sortCatalogProducts(searchedProducts, sortOption),
    [searchedProducts, sortOption],
  );
  const filteredProducts = useMemo(() => {
    return sortedProducts.filter((product) => {
      if (!matchesCategoryFilter(product, activeCategories)) {
        return false;
      }

      if (!matchesPriceFilter(product, selectedPrices)) {
        return false;
      }

      if (!matchesSizeFilter(product, selectedSizes)) {
        return false;
      }

      if (!matchesAvailability(product, availableOnly)) {
        return false;
      }

      if (!matchesRugTypeFilter(product, selectedRugTypes) || !matchesRugRegionFilter(product, selectedRugRegions)) {
        return false;
      }

      return true;
    });
  }, [activeCategories, availableOnly, selectedPrices, selectedRugRegions, selectedRugTypes, selectedSizes, sortedProducts]);
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

    for (const product of searchedProducts) {
      if (!matchesPriceFilter(product, selectedPrices)) {
        continue;
      }

      if (!matchesSizeFilter(product, selectedSizes)) {
        continue;
      }

      // Stricter than the grid's own availability filter: an out-of-stock
      // multi-unit piece still renders in the grid, but it must not keep its
      // category's checkbox tickable when nothing there can be bought.
      if (!countsTowardCategoryAvailability(product, availableOnly)) {
        continue;
      }

      counts[product.category] = (counts[product.category] ?? 0) + 1;
    }

    return counts;
  }, [availableOnly, isCategoryFilterEnabled, searchedProducts, selectedPrices, selectedSizes]);
  const displayedProductCountLabel = `${filteredProducts.length} ${
    filteredProducts.length === 1 ? "piece" : "pieces"
  }`;
  /**
   * Which header copy this view uses, if any (see `catalogIntros`). The
   * generic /shop landing is keyed "shop"; a category route is keyed by its
   * category. A rug-style collection is deliberately excluded even though its
   * `category` is set, because its own description is what the page is for.
   * Anything without an entry falls back to the default header below.
   */
  const isLandingView = !category && !hasExactCategoryLink;
  const introKey = isLandingView ? "shop" : collection ? null : category ?? null;
  const intro = introKey ? catalogIntros[introKey] ?? null : null;
  const categoryEssay = introKey ? catalogBelowGridEssays[introKey] : undefined;
  const belowGridEssay: CatalogGuide | null =
    collection?.guide ?? (categoryEssay ? { ...categoryEssay, body: heroCopy } : null);
  const belowGridEssayParagraphs = belowGridEssay ? belowGridEssay.body.split("\n\n") : [];
  const activeCategoryKey = serializeCategoryFilter(activeCategories);
  const activePriceKey = serializePriceFilter(selectedPrices);
  const activeSizeKey = serializeSizeFilter(selectedSizes);
  const activeRugTypeKey = serializeRugFacetFilter(selectedRugTypes, rugFilterOptions);
  const activeRugRegionKey = serializeRugFacetFilter(selectedRugRegions, rugFilterOptions);
  const activeFilterCount = [
    Boolean(trimmedQuery),
    activeCategories.length > 0,
    selectedPrices.length > 0,
    selectedSizes.length > 0,
    sortOption !== defaultCatalogSortOption,
    availableOnly,
    selectedRugTypes.length > 0,
    selectedRugRegions.length > 0,
  ].filter(Boolean).length;
  const filterKey = `${searchQuery.trim()}|${activeCategoryKey}|${activePriceKey}|${activeSizeKey}|${sortOption}|${availableOnly}|${activeRugTypeKey}|${activeRugRegionKey}`;

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
      updateQueryParam(nextParams, "sort", sortOption === defaultCatalogSortOption ? "" : sortOption);
      updateQueryParam(nextParams, "availability", availableOnly ? "available" : "");
      updateQueryParam(nextParams, "type", activeRugTypeKey);
      updateQueryParam(nextParams, "region", activeRugRegionKey);

      const nextQuery = nextParams.toString();
      const nextHref = nextQuery ? `${pathname}?${nextQuery}` : pathname;
      const currentHref = `${window.location.pathname}${window.location.search}`;

      if (nextHref !== currentHref) {
        window.history.replaceState(null, "", nextHref);
      }
    }, 280);

    return () => window.clearTimeout(timer);
  }, [
    activeCategoryKey,
    activePriceKey,
    activeRugRegionKey,
    activeRugTypeKey,
    activeSizeKey,
    availableOnly,
    pathname,
    searchQuery,
    sortOption,
  ]);

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
      const nextAvailableOnly = params.get("availability") === "available";
      const nextRugTypes = parseRugFacetFilter(params.get("type"), rugFilterOptions);
      const nextRugRegions = parseRugFacetFilter(params.get("region"), rugFilterOptions);

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
      setAvailableOnly((current) => (current === nextAvailableOnly ? current : nextAvailableOnly));
      setSelectedRugTypes((current) =>
        serializeRugFacetFilter(current, rugFilterOptions) === serializeRugFacetFilter(nextRugTypes, rugFilterOptions)
          ? current
          : nextRugTypes,
      );
      setSelectedRugRegions((current) =>
        serializeRugFacetFilter(current, rugFilterOptions) === serializeRugFacetFilter(nextRugRegions, rugFilterOptions)
          ? current
          : nextRugRegions,
      );
    }

    window.addEventListener("popstate", syncFromLocation);
    window.addEventListener(SHOP_QUERY_SYNC_EVENT, syncFromLocation);

    return () => {
      window.removeEventListener("popstate", syncFromLocation);
      window.removeEventListener(SHOP_QUERY_SYNC_EVENT, syncFromLocation);
    };
  }, [isCategoryFilterEnabled, rugFilterOptions]);

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
    setSortOption(defaultCatalogSortOption);
    setAvailableOnly(false);
    setSelectedRugTypes([]);
    setSelectedRugRegions([]);
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
              availableOnly={availableOnly}
              onCategoryToggle={handleCategoryToggle}
              onClearAll={clearAllFilters}
              onAvailableOnlyChange={setAvailableOnly}
              rugFacetGroups={[
                {
                  key: "type",
                  label: "Type",
                  options: rugTypeOptions.length > 1 ? rugTypeOptions : [],
                  selected: selectedRugTypes,
                  onToggle: (slug: string) =>
                    setSelectedRugTypes((current) => toggleRugFacetFilter(current, slug, rugFilterOptions)),
                },
                {
                  key: "region",
                  label: "Region",
                  options: rugRegionOptions.length > 1 ? rugRegionOptions : [],
                  selected: selectedRugRegions,
                  onToggle: (slug: string) =>
                    setSelectedRugRegions((current) => toggleRugFacetFilter(current, slug, rugFilterOptions)),
                },
              ]}
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
              {intro ? (
                <>
                  {intro.paragraphs.map((paragraph, index) => (
                    <IntroParagraph className={styles.lede} key={index} runs={paragraph} />
                  ))}
                  <IntroParagraph className={styles.shopHeaderTrustNote} runs={intro.closing} />
                </>
              ) : (
                <>
                  <p className={styles.shopHeaderTrustNote}>
                    Each piece is individually made and won&apos;t be restocked.
                  </p>
                  <IntroParagraph
                    className={styles.shopHeaderTrustNote}
                    runs={catalogShippingScopeNote}
                  />
                  {heroCopy.split("\n\n").map((paragraph, index) => (
                    <p className={styles.lede} key={index}>
                      {paragraph}
                    </p>
                  ))}
                </>
              )}
              {styleLinks?.length ? (
                <nav aria-label={styleNavLabel} className={styles.styleNav}>
                  <span className={styles.filterGroupLabel}>{styleNavLabel}</span>
                  <div className={styles.styleNavLinks}>
                    {styleLinks.map((styleLink) => (
                      <Link
                        key={styleLink.href}
                        className={styles.filterChip}
                        href={styleLink.href as Route}
                      >
                        {styleLink.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              ) : null}
              {secondaryStyleLinks?.length && secondaryStyleNavLabel ? (
                <nav aria-label={secondaryStyleNavLabel} className={styles.styleNav}>
                  <span className={styles.filterGroupLabel}>{secondaryStyleNavLabel}</span>
                  <div className={styles.styleNavLinks}>
                    {secondaryStyleLinks.map((styleLink) => (
                      <Link
                        key={styleLink.href}
                        className={styles.filterChip}
                        href={styleLink.href as Route}
                      >
                        {styleLink.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              ) : null}
            </div>

            {filteredProducts.length ? (
              <CatalogProductBrowser products={filteredProducts} filterKey={filterKey} />
            ) : trimmedQuery && !searchedProducts.length ? (
              <div className={styles.emptyCatalogState}>
                <p className={styles.eyebrow}>No matches</p>
                <h2>Nothing found for &ldquo;{trimmedQuery}&rdquo;.</h2>
                <p>
                  Try fewer words or a different spelling, or browse what the studio has right
                  now.
                </p>
                {searchFallbackLinks?.categories.length ? (
                  <nav aria-label="Browse by category" className={styles.styleNav}>
                    <span className={styles.filterGroupLabel}>Shop by category</span>
                    <div className={styles.styleNavLinks}>
                      {searchFallbackLinks.categories.map((link) => (
                        <Link key={link.href} className={styles.filterChip} href={link.href as Route}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </nav>
                ) : null}
                {searchFallbackLinks?.styles.length ? (
                  <nav aria-label="Browse by rug style" className={styles.styleNav}>
                    <span className={styles.filterGroupLabel}>Shop rugs by style</span>
                    <div className={styles.styleNavLinks}>
                      {searchFallbackLinks.styles.map((link) => (
                        <Link key={link.href} className={styles.filterChip} href={link.href as Route}>
                          {link.label}
                        </Link>
                      ))}
                    </div>
                  </nav>
                ) : null}
                <div className={styles.sidebarActions}>
                  <button className={styles.primaryAction} type="button" onClick={clearAllFilters}>
                    Clear search
                  </button>
                </div>
              </div>
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

      {belowGridEssay ? (
        <Section className={styles.catalogEssaySection} width="wide">
          {/* Collapsed to the opening paragraph and a two-line taste of the
              second. The remaining paragraphs stay in the markup and are
              toggled with [hidden] rather than dropped, so the page still
              carries the full text for a reader who never clicks and for a
              crawler that never can. */}
          <div className={styles.catalogEssay}>
            <h2>{belowGridEssay.heading}</h2>
            {belowGridEssayParagraphs[0] ? <p>{renderInline(belowGridEssayParagraphs[0])}</p> : null}
            {belowGridEssayParagraphs[1] ? (
              <>
                <p
                  className={isEssayExpanded ? undefined : styles.catalogEssayClamp}
                  id="catalog-essay-more"
                >
                  {renderInline(belowGridEssayParagraphs[1])}
                </p>
                {belowGridEssayParagraphs.length > 2 ? (
                  <div hidden={!isEssayExpanded} id="catalog-essay-rest">
                    {belowGridEssayParagraphs.slice(2).map((paragraph, index) => (
                      <p key={index}>{renderInline(paragraph)}</p>
                    ))}
                  </div>
                ) : null}
                <button
                  aria-controls={
                    belowGridEssayParagraphs.length > 2
                      ? "catalog-essay-more catalog-essay-rest"
                      : "catalog-essay-more"
                  }
                  aria-expanded={isEssayExpanded}
                  className={styles.catalogEssayToggle}
                  onClick={() => setIsEssayExpanded((value) => !value)}
                  type="button"
                >
                  {isEssayExpanded ? "Read less" : "Read more"}
                </button>
              </>
            ) : null}
            {belowGridEssay.faqs?.length ? (
              <div className={styles.catalogEssayFaqs}>
                {belowGridEssay.faqs.map((faq) => (
                  <div key={faq.question}>
                    <h3>{faq.question}</h3>
                    <p>{renderInline(faq.answer)}</p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </Section>
      ) : null}

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

const internationalInquiryHref = "/contact?inquiryType=international-shipping" as Route;

const catalogViewports: readonly CatalogViewport[] = ["desktop", "tablet", "phone"];

const hideOnViewport: Record<CatalogViewport, string> = {
  desktop: styles.hideOnDesktop,
  tablet: styles.hideOnTablet,
  phone: styles.hideOnPhone,
};

function hideOutside(shownOn: readonly CatalogViewport[]) {
  return catalogViewports
    .filter((viewport) => !shownOn.includes(viewport))
    .map((viewport) => hideOnViewport[viewport])
    .join(" ");
}

/**
 * One header paragraph, rendered once. Runs limited to some widths are hidden
 * by CSS at the others, and the paragraph itself is hidden wherever none of
 * its runs show, so it leaves no empty margin behind.
 */
function IntroParagraph({ className, runs }: { className: string; runs: CatalogIntroParagraph }) {
  const shownOn = catalogViewports.filter((viewport) =>
    runs.some((run) => typeof run === "string" || run.on.includes(viewport)),
  );

  return (
    <p className={`${className} ${hideOutside(shownOn)}`}>
      {runs.map((run, index) => {
        if (typeof run === "string") {
          return run;
        }

        return run.link ? (
          <Link className={hideOutside(run.on)} href={internationalInquiryHref} key={index}>
            {run.text}
          </Link>
        ) : (
          <span className={hideOutside(run.on)} key={index}>
            {run.text}
          </span>
        );
      })}
    </p>
  );
}

function updateQueryParam(params: URLSearchParams, key: string, value: string) {
  if (value) {
    params.set(key, value);
    return;
  }

  params.delete(key);
}
