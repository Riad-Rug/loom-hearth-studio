"use client";

import type { Route } from "next";
import Link from "next/link";
import { useActionState, useDeferredValue, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { AdminBlogPreviewFrame } from "@/features/admin/admin-blog-preview-frame";
import { CloudinaryUploadButton } from "@/features/admin/cloudinary-upload-button";
import {
  initialAdminBlogPostActionState,
  type AdminBlogPostActionState,
} from "@/lib/admin/blog-post-actions-shared";
import type { AdminBlogPostFormValues } from "@/lib/admin/blog-posts";
import {
  blogPostMaxImages,
  blogPostMinImages,
  blogPostStatusOptions,
  type BlogPostImage,
} from "@/lib/blog/blog-post-validation";
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
  const bodyTextareaRef = useRef<HTMLTextAreaElement>(null);
  const bodyCursorTouchedRef = useRef(false);
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

  function updateImage(index: number, patch: Partial<BlogPostImage>) {
    setDraft((current) => ({
      ...current,
      images: current.images.map((image, imageIndex) =>
        imageIndex === index ? { ...image, ...patch } : image,
      ),
    }));
  }

  function addImage() {
    setDraft((current) =>
      current.images.length >= blogPostMaxImages
        ? current
        : { ...current, images: [...current.images, createEmptyBlogImage()] },
    );
  }

  function removeImage(index: number) {
    setDraft((current) => {
      if (current.images.length <= blogPostMinImages) {
        return current;
      }

      const removedImage = current.images[index];

      return {
        ...current,
        images: current.images.filter((_, imageIndex) => imageIndex !== index),
        body: stripImageLineFromBody(current.body, removedImage.src),
      };
    });
  }

  function moveImage(index: number, direction: -1 | 1) {
    setDraft((current) => {
      const targetIndex = index + direction;

      if (targetIndex < 0 || targetIndex >= current.images.length) {
        return current;
      }

      const nextImages = current.images.slice();
      const [moved] = nextImages.splice(index, 1);
      nextImages.splice(targetIndex, 0, moved);

      return { ...current, images: nextImages };
    });
  }

  function insertImageIntoBody(image: BlogPostImage) {
    const src = image.src.trim();

    if (!src) {
      return;
    }

    const markdownImageLine = `![${image.alt.trim()}](${src})`;
    const textarea = bodyTextareaRef.current;

    // Insert at the cursor/selection in the body textarea when the user has
    // placed one; otherwise fall back to appending at the end.
    let start = draft.body.length;
    let end = draft.body.length;

    if (textarea && bodyCursorTouchedRef.current) {
      start = Math.min(textarea.selectionStart, draft.body.length);
      end = Math.min(Math.max(textarea.selectionEnd, start), draft.body.length);
    }

    // Move semantics: strip any existing placement of this image so clicking
    // "Insert" again relocates it instead of duplicating it.
    const before = stripImageLineFromBody(draft.body.slice(0, start), src).replace(/\s+$/, "");
    const after = stripImageLineFromBody(draft.body.slice(end), src).replace(/^\s+/, "");

    const nextBody =
      (before ? `${before}\n\n` : "") + markdownImageLine + (after ? `\n\n${after}` : "\n");

    updateField("body", nextBody);

    // Put the caret right after the inserted line so the user can keep editing.
    const caretPosition = (before ? before.length + 2 : 0) + markdownImageLine.length;

    requestAnimationFrame(() => {
      const element = bodyTextareaRef.current;

      if (!element) {
        return;
      }

      element.focus();
      element.setSelectionRange(caretPosition, caretPosition);
    });
  }

  function isImagePlacedInBody(image: BlogPostImage) {
    return Boolean(image.src.trim()) && draft.body.includes(image.src.trim());
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
        </section>

        <section className={styles.card}>
          <p className={styles.cardEyebrow}>Images (up to {blogPostMaxImages})</p>
          <p>
            Image 1 is the hero/cover image shown on the article and index cards. Images 2–
            {blogPostMaxImages} can be placed in the body: click into the body text where the
            image should go, then press Insert (it lands at your cursor, or at the end if you
            haven&apos;t clicked into the body). Inserting again moves the image, and removing an
            image also removes it from the body.
          </p>
          <div className={styles.stack}>
            {draft.images.map((image, index) => (
              <div key={image.id} className={styles.groupPanel}>
                <strong>{index === 0 ? "Hero / cover image" : `Image ${index + 1}`}</strong>
                <div className={styles.inlineGroup}>
                  <div className={styles.thumbnailFrame}>
                    {image.src.trim() ? (
                      <img alt={image.alt} className={styles.thumbnailImage} src={image.src} />
                    ) : (
                      <span className={styles.thumbnailFallback}>No image</span>
                    )}
                  </div>
                  <div className={styles.stack}>
                    <CloudinaryUploadButton
                      onUploaded={(result) =>
                        updateImage(index, {
                          src: result.url,
                          alt: image.alt.trim() || draft.title,
                        })
                      }
                      slotId={image.id}
                      target="blog"
                    >
                      Upload image
                    </CloudinaryUploadButton>
                  </div>
                </div>
                <label className={styles.formField}>
                  <span>Image URL</span>
                  <input
                    onChange={(event) => updateImage(index, { src: event.target.value })}
                    type="text"
                    value={image.src}
                  />
                </label>
                <label className={styles.formField}>
                  <span>Alt text</span>
                  <input
                    onChange={(event) => updateImage(index, { alt: event.target.value })}
                    type="text"
                    value={image.alt}
                  />
                </label>
                {index > 0 ? (
                  <div className={styles.inlineActionRow}>
                    <button
                      className={styles.inlineActionLink}
                      disabled={!image.src.trim()}
                      onClick={() => insertImageIntoBody(image)}
                      type="button"
                    >
                      {isImagePlacedInBody(image) ? "Move to cursor" : "Insert into body"}
                    </button>
                    <span className={styles.statusPill}>
                      {isImagePlacedInBody(image) ? "Placed in body" : "Not placed yet"}
                    </span>
                  </div>
                ) : null}
                <div className={styles.inlineActionRow}>
                  <button
                    className={styles.textButton}
                    disabled={index === 0}
                    onClick={() => moveImage(index, -1)}
                    type="button"
                  >
                    Move up
                  </button>
                  <button
                    className={styles.textButton}
                    disabled={index === draft.images.length - 1}
                    onClick={() => moveImage(index, 1)}
                    type="button"
                  >
                    Move down
                  </button>
                  <button
                    className={styles.textButton}
                    disabled={draft.images.length <= blogPostMinImages}
                    onClick={() => removeImage(index)}
                    type="button"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            {draft.images.length < blogPostMaxImages ? (
              <button className={styles.navLink} onClick={addImage} type="button">
                Add image
              </button>
            ) : null}
            <em>{state.fieldErrors.images}</em>
          </div>
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
            onSelect={() => {
              bodyCursorTouchedRef.current = true;
            }}
            ref={bodyTextareaRef}
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

/**
 * Removes any standalone `![alt](src)` markdown image line whose URL matches
 * the given src, then collapses the leftover blank-line gap so the body does
 * not keep an orphaned image reference or a double gap.
 */
function stripImageLineFromBody(body: string, src: string) {
  const trimmedSrc = src.trim();

  if (!trimmedSrc) {
    return body;
  }

  const keptLines = body.split("\n").filter((line) => {
    const match = line.trim().match(/^!\[[^\]]*\]\(([^)]*)\)$/);

    return !(match && match[1].trim() === trimmedSrc);
  });

  return keptLines
    .join("\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\n+/, "")
    .replace(/\n+$/, "\n");
}

function createEmptyBlogImage(): BlogPostImage {
  return {
    id: `image-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    src: "",
    alt: "",
  };
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
