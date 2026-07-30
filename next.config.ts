import type { NextConfig } from "next";
import path from "node:path";

const blake3BrowserShim = path.resolve(
  process.cwd(),
  "lib/blake3-browser-shim.ts",
);

const nextConfig: NextConfig = {
  serverExternalPackages: ["pdf-parse", "@napi-rs/canvas"],
  turbopack: {
    resolveAlias: {
      "blake3-wasm/browser.js": "./lib/blake3-browser-shim.ts",
    },
  },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "blake3-wasm/browser.js": blake3BrowserShim,
    };
    return config;
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin",
          },
          {
            key: "Cross-Origin-Embedder-Policy",
            value: "require-corp",
          },
        ],
      },
      {
        source: "/siglum-worker.js",
        headers: [
          {
            key: "Cross-Origin-Resource-Policy",
            value: "same-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
