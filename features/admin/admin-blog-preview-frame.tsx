"use client";

import { useEffect, useRef, useState } from "react";

import { toPreviewPost } from "@/features/blog/blog-post-preview-adapter";
import type { AdminBlogPostFormValues } from "@/lib/admin/blog-posts";

import styles from "./admin.module.css";

type AdminBlogPreviewFrameProps = {
  draft: AdminBlogPostFormValues;
};

const widthPresets = {
  desktop: "100%",
  tablet: "834px",
  mobile: "390px",
} as const;

type WidthPreset = keyof typeof widthPresets;

export function AdminBlogPreviewFrame({ draft }: AdminBlogPreviewFrameProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isPreviewReady, setIsPreviewReady] = useState(false);
  const [widthPreset, setWidthPreset] = useState<WidthPreset>("desktop");

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if ((event.data as { type?: unknown })?.type === "preview-ready") {
        setIsPreviewReady(true);
      }
    }

    window.addEventListener("message", handleMessage);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  useEffect(() => {
    if (!isPreviewReady || !iframeRef.current?.contentWindow) {
      return;
    }

    iframeRef.current.contentWindow.postMessage(
      { type: "preview-update", post: toPreviewPost(draft) },
      window.location.origin,
    );
  }, [draft, isPreviewReady]);

  return (
    <div className={styles.blogPreviewFrameShell}>
      <div className={styles.blogPreviewToolbar}>
        <span className={styles.statusPill}>
          {isPreviewReady ? "Live preview" : "Loading preview…"}
        </span>
        <div className={styles.blogPreviewWidthToggle}>
          {(Object.keys(widthPresets) as WidthPreset[]).map((preset) => (
            <button
              className={
                preset === widthPreset
                  ? styles.blogPreviewWidthButtonActive
                  : styles.blogPreviewWidthButton
              }
              key={preset}
              onClick={() => setWidthPreset(preset)}
              type="button"
            >
              {preset.charAt(0).toUpperCase() + preset.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className={styles.blogPreviewViewport}>
        <iframe
          className={styles.blogPreviewIframe}
          onLoad={() => setIsPreviewReady(false)}
          ref={iframeRef}
          src="/blog-preview"
          style={{ width: widthPresets[widthPreset] }}
          title="Live blog post preview"
        />
      </div>
    </div>
  );
}
