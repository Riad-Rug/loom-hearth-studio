"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { Container } from "@/components/layout/container";
import { CartDrawer } from "@/features/cart/cart-drawer";

type SiteHeaderClientProps = {
  announcement: string;
  brandName: string;
  tagline: string;
  primaryNav: ReadonlyArray<{
    href: string;
    label: string;
  }>;
  isAuthenticated: boolean;
};

export function SiteHeaderClient(props: SiteHeaderClientProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="site-header">
      <div className="site-header__announcement">
        <Container width="wide">
          <p>{props.announcement}</p>
        </Container>
      </div>
      <Container width="wide">
        <div className="site-header__bar">
          <div className="site-header__identity">
            <Link className="site-header__brand" href="/">
              {props.brandName}
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
                <>
                  <Link className="site-header__link" href="/account/login">
                    Login
                  </Link>
                  <Link className="site-header__link" href="/account/register">
                    Register
                  </Link>
                </>
              )}
            </div>
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
            <CartDrawer />
          </div>
        </div>
        {isMobileMenuOpen ? (
          <div id="site-mobile-menu" className="site-header__mobile-menu">
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
                <>
                  <Link
                    className="site-header__mobile-link"
                    href="/account/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Login
                  </Link>
                  <Link
                    className="site-header__mobile-link"
                    href="/account/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Register
                  </Link>
                </>
              )}
            </nav>
          </div>
        ) : null}
      </Container>
    </header>
  );
}
