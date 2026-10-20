import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // A fully static site deployed to Cloudflare (see wrangler.jsonc).
  // Response headers live in public/_headers because `headers()` doesn't apply to exports.
  output: "export",
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
