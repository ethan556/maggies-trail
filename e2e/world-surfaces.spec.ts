/**
 * SESSION 200 PHASE C/D — world surfaces in a real browser.
 *
 * Covers what unit tests structurally cannot: real layout at the two viewport extremes the
 * phase plan names (360×800 and 1440×900), real horizontal-overflow measurement, and the
 * reduced-motion path. The overflow assertion is the important one — the Atlas map is the
 * first wide SVG in the product, and a map that forces the whole page to scroll sideways on a
 * 360px phone is the classic way a "responsive" world surface ships broken.
 */
import { test, expect, type Page } from "@playwright/test";

const ROUTES = ["/trailhead", "/trailhead?region=equation-range", "/atlas", "/basecamp/fractions", "/basecamp/absolute-value-piecewise", "/journal"] as const;
const VIEWPORTS = [
  { name: "phone-360", width: 360, height: 800 },
  { name: "desktop-1440", width: 1440, height: 900 }
] as const;

async function horizontalOverflow(page: Page): Promise<number> {
  return page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
}

for (const vp of VIEWPORTS) {
  for (const route of ROUTES) {
    test(`world[${vp.name}]: ${route} renders with no horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width: vp.width, height: vp.height });
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await horizontalOverflow(page), `${route} at ${vp.name}`).toBeLessThanOrEqual(1);
    });
  }
}

test("atlas: the map is decorative and the region list carries every region", async ({ page }) => {
  await page.goto("/atlas");
  const list = page.getByRole("list", { name: /all regions/i });
  await expect(list.getByRole("listitem")).toHaveCount(14);
  // the SVG must not be announced — the list is the semantic path (§28)
  await expect(page.locator("svg[aria-hidden='true']").first()).toBeAttached();
});

test("trailhead: exactly one dominant action, reachable by keyboard", async ({ page }) => {
  await page.goto("/trailhead");
  const primary = page.getByRole("link", { name: /Continue trail|Begin expedition|Repair this route|Open the Atlas/ });
  await expect(primary).toHaveCount(1);
  await page.keyboard.press("Tab");
  const focused = await page.evaluate(() => document.activeElement?.tagName ?? "");
  expect(["A", "BUTTON"]).toContain(focused);
});

test("theme modes change presentation without removing any link", async ({ page }) => {
  await page.goto("/atlas");
  const hrefsIn = async (): Promise<string[]> =>
    (await page.locator("a[href]").evaluateAll((els) => els.map((e) => e.getAttribute("href") ?? ""))).sort();
  const guided = await hrefsIn();
  await expect(page.locator("[data-region-map]")).toHaveCount(1); // guided draws the map
  await page.goto("/trailhead");
  await page.getByRole("radio", { name: /Minimal/ }).click();
  await page.goto("/atlas");
  const minimal = await hrefsIn();
  expect(minimal).toEqual(guided);
  // presentation DID change: minimal drops the map (targeted, not "no aria-hidden svg
  // anywhere" — the nav icons are aria-hidden SVGs too, which is correct for them)
  await expect(page.locator("[data-region-map]")).toHaveCount(0);
});

test.describe("reduced motion", () => {
  test.use({ reducedMotion: "reduce" });
  test("world surfaces render their final state with motion disabled", async ({ page }) => {
    for (const route of ROUTES) {
      await page.goto(route);
      await expect(page.locator("h1")).toHaveCount(1);
      expect(await horizontalOverflow(page)).toBeLessThanOrEqual(1);
    }
  });
});


test("atlas search reaches a non-pilot course and a lesson title", async ({ page }) => {
  await page.goto("/atlas");
  const search = page.getByRole("searchbox", { name: /search courses and lessons/i });
  await search.fill("Absolute Value & Piecewise");
  await expect(page.getByRole("region", { name: "Matching courses" }).getByRole("link").first()).toBeVisible();
  // "equivalent" matches five lesson titles across four courses (verified against the live corpus);
  // the previous fixture "Equivalent Fractions" was a single title that no longer exists, and a
  // one-title fixture is what made this spec stale. Substring search over titles is still exercised.
  await search.fill("equivalent");
  await expect(page.getByRole("region", { name: "Matching lessons" }).getByRole("link").first()).toBeVisible();
});

test("filtering the Atlas marks regions instead of removing them", async ({ page }) => {
  await page.goto("/atlas");
  const list = page.getByRole("list", { name: /all regions/i });
  await expect(list.getByRole("listitem")).toHaveCount(14);
  await page.getByRole("combobox", { name: "Grade" }).selectOption({ label: "Grade 3" });
  // The map and the list keep all fourteen; only the marking changes. A map whose regions
  // disappear as you type has stopped being a map.
  await expect(list.getByRole("listitem")).toHaveCount(14);
  await expect(list.locator('[data-matched="true"]')).toHaveCount(1);
  await expect(list.locator('[data-matched="false"]').first()).toContainText(/No matches here/i);
  await expect(page.locator("[data-region-point]")).toHaveCount(14);
  await expect(page.getByRole("status")).toContainText(/of 14 regions/);
});

test("grayscale world retains labels, controls and non-colour state", async ({ page }) => {
  await page.goto("/atlas");
  await page.addStyleTag({ content: "html { filter: grayscale(1) !important; }" });
  const list = page.getByRole("list", { name: /all regions/i });
  await expect(list.getByRole("listitem")).toHaveCount(14);
  await expect(list.getByRole("link", { name: /Enter Pattern Valley/i })).toBeVisible();
  await page.goto("/basecamp/fractions");
  await page.addStyleTag({ content: "html { filter: grayscale(1) !important; }" });
  await expect(page.getByText(/not yet walked|walked/).first()).toBeAttached();
  await page.screenshot({ path: test.info().outputPath("world-grayscale.png"), fullPage: true });
});

test("adult surfaces remain restrained and outside the learner world shell", async ({ page }) => {
  for (const [route, heading] of [["/family", "Family"], ["/teach", "Teach"]] as const) {
    await page.goto(route);
    await expect(page.getByRole("heading", { name: heading }).first()).toBeVisible();
    await expect(page.locator("[data-region-map]")).toHaveCount(0);
  }
});
