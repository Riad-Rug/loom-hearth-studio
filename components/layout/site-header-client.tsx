"use client";

import type { Route } from "next";
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
  primaryNav: readonly SiteHeaderNavItem[];
  isAuthenticated: boolean;
};

export function SiteHeaderClient(props: SiteHeaderClientProps) {
  const pathname = usePathname();
  const router = useRouter();
  const headerRef = useRef<HTMLElement | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [primaryAnnouncement, ...supportingAnnouncements] = props.announcementItems;
  const announcementText = props.announcementItems.join(" / ");
  const showAnnouncement = pathname !== "/contact";

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    function handlePointerDown(event: PointerEvent) {
      if (!headerRef.current?.contains(event.target as Node)) {
        setIsMobileMenuOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
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
    router.push(nextQuery ? `/search?q=${encodeURIComponent(nextQuery)}` : "/search");
    setIsMobileMenuOpen(false);
  }

  return (
    <header ref={headerRef} className="site-header">
      {showAnnouncement ? (
        <div className="site-header__announcement">
          <Container width="wide">
            <p className="site-header__announcement-copy">
              <strong>{primaryAnnouncement}</strong>
              {supportingAnnouncements.length ? <span>{supportingAnnouncements.join(" / ")}</span> : null}
            </p>
            <span className="site-header__sr-only">{announcementText}</span>
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
            <form className="site-header__search-trigger" role="search" onSubmit={handleSearchSubmit}>
              <button className="site-header__link" type="submit">
                Search
              </button>
            </form>
            <Link className="site-header__link" href={props.isAuthenticated ? "/account" : "/account/login"}>
              Account
            </Link>
            <CartDrawer />
          </div>
        </div>

        <div
          id="site-mobile-menu"
          aria-hidden={!isMobileMenuOpen}
          className={`site-header__mobile-menu ${
            isMobileMenuOpen ? "site-header__mobile-menu--open" : ""
          }`}
        >
          <form className="site-header__mobile-search" role="search" onSubmit={handleSearchSubmit}>
            <label className="site-header__sr-only" htmlFor="site-header-mobile-search">
              Search products
            </label>
            <input
              id="site-header-mobile-search"
              className="site-header__mobile-search-input"
              name="q"
              placeholder="Search rugs, poufs, pillows"
              type="search"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.currentTarget.value)}
            />
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

function flattenNav(items: readonly SiteHeaderNavItem[]) {
  return items.flatMap((item) => ("items" in item ? item.items : item));
}

function isPathActive(pathname: string, href: string) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}
