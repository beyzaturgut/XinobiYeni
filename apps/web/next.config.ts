import type { NextConfig } from "next";
import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default function config(phase: string): NextConfig {
  // Read-only local bridge. Static production exports have no backend proxy.
  if (phase !== PHASE_DEVELOPMENT_SERVER || process.env.PRODUCT_SURFACES_DEV_PREVIEW_PROXY !== "true") return nextConfig;
  const port = Number(process.env.PRODUCT_SURFACES_DEV_PREVIEW_API_PORT ?? "5003");
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid local preview API port");
  return {
    ...nextConfig,
    output: undefined,
    distDir: ".next/product-surfaces-preview",
    async rewrites() {
      return [{
        source: "/api/v1/dev/product-surfaces/:product/:variant/rendering-inputs/",
        destination: `http://127.0.0.1:${port}/api/v1/dev/product-surfaces/:product/:variant/rendering-inputs`,
      }];
    },
  };
}
