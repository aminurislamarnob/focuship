import { expect, playButton, returningVisitor, test } from "./fixtures";

test.describe("the mixer", () => {
  test("a first visit opens on a preset, not an empty mixer", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("#mix-title")).not.toHaveText("Pick a soundscape");
    await expect(playButton(page)).toBeVisible();
  });

  test("plays and pauses", async ({ page }) => {
    await page.goto("/");
    await playButton(page).click();
    await expect(playButton(page)).toHaveAccessibleName("Pause");
    await playButton(page).click();
    await expect(playButton(page)).toHaveAccessibleName("Play");
  });

  test("a returning visitor gets their mix back", async ({ page }) => {
    await returningVisitor(page, { layers: { campfire: 0.35, crickets: 0.7 } });
    await page.goto("/");
    await expect(page.locator("#mix-title")).toHaveText("Campfire + Crickets");
  });

  test("the saved mix appears without first flashing the empty default", async ({ page }) => {
    await returningVisitor(page, { layers: { campfire: 0.35, crickets: 0.7 } });
    // Records the player title on every DOM change while the views are visible (gate open).
    await page.addInitScript(() => {
      const seen: string[] = [];
      (window as unknown as { seenTitles: string[] }).seenTitles = seen;
      new MutationObserver(() => {
        const title = document.getElementById("mix-title");
        const gate = title?.closest(".await-state");
        if (title && gate?.hasAttribute("data-ready")) seen.push(title.textContent ?? "");
      }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
    });
    await page.goto("/");
    await expect(page.locator("#mix-title")).toHaveText("Campfire + Crickets");
    const seen = await page.evaluate(() => (window as unknown as { seenTitles: string[] }).seenTitles);
    expect(seen.length).toBeGreaterThan(0);
    expect(seen).not.toContain("Pick a soundscape");
  });

  test("keeps the player card the same height for a short or long title", async ({ page }) => {
    await returningVisitor(page, { layers: { campfire: 0.35 } });
    await page.goto("/");
    const card = page.locator("section", { has: page.locator("#mix-title") });
    const short = (await card.boundingBox())!.height;
    await page.evaluate(() => {
      localStorage.setItem("focuship:v1", JSON.stringify({ layers: {} }));
    });
    await page.reload();
    await expect(page.locator("#mix-title")).toHaveText("Pick a soundscape");
    expect((await card.boundingBox())!.height).toBeCloseTo(short, 1);
  });

  test("opens focus mode with V and closes it with Escape", async ({ page, isMobile }) => {
    test.skip(isMobile, "keyboard shortcuts are for keyboards");
    await page.goto("/");
    await expect(playButton(page)).toBeVisible();
    await page.keyboard.press("v");
    await expect(page.getByRole("dialog", { name: "Focus mode" })).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog", { name: "Focus mode" })).toBeHidden();
  });
});
