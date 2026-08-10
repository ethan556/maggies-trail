// Session 127 behavioral evidence: capture the lesson player in the exact states
// guarded by the adversarial Playwright matrix. The production server must be
// live on :3100; the canonical browser runner supplies Chromium and this script.
const { chromium } = require("@playwright/test");
const { mkdirSync, writeFileSync } = require("node:fs");
const { resolve } = require("node:path");

const OUT = resolve(process.env.SESSION127_SCREENSHOT_DIR || "SESSION127_SCREENSHOTS");
const BASE = process.env.PW_BASE_URL || "http://127.0.0.1:3100";
const AS100 = { id: "as100-01-01", stepIds: ["c1", "i1", "k1", "c2", "i2", "k2", "k3", "ch1", "r1"] };
const FNA = { id: "fna-03-02", stepIds: ["c1", "i1", "c2", "k1", "k2", "k3", "ch1", "r1"] };
const profile = (extra = {}) => ({ xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [], ...extra });

async function clear(page) {
  await page.goto(BASE, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => localStorage.clear());
}
async function seed(page, lesson, i, storedProfile = profile(), sessionXp = 0) {
  await clear(page);
  await page.evaluate(({ lesson, i, storedProfile, sessionXp }) => {
    localStorage.setItem(`numera:lesson:v1:c1:${lesson.id}`, JSON.stringify({
      v: 1, lessonId: lesson.id, stepIds: lesson.stepIds, i, sessionXp,
      history: [], injected: [], predictions: [], signalCounts: {}, remediated: [],
      savedAt: "2026-07-28T12:00:00.000Z"
    }));
    localStorage.setItem("numera:profile:v1:c1", JSON.stringify(storedProfile));
  }, { lesson, i, storedProfile, sessionXp });
}
async function capture(browser, spec) {
  const context = await browser.newContext({ viewport: spec.viewport, reducedMotion: spec.reducedMotion || "no-preference" });
  const page = await context.newPage();
  if (spec.prepare) await spec.prepare(page);
  await page.goto(`${BASE}${spec.route}`, { waitUntil: "networkidle", timeout: 45_000 });
  if (spec.act) await spec.act(page);
  await page.locator("[data-player-phase]").waitFor({ state: "visible" });
  const metrics = await page.evaluate(() => ({
    phase: document.querySelector("[data-player-phase]")?.getAttribute("data-player-phase"),
    step: document.querySelector("[data-player-phase]")?.getAttribute("data-step-id"),
    hOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    width: innerWidth,
    height: innerHeight
  }));
  await page.screenshot({ path: resolve(OUT, `${spec.name}.png`), fullPage: false });
  await context.close();
  return { name: spec.name, ...metrics };
}

(async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM_EXE || "/tmp/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"]
  });
  const specs = [
    {
      name: "phone-390-prediction",
      viewport: { width: 390, height: 844 }, route: `/learn/${AS100.id}`,
      prepare: clear,
      act: async (page) => { await page.keyboard.press("Enter"); await page.getByText("Make a prediction first").waitFor(); }
    },
    {
      name: "phone-390-retry-preserved",
      viewport: { width: 390, height: 844 }, route: `/learn/${AS100.id}`,
      prepare: (page) => seed(page, AS100, 2),
      act: async (page) => { const input = page.getByRole("textbox", { name: "8 + 8 = ?" }); await input.fill("15"); await page.getByRole("button", { name: "Check" }).click(); }
    },
    {
      name: "desktop-reveal-contrast",
      viewport: { width: 1440, height: 900 }, route: `/learn/${AS100.id}`,
      prepare: (page) => seed(page, AS100, 2),
      act: async (page) => { const input = page.getByRole("textbox", { name: "8 + 8 = ?" }); await input.fill("15"); await page.getByRole("button", { name: "Check" }).click(); await page.getByRole("button", { name: "Try again" }).click(); await page.getByRole("button", { name: "Check" }).click(); }
    },
    {
      name: "short-landscape-xl-feedback",
      viewport: { width: 844, height: 390 }, route: `/learn/${FNA.id}`,
      prepare: (page) => seed(page, FNA, 6, profile({ textScale: "xl" })),
      act: async (page) => { const input = page.getByRole("textbox", { name: "For what x does p(x) = 9? (Enter the only valid solution.)" }); await input.fill("4"); await page.getByRole("button", { name: "Check" }).click(); }
    },
    {
      name: "tablet-resume",
      viewport: { width: 768, height: 1024 }, route: `/learn/${AS100.id}`,
      prepare: (page) => seed(page, AS100, 2, profile(), 17)
    },
    {
      name: "desktop-completion",
      viewport: { width: 1440, height: 900 }, route: `/learn/${AS100.id}`,
      prepare: (page) => seed(page, AS100, 8, profile(), 42),
      act: async (page) => { await page.keyboard.press("Enter"); await page.getByRole("heading", { name: "Trail complete!" }).waitFor(); }
    }
  ];
  const results = [];
  for (const spec of specs) {
    const result = await capture(browser, spec);
    results.push(result);
    console.log(`${result.name} ${result.width}x${result.height} phase:${result.phase} step:${result.step || "done"} hOverflow:${result.hOverflow}px`);
  }
  await browser.close();
  writeFileSync(resolve(OUT, "manifest.json"), JSON.stringify({ generatedAt: new Date().toISOString(), captures: results }, null, 2) + "\n");
  console.log(`SESSION127_SHOTS_DONE:${results.length}`);
})().catch((error) => {
  console.error("SESSION127_SHOTS_FATAL", error);
  process.exit(1);
});
