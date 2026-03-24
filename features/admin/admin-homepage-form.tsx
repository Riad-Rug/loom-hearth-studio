"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import { HomepagePreview } from "@/features/admin/admin-homepage-preview";
import {
  GlobalSettingsEditor,
  SectionEditor,
} from "@/features/admin/admin-homepage-editor";
import {
  assignValueAtPath,
  createDefaultAltText,
  createSectionScoreMap,
  readImageAtPath,
  readUploadErrorMessage,
} from "@/features/admin/admin-homepage-utils";
import {
  homepageSectionDefinitions,
  homepageSectionKeys,
  homepageSectionOrderKeys,
  type HomePageContent,
  type HomePageOrderedSectionKey,
  type HomePageSectionKey,
} from "@/features/home/home-page-data";
import {
  initialAdminHomepageActionState,
  type AdminHomepageActionState,
} from "@/lib/admin/homepage-actions-shared";
import { updateAdminHomepageAction } from "@/app/(admin)/admin/homepage/actions";
import type {
  CloudinaryBrowserUploadResult,
  CloudinarySignedUploadPayload,
} from "@/lib/cloudinary/types";

import styles from "./admin.module.css";

type EditorKey = "global" | HomePageSectionKey;
type FocusableElement = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

function buildCloudinaryDeliveryUrl(cloudName: string, publicId: string) {
  return `https://res.cloudinary.com/${cloudName}/image/upload/${publicId}`;
}

const allEditorSections: Array<{ key: EditorKey; label: string; description: string }> = [
  {
    key: "global",
    label: "Global",
    description: "Brand and page-level metadata used outside the section blocks.",
  },
  ...homepageSectionKeys.map((key) => ({ key, ...homepageSectionDefinitions[key] })),
];

