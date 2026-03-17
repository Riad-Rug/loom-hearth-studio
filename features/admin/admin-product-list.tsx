import type { Route } from "next";
import Link from "next/link";

import type { AdminProductListItem } from "@/lib/admin/products";

import styles from "./admin.module.css";

export function AdminProductList(props: { items: AdminProductListItem[] }) {
  if (!props.items.length) {
    return (
      <div className={styles.card}>
        <p className={styles.cardEyebrow}>Products</p>
        <h3>No persisted products yet</h3>
        <p>Create the first persisted catalog product to replace launch-only in-repo product edits.</p>
      </div>
    );
  }

  return (
    <div className={styles.tableCard}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Category</th>
            <th>Status</th>
            <th>Slug</th>
            <th>Price</th>
            <th>Updated</th>
            <th>Route</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {props.items.map((item) => (
            <tr key={item.id}>
              <td>{item.name}</td>
              <td>{item.type}</td>
              <td>{item.category}</td>
              <td>{item.status}</td>
              <td>{item.slug}</td>
              <td>{item.priceLabel}</td>
              <td>{item.updatedAtLabel}</td>
              <td>{item.routePath}</td>
              <td>
                <Link className={styles.navLink} href={`/admin/products/${item.id}` as Route}>
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
