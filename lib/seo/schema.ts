import { absoluteUrl } from "@/lib/seo/metadata";
import { publicBusinessDetails } from "@/config/public-business-details";

export function organizationSchema() {
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
    sameAs: [
      "https://www.instagram.com/loomandhearthstudio/",
      "https://www.pinterest.com/loomandhearthstudio/",
      "https://www.tiktok.com/@loomandhearthstudio",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: publicBusinessDetails.email,
      availableLanguage: ["English"],
    },
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

export function productSchema(input: {
  id: string;
  name: string;
  description: string;
  path: string;
  priceUsdLabel: string;
  category: string;
  imageUrls: string[];
  availability?: "inStock" | "outOfStock";
  isOneOfOne?: boolean;
}) {
  const url = absoluteUrl(input.path);
  const availability =
    input.availability === "outOfStock"
      ? "https://schema.org/OutOfStock"
      : "https://schema.org/InStock";

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
    itemCondition:
      input.category === "vintage"
        ? "https://schema.org/UsedCondition"
        : "https://schema.org/NewCondition",
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
      price: input.priceUsdLabel.replace("$", ""),
      availability,
      url,
      itemCondition:
        input.category === "vintage"
          ? "https://schema.org/UsedCondition"
          : "https://schema.org/NewCondition",
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
        shippingRate: {
          "@type": "MonetaryAmount",
          value: 0,
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

