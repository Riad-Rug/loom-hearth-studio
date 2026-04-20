import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { publicBusinessDetails } from "@/config/public-business-details";
import { siteConfig } from "@/config/site";
import { getHomepageContent } from "@/lib/homepage/content";

export async function SiteFooter() {
  const content = await getHomepageContent();
  const introTitle = /homepage manager studio/i.test(content.footer.introTitle)
    ? siteConfig.name
    : content.footer.introTitle;
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
            <p className="site-footer__eyebrow">{introTitle}</p>
            <p className="site-footer__brand">{content.footer.introBody}</p>
            <p className="site-footer__meta">{content.footer.introMeta}</p>
            <p className="site-footer__trade">
              Interior designers, wholesalers, and trade professionals: our full inventory is larger than what is
              listed online. Contact us for sourcing and project inquiries.
            </p>
            <div className="site-footer__legal">
              <p className="site-footer__legal-heading">Studio and contact details</p>
              <p>{publicBusinessDetails.legalName}</p>
              <p>Atelier &amp; sourcing: Marrakech, Morocco</p>
              <p>Registered office: Wyoming, USA</p>
              <p>{publicBusinessDetails.email}</p>
              <p>{publicBusinessDetails.complaintsLine}</p>
            </div>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">{content.footer.exploreHeading}</p>
            <nav aria-label="Footer primary" className="site-footer__nav">
              {exploreLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">{content.footer.supportHeading}</p>
            <nav aria-label="Footer support" className="site-footer__nav">
              {supportLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <p className="site-footer__heading">{content.footer.collectionsHeading}</p>
            <nav aria-label="Footer collections" className="site-footer__nav">
              {collectionLinks.map((item) => (
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
