import type { Route } from "next";
import Link from "next/link";
import Image from "next/image";

import { NewsletterSignupIntentForm } from "@/components/analytics/newsletter-signup-intent-form";
import { PlaceholderMedia } from "@/components/media/placeholder-media";
import type { HomePageContent } from "@/features/home/home-page-data";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { allowedImageHostnames } from "@/lib/media/allowed-image-hosts";
import type { ProductCategory } from "@/types/domain";

import { LiveProductCardImage } from "./live-product-card-image";
import styles from "./home-page.module.css";

type HomePageViewProps = {
  content: HomePageContent;
  featuredProducts?: CatalogProductCardViewModel[];
  liveCategories?: ProductCategory[];
};

const founderNoteDesktop =
  "I photograph every piece myself in Casablanca. You approve the exact photos — daylight, wear included — before you pay.";
const founderNoteMobile = "I photograph every piece myself. You approve before you pay.";

const howItWorksSteps = [
  {
    number: "1",
    title: "You reserve the piece",
    body: "Card authorized, not charged. The piece comes off the floor.",
  },
  {
    number: "2",
    title: "I photograph it for you",
    body: "Daylight, within 72 hours. Wear included.",
  },
  {
    number: "3",
    title: "You approve, then pay",
    body: "Captured only after you confirm. Change your mind — no charge.",
  },
  {
    number: "4",
    title: "Tracked to your door",
    body: "From Casablanca in 5–10 days. US · CA · AU.",
  },
] as const;

const categoryCardCategoryKey: Record<string, ProductCategory> = {
  "category-rugs": "rugs",
  "category-poufs": "poufs",
  "category-pillows": "pillows",
  "category-decor": "decor",
  "category-vintage": "vintage",
};

const inventoryChips = [
  { label: "All", href: "/shop" },
  { label: "Rugs", href: "/shop/rugs" },
  { label: "Poufs", href: "/shop/poufs" },
  { label: "Pillows", href: "/shop/pillows" },
  { label: "Decor & Antiques", href: "/shop/decor" },
] as const;

