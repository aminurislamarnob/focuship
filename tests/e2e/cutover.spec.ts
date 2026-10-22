import { expect, playButton, returningVisitor, test } from "./fixtures";

/**
 * Accounts moved to the Focuship API and started fresh (ADR 0001). For a listener
 * without an account nothing changed at all, and that is what this guards: the cache
 * the old backend left behind must not leak into the app or break a thing.
 */
test.describe("after the accounts cutover", () => {
  /** What a signed-in listener's browser held on the day of the move. */
  const savedByTheOldBackend = {
    layers: { campfire: 0.35, crickets: 0.7 },
    volume: 0.4,
    recents: ["night-camp"],
    account: {
      user: { id: "9f8e7d6c-1111-2222-3333-444455556666", email: "ada@example.com", name: "Ada", avatarUrl: null },
      favorites: ["deep-work"],
      presets: [{ id: "abc", label: "Old preset", layers: { cafe: 0.5 }, isPublic: false }],
    },
  };

  test("a returning listener keeps their mix and can still play it", async ({ page }) => {
    await returningVisitor(page, savedByTheOldBackend);
    await page.goto("/");

    await expect(page.locator("#mix-title")).toHaveText("Campfire + Crickets");

    await playButton(page).click();
    await expect(playButton(page)).toHaveAccessibleName("Pause");
  });

  test("the account the old backend cached is gone, with nothing to dismiss", async ({ page }) => {
    await returningVisitor(page, savedByTheOldBackend);
    await page.goto("/account");

    await expect(page.getByText("ada@example.com")).toHaveCount(0);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  });

  test("guest sharing is untouched", async ({ page }) => {
    await returningVisitor(page, savedByTheOldBackend);
    await page.goto("/?mix=rain-on-window:60,keyboard:30");

    await expect(page.locator("#mix-title")).toHaveText("On the window + Keyboard");
    await expect(page).toHaveURL(/\/$/);
  });
});
