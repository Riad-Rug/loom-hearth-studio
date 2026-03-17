import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import { CartDrawer } from "@/features/cart/cart-drawer";
import { getCurrentAuthenticatedUser } from "@/lib/auth/service";

export async function SiteHeader() {
  const authenticatedUser = await getCurrentAuthenticatedUser();

  return (
    <header className="site-header">
      <div className="site-header__announcement">
        <Container width="wide">
          <p>{siteConfig.announcement}</p>
        </Container>
      </div>
      <Container width="wide">
        <div className="site-header__bar">
          <div className="site-header__identity">
            <Link className="site-header__brand" href="/">
              {siteConfig.name}
            </Link>
            <p className="site-header__tagline">{siteConfig.tagline}</p>
          </div>
          <nav aria-label="Primary" className="site-header__nav">
            {siteConfig.primaryNav.map((item) => (
              <Link key={item.href} className="site-header__link" href={item.href}>
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="site-header__actions">
            <div className="site-header__account-links">
              {authenticatedUser ? (
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
            <CartDrawer />
          </div>
        </div>
      </Container>
    </header>
  );
}
