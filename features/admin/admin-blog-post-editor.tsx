"use client";

import type { Route } from "next";
import Link from "next/link";
import { useActionState, useDeferredValue, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { AdminBlogPreviewFrame } from "@/features/admin/admin-blog-preview-frame";
import {
  initialAdminBlogPostActionState,
  type AdminBlogPostActionState,
} from "@/lib/admin/blog-post-actions-shared";
import type { AdminBlogPostFormValues } from "@/lib/admin/blog-posts";
import { blogPostStatusOptions } from "@/lib/blog/blog-post-validation";
import { createBlogPostSeoAudit } from "@/lib/seo/blog-post-audit";

import styles from "./admin.module.css";

type AdminBlogPostEditorProps = {
  mode: "create" | "edit";
  title: string;
  description: string;
  post: AdminBlogPostFormValues;
  action: (
    state: AdminBlogPostActionState,
    formData: FormData,
  ) => Promise<AdminBlogPostActionState>;
};

export function AdminBlogPostEditor(props: AdminBlogPostEditorProps) {
  const [state, formAction] = useActionState(props.action, initialAdminBlogPostActionState);
  const [draft, setDraft] = useState(props.post);
  const deferredDraft = useDeferredValue(draft);
  const seoAudit = useMemo(() => createBlogPostSeoAudit(draft), [draft]);
  const previewPath = `/blog/${draft.categorySlug || "journal"}/${draft.slug || "preview"}`;

  function updateField<Field extends keyof AdminBlogPostFormValues>(
    field: Field,
    value: AdminBlogPostFormValues[Field],
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function syncSlugFromTitle() {
    updateField("slug", slugify(draft.title));
  }

  return (
    <form action={formAction} className={styles.blogEditorShell}>
      <input name="postJson" type="hidden" value={JSON.stringify(draft)} />

      <div className={styles.blogEditorTopBar}>
        <Link className={styles.inlineActionLink} href={"/admin/blog" as Route}>
          ← Back to articles
        </Link>
        <div className={styles.blogEditorTopBarMeta}>
          <strong>{draft.title || "Untitled article"}</strong>
          <span className={getStatusBadgeClassName(draft.status)}>
            {formatStatusLabel(draft.status)}
          </span>
        </div>
        <div className={styles.inlineActionRow}>
          {draft.status === "active" ? (
            <a
              className={styles.inlineActionLink}
              href={previewPath}
              rel="noopener noreferrer"
              target="_blank"
            >
              View live ↗
            </a>
          ) : null}
          <SubmitButton mode={props.mode} />
        </div>
      </div>

      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin blog</p>
        <h2>{props.title}</h2>
        <p>{props.description}</p>
      </header>

      {state.message ? (
        <div className={state.status === "success" ? styles.successPanel : styles.gatePanel}>
          <strong>{state.status === "success" ? "Saved" : "Needs attention"}</strong>
          <p>{state.message}</p>
        </div>
      ) : null}

      <div className={styles.blogEditorFieldsGrid}>
        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Article</p>
          <label className={styles.formField}>
            <span>Title</span>
            <input
              onChange={(event) => updateField("title", event.target.value)}
              type="text"
              value={draft.title}
            />
            <em>{state.fieldErrors.title}</em>
          </label>
          <label className={styles.formField}>
            <span>Slug</span>
            <div className={styles.inlineFieldAction}>
              <input
                onChange={(event) => updateField("slug", event.target.value)}
                type="text"
                value={draft.slug}
              />
              <button
                className={styles.inlineActionLink}
                onClick={syncSlugFromTitle}
                type="button"
              >
                Sync slug
              </button>
            </div>
            <em>{state.fieldErrors.slug}</em>
          </label>
          <label className={styles.formField}>
            <span>Category slug</span>
            <input
              onChange={(event) => updateField("categorySlug", event.target.value)}
              type="text"
              value={draft.categorySlug}
            />
            <em>{state.fieldErrors.categorySlug}</em>
          </label>
          <label className={styles.formField}>
            <span>Category label</span>
            <input
              onChange={(event) => updateField("categoryLabel", event.target.value)}
              type="text"
              value={draft.categoryLabel}
            />
            <em>{state.fieldErrors.categoryLabel}</em>
          </label>
          <label className={styles.formField}>
            <span>Publish status</span>
            <select
              onChange={(event) =>
                updateField("status", event.target.value as AdminBlogPostFormValues["status"])
              }
              value={draft.status}
            >
              {blogPostStatusOptions.map((option) => (
                <option key={option} value={option}>
                  {formatStatusLabel(option)}
                </option>
              ))}
            </select>
          </label>
          <label className={styles.formField}>
            <span>Published date (display)</span>
            <input
              onChange={(event) => updateField("publishedAt", event.target.value)}
              placeholder="August 10, 2026"
              type="text"
              value={draft.publishedAt}
            />
          </label>
          <label className={styles.formField}>
            <span>Read time</span>
            <input
              onChange={(event) => updateField("readTime", event.target.value)}
              placeholder="5 min read"
              type="text"
              value={draft.readTime}
            />
          </label>
          <label className={styles.formField}>
            <span>CTA label</span>
            <input
              onChange={(event) => updateField("ctaLabel", event.target.value)}
              type="text"
              value={draft.ctaLabel}
            />
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>SEO</p>
          <label className={styles.formField}>
            <span>Target keyword</span>
            <input
              onChange={(event) => updateField("targetKeyword", event.target.value)}
              type="text"
              value={draft.targetKeyword}
            />
          </label>
          <label className={styles.formField}>
            <span>SEO title</span>
            <input
              onChange={(event) => updateField("seoTitle", event.target.value)}
              type="text"
              value={draft.seoTitle}
            />
            <em>{state.fieldErrors.seoTitle}</em>
          </label>
          <label className={styles.formField}>
            <span>SEO description</span>
            <textarea
              onChange={(event) => updateField("seoDescription", event.target.value)}
              rows={3}
              value={draft.seoDescription}
            />
            <em>{seoAudit.metaDescriptionLength} characters</em>
            <em>{state.fieldErrors.seoDescription}</em>
          </label>
          <label className={styles.formField}>
            <span>Hero image URL</span>
            <input
              onChange={(event) => updateField("imageSrc", event.target.value)}
              type="text"
              value={draft.imageSrc}
            />
          </label>
          <label className={styles.formField}>
            <span>Hero image alt text</span>
            <input
              onChange={(event) => updateField("imageAlt", event.target.value)}
              type="text"
              value={draft.imageAlt}
            />
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Excerpt</p>
          <label className={styles.formField}>
            <span>Excerpt</span>
            <textarea
              onChange={(event) => updateField("excerpt", event.target.value)}
              rows={6}
              value={draft.excerpt}
            />
            <em>{state.fieldErrors.excerpt}</em>
          </label>
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>SEO assistant</p>
          <div className={styles.assistantHeader}>
            <div className={styles.quickActionCopy}>
              <h3>{seoAudit.score}/100</h3>
              <p>Reactive internal score from the current draft fields. No ranking claims.</p>
            </div>
            <div className={styles.scoreMetaStack}>
              <span className={styles.statusPill}>{seoAudit.wordCount} words</span>
              <span className={styles.statusPill}>
                {seoAudit.internalLinksFound} internal links
              </span>
            </div>
          </div>
          <div className={styles.compactChecklist}>
            {seoAudit.checklist.map((item) => (
              <div
                className={styles.compactChecklistItem}
                data-pass={item.passed ? "true" : "false"}
                key={item.id}
              >
                <span>{item.label}</span>
                <strong>{item.passed ? `+${item.points}` : `0/${item.points}`}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className={styles.card}>
        <p className={styles.cardEyebrow}>Body</p>
        <label className={styles.formField}>
          <span>Body format</span>
          <select
            onChange={(event) =>
              updateField("bodyFormat", event.target.value as AdminBlogPostFormValues["bodyFormat"])
            }
            value={draft.bodyFormat}
          >
            <option value="plain">Plain paragraphs</option>
            <option value="markdown">Markdown</option>
          </select>
        </label>
        <label className={styles.formField}>
          <span>Body</span>
          <textarea
            className={styles.blogEditorBodyTextarea}
            onChange={(event) => updateField("body", event.target.value)}
            value={draft.body}
          />
          <em>{state.fieldErrors.body}</em>
        </label>
      </section>

      <section className={styles.blogEditorPreviewSection}>
        <div className={styles.groupPanel}>
          <strong>Live preview</strong>
          <p>
            Renders the real public article template with the live site header and footer.
            Updates automatically as you type — no button to click.
          </p>
        </div>
        <AdminBlogPreviewFrame draft={deferredDraft} />
      </section>
    </form>
  );
}

function SubmitButton(props: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus();

  return (
    <button
      className={`${styles.inlineActionLink} ${styles.inlineActionLinkPrimary}`}
      disabled={pending}
      type="submit"
    >
      {pending
        ? props.mode === "create"
          ? "Creating post..."
          : "Saving post..."
        : props.mode === "create"
          ? "Create post"
          : "Save post"}
    </button>
  );
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function formatStatusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

function getStatusBadgeClassName(status: AdminBlogPostFormValues["status"]) {
  if (status === "active") {
    return `${styles.statusBadge} ${styles.statusBadgeActive}`;
  }

  if (status === "draft") {
    return `${styles.statusBadge} ${styles.statusBadgeDraft}`;
  }

  return `${styles.statusBadge} ${styles.statusBadgeArchived}`;
}
