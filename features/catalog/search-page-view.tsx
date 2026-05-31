import Link from "next/link";

import { Section } from "@/components/layout/section";
import { CatalogHistoryRecorder } from "@/features/catalog/catalog-history-recorder";
import { ProductCard } from "@/features/catalog/product-card";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./catalog-page.module.css";

type SearchPageViewProps = {
  query: string;
  results: CatalogProductCardViewModel[];
  totalCount: number;
};

export function SearchPageView({ query, results, totalCount }: SearchPageViewProps) {
  const hasQuery = Boolean(query);

  return (
    <div className={styles.page}>
      <CatalogHistoryRecorder
        query={query}
        resultCategories={results.map((product) => product.category)}
      />
      <Section width="wide">
        <div className={styles.searchHero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>Search</p>
            <h1>Search the collection.</h1>
            <p className={styles.lede}>
              Search across rugs, poufs, pillows, and decor. Try terms like Beni Ourain, vintage,
              wool, cactus silk, pouf, or a room direction.
            </p>
            <div className={styles.searchSuggestionRail} aria-label="Suggested searches">
              {["Beni Ourain", "Vintage", "Wool", "Pouf"].map((suggestion) => (
                <Link
                  key={suggestion}
                  className={styles.searchSuggestion}
                  href={`/search?q=${encodeURIComponent(suggestion)}`}
                >
                  {suggestion}
                </Link>
              ))}
            </div>
          </div>
          <form className={styles.searchForm} action="/search">
            <label className={styles.searchLabel} htmlFor="site-search">
              Search the collection
            </label>
            <div className={styles.searchInputShell}>
              <SearchIcon />
              <input
                id="site-search"
                className={styles.searchInput}
                type="search"
                name="q"
                placeholder="Search rugs, poufs, pillows..."
                defaultValue={query}
              />
              <button className={styles.searchSubmit} type="submit">
                Search
              </button>
            </div>
          </form>
        </div>
      </Section>

      <Section tone="muted" width="wide">
        <div className={styles.searchSummary}>
          <p className={styles.searchSummaryText}>
            {hasQuery
              ? `${results.length} ${results.length === 1 ? "result" : "results"} for "${query}"`
              : `${totalCount} pieces in the collection`}
          </p>
          {hasQuery ? (
            <Link className={styles.tertiaryAction} href="/search">
              Clear search
            </Link>
          ) : (
            <Link className={styles.tertiaryAction} href="/shop">
              Browse shop
            </Link>
          )}
        </div>
      </Section>

      <Section width="wide">
        {results.length ? (
          <div className={`${styles.productGrid} ${styles.searchProductGrid}`}>
            {results.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className={styles.emptySearch}>
            <p className={styles.heroPanelLabel}>No matching pieces</p>
            <h2>Try a Broader Term or Browse the Main Collection.</h2>
            <div className={styles.tradePanelActions}>
              <Link className={styles.primaryAction} href="/shop">
                Shop all pieces
              </Link>
              <Link className={styles.secondaryAction} href="/contact?inquiryType=sourcing-request">
                Ask about sourcing
              </Link>
            </div>
          </div>
        )}
      </Section>
    </div>
  );
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.2" />
      <path d="m15.4 15.4 4.2 4.2" />
    </svg>
  );
}
