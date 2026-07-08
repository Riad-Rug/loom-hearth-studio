"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";

import {
  bulkAdminProductsAction,
  deleteAdminProductAction,
  duplicateAdminProductAction,
} from "@/app/(admin)/admin/products/actions";
import type { AdminProductListItem } from "@/lib/admin/products";
import { productCategoryOptions } from "@/lib/catalog/product-validation";

import styles from "./admin.module.css";

const statusOptions = ["all", "active", "draft", "sold", "archived"] as const;
const sortOptions = ["updated-desc", "updated-asc", "price-desc", "price-asc"] as const;

export function AdminProductList(props: { items: AdminProductListItem[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [categoryFilter, setCategoryFilter] = useState<"all" | (typeof productCategoryOptions)[number]>("all");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("updated-desc");
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [bulkAction, setBulkAction] = useState("");

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
    const matchesQuery = normalizedQuery
      ? `${item.catalogNumber} ${item.name}`.toLowerCase().includes(normalizedQuery)
      : true;
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
  const selectedProductIdSet = new Set(selectedProductIds);
  const visibleProductIds = visibleItems.map((item) => item.id);
  const selectedVisibleProductCount = visibleProductIds.filter((id) => selectedProductIdSet.has(id)).length;
  const allVisibleProductsSelected = visibleItems.length > 0 && selectedVisibleProductCount === visibleItems.length;

  useEffect(() => {
    if (!selectedProductIds.length && bulkAction) {
      setBulkAction("");
    }
  }, [bulkAction, selectedProductIds.length]);

  function toggleProductSelection(productId: string) {
    setSelectedProductIds((currentIds) =>
      currentIds.includes(productId)
        ? currentIds.filter((currentId) => currentId !== productId)
        : [...currentIds, productId],
    );
  }

  function toggleVisibleProductSelection() {
    setSelectedProductIds((currentIds) => {
      if (allVisibleProductsSelected) {
        return currentIds.filter((currentId) => !visibleProductIds.includes(currentId));
      }

      return Array.from(new Set([...currentIds, ...visibleProductIds]));
    });
  }

  return (
    <div className={styles.tableCard}>
      <div className={styles.tableToolbar}>
        <label className={styles.searchField}>
          <span>Search products</span>
          <input
            name="product-search"
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by catalog number or name"
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
            <option value="sold">Sold</option>
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

      <div className={styles.bulkActionBar}>
        <p>
          <strong>{selectedProductIds.length}</strong>{" "}
          {selectedProductIds.length === 1 ? "product selected" : "products selected"}
        </p>
        <form
          action={bulkAdminProductsAction}
          className={styles.bulkActionForm}
          onSubmit={(event) => {
            const formData = new FormData(event.currentTarget);
            const action = formData.get("bulkAction");

            if (!selectedProductIds.length || !action) {
              event.preventDefault();
              return;
            }

            const actionLabel = formatBulkActionLabel(action);
            const message =
              action === "delete"
                ? `${actionLabel} ${selectedProductIds.length} selected products? This cannot be undone.`
                : `${actionLabel} ${selectedProductIds.length} selected products?`;

            if (!window.confirm(message)) {
              event.preventDefault();
            }
          }}
        >
          {selectedProductIds.map((productId) => (
            <input key={productId} name="productId" type="hidden" value={productId} />
          ))}
          <label className={styles.bulkActionField}>
            <span>Bulk action</span>
            <select
              disabled={!selectedProductIds.length}
              name="bulkAction"
              onChange={(event) => setBulkAction(event.target.value)}
              value={bulkAction}
            >
              <option disabled value="">
                Choose action
              </option>
              <option value="enable">Enable selected</option>
              <option value="disable">Disable selected</option>
              <option value="archive">Archive selected</option>
              <option value="delete">Delete selected</option>
            </select>
          </label>
          <button className={styles.bulkActionButton} disabled={!selectedProductIds.length || !bulkAction} type="submit">
            Apply
          </button>
        </form>
      </div>

      {visibleItems.length ? (
        <div className={styles.tableScroller}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.selectCell}>
                  <label className={styles.checkboxLabel}>
                    <input
                      aria-label="Select all visible products"
                      checked={allVisibleProductsSelected}
                      className={styles.selectionCheckbox}
                      onChange={toggleVisibleProductSelection}
                      type="checkbox"
                    />
                  </label>
                </th>
                <th>Product</th>
                <th>Category</th>
                <th>Status</th>
                <th>Homepage</th>
                <th>Price</th>
                <th>Last updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visibleItems.map((item) => (
                <tr
                  className={`${styles.tableRow} ${selectedProductIdSet.has(item.id) ? styles.tableRowSelected : ""}`}
                  data-status={item.status}
                  key={item.id}
                >
                  <td className={styles.selectCell}>
                    <label className={styles.checkboxLabel}>
                      <input
                        aria-label={`Select ${item.name}`}
                        checked={selectedProductIdSet.has(item.id)}
                        className={styles.selectionCheckbox}
                        onChange={() => toggleProductSelection(item.id)}
                        type="checkbox"
                      />
                    </label>
                  </td>
                  <td>
                    <div className={styles.productCell}>
                      <ProductThumbnail item={item} />
                      <div className={styles.productText}>
                        <strong>{item.name}</strong>
                        <span>{item.catalogNumber || "Catalog number pending"}</span>
                        <span>{item.routePath}</span>
                        {!item.hasImage ? <em>Missing hero image</em> : null}
                      </div>
                    </div>
                  </td>
                  <td>{formatCategoryLabel(item.category)}</td>
                  <td>
                    <span className={getStatusBadgeClassName(item.status, styles)}>{formatStatusLabel(item.status)}</span>
                  </td>
                  <td>{item.homepageFeatured ? `Featured${item.homepageRank ? ` #${item.homepageRank}` : ""}` : "Not featured"}</td>
                  <td className={styles.priceCell}>{item.priceLabel}</td>
                  <td>
                    <div className={styles.dateCell}>
                      <strong>{item.updatedAtLabel}</strong>
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

function ProductThumbnail({ item }: { item: AdminProductListItem }) {
  const [imageState, setImageState] = useState<"loading" | "loaded" | "failed">(
    item.imageUrl ? "loading" : "failed",
  );

  useEffect(() => {
    if (!item.imageUrl) {
      setImageState("failed");
      return;
    }

    let isMounted = true;
    const image = new window.Image();

    setImageState("loading");
    image.onload = () => {
      if (isMounted) {
        setImageState("loaded");
      }
    };
    image.onerror = () => {
      if (isMounted) {
        setImageState("failed");
      }
    };
    image.src = item.imageUrl;

    return () => {
      isMounted = false;
    };
  }, [item.imageUrl]);

  return (
    <div className={styles.thumbnailFrame}>
      {item.imageUrl && imageState === "loaded" ? (
        <img
          alt={item.imageAlt}
          className={styles.thumbnailImage}
          loading="lazy"
          src={item.imageUrl}
        />
      ) : (
        <span className={styles.thumbnailFallback}>
          {imageState === "loading" ? "Loading" : item.imageUrl ? "Unavailable" : "No image"}
        </span>
      )}
    </div>
  );
}

function formatCategoryLabel(category: AdminProductListItem["category"]) {
  if (category === "vintage") return "Vintage Rugs";
  if (category === "decor") return "Decor & Antiques";
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function formatStatusLabel(status: AdminProductListItem["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatBulkActionLabel(value: FormDataEntryValue) {
  if (value === "enable") {
    return "Enable";
  }

  if (value === "disable") {
    return "Disable";
  }

  if (value === "archive") {
    return "Archive";
  }

  return "Delete";
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

  if (status === "sold") {
    return `${scopedStyles.statusBadge} ${scopedStyles.statusBadgeSold}`;
  }

  return `${scopedStyles.statusBadge} ${scopedStyles.statusBadgeArchived}`;
}
