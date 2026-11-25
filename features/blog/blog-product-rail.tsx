import type { Route } from "next";
import Link from "next/link";

import { ProductCard } from "@/features/catalog/product-card";
import {
  deriveBlogProductAssociation,
  type BlogProductAssociation,
} from "@/features/blog/blog-product-association";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { getCategoryLabel } from "@/lib/catalog/helpers";
import { retiredRugPageRedirects } from "@/lib/catalog/rug-facets";
import {
  getRugFacetPage,
  getRugFacetTitle,
  listCatalogProductCards,
  listRugFacetProductCards,
} from "@/lib/catalog/service";

import styles from "./blog.module.css";

const railSize = 4;
const railCardSizes = "(max-width: 700px) calc(100vw - 34px), (max-width: 1100px) 33vw, 20vw";

type BlogProductRailProps = {
  post: { body: string; slug: string; title: string; categorySlug: string };
};

/** The post's rug collection as a Type or Region page (a retired one resolves to where it redirects). */
async function resolveRugFacet(style: string) {
  const redirect = retiredRugPageRedirects[style];

  return getRugFacetPage(redirect?.startsWith("/shop/rugs/") ? redirect.slice("/shop/rugs/".length) : style);
}

async function listInStock(association: BlogProductAssociation) {
  const facet = association.kind === "rugStyle" ? await resolveRugFacet(association.style) : null;
  const products: CatalogProductCardViewModel[] = facet
    ? await listRugFacetProductCards({ facet })
    : await listCatalogProductCards({ category: association.kind === "rugStyle" ? "rugs" : association.category });

  return {
    facet,
    products: products.filter((product) => product.availability === "available").slice(0, railSize),
  };
}

function describe(
  association: BlogProductAssociation,
  facet: Awaited<ReturnType<typeof resolveRugFacet>>,
) {
  if (facet) {
    return {
      heading: "In stock from this tradition",
      linkLabel: `See all ${getRugFacetTitle(facet)}`,
      href: `/shop/rugs/${facet.slug}`,
    };
  }

  const category = association.kind === "rugStyle" ? "rugs" : association.category;

  return { heading: "In stock now", linkLabel: `See all ${getCategoryLabel(category)}`, href: `/shop/${category}` };
}

/** Renders nothing when the post has no catalog association or nothing in it can be bought now. */
export async function BlogProductRail({ post }: BlogProductRailProps) {
  const association = deriveBlogProductAssociation(post);

  if (!association) {
    return null;
  }

  const { facet, products } = await listInStock(association);

  if (products.length === 0) {
    return null;
  }

  const { heading, linkLabel, href } = describe(association, facet);

  return (
    <section className={styles.productRail} aria-labelledby="blog-product-rail-heading">
      <div className={styles.relatedHeader}>
        <p className={styles.eyebrow}>Shop the story</p>
        <h2 id="blog-product-rail-heading">{heading}</h2>
      </div>
      <div className={styles.productRailGrid}>
        {products.map((product) => (
          <ProductCard key={product.id} product={product} sizes={railCardSizes} titleAs="p" />
        ))}
      </div>
      <Link className={styles.productRailLink} href={href as Route}>
        {linkLabel}
      </Link>
    </section>
  );
}
