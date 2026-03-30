import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

import { aboutBridge, aboutHero, aboutSections } from "@/features/content-pages/content-pages-data";

import styles from "./content-pages.module.css";

export function AboutPageView() {
  const heroParagraphs = aboutHero.body.split("\n\n");
  const sectionParagraphs = aboutSections.map((section) => ({
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
      <section className={styles.hero}>
        <p className={styles.eyebrow}>{aboutHero.eyebrow}</p>
        <h1>{aboutHero.title}</h1>
        <div className={styles.heroBody}>
          {heroParagraphs.map((paragraph, index) => (
            <p key={`${index}-${paragraph.slice(0, 24)}`} className={styles.lede}>
              {renderLinkedText(paragraph)}
            </p>
          ))}
        </div>
        <div className={styles.contactActions}>
          <Link className={styles.primaryAction} href="/shop/rugs">
            Shop Moroccan rugs
          </Link>
          <Link className={styles.secondaryAction} href="/shop">
            Shop the collection
          </Link>
        </div>
        <div className={styles.trustHighlight}>
          Ships from Morocco in 5-7 business days - no unexpected import charges for US orders.
        </div>
      </section>

      <section className={styles.proofBlock}>
        <div className={styles.proofMedia}>
          <Image
            alt="Traditional Moroccan rug showroom in Fes with handwoven rugs displayed across a warm interior"
            className={styles.proofImage}
            fill
            priority
            sizes="(max-width: 1100px) 100vw, 1200px"
            src="https://images.pexels.com/photos/28582589/pexels-photo-28582589.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=900&w=1600"
          />
        </div>
        <div className={styles.proofBody}>
          <p className={styles.eyebrow}>Selected in Morocco</p>
          <p className={styles.body}>
            Direct sourcing, in-person selection, and pieces assessed for construction quality
            before entering the collection.
          </p>
        </div>
      </section>

      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>{aboutBridge.eyebrow}</p>
        <h2>{aboutBridge.title}</h2>
        <p className={styles.body}>{renderLinkedText(aboutBridge.body)}</p>
      </section>

      <section className={styles.twoColumn}>
        {sectionParagraphs.map((section) => (
          <article key={section.title} className={styles.card}>
            <p className={styles.eyebrow}>{section.eyebrow}</p>
            <h2>{section.title}</h2>
            <div className={styles.cardBody}>
              {section.paragraphs.map((paragraph, index) => (
                <p key={`${index}-${paragraph.slice(0, 24)}`}>{renderLinkedText(paragraph)}</p>
              ))}
            </div>
          </article>
        ))}
      </section>

      <section className={styles.contactActions}>
        <Link className={styles.primaryAction} href="/shop">
          SHOP THE COLLECTION
        </Link>
      </section>
    </div>
  );
}


