"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

const Agentation = dynamic(
  () =>
    import("agentation").then(
      (module) => module.Agentation ?? module.PageFeedbackToolbarCSS ?? module.default,
    ),
  { ssr: false },
);

export function AgentationDevtools() {
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    const hostname = window.location.hostname;
    const isLocalHost =
      hostname === "localhost" || hostname === "127.0.0.1" || hostname.startsWith("172.");

    setShouldRender(process.env.NODE_ENV === "development" || isLocalHost);
  }, []);

  if (!shouldRender) {
    return null;
  }

  return <Agentation className="agentation-devtools" />;
}
