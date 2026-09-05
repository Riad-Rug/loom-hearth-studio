import { absoluteUrl } from "@/lib/seo/metadata";
import { publicBusinessDetails } from "@/config/public-business-details";
import { siteConfig } from "@/config/site";
import { DEFAULT_BLOG_AUTHOR } from "@/features/blog/blog-author-data";
import { aboutHero } from "@/features/content-pages/content-pages-data";
import { calculateShippingUsd } from "@/lib/order/shipping";

/**
 * Canonical @id for the founder Person node. The node itself is only emitted on
 * /about (personSchema, rendered from app/about/page.tsx) because that is where
 * the name, portrait, and bio are actually visible. Other schemas reference this
 * string, so it must stay byte-identical to personSchema()'s own @id.
 */
const PERSON_ID = `${absoluteUrl("/about")}#person`;

/**
 * The founder behind the site's first-person voice. Name is reused from the
 * blog author constant so a single code-level source spells it, and the
 * description reuses the About page's own hero copy rather than restating it.
 */
export function personSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    "@id": PERSON_ID,
    name: DEFAULT_BLOG_AUTHOR.name,
    jobTitle: "Founder",
    url: absoluteUrl("/about"),
    image: absoluteUrl("/about/founder-portrait.png"),
    description: aboutHero.body,
    worksFor: { "@id": `${absoluteUrl("/")}#organization` },
  };
}

/**
 * Confirmed public profiles, derived from the single source of truth in
 * config/site.ts so the footer icons and this sameAs array can never drift
 * apart. Empty values are dropped, and the key is omitted entirely rather than
 * emitted as an empty array if every channel is cleared.
 */
function organizationSameAs() {
  return Object.values(siteConfig.socialLinks)
    .map((url) => url.trim())
    .filter((url) => url.length > 0);
}

export function organizationSchema() {
  const sameAs = organizationSameAs();

  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "OnlineStore"],
    "@id": `${absoluteUrl("/")}#organization`,
    name: "Loom & Hearth Studio",
    url: absoluteUrl("/"),
    logo: {
      "@type": "ImageObject",
      url: absoluteUrl("/brand/logo.png"),
    },
    ...(sameAs.length > 0 ? { sameAs } : {}),
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: publicBusinessDetails.email,
      availableLanguage: ["English"],
    },
    // Reference the Person node defined on /about by @id rather than inlining a
    // second copy of it here — this Organization block is reprinted on every
    // page from app/layout.tsx.
    founder: { "@id": PERSON_ID },
  };
}

export function websiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Loom & Hearth Studio",
    url: absoluteUrl("/"),
  };
}

export function breadcrumbSchema(items: Array<{ name: string; path: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

export function faqSchema(items: Array<{ question: string; answer: string }>) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}

export function itemListSchema(input: {
  path: string;
  name: string;
  items: Array<{
    name: string;
    path: string;
    image?: string;
  }>;
}) {
  const url = absoluteUrl(input.path);

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "@id": `${url}#item-list`,
    name: input.name,
    url,
    itemListElement: input.items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: absoluteUrl(item.path),
      ...(item.image ? { image: item.image } : {}),
    })),
  };
}

/**
 * Blog posts store `publishedAt` as free-text display copy (e.g. "August 10, 2026").
 * Schema.org requires ISO 8601, so parse to `YYYY-MM-DD` here only — storage and the
 * UI keep the human-readable string. Returns null for empty or unparseable input so
 * callers can omit the field instead of emitting "Invalid Date".
 */
export function toSchemaDate(value?: string | null) {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return null;
  }

  // Already ISO-ish: keep the calendar date as written rather than re-deriving it
  // through the server's local timezone.
  const isoPrefix = value.match(/^(\d{4}-\d{2}-\d{2})/);

  if (isoPrefix) {
    return isoPrefix[1];
  }

  // "Month D, YYYY" parses to local midnight, so read back local parts. Using
  // toISOString() here would shift the date a day backwards east of UTC.
  const year = String(parsed.getFullYear()).padStart(4, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const day = String(parsed.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  publishedAt?: string;
  imageUrl?: string | null;
  author?: { name: string; photoUrl?: string | null } | null;
}) {
  const datePublished = toSchemaDate(input.publishedAt);
  const authorName = input.author?.name?.trim();

  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    ...(datePublished ? { datePublished } : {}),
    ...(input.imageUrl ? { image: [input.imageUrl] } : {}),
    ...(authorName
      ? {
          author: {
            "@type": "Person",
            name: authorName,
            ...(input.author?.photoUrl ? { image: input.author.photoUrl } : {}),
          },
        }
      : {}),
    publisher: {
      "@type": "Organization",
      name: "Loom & Hearth Studio",
      logo: {
        "@type": "ImageObject",
        url: absoluteUrl("/brand/logo.png"),
      },
    },
  };
}

/**
 * ageClass is a free-text column, not an enum, so it cannot be compared against
 * a fixed literal. The admin form offers "Contemporary" / "Vintage, estimated" /
 * "Antique, estimated" / "Not Stated" (ageClassOptions in
 * features/admin/admin-product-form.tsx), but the live catalog predates that
 * vocabulary and carries prose instead — every one of the 58 published pieces
 * reads either "Handmade contemporary piece" (53) or "Vintage" (5). Both
 * shapes have to be recognised, so these match on the meaningful word rather
 * than on the whole string.
 *
 * Age is tested before newness deliberately: mislabelling a used piece as new
 * is a merchant-listing accuracy violation, while the reverse merely undersells
 * it. When a value says both, the cautious reading wins.
 */
