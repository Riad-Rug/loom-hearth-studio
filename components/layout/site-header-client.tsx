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

/**
 * A row inside a dropdown that can itself open a submenu. The nesting stops
 * here on purpose, and `items` deliberately lives on this type rather than on
 * SiteHeaderNavLink: the top-level nav still discriminates groups from plain
 * links with an `in` check, so a link that could carry children would make a
 * child-bearing top-level entry silently render as a sixth dropdown.
 */
type SiteHeaderNavSubItem = SiteHeaderNavLink & {
  items?: readonly SiteHeaderNavLink[];
};

type SiteHeaderNavGroup = {
  label: string;
  href?: string;
  items: readonly SiteHeaderNavSubItem[];
};

type SiteHeaderNavItem = SiteHeaderNavLink | SiteHeaderNavGroup;

type SiteHeaderClientProps = {
  announcementDesktop: string;
  announcementMobile: string;
  brandName: string;
  primaryNav: readonly SiteHeaderNavItem[];
  /**
   * Nav destinations with nothing purchasable behind them right now (computed
   * server-side in SiteHeader). The item keeps its place and label but renders
   * as inert text instead of a link, rather than disappearing from the menu.
   */
  unavailableHrefs?: readonly string[];
  isAuthenticated: boolean;
  accountFirstName: string | null;
};

const SUGGESTION_MIN_QUERY_LENGTH = 2;
const SUGGESTION_DEBOUNCE_MS = 200;
const GROUP_CLOSE_DELAY_MS = 140;

