import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export function SiteHeader() {
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
        </div>
      </Container>
    </header>
  );
}
