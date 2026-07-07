import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { getHomepageContent } from "@/lib/homepage/content";

export async function SiteFooter() {
  const content = await getHomepageContent();
  const exploreLinks = dedupeFooterLinks(content.footer.exploreLinks);
  const supportLinks = dedupeFooterLinks(content.footer.supportLinks);
  const collectionLinks = dedupeFooterLinks(content.footer.collectionLinks);

  if (!content.footer.visible) {
    return null;
  }

  return (
    <footer className="site-footer">
      <Container width="wide">
        <div className="site-footer__grid">
          <div className="site-footer__intro">
            <p className="site-footer__eyebrow">Loom & Hearth</p>
            <p className="site-footer__statement">Handmade Moroccan rugs, poufs, pillows and antiques.</p>
            <p className="site-footer__brand">
              {content.footer.introBody ||
                "One of each, sold direct from Casablanca. Every piece is photographed individually and approved in daylight before payment is captured."}
            </p>
            <p className="site-footer__meta">{content.footer.introMeta}</p>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">Shop</p>
            <nav aria-label="Footer shop" className="site-footer__nav">
              {exploreLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">Help</p>
            <nav aria-label="Footer support" className="site-footer__nav">
              {supportLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">Story</p>
            <nav aria-label="Footer story" className="site-footer__nav">
              {collectionLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
              <Link className="site-footer__link" href="/trade">
                Trade
              </Link>
            </nav>
          </div>
        </div>
        <p className="site-footer__legal-line">
          © 2026 Loom & Hearth · Wyoming LLC · Ships from Casablanca, Morocco
        </p>
      </Container>
    </footer>
  );
}

function dedupeFooterLinks<T extends { href: string; label: string }>(links: T[]) {
  const seen = new Set<string>();

  return links.filter((link) => {
    const key = `${link.href.trim().toLowerCase()}|${link.label.trim().toLowerCase()}`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);

    return true;
  });
}
