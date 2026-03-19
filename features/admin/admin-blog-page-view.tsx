"use client";

import type { Route } from "next";
import Link from "next/link";
import { useRef, useState } from "react";

import { blogPosts, type BlogPostRecord } from "@/features/blog/blog-post-data";

import styles from "./admin.module.css";

const statusOptions = ["all", "active", "draft", "archived"] as const;
const sortOptions = ["updated-desc", "updated-asc", "score-desc", "title-asc"] as const;

type EditableField =
  | "title"
  | "slug"
  | "status"
  | "targetKeyword"
  | "seoTitle"
  | "seoDescription"
  | "imageAlt"
  | "excerpt"
  | "body";

type EditableBlogPost = BlogPostRecord & {
  previewPath: Route;
};

type SeoChecklistItem = {
  id: string;
  label: string;
  detail: string;
  points: number;
  passed: boolean;
  field: EditableField;
};

type SeoAudit = {
  score: number;
  checklist: SeoChecklistItem[];
  recommendations: string[];
  wordCount: number;
  internalLinksFound: number;
  metaDescriptionLength: number;
};

const initialEditorialRows: EditableBlogPost[] = blogPosts.map((post) => ({
  ...post,
  previewPath: `/blog/${post.categorySlug}/${post.slug}` as Route,
}));

