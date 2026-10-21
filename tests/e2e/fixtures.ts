import { test as base, expect, type Page } from "@playwright/test";

/**
 * Every page test fails on an uncaught error or a console error, which is where React reports
 * hydration mismatches in a production build.
 */
export const test = base.extend<{ errors: string[] }>({
  errors: [
    async ({ page }, use) => {
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      page.on("console", (message) => {
        if (message.type() === "error") errors.push(message.text());
      });
      await use(errors);
      expect(errors, "no errors in the page").toEqual([]);
    },
    { auto: true },
  ],
});

export { expect };

/** Seeds localStorage before the app loads, as a returning visitor's browser would have it. */
export async function returningVisitor(page: Page, saved: object) {
  await page.addInitScript((value) => {
    if (!localStorage.getItem("focuship:v1")) localStorage.setItem("focuship:v1", value);
  }, JSON.stringify(saved));
}

/** The big play/pause button on the player card (one per layout; the other is hidden). */
export const playButton = (page: Page) =>
  page
    .locator("section", { has: page.locator("#mix-title") })
    .getByRole("button", { name: /^(Play|Pause)$/ })
    .filter({ visible: true });