// Fired after patching the address bar in place (history.pushState) while already on
// /shop, so the shop page can pick up the new search query without a full navigation.
// Keep this event name in sync with features/catalog/catalog-page-view.tsx.
const SHOP_QUERY_SYNC_EVENT = "lh:shop-query-sync";

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
  // Keyed by the submenu's own panel id, so the desktop flyout and the mobile
  // accordion for the same row are independent and the open effect can find the
  // panel it has to move focus into.
  const [openSubmenuKey, setOpenSubmenuKey] = useState<string | null>(null);
  const [focusFirstSubmenuLinkOnOpen, setFocusFirstSubmenuLinkOnOpen] = useState(false);
  const groupCloseTimeoutRef = useRef<number | null>(null);
  const submenuCloseTimeoutRef = useRef<number | null>(null);
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
    setOpenSubmenuKey(null);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
        setAreSuggestionsOpen(false);
        setOpenGroupLabel(null);
        setOpenSubmenuKey(null);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsMobileMenuOpen(false);
        setAreSuggestionsOpen(false);
        setOpenGroupLabel(null);
        setOpenSubmenuKey(null);
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

      if (submenuCloseTimeoutRef.current) {
        window.clearTimeout(submenuCloseTimeoutRef.current);
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
    if (!openSubmenuKey || !focusFirstSubmenuLinkOnOpen) {
      return;
    }

    const firstLink = document.getElementById(openSubmenuKey)?.querySelector("a");
    (firstLink as HTMLAnchorElement | null)?.focus();
    setFocusFirstSubmenuLinkOnOpen(false);
  }, [openSubmenuKey, focusFirstSubmenuLinkOnOpen]);

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

    navigateToShopSearch(nextQuery);
    setIsMobileMenuOpen(false);
    setAreSuggestionsOpen(false);
  }

  // When already on /shop, patch the query in place instead of pushing a full navigation
  // (which would remount the page and refetch the catalog). Other shop routes (e.g.
  // /shop/rugs) still need a real navigation to reach the full catalog with the query.
  function navigateToShopSearch(query: string) {
    const href = `/shop?q=${encodeURIComponent(query)}`;

    if (pathname === "/shop") {
      window.history.pushState(null, "", href);
      window.dispatchEvent(new Event(SHOP_QUERY_SYNC_EVENT));
      return;
    }

    router.push(href as Route);
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
    navigateToShopSearch(nextQuery);
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
      setOpenSubmenuKey(null);
      groupCloseTimeoutRef.current = null;
    }, GROUP_CLOSE_DELAY_MS);
  }

  function closeGroup(focusTriggerId?: string) {
    if (groupCloseTimeoutRef.current) {
      window.clearTimeout(groupCloseTimeoutRef.current);
      groupCloseTimeoutRef.current = null;
    }

    if (submenuCloseTimeoutRef.current) {
      window.clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }

    setOpenGroupLabel(null);
    setOpenSubmenuKey(null);

    if (focusTriggerId) {
      document.getElementById(focusTriggerId)?.focus();
    }
  }

  function openSubmenu(submenuId: string) {
    if (submenuCloseTimeoutRef.current) {
      window.clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }

    setOpenSubmenuKey(submenuId);
  }

  function scheduleCloseSubmenu() {
    if (!isPointerFine) {
      return;
    }

    if (submenuCloseTimeoutRef.current) {
      window.clearTimeout(submenuCloseTimeoutRef.current);
    }

    submenuCloseTimeoutRef.current = window.setTimeout(() => {
      setOpenSubmenuKey(null);
      submenuCloseTimeoutRef.current = null;
    }, GROUP_CLOSE_DELAY_MS);
  }

  function closeSubmenu(focusTriggerId?: string) {
    if (submenuCloseTimeoutRef.current) {
      window.clearTimeout(submenuCloseTimeoutRef.current);
      submenuCloseTimeoutRef.current = null;
    }

    setOpenSubmenuKey(null);

    if (focusTriggerId) {
      document.getElementById(focusTriggerId)?.focus();
    }
  }

  function toggleSubmenu(submenuId: string) {
    if (openSubmenuKey === submenuId) {
      closeSubmenu();
      return;
    }

    openSubmenu(submenuId);
  }

  function handleGroupBlur(event: React.FocusEvent<HTMLDivElement>, label: string) {
    if (event.currentTarget.contains(event.relatedTarget as Node)) {
      return;
    }

    if (openGroupLabel === label) {
      setOpenGroupLabel(null);
      setOpenSubmenuKey(null);
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

  /**
   * The arrow-key targets belonging to one menu container, and only that
   * container. A plain "a" query would be wrong for the Collection panel: the
   * nested style submenu is always in the DOM — that is the whole point of it,
   * a crawler has to find those anchors on every page — so a plain query hands
   * back links that are inert and refuse focus while the submenu is shut. A row
   * is either a direct anchor or an anchor inside a row wrapper one level down;
   * the submenu's own anchors sit a level deeper again and stay out of the
   * parent's cycle, and the submenu passes its own id here to walk just itself.
   */
  function getMenuLinks(containerId: string) {
    const container = document.getElementById(containerId);

    return Array.from(
      container?.querySelectorAll<HTMLAnchorElement>(":scope > a, :scope > * > a") ?? [],
    );
  }

  function handleGroupPanelKeyDown(event: React.KeyboardEvent<HTMLDivElement>, panelId: string) {
    const panel = document.getElementById(panelId);
    const links = getMenuLinks(panelId);
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

  function handleSubmenuTriggerKeyDown(
    event: React.KeyboardEvent<HTMLButtonElement>,
    submenuId: string,
  ) {
    if (event.key === "ArrowDown" || event.key === "ArrowRight") {
      event.preventDefault();
      // The trigger sits inside the group panel, whose own handler would
      // otherwise read the same ArrowDown and move focus along the panel rows.
      event.stopPropagation();
      setFocusFirstSubmenuLinkOnOpen(true);
      openSubmenu(submenuId);
      return;
    }

    if (event.key === "Escape" && openSubmenuKey === submenuId) {
      event.preventDefault();
      event.stopPropagation();
      closeSubmenu();
    }
  }

  function handleSubmenuPanelKeyDown(
    event: React.KeyboardEvent<HTMLDivElement>,
    submenuId: string,
  ) {
    const links = getMenuLinks(submenuId);
    const currentIndex = links.indexOf(document.activeElement as HTMLAnchorElement);

    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      event.stopPropagation();
      const step = event.key === "ArrowDown" ? 1 : -1;
      links[(currentIndex + step + links.length) % links.length]?.focus();
      return;
    }

    // Escape here backs out one level only, to the trigger; the group panel is
    // still open and a second Escape on that trigger bubbles up and closes it.
    if (event.key === "Escape" || event.key === "ArrowLeft") {
      event.preventDefault();
      event.stopPropagation();
      closeSubmenu(
        document.getElementById(submenuId)?.getAttribute("aria-labelledby") ?? undefined,
      );
    }
  }

  function isUnavailable(href: string) {
    return props.unavailableHrefs?.includes(href) ?? false;
  }

  function renderGroupLink(item: SiteHeaderNavLink) {
    if (isUnavailable(item.href)) {
      return (
        <span
          key={item.href}
          aria-disabled="true"
          className="site-header__nav-group-link site-header__nav-group-link--disabled"
        >
          {item.label}
        </span>
      );
    }

    return (
      <Link
        key={item.href}
        className={`site-header__nav-group-link ${
          isPathActive(pathname, item.href) ? "site-header__nav-group-link--active" : ""
        }`}
        href={item.href as Route}
        onClick={() => closeGroup()}
      >
        {item.label}
      </Link>
    );
  }

  function renderMobileGroupLink(item: SiteHeaderNavLink, extraClassName = "") {
    if (isUnavailable(item.href)) {
      return (
        <span
          key={`mobile-${item.href}`}
          aria-disabled="true"
          className={`site-header__mobile-link site-header__mobile-link--disabled ${extraClassName}`}
        >
          {item.label}
        </span>
      );
    }

    return (
      <Link
        key={`mobile-${item.href}`}
        className={`site-header__mobile-link ${
          isPathActive(pathname, item.href) ? "site-header__mobile-link--active" : ""
        } ${extraClassName}`}
        href={item.href as Route}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {item.label}
      </Link>
    );
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
                      {item.items.map((subItem) => {
                        const submenuItems = subItem.items;

                        if (!submenuItems?.length) {
                          return renderGroupLink(subItem);
                        }

                        const submenuId = `site-header-submenu-desktop-${toMenuId(subItem.href)}`;
                        const submenuTriggerId = `${submenuId}-trigger`;
                        const isSubmenuOpen = openSubmenuKey === submenuId;

                        return (
                          <div
                            key={subItem.href}
                            className="site-header__nav-group-row"
                            onMouseEnter={() => {
                              if (isPointerFine) {
                                openSubmenu(submenuId);
                              }
                            }}
                            onMouseLeave={scheduleCloseSubmenu}
                            onKeyDown={(event) => {
                              // ArrowRight on the row's own link opens the
                              // flyout, the gesture a menubar user expects.
                              // Keys pressed inside the flyout belong to it.
                              if (
                                event.key !== "ArrowRight" ||
                                document.getElementById(submenuId)?.contains(event.target as Node)
                              ) {
                                return;
                              }

                              event.preventDefault();
                              event.stopPropagation();
                              setFocusFirstSubmenuLinkOnOpen(true);
                              openSubmenu(submenuId);
                            }}
                          >
                            {renderGroupLink(subItem)}
                            <button
                              id={submenuTriggerId}
                              className="site-header__nav-submenu-trigger"
                              type="button"
                              aria-haspopup="true"
                              aria-expanded={isSubmenuOpen}
                              aria-controls={submenuId}
                              aria-label={`${subItem.label} by style`}
                              onClick={() => toggleSubmenu(submenuId)}
                              onKeyDown={(event) =>
                                handleSubmenuTriggerKeyDown(event, submenuId)
                              }
                            />
                            {/* Stays mounted and merely inert when shut: these
                                anchors are the reason this submenu exists, so
                                they have to be in the rendered HTML of every
                                page whether or not anyone opens the menu. */}
                            <div
                              id={submenuId}
                              role="group"
                              aria-labelledby={submenuTriggerId}
                              className={`site-header__nav-submenu ${
                                isSubmenuOpen ? "site-header__nav-submenu--open" : ""
                              }`}
                              inert={!isSubmenuOpen}
                              onKeyDown={(event) => handleSubmenuPanelKeyDown(event, submenuId)}
                            >
                              {submenuItems.map((styleItem) => renderGroupLink(styleItem))}
                            </div>
                          </div>
                        );
                      })}
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
                  {item.items.map((subItem) => {
                    const submenuItems = subItem.items;

                    if (!submenuItems?.length) {
                      return renderMobileGroupLink(subItem);
                    }

                    const submenuId = `site-header-submenu-mobile-${toMenuId(subItem.href)}`;
                    const submenuTriggerId = `${submenuId}-trigger`;
                    const isSubmenuOpen = openSubmenuKey === submenuId;

                    return (
                      <div key={`mobile-${subItem.href}`} className="site-header__mobile-subgroup">
                        <div className="site-header__mobile-subgroup-row">
                          {renderMobileGroupLink(subItem)}
                          <button
                            id={submenuTriggerId}
                            className="site-header__mobile-subgroup-trigger"
                            type="button"
                            aria-haspopup="true"
                            aria-expanded={isSubmenuOpen}
                            aria-controls={submenuId}
                            aria-label={`${subItem.label} by style`}
                            onClick={() => toggleSubmenu(submenuId)}
                          />
                        </div>
                        <div
                          id={submenuId}
                          role="group"
                          aria-labelledby={submenuTriggerId}
                          className={`site-header__mobile-submenu ${
                            isSubmenuOpen ? "site-header__mobile-submenu--open" : ""
                          }`}
                          inert={!isSubmenuOpen}
                        >
                          {submenuItems.map((styleItem) =>
                            renderMobileGroupLink(styleItem, "site-header__mobile-link--nested"),
                          )}
                        </div>
                      </div>
                    );
                  })}
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

/**
 * A DOM-id fragment derived from a route, e.g. "/shop/rugs" -> "shop-rugs".
 * Route-derived rather than label-derived so the submenu ids cannot collide
 * with the label-derived site-header-group-panel-* ids of the top-level groups.
 */
function toMenuId(href: string) {
  return href.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
