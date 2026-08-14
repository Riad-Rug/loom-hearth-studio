"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/container";
import { CartDrawer } from "@/features/cart/cart-drawer";
import type { CatalogSearchSuggestion } from "@/lib/catalog/search";

type SiteHeaderNavLink = {
  href: string;
  label: string;
};

type SiteHeaderNavItem =
  | SiteHeaderNavLink
  | {
      label: string;
      items: readonly SiteHeaderNavLink[];
    };

type SiteHeaderClientProps = {
  announcementDesktop: string;
  announcementMobile: string;
  brandName: string;
  primaryNav: readonly SiteHeaderNavItem[];
  isAuthenticated: boolean;
};

const SUGGESTION_MIN_QUERY_LENGTH = 2;
const SUGGESTION_DEBOUNCE_MS = 200;

export function SiteHeaderClient(props: SiteHeaderClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement | null>(null);
  const desktopSearchInputRef = useRef<HTMLInputElement | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDesktopSearchOpen, setIsDesktopSearchOpen] = useState(false);
  const [areSuggestionsOpen, setAreSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CatalogSearchSuggestion[]>([]);
  const [suggestionsQuery, setSuggestionsQuery] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const showAnnouncement = pathname !== "/contact";
  const trimmedQuery = searchQuery.trim();
  const showSuggestions =
    areSuggestionsOpen &&
    trimmedQuery.length >= SUGGESTION_MIN_QUERY_LENGTH &&
    suggestionsQuery.length >= SUGGESTION_MIN_QUERY_LENGTH;

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDesktopSearchOpen(false);
    setAreSuggestionsOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setIsDesktopSearchOpen(false);
        setAreSuggestionsOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setIsDesktopSearchOpen(false);
        setAreSuggestionsOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (isDesktopSearchOpen) {
      desktopSearchInputRef.current?.focus();
    }
  }, [isDesktopSearchOpen]);

  useEffect(() => {
    const query = searchQuery.trim();

    setActiveSuggestionIndex(-1);

    if (query.length < SUGGESTION_MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setSuggestionsQuery("");
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(`/api/search/suggestions?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });

        if (!response.ok) {
          return;
        }

        const payload = (await response.json()) as { suggestions?: CatalogSearchSuggestion[] };
        setSuggestions(Array.isArray(payload.suggestions) ? payload.suggestions : []);
        setSuggestionsQuery(query);
      } catch {
        // Aborted or offline: keep whatever suggestions are currently shown.
      }
    }, SUGGESTION_DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [searchQuery]);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = searchQuery.trim();
    router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search");
    setIsMobileMenuOpen(false);
    setIsDesktopSearchOpen(false);
    setAreSuggestionsOpen(false);
  }

  function handleSearchChange(event: React.ChangeEvent<HTMLInputElement>) {
    setSearchQuery(event.currentTarget.value);
    setAreSuggestionsOpen(true);
  }

  function handleSearchFocus() {
    if (searchQuery.trim().length >= SUGGESTION_MIN_QUERY_LENGTH) {
      setAreSuggestionsOpen(true);
    }
  }

  function handleSearchBlur(event: React.FocusEvent<HTMLElement>) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    setAreSuggestionsOpen(false);

    if (!searchQuery.trim()) {
      setIsDesktopSearchOpen(false);
    }
  }

  function handleSearchKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) {
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveSuggestionIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveSuggestionIndex((current) =>
        current <= 0 ? suggestions.length - 1 : current - 1,
      );
      return;
    }

    if (event.key === "Enter" && activeSuggestionIndex >= 0) {
      const suggestion = suggestions[activeSuggestionIndex];

      if (suggestion) {
        event.preventDefault();
        selectSuggestion(suggestion);
      }
    }
  }

  function selectSuggestion(suggestion: CatalogSearchSuggestion) {
    setIsMobileMenuOpen(false);
    setIsDesktopSearchOpen(false);
    setAreSuggestionsOpen(false);
    router.push(suggestion.href as Route);
  }

  function viewAllResults() {
    const nextQuery = searchQuery.trim();
    setIsMobileMenuOpen(false);
    setIsDesktopSearchOpen(false);
    setAreSuggestionsOpen(false);
    router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search");
  }

  function renderSearchInput(context: "desktop" | "mobile") {
    const inputId = `site-header-${context}-search`;
    const listboxId = `site-header-${context}-search-listbox`;
    const isDesktop = context === "desktop";

    return (
      <>
        <label className="site-header__sr-only" htmlFor={inputId}>
          Search products
        </label>
        <input
          id={inputId}
          ref={isDesktop ? desktopSearchInputRef : undefined}
          className={
            isDesktop ? "site-header__search-input" : "site-header__mobile-search-input"
          }
          name="q"
          placeholder="Search rugs, poufs, pillows"
          type="search"
          autoComplete="off"
          spellCheck={false}
          value={searchQuery}
          onChange={handleSearchChange}
          onFocus={handleSearchFocus}
          onKeyDown={handleSearchKeyDown}
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showSuggestions}
          aria-controls={listboxId}
          aria-activedescendant={
            showSuggestions && activeSuggestionIndex >= 0
              ? `${listboxId}-option-${activeSuggestionIndex}`
              : undefined
          }
        />
        {showSuggestions ? (
          <SearchSuggestionsPanel
            suggestions={suggestions}
            query={suggestionsQuery}
            activeIndex={activeSuggestionIndex}
            listboxId={listboxId}
            onSelect={selectSuggestion}
            onViewAll={viewAllResults}
          />
        ) : null}
      </>
    );
  }

  return (
    <header ref={headerRef} className="site-header">
      {showAnnouncement ? (
        <div className="site-header__announcement">
          <Container width="wide">
            <p className="site-header__announcement-copy">
              <strong className="site-header__announcement-desktop">{props.announcementDesktop}</strong>
              <strong className="site-header__announcement-mobile">{props.announcementMobile}</strong>
            </p>
            <span className="site-header__sr-only">{props.announcementDesktop}</span>
          </Container>
        </div>
      ) : null}

      <Container width="wide">
        <div className="site-header__bar">
          <button
            aria-controls="site-mobile-menu"
            aria-expanded={isMobileMenuOpen}
            aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
            className={`site-header__menu-button ${
              isMobileMenuOpen ? "site-header__menu-button--open" : ""
            }`}
            type="button"
            onClick={() => setIsMobileMenuOpen((current) => !current)}
          >
            <span />
            <span />
            <span />
          </button>

          <Link className="site-header__brand" href="/">
            {props.brandName}
          </Link>

          <nav aria-label="Primary" className="site-header__nav">
            {props.primaryNav.map((item) =>
              "items" in item ? (
                item.items.map((subItem) => (
                  <Link
                    key={subItem.href}
                    className={`site-header__link ${
                      isPathActive(pathname, subItem.href) ? "site-header__link--active" : ""
                    }`}
                    href={subItem.href as Route}
                  >
                    {subItem.label}
                  </Link>
                ))
              ) : (
                <Link
                  key={item.href}
                  className={`site-header__link ${
                    isPathActive(pathname, item.href) ? "site-header__link--active" : ""
                  }`}
                  href={item.href as Route}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          <div className="site-header__actions">
            <div className="site-header__search-shell">
              {isDesktopSearchOpen ? (
                <form
                  className="site-header__search-form"
                  role="search"
                  onSubmit={handleSearchSubmit}
                  onBlur={handleSearchBlur}
                >
                  {renderSearchInput("desktop")}
                  <button className="site-header__link" type="submit">
                    Search
                  </button>
                </form>
              ) : (
                <button
                  className="site-header__link"
                  type="button"
                  aria-expanded={false}
                  onClick={() => setIsDesktopSearchOpen(true)}
                >
                  Search
                </button>
              )}
            </div>
            <Link className="site-header__link" href={props.isAuthenticated ? "/account" : "/account/login"}>
              Account
            </Link>
            <CartDrawer />
          </div>
        </div>

        <div
          id="site-mobile-menu"
          aria-hidden={!isMobileMenuOpen}
          inert={!isMobileMenuOpen}
          className={`site-header__mobile-menu ${
            isMobileMenuOpen ? "site-header__mobile-menu--open" : ""
          }`}
        >
          <form
            className="site-header__mobile-search"
            role="search"
            onSubmit={handleSearchSubmit}
            onBlur={handleSearchBlur}
          >
            <div className="site-header__mobile-search-shell">{renderSearchInput("mobile")}</div>
            <button className="site-header__mobile-search-button" type="submit">
              Search
            </button>
          </form>

          <nav aria-label="Mobile primary" className="site-header__mobile-nav">
            {flattenNav(props.primaryNav).map((item) => (
              <Link
                key={`mobile-${item.href}`}
                className={`site-header__mobile-link ${
                  isPathActive(pathname, item.href) ? "site-header__mobile-link--active" : ""
                }`}
                href={item.href as Route}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              className={`site-header__mobile-link ${
                isPathActive(pathname, props.isAuthenticated ? "/account" : "/account/login")
                  ? "site-header__mobile-link--active"
                  : ""
              }`}
              href={props.isAuthenticated ? "/account" : "/account/login"}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Account
            </Link>
          </nav>
        </div>
      </Container>
    </header>
  );
}

type SearchSuggestionsPanelProps = {
  suggestions: CatalogSearchSuggestion[];
  query: string;
  activeIndex: number;
  listboxId: string;
  onSelect: (suggestion: CatalogSearchSuggestion) => void;
  onViewAll: () => void;
};

function SearchSuggestionsPanel(props: SearchSuggestionsPanelProps) {
  return (
    <div className="site-header__search-suggestions">
      {props.suggestions.length ? (
        <ul
          className="site-header__suggestion-list"
          role="listbox"
          aria-label="Product suggestions"
          id={props.listboxId}
        >
          {props.suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`${props.listboxId}-option-${index}`}
              role="option"
              aria-selected={index === props.activeIndex}
            >
              <button
                className={`site-header__suggestion ${
                  index === props.activeIndex ? "site-header__suggestion--active" : ""
                }`}
                type="button"
                tabIndex={-1}
                onMouseDown={(event) => {
                  event.preventDefault();
                  props.onSelect(suggestion);
                }}
              >
                <span className="site-header__suggestion-media" aria-hidden="true">
                  {suggestion.imageSrc ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" loading="lazy" src={suggestion.imageSrc} />
                  ) : null}
                </span>
                <span className="site-header__suggestion-body">
                  <span className="site-header__suggestion-name">{suggestion.name}</span>
                  {suggestion.dimensionsLabel ? (
                    <span className="site-header__suggestion-meta">{suggestion.dimensionsLabel}</span>
                  ) : null}
                </span>
                <span className="site-header__suggestion-price">{suggestion.priceUsdLabel}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="site-header__suggestion-empty" id={props.listboxId} role="listbox">
          No matches for &ldquo;{props.query}&rdquo; yet. Try a material, size, or style.
        </p>
      )}
      <button
        className="site-header__suggestion-view-all"
        type="button"
        tabIndex={-1}
        onMouseDown={(event) => {
          event.preventDefault();
          props.onViewAll();
        }}
      >
        See all results for &ldquo;{props.query}&rdquo;
      </button>
    </div>
  );
}

function flattenNav(items: readonly SiteHeaderNavItem[]) {
  return items.flatMap((item) => ("items" in item ? item.items : item));
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
