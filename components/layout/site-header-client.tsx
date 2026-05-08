"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Container } from "@/components/layout/container";
import { CartDrawer } from "@/features/cart/cart-drawer";

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
  announcementItems: readonly string[];
  brandName: string;
  logoImageUrl: string;
  logoImageAlt: string;
  tagline: string;
  primaryNav: readonly SiteHeaderNavItem[];
  isAuthenticated: boolean;
};

export function SiteHeaderClient(props: SiteHeaderClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [openMenuLabel, setOpenMenuLabel] = useState<string | null>(null);
  const [openMobileGroupLabel, setOpenMobileGroupLabel] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [primaryAnnouncement, ...supportingAnnouncements] = props.announcementItems;
  const announcementText = props.announcementItems.join(" / ");
  const showAnnouncement = pathname !== "/contact";

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setOpenMenuLabel(null);
    setOpenMobileGroupLabel(null);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (headerRef.current?.contains(event.target as Node)) {
        return;
      }

      setOpenMenuLabel(null);
      setIsMobileMenuOpen(false);
      setOpenMobileGroupLabel(null);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpenMenuLabel(null);
        setIsMobileMenuOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextQuery = searchQuery.trim();
    if (!nextQuery) {
      router.push("/search");
      return;
    }

    router.push(`/search?q=${encodeURIComponent(nextQuery)}`);
  }

  return (
    <header ref={headerRef} className="site-header">
      {showAnnouncement ? (
        <div className="site-header__announcement">
          <Container width="wide">
            <p className="site-header__announcement-copy">
              <strong>{primaryAnnouncement}</strong>
              <span className="site-header__announcement-mobile">
                Free shipping to the US, Canada &amp; Australia
              </span>
              {supportingAnnouncements.length ? (
                <span>{supportingAnnouncements.join(" / ")}</span>
              ) : null}
            </p>
            <span className="site-header__sr-only">{announcementText}</span>
          </Container>
        </div>
      ) : null}
      <Container width="wide">
        <div className="site-header__bar">
          <div className="site-header__identity">
            <Link className="site-header__brand" href="/">
              {props.logoImageUrl ? (
                <>
                  <Image
                    alt={props.logoImageAlt || props.brandName}
                    className="site-header__brand-logo"
                    height={64}
                    src={props.logoImageUrl}
                    unoptimized
                    width={180}
                  />
                  <span className="site-header__sr-only">{props.brandName}</span>
                </>
              ) : (
                props.brandName
              )}
            </Link>
            <p className="site-header__tagline">{props.tagline}</p>
          </div>
          <nav aria-label="Primary" className="site-header__nav">
            {props.primaryNav.map((item) => (
              "items" in item ? (
                <div key={item.label} className="site-header__menu">
                  <button
                    aria-controls={`site-header-submenu-${toDomId(item.label)}`}
                    aria-expanded={openMenuLabel === item.label}
                    aria-haspopup="true"
                    className={`site-header__link site-header__menu-trigger ${
                      isMenuActive(pathname, item.items) ? "site-header__link--active" : ""
                    } ${openMenuLabel === item.label ? "site-header__menu-trigger--open" : ""}`}
                    type="button"
                    onMouseEnter={() => setOpenMenuLabel(item.label)}
                    onClick={() =>
                      setOpenMenuLabel((currentLabel) =>
                        currentLabel === item.label ? null : item.label,
                      )
                    }
                  >
                    {item.label}
                    <svg
                      aria-hidden="true"
                      fill="none"
                      focusable="false"
                      viewBox="0 0 12 8"
                    >
                      <path d="M1.5 1.5L6 6l4.5-4.5" />
                    </svg>
                  </button>
                  <div
                    id={`site-header-submenu-${toDomId(item.label)}`}
                    className={`site-header__submenu ${
                      openMenuLabel === item.label ? "site-header__submenu--open" : ""
                    }`}
                  >
                    <div className="site-header__submenu-intro">
                      <p className="site-header__submenu-label">{item.label}</p>
                    </div>
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        className={`site-header__submenu-link ${
                          isPathActive(pathname, subItem.href)
                            ? "site-header__submenu-link--active"
                            : ""
                        }`}
                        href={subItem.href as Route}
                        onClick={() => setOpenMenuLabel(null)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
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
              )
            ))}
          </nav>
          <div className="site-header__actions">
            <form
              className="site-header__search-shell"
              role="search"
              aria-label="Site search"
              onSubmit={handleSearchSubmit}
            >
              <label className="site-header__sr-only" htmlFor="site-header-search">
                Search products
              </label>
              <input
                ref={searchInputRef}
                id="site-header-search"
                className="site-header__search-input"
                name="q"
                placeholder="Search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.currentTarget.value)}
                onFocus={() => setOpenMenuLabel(null)}
              />
              <button
                className="site-header__icon-link site-header__search-button"
                type="submit"
                aria-label="Search products"
                onMouseEnter={() => searchInputRef.current?.focus()}
              >
                <SearchIcon />
              </button>
            </form>
            <div className="site-header__account-links">
              {props.isAuthenticated ? (
                <Link className="site-header__link" href="/account">
                  Account
                </Link>
              ) : (
                <Link className="site-header__link" href="/account/login">
                  Login
                </Link>
              )}
            </div>
            <CartDrawer />
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
          </div>
        </div>
        <div
          id="site-mobile-menu"
          aria-hidden={!isMobileMenuOpen}
          className={`site-header__mobile-menu ${
            isMobileMenuOpen ? "site-header__mobile-menu--open" : ""
          }`}
        >
          <p className="site-header__mobile-tagline">{props.tagline}</p>
          <nav aria-label="Mobile primary" className="site-header__mobile-nav">
            {props.primaryNav.map((item) => (
              "items" in item ? (
                (() => {
                  const isActiveGroup = isMenuActive(pathname, item.items);
                  const isOpenGroup =
                    openMobileGroupLabel === item.label ||
                    (openMobileGroupLabel === null && isActiveGroup);

                  return (
                <div key={`mobile-${item.label}`} className="site-header__mobile-group">
                  <button
                    aria-controls={`site-mobile-group-${toDomId(item.label)}`}
                    aria-expanded={isOpenGroup}
                    className={`site-header__mobile-group-trigger ${
                      isActiveGroup ? "site-header__mobile-group-trigger--active" : ""
                    }`}
                    type="button"
                    onClick={() =>
                      setOpenMobileGroupLabel((currentLabel) =>
                        currentLabel === item.label ? null : item.label,
                      )
                    }
                  >
                    <span className="site-header__mobile-group-label">{item.label}</span>
                    <svg
                      aria-hidden="true"
                      className={
                        isOpenGroup
                          ? "site-header__mobile-group-icon site-header__mobile-group-icon--open"
                          : "site-header__mobile-group-icon"
                      }
                      fill="none"
                      focusable="false"
                      viewBox="0 0 12 8"
                    >
                      <path d="M1.5 1.5L6 6l4.5-4.5" />
                    </svg>
                  </button>
                  <div
                    id={`site-mobile-group-${toDomId(item.label)}`}
                    className={`site-header__mobile-group-links ${
                      isOpenGroup ? "site-header__mobile-group-links--open" : ""
                    }`}
                  >
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
                        tabIndex={isMobileMenuOpen ? undefined : -1}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
                  );
                })()
              ) : (
                <Link
                  key={`mobile-${item.href}`}
                  className={`site-header__mobile-link ${
                    isPathActive(pathname, item.href) ? "site-header__mobile-link--active" : ""
                  }`}
                  href={item.href as Route}
                  onClick={() => setIsMobileMenuOpen(false)}
                  tabIndex={isMobileMenuOpen ? undefined : -1}
                >
                  {item.label}
                </Link>
              )
            ))}
            <Link
              className={`site-header__mobile-link ${
                isPathActive(pathname, "/search") ? "site-header__mobile-link--active" : ""
              }`}
              href="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              tabIndex={isMobileMenuOpen ? undefined : -1}
            >
              Search
            </Link>
            {props.isAuthenticated ? (
              <Link
                className={`site-header__mobile-link ${
                  isPathActive(pathname, "/account") ? "site-header__mobile-link--active" : ""
                }`}
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                tabIndex={isMobileMenuOpen ? undefined : -1}
              >
                Account
              </Link>
            ) : (
              <Link
                className={`site-header__mobile-link ${
                  isPathActive(pathname, "/account/login")
                    ? "site-header__mobile-link--active"
                    : ""
                }`}
                href="/account/login"
                onClick={() => setIsMobileMenuOpen(false)}
                tabIndex={isMobileMenuOpen ? undefined : -1}
              >
                Login
              </Link>
            )}
          </nav>
        </div>
      </Container>
    </header>
  );
}

function toDomId(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function isMenuActive(pathname: string, items: readonly SiteHeaderNavLink[]) {
  return items.some((item) => isPathActive(pathname, item.href));
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.2" />
      <path d="m15.4 15.4 4.2 4.2" />
    </svg>
  );
}

