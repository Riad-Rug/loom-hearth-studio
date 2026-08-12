"use client";

import { useEffect, useState } from "react";

import { BlogPostPageView } from "@/features/blog/blog-post-page-view";
import { sanitizeBlogPost, type BlogPostRecord } from "@/features/blog/blog-post-data";
import type { BlogAuthor } from "@/types/domain";

type BlogPreviewClientProps = {
  author: BlogAuthor;
};

type PreviewUpdateMessage = {
  type: "preview-update";
  post: unknown;
};

export function BlogPreviewClient({ author }: BlogPreviewClientProps) {
  const [draft, setDraft] = useState<BlogPostRecord | null>(null);

  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      if (event.origin !== window.location.origin) {
        return;
      }

      if (!isPreviewUpdateMessage(event.data)) {
        return;
      }

      setDraft(sanitizeBlogPost(event.data.post));
    }

    window.addEventListener("message", handleMessage);
    window.parent.postMessage({ type: "preview-ready" }, window.location.origin);

    return () => window.removeEventListener("message", handleMessage);
  }, []);

  if (!draft) {
    return (
      <div style={{ padding: "6rem 1.5rem", textAlign: "center" }}>
        <p>Waiting for the admin editor to send a preview…</p>
      </div>
    );
  }

  return <BlogPostPageView author={author} post={draft} />;
}

function isPreviewUpdateMessage(value: unknown): value is PreviewUpdateMessage {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    (value as { type?: unknown }).type === "preview-update"
  );
}