export function AdminHomepageForm(props: {
  initialContent: HomePageContent;
  source: "database" | "defaults";
}) {
  const [actionState, formAction] = useActionState<AdminHomepageActionState, FormData>(
    updateAdminHomepageAction,
    initialAdminHomepageActionState,
  );
  const [content, setContent] = useState(() => structuredClone(props.initialContent));
  const [selectedEditor, setSelectedEditor] = useState<EditorKey>("hero");
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const [sessionMessage, setSessionMessage] = useState<string | null>(null);
  const [uploadStates, setUploadStates] = useState<Record<string, { status: "idle" | "uploading" | "success" | "error"; message: string | null }>>({});
  const fieldRefs = useRef<Record<string, FocusableElement | null>>({});

  const sectionScores = useMemo(() => createSectionScoreMap(content), [content]);

  useEffect(() => {
    if (!selectedField) return;
    const node = fieldRefs.current[selectedField];
    if (!node) return;
    node.focus();
  }, [selectedField]);

  function registerField(name: string) {
    return (node: FocusableElement | null) => {
      fieldRefs.current[name] = node;
    };
  }

  function updateContent(mutator: (draft: HomePageContent) => void, message?: string) {
    setContent((current) => {
      const next = structuredClone(current);
      mutator(next);
      return next;
    });
    if (message) setSessionMessage(message);
  }

  function updateField(path: string, value: string | boolean) {
    updateContent((draft) => {
      assignValueAtPath(draft, path, value);
    }, "Preview updated locally. Save to persist changes.");
  }

  function updateSectionVisibility(section: HomePageSectionKey, visible: boolean) {
    updateContent((draft) => {
      draft[section].visible = visible;
    }, `${homepageSectionDefinitions[section].label} visibility updated.`);
  }

  function moveSection(section: HomePageOrderedSectionKey, direction: -1 | 1) {
    updateContent((draft) => {
      const index = draft.sectionOrder.indexOf(section);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= draft.sectionOrder.length) return;
      const nextOrder = [...draft.sectionOrder];
      const [item] = nextOrder.splice(index, 1);
      nextOrder.splice(nextIndex, 0, item);
      draft.sectionOrder = nextOrder;
    }, `${homepageSectionDefinitions[section].label} moved ${direction < 0 ? "up" : "down"} in the homepage structure.`);
  }

  async function handleImageUpload(path: string, file: File) {
    setUploadStates((current) => ({ ...current, [path]: { status: "uploading", message: `Uploading ${file.name}...` } }));

    try {
      const signatureResponse = await fetch("/api/admin/cloudinary/upload-signature", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: "homepage" }),
      });

      const signatureResult = (await signatureResponse.json()) as
        | { status: "ready"; payload: CloudinarySignedUploadPayload }
        | { status: "forbidden" | "invalid-input" | "configuration-error"; message: string };

      if (!signatureResponse.ok || signatureResult.status !== "ready") {
        throw new Error("message" in signatureResult ? signatureResult.message : "Upload signing failed before a Cloudinary payload was returned.");
      }

      const uploadFormData = new FormData();
      uploadFormData.append("file", file);
      uploadFormData.append("api_key", signatureResult.payload.apiKey);
      uploadFormData.append("timestamp", String(signatureResult.payload.timestamp));
      uploadFormData.append("folder", signatureResult.payload.folder);
      uploadFormData.append("signature", signatureResult.payload.signature);

      const uploadResponse = await fetch(signatureResult.payload.uploadUrl, { method: "POST", body: uploadFormData });
      if (!uploadResponse.ok) throw new Error(await readUploadErrorMessage(uploadResponse));

      const uploadResult = (await uploadResponse.json()) as CloudinaryBrowserUploadResult;
      const currentImage = readImageAtPath(content, path);

      updateContent((draft) => {
        assignValueAtPath(draft, path, {
          ...currentImage,
          src:
            uploadResult.secure_url ||
            buildCloudinaryDeliveryUrl(signatureResult.payload.cloudName, uploadResult.public_id),
          publicId: uploadResult.public_id,
          width: uploadResult.width ?? null,
          height: uploadResult.height ?? null,
          alt: currentImage.alt || createDefaultAltText(file.name),
        });
      }, "Image preview updated locally.");

      setUploadStates((current) => ({ ...current, [path]: { status: "success", message: `${file.name} uploaded to Cloudinary and preview updated.` } }));
      setSelectedField(`${path}.alt`);
    } catch (error) {
      setUploadStates((current) => ({ ...current, [path]: { status: "error", message: error instanceof Error ? error.message : "Image upload failed." } }));
    }
  }

  return (
    <form className={styles.homepageWorkspace} action={formAction}>
      <input name="contentJson" type="hidden" value={JSON.stringify(content)} />

      <header className={styles.moduleHeader}>
        <p className={styles.eyebrow}>Admin homepage</p>
        <h2>Homepage workspace</h2>
        <p>Structured section editing, Cloudinary image replacement, internal SEO scoring, and a live homepage preview in one admin surface.</p>
      </header>

      <div className={styles.dashboardStatusBar}>
        <span className={styles.statusPill}>Source: {props.source === "database" ? "Persisted homepage record" : "Default in-repo fallback"}</span>
        <span className={styles.statusPill}>Sections: {content.sectionOrder.length + 1} managed</span>
        <span className={styles.statusPill}>Uploads: Cloudinary signed flow</span>
        <span className={styles.statusPill}>Preview: local live state</span>
      </div>

      {actionState.message ? <div className={actionState.status === "success" ? styles.successPanel : styles.gatePanel}><strong>{actionState.status === "success" ? "Saved" : "Needs attention"}</strong><p>{actionState.message}</p></div> : null}
      {sessionMessage ? <div className={styles.groupPanel}><strong>Workspace status</strong><p>{sessionMessage}</p></div> : null}

      <div className={styles.homepageWorkspaceGrid}>
        <aside className={styles.homepageWorkspaceRail}>
          <div className={styles.groupPanel}>
            <strong>1. Choose a section</strong><p className={styles.workspaceHelper}>Start here. Pick the homepage section you want to edit.</p>
            <div className={styles.homepageSectionList}>{allEditorSections.map((section) => <button key={section.key} className={`${styles.homepageSectionButton} ${selectedEditor === section.key ? styles.homepageSectionButtonActive : ""}`} onClick={() => setSelectedEditor(section.key)} type="button"><span>{section.label}</span><small>{section.description}</small><span className={styles.homepageSectionMeta}>{section.key === "global" ? <><span>Brand</span><span>Page SEO</span></> : <><span>{content[section.key].visible ? "Visible" : "Hidden"}</span><span>SEO {sectionScores[section.key].score}/50</span></>}</span></button>)}</div>
          </div>

          <div className={styles.groupPanel}>
            <strong>Section order</strong>
            <p className={styles.workspaceHelper}>Adjust the public homepage sequence without leaving this workspace.</p>
            <div className={styles.stack}>{content.sectionOrder.map((section, index) => <div key={section} className={styles.homepageOrderRow}><div><strong>{index + 1}. {homepageSectionDefinitions[section].label}</strong><p>{homepageSectionDefinitions[section].description}</p></div><div className={styles.actionRow}><button className={styles.inlineActionLink} onClick={() => moveSection(section, -1)} type="button">Up</button><button className={styles.inlineActionLink} onClick={() => moveSection(section, 1)} type="button">Down</button></div></div>)}</div>
          </div>
        </aside>

        <section className={styles.homepageEditorColumn}>
          <div className={styles.groupPanel}><strong>2. Edit fields</strong><p>{selectedEditor === "global" ? "Global settings control shared brand text and homepage metadata." : `Editing ${homepageSectionDefinitions[selectedEditor].label.toLowerCase()}. ${homepageSectionDefinitions[selectedEditor].description}`}</p><p className={styles.workspaceHelper}>Changes update the preview immediately. Save only when the section looks correct.</p></div>
          {selectedEditor === "global" ? <GlobalSettingsEditor content={content} onChange={updateField} registerField={registerField} /> : <SectionEditor content={content} onChange={updateField} onImageChange={(path, image) => updateContent((draft) => { assignValueAtPath(draft, path, image); }, "Image preview updated locally.")} onImageUpload={handleImageUpload} onVisibilityChange={updateSectionVisibility} registerField={registerField} score={sectionScores[selectedEditor]} selectedSection={selectedEditor} uploadStates={uploadStates} />}
          <div className={styles.actionRow}><SubmitButton /></div>
        </section>

        <section className={styles.homepagePreviewColumn}>
          <div className={styles.groupPanel}><strong>3. Check live preview</strong><p>Use the preview to verify hierarchy and click any text or image target to jump back to the matching field.</p></div>
          <HomepagePreview content={content} selectedSection={selectedEditor === "global" ? null : selectedEditor} onSelect={(section, field) => { setSelectedEditor(section); if (field) setSelectedField(field); }} />
        </section>
      </div>
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return <button className={`${styles.inlineActionLink} ${styles.inlineActionLinkPrimary}`} type="submit">{pending ? "Saving homepage..." : "Save homepage"}</button>;
}






