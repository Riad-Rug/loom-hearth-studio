"use client";

import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import { Container } from "@/components/layout/container";
import { CartDrawer } from "@/features/cart/cart-drawer";

type SiteHeaderClientProps = {
  announcementItems: readonly string[];
  brandName: string;
  logoImageUrl: string;
  logoImageAlt: string;
  tagline: string;
  primaryNav: ReadonlyArray<{
    href: string;
    label: string;
  }>;
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
            <p className="site-header__tagline">{props.tagline}</p>
          </div>
          <nav aria-label="Primary" className="site-header__nav">
            {props.primaryNav.map((item) => (
              <Link key={item.href} className="site-header__link" href={item.href as Route}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="site-header__actions">
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
          <p className="site-header__mobile-tagline">{props.tagline}</p>
          <nav aria-label="Mobile primary" className="site-header__mobile-nav">
            {props.primaryNav.map((item) => (
              <Link
                key={`mobile-${item.href}`}
                className="site-header__mobile-link"
                href={item.href as Route}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {props.isAuthenticated ? (
              <Link
                className="site-header__mobile-link"
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Account
              </Link>
            ) : (
              <Link
                className="site-header__mobile-link"
                href="/account/login"
                onClick={() => setIsMobileMenuOpen(false)}
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

