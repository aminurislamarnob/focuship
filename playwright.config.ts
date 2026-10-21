import { defineConfig, devices } from "@playwright/test";

const PORT = 4173;

// Whole-page tests against the production build: run `next build` first (npm run test:e2e does
// not build; npm test and CI build once and run every layer against that out/).
export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["github"], ["list"]] : "list",
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    // The same static server `npm start` uses, so clean URLs (/about → about.html) resolve as on Cloudflare.
    command: `npx -y serve@14.2.4 out -l ${PORT}`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: !process.env.CI,
  },
});
