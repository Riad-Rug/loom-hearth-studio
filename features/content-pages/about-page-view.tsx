import type { Route } from "next";
import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import { siteConfig } from "@/config/site";
import { aboutBridge, aboutHero, aboutSections } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

type ProductLink = { text: string; href: string };

// Labelled (not icon-only) follow links, read from the same config the footer
// icons use so clearing a URL there removes it here too.
const socialFollowLinks = (
  [
    { label: "Instagram", href: siteConfig.socialLinks.instagram },
    { label: "YouTube", href: siteConfig.socialLinks.youtube },
    { label: "TikTok", href: siteConfig.socialLinks.tiktok },
  ] as const
).filter((link) => link.href.trim().length > 0);

export function AboutPageView() {
  const heroParagraphs = aboutHero.body.split("\n\n");
  const [craftSection] = aboutSections.map((section) => ({
    ...section,
    paragraphs: section.body.split("\n\n"),
  }));
  const productLinks = [
    { text: "Moroccan rugs", href: "/shop/rugs" },
    { text: "poufs", href: "/shop/poufs" },
    { text: "pillows", href: "/shop/pillows" },
  ] as const;
  const heroLinks = [
    { text: "Moroccan handmade artisanat", href: "/shop" },
    { text: "rug", href: "/shop/rugs" },
  ] as const;

  function renderLinkedText(text: string, links: readonly ProductLink[] = productLinks): ReactNode {
    const matches = links
      .map((link) => {
        const index = text.indexOf(link.text);
        return index >= 0 ? { ...link, index } : null;
      })
      .filter((value): value is ProductLink & { index: number } => value !== null)
      .sort((a, b) => a.index - b.index);

    if (matches.length === 0) {
      return text;
    }

    const nodes: ReactNode[] = [];
    let cursor = 0;

    for (const match of matches) {
      if (match.index < cursor) {
        continue;
      }

      if (match.index > cursor) {
        nodes.push(text.slice(cursor, match.index));
      }

      nodes.push(
        <Link key={`${match.href}-${match.index}`} className={styles.inlineLink} href={match.href as Route}>
          {match.text}
        </Link>,
      );

      cursor = match.index + match.text.length;
    }

    if (cursor < text.length) {
      nodes.push(text.slice(cursor));
    }

    return nodes;
  }

  return (
    <div className={styles.page}>
      <section className={`${styles.hero} ${styles.aboutHero}`}>
        <div className={styles.aboutHeroContent}>
          <p className={styles.eyebrow}>{aboutHero.eyebrow}</p>
          <h1>{aboutHero.title}</h1>
          <div className={styles.heroBody}>
            {heroParagraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`} className={styles.lede}>
                {renderLinkedText(paragraph, heroLinks)}
              </p>
            ))}
          </div>
          <p className={styles.aboutHeroHighlight}>{aboutHero.highlight}</p>
          <div className={styles.policyActions}>
            <Link className={styles.primaryAction} href="/shop">
              Shop the collection
            </Link>
            <Link className={styles.secondaryAction} href="/trade">
              Trade inquiries
            </Link>
          </div>
        </div>

        <div className={styles.aboutFounderMedia}>
          <Image
            alt="Riad, Loom & Hearth Studio founder"
            className={styles.aboutHeroImage}
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 40vw"
            src="/about/founder-portrait.png"
          />
        </div>
      </section>

      <section className={`${styles.sectionHeader} ${styles.aboutBridgeSection}`}>
        <p className={styles.eyebrow}>{aboutBridge.eyebrow}</p>
        <h2>{aboutBridge.title}</h2>
        <p className={styles.body}>{renderLinkedText(aboutBridge.body)}</p>
      </section>

      <section className={`${styles.aboutSplitSection} ${styles.aboutSplitSectionSingle}`}>
        <article className={styles.aboutOpenPanel}>
          <p className={styles.eyebrow}>{craftSection.eyebrow}</p>
          <h2>{craftSection.title}</h2>
          <div className={styles.aboutOpenBody}>
            {craftSection.paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{renderLinkedText(paragraph)}</p>
            ))}
          </div>
        </article>
      </section>

      <section className={`${styles.aboutExit} ${styles.aboutExitFlat}`}>
        <div className={styles.aboutExitBody}>
          <p className={styles.eyebrow}>Continue</p>
          <div className={styles.aboutExitRow}>
            <h2>Learn more about Moroccan Handmade rugs and artisanat.</h2>
            <Link className={styles.secondaryAction} href="/blog">
              Journal
            </Link>
          </div>
          <div className={`${styles.aboutExitRow} ${styles.aboutExitRowCentered}`}>
            <p className={`${styles.body} ${styles.aboutExitStatement}`}>Find YOUR statement piece</p>
            <Link className={styles.primaryAction} href="/shop">
              Full Collection
            </Link>
          </div>
          {socialFollowLinks.length > 0 ? (
            <div className={styles.aboutExitRow}>
              <p className={styles.body}>Follow the workshop</p>
              <div className={styles.aboutExitLinks}>
                {socialFollowLinks.map((link) => (
                  <a
                    key={link.href}
                    className={styles.secondaryAction}
                    href={link.href}
                    target="_blank"
                    rel="me noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
