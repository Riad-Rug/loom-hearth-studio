import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <Container width="wide">
        <div className="site-footer__grid">
          <div className="site-footer__intro">
            <p className="site-footer__eyebrow">{siteConfig.name}</p>
            <p className="site-footer__brand">
              Handcrafted Moroccan rugs, vintage rugs, poufs, pillows, and curated home decor.
            </p>
            <p className="site-footer__meta">
              Curated for a United States launch in USD.
            </p>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">Explore</p>
            <nav aria-label="Footer primary" className="site-footer__nav">
              {siteConfig.primaryNav.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">Support</p>
            <nav aria-label="Footer support" className="site-footer__nav">
              {siteConfig.supportNav.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">Collections</p>
            <nav aria-label="Footer collections" className="site-footer__nav">
              <Link className="site-footer__link" href="/shop/rugs">
                Moroccan rugs
              </Link>
              <Link className="site-footer__link" href="/shop/vintage">
                Vintage rugs
              </Link>
              <Link className="site-footer__link" href="/shop/poufs">
                Poufs
              </Link>
              <Link className="site-footer__link" href="/shop/pillows">
                Pillows
              </Link>
              <Link className="site-footer__link" href="/shop/decor">
                Home decor
              </Link>
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
}
