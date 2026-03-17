import type { Route } from "next";
import Link from "next/link";

import { PlaceholderMedia } from "@/components/media/placeholder-media";
import type { CatalogProductCardViewModel } from "@/lib/catalog/contracts";

import styles from "./catalog-page.module.css";

type ProductCardProps = {
  product: CatalogProductCardViewModel;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link className={styles.productCard} href={product.href as Route}>
      <div className={styles.productMedia}>
        <PlaceholderMedia
          alt={product.name}
          aspectRatio="4 / 5"
          label={product.badge}
          sizes="(max-width: 768px) 100vw, (max-width: 1100px) 50vw, 33vw"
        />
      </div>
      <div className={styles.productContent}>
        <div className={styles.productTopline}>
          <p className={styles.productCategory}>{product.category}</p>
          <p className={styles.productPrice}>{product.priceUsdLabel}</p>
        </div>
        <h3>{product.name}</h3>
        <p className={styles.productSummary}>{product.description}</p>
        <div className={styles.productMetaList}>
          <span>{product.merchandisingNote}</span>
          <span>PDP route reserved: {product.routePattern}</span>
        </div>
      </div>
    </Link>
  );
}
