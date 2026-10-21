import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// Three projects, one runner:
//   unit        logic and the store, in Node (or jsdom per file, for code that touches the DOM)
//   components  React components with Testing Library, in jsdom
//   site        the built static export in out/: run after `next build` (npm run test:site)
// Whole-page tests in a real browser live in tests/e2e and run under Playwright.
export default defineConfig({
  plugins: [react()],
  resolve: { tsconfigPaths: true },
  test: {
    projects: [
      {
        extends: true,
        test: { name: "unit", include: ["tests/unit/**/*.test.{ts,mjs}"], environment: "node" },
      },
      {
        extends: true,
        test: {
          name: "components",
          include: ["tests/components/**/*.test.tsx"],
          environment: "jsdom",
          setupFiles: ["tests/components/setup.ts"],
        },
      },
      {
        extends: true,
        test: { name: "site", include: ["tests/site/**/*.test.mjs"], environment: "node" },
      },
    ],
  },
});
