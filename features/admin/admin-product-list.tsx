"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import { deleteAdminProductAction, duplicateAdminProductAction } from "@/app/(admin)/admin/products/actions";
import type { AdminProductListItem } from "@/lib/admin/products";
import { productCategoryOptions } from "@/lib/catalog/product-validation";

import styles from "./admin.module.css";

const statusOptions = ["all", "active", "draft", "archived"] as const;
const sortOptions = ["updated-desc", "updated-asc", "price-desc", "price-asc"] as const;

export function AdminProductList(props: { items: AdminProductListItem[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | (typeof productCategoryOptions)[number]>("all");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("updated-desc");

  if (!props.items.length) {
    return (
      <div className={styles.card}>
        <p className={styles.cardEyebrow}>Products</p>
        <h3>No persisted products yet</h3>
        <p>Create the first persisted catalog product to replace launch-only in-repo product edits.</p>
      </div>
    );
  }

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = props.items.filter((item) => {
    const matchesQuery = normalizedQuery ? item.name.toLowerCase().includes(normalizedQuery) : true;
    const matchesStatus = statusFilter === "all" ? true : item.status === statusFilter;
    const matchesCategory = categoryFilter === "all" ? true : item.category === categoryFilter;

    return matchesQuery && matchesStatus && matchesCategory;
  });

  const visibleItems = filteredItems.slice().sort((left, right) => {
    if (sortBy === "price-asc") {
      return left.priceUsd - right.priceUsd;
    }

    if (sortBy === "price-desc") {
      return right.priceUsd - left.priceUsd;
    }

    if (sortBy === "updated-asc") {
      return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableToolbar}>
        <label className={styles.searchField}>
          <span>Search products</span>
          <input
            name="product-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by product name"
            type="search"
            value={query}
          />
        </label>

        <label className={styles.toolbarField}>
          <span>Status</span>
          <select
            onChange={(event) => setStatusFilter(event.target.value as (typeof statusOptions)[number])}
            value={statusFilter}
          >
            <option value="all">All statuses</option>
            <option value="active">Active</option>
            <option value="draft">Draft</option>
            <option value="archived">Archived</option>
          </select>
        </label>

        <label className={styles.toolbarField}>
          <span>Category</span>
          <select
            onChange={(event) =>
              setCategoryFilter(event.target.value as "all" | (typeof productCategoryOptions)[number])
            }
            value={categoryFilter}
          >
            <option value="all">All categories</option>
            {productCategoryOptions.map((category) => (
              <option key={category} value={category}>
                {formatCategoryLabel(category)}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.toolbarField}>
          <span>Sort by</span>
          <select
            onChange={(event) => setSortBy(event.target.value as (typeof sortOptions)[number])}
            value={sortBy}
          >
            <option value="updated-desc">Updated: newest</option>
            <option value="updated-asc">Updated: oldest</option>
            <option value="price-desc">Price: high to low</option>
            <option value="price-asc">Price: low to high</option>
          </select>
        </label>
      </div>

      <div className={styles.tableSummary}>
        <p>
          Showing {visibleItems.length} of {props.items.length} products
        </p>
      </div>

      {visibleItems.length ? (
        <div className={styles.tableScroller}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Category</th>
                <th>Status</th>
                <th>Price</th>
                <th>Last updated</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr className={styles.tableRow} data-status={item.status} key={item.id}>
                  <td className={styles.thumbnailCell}>
                    <div className={styles.thumbnailFrame}>
                      {item.imageUrl ? (
                        <img alt={item.imageAlt} className={styles.thumbnailImage} src={item.imageUrl} />
                      ) : (
                        <div className={styles.thumbnailFallback}>No image</div>
                      )}
                    </div>
                  </td>
                  <td>
                    <div className={styles.productCell}>
                      <strong>{item.name}</strong>
                      <span>{item.routePath}</span>
                      {!item.hasImage ? <em>Missing hero image</em> : null}
                    </div>
                  </td>
                  <td>{formatCategoryLabel(item.category)}</td>
                  <td>
                    <span className={getStatusBadgeClassName(item.status, styles)}>{formatStatusLabel(item.status)}</span>
                  </td>
                  <td className={styles.priceCell}>{item.priceLabel}</td>
                  <td>
                    <div className={styles.dateCell}>
                      <strong>{item.updatedAtLabel}</strong>
                      <span>{formatAbsoluteDate(item.updatedAt)}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.dateCell}>
                      <strong>{item.createdAtLabel}</strong>
                      <span>{formatAbsoluteDate(item.createdAt)}</span>
                    </div>
                  </td>
                  <td>
                    <div className={styles.actionCluster}>
                      <Link className={styles.inlineActionLink} href={`/admin/products/${item.id}` as Route}>
                        Edit
                      </Link>
                      <Link className={styles.inlineActionLink} href={item.routePath as Route} target="_blank">
                        Preview
                      </Link>
                      <form action={duplicateAdminProductAction.bind(null, item.id)} className={styles.actionForm}>
                        <button className={styles.inlineActionLink} type="submit">
                          Duplicate
                        </button>
                      </form>
                      <form
                        action={deleteAdminProductAction.bind(null, item.id)}
                        className={styles.actionForm}
                        onSubmit={(event) => {
                          if (!window.confirm(`Delete ${item.name}? This cannot be undone.`)) {
                            event.preventDefault();
                          }
                        }}
                      >
                        <button className={styles.dangerAction} type="submit">
                          Delete
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className={styles.emptyState}>
          <p className={styles.cardEyebrow}>No matches</p>
          <h3>No products match the current filters</h3>
          <p>Adjust the search term, status, category, or sort selection to see more products.</p>
        </div>
      )}
    </div>
  );
}

function formatCategoryLabel(category: AdminProductListItem["category"]) {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatStatusLabel(status: AdminProductListItem["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatAbsoluteDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getStatusBadgeClassName(
  status: AdminProductListItem["status"],
  scopedStyles: typeof styles,
) {
  if (status === "active") {
    return `${scopedStyles.statusBadge} ${scopedStyles.statusBadgeActive}`;
  }

  if (status === "draft") {
    return `${scopedStyles.statusBadge} ${scopedStyles.statusBadgeDraft}`;
  }

  return `${scopedStyles.statusBadge} ${scopedStyles.statusBadgeArchived}`;
}
