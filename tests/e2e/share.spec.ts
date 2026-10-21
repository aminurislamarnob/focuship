import { expect, test } from "./fixtures";

const openShareSheet = async (page: import("@playwright/test").Page, isMobile: boolean) => {
  if (isMobile) await page.getByRole("button", { name: "Save or share this mix" }).click();
  else await page.getByRole("button", { name: "Share mix" }).click();
  return page.getByRole("dialog");
};

test.describe("share links", () => {
  test("a readable ?mix= link opens that exact mix, then tidies the address bar", async ({ page }) => {
    await page.goto("/?mix=campfire:35,crickets:70");
    await expect(page.locator("#mix-title")).toHaveText("Campfire + Crickets");
    await expect(page).toHaveURL(/\/$/);
  });

  test("an old percent-encoded link still opens", async ({ page }) => {
    await page.goto("/?mix=campfire%3A35%2Ccrickets%3A70");
    await expect(page.locator("#mix-title")).toHaveText("Campfire + Crickets");
  });

  test("the share sheet offers a custom mix as a readable link", async ({ page, isMobile }) => {
    await page.goto("/?mix=campfire:35,crickets:70");
    const sheet = await openShareSheet(page, isMobile);
    await expect(sheet.getByText(/\/\?mix=campfire:35,crickets:70$/)).toBeVisible();
  });

  test("an untouched preset shares its own page, which opens that preset", async ({ page, isMobile }) => {
    await page.goto("/?preset=rainy-desk");
    await expect(page.locator("#mix-title")).toHaveText("Rainy desk");
    const sheet = await openShareSheet(page, isMobile);
    await expect(sheet.getByText(/\/mix\/rainy-desk$/)).toBeVisible();

    await page.goto("/mix/rainy-desk");
    await expect(page).toHaveTitle(/^Rainy desk/);
    await expect(page.locator("#mix-title")).toHaveText("Rainy desk");
  });

  test("Copy link puts the link on the clipboard", async ({ page, context, isMobile, browserName }) => {
    test.skip(browserName !== "chromium", "clipboard permissions are Chromium-only");
    await context.grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto("/?mix=campfire:35,crickets:70");
    const sheet = await openShareSheet(page, isMobile);
    await sheet.getByRole("button", { name: /Copy link/ }).click();
    await expect(sheet.getByRole("button", { name: /Copied/ })).toBeVisible();
    expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/\?mix=campfire:35,crickets:70$/);
  });
});