const AGED_CONDITION_PATTERN = /vintage|antique/i;
/**
 * Deliberately narrow. A bare `new` alternation would match inside "Renewed"
 * and, word-bounded, would still read "Pre-owned, like new" as new — the one
 * direction that is a merchant-listing accuracy violation rather than a
 * missed opportunity. Only the two phrasings that actually mean "made new"
 * are matched; anything else falls through to the category reading below.
 */
const CONTEMPORARY_CONDITION_PATTERN = /contemporary|newly\s+made/i;

/**
 * How long a published price is declared good for. Nothing in this catalog runs
 * on a promotional calendar, so the honest answer is a rolling window rather
 * than a stored expiry date.
 */
const PRICE_VALIDITY_DAYS = 90;

export function productSchema(input: {
  id: string;
  name: string;
  description: string;
  path: string;
  priceUsdLabel: string;
  category: string;
  /**
   * The piece's own recorded age class (Prisma CatalogProduct.ageClass), which
   * is what itemCondition below is derived from. Optional because older records
   * predate the field; see the fallback where it is read.
   */
  ageClass?: string;
  imageUrls: string[];
  availability?: "inStock" | "outOfStock";
  isOneOfOne?: boolean;
}) {
  const url = absoluteUrl(input.path);
  const availability =
    input.availability === "outOfStock"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

  // priceUsdLabel is Intl currency output ("$1,250.00"), so the currency symbol
  // and any thousands separators both have to come off before schema.org — or
  // Number() — reads it. Parsed once here and reused for the Offer price and
  // for the shipping-rate threshold below.
  const priceValue = input.priceUsdLabel.replace(/[$,]/g, "");

  /**
   * itemCondition follows the piece's own recorded age class, not its storefront
   * category. A pillow cover sewn from vintage Battania sits in the `pillows`
   * category but is genuinely a new cover, while a rug sold as-is is genuinely
   * used — the merchandising bucket answers neither question.
   *
   * An age class that matches neither pattern (including "Not Stated", and any
   * future vocabulary) falls back to the category reading rather than guessing,
   * so an unrecognised value can never silently flip the whole catalog. That
   * fallback is also what records predating the field get.
   */
  const ageClass = input.ageClass?.trim();
  const isUsedCondition =
    ageClass && AGED_CONDITION_PATTERN.test(ageClass)
      ? true
      : ageClass && CONTEMPORARY_CONDITION_PATTERN.test(ageClass)
        ? false
        : input.category === "vintage";
  const itemCondition = isUsedCondition
    ? "https://schema.org/UsedCondition"
    : "https://schema.org/NewCondition";

  /**
   * priceValidUntil is a recommended Offer field and Search Console warns when
   * it is missing. It is computed per call rather than once at module scope, so
   * a long-lived server process (or a prerendered bundle) can never ship a date
   * frozen at build time; the builder only ever runs server-side, inside the
   * JsonLd server component, so there is no client render to mismatch. UTC is
   * used deliberately here — unlike toSchemaDate above, this is a rolling
   * horizon rather than a stored calendar date, so a day of timezone drift on a
   * 90-day window is meaningless.
   */
  const priceValidUntil = new Date(Date.now() + PRICE_VALIDITY_DAYS * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${url}#product`,
    name: input.name,
    description: input.description,
    image: input.imageUrls,
    // Reference the canonical Organization node (organizationSchema, rendered
    // globally from app/layout.tsx) by @id instead of re-embedding a flat copy
    // of the same entity on every product. @id resolution is a literal string
    // match and works across separate JSON-LD blocks in one document, so this
    // must stay byte-identical to organizationSchema()'s own @id.
    brand: { "@id": `${absoluteUrl("/")}#organization` },
    sku: input.id,
    mpn: input.id,
    productID: input.id,
    category: input.category,
    url,
    itemCondition,
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Handmade",
        value: "true",
      },
      ...(input.isOneOfOne
        ? [
            {
              "@type": "PropertyValue",
              name: "Made to stock",
              value: "ONE OF A KIND",
            },
          ]
        : []),
    ],
    offers: {
      "@type": "Offer",
      priceCurrency: "USD",
      price: priceValue,
      priceValidUntil,
      availability,
      url,
      itemCondition,
      seller: { "@id": `${absoluteUrl("/")}#organization` },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: ["US"],
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
      },
      shippingDetails: ["US"].map((country) => ({
        "@type": "OfferShippingDetails",
        shippingDestination: {
          "@type": "DefinedRegion",
          addressCountry: country,
        },
        // Shipping is free at or above the order threshold and a flat fee below
        // it, so the rate is not a constant — it is whatever checkout would
        // actually charge, computed by the same function checkout uses
        // (calculateShippingUsd in lib/order/shipping.ts). schema.org carries
        // one rate per destination, so the honest figure is the one this piece
        // alone incurs: a single-item order at this price, before any promo
        // code. A basket that crosses the threshold ships free and a shopper
        // never pays more than what is declared here. An unparseable price
        // falls through to the flat fee rather than a free-shipping claim we
        // might not honour.
        shippingRate: {
          "@type": "MonetaryAmount",
          value: calculateShippingUsd(Number(priceValue)),
          currency: "USD",
        },
        // Figures come from the shipping policy page (the authoritative copy in
        // features/content-pages/content-pages-data.ts): verification completes
        // in 24-48 hours (1-2 days handling), then 7-14 business days in transit
        // to the US.
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: {
            "@type": "QuantitativeValue",
            minValue: 1,
            maxValue: 2,
            unitCode: "DAY",
          },
          transitTime: {
            "@type": "QuantitativeValue",
            minValue: 7,
            maxValue: 14,
            unitCode: "DAY",
          },
        },
      })),
    },
  };
}

