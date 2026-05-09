"use client";

import { Agentation } from "agentation";
import { useEffect, useState } from "react";

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

  return <Agentation />;
}
