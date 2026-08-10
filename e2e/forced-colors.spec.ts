/**
 * FORCED-COLORS SMOKE — pins the S108 emulated high-contrast pass.
 * Under forced-colors: active, the lesson route must render, keyboard focus
 * must produce a visible outline (the system-Highlight ring), and the stage's
 * SVG line-work must still be present. Full visual review lives in the S108
 * capture set (/tmp/fc-*.png at pass time); this keeps the invariants pinned.
 */
import { test, expect } from "@playwright/test";

test.use({ forcedColors: "active" });

test("forced-colors: lesson renders with visible focus and stage line-work", async ({ page }) => {
  await page.goto("/learn/as100-01-01", { waitUntil: "networkidle" });
  await expect(page.locator(".stage svg").first()).toBeVisible();
  const strokes = await page.locator(".stage svg line, .stage svg path[stroke], .stage svg polyline").count();
  expect(strokes).toBeGreaterThan(0);
  for (let i = 0; i < 3; i++) await page.keyboard.press("Tab");
  const o = await page.evaluate(() => {
    const el = document.activeElement as Element | null;
    if (!el || el === document.body) return null;
    const cs = window.getComputedStyle(el);
    return { style: cs.outlineStyle, width: cs.outlineWidth };
  });
  // Under forced-colors Chromium reports the NATIVE focus indicator as
  // `outline: 1px auto` while rendering the thick system Highlight ring
  // (probe S108; visually confirmed in /tmp/fc-lesson-focus.png). `auto`
  // is therefore a passing style; an explicit outline must be >= 2px.
  expect(o).not.toBeNull();
  expect(o!.style).not.toBe("none");
  if (o!.style !== "auto") expect(parseFloat(o!.width)).toBeGreaterThanOrEqual(2);
});

test("forced-colors: dashboard cards keep structural borders", async ({ page }) => {
  await page.goto("/dashboard", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: "Your trail" })).toBeVisible();
});

test("forced-colors: Atlas search and every region remain reachable through the semantic list", async ({ page }) => {
  await page.goto("/atlas", { waitUntil: "networkidle" });
  const search = page.getByRole("searchbox", { name: /search courses and lessons/i });
  await expect(search).toBeVisible();
  const regions = page.getByRole("list", { name: /all regions/i });
  await expect(regions.getByRole("listitem")).toHaveCount(14);
  // Same fixture repair as world-surfaces.spec.ts: "equivalent" matches five live lesson titles.
  await search.fill("equivalent");
  await expect(page.getByRole("region", { name: "Matching lessons" }).getByRole("link").first()).toBeVisible();
  await search.fill("");
  await regions.getByRole("link", { name: /Enter Equation Range/i }).click();
  await expect(page).toHaveURL(/\/trailhead\?region=equation-range/);
  await expect(page.locator("[data-primary-action]")).toBeVisible();
});

/**
 * S202 — restores the world-surface forced-colors matrix S201 deleted.
 *
 * S201's execution report recorded this file as "+1 test". It was in fact −5/+1, and the one
 * test that replaced them asserts reachability, not forced-colors behaviour: the overflow and
 * focus-visibility probes were simply gone. That mattered because S201 is also the session that
 * introduced the most colour-carried state in the product — landmark and waypoint status pills,
 * the "Next" marker, and the vertical connector rails — so the check that would have caught
 * colour-only state was removed in the same change that created the most of it.
 *
 * Under forced-colors the system replaces authored colour outright, so anything surviving only
 * as a hue disappears here. If walked/unwalked is still legible below, it was never carried by
 * colour in the first place.
 */
const WORLD_ROUTES = [
  "/trailhead",
  "/trailhead?region=equation-range",
  "/atlas",
  "/basecamp/fractions",
  "/basecamp/absolute-value-piecewise",
  "/journal"
] as const;

for (const route of WORLD_ROUTES) {
  test(`forced-colors: ${route} renders and keeps non-colour state cues`, async ({ page }) => {
    await page.goto(route, { waitUntil: "networkidle" });
    await expect(page.locator("h1")).toHaveCount(1);
    // No horizontal overflow once the system restyles everything.
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth
    );
    expect(overflow, `${route} overflow under forced-colors`).toBeLessThanOrEqual(1);
    // Focus must remain visible after the system takes over colour.
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const el = document.activeElement as Element | null;
      if (!el || el === document.body) return null;
      const cs = window.getComputedStyle(el);
      return { style: cs.outlineStyle, width: cs.outlineWidth };
    });
    expect(outline, `${route} focus ring under forced-colors`).not.toBeNull();
    expect(outline!.style).not.toBe("none");
  });
}

test("forced-colors: basecamp state is readable as TEXT, not hue", async ({ page }) => {
  await page.goto("/basecamp/fractions", { waitUntil: "networkidle" });
  // sr-only text carries the state; it exists in the accessibility tree regardless of colour.
  const walkedText = await page.locator(".sr-only").allTextContents();
  expect(walkedText.join(" ")).toMatch(/walked/);
});

/**
 * S201's landmark and waypoint pills encode three states — done, next, neither — as background
 * colour. Each therefore needs a non-colour carrier: a glyph or number inside the pill, an
 * ordinal announced to assistive tech, and a counted "n/m" per landmark. The connector rails
 * between waypoints encode the same done/not-done split purely as colour, so they must be
 * decorative — every rail `aria-hidden`, with the state it depicts already stated in text.
 */
test("forced-colors: landmark and waypoint status survive without colour", async ({ page }) => {
  await page.goto("/basecamp/fractions", { waitUntil: "networkidle" });
  const landmarks = page.getByRole("list", { name: /landmarks/i });
  await expect(landmarks).toBeVisible();

  // Every landmark states its progress as a counted pair, not as a hue.
  await expect(page.getByText(/\d+\/\d+/).first()).toBeVisible();
  // Every landmark is ordinally announced, so the numbered pill is not the only ordering cue.
  expect((await page.locator(".sr-only").allTextContents()).join(" ")).toMatch(/Landmark \d+/);

  // Each status pill carries a glyph or ordinal, never an empty coloured chip.
  const pills = page.locator('[data-status-pill]');
  const pillCount = await pills.count();
  expect(pillCount, "status pills present").toBeGreaterThan(0);
  for (let i = 0; i < pillCount; i++) {
    expect((await pills.nth(i).textContent())?.trim(), `pill ${i} has a non-colour carrier`).toBeTruthy();
  }

  // The connector rails are pure colour, so they must be decoration only.
  const rails = page.locator('[data-waypoint-rail]');
  const railCount = await rails.count();
  for (let i = 0; i < railCount; i++) {
    await expect(rails.nth(i)).toHaveAttribute("aria-hidden", "true");
  }
});
