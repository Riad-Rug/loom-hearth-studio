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
  async redirects() {
    return [
      { source: "/checkout/information", destination: "/checkout", permanent: false },
      { source: "/checkout/success", destination: "/checkout/confirmation", permanent: false },
    ];
  },
};

export default nextConfig;
