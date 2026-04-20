"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const announcementText = props.announcementItems.join(" / ");
  const tickerItems = [...props.announcementItems, ...props.announcementItems];


  return (
    <header className="site-header">
      <div className="site-header__announcement">
        <Container width="wide">
          <p className="site-header__announcement-copy">{announcementText}</p>
          <span className="site-header__sr-only">{announcementText}</span>
          <div aria-hidden="true" className="site-header__announcement-marquee">
            <div className="site-header__announcement-track">
              {tickerItems.map((item, index) => (
                <span key={item + "-" + index} className="site-header__announcement-item">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </Container>
      </div>
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
          </div>
          <nav aria-label="Primary" className="site-header__nav">
            {props.primaryNav.map((item) => (
              "items" in item ? (
                <div key={item.label} className="site-header__menu">
                  <button
                    aria-haspopup="true"
                    className="site-header__link site-header__menu-trigger"
                    type="button"
                  >
                    {item.label}
                    <span aria-hidden="true">v</span>
                  </button>
                  <div className="site-header__submenu">
                    {item.items.map((subItem) => (
                      <Link
                        key={subItem.href}
                        className="site-header__submenu-link"
                        href={subItem.href as Route}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.href} className="site-header__link" href={item.href as Route}>
                  {item.label}
                </Link>
              )
            ))}
          </nav>
          <div className="site-header__actions">
            <Link className="site-header__icon-link" href="/search" aria-label="Search products">
              <SearchIcon />
            </Link>
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
              className="site-header__menu-button"
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
          <nav aria-label="Mobile primary" className="site-header__mobile-nav">
            {props.primaryNav.map((item) => (
              "items" in item ? (
                <div key={`mobile-${item.label}`} className="site-header__mobile-group">
                  <p className="site-header__mobile-group-label">{item.label}</p>
                  {item.items.map((subItem) => (
                    <Link
                      key={`mobile-${subItem.href}`}
                      className="site-header__mobile-link"
                      href={subItem.href as Route}
                      onClick={() => setIsMobileMenuOpen(false)}
                      tabIndex={isMobileMenuOpen ? undefined : -1}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={`mobile-${item.href}`}
                  className="site-header__mobile-link"
                  href={item.href as Route}
                  onClick={() => setIsMobileMenuOpen(false)}
                  tabIndex={isMobileMenuOpen ? undefined : -1}
                >
                  {item.label}
                </Link>
              )
            ))}
            <Link
              className="site-header__mobile-link"
              href="/search"
              onClick={() => setIsMobileMenuOpen(false)}
              tabIndex={isMobileMenuOpen ? undefined : -1}
            >
              Search
            </Link>
            {props.isAuthenticated ? (
              <Link
                className="site-header__mobile-link"
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                tabIndex={isMobileMenuOpen ? undefined : -1}
              >
                Account
              </Link>
            ) : (
              <Link
                className="site-header__mobile-link"
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

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6.2" />
      <path d="m15.4 15.4 4.2 4.2" />
    </svg>
  );
}

