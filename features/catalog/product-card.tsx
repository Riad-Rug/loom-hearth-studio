import type { CatalogPlaceholderProduct } from "@/features/catalog/catalog-data";

import styles from "./catalog-page.module.css";

type ProductCardProps = {
  product: CatalogPlaceholderProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  return (
    <article className={styles.productCard}>
      <div className={styles.productMedia}>
        <span className={styles.productBadge}>{product.badge}</span>
      </div>
      <div className={styles.productContent}>
        <div className={styles.productTopline}>
          <p className={styles.productCategory}>{product.category}</p>
          <p className={styles.productPrice}>{product.priceUsdLabel}</p>
        </div>
        <h3>{product.name}</h3>
        <p className={styles.productSummary}>{product.summary}</p>
        <div className={styles.productMetaList}>
          <span>{product.merchandisingNote}</span>
          <span>PDP route reserved: {product.routePattern}</span>
        </div>
      </div>
    </article>
  );
}
