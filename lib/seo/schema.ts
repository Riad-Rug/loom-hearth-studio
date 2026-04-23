import { absoluteUrl } from "@/lib/seo/metadata";
import { publicBusinessDetails } from "@/config/public-business-details";

export function organizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": ["Organization", "LocalBusiness"],
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
    address: {
      "@type": "PostalAddress",
      streetAddress: "5830 E 2ND ST, STE 7000 #34442",
      addressLocality: "Casper",
      addressRegion: "WY",
      postalCode: "82609",
      addressCountry: "US",
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

export function imageGallerySchema(input: {
  path: string;
  name: string;
  description: string;
  images: Array<{
    name: string;
    description: string;
    image: string;
    altText: string;
  }>;
}) {
  const url = absoluteUrl(input.path);

  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    "@id": `${url}#image-gallery`,
    name: input.name,
    description: input.description,
    url,
    image: input.images.map((image, index) => ({
      "@type": "ImageObject",
      "@id": `${url}#lookbook-image-${index + 1}`,
      position: index + 1,
      name: image.name,
      caption: image.description,
      description: image.altText,
      contentUrl: image.image,
      url: image.image,
    })),
  };
}

export function articleSchema(input: {
  title: string;
  description: string;
  path: string;
  publishedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: absoluteUrl(input.path),
    datePublished: input.publishedAt,
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
    brand: {
      "@type": "Brand",
      name: "Loom & Hearth Studio",
      url: absoluteUrl("/"),
    },
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
              value: "one-of-one",
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
      seller: {
        "@type": "Organization",
        name: "Loom & Hearth Studio",
        url: absoluteUrl("/"),
      },
      hasMerchantReturnPolicy: {
        "@type": "MerchantReturnPolicy",
        applicableCountry: ["US", "CA", "AU"],
        returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
        merchantReturnDays: 14,
      },
      shippingDetails: ["US", "CA", "AU"].map((country) => ({
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
      })),
    },
  };
}