export function HomePageView({ content, featuredProducts = [], liveCategories }: HomePageViewProps) {
  const liveCategorySet = liveCategories ? new Set(liveCategories) : null;
  const categoryCards = content.categories.cards.filter((card) => {
    if (!card.visible) {
      return false;
    }

    if (!liveCategorySet) {
      return true;
    }

    const categoryKey = categoryCardCategoryKey[card.id];
    return categoryKey ? liveCategorySet.has(categoryKey) : true;
  });
  const normalizedFeaturedProducts = featuredProducts.slice(0, 8);
  const heroImage = getRenderableImage(content.hero.image.src);
  const hasHeroActions = content.hero.primaryCta.visible || content.hero.secondaryCta.visible;

  return (
    <div className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
          <h1>{content.hero.title}</h1>
          <p className={styles.heroBody}>{content.hero.paragraph}</p>
          {hasHeroActions ? (
            <div className={styles.heroActions}>
              {content.hero.primaryCta.visible ? (
                <Link
                  className={styles.primaryAction}
                  href={content.hero.primaryCta.href as Route}
                >
                  {content.hero.primaryCta.label}
                </Link>
              ) : null}
              {content.hero.secondaryCta.visible ? (
                <Link
                  className={styles.secondaryAction}
                  href={content.hero.secondaryCta.href as Route}
                >
                  {content.hero.secondaryCta.label}
                </Link>
              ) : null}
            </div>
          ) : null}
        </div>

        <div className={styles.heroMedia}>
          {heroImage ? (
            <Image
              alt={content.hero.image.alt || "Texture photograph placeholder"}
              className={styles.heroImage}
              fill
              priority
              sizes="(max-width: 700px) calc(100vw - 3rem), (max-width: 980px) calc(100vw - 6rem), 42vw"
              src={heroImage}
            />
          ) : (
            <PlaceholderMedia
              alt="Texture photograph placeholder"
              aspectRatio="4 / 5"
              label="Texture photo pending"
              priority
              sizes="(max-width: 700px) calc(100vw - 3rem), (max-width: 980px) calc(100vw - 6rem), 42vw"
            />
          )}
        </div>
      </section>

      <section className={styles.founderStrip}>
        <p className={styles.desktopCopy}>{founderNoteDesktop}</p>
        <p className={styles.mobileCopy}>{founderNoteMobile}</p>
        <span className={styles.desktopCopy}>— Riad, founder</span>
        <span className={styles.mobileCopy}>— Riad</span>
      </section>

      <section className={styles.inventorySection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>Inventory</p>
            <h2>In the warehouse now</h2>
          </div>
          <p>Every piece is the only one. When it sells, it&apos;s gone.</p>
        </div>

        <div className={styles.filterChips} aria-label="Browse inventory by category">
          {inventoryChips.map((chip) => (
            <Link key={chip.href} className={styles.filterChip} href={chip.href as Route}>
              {chip.label}
            </Link>
          ))}
        </div>

        {normalizedFeaturedProducts.length === 0 ? (
          <p className={styles.inventoryEmptyState}>
            Nothing here right now — new pieces land most weeks. Join the list below to see them
            first.
          </p>
        ) : null}

        <div className={styles.productGrid}>
          {normalizedFeaturedProducts.map((product) => (
            <Link key={product.id} className={styles.productCard} href={product.href as Route}>
              <div className={styles.productImageWrap}>
                <LiveProductCardImage
                  primaryImage={product.primaryImage}
                  productName={product.name}
                  secondaryImage={product.secondaryImage}
                />
              </div>
              <div className={styles.productMeta}>
                <div className={styles.productTitleRow}>
                  <h3>{product.displayName}</h3>
                  {product.status === "sold" ? (
                    <span className={styles.productBadge}>SOLD</span>
                  ) : null}
                </div>
                <p className={styles.productSubtitle}>{product.subtitle}</p>
                <p className={styles.productPrice}>{product.priceUsdLabel}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.howItWorksSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>How it works</p>
            <h2>See the exact piece before the charge settles.</h2>
          </div>
          <p>No stock photos, no substitutions. Every step is tied to the physical piece on my floor in Casablanca.</p>
        </div>

        <div className={styles.stepsGrid}>
          {howItWorksSteps.map((step) => (
            <article key={step.number} className={styles.stepCard}>
              <span className={styles.stepNumber}>{step.number}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.categoriesSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>{content.categories.eyebrow}</p>
            <h2>{content.categories.title}</h2>
          </div>
          <p>{content.categories.paragraph}</p>
        </div>

        <div className={styles.categoryGrid}>
          {categoryCards.map((card) => {
            const imageSrc = getRenderableImage(card.image.src);

            return (
              <Link key={card.id} className={styles.categoryCard} href={card.href as Route}>
                <div className={styles.categoryMedia}>
                  {imageSrc ? (
                    <Image
                      alt={card.image.alt}
                      className={styles.categoryImage}
                      fill
                      sizes="(max-width: 980px) 100vw, 33vw"
                      src={imageSrc}
                    />
                  ) : (
                    <PlaceholderMedia
                      alt={`${card.title} placeholder`}
                      aspectRatio="4 / 3"
                      label={`${card.title} photo pending`}
                      sizes="(max-width: 980px) 100vw, 33vw"
                    />
                  )}
                </div>
                <div className={styles.categoryBody}>
                  <h3>{card.title}</h3>
                  <p>{card.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section className={styles.storySection}>
        <div className={styles.storyCopy}>
          <p className={styles.eyebrow}>{content.brandStory.eyebrow}</p>
          <h2>{content.brandStory.title}</h2>
          <p>{content.brandStory.paragraph}</p>
        </div>
        <div className={styles.storyActions}>
          <Link className={styles.primaryAction} href={content.brandStory.href as Route}>
            {content.brandStory.linkLabel}
          </Link>
          <Link className={styles.secondaryAction} href="/sourcing">
            See how I source
          </Link>
        </div>
      </section>

      <section className={styles.newsletterSection}>
        <div className={styles.sectionHeader}>
          <div>
            <p className={styles.eyebrow}>{content.newsletter.eyebrow}</p>
            <h2>{content.newsletter.title}</h2>
          </div>
          <p>{content.newsletter.paragraph}</p>
        </div>
        <NewsletterSignupIntentForm
          ctaLabel={content.newsletter.ctaLabel}
          inputLabel={content.newsletter.inputLabel}
          inputPlaceholder={content.newsletter.inputPlaceholder}
        />
      </section>
    </div>
  );
}

function getRenderableImage(src: string) {
  if (src.startsWith("/") && !src.startsWith("//")) {
    return src;
  }

  try {
    const parsed = new URL(src);
    return parsed.protocol === "https:" && allowedImageHostnames.includes(parsed.hostname as (typeof allowedImageHostnames)[number])
      ? src
      : "";
  } catch {
    return "";
  }
}
