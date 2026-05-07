import type { ReactNode } from "react";

import Image from "next/image";
import Link from "next/link";

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
  const sourcingProofs = [
    {
      title: "Selected by hand in the bazaar",
      body:
        "The collection is built through direct handling, not remote buying. Pieces are checked in person for colour, fibre, balance, and whether they actually hold a room.",
      imageSrc: "/about/sourcing-hands.png",
      imageAlt:
        "Hands examining a handcrafted Moroccan rug in the family bazaar, checking pile and edge detail.",
    },
    {
      title: "Checked for structure, not just surface",
      body:
        "The back, fringe, knot structure, and pile density all matter. That construction read is part of the selection process before a piece ever enters the site.",
      imageSrc: "/about/rug-construction-detail.png",
      imageAlt:
        "Close-up of a Moroccan rug corner lifted by hand to show reverse weave, fringe, and pile density.",
    },
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
          Ships from Morocco with free shipping to the United States, Canada, and Australia. Inquiries from other countries are reviewed case by case before payment is captured.
        </div>
      </section>

      <section className={`${styles.proofBlock} ${styles.aboutProofBlock}`}>
        <div className={styles.proofMedia}>
          <Image
            alt="Rugs displayed floor-to-ceiling in the family bazaar setting in Marrakech, with layered woven pieces and warm souk light."
            className={styles.proofImage}
            fill
            priority
            loading="eager"
            sizes="(max-width: 1100px) 100vw, 1200px"
            src="/about/marrakech-bazaar-hero.png"
          />
          <div className={styles.aboutProofCaption}>
            <p className={styles.eyebrow}>Selected in Morocco</p>
            <p>
              The collection starts in Marrakech, with direct sourcing and in-person selection
              rather than catalog buying.
            </p>
          </div>
        </div>
      </section>

      <section className={styles.sectionHeader}>
        <p className={styles.eyebrow}>{aboutBridge.eyebrow}</p>
        <h2>{aboutBridge.title}</h2>
        <p className={styles.body}>{renderLinkedText(aboutBridge.body)}</p>
      </section>

      <section className={styles.aboutSupportSection}>
        <div className={styles.aboutSupportIntro}>
          <p className={styles.eyebrow}>Selection details</p>
          <p className={styles.body}>
            The images below are part of the same sourcing process: direct handling in the bazaar,
            and close inspection of construction before a piece ever reaches the site.
          </p>
        </div>

        <div className={styles.aboutSupportGrid}>
        {sourcingProofs.map((item) => (
          <article key={item.title} className={styles.aboutSupportCard}>
            <div className={styles.aboutSupportMedia}>
              <Image
                alt={item.imageAlt}
                className={styles.proofImage}
                fill
                sizes="(max-width: 1100px) 100vw, 50vw"
                src={item.imageSrc}
              />
            </div>
            <div className={styles.aboutSupportBody}>
              <p className={styles.eyebrow}>Process</p>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </div>
          </article>
        ))}
        </div>
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
          <h2>Every piece in the collection is selected through this process, one at a time, in person.</h2>
          <p className={styles.body}>
            Browse the full collection, or use the trade route if you are sourcing for a client
            project and need support before checkout.
          </p>
          <div className={styles.policyActions}>
            <Link className={styles.primaryAction} href="/shop">
              Shop the collection
            </Link>
            <Link className={styles.secondaryAction} href="/trade">
              View the trade programme
            </Link>
          </div>
          <div className={styles.aboutCrossLinks}>
            <Link className={styles.textAction} href="/sourcing">
              Read more about how we source
            </Link>
            <Link className={styles.textAction} href="/blog">
              See what&apos;s new in the journal
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}


