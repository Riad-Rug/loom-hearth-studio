import type { NextConfig } from "next";

import { allowedImageHostnames } from "./lib/media/allowed-image-hosts";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: allowedImageHostnames.map((hostname) => ({
      protocol: "https" as const,
      hostname,
    })),
  },
  typedRoutes: true,
};

export default nextConfig;
