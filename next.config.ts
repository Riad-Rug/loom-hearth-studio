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
      { source: "/search", destination: "/shop", permanent: true },
      {
        source: "/trade/apply",
        destination: "/contact?inquiryType=trade-request",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
