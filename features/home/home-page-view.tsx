import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import type { HomePageContent } from "@/features/home/home-page-data";

import styles from "./home-page.module.css";

type HomePageViewProps = {
  content: HomePageContent;
};

export function HomePageView({ content }: HomePageViewProps) {
  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p className={styles.lede}>{content.hero.paragraph}</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href={content.hero.primaryCtaLink as Route}>
                {content.hero.primaryCtaLabel}
              </Link>
              <Link className={styles.secondaryAction} href={content.hero.secondaryCtaLink as Route}>
                {content.hero.secondaryCtaLabel}
              </Link>
            </div>
          </div>

          <div className={styles.heroAside}>
            <div className={styles.heroMedia}>
              <Image
                alt={content.hero.imageAlt}
                className={styles.heroImage}
                fill
                priority
                sizes="(max-width: 1100px) 100vw, 38vw"
                src={content.hero.imageSrc}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="muted" width="wide">
        <div className={styles.trustBanner} aria-label="Trust highlights">
          {content.trustItems.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.categorySection}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{content.categoriesSection.eyebrow}</p>
            <h2>{content.categoriesSection.title}</h2>
            <p className={styles.sectionBody}>{content.categoriesSection.paragraph}</p>
          </div>
          <div className={styles.categoryGrid}>
            {content.categoriesSection.cards.map((category) => (
              <Link key={category.href} className={styles.categoryCard} href={category.href as Route}>
                <div className={styles.categoryImageWrap}>
                  <Image
                    alt={category.imageAlt}
                    className={styles.categoryImage}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 20vw"
                    src={category.imageSrc}
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

      <Section width="wide">
        <div className={styles.narrativeGrid}>
          {[content.brandStory, content.designDirection].map((section) => (
            <Link key={section.title} className={styles.narrativeCard} href={section.href as Route}>
              <p className={styles.eyebrow}>{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p>{section.paragraph}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.featuredLayout}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{content.featuredDirections.eyebrow}</p>
            <h2>{content.featuredDirections.title}</h2>
            <p className={styles.sectionBody}>{content.featuredDirections.intro}</p>
          </div>
          <div className={styles.featuredGrid}>
            {content.featuredDirections.cards.map((product) => (
              <Link key={product.title} className={styles.productCard} href={product.href as Route}>
                <div className={styles.productImagePlaceholder}>
                  <Image
                    alt={product.imageAlt}
                    className={styles.productImage}
                    fill
                    sizes="(max-width: 1100px) 100vw, 33vw"
                    src={product.imageSrc}
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

      <Section width="wide">
        <div className={styles.editorialPair}>
          <div className={styles.seoCard}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>{content.moroccanRugsGuide.eyebrow}</p>
              <h2>{content.moroccanRugsGuide.title}</h2>
              <p className={styles.sectionBody}>{content.moroccanRugsGuide.paragraph}</p>
            </div>
          </div>
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
        </div>
      </Section>
    </div>
  );
}
