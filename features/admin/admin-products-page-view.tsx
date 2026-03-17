import type { Route } from "next";
import Link from "next/link";

import { AdminProductList } from "@/features/admin/admin-product-list";
import type { AdminProductsPageData } from "@/lib/admin/products";

import styles from "./admin.module.css";

export function AdminProductsPageView(props: AdminProductsPageData) {
  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin products</p>
        <h2>Persisted product management</h2>
        <p>{props.description}</p>
      </header>

      <div className={styles.actionRow}>
        <Link className={styles.navLink} href={"/admin/products/new" as Route}>
          Create product
        </Link>
      </div>

      <AdminProductList items={props.items} />
    </section>
  );
}
