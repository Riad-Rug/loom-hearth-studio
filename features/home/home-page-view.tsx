import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import type { HomePageContent, HomePageOrderedSectionKey } from "@/features/home/home-page-data";

import styles from "./home-page.module.css";

type HomePageViewProps = {
  content: HomePageContent;
};

export function HomePageView({ content }: HomePageViewProps) {
  return <div className={styles.page}>{content.sectionOrder.map((key) => renderSection(key, content))}</div>;
}

function renderSection(key: HomePageOrderedSectionKey, content: HomePageContent) {
  if (key === "hero" && content.hero.visible) {
    return (
      <Section key={key} width="wide">
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p className={styles.lede}>{content.hero.paragraph}</p>
            <div className={styles.heroActions}>
              {content.hero.primaryCta.visible ? (
                <Link className={styles.primaryAction} href={content.hero.primaryCta.href as Route}>
                  {content.hero.primaryCta.label}
                </Link>
              ) : null}
              {content.hero.secondaryCta.visible ? (
                <Link className={styles.secondaryAction} href={content.hero.secondaryCta.href as Route}>
                  {content.hero.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          </div>

          <div className={styles.heroAside}>
            <div className={styles.heroMedia}>
              <Image
                alt={content.hero.image.alt}
                className={styles.heroImage}
                fill
                priority
                sizes="(max-width: 1100px) 100vw, 38vw"
                src={content.hero.image.src}
              />
            </div>
          </div>
        </div>
      </Section>
    );
  }

  if (key === "badges" && content.badges.visible) {
    const items = content.badges.items.filter((item) => item.visible);

    if (!items.length) {
      return null;
    }

    return (
      <Section key={key} tone="muted" width="wide">
        <div className={styles.trustBanner} aria-label="Trust highlights">
          {items.map((item) => (
            <p key={item.id}>{item.label}</p>
          ))}
        </div>
      </Section>
    );
  }

  if (key === "categories" && content.categories.visible) {
    const cards = content.categories.cards.filter((card) => card.visible);

    if (!cards.length) {
      return null;
    }

    return (
      <Section key={key} width="wide">
        <div className={styles.categorySection}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{content.categories.eyebrow}</p>
            <h2>{content.categories.title}</h2>
            <p className={styles.sectionBody}>{content.categories.paragraph}</p>
          </div>
          <div className={styles.categoryGrid}>
            {cards.map((category) => (
              <Link key={category.id} className={styles.categoryCard} href={category.href as Route}>
                <div className={styles.categoryImageWrap}>
                  <Image
                    alt={category.image.alt}
                    className={styles.categoryImage}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 20vw"
                    src={category.image.src}
                  />
                </div>
                <div className={styles.categoryCardContent}>
                  <h3>{category.title}</h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  if ((key === "brandStory" && content.brandStory.visible) || (key === "designDirection" && content.designDirection.visible)) {
    const sections = [content.brandStory, content.designDirection].filter((section) => section.visible);

    if (!sections.length || key !== firstNarrativeSection(content)) {
      return null;
    }

    return (
      <Section key={key} width="wide">
        <div className={styles.narrativeGrid}>
          {sections.map((section) => (
            <Link key={section.title} className={styles.narrativeCard} href={section.href as Route}>
              <p className={styles.eyebrow}>{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p>{section.paragraph}</p>
              <span className={styles.narrativeLinkLabel}>{section.linkLabel}</span>
            </Link>
          ))}
        </div>
      </Section>
    );
  }

  if (key === "featured" && content.featured.visible) {
    const cards = content.featured.cards.filter((card) => card.visible);

    if (!cards.length) {
      return null;
    }

    return (
      <Section key={key} width="wide">
        <div className={styles.featuredLayout}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{content.featured.eyebrow}</p>
            <h2>{content.featured.title}</h2>
            <p className={styles.sectionBody}>{content.featured.paragraph}</p>
          </div>
          <div className={styles.featuredGrid}>
            {cards.map((product) => (
              <Link key={product.id} className={styles.productCard} href={product.href as Route}>
                <div className={styles.productImagePlaceholder}>
                  <Image
                    alt={product.image.alt}
                    className={styles.productImage}
                    fill
                    sizes="(max-width: 1100px) 100vw, 33vw"
                    src={product.image.src}
                  />
                </div>
                <div className={styles.productMeta}>
                  <h3>{product.title}</h3>
                  <p>{product.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  if ((key === "guide" && content.guide.visible) || (key === "newsletter" && content.newsletter.visible)) {
    if (!content.guide.visible && !content.newsletter.visible) {
      return null;
    }

    if (key !== firstEditorialSection(content)) {
      return null;
    }

    return (
      <Section key={key} width="wide">
        <div className={styles.editorialPair}>
          {content.guide.visible ? (
            <div className={styles.seoCard}>
              <div className={styles.sectionIntro}>
                <p className={styles.eyebrow}>{content.guide.eyebrow}</p>
                <h2>{content.guide.title}</h2>
                <p className={styles.sectionBody}>{content.guide.paragraph}</p>
              </div>
            </div>
          ) : null}
          {content.newsletter.visible ? (
            <div className={styles.newsletterCard}>
              <div className={styles.sectionIntro}>
                <p className={styles.eyebrow}>{content.newsletter.eyebrow}</p>
                <h2>{content.newsletter.title}</h2>
                <p className={styles.sectionBody}>{content.newsletter.paragraph}</p>
              </div>
              <form className={styles.newsletterForm}>
                <label className={styles.newsletterLabel} htmlFor="newsletter-email">
                  {content.newsletter.inputLabel}
                </label>
                <div className={styles.newsletterControls}>
                  <input
                    id="newsletter-email"
                    className={styles.newsletterInput}
                    name="email"
                    type="email"
                    placeholder={content.newsletter.inputPlaceholder}
                  />
                  <button className={styles.newsletterButton} type="button">
                    {content.newsletter.ctaLabel}
                  </button>
                </div>
              </form>
            </div>
          ) : null}
        </div>
      </Section>
    );
  }

  return null;
}

function firstNarrativeSection(content: HomePageContent) {
  return content.sectionOrder.find(
    (key) => (key === "brandStory" && content.brandStory.visible) || (key === "designDirection" && content.designDirection.visible),
  );
}

function firstEditorialSection(content: HomePageContent) {
  return content.sectionOrder.find(
    (key) => (key === "guide" && content.guide.visible) || (key === "newsletter" && content.newsletter.visible),
  );
}
