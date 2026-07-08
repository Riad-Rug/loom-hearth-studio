import type { Metadata } from "next";

import { ContactPageView } from "@/features/content-pages/contact-page-view";
import { listCatalogProductCards, listHomepageFeaturedProductCards } from "@/lib/catalog/service";
import { buildManagedMetadata } from "@/lib/seo/metadata";
import type { ProductCategory } from "@/types/domain";

import { submitContactInquiry } from "./actions";

export async function generateMetadata(): Promise<Metadata> {
  return buildManagedMetadata({
    entityType: "static_page",
    entityKey: "contact",
    title: "Contact Loom & Hearth Studio",
    description:
      "Get in touch with Loom & Hearth Studio about handmade Moroccan rugs, trade projects, and order help.",
    path: "/contact",
  });
}

type ContactPageProps = {
  searchParams?: Promise<{
    inquiryType?: string;
    message?: string;
    productName?: string;
    productHref?: string;
  }>;
};

type ContactRecommendationContent = {
  title: string;
  copy: string;
};

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const productName = sanitizeContactField(resolvedSearchParams?.productName, 120);
  const productHref = sanitizeContactField(resolvedSearchParams?.productHref, 240);
  const recommendations = await getContactRecommendations({
    productHref,
    productName,
  });

  return (
    <ContactPageView
      defaults={{
        inquiryType: sanitizeContactField(resolvedSearchParams?.inquiryType, 40),
        productName,
        message: buildDefaultMessage(resolvedSearchParams),
      }}
      recommendationContent={recommendations.content}
      recommendedProducts={recommendations.products}
      submitAction={submitContactInquiry}
    />
  );
}

function sanitizeContactField(value: string | undefined, maxLength: number) {
  if (!value) {
    return undefined;
  }

  return value.trim().slice(0, maxLength);
}

function buildDefaultMessage(searchParams: Awaited<ContactPageProps["searchParams"]>) {
  const message = sanitizeContactField(searchParams?.message, 800);

  if (message) {
    return message;
  }

  const productName = sanitizeContactField(searchParams?.productName, 120);
  if (!productName) {
    return undefined;
  }

  return `Hello, I would like to inquire about ${productName}.`;
}

async function getContactRecommendations(input: {
  productHref?: string;
  productName?: string;
}) {
  const productName = input.productName;
  const inferredCategory =
    inferCategoryFromProductHref(input.productHref) ??
    (productName ? inferCategoryFromProductName(normalizeProductName(productName)) : null);
  const allProducts = await listCatalogProductCards();

  if (!productName && !input.productHref) {
    return {
      products: await listHomepageFeaturedProductCards({ limit: 4 }),
      content: buildContactRecommendationContent(),
    };
  }

  const normalizedProductName = productName ? normalizeProductName(productName) : undefined;
  const matchedProduct =
    allProducts.find((product) => input.productHref && product.href === input.productHref) ??
    allProducts.find((product) => {
      if (!normalizedProductName) {
        return false;
      }

      const normalizedCatalogName = normalizeProductName(product.name);

      return (
        normalizedCatalogName === normalizedProductName ||
        normalizedCatalogName.includes(normalizedProductName) ||
        normalizedProductName.includes(normalizedCatalogName)
      );
    });

  const primaryCategory = matchedProduct?.category ?? inferredCategory;

  if (primaryCategory) {
    const sameCategoryProducts = allProducts.filter(
      (product) =>
        product.category === primaryCategory &&
        product.id !== matchedProduct?.id &&
        (!input.productHref || product.href !== input.productHref),
    );

    if (sameCategoryProducts.length) {
      return {
        products: sameCategoryProducts.slice(0, 4),
        content: buildContactRecommendationContent(primaryCategory, "same-category"),
      };
    }

    const companionProducts = getCompanionCategoryOrder(primaryCategory).flatMap((category) =>
      allProducts.filter(
        (product) =>
          product.category === category &&
          product.id !== matchedProduct?.id &&
          (!input.productHref || product.href !== input.productHref),
      ),
    );

    if (companionProducts.length) {
      return {
        products: companionProducts.slice(0, 4),
        content: buildContactRecommendationContent(primaryCategory, "companion"),
      };
    }
  }

  if (matchedProduct) {
    const relatedByType = allProducts.filter(
      (product) => product.id !== matchedProduct.id && product.type === matchedProduct.type,
    );

    if (relatedByType.length) {
      return {
        products: relatedByType.slice(0, 4),
        content: buildContactRecommendationContent(matchedProduct.category, "companion"),
      };
    }
  }

  return {
    products: await listHomepageFeaturedProductCards({ limit: 4 }),
    content: buildContactRecommendationContent(primaryCategory),
  };
}

