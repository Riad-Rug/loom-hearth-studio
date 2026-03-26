import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import { getHomepageContent } from "@/lib/homepage/content";

export async function SiteFooter() {
  const content = await getHomepageContent();
  const introTitle = /homepage manager studio/i.test(content.footer.introTitle)
    ? siteConfig.name
    : content.footer.introTitle;

  if (!content.footer.visible) {
    return null;
  }

  return (
    <footer className="site-footer">
      <Container width="wide">
        <div className="site-footer__grid">
          <div className="site-footer__intro">
            <p className="site-footer__eyebrow">{introTitle}</p>
            <p className="site-footer__brand">{content.footer.introBody}</p>
            <p className="site-footer__meta">{content.footer.introMeta}</p>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">{content.footer.exploreHeading}</p>
            <nav aria-label="Footer primary" className="site-footer__nav">
              {content.footer.exploreLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">{content.footer.supportHeading}</p>
            <nav aria-label="Footer support" className="site-footer__nav">
              {content.footer.supportLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">{content.footer.collectionsHeading}</p>
            <nav aria-label="Footer collections" className="site-footer__nav">
              {content.footer.collectionLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </Container>
    </footer>
  );
}
