import Link from "next/link";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import {
  homeCategories,
  homeFeaturedProducts,
  homeHero,
  homeNarrativeSections,
  homeNewsletter,
  homeSeoSection,
  homeStats,
  homeTestimonials,
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
            <div className={styles.statsPanel}>
              <p className={styles.panelLabel}>Launch signals</p>
              <div className={styles.statsGrid}>
                {homeStats.map((stat) => (
                  <article key={stat.label} className={styles.statCard}>
                    <strong>{stat.value}</strong>
                    <span>{stat.label}</span>
                    <span>{stat.supportingText}</span>
                  </article>
                ))}
              </div>
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
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>Categories</p>
          <h2>Shop Moroccan rugs, poufs, pillows, and decor by category.</h2>
          <p className={styles.sectionBody}>
            Explore the launch collection through the pieces shoppers look for most: Moroccan
            rugs, vintage rugs, leather poufs, cactus silk pillows, and handcrafted home decor.
            The structure stays simple so customers can move quickly from inspiration to product
            discovery.
          </p>
        </div>
        <div className={styles.categoryGrid}>
          {homeCategories.map((category, index) => (
            <Link key={category.href} className={styles.categoryCard} href={category.href}>
              <span className={styles.categoryIndex}>0{index + 1}</span>
              <h3>{category.title}</h3>
              <p>{category.description}</p>
            </Link>
          ))}
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.featuredLayout}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Featured products</p>
            <h2>A curated edit of Moroccan rugs, poufs, and pillows.</h2>
            <p className={styles.sectionBody}>
              Start with the pieces that define the collection: Moroccan rugs for grounding a
              room, leather poufs for flexible seating, and cactus silk pillows for a softer
              finishing touch.
            </p>
          </div>
          <div className={styles.featuredGrid}>
            {homeFeaturedProducts.map((product) => (
              <article key={product.name} className={styles.productCard}>
                <div className={styles.productImagePlaceholder}>
                  <PlaceholderMedia
                    alt={product.name}
                    aspectRatio="4 / 3"
                    label={product.type}
                    sizes="(max-width: 1100px) 100vw, 33vw"
                  />
                </div>
                <div className={styles.productMeta}>
                  <h3>{product.name}</h3>
                  <p className={styles.productPrice}>{product.price}</p>
                  <p>{product.note}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.narrativeGrid}>
          {homeNarrativeSections.map((section) => (
            <article key={section.title} className={styles.narrativeCard}>
              <p className={styles.eyebrow}>{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p>{section.body}</p>
            </article>
          ))}
        </div>
      </Section>

      <Section tone="muted" width="wide">
        <div className={styles.badgesSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Launch essentials</p>
            <h2>Handcrafted signals that define the collection.</h2>
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
        <div className={styles.testimonialsLayout}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>Testimonials</p>
            <h2>A testimonial layer ready for real post-launch feedback.</h2>
          </div>
          <div className={styles.testimonialsGrid}>
            {homeTestimonials.map((testimonial) => (
              <blockquote key={testimonial.id} className={styles.testimonialCard}>
                <p>{testimonial.quote}</p>
                <footer>
                  <strong>{testimonial.customerName}</strong>
                  {testimonial.location ? <span>{testimonial.location}</span> : null}
                </footer>
              </blockquote>
            ))}
          </div>
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
