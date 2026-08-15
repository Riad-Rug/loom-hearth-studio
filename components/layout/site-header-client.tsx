"use client";

import type { Route } from "next";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/container";
import type { CatalogSearchSuggestion } from "@/lib/catalog/search";

type SiteHeaderNavLink = {
  href: string;
  label: string;
};

type SiteHeaderNavGroup = {
  label: string;
  href?: string;
  items: readonly SiteHeaderNavLink[];
};

type SiteHeaderNavItem = SiteHeaderNavLink | SiteHeaderNavGroup;

type SiteHeaderClientProps = {
  announcementDesktop: string;
  announcementMobile: string;
  brandName: string;
  primaryNav: readonly SiteHeaderNavItem[];
  isAuthenticated: boolean;
  accountFirstName: string | null;
};

const SUGGESTION_MIN_QUERY_LENGTH = 2;
const SUGGESTION_DEBOUNCE_MS = 200;
const GROUP_CLOSE_DELAY_MS = 140;

export function SiteHeaderClient(props: SiteHeaderClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [areSuggestionsOpen, setAreSuggestionsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<CatalogSearchSuggestion[]>([]);
  const [suggestionsQuery, setSuggestionsQuery] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isPointerFine, setIsPointerFine] = useState(false);
  const [openGroupLabel, setOpenGroupLabel] = useState<string | null>(null);
  const [focusFirstGroupLinkOnOpen, setFocusFirstGroupLinkOnOpen] = useState(false);
  const groupCloseTimeoutRef = useRef<number | null>(null);
  const showAnnouncement = pathname !== "/contact";
  const trimmedQuery = searchQuery.trim();
  const showSuggestions =
    areSuggestionsOpen &&
    trimmedQuery.length >= SUGGESTION_MIN_QUERY_LENGTH &&
    suggestionsQuery.length >= SUGGESTION_MIN_QUERY_LENGTH;
  const accountHref = props.isAuthenticated ? "/account" : "/account/login";
  const accountLabel = props.isAuthenticated ? props.accountFirstName ?? "Account" : "Sign in";

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setAreSuggestionsOpen(false);
    setOpenGroupLabel(null);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setAreSuggestionsOpen(false);
        setOpenGroupLabel(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setAreSuggestionsOpen(false);
        setOpenGroupLabel(null);
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

  useEffect(() => {
    return () => {
      if (groupCloseTimeoutRef.current) {
        window.clearTimeout(groupCloseTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!openGroupLabel || !focusFirstGroupLinkOnOpen) {
      return;
    }

    const groupId = openGroupLabel.toLowerCase().replace(/\s+/g, "-");
    const panel = document.getElementById(`site-header-group-panel-${groupId}`);
    const firstLink = panel?.querySelector("a");
    (firstLink as HTMLAnchorElement | null)?.focus();
    setFocusFirstGroupLinkOnOpen(false);
  }, [openGroupLabel, focusFirstGroupLinkOnOpen]);

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

    if (!nextQuery) {
      return;
    }

    router.push(`/shop?q=${encodeURIComponent(nextQuery)}`);
    setIsMobileMenuOpen(false);
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
    setAreSuggestionsOpen(false);
    router.push(suggestion.href as Route);
  }

  function viewAllResults() {
    const nextQuery = searchQuery.trim();

    if (!nextQuery) {
      return;
    }

    setIsMobileMenuOpen(false);
    setAreSuggestionsOpen(false);
    router.push(`/shop?q=${encodeURIComponent(nextQuery)}`);
  }

  function openGroup(label: string) {
    if (groupCloseTimeoutRef.current) {
      window.clearTimeout(groupCloseTimeoutRef.current);
      groupCloseTimeoutRef.current = null;
    }

    setOpenGroupLabel(label);
  }

  function scheduleCloseGroup() {
    if (!isPointerFine) {
      return;
    }

    if (groupCloseTimeoutRef.current) {
      window.clearTimeout(groupCloseTimeoutRef.current);
    }

    groupCloseTimeoutRef.current = window.setTimeout(() => {
      setOpenGroupLabel(null);
      groupCloseTimeoutRef.current = null;
    }, GROUP_CLOSE_DELAY_MS);
  }

  function closeGroup(focusTriggerId?: string) {
    if (groupCloseTimeoutRef.current) {
      window.clearTimeout(groupCloseTimeoutRef.current);
      groupCloseTimeoutRef.current = null;
    }

    setOpenGroupLabel(null);

    if (focusTriggerId) {
      document.getElementById(focusTriggerId)?.focus();
    }
  }

  function handleGroupBlur(event: React.FocusEvent<HTMLDivElement>, label: string) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    if (openGroupLabel === label) {
      setOpenGroupLabel(null);
    }
  }

  function handleGroupTriggerKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    label: string,
  ) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setFocusFirstGroupLinkOnOpen(true);
      openGroup(label);
      return;
    }

    if (event.key === "Escape" && openGroupLabel === label) {
      event.preventDefault();
      event.stopPropagation();
      closeGroup(event.currentTarget.id);
    }
  }

  function handleGroupPanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>, panelId: string) {
    const panel = document.getElementById(panelId);
    const links = Array.from(panel?.querySelectorAll("a") ?? []) as HTMLAnchorElement[];
    const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

    if (event.key === "ArrowDown") {
      event.preventDefault();
      links[(currentIndex + 1 + links.length) % links.length]?.focus();
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      links[(currentIndex - 1 + links.length) % links.length]?.focus();
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      event.stopPropagation();
      closeGroup(panel?.getAttribute("aria-labelledby") ?? undefined);
    }
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
            {props.primaryNav.map((item) => {
              if ("items" in item) {
                const groupId = item.label.toLowerCase().replace(/\s+/g, "-");
                const triggerId = `site-header-group-trigger-${groupId}`;
                const panelId = `site-header-group-panel-${groupId}`;
                const isOpen = openGroupLabel === item.label;
                const isActive = item.href ? isPathActive(pathname, item.href) : false;

                return (
                  <div
                    key={item.label}
                    className="site-header__nav-group"
                    onMouseEnter={() => {
                      if (isPointerFine) {
                        openGroup(item.label);
                      }
                    }}
                    onMouseLeave={scheduleCloseGroup}
                    onBlur={(event) => handleGroupBlur(event, item.label)}
                  >
                    <button
                      id={triggerId}
                      className={`site-header__link site-header__nav-group-trigger ${
                        isActive ? "site-header__link--active" : ""
                      }`}
                      type="button"
                      aria-haspopup="true"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => (isOpen ? closeGroup() : openGroup(item.label))}
                      onKeyDown={(event) => handleGroupTriggerKeyDown(event, item.label)}
                    >
                      {item.label}
                    </button>
                    <div
                      id={panelId}
                      role="group"
                      aria-labelledby={triggerId}
                      className={`site-header__nav-group-panel ${
                        isOpen ? "site-header__nav-group-panel--open" : ""
                      }`}
                      inert={!isOpen}
                      onKeyDown={(event) => handleGroupPanelKeyDown(event, panelId)}
                    >
                      {item.items.map((subItem) => (
                        <Link
                          key={subItem.href}
                          className={`site-header__nav-group-link ${
                            isPathActive(pathname, subItem.href)
                              ? "site-header__nav-group-link--active"
                              : ""
                          }`}
                          href={subItem.href as Route}
                          onClick={() => closeGroup()}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={item.href}
                  className={`site-header__link ${
                    isPathActive(pathname, item.href) ? "site-header__link--active" : ""
                  }`}
                  href={item.href as Route}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="site-header__actions">
            <form
              className="site-header__search-form"
              role="search"
              onSubmit={handleSearchSubmit}
              onBlur={handleSearchBlur}
            >
              {renderSearchInput("desktop")}
              <button className="site-header__search-submit" type="submit">
                <svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16">
                  <path
                    d="M10.5 3a7.5 7.5 0 0 1 5.96 12.05l4.25 4.24-1.42 1.42-4.24-4.25A7.5 7.5 0 1 1 10.5 3m0 2a5.5 5.5 0 1 0 0 11 5.5 5.5 0 0 0 0-11"
                    fill="currentColor"
                  />
                </svg>
                <span className="site-header__sr-only">Search</span>
              </button>
            </form>
            <Link
              className={`site-header__account-link ${
                isPathActive(pathname, accountHref) ? "site-header__account-link--active" : ""
              }`}
              href={accountHref as Route}
            >
              <svg aria-hidden="true" height="16" viewBox="0 0 24 24" width="16">
                <path
                  d="M12 12a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9m0 1.75c-3.87 0-7 2.09-7 4.67V21h14v-2.58c0-2.58-3.13-4.67-7-4.67"
                  fill="currentColor"
                />
              </svg>
              <span className="site-header__account-link-label">{accountLabel}</span>
            </Link>
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
            {props.primaryNav.map((item) =>
              "items" in item ? (
                <div key={item.label} className="site-header__mobile-group">
                  <p className="site-header__mobile-group-label">{item.label}</p>
                  {item.items.map((subItem) => (
                    <Link
                      key={`mobile-${subItem.href}`}
                      className={`site-header__mobile-link ${
                        isPathActive(pathname, subItem.href)
                          ? "site-header__mobile-link--active"
                          : ""
                      }`}
                      href={subItem.href as Route}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              ) : (
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
              ),
            )}
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

function isPathActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
