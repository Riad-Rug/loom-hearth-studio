import { blogPosts } from "@/features/blog/blog-post-data";
import { rugStyleCollections } from "@/features/catalog/rug-style-collections";
import { getProductRoutePath } from "@/lib/catalog/helpers";
import { createProductRepository } from "@/lib/db/repositories/product-repository";

export type SeoRegistryEntityType = "site" | "static_page" | "category" | "product" | "blog_post";

export type SeoRegistryItem = {
  id: string;
  label: string;
  entityType: SeoRegistryEntityType;
  entityKey: string;
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
};

export const seoStaticRouteRegistry: SeoRegistryItem[] = [
  {
    id: "site-home",
    label: "Homepage",
    entityType: "site",
    entityKey: "home",
    path: "/",
    fallbackTitle: "Loom & Hearth Studio",
    fallbackDescription:
      "Premium Moroccan rugs, poufs, pillows, and home decor sourced in Marrakech and shipped from Morocco.",
  },
  {
    id: "static-about",
    label: "About",
    entityType: "static_page",
    entityKey: "about",
    path: "/about",
    fallbackTitle: "About",
    fallbackDescription:
      "About Loom & Hearth Studio, its Marrakech sourcing roots, and its approach to handcrafted Moroccan rugs and home decor.",
  },
  {
    id: "static-contact",
    label: "Contact",
    entityType: "static_page",
    entityKey: "contact",
    path: "/contact",
    fallbackTitle: "Contact Loom & Hearth Studio",
    fallbackDescription:
      "Contact Loom & Hearth Studio for inquiries about handmade Moroccan rugs, custom sourcing, vintage textiles, and handmade home decor.",
  },
  {
    id: "static-faq",
    label: "FAQ",
    entityType: "static_page",
    entityKey: "faq",
    path: "/faq",
    fallbackTitle: "FAQ",
    fallbackDescription:
      "Answers to common questions about ordering, pre-shipment verification, shipping, returns, and rug care at Loom & Hearth Studio.",
  },
  {
    id: "static-lookbook",
    label: "Lookbook",
    entityType: "static_page",
    entityKey: "lookbook",
    path: "/lookbook",
    fallbackTitle: "Moroccan Interior Lookbook",
    fallbackDescription:
      "See Moroccan rugs and decor in real interiors, and shop the pieces shown across rugs, vintage finds, and decor.",
  },
  {
    id: "static-sourcing",
    label: "Sourcing",
    entityType: "static_page",
    entityKey: "sourcing",
    path: "/sourcing",
    fallbackTitle: "Sourcing & Authenticity",
    fallbackDescription:
      "How Loom & Hearth Studio approaches sourcing, authenticity, and product verification as the collection is assembled.",
  },
  {
    id: "static-trade",
    label: "Trade",
    entityType: "static_page",
    entityKey: "trade",
    path: "/trade",
    fallbackTitle: "Trade",
    fallbackDescription:
      "Trade-facing introduction for designers, specifiers, and sourcing inquiries working with Loom & Hearth Studio.",
  },
  {
    id: "static-blog",
    label: "Journal",
    entityType: "static_page",
    entityKey: "blog",
    path: "/blog",
    fallbackTitle: "Blog",
    fallbackDescription:
      "Journal articles from Loom & Hearth Studio on Moroccan rugs, sourcing, interiors, and collected living.",
  },
  {
    id: "static-shipping",
    label: "Shipping Policy",
    entityType: "static_page",
    entityKey: "shipping-policy",
    path: "/shipping-policy",
    fallbackTitle: "Shipping Policy",
    fallbackDescription:
      "Shipping policy for Loom & Hearth Studio orders shipped from Morocco, including pre-shipment verification, customs guidance, and delivery support.",
  },
  {
    id: "static-returns",
    label: "Returns Policy",
    entityType: "static_page",
    entityKey: "returns-policy",
    path: "/returns-policy",
    fallbackTitle: "Returns Policy",
    fallbackDescription:
      "Returns policy for Loom & Hearth Studio orders, including eligibility, timing, and refund handling.",
  },
  {
    id: "static-privacy",
    label: "Privacy Policy",
    entityType: "static_page",
    entityKey: "privacy-policy",
    path: "/privacy-policy",
    fallbackTitle: "Privacy Policy",
    fallbackDescription: "Privacy policy for Loom & Hearth Studio.",
  },
  {
    id: "static-terms",
    label: "Terms and Conditions",
    entityType: "static_page",
    entityKey: "terms-and-conditions",
    path: "/terms-and-conditions",
    fallbackTitle: "Terms and Conditions",
    fallbackDescription: "Terms and conditions for Loom & Hearth Studio orders and site use.",
  },
  {
    id: "static-accessibility",
    label: "Accessibility Statement",
    entityType: "static_page",
    entityKey: "accessibility-statement",
    path: "/accessibility-statement",
    fallbackTitle: "Accessibility Statement",
    fallbackDescription: "Accessibility statement for the Loom & Hearth Studio website.",
  },
  {
    id: "category-shop",
    label: "Shop Index",
    entityType: "category",
    entityKey: "shop",
    path: "/shop",
    fallbackTitle: "Shop",
    fallbackDescription:
      "Browse Moroccan rugs, poufs, pillows, and decor sourced in Marrakech and prepared for review-first buying.",
  },
  {
    id: "category-rugs",
    label: "Rugs",
    entityType: "category",
    entityKey: "rugs",
    path: "/shop/rugs",
    fallbackTitle: "Rugs",
    fallbackDescription:
      "Browse handcrafted Moroccan rugs sourced in Marrakech, including one-of-one pieces prepared for review-first buying.",
  },
  {
    id: "category-rugs-beni-ourain",
    label: rugStyleCollections["beni-ourain"].title,
    entityType: "category",
    entityKey: "rugs-beni-ourain",
    path: "/shop/rugs/beni-ourain",
    fallbackTitle: rugStyleCollections["beni-ourain"].title,
    fallbackDescription: rugStyleCollections["beni-ourain"].description,
  },
  {
    id: "category-poufs",
    label: "Poufs",
    entityType: "category",
    entityKey: "poufs",
    path: "/shop/poufs",
    fallbackTitle: "Poufs",
    fallbackDescription:
      "Browse Moroccan poufs and rug-based seating pieces sourced in Marrakech for layered, tactile interiors.",
  },
  {
    id: "category-pillows",
    label: "Pillows",
    entityType: "category",
    entityKey: "pillows",
    path: "/shop/pillows",
    fallbackTitle: "Pillows",
    fallbackDescription:
      "Browse Moroccan pillows and textile accents designed to layer with rugs, poufs, and collected interiors.",
  },
  {
    id: "category-decor",
    label: "Decor",
    entityType: "category",
    entityKey: "decor",
    path: "/shop/decor",
    fallbackTitle: "Decor",
    fallbackDescription:
      "Browse supporting Moroccan decor pieces selected to sit alongside rugs, poufs, and collected textile interiors.",
  },
  {
    id: "category-rugs-vintage",
    label: rugStyleCollections.vintage.title,
    entityType: "category",
    entityKey: "rugs-vintage",
    path: "/shop/rugs/vintage",
    fallbackTitle: rugStyleCollections.vintage.title,
    fallbackDescription: rugStyleCollections.vintage.description,
  },
];