export function AdminBlogPageView() {
  const [records, setRecords] = useState(initialEditorialRows);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<(typeof statusOptions)[number]>("all");
  const [sortBy, setSortBy] = useState<(typeof sortOptions)[number]>("updated-desc");
  const [selectedId, setSelectedId] = useState(initialEditorialRows[0]?.id ?? "");
  const [sessionMessage, setSessionMessage] = useState(
    "Edits are local to this browser session only until persistence is wired.",
  );

  const titleRef = useRef<HTMLInputElement>(null);
  const slugRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLSelectElement>(null);
  const keywordRef = useRef<HTMLInputElement>(null);
  const seoTitleRef = useRef<HTMLInputElement>(null);
  const seoDescriptionRef = useRef<HTMLTextAreaElement>(null);
  const imageAltRef = useRef<HTMLInputElement>(null);
  const excerptRef = useRef<HTMLTextAreaElement>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredRows = records.filter((post) => {
    const matchesQuery = normalizedQuery
      ? [
          post.title,
          post.slug,
          post.targetKeyword,
          post.categoryLabel,
          post.seoTitle,
          post.seoDescription,
          post.excerpt,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery)
      : true;

    const matchesStatus = statusFilter === "all" ? true : post.status === statusFilter;

    return matchesQuery && matchesStatus;
  });

  const visibleRows = filteredRows.slice().sort((left, right) => {
    const leftAudit = createSeoAudit(left);
    const rightAudit = createSeoAudit(right);

    if (sortBy === "updated-asc") {
      return new Date(left.updatedAt).getTime() - new Date(right.updatedAt).getTime();
    }

    if (sortBy === "score-desc") {
      return rightAudit.score - leftAudit.score;
    }

    if (sortBy === "title-asc") {
      return left.title.localeCompare(right.title);
    }

    return new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime();
  });

  const selectedPost =
    visibleRows.find((post) => post.id === selectedId) ??
    records.find((post) => post.id === selectedId) ??
    visibleRows[0] ??
    null;
  const selectedAudit = selectedPost ? createSeoAudit(selectedPost) : null;

  function updateSelectedField(field: EditableField, value: string) {
    if (!selectedPost) {
      return;
    }

    setRecords((current) =>
      current.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              [field]: field === "status" ? (value as BlogPostRecord["status"]) : value,
            }
          : post,
      ),
    );

    setSessionMessage("Editing locally. Changes are not persisted to the repo or database yet.");
  }

  function saveSessionDraft() {
    if (!selectedPost) {
      return;
    }

    const savedAt = new Date().toISOString();
    setRecords((current) =>
      current.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              updatedAt: savedAt,
            }
          : post,
      ),
    );
    setSessionMessage(
      `Session draft updated for “${selectedPost.title}”. Persistence is still UI-only.`,
    );
  }

  function resetSelectedArticle() {
    if (!selectedPost) {
      return;
    }

    const sourceRecord = initialEditorialRows.find((post) => post.id === selectedPost.id);
    if (!sourceRecord) {
      return;
    }

    setRecords((current) =>
      current.map((post) => (post.id === sourceRecord.id ? sourceRecord : post)),
    );
    setSessionMessage(`Reset “${sourceRecord.title}” to the current in-repo source.`);
  }

  function syncSlugFromTitle() {
    if (!selectedPost) {
      return;
    }

    updateSelectedField("slug", slugify(selectedPost.title));
    setSessionMessage("Slug synced from the current article title.");
  }

  function updateMetaFields() {
    if (!selectedPost) {
      return;
    }

    const nextSeoTitle = buildSeoTitle(selectedPost);
    const nextDescription = buildMetaDescription(selectedPost);

    setRecords((current) =>
      current.map((post) =>
        post.id === selectedPost.id
          ? {
              ...post,
              seoTitle: nextSeoTitle,
              seoDescription: nextDescription,
            }
          : post,
      ),
    );
    setSessionMessage("SEO title and meta description updated from the current article draft.");
  }

  function fixSeo() {
    if (!selectedPost || !selectedAudit) {
      return;
    }

    const firstIssue = selectedAudit.checklist.find((item) => !item.passed);
    if (!firstIssue) {
      setSessionMessage("No open SEO checklist failures for this article.");
      return;
    }

    if (firstIssue.field === "slug") {
      syncSlugFromTitle();
    } else if (
      firstIssue.field === "seoTitle" ||
      firstIssue.field === "seoDescription"
    ) {
      updateMetaFields();
    } else if (firstIssue.field === "imageAlt" && selectedPost.imageAlt.trim().length < 24) {
      updateSelectedField(
        "imageAlt",
        `${selectedPost.title} hero image for Loom & Hearth Studio editorial content`,
      );
      setSessionMessage("Filled hero image alt text locally to address the first SEO gap.");
    } else {
      focusField(firstIssue.field);
      setSessionMessage(`Focused the first open SEO issue: ${firstIssue.label}.`);
    }
  }

  function improveContent() {
    focusField("body");
    setSessionMessage(
      "Focused the article body so you can improve content length, context, or internal links.",
    );
  }

  function focusField(field: EditableField) {
    if (field === "title") {
      titleRef.current?.focus();
      return;
    }

    if (field === "slug") {
      slugRef.current?.focus();
      return;
    }

    if (field === "status") {
      statusRef.current?.focus();
      return;
    }

    if (field === "targetKeyword") {
      keywordRef.current?.focus();
      return;
    }

    if (field === "seoTitle") {
      seoTitleRef.current?.focus();
      return;
    }

    if (field === "seoDescription") {
      seoDescriptionRef.current?.focus();
      return;
    }

    if (field === "imageAlt") {
      imageAltRef.current?.focus();
      return;
    }

    if (field === "excerpt") {
      excerptRef.current?.focus();
      return;
    }

    bodyRef.current?.focus();
  }

  if (!selectedPost || !selectedAudit) {
    return (
      <section className={styles.moduleShell}>
        <header className={styles.moduleHeader}>
          <p className={styles.eyebrow}>Admin blog</p>
          <h2>Editorial workspace</h2>
          <p>No article matches the current filters.</p>
        </header>
      </section>
    );
  }

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin blog</p>
        <h2>Editorial workspace</h2>
        <p>
          Select an article, edit the source-backed draft, review the reactive SEO panel,
          and take action without leaving the workspace.
        </p>
      </header>

      <div className={styles.editorWorkflowBar}>
        <span className={styles.statusPill}>1. Select article</span>
        <span className={styles.statusPill}>2. Edit draft</span>
        <span className={styles.statusPill}>3. Review SEO</span>
        <span className={styles.statusPill}>4. Save session draft</span>
      </div>

      <div className={styles.sessionNotice}>
        <strong>Persistence status</strong>
        <p>{sessionMessage}</p>
      </div>

      <section className={styles.workspaceGrid}>
        <div className={styles.editorColumn}>
          <section className={styles.tableCard}>
            <div className={styles.tableToolbar}>
              <label className={styles.searchField}>
                <span>Search articles</span>
                <input
                  name="article-search"
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search title, slug, keyword, or excerpt"
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

              <div className={styles.toolbarNote}>
                <span>Current selection</span>
                <p>{selectedPost.title}</p>
              </div>
            </div>

            <div className={styles.tableSummary}>
              <p>
                Showing {visibleRows.length} of {records.length} articles
              </p>
              <p>Use Edit to load a record into the main workspace.</p>
            </div>

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
                  {visibleRows.map((post) => {
                    const audit = createSeoAudit(post);

                    return (
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
                            <strong>{formatRelativeDate(post.updatedAt)}</strong>
                            <span>{formatAbsoluteDate(post.updatedAt)}</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.scoreCell}>
                            <strong>{audit.score}/100</strong>
                            <span>{audit.recommendations.length} open fixes</span>
                          </div>
                        </td>
                        <td>
                          <div className={styles.actionCluster}>
                            <button
                              className={styles.inlineActionLink}
                              onClick={() => setSelectedId(post.id)}
                              type="button"
                            >
                              Edit
                            </button>
                            <Link
                              className={styles.inlineActionLink}
                              href={post.previewPath}
                              target="_blank"
                            >
                              Preview
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className={styles.editorCard}>
            <div className={styles.editorCardHeader}>
              <div className={styles.quickActionCopy}>
                <p className={styles.cardEyebrow}>Article editor</p>
                <h3>{selectedPost.title}</h3>
                <p>Edit the working draft first. The SEO assistant updates from these local inputs.</p>
              </div>
              <div className={styles.inlineActionRow}>
                <button className={styles.inlineActionLink} onClick={saveSessionDraft} type="button">
                  Save session draft
                </button>
                <button className={styles.inlineActionLink} onClick={resetSelectedArticle} type="button">
                  Reset article
                </button>
              </div>
            </div>

            <div className={styles.editorFormGrid}>
              <label className={styles.formField}>
                <span>Title</span>
                <input
                  onChange={(event) => updateSelectedField("title", event.target.value)}
                  ref={titleRef}
                  type="text"
                  value={selectedPost.title}
                />
              </label>

              <label className={styles.formField}>
                <span>Slug</span>
                <div className={styles.inlineFieldAction}>
                  <input
                    onChange={(event) => updateSelectedField("slug", event.target.value)}
                    ref={slugRef}
                    type="text"
                    value={selectedPost.slug}
                  />
                  <button className={styles.inlineActionLink} onClick={syncSlugFromTitle} type="button">
                    Sync slug
                  </button>
                </div>
              </label>

              <label className={styles.formField}>
                <span>Publish status</span>
                <select
                  onChange={(event) => updateSelectedField("status", event.target.value)}
                  ref={statusRef}
                  value={selectedPost.status}
                >
                  <option value="active">Active</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
              </label>

              <label className={styles.formField}>
                <span>Target keyword</span>
                <input
                  onChange={(event) => updateSelectedField("targetKeyword", event.target.value)}
                  ref={keywordRef}
                  type="text"
                  value={selectedPost.targetKeyword}
                />
              </label>

              <label className={styles.formField}>
                <span>SEO title</span>
                <input
                  onChange={(event) => updateSelectedField("seoTitle", event.target.value)}
                  ref={seoTitleRef}
                  type="text"
                  value={selectedPost.seoTitle}
                />
              </label>

              <label className={styles.formField}>
                <span>Hero image alt text</span>
                <input
                  onChange={(event) => updateSelectedField("imageAlt", event.target.value)}
                  ref={imageAltRef}
                  type="text"
                  value={selectedPost.imageAlt}
                />
              </label>
            </div>

            <div className={styles.stack}>
              <label className={styles.formField}>
                <span>Meta description</span>
                <textarea
                  onChange={(event) => updateSelectedField("seoDescription", event.target.value)}
                  ref={seoDescriptionRef}
                  rows={3}
                  value={selectedPost.seoDescription}
                />
                <em>{selectedAudit.metaDescriptionLength} characters</em>
              </label>

              <label className={styles.formField}>
                <span>Excerpt</span>
                <textarea
                  onChange={(event) => updateSelectedField("excerpt", event.target.value)}
                  ref={excerptRef}
                  rows={4}
                  value={selectedPost.excerpt}
                />
              </label>

              <label className={styles.formField}>
                <span>Body</span>
                <textarea
                  onChange={(event) => updateSelectedField("body", event.target.value)}
                  ref={bodyRef}
                  rows={12}
                  value={selectedPost.body}
                />
                <em>
                  Word count reacts live. Internal-link readiness checks this draft body for app route references.
                </em>
              </label>
            </div>
          </section>
        </div>

        <aside className={styles.assistantPanel}>
          <section className={styles.seoScoreCardCompact}>
            <div className={styles.assistantHeader}>
              <div className={styles.quickActionCopy}>
                <p className={styles.cardEyebrow}>SEO assistant</p>
                <h3>{selectedAudit.score}/100</h3>
                <p>Reactive internal score from the current draft fields. No ranking claims.</p>
              </div>
              <div className={styles.scoreMetaStack}>
                <span className={styles.statusPill}>
                  {selectedAudit.wordCount} words
                </span>
                <span className={styles.statusPill}>
                  {selectedAudit.internalLinksFound} internal links
                </span>
              </div>
            </div>

            <div className={styles.assistantActions}>
              <button className={styles.inlineActionLink} onClick={fixSeo} type="button">
                Fix SEO
              </button>
              <button className={styles.inlineActionLink} onClick={updateMetaFields} type="button">
                Update meta
              </button>
              <button className={styles.inlineActionLink} onClick={improveContent} type="button">
                Improve content
              </button>
            </div>

            <div className={styles.compactChecklist}>
              {selectedAudit.checklist.map((item) => (
                <button
                  className={styles.compactChecklistItem}
                  data-pass={item.passed ? "true" : "false"}
                  key={item.id}
                  onClick={() => focusField(item.field)}
                  type="button"
                >
                  <span>{item.label}</span>
                  <strong>{item.passed ? `+${item.points}` : `0/${item.points}`}</strong>
                </button>
              ))}
            </div>
          </section>

          <section className={styles.groupPanel}>
            <p className={styles.cardEyebrow}>Checklist detail</p>
            <div className={styles.checklist}>
              {selectedAudit.checklist.map((item) => (
                <article
                  className={styles.checklistItem}
                  data-pass={item.passed ? "true" : "false"}
                  key={item.id}
                >
                  <div>
                    <strong>{item.label}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <button
                    className={styles.inlineActionLink}
                    onClick={() => focusField(item.field)}
                    type="button"
                  >
                    Edit
                  </button>
                </article>
              ))}
            </div>
          </section>

          <section className={styles.groupPanel}>
            <p className={styles.cardEyebrow}>Recommended next steps</p>
            {selectedAudit.recommendations.length ? (
              <div className={styles.recommendationList}>
                {selectedAudit.recommendations.map((recommendation) => (
                  <p key={recommendation}>{recommendation}</p>
                ))}
              </div>
            ) : (
              <p className={styles.costPanelCopy}>
                No open SEO recommendations for the current draft.
              </p>
            )}
          </section>
        </aside>
      </section>
    </section>
  );
}

function createSeoAudit(post: EditableBlogPost): SeoAudit {
  const normalizedKeyword = normalizeText(post.targetKeyword);
  const normalizedTitle = normalizeText(post.title);
  const normalizedSeoTitle = normalizeText(post.seoTitle);
  const normalizedSlug = normalizeText(post.slug.replaceAll("-", " "));
  const wordCount = countWords(post.body);
  const internalLinksFound = countInternalLinkSignals(post.body);
  const metaDescriptionLength = post.seoDescription.trim().length;
  const seoTitleLength = post.seoTitle.trim().length;
  const keywordInTitle = normalizedKeyword ? normalizedTitle.includes(normalizedKeyword) : false;
  const keywordInSlug = normalizedKeyword ? normalizedSlug.includes(normalizedKeyword) : false;
  const metaDescriptionReady =
    metaDescriptionLength >= 120 && metaDescriptionLength <= 160;
  const seoTitleReady = seoTitleLength >= 45 && seoTitleLength <= 65;
  const h1TitleAlignment =
    Boolean(normalizedSeoTitle) &&
    (normalizedSeoTitle.includes(normalizedTitle) || normalizedTitle.includes(normalizedKeyword));
  const contentLengthReady = wordCount >= 350;
  const internalLinkReady = internalLinksFound > 0;
  const imageAltReady = post.imageAlt.trim().length >= 24;

  const checklist: SeoChecklistItem[] = [
    {
      id: "keyword-title",
      label: "Keyword in title",
      detail: keywordInTitle
        ? `Target keyword "${post.targetKeyword}" is present in the H1.`
        : `Target keyword "${post.targetKeyword}" is missing from the article title.`,
      points: 15,
      passed: keywordInTitle,
      field: "title",
    },
    {
      id: "keyword-slug",
      label: "Keyword in slug",
      detail: keywordInSlug
        ? `Slug supports the target phrase: /${post.slug}`
        : `Slug does not clearly include the target phrase: /${post.slug}`,
      points: 10,
      passed: keywordInSlug,
      field: "slug",
    },
    {
      id: "seo-title",
      label: "SEO title readiness",
      detail: seoTitleReady
        ? `SEO title length is ${seoTitleLength} characters.`
        : `SEO title length is ${seoTitleLength} characters; target 45 to 65.`,
      points: 15,
      passed: seoTitleReady,
      field: "seoTitle",
    },
    {
      id: "meta-description",
      label: "Meta description readiness",
      detail: metaDescriptionReady
        ? `Meta description length is ${metaDescriptionLength} characters.`
        : `Meta description length is ${metaDescriptionLength} characters; target 120 to 160.`,
      points: 15,
      passed: metaDescriptionReady,
      field: "seoDescription",
    },
    {
      id: "h1-alignment",
      label: "H1 and SEO title alignment",
      detail: h1TitleAlignment
        ? "The SEO title still reflects the article H1."
        : "The SEO title drifts away from the article H1.",
      points: 10,
      passed: h1TitleAlignment,
      field: "seoTitle",
    },
    {
      id: "word-count",
      label: "Content length",
      detail: contentLengthReady
        ? `Body contains ${wordCount} words.`
        : `Body contains ${wordCount} words; target at least 350.`,
      points: 15,
      passed: contentLengthReady,
      field: "body",
    },
    {
      id: "internal-links",
      label: "Internal-link readiness",
      detail: internalLinkReady
        ? `${internalLinksFound} internal route reference(s) found in the draft body.`
        : "No internal route reference found in the current draft body.",
      points: 10,
      passed: internalLinkReady,
      field: "body",
    },
    {
      id: "image-alt",
      label: "Hero image alt text",
      detail: imageAltReady
        ? "Hero image alt text is present and descriptive."
        : "Hero image alt text is missing or too thin to be useful.",
      points: 10,
      passed: imageAltReady,
      field: "imageAlt",
    },
  ];

  const recommendations = checklist
    .filter((item) => !item.passed)
    .map((item) => {
      if (item.id === "meta-description") {
        return "Update meta: rewrite the description to land closer to 120 to 160 characters.";
      }

      if (item.id === "keyword-title") {
        return "Fix SEO: bring the target keyword into the title without making it read unnaturally.";
      }

      if (item.id === "keyword-slug") {
        return "Fix SEO: tighten the slug so it reflects the target phrase more directly.";
      }

      if (item.id === "image-alt") {
        return "Fix SEO: make the hero image alt text more descriptive for the current article.";
      }

      if (item.id === "word-count") {
        return "Improve content: expand the article body with more concrete editorial detail.";
      }

      if (item.id === "internal-links") {
        return "Improve content: add at least one internal Loom & Hearth route reference in the body.";
      }

      if (item.id === "seo-title") {
        return "Update meta: rewrite the SEO title into a stronger 45 to 65 character range.";
      }

      return "Fix SEO: keep the SEO title aligned with the article H1.";
    });

  return {
    score: checklist.reduce(
      (total, item) => total + (item.passed ? item.points : 0),
      0,
    ),
    checklist,
    recommendations,
    wordCount,
    internalLinksFound,
    metaDescriptionLength,
  };
}

function buildSeoTitle(post: EditableBlogPost) {
  const baseTitle = post.title.trim() || "Loom & Hearth Studio article";
  const keyword = post.targetKeyword.trim();
  const candidate = keyword && !baseTitle.toLowerCase().includes(keyword.toLowerCase())
    ? `${baseTitle} | ${keyword}`
    : baseTitle;

  return `${candidate} | Loom & Hearth Studio`.slice(0, 65).trim();
}

function buildMetaDescription(post: EditableBlogPost) {
  const source = post.excerpt.trim() || post.body.trim();
  const prefix = post.targetKeyword.trim()
    ? `${post.targetKeyword.trim()}: `
    : "";
  const candidate = `${prefix}${source}`.replace(/\s+/g, " ").trim();

  return candidate.slice(0, 160).trim();
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function countWords(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).length;
}

function countInternalLinkSignals(value: string) {
  const matches =
    value.match(/\/blog\/|\/products\/|href=|https?:\/\/[^ ]*loom|]\(\/[a-z]/gi) ?? [];

  return matches.length;
}

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function formatStatusLabel(status: BlogPostRecord["status"]) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function formatAbsoluteDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function formatRelativeDate(value: string) {
  const days = Math.max(
    0,
    Math.round((Date.now() - new Date(value).getTime()) / (1000 * 60 * 60 * 24)),
  );

  if (days === 0) {
    return "Updated today";
  }

  if (days === 1) {
    return "Updated 1 day ago";
  }

  return `Updated ${days} days ago`;
}

function getStatusBadgeClassName(status: BlogPostRecord["status"]) {
  if (status === "active") {
    return `${styles.statusBadge} ${styles.statusBadgeActive}`;
  }

  if (status === "draft") {
    return `${styles.statusBadge} ${styles.statusBadgeDraft}`;
  }

  return `${styles.statusBadge} ${styles.statusBadgeArchived}`;
}
