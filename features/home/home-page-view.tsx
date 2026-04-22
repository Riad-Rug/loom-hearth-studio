import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { Section } from "@/components/layout/section";
import { CustomerReviewCarousel } from "@/components/reviews/customer-review-carousel";
import type { HomePageContent, HomePageOrderedSectionKey } from "@/features/home/home-page-data";
import { HowItWorksSection } from "@/features/home/how-it-works-section";
import { NewsletterSignupIntentForm } from "@/components/analytics/newsletter-signup-intent-form";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { customerReviews } from "@/lib/reviews/customer-reviews";

import styles from "./home-page.module.css";

type HomePageViewProps = {
  content: HomePageContent;
  featuredProducts?: CatalogProductCardViewModel[];
};

export function HomePageView({ content, featuredProducts = [] }: HomePageViewProps) {
  return <div className={styles.page}>{content.sectionOrder.map((key) => renderSection(key, content, featuredProducts))}</div>;
}

function getMobileHeroParagraph(paragraph: string) {
  const sentences = paragraph.trim().split(/(?<=[.!?])\s+/);

  return sentences[0] || paragraph;
}

function renderSection(key: HomePageOrderedSectionKey, content: HomePageContent, featuredProducts: CatalogProductCardViewModel[]) {
  if (key === "hero" && content.hero.visible) {
    const heroGalleryImages = getHeroGalleryImages(content);

    return (
      <Section key={key} width="wide">
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.eyebrow}>{content.hero.eyebrow}</p>
            <h1>{content.hero.title}</h1>
            <p className={styles.lede}>
              <span className={styles.ledeDesktop}>{content.hero.paragraph}</span>
              <span className={styles.ledeMobile}>{getMobileHeroParagraph(content.hero.paragraph)}</span>
            </p>
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
              {heroGalleryImages.map((image, index) => (
                <div
                  key={`${image.src}-${index}`}
                  className={styles.heroImageFrame}
                  style={{ "--hero-slide-index": index } as CSSProperties}
                >
                  <Image
                    alt={image.alt}
                    className={styles.heroImage}
                    fill
                    priority={index === 0}
                    sizes="(max-width: 1100px) 100vw, 38vw"
                    src={image.src}
                  />
                </div>
              ))}
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
        <div className={styles.buyerEntrySection}>
          <div className={styles.trustBanner} aria-label="Trust highlights">
            {items.map((item, index) => (
              <p key={item.id}>
                <span className={styles.trustIcon} aria-hidden="true">
                  <TrustIcon index={index} />
                </span>
                <span>{item.label}</span>
              </p>
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
          <FeaturedContentCards cards={cards} />
        </div>
      </Section>
    );
  }

  if (key === "proof" && content.proof.visible) {
    return <ProofComparisonSection key={key} />;
  }

  if (key === "howItWorks" && content.howItWorks.visible) {
    return <HowItWorksSection key={key} />;
  }

  if (key === "guide" && content.guide.visible) {
    const guideImage =
      content.categories.cards.find((card) => card.visible && card.id === "category-rugs")?.image ?? content.hero.image;

    return (
      <Section key={key} width="wide">
        <div className={styles.guideEditorial}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{content.guide.eyebrow}</p>
            <h2>{content.guide.title}</h2>
            <p className={styles.sectionBody}>{content.guide.paragraph}</p>
            <Link className={styles.narrativeLinkLabel} href={"/blog" as Route}>
              READ THE FULL GUIDE
            </Link>
          </div>
          <div className={styles.guideMedia}>
            <Image
              alt={guideImage.alt}
              className={styles.guideImage}
              fill
              sizes="(max-width: 900px) 100vw, 42vw"
              src={guideImage.src}
            />
          </div>
        </div>
      </Section>
    );
  }

  if (key === "faq" && content.faq.visible) {
    const items = content.faq.items.filter((item) => item.visible);

    if (!items.length) {
      return null;
    }

    return (
      <Section key={key} tone="muted" width="wide">
        <div className={styles.faqSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{content.faq.eyebrow}</p>
            <h2>{content.faq.title}</h2>
            <p className={styles.sectionBody}>{content.faq.paragraph}</p>
          </div>
          <div className={styles.faqList}>
            {items.map((item, index) => (
              <details key={item.id} className={styles.faqPanel} open={index === 0}>
                <summary>{item.question}</summary>
                <p>{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </Section>
    );
  }

  if (key === "newsletter" && content.newsletter.visible) {
    return (
      <Section key={key} width="wide">
        <div className={styles.newsletterBand}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>{content.newsletter.eyebrow}</p>
            <h2>{content.newsletter.title}</h2>
            <p className={styles.sectionBody}>{content.newsletter.paragraph}</p>
          </div>
          <NewsletterSignupIntentForm
            ctaLabel={content.newsletter.ctaLabel}
            inputLabel={content.newsletter.inputLabel}
            inputPlaceholder={content.newsletter.inputPlaceholder}
          />
        </div>
      </Section>
    );
  }

  return null;
}

function getHeroGalleryImages(content: HomePageContent) {
  const preferredCategoryIds = [
    "category-rugs",
    "category-vintage",
    "category-pillows",
    "category-poufs",
  ];
  const categoryImages = preferredCategoryIds
    .map((id) => content.categories.cards.find((card) => card.visible && card.id === id)?.image)
    .filter((image): image is HomePageContent["hero"]["image"] => Boolean(image?.src));
  const images = [...categoryImages, content.hero.image];
  const seen = new Set<string>();

  return images
    .filter((image) => {
      if (!image.src.trim() || seen.has(image.src)) {
        return false;
      }

      seen.add(image.src);

      return true;
    })
    .slice(0, 4);
}

function ProofComparisonSection() {
  const proofItems = [
    {
      title: "Selected in Person",
      body: "Pieces are sourced across Morocco by people who know the trade, not pulled from a generic export catalogue.",
    },
    {
      title: "Exact-Piece Video Check",
      body: "Before payment is captured, you see the actual rug in natural, warm, and cool light.",
    },
    {
      title: "One-of-One Inventory",
      body: "Rugs are individual pieces. When a rug sells, that exact piece does not come back in a restock batch.",
    },
    {
      title: "Family Trade History",
      body: "The collection is connected to a Marrakech bazaar with close to 80 years in the Moroccan rug trade.",
    },
  ];

  return (
    <Section id="piece-difference" width="wide">
      <div className={styles.proofSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>What makes a Loom & Hearth piece different</p>
          <h2>Built for Buyers Who Want the Actual Piece, Not a Catalogue Approximation.</h2>
        </div>
        <div className={styles.proofContent}>
          <div className={styles.proofGrid}>
            {proofItems.map((item) => (
              <article key={item.title} className={styles.proofCard}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
          <CustomerReviewCarousel
            reviews={customerReviews}
            eyebrow="Customer reviews"
            title="Pieces that felt right once they were home."
          />
        </div>
      </div>
    </Section>
  );
}

function TrustIcon({ index }: { index: number }) {
  const iconKey = index % 4;

  if (iconKey === 0) {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <circle cx="12" cy="12" r="8" />
        <path d="M4 12h16M12 4c2 2.3 3 5 3 8s-1 5.7-3 8M12 4c-2 2.3-3 5-3 8s1 5.7 3 8" />
      </svg>
    );
  }

  if (iconKey === 1) {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M3 7h11v9H3zM14 10h4l3 3v3h-7z" />
        <circle cx="7" cy="18" r="1.6" />
        <circle cx="18" cy="18" r="1.6" />
      </svg>
    );
  }

  if (iconKey === 2) {
    return (
      <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
        <path d="M4 8h4l1.5-2h5L16 8h4v11H4z" />
        <circle cx="12" cy="13.5" r="3" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
      <path d="M9 7 5 11l4 4" />
      <path d="M5 11h9a5 5 0 1 1 0 10h-2" />
      <path d="M18 4v5h-5" />
    </svg>
  );
}

function LiveProductRail({ products }: { products: CatalogProductCardViewModel[] }) {
  return (
    <div className={styles.liveProductGrid}>
      {products.map((product) => (
        <Link key={product.id} className={styles.liveProductCard} href={product.href as Route}>
          <div className={styles.liveProductImageWrap}>
            {product.primaryImage ? (
              <>
                <Image
                  alt={product.primaryImage.altText || product.name}
                  className={`${styles.productImage} ${styles.liveProductImagePrimary}`}
                  fill
                  sizes="(max-width: 768px) 86vw, (max-width: 1100px) 42vw, 21vw"
                  src={product.primaryImage.src}
                />
                {product.secondaryImage &&
                product.secondaryImage.publicId !== product.primaryImage.publicId ? (
                  <Image
                    alt=""
                    aria-hidden="true"
                    className={`${styles.productImage} ${styles.liveProductImageSecondary}`}
                    fill
                    sizes="(max-width: 768px) 86vw, (max-width: 1100px) 42vw, 21vw"
                    src={product.secondaryImage.src}
                  />
                ) : null}
              </>
            ) : (
              <div className={styles.liveProductFallback}>
                <span>Loom & Hearth</span>
              </div>
            )}
          </div>
          <div className={styles.productMeta}>
            <p className={styles.productEyebrow}>{product.badge}</p>
            <h3>{product.name}</h3>
            <p className={styles.productPrice}>{product.priceUsdLabel}</p>
            <p className={styles.productSubtitle}>{product.subtitle}</p>
            <p>{getProductCardDescription(product)}</p>
          </div>
        </Link>
      ))}
    </div>
  );
}

function FeaturedContentCards({ cards }: { cards: HomePageContent["featured"]["cards"] }) {
  return (
    <div className={styles.featuredGrid}>
      {cards.map((product) => (
        <Link key={product.id} className={styles.productCard} href={product.href as Route}>
          <div className={styles.productImagePlaceholder}>
            <Image
              alt={product.image.alt}
              className={styles.productImage}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 20vw"
              src={product.image.src}
            />
          </div>
          <div className={styles.productMeta}>
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            {product.priceLabel ? <span className={styles.productPriceLabel}>{product.priceLabel}</span> : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

function getProductCardDescription(product: CatalogProductCardViewModel) {
  const candidate = product.description.trim() || product.merchandisingNote.trim();
  const normalized = candidate.replace(/\s+/g, " ");
  const firstSentence = normalized.match(/.+?[.!?](?:\s|$)/)?.[0] ?? normalized;

  return firstSentence.length > 104 ? `${firstSentence.slice(0, 101).trimEnd()}...` : firstSentence;
}

function firstNarrativeSection(content: HomePageContent) {
  return content.sectionOrder.find(
    (key) => (key === "brandStory" && content.brandStory.visible) || (key === "designDirection" && content.designDirection.visible),
  );
}






