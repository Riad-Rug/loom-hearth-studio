"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { saveAdminSeoSettingAction } from "@/app/(admin)/admin/seo/actions";
import styles from "@/features/admin/admin.module.css";
import {
  initialAdminSeoActionState,
  type AdminSeoActionState,
} from "@/lib/admin/seo-actions-shared";

type SeoEditorRecord = {
  id: string;
  label: string;
  entityType: string;
  entityKey: string;
  path: string;
  fallbackTitle: string;
  fallbackDescription: string;
  fields: {
    title: string;
    description: string;
    canonicalUrl: string;
    robotsIndex: boolean;
    ogTitle: string;
    ogDescription: string;
    ogImageUrl: string;
  };
};

export function AdminSeoPageView(props: {
  records: SeoEditorRecord[];
  siteUrl: string;
  defaultOgImagePath: string;
  sitemapUrl: string;
  robotsUrl: string;
}) {
  const [actionState, formAction] = useActionState<AdminSeoActionState, FormData>(
    saveAdminSeoSettingAction,
    initialAdminSeoActionState,
  );
  const [records, setRecords] = useState(props.records);
  const [selectedId, setSelectedId] = useState(props.records[0]?.id ?? "");
  const [draft, setDraft] = useState(props.records[0]?.fields ?? createEmptyFields());

  const selectedRecord = useMemo(
    () => records.find((record) => record.id === selectedId) ?? records[0] ?? null,
    [records, selectedId],
  );

  useEffect(() => {
    if (!selectedRecord) {
      return;
    }

    setDraft(selectedRecord.fields);
  }, [selectedRecord?.id]);

  useEffect(() => {
    const savedFields = actionState.savedFields;

    if (actionState.status !== "success" || !actionState.recordKey || !savedFields) {
      return;
    }

    setRecords((current) =>
      current.map((record) =>
        record.id === actionState.recordKey
          ? {
              ...record,
              fields: savedFields,
            }
          : record,
      ),
    );

    if (actionState.recordKey === selectedId) {
      setDraft(savedFields);
    }
  }, [actionState, selectedId]);

  if (!selectedRecord) {
    return (
      <section className={styles.moduleShell}>
        <header className={styles.moduleHeader}>
          <p className={styles.eyebrow}>Admin SEO</p>
          <h2>SEO controls</h2>
          <p>No editable SEO routes are configured.</p>
        </header>
      </section>
    );
  }

  const effectiveTitle = draft.title || selectedRecord.fallbackTitle;
  const effectiveDescription = draft.description || selectedRecord.fallbackDescription;
  const effectiveCanonical = draft.canonicalUrl || `${props.siteUrl}${selectedRecord.path}`;
  const effectiveOgTitle = draft.ogTitle || effectiveTitle;
  const effectiveOgDescription = draft.ogDescription || effectiveDescription;
  const effectiveOgImage = draft.ogImageUrl || `${props.siteUrl}${props.defaultOgImagePath}`;

  return (
    <section className={styles.moduleShell}>
      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin SEO</p>
        <h2>Metadata controls</h2>
        <p>
          Manage metadata overrides for static pages, collections, products, and journal entries
          without changing the code-defined defaults underneath them.
        </p>
      </header>

      <div className={styles.dashboardStatusBar}>
        <span className={styles.statusPill}>{records.length} editable routes</span>
        <span className={styles.statusPill}>Sitemap: {props.sitemapUrl}</span>
        <span className={styles.statusPill}>Robots: {props.robotsUrl}</span>
      </div>

      {actionState.message ? (
        <div className={actionState.status === "success" ? styles.successPanel : styles.gatePanel}>
          <strong>{actionState.status === "success" ? "Saved" : "Needs attention"}</strong>
          <p>{actionState.message}</p>
        </div>
      ) : null}

      <div className={styles.homepageWorkspaceGrid}>
        <aside className={styles.homepageWorkspaceRail}>
          <div className={styles.groupPanel}>
            <strong>Editable routes</strong>
            <p className={styles.workspaceHelper}>
              Select a route to override its metadata. Leaving a field empty keeps the code default.
            </p>
            <div className={styles.homepageSectionList}>
              {records.map((record) => (
                <button
                  key={record.id}
                  className={`${styles.homepageSectionButton} ${
                    selectedId === record.id ? styles.homepageSectionButtonActive : ""
                  }`}
                  onClick={() => setSelectedId(record.id)}
                  type="button"
                >
                  <span>{record.label}</span>
                  <small>{record.path}</small>
                  <span className={styles.homepageSectionMeta}>
                    <span>{record.entityType}</span>
                    <span>{record.fields.title || record.fields.description ? "Override set" : "Using defaults"}</span>
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className={styles.groupPanel}>
            <strong>Publishing context</strong>
            <p className={styles.workspaceHelper}>Current route: {selectedRecord.path}</p>
            <p className={styles.workspaceHelper}>Entity key: {selectedRecord.entityKey}</p>
            <p className={styles.workspaceHelper}>Default OG image: {props.defaultOgImagePath}</p>
          </div>
        </aside>

        <form action={formAction} className={styles.homepageEditorColumn}>
          <input name="recordKey" type="hidden" value={selectedRecord.id} />
          <input name="label" type="hidden" value={selectedRecord.label} />
          <input name="entityType" type="hidden" value={selectedRecord.entityType} />
          <input name="entityKey" type="hidden" value={selectedRecord.entityKey} />
          <input name="path" type="hidden" value={selectedRecord.path} />

          <div className={styles.groupPanel}>
            <strong>Route defaults</strong>
            <p>Title: {selectedRecord.fallbackTitle}</p>
            <p>Description: {selectedRecord.fallbackDescription}</p>
          </div>

          <div className={styles.formGrid}>
            <label className={styles.formField}>
              <span>SEO title override</span>
              <input
                name="title"
                onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                type="text"
                value={draft.title}
              />
              <em>{effectiveTitle.length} characters</em>
            </label>

            <label className={styles.formField}>
              <span>Canonical URL override</span>
              <input
                name="canonicalUrl"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, canonicalUrl: event.target.value }))
                }
                type="text"
                value={draft.canonicalUrl}
              />
              <em>Leave blank to use {selectedRecord.path}</em>
            </label>

            <label className={styles.formField}>
              <span>Meta description override</span>
              <textarea
                name="description"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, description: event.target.value }))
                }
                rows={5}
                value={draft.description}
              />
              <em>{effectiveDescription.length} characters</em>
            </label>

            <label className={styles.formField}>
              <span>Open Graph title override</span>
              <input
                name="ogTitle"
                onChange={(event) => setDraft((current) => ({ ...current, ogTitle: event.target.value }))}
                type="text"
                value={draft.ogTitle}
              />
              <em>Falls back to effective title</em>
            </label>

            <label className={styles.formField}>
              <span>Open Graph description override</span>
              <textarea
                name="ogDescription"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, ogDescription: event.target.value }))
                }
                rows={5}
                value={draft.ogDescription}
              />
              <em>Falls back to effective description</em>
            </label>

            <label className={styles.formField}>
              <span>Open Graph image URL</span>
              <input
                name="ogImageUrl"
                onChange={(event) =>
                  setDraft((current) => ({ ...current, ogImageUrl: event.target.value }))
                }
                type="text"
                value={draft.ogImageUrl}
              />
              <em>Must be a full URL if set</em>
            </label>
          </div>

          <label className={styles.checkboxRow}>
            <input
              checked={draft.robotsIndex}
              name="robotsIndex"
              onChange={(event) =>
                setDraft((current) => ({ ...current, robotsIndex: event.target.checked }))
              }
              type="checkbox"
            />
            <span>Allow indexing for this route</span>
          </label>

          <div className={styles.actionRow}>
            <SubmitButton />
            <button
              className={styles.inlineActionLink}
              onClick={() => setDraft(selectedRecord.fields)}
              type="button"
            >
              Reset unsaved edits
            </button>
          </div>
        </form>

        <section className={styles.homepagePreviewColumn}>
          <div className={styles.groupPanel}>
            <strong>Metadata preview</strong>
            <p className={styles.workspaceHelper}>This preview shows the effective values after defaults and overrides are combined.</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardEyebrow}>Search snippet</p>
            <h3>{effectiveTitle}</h3>
            <p>{effectiveCanonical}</p>
            <p>{effectiveDescription}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardEyebrow}>Open Graph</p>
            <h3>{effectiveOgTitle}</h3>
            <p>{effectiveOgDescription}</p>
            <p>{effectiveOgImage}</p>
          </div>
          <div className={styles.card}>
            <p className={styles.cardEyebrow}>Robots</p>
            <p>{draft.robotsIndex ? "index, follow" : "noindex, nofollow"}</p>
          </div>
        </section>
      </div>
    </section>
  );
}

function createEmptyFields() {
  return {
    title: "",
    description: "",
    canonicalUrl: "",
    robotsIndex: true,
    ogTitle: "",
    ogDescription: "",
    ogImageUrl: "",
  };
}

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className={`${styles.inlineActionLink} ${styles.inlineActionLinkPrimary}`} type="submit">
      {pending ? "Saving SEO..." : "Save SEO settings"}
    </button>
  );
}