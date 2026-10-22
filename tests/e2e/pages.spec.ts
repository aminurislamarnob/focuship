import { expect, test } from "./fixtures";

// One representative of each kind of page: each must load without errors (including hydration
// mismatches) and show exactly one H1.
const PAGES = [
  "/",
  "/sounds",
  "/timer",
  "/about",
  "/mix",
  "/sounds-for",
  "/guides",
  "/guides/brown-vs-white-vs-pink-noise",
  "/sounds/brown-noise",
  "/mix/thunderstorm",
  "/pomodoro/25-5",
  "/sounds-for/coding",
  "/privacy",
  "/mcp",
  "/account",
];

for (const path of PAGES) {
  test(`${path} loads cleanly with one H1`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    await expect(page.locator("h1")).toHaveCount(1);
    await page.waitForLoadState("networkidle");
  });
}

test("an unknown address shows the 404 page", async ({ page, errors }) => {
  const response = await page.goto("/no-such-page");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: /doesn.t exist/ })).toBeVisible();
  // The browser logs the 404 itself; that one is expected here.
  const expected = errors.filter((e) => /status of 404/.test(e));
  expect(expected).toHaveLength(1);
  errors.splice(errors.indexOf(expected[0]), 1);
});
