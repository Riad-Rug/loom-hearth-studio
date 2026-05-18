import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { NewsletterSignupIntentForm } from "@/components/analytics/newsletter-signup-intent-form";
import { Section } from "@/components/layout/section";
import { blogPosts } from "@/features/blog/blog-post-data";
import { aboutBridge } from "@/features/content-pages/content-pages-data";
import type { HomePageContent } from "@/features/home/home-page-data";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { customerReviews } from "@/lib/reviews/customer-reviews";

import { LiveProductCardImage } from "./live-product-card-image";
import styles from "./home-page.module.css";

type HomePageViewProps = {
  content: HomePageContent;
  featuredProducts?: CatalogProductCardViewModel[];
};

export function HomePageView({ content, featuredProducts = [] }: HomePageViewProps) {
  const trustItems = content.badges.items.filter((item) => item.visible);
  const categoryCards = ["category-rugs", "category-poufs", "category-vintage"]
    .map((id) => content.categories.cards.find((card) => card.id === id && card.visible))
    .filter((card): card is NonNullable<typeof card> => Boolean(card));
  const journalPosts = blogPosts.slice(0, 2);
  const reviewCards = [customerReviews[7], customerReviews[5], customerReviews[6]].filter(Boolean);
  const colorLinks = [
    { label: "Ivory", href: "/search?q=ivory" },
    { label: "Terracotta", href: "/search?q=terracotta" },
    { label: "Natural", href: "/search?q=natural" },
    { label: "Charcoal", href: "/search?q=charcoal" },
    { label: "Multicolour", href: "/search?q=multicolour" },
    { label: "Navy", href: "/search?q=navy" },
  ] as const;

  return (
    <div className={styles.page}>
      <section className={styles.heroFullBleed}>
        <div className={styles.heroBackdrop}>
          <Image
            alt="A Moroccan bazaar scene with handmade rugs layered in warm natural light, showing the sourcing context behind the collection."
            className={styles.heroBackdropImage}
            fill
            priority
            sizes="100vw"
            src="/homepage/hero-bazaar-editorial-v2.png"
          />
        </div>
        <div className={styles.heroOverlay} />
        <div className={styles.heroInner}>
          <div className={styles.heroEditorialCopy}>
            <p className={styles.heroEditorialEyebrow}>SELECTED IN PERSON, ONE AT A TIME</p>
            <h1>Handcrafted Moroccan rugs.</h1>
            <p className={styles.heroEditorialLine}>Selected in person, one at a time.</p>
            <p className={styles.heroEditorialBody}>
              The collection is sourced through a family bazaar in Marrakech, with colour verified
              before payment is captured and every ONE OF A KIND piece tied to the actual rug in hand.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href={"/shop" as Route}>
                Shop the collection
              </Link>
              <Link className={styles.heroSecondaryAction} href={"/sourcing" as Route}>
                Read how we source
              </Link>
            </div>
          </div>
          <div className={styles.heroStatCard}>
            <p className={styles.heroStatEyebrow}>Current collection</p>
            <strong>52 pieces</strong>
            <p>Free shipping to the United States, Canada, and Australia.</p>
            <div className={styles.heroStatList}>
              <span>ONE OF A KIND inventory</span>
              <span>Colour verified before payment</span>
              <span>Ships from Morocco</span>
            </div>
          </div>
        </div>
      </section>

      <Section width="wide">
        <ul className={styles.trustStrip} aria-label="Trust highlights">
          {trustItems.map((item, index) => (
            <li key={item.id}>
              <span className={styles.trustIcon} aria-hidden="true">
                <TrustIcon index={index} />
              </span>
              <div className={styles.trustStripCopy}>
                <strong>{item.label}</strong>
                <span>{getTrustDescriptor(index)}</span>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section width="wide">
        <div className={styles.shopCategorySection}>
          <div className={styles.sectionHeadingRow}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Shop by category</p>
              <h2>The collection starts with rugs, then opens into the pieces around them.</h2>
              <p className={styles.sectionBody}>
                Use the homepage the way clients actually shop: start with the rug, then move into
                poufs, pillows, and vintage pieces once the room direction is set.
              </p>
            </div>
          </div>
          <div className={styles.categoryShowcaseGrid}>
            {categoryCards.map((card) => (
              <Link key={card.id} className={styles.categoryShowcaseCard} href={card.href as Route}>
                <div className={styles.categoryShowcaseImageWrap}>
                  <Image
                    alt={card.image.alt}
                    className={styles.categoryShowcaseImage}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    src={card.image.src}
                  />
                  <div className={styles.categoryShowcaseOverlay} />
                </div>
                <div className={styles.categoryShowcaseBody}>
                  <p className={styles.categoryShowcaseEyebrow}>{card.title}</p>
                  <h3>{card.description}</h3>
                  <span className={styles.categoryShowcaseLink}>
                    Browse {card.title.toLowerCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.colorStripSection}>
          <div className={styles.sectionHeadingRow}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Shop by colour</p>
              <h2>Start with the palette the room already needs.</h2>
            </div>
          </div>
          <div className={styles.colorStrip} aria-label="Shop by colour">
            {colorLinks.map((link) => (
              <Link key={link.label} className={styles.colorChip} href={link.href as Route}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </Section>

      {featuredProducts.length ? (
        <Section width="wide">
          <div className={styles.currentCollectionSection}>
            <div className={styles.sectionHeadingRow}>
              <div className={styles.sectionIntro}>
                <p className={styles.eyebrow}>From the current collection</p>
                <h2>Current ONE OF A KIND pieces with live pricing.</h2>
                <p className={styles.sectionBody}>
                  The homepage should show real inventory, not just mood. These are live pieces
                  from the current collection, ready to move straight into the shop.
                </p>
              </div>
              <Link className={styles.inlineSectionLink} href={"/shop" as Route}>
                See all 52 pieces
              </Link>
            </div>
            <LiveProductRail products={featuredProducts.slice(0, 4)} />
          </div>
        </Section>
      ) : null}

      <Section width="wide">
        <div className={styles.sourcingStorySection}>
          <div className={styles.sourcingStoryMedia}>
            <Image
              alt="Rugs displayed in the family bazaar in Marrakech."
              className={styles.sourcingStoryImage}
              fill
              sizes="(max-width: 900px) 100vw, 50vw"
              src="/homepage/sourcing-bazaar-process-v2.png"
            />
          </div>
          <div className={styles.sourcingStoryCopy}>
            <p className={styles.eyebrow}>{aboutBridge.eyebrow}</p>
            <h2>{aboutBridge.title}</h2>
            <p className={styles.sectionBody}>{aboutBridge.body}</p>
            <Link className={styles.inlineSectionLink} href={"/sourcing" as Route}>
              Read the sourcing story
            </Link>
          </div>
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.reviewProofSection}>
          <div className={styles.sectionHeadingRow}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>Customer reviews</p>
              <h2>Proof that the pieces felt right once they were home.</h2>
            </div>
            <div className={styles.reviewCountPanel}>
              <strong>150+</strong>
              <span>happy customers</span>
            </div>
          </div>
          <div className={styles.reviewGrid}>
            {reviewCards.map((review) => (
              <article key={review.id} className={styles.reviewCardStatic}>
                <div className={styles.reviewStars} aria-label="5 out of 5 stars">
                  {Array.from({ length: 5 }).map((_, starIndex) => (
                    <StarIcon key={`${review.id}-star-${starIndex}`} />
                  ))}
                </div>
                <p className={styles.reviewQuote}>{review.body}</p>
                <p className={styles.reviewMeta}>
                  <span>{review.customerName}</span>
                  <span>{review.country}</span>
                  <span>{review.productType}</span>
                </p>
              </article>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide">
          <div className={styles.journalSection}>
          <div className={styles.sectionHeadingRow}>
            <div className={styles.sectionIntro}>
              <p className={styles.eyebrow}>From the journal</p>
              <h2>The sourcing notes and styling guides that support the collection.</h2>
            </div>
            <Link className={styles.inlineSectionLink} href={"/blog" as Route}>
              Read all 15 articles
            </Link>
          </div>
          <div className={styles.journalGrid}>
            {journalPosts.map((post) => (
              <Link
                key={post.id}
                className={styles.journalCard}
                href={`/blog/${post.categorySlug}/${post.slug}` as Route}
              >
                <div className={styles.journalImageWrap}>
                  <Image
                    alt={post.imageAlt}
                    className={styles.journalImage}
                    fill
                    sizes="(max-width: 900px) 100vw, 50vw"
                    src={post.imageSrc}
                  />
                </div>
                <div className={styles.journalCardBody}>
                  <p className={styles.journalMeta}>
                    {post.categoryLabel} · {post.readTime}
                  </p>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <span className={styles.journalCardLink}>{post.ctaLabel}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide">
        <div className={styles.newsletterSection}>
          <div className={styles.sectionIntro}>
            <p className={styles.eyebrow}>New arrivals</p>
            <h2>New pieces arrive from Morocco. Be the first to see them.</h2>
            <p className={styles.sectionBody}>
              Join the list for new ONE OF A KIND arrivals, sourcing notes, and the pieces that reach
              the site before they disappear into past inventory.
            </p>
          </div>
          <NewsletterSignupIntentForm
            ctaLabel={content.newsletter.ctaLabel}
            inputLabel={content.newsletter.inputLabel}
            inputPlaceholder={content.newsletter.inputPlaceholder}
          />
        </div>
      </Section>

      <section className={styles.homeClosingSection}>
        <div className={styles.homeClosingInner}>
          <p className={styles.homeClosingEyebrow}>The collection is built one piece at a time</p>
          <h2>Every rug selected and verified in person.</h2>
          <p>
            Shop the collection if you are buying now, or move into the trade route if sourcing
            detail matters to the project.
          </p>
          <div className={styles.heroActions}>
            <Link className={styles.homeClosingPrimary} href={"/shop" as Route}>
              Shop the collection
            </Link>
            <Link className={styles.homeClosingSecondary} href={"/trade" as Route}>
              View the trade programme
            </Link>
          </div>
        </div>
      </section>
    </div>
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

function StarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d="m12 3.9 2.39 4.84 5.34.78-3.87 3.77.91 5.32L12 16.11 7.23 18.62l.91-5.32-3.87-3.77 5.34-.78L12 3.9Z" />
    </svg>
  );
}

function LiveProductRail({ products }: { products: CatalogProductCardViewModel[] }) {
  return (
    <div className={styles.liveProductGrid}>
      {products.map((product) => (
        <Link key={product.id} className={styles.liveProductCard} href={product.href as Route}>
          <div className={styles.liveProductImageWrap}>
            <LiveProductCardImage
              primaryImage={product.primaryImage}
              productName={product.name}
              secondaryImage={product.secondaryImage}
            />
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

function getProductCardDescription(product: CatalogProductCardViewModel) {
  const candidate = product.description.trim() || product.merchandisingNote.trim();
  const normalized = candidate.replace(/\s+/g, " ");
  const firstSentence = normalized.match(/.+?[.!?](?:\s|$)/)?.[0] ?? normalized;

  return firstSentence.length > 104 ? `${firstSentence.slice(0, 101).trimEnd()}...` : firstSentence;
}