export async function listSeoRouteRegistry(): Promise<SeoRegistryItem[]> {
  const products = await createProductRepository().listAll();

  const productItems: SeoRegistryItem[] = products.map((product) => ({
    id: `product-${product.id}`,
    label: `${product.name} (${product.category})`,
    entityType: "product",
    entityKey: product.id,
    path: getProductRoutePath(product),
    fallbackTitle: product.seoTitle || product.name,
    fallbackDescription: product.seoDescription || product.description,
  }));

  const blogItems: SeoRegistryItem[] = blogPosts.map((post) => ({
    id: `blog-post-${post.id}`,
    label: `${post.title} (${post.categoryLabel})`,
    entityType: "blog_post",
    entityKey: post.id,
    path: `/blog/${post.categorySlug}/${post.slug}`,
    fallbackTitle: post.seoTitle || post.title,
    fallbackDescription: post.seoDescription || post.excerpt,
  }));

  return [...seoStaticRouteRegistry, ...productItems, ...blogItems];
}

export function getSeoRegistryItem(entityType: string, entityKey: string) {
  return seoStaticRouteRegistry.find(
    (item) => item.entityType === entityType && item.entityKey === entityKey,
  );
}

export function getSeoRegistryItemById(id: string) {
  return seoStaticRouteRegistry.find((item) => item.id === id) ?? null;
}
