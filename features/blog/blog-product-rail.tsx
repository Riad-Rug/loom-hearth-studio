import type { Route } from "next";
import Link from "next/link";

import { ProductCard } from "@/features/catalog/product-card";
import { getRugStyleCollection } from "@/features/catalog/rug-style-collections";
import {
  deriveBlogProductAssociation,
  type BlogProductAssociation,
} from "@/features/blog/blog-product-association";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";
import { getCategoryLabel } from "@/lib/catalog/helpers";
import { listCatalogProductCards, listRugStyleProductCards } from "@/lib/catalog/service";

import styles from "./blog.module.css";

const railSize = 4;
const railCardSizes = "(max-width: 700px) calc(100vw - 34px), (max-width: 1100px) 33vw, 20vw";

type BlogProductRailProps = {
  post: { body: string; slug: string; title: string; categorySlug: string };
};

async function listInStock(association: BlogProductAssociation) {
  const products: CatalogProductCardViewModel[] =
    association.kind === "rugStyle"
      ? await listRugStyleProductCards({ style: association.style })
      : await listCatalogProductCards({ category: association.category });

  return products
    .filter((product) => product.status === "active" && !product.isOutOfStock)
    .slice(0, railSize);
}

function describe(association: BlogProductAssociation) {
  if (association.kind === "rugStyle") {
    const title = getRugStyleCollection(association.style)?.title ?? "Moroccan rugs";

    return { heading: "In stock from this tradition", linkLabel: `See all ${title}`, href: `/shop/rugs/${association.style}` };
  }

  const label = getCategoryLabel(association.category);

  return { heading: "In stock now", linkLabel: `See all ${label}`, href: `/shop/${association.category}` };
}

/** Renders nothing when the post has no catalog association or nothing in it can be bought now. */
export async function BlogProductRail({ post }: BlogProductRailProps) {
  const association = deriveBlogProductAssociation(post);

  if (!association) {
    return null;
  }

  const products = await listInStock(association);

  if (products.length === 0) {
    return null;
  }

  const { heading, linkLabel, href } = describe(association);

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
