import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { Section } from "@/components/layout/section";
import type { HomePageContent, HomePageOrderedSectionKey } from "@/features/home/home-page-data";
import { HowItWorksSection } from "@/features/home/how-it-works-section";
import { NewsletterSignupIntentForm } from "@/components/analytics/newsletter-signup-intent-form";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

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

function renderSection(
  key: HomePageOrderedSectionKey,
  content: HomePageContent,
  featuredProducts: CatalogProductCardViewModel[],
) {
  if (key === "hero" && content.hero.visible) {
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
        <div className={styles.buyerEntrySection}>
          <div className={styles.trustBanner} aria-label="Trust highlights">
            {items.map((item) => (
              <p key={item.id}>{item.label}</p>
            ))}
          </div>
          <ShoppingShortcuts />
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
    const hasProductRail = featuredProducts.length > 0;

    if (!cards.length && !hasProductRail) {
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
          {hasProductRail ? <LiveProductRail products={featuredProducts} /> : <FeaturedContentCards cards={cards} />}
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
                <Link className={styles.narrativeLinkLabel} href={"/blog" as Route}>
                  READ THE FULL GUIDE
                </Link>
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
              <NewsletterSignupIntentForm
                ctaLabel={content.newsletter.ctaLabel}
                inputLabel={content.newsletter.inputLabel}
                inputPlaceholder={content.newsletter.inputPlaceholder}
              />
            </div>
          ) : null}
        </div>
      </Section>
    );
  }

  return null;
}

function ShoppingShortcuts() {
  const shortcuts = [
    { label: "All rugs", href: "/shop/rugs" },
    { label: "Vintage rugs", href: "/shop/vintage" },
    { label: "Poufs", href: "/shop/poufs" },
    { label: "Pillows", href: "/shop/pillows" },
    { label: "Decor", href: "/shop/decor" },
    { label: "Full shop", href: "/shop" },
  ];

  return (
    <nav className={styles.shortcutNav} aria-label="Shop by need">
      <span className={styles.shortcutLabel}>Shop by need</span>
      <div className={styles.shortcutLinks}>
        {shortcuts.map((shortcut) => (
          <Link key={shortcut.href} className={styles.shortcutLink} href={shortcut.href as Route}>
            {shortcut.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}

function ProofComparisonSection() {
  const proofItems = [
    {
      title: "Selected in person",
      body: "Pieces are sourced across Morocco by people who know the trade, not pulled from a generic export catalogue.",
    },
    {
      title: "Exact-piece video check",
      body: "Before payment is captured, you see the actual rug in natural, warm, and cool light.",
    },
    {
      title: "One-of-one inventory",
      body: "Rugs are individual pieces. When a rug sells, that exact piece does not come back in a restock batch.",
    },
    {
      title: "Family trade history",
      body: "The collection is connected to a Marrakech bazaar with close to 80 years in the Moroccan rug trade.",
    },
  ];

  return (
    <Section width="wide">
      <div className={styles.proofSection}>
        <div className={styles.sectionIntro}>
          <p className={styles.eyebrow}>WHY BUY HERE</p>
          <h2>Built for buyers who want the actual piece, not a catalogue approximation.</h2>
        </div>
        <div className={styles.proofGrid}>
          {proofItems.map((item) => (
            <article key={item.title} className={styles.proofCard}>
              <h3>{item.title}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </div>
    </Section>
  );
}

function LiveProductRail({ products }: { products: CatalogProductCardViewModel[] }) {
  return (
    <div className={styles.liveProductGrid}>
      {products.map((product) => (
        <Link key={product.id} className={styles.liveProductCard} href={product.href as Route}>
          <div className={styles.liveProductImageWrap}>
            {product.primaryImage ? (
              <Image
                alt={product.primaryImage.altText || product.name}
                className={styles.productImage}
                fill
                sizes="(max-width: 768px) 86vw, (max-width: 1100px) 42vw, 21vw"
                src={product.primaryImage.src}
              />
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
              sizes="(max-width: 1100px) 100vw, 33vw"
              src={product.image.src}
            />
          </div>
          <div className={styles.productMeta}>
            {product.eyebrow ? <p className={styles.productEyebrow}>{product.eyebrow}</p> : null}
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

function firstEditorialSection(content: HomePageContent) {
  return content.sectionOrder.find(
    (key) => (key === "guide" && content.guide.visible) || (key === "newsletter" && content.newsletter.visible),
  );
}






