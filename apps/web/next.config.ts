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
  // Opt-in local bridge; design writes are limited by the questionnaire-only proxy.
  if (phase !== PHASE_DEVELOPMENT_SERVER || process.env.PRODUCT_SURFACES_DEV_PREVIEW_PROXY !== "true") return nextConfig;
  const port = Number(process.env.PRODUCT_SURFACES_DEV_PREVIEW_API_PORT ?? "5003");
  if (!Number.isInteger(port) || port < 1024 || port > 65535) throw new Error("Invalid local preview API port");
  return {
    ...nextConfig,
    output: undefined,
    // Only the opt-in local preview uses the same-origin catalog bridge.
    env: { NEXT_PUBLIC_COMMERCE_API_URL: process.env.NEXT_PUBLIC_COMMERCE_API_URL || "/api/v1/local-commerce" },
    distDir: ".next/cm101-preview",
    async rewrites() {
      return [
        { source: "/api/v1/dev/cm101-approved/:path*", destination: "http://127.0.0.1:3046/api/v1/dev/cm101-approved/:path*" },
        { source: "/api/v1/local-commerce/:path*", destination: "http://127.0.0.1:5019/api/v1/local-commerce/:path*" },
        { source: "/api/v1/design-studio/:path*", destination: "http://127.0.0.1:5021/api/v1/design-studio/:path*" },
        { source: "/api/v1/design-studio/sessions/:id", destination: "http://127.0.0.1:5013/api/v1/design-studio/sessions/:id" },
        { source: "/api/v1/dev/product-surfaces/commerce/:product/:variant/rendering-inputs/", destination: "http://127.0.0.1:"+port+"/api/v1/dev/product-surfaces/commerce/:product/:variant/rendering-inputs" },
        { source: "/api/v1/design-studio/sessions/:id/image", destination: "http://127.0.0.1:"+port+"/api/v1/design-studio/sessions/:id/image" }, {
        source: "/api/v1/dev/product-surfaces/:product/:variant/rendering-inputs/",
        destination: `http://127.0.0.1:${port}/api/v1/dev/product-surfaces/:product/:variant/rendering-inputs`,
      }];
    },
  };
}
