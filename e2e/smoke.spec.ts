import { expect, test } from "@playwright/test";

test("dashboard and catalog render without fatal errors", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page.locator("body")).toBeVisible();
  await page.goto("/courses");
  await expect(page.getByRole("heading", { name: /courses/i })).toBeVisible();
});

test("a registered lesson opens in the lesson player", async ({ page }) => {
  await page.goto("/learn/kc-01-01");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("body")).not.toContainText(/application error|internal server error/i);
});

test("daily API rejects impossible dates", async ({ request }) => {
  const bad = await request.get("/api/daily?date=2026-02-31&grade=3");
  expect(bad.status()).toBe(400);
});
