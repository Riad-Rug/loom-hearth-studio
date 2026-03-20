"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";

import { updateAdminBlogAuthorAction } from "@/app/(admin)/admin/blog/actions";
import {
  initialAdminBlogAuthorActionState,
  type AdminBlogAuthorActionState,
} from "@/lib/admin/blog-author-actions-shared";
import type { BlogAuthor } from "@/types/domain";

import styles from "./admin.module.css";

type AdminBlogAuthorFormProps = {
  initialAuthor: BlogAuthor;
  source: "database" | "defaults";
};

export function AdminBlogAuthorForm({ initialAuthor, source }: AdminBlogAuthorFormProps) {
  const [author, setAuthor] = useState(initialAuthor);
  const [actionState, formAction, isPending] = useActionState<AdminBlogAuthorActionState, FormData>(
    updateAdminBlogAuthorAction,
    initialAdminBlogAuthorActionState,
  );

  useEffect(() => {
    setAuthor(initialAuthor);
  }, [initialAuthor]);

  const initials = author.name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "LH";

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeaderCompact}>
        <p className={styles.eyebrow}>Default blog author</p>
        <h2>Central author block</h2>
        <p>
          This single author record renders below every journal article automatically.
        </p>
      </header>

      <div className={styles.workspaceGrid}>
        <form action={formAction} className={styles.editorCard}>
          <div className={styles.editorCardHeader}>
            <div className={styles.quickActionCopy}>
              <p className={styles.cardEyebrow}>Persisted source</p>
              <h3>{source === "database" ? "Database-backed" : "Using in-repo defaults"}</h3>
              <p>
                Save once here to update the author block across all blog posts.
              </p>
            </div>
            <div className={styles.inlineActionRow}>
              <button className={styles.inlineActionLink} disabled={isPending} type="submit">
                {isPending ? "Saving..." : "Save author"}
              </button>
            </div>
          </div>

          {actionState.message ? (
            <div className={styles.sessionNotice}>
              <strong>{actionState.status === "success" ? "Save status" : "Validation"}</strong>
              <p>{actionState.message}</p>
            </div>
          ) : null}

          <div className={styles.editorFormGrid}>
            <label className={styles.formField}>
              <span>Author name</span>
              <input
                name="name"
                onChange={(event) => setAuthor((current) => ({ ...current, name: event.target.value }))}
                type="text"
                value={author.name}
              />
            </label>

            <label className={styles.formField}>
              <span>Profile photo URL</span>
              <input
                name="photoUrl"
                onChange={(event) =>
                  setAuthor((current) => ({
                    ...current,
                    photoUrl: event.target.value,
                  }))
                }
                placeholder="https://res.cloudinary.com/... or leave blank"
                type="url"
                value={author.photoUrl ?? ""}
              />
              <em>Optional. Leave empty to render the no-photo fallback.</em>
            </label>
          </div>

          <label className={styles.formField}>
            <span>One-line bio</span>
            <textarea
              name="bio"
              onChange={(event) => setAuthor((current) => ({ ...current, bio: event.target.value }))}
              rows={3}
              value={author.bio}
            />
          </label>
        </form>

        <aside className={styles.assistantPanel}>
          <section className={styles.groupPanel}>
            <p className={styles.cardEyebrow}>Preview</p>
            <div className={styles.authorPreviewCard}>
              {author.photoUrl ? (
                <div className={styles.authorPreviewPhotoFrame}>
                  <Image alt={author.name} fill sizes="96px" src={author.photoUrl} />
                </div>
              ) : (
                <div className={styles.authorPreviewFallback}>{initials}</div>
              )}
              <div className={styles.fieldList}>
                <strong>{author.name}</strong>
                <span>{author.bio}</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </section>
  );
}
