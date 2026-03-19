import Image from "next/image";
import Link from "next/link";

import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import {
  homeCategories,
  homeFeaturedDirections,
  homeHero,
  homeNarrativeSections,
  homeNewsletter,
  homeSeoSection,
  homeTrustBadges,
  homeTrustBanner,
} from "@/features/home/home-page-data";

import styles from "./home-page.module.css";

export function HomePageView() {
  return (
    <div className={styles.page}>
      <Section width="wide">
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{homeHero.eyebrow}</p>
            <h1>{homeHero.title}</h1>
            <p className={styles.lede}>{homeHero.description}</p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href={homeHero.primaryCta.href}>
                {homeHero.primaryCta.label}
              </Link>
              <Link className={styles.secondaryAction} href={homeHero.secondaryCta.href}>
                {homeHero.secondaryCta.label}
              </Link>
            </div>
          </div>

          <div className={styles.heroAside}>
            <div className={styles.heroMedia}>
              <Image
                alt={homeHero.imageAlt}
                className={styles.heroImage}
                fill
                priority
                sizes="(max-width: 1100px) 100vw, 38vw"
                src={homeHero.imageSrc}
              />
            </div>
          </div>
        </div>
      </Section>

      <Section tone="muted" width="wide">
        <div className={styles.trustBanner} aria-label="Trust highlights">
          {homeTrustBanner.map((item) => (
            <p key={item}>{item}</p>
          ))}
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.categorySection}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Categories</p>
            <h2>Shop Moroccan rugs, poufs, pillows, and decor by category.</h2>
            <p className={styles.sectionBody}>
              Start with the pieces at the center of the collection: handcrafted Moroccan rugs,
              one-of-one vintage rugs, rug-made poufs, cactus silk pillows, and decor selected for
              warmth, texture, and character.
            </p>
          </div>
          <div className={styles.categoryGrid}>
            {homeCategories.map((category) => (
              <Link key={category.href} className={styles.categoryCard} href={category.href}>
                <h3>{category.title}</h3>
                <p>{category.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.featuredLayout}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Featured directions</p>
            <h2>Start with the signature pieces of the collection.</h2>
            <p className={styles.sectionBody}>
              Explore the three directions that define the launch: Moroccan rugs, rug-made poufs,
              and cactus silk pillows.
            </p>
          </div>
          <div className={styles.featuredGrid}>
            {homeFeaturedDirections.map((product) => (
              <Link key={product.name} className={styles.productCard} href={product.href ?? "/shop"}>
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
                  <h3>{product.name}</h3>
                  <p>{product.note}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.narrativeGrid}>
          {homeNarrativeSections.map((section) => (
            <Link
              key={section.title}
              className={styles.narrativeCard}
              href={section.href ?? "/shop"}
            >
              <p className={styles.eyebrow}>{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section tone="muted" width="wide">
        <div className={styles.badgesSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Launch essentials</p>
            <h2>Why these pieces stand out.</h2>
          </div>
          <div className={styles.badgesGrid}>
            {homeTrustBadges.map((badge) => (
              <div key={badge} className={styles.badgeCard}>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>{homeSeoSection.eyebrow}</p>
          <h2>{homeSeoSection.title}</h2>
          <p className={styles.sectionBody}>{homeSeoSection.body}</p>
        </div>
      </Section>

      <Section width="wide">
        <Container width="narrow">
          <div className={styles.newsletterCard}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>{homeNewsletter.eyebrow}</p>
              <h2>{homeNewsletter.title}</h2>
              <p className={styles.sectionBody}>{homeNewsletter.description}</p>
            </div>
            <form className={styles.newsletterForm}>
              <label className={styles.newsletterLabel} htmlFor="newsletter-email">
                Email address
              </label>
              <div className={styles.newsletterControls}>
                <input
                  id="newsletter-email"
                  className={styles.newsletterInput}
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                />
                <button className={styles.newsletterButton} type="button">
                  Join the list
                </button>
              </div>
            </form>
          </div>
        </Container>
      </Section>
    </div>
  );
}
