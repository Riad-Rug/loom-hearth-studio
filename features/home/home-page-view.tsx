import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

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

function renderSection(key: HomePageOrderedSectionKey, content: HomePageContent, featuredProducts: CatalogProductCardViewModel[]) {
  if (key === "hero" && content.hero.visible) {
    const heroLeadImage = content.hero.image;

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
              <div className={styles.heroImageFrameLead}>
                <Image
                  alt={heroLeadImage.alt}
                  className={styles.heroImage}
                  fill
                  priority
                  sizes="(max-width: 1100px) 100vw, 38vw"
                  src={heroLeadImage.src}
                />
              </div>
              <div className={styles.heroEvidenceCard}>
                <div className={styles.heroEvidenceCopy}>
                  <p className={styles.heroEvidenceEyebrow}>Color verification</p>
                  <p className={styles.heroEvidenceTitle}>Light comparison before payment capture.</p>
                  <p className={styles.heroEvidenceBody}>
                    We review daylight, warm lamp, and cool lamp references so color reads honestly before any charge is finalized.
                  </p>
                </div>
                <div className={styles.heroEvidenceComparison}>
                  <div className={styles.heroEvidenceImageWrap}>
                    <Image
                      alt="Top-down product comparison showing the same Moroccan rug in daylight, warm light, and cool light."
                      className={styles.heroEvidenceImage}
                      fill
                      sizes="(max-width: 1100px) 44vw, 16vw"
                      src="/hero/verification-topdown-v1.png"
                    />
                  </div>
                </div>
              </div>
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
          <ul className={styles.trustBanner} aria-label="Trust highlights">
            {items.map((item, index) => {
              const descriptor = getTrustDescriptor(index);

              return (
              <li key={item.id} className={index === 0 ? styles.trustBannerLeadItem : undefined}>
                <span className={styles.trustIcon} aria-hidden="true">
                  <TrustIcon index={index} />
                </span>
                <span className={styles.trustCopy}>
                  <span className={styles.trustLabel}>{item.label}</span>
                  <span className={styles.trustDescriptor}>{descriptor}</span>
                </span>
              </li>
            )})}
          </ul>
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
            <Link
              key={section.title}
              className={`${styles.narrativeCard} ${getNarrativeCardClassName(section.eyebrow)}`}
              href={section.href as Route}
            >
              <p className={styles.eyebrow}>{section.eyebrow}</p>
              <h2>{section.title}</h2>
              <p className={styles.narrativeMeta}>{getNarrativeMeta(section.eyebrow)}</p>
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
            {content.featured.eyebrow ? (
              <p className={styles.eyebrow}>{content.featured.eyebrow}</p>
            ) : null}
            <h2>{content.featured.title}</h2>
            <p className={styles.sectionBody}>{content.featured.paragraph}</p>
          </div>
          <ShopFirstCards cards={cards} />
          {featuredProducts.length ? (
            <div className={styles.liveProductSection}>
              <div className={styles.liveProductIntro}>
                <p className={styles.eyebrow}>Available now</p>
                <h3>Current one-of-one pieces with live pricing.</h3>
                <p className={styles.sectionBody}>
                  Browse actual inventory first, then open the full catalog once a size, palette, or construction style starts to feel right.
                </p>
              </div>
              <LiveProductRail products={featuredProducts} />
            </div>
          ) : null}
        </div>
      </Section>
    );
  }

  if (key === "proof" && content.proof.visible) {
    return [<ProofComparisonSection key={key} />, <ReviewsHighlightSection key={`${key}-reviews`} />];
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
            <ul className={styles.guideChecklist}>
              <li>Check knot density before color styling.</li>
              <li>Look for weight and structure, not just surface pattern.</li>
              <li>Confirm how the exact piece behaves in real light.</li>
            </ul>
            <Link className={styles.narrativeLinkLabel} href={"/blog" as Route}>
              READ THE RUG BUYING GUIDE
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

function ProofComparisonSection() {
  const proofItems = [
    {
      eyebrow: "Verification model",
      title: "See the exact piece before payment is captured.",
      body: "Every one-of-one rug is confirmed in natural, warm, and cool light before the order moves forward.",
    },
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

  const proofSignals = [
    "Actual-piece confirmation before payment moves forward",
    "One-of-one inventory instead of representative stock",
    "Family-trade sourcing across Morocco",
  ];

  return (
    <Section id="piece-difference" width="wide">
      <div className={styles.proofSection}>
        <div className={`${styles.sectionIntro} ${styles.proofIntroPanel}`}>
          <p className={styles.eyebrow}>What makes a Loom & Hearth piece different</p>
          <h2>Built for Buyers Who Want the Actual Piece, Not a Catalogue Approximation.</h2>
          <p className={styles.sectionBody}>
            The collection is structured for buyers who want to confirm the exact item, not settle for a representative sample.
          </p>
          <ul className={styles.proofSignalList} aria-label="Key buyer proof points">
            {proofSignals.map((signal) => (
              <li key={signal}>{signal}</li>
            ))}
          </ul>
        </div>
        <div className={styles.proofContent}>
          <article className={styles.proofLeadCard}>
            <p className={styles.proofLeadEyebrow}>{proofItems[0].eyebrow}</p>
            <h3>{proofItems[0].title}</h3>
            <p>{proofItems[0].body}</p>
          </article>
          <div className={styles.proofGrid}>
            {proofItems.slice(1).map((item, index) => (
              <article key={item.title} className={`${styles.proofCard} ${getProofCardClassName(index)}`}>
                <h3>{item.title}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}

function getProofCardClassName(index: number) {
  if (index === 0) {
    return styles.proofCardSelected;
  }

  if (index === 1) {
    return styles.proofCardVideo;
  }

  if (index === 2) {
    return styles.proofCardInventory;
  }

  return styles.proofCardHeritage;
}

function ReviewsHighlightSection() {
  return (
    <Section width="wide">
      <CustomerReviewCarousel
        reviews={customerReviews}
        eyebrow="Customer reviews"
        title="Pieces that felt right once they were home."
      />
    </Section>
  );
}

function getNarrativeCardClassName(eyebrow: string) {
  if (eyebrow === "WHO WE ARE") {
    return styles.narrativeCardStory;
  }

  return styles.narrativeCardDirection;
}

function getNarrativeMeta(eyebrow: string) {
  if (eyebrow === "WHO WE ARE") {
    return "Family trade | Marrakech sourcing";
  }

  return "Pile density | Knot structure | Material weight";
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

function getTrustDescriptor(index: number) {
  switch (index) {
    case 0:
      return "See the actual piece before payment is finalized.";
    case 1:
      return "Family-trade sourcing and shipping from Morocco.";
    case 2:
      return "No separate delivery surcharge at checkout.";
    case 3:
      return "Fourteen days to decide once it arrives.";
    default:
      return "";
  }
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

function ShopFirstCards({ cards }: { cards: HomePageContent["featured"]["cards"] }) {
  return (
    <div className={styles.featuredGrid}>
      {cards.map((product, index) => (
        <Link
          key={product.id}
          className={`${styles.productCard} ${getFeaturedCardClassName(index)} ${getFeaturedRoleClassName(product.id)}`}
          href={product.href as Route}
        >
          {(() => {
            const image = getShopFirstCardImage(product);

            return (
          <div className={styles.productImagePlaceholder}>
            <Image
              alt={image.alt}
              className={styles.productImage}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 20vw"
              src={image.src}
            />
          </div>
            );
          })()}
          <div className={styles.productMeta}>
            {index === 0 ? <p className={styles.productEyebrow}>Start here</p> : null}
            <h3>{product.title}</h3>
            <p>{product.description}</p>
            {product.priceLabel ? (
              <div className={styles.productCardActionRow}>
                <span className={styles.productPriceLabel}>{product.priceLabel}</span>
              </div>
            ) : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

function getFeaturedCardClassName(index: number) {
  if (index === 0) {
    return styles.productCardLead;
  }

  if (index === 1 || index === 2) {
    return styles.productCardMedium;
  }

  return styles.productCardCompact;
}

function getFeaturedRoleClassName(id: string) {
  switch (id) {
    case "featured-rugs":
      return styles.productCardRugs;
    case "featured-poufs":
      return styles.productCardPoufs;
    case "featured-pillows":
      return styles.productCardPillows;
    case "featured-decor":
      return styles.productCardDecor;
    case "featured-vintage":
      return styles.productCardVintage;
    default:
      return "";
  }
}

function getShopFirstCardImage(card: HomePageContent["featured"]["cards"][number]) {
  if (card.id === "featured-rugs") {
    return {
      src: "https://res.cloudinary.com/dnyhdvqra/image/upload/v1774377734/loom-hearth/homepage/mnxu9y8lxhsvdqmlzgep.jpg",
      alt: "Moroccan sitting room with a handmade rug, carved wood, and warm natural light",
    };
  }

  return card.image;
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






