/**
 * S201 low-end proxy. Chromium runs the rolled-out Atlas and a non-pilot Trailhead under 4× CPU
 * throttling while Playwright records a trace. This is not a substitute for real low-end
 * hardware, but it closes the pilot's unmeasured CPU question with a reproducible bound.
 */
import { test, expect } from "@playwright/test";

test("world surfaces remain responsive under 4x CPU throttling", async ({ page, context, browserName }, testInfo) => {
  test.skip(browserName !== "chromium", "CDP CPU throttling is Chromium-only");
  const cdp = await context.newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  // playwright.config sets trace:"retain-on-failure", which has ALREADY started tracing on this
  // context; a second start() throws. Discard the harness trace and record this test-owned one,
  // which is attached unconditionally below (the harness trace would only survive a failure).
  await context.tracing.stop().catch(() => undefined);
  await context.tracing.start({ screenshots: true, snapshots: true, sources: true });
  const started = Date.now();
  await page.goto("/atlas", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Learner Atlas" })).toBeVisible();
  await expect(page.getByRole("list", { name: /all regions/i }).getByRole("listitem")).toHaveCount(14);
  await page.goto("/trailhead?region=equation-range", { waitUntil: "networkidle" });
  await expect(page.locator("[data-primary-action]")).toBeVisible();
  const elapsedMs = Date.now() - started;
  const tracePath = testInfo.outputPath("world-cpu-4x-trace.zip");
  await context.tracing.stop({ path: tracePath });
  await testInfo.attach("4x CPU world trace", { path: tracePath, contentType: "application/zip" });
  expect(elapsedMs, "Atlas plus non-pilot Trailhead at 4x CPU").toBeLessThan(12_000);
});
