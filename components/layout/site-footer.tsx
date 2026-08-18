import type { Route } from "next";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { siteConfig } from "@/config/site";
import { getHomepageContent } from "@/lib/homepage/content";

const socialChannels = [
  {
    key: "instagram",
    label: `${siteConfig.name} on Instagram`,
    href: siteConfig.socialLinks.instagram,
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="5" />
        <circle cx="12" cy="12" r="4" />
        <circle cx="17.2" cy="6.8" r="1.15" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    key: "tiktok",
    label: `${siteConfig.name} on TikTok`,
    href: siteConfig.socialLinks.tiktok,
    icon: (
      <>
        <path d="M14 3.5v11a3.75 3.75 0 1 1-3.75-3.75" />
        <path d="M14 3.5a5.5 5.5 0 0 0 5.5 5.5" />
      </>
    ),
  },
] as const;

export async function SiteFooter() {
  const content = await getHomepageContent();

  if (!content.footer.visible) {
    return null;
  }

  const exploreLinks = dedupeFooterLinks(content.footer.exploreLinks);
  const supportLinks = dedupeFooterLinks(content.footer.supportLinks);
  const collectionLinks = dedupeFooterLinks(content.footer.collectionLinks);
  const activeSocialChannels = socialChannels.filter((channel) => channel.href.trim().length > 0);
  const currentYear = new Date().getFullYear();

  return (
    <footer className="site-footer">
      <Container width="wide">
        <div className="site-footer__grid">
          <div className="site-footer__intro">
            <p className="site-footer__eyebrow">Loom &amp; Hearth</p>
            <p className="site-footer__statement">Handmade Moroccan rugs, poufs, pillows and antiques.</p>
            <p className="site-footer__brand">
              {content.footer.introBody ||
                "One of each, sold direct from Casablanca. Every piece is photographed individually and approved in daylight before payment is captured."}
            </p>
            {content.footer.introMeta ? (
              <p className="site-footer__meta">{content.footer.introMeta}</p>
            ) : null}
            {activeSocialChannels.length > 0 ? (
              <ul className="site-footer__social">
                {activeSocialChannels.map((channel) => (
                  <li key={channel.key}>
                    <a
                      className="site-footer__social-link"
                      href={channel.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={channel.label}
                    >
                      <svg
                        className="site-footer__social-icon"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        aria-hidden="true"
                        focusable="false"
                      >
                        {channel.icon}
                      </svg>
                    </a>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div className="site-footer__nav-group">
            <h2 className="site-footer__heading" id="site-footer-explore">
              {content.footer.exploreHeading}
            </h2>
            <nav aria-labelledby="site-footer-explore" className="site-footer__nav">
              {exploreLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <h2 className="site-footer__heading" id="site-footer-support">
              {content.footer.supportHeading}
            </h2>
            <nav aria-labelledby="site-footer-support" className="site-footer__nav">
              {supportLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
          <div className="site-footer__nav-group">
            <h2 className="site-footer__heading" id="site-footer-collections">
              {content.footer.collectionsHeading}
            </h2>
            <nav aria-labelledby="site-footer-collections" className="site-footer__nav">
              {collectionLinks.map((item) => (
                <Link key={item.href} className="site-footer__link" href={item.href as Route}>
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
        <p className="site-footer__legal-line">
          © {currentYear} Loom &amp; Hearth · Wyoming LLC · Ships from Casablanca, Morocco
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
