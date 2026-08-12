"use client";

import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";

import type { AdminBlogPostListItem } from "@/lib/admin/blog-posts";

import styles from "./admin.module.css";

const statusOptions = ["all", "active", "draft", "archived"] as const;
const sortOptions = ["updated-desc", "updated-asc", "score-desc", "title-asc"] as const;

type AdminBlogPageViewProps = {
  description: string;
  items: AdminBlogPostListItem[];
};

export function AdminBlogPageView({ description, items }: AdminBlogPageViewProps) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("updated-desc");

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = items.filter((post) => {
    const matchesQuery = normalizedQuery
      ? [post.title, post.slug, post.targetKeyword, post.categoryLabel]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;

    const matchesStatus = statusFilter === "all" ? true : post.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const visibleRows = filteredRows.slice().sort((left, right) => {
    if (sortBy === "updated-asc") {
      return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
    }

    if (sortBy === "score-desc") {
      return right.seoScore - left.seoScore;
    }

    if (sortBy === "title-asc") {
      return left.title.localeCompare(right.title);
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin blog</p>
        <h2>Journal articles</h2>
        <p>{description}</p>
      </header>

      <div className={styles.inlineActionRow}>
        <Link className={`${styles.inlineActionLink} ${styles.inlineActionLinkPrimary}`} href={"/admin/blog/new" as Route}>
          New post
        </Link>
        <Link className={styles.inlineActionLink} href={"/admin/blog/author" as Route}>
          Manage default author
        </Link>
      </div>

      <section className={styles.tableCard}>
        <div className={styles.tableToolbar}>
          <label className={styles.searchField}>
            <span>Search articles</span>
            <input
              name="article-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search title, slug, keyword, or category"
              type="search"
              value={query}
            />
          </label>

          <label className={styles.toolbarField}>
            <span>Status</span>
            <select
              onChange={(event) =>
                setStatusFilter(event.target.value as (typeof statusOptions)[number])
              }
              value={statusFilter}
            >
              <option value="all">All statuses</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
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
              <option value="score-desc">SEO score: highest</option>
              <option value="title-asc">Title: A to Z</option>
            </select>
          </label>
        </div>

        <div className={styles.tableSummary}>
          <p>
            Showing {visibleRows.length} of {items.length} articles
          </p>
          <p>Use Edit to open the full article editor with a live preview.</p>
        </div>

        {visibleRows.length ? (
          <div className={styles.tableScroller}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Article title</th>
                  <th>Slug</th>
                  <th>Status</th>
                  <th>Updated</th>
                  <th>SEO score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {visibleRows.map((post) => (
                  <tr className={styles.tableRow} data-status={post.status} key={post.id}>
                    <td>
                      <div className={styles.productCell}>
                        <strong>{post.title}</strong>
                        <span>{post.categoryLabel}</span>
                        <em>{post.targetKeyword}</em>
                      </div>
                    </td>
                    <td className={styles.slugCell}>/{post.slug}</td>
                    <td>
                      <span className={getStatusBadgeClassName(post.status)}>
                        {formatStatusLabel(post.status)}
                      </span>
                    </td>
                    <td>
                      <div className={styles.dateCell}>
                        <strong>{post.updatedAtLabel}</strong>
                      </div>
                    </td>
                    <td>
                      <div className={styles.scoreCell}>
                        <strong>{post.seoScore}/100</strong>
                      </div>
                    </td>
                    <td>
                      <div className={styles.actionCluster}>
                        <Link
                          className={styles.inlineActionLink}
                          href={`/admin/blog/${post.id}` as Route}
                        >
                          Edit
                        </Link>
                        <Link
                          className={styles.inlineActionLink}
                          href={post.previewPath as Route}
                          target="_blank"
                        >
                          Preview
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No articles match the current filters</h3>
            <p>Adjust the search or status filter, or create a new post.</p>
          </div>
        )}
      </section>
    </section>
  );
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusBadgeClassName(status: string) {
  if (status === "active") {
    return `${styles.statusBadge} ${styles.statusBadgeActive}`;
  }

  if (status === "draft") {
    return `${styles.statusBadge} ${styles.statusBadgeDraft}`;
  }

  return `${styles.statusBadge} ${styles.statusBadgeArchived}`;
}