function normalizeProductName(value: string) {
  return value.trim().toLowerCase().replace(/\s+/g, " ");
}

function inferCategoryFromProductName(productName: string): ProductCategory | null {
  if (productName.includes("pouf")) {
    return "poufs";
  }

  if (productName.includes("pillow")) {
    return "pillows";
  }

  if (
    productName.includes("decor") ||
    productName.includes("vessel") ||
    productName.includes("object")
  ) {
    return "decor";
  }

  if (productName.includes("vintage")) {
    return "vintage";
  }

  if (productName.includes("rug")) {
    return "rugs";
  }

  return null;
}

function inferCategoryFromProductHref(productHref: string | undefined): ProductCategory | null {
  if (!productHref) {
    return null;
  }

  if (productHref.includes("/shop/poufs/")) {
    return "poufs";
  }

  if (productHref.includes("/shop/pillows/")) {
    return "pillows";
  }

  if (productHref.includes("/shop/decor/")) {
    return "decor";
  }

  if (productHref.includes("/shop/vintage/")) {
    return "vintage";
  }

  if (productHref.includes("/shop/rugs/")) {
    return "rugs";
  }

  return null;
}

function getCompanionCategoryOrder(category: ProductCategory) {
  const categoryOrder: Record<ProductCategory, ProductCategory[]> = {
    rugs: ["vintage", "poufs", "pillows", "decor"],
    vintage: ["rugs", "poufs", "pillows", "decor"],
    poufs: ["pillows", "decor", "rugs", "vintage"],
    pillows: ["poufs", "decor", "rugs", "vintage"],
    decor: ["pillows", "poufs", "rugs", "vintage"],
  };

  return categoryOrder[category];
}

function buildContactRecommendationContent(
  category?: ProductCategory | null,
  strategy: "same-category" | "companion" | "featured" = "featured",
): ContactRecommendationContent {
  const categoryLabel = getRecommendationCategoryLabel(category);

  if (!category || strategy === "featured") {
    return {
      title: "Recommended pieces",
      copy: "A few pieces to keep in view while the studio reviews your message.",
    };
  }

  if (strategy === "same-category") {
    return {
      title: `More ${categoryLabel.toLowerCase()} to consider`,
      copy: `Pieces from the same part of the collection, so the follow-up stays close to what you asked about.`,
    };
  }

  return {
    title: `Pieces that pair well with this ${getRecommendationCategorySingular(category)}`,
    copy: `This part of the collection is tight right now, so we're showing nearby categories that style well with it.`,
  };
}

function getRecommendationCategoryLabel(category?: ProductCategory | null) {
  switch (category) {
    case "rugs":
      return "Rugs";
    case "vintage":
      return "Vintage pieces";
    case "poufs":
      return "Poufs";
    case "pillows":
      return "Pillows";
    case "decor":
      return "Decor";
    default:
      return "Pieces";
  }
}

function getRecommendationCategorySingular(category?: ProductCategory | null) {
  switch (category) {
    case "rugs":
      return "rug";
    case "vintage":
      return "vintage piece";
    case "poufs":
      return "pouf";
    case "pillows":
      return "pillow";
    case "decor":
      return "decor piece";
    default:
      return "piece";
  }
}
