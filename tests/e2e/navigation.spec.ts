import { expect, test } from "./fixtures";

test.describe("desktop navigation", () => {
  test.skip(({ isMobile }) => isMobile, "the sidebar is the desktop layout");

  test("the sidebar moves between the app's pages", async ({ page }) => {
    await page.goto("/");
    const main = page.getByRole("navigation", { name: "Main" });
    await main.getByRole("link", { name: /Sounds/ }).click();
    await expect(page).toHaveURL(/\/sounds$/);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Ambient sounds and noise for focus");

    await main.getByRole("link", { name: /Timer/ }).click();
    await expect(page).toHaveURL(/\/timer$/);
    await expect(page.getByRole("timer")).toBeVisible();
  });

  test("number keys switch tabs and / jumps to the sound search", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#mix-title")).toBeVisible();
    await page.keyboard.press("3");
    await expect(page).toHaveURL(/\/timer$/);
    await page.keyboard.press("/");
    await expect(page).toHaveURL(/\/sounds$/);
    await expect(page.getByRole("searchbox", { name: /Search sounds/ }).filter({ visible: true })).toBeFocused();
    await page.keyboard.type("campfire");
    await expect(page.getByRole("button", { name: /^Campfire,/ })).toBeVisible();
    await expect(page.getByRole("button", { name: /^Keyboard,/ })).toBeHidden();
  });

  test("groups stay closed except the one holding the current page", async ({ page }) => {
    await page.goto("/");
    const popular = page.locator("aside details", { hasText: "Popular" });
    const explore = page.locator("aside details", { hasText: "Explore" });
    await expect(popular).not.toHaveAttribute("open");
    await expect(explore).not.toHaveAttribute("open");

    await page.goto("/mix");
    await expect(explore).toHaveAttribute("open", "");
    await expect(explore.getByRole("link", { name: "Mixes" })).toHaveAttribute("aria-current", "page");
  });

  test("About & offline is its own page, reached from Explore", async ({ page }) => {
    await page.goto("/sounds/brown-noise");
    await page.locator("aside details", { hasText: "Explore" }).locator("summary").click();
    await page.getByRole("link", { name: /About & offline/ }).click();
    await expect(page).toHaveURL(/\/about$/);
    await expect(page).toHaveTitle(/^About & offline/);
    await expect(page.getByRole("heading", { name: "Made by" })).toBeVisible();
    // The landing page's article doesn't follow you to /about.
    await expect(page.locator("article.page-copy")).toHaveCount(0);
  });

  test("guides read inside the app, with the player still at hand", async ({ page }) => {
    await page.goto("/guides");
    await page.getByRole("link", { name: /Pomodoro Technique/ }).first().click();
    await expect(page).toHaveURL(/\/guides\/pomodoro-technique$/);
    await expect(page.getByRole("navigation", { name: "Main" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Open the mixer" })).toBeVisible();
    // Space scrolls a reading page instead of starting the sound.
    await page.keyboard.press("Space");
    await expect(page.getByRole("button", { name: "Play" }).filter({ visible: true }).first()).toBeVisible();
  });
});

test.describe("phone navigation", () => {
  test.skip(({ isMobile }) => !isMobile, "the tab bar is the phone layout");

  test("the tab bar and mini player replace the sidebar", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("navigation", { name: "Tabs" })).toBeVisible();
    await expect(page.getByRole("navigation", { name: "Main" })).toBeHidden();

    await page.getByRole("navigation", { name: "Tabs" }).getByRole("link", { name: "Sounds" }).click();
    await expect(page).toHaveURL(/\/sounds$/);
    await expect(page.getByRole("button", { name: "Open the mixer" })).toBeVisible();

    await page.getByRole("navigation", { name: "Tabs" }).getByRole("link", { name: "You" }).click();
    await expect(page).toHaveURL(/\/about$/);
  });
});
