import type { ReactNode } from "react";

import Link from "next/link";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { aboutBridge, aboutHero, aboutSections } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function AboutPageView() {
  const heroParagraphs = aboutHero.body.split("\n\n");
  const [craftSection, directionSection] = aboutSections.map((section) => ({
    ...section,
    paragraphs: section.body.split("\n\n"),
  }));
  const productLinks = [
    { text: "Moroccan rugs", href: "/shop/rugs" },
    { text: "poufs", href: "/shop/poufs" },
    { text: "pillows", href: "/shop/pillows" },
  ] as const;

  function renderLinkedText(text: string): ReactNode {
    const matches = productLinks
      .map((link) => {
        const index = text.indexOf(link.text);
        return index >= 0 ? { ...link, index } : null;
      })
      .filter((value): value is (typeof productLinks)[number] & { index: number } => value !== null)
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
        <Link key={`${match.href}-${match.index}`} className={styles.inlineLink} href={match.href}>
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
                {renderLinkedText(paragraph)}
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
          <PlaceholderMedia
            alt="Founder photo placeholder"
            aspectRatio="4 / 5"
            label="Founder photo pending"
            sizes="(max-width: 1100px) 100vw, 40vw"
          />
        </div>
      </section>

      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>{aboutBridge.eyebrow}</p>
        <h2>This shop carries on my grandfather&apos;s bazaar.</h2>
        <p className={styles.body}>{renderLinkedText(aboutBridge.body)}</p>
      </section>

      <section className={`${styles.twoColumn} ${styles.aboutSplitSection}`}>
        <article className={styles.aboutOpenPanel}>
          <p className={styles.eyebrow}>{craftSection.eyebrow}</p>
          <h2>{craftSection.title}</h2>
          <div className={styles.aboutOpenBody}>
            {craftSection.paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{renderLinkedText(paragraph)}</p>
            ))}
          </div>
        </article>

        <article className={styles.aboutOpenPanel}>
          <p className={styles.eyebrow}>{directionSection.eyebrow}</p>
          <h2>{directionSection.title}</h2>
          <div className={styles.aboutOpenBody}>
            {directionSection.paragraphs.map((paragraph, index) => (
              <p key={`${index}-${paragraph.slice(0, 24)}`}>{renderLinkedText(paragraph)}</p>
            ))}
          </div>
        </article>
      </section>

      <section className={styles.aboutExit}>
        <div className={styles.aboutExitBody}>
          <p className={styles.eyebrow}>Continue</p>
          <h2>Each piece is still chosen one at a time, then shipped from Casablanca.</h2>
          <p className={styles.body}>
            Browse Moroccan rugs, poufs, pillows, and antiques, or use the trade route if you are sourcing for a client project.
          </p>
          <div className={styles.policyActions}>
            <Link className={styles.primaryAction} href="/shop">
              Shop the collection
            </Link>
            <Link className={styles.secondaryAction} href="/sourcing">
              Read the sourcing notes
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
