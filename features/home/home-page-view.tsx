import type { Route } from "next";
import Image from "next/image";
import Link from "next/link";

import { NewsletterSignupIntentForm } from "@/components/analytics/newsletter-signup-intent-form";
import { Section } from "@/components/layout/section";
import { CustomerReviewCarousel } from "@/components/reviews/customer-review-carousel";
import { blogPosts } from "@/features/blog/blog-post-data";
import { aboutBridge } from "@/features/content-pages/content-pages-data";
import type { HomePageContent } from "@/features/home/home-page-data";
import { buildCloudinaryUrl } from "@/lib/cloudinary/url";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { customerReviews } from "@/lib/reviews/customer-reviews";

import { LiveProductCardImage } from "./live-product-card-image";
import styles from "./home-page.module.css";

type HomePageViewProps = {
  content: HomePageContent;
  featuredProducts?: CatalogProductCardViewModel[];
};

export function HomePageView({ content, featuredProducts = [] }: HomePageViewProps) {
  const categoryCards = content.categories.cards.filter((card) => card.visible);
  const journalPosts = blogPosts.slice(0, 2);
  const normalizedFeaturedProducts = featuredProducts.map(normalizeHomepageProductImages);
  const reviewCards = customerReviews.slice(0, 8);
  const valueProps = [
    {
      id: "vp-shipping",
      title: "Free worldwide shipping",
      body: "Tracked delivery to the US, Canada, and Australia.",
      icon: <TruckIcon />,
    },
    {
      id: "vp-verified",
      title: "Colour verified before payment",
      body: "See the exact piece in multiple lights before you are charged.",
      icon: <EyeIcon />,
    },
    {
      id: "vp-returns",
      title: "14-day returns",
      body: "Straightforward returns on eligible pieces.",
      icon: <ReturnIcon />,
    },
    {
      id: "vp-direct",
      title: "Direct from Morocco",
      body: "Sourced in person through a family bazaar in Marrakech.",
      icon: <GlobeIcon />,
    },
  ];
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
            <div className={styles.heroTrustLine} aria-label="Collection service details">
              <span>ONE OF A KIND inventory</span>
              <span>Colour verified before payment</span>
              <span>Ships from Morocco</span>
            </div>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href={"/shop" as Route}>
                Shop the collection
              </Link>
              <Link className={styles.heroSecondaryAction} href={"/sourcing" as Route}>
                Read how we source
              </Link>
            </div>
          </div>
        </div>
      </section>

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
                    sizes="(max-width: 640px) 50vw, (max-width: 900px) 33vw, 20vw"
                    src={card.image.src}
                  />
                  <div className={styles.categoryShowcaseOverlay} />
                </div>
                <div className={styles.categoryShowcaseBody}>
                  <h3>{card.title}</h3>
                  <span className={styles.categoryShowcaseLink}>
                    Shop {card.title.toLowerCase()}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </Section>

      <Section width="wide">
        <ul className={styles.valueProps} aria-label="Why shop with Loom & Hearth Studio">
          {valueProps.map((prop) => (
            <li key={prop.id} className={styles.valueProp}>
              <span className={styles.valuePropIcon} aria-hidden="true">
                {prop.icon}
              </span>
              <div className={styles.valuePropText}>
                <p className={styles.valuePropTitle}>{prop.title}</p>
                <p className={styles.valuePropBody}>{prop.body}</p>
              </div>
            </li>
          ))}
        </ul>
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

      {normalizedFeaturedProducts.length ? (
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
                See the full collection
              </Link>
            </div>
            <LiveProductRail products={normalizedFeaturedProducts.slice(0, 4)} />
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
          <CustomerReviewCarousel
            className={styles.reviewCarousel}
            reviews={reviewCards}
            variant="home"
            eyebrow="Customer reviews · 150+ happy customers"
            title="Proof that the pieces felt right once they were home."
          />
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
                    src={normalizeHomepageJournalImageSrc(post.imageSrc)}
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

const iconProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

function TruckIcon() {
  return (
    <svg {...iconProps}>
      <path d="M3 6h11v9H3z" />
      <path d="M14 9h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg {...iconProps}>
      <path d="M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.6" />
    </svg>
  );
}

function ReturnIcon() {
  return (
    <svg {...iconProps}>
      <path d="M9 5 4 10l5 5" />
      <path d="M4 10h10a6 6 0 0 1 0 12h-3" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.8 3 2.8 15 0 18M12 3c-2.8 3-2.8 15 0 18" />
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
            <p className={styles.productDescription}>{getProductCardDescription(product)}</p>
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

  return firstSentence.length > 104 ? `${firstSentence.slice(0, 101).trimEnd()}…` : firstSentence;
}

function normalizeHomepageProductImages(
  product: CatalogProductCardViewModel,
): CatalogProductCardViewModel {
  return {
    ...product,
    primaryImage: product.primaryImage
      ? {
          ...product.primaryImage,
          src: buildHomepageProductImageUrl(product.primaryImage.publicId),
        }
      : undefined,
    secondaryImage: product.secondaryImage
      ? {
          ...product.secondaryImage,
          src: buildHomepageProductImageUrl(product.secondaryImage.publicId),
        }
      : undefined,
  };
}

function buildHomepageProductImageUrl(publicId: string) {
  return buildCloudinaryUrl(publicId, {
    transformation: {
      c: "fill",
      f: "auto",
      g: "auto",
      h: 1200,
      q: "auto",
      w: 960,
    },
  });
}

function normalizeHomepageJournalImageSrc(src: string) {
  const publicId = extractCloudinaryPublicId(src);

  if (!publicId) {
    return src;
  }

  return buildCloudinaryUrl(publicId, {
    transformation: {
      c: "fill",
      f: "auto",
      g: "auto",
      h: 750,
      q: "auto",
      w: 1200,
    },
  });
}

function extractCloudinaryPublicId(src: string) {
  const uploadMarker = "/image/upload/";
  const uploadIndex = src.indexOf(uploadMarker);

  if (uploadIndex === -1) {
    return null;
  }

  const uploadPath = src.slice(uploadIndex + uploadMarker.length);
  const loomPathIndex = uploadPath.indexOf("loom-hearth/");

  return loomPathIndex === -1 ? uploadPath : uploadPath.slice(loomPathIndex);
}

