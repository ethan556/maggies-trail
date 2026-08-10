// S121 Phase-0 screenshots: representative lesson per band × five viewport classes.
// Uses playwright-core API from @playwright/test with the sparticuz chromium binary.
// Server must already be live on :3100 (verified 200 by the caller).
const { chromium } = require("@playwright/test");
const { mkdirSync } = require("node:fs");

const VIEWPORTS = [
  [360, 800],
  [390, 844],
  [768, 1024],
  [1024, 768],
  [1440, 900],
];
// Representative lessons: K–2 counting, G3 multiplication, G5 decimals, G7 equations,
// Algebra 1 linear functions, Geometry construction, Statistics sampling, Calculus secant.
const ROUTES = [
  ["k2", "/learn/kc-02-03"],
  ["g3", "/learn/mult-04-01"],
  ["g5", "/learn/dop-04-02"],
  ["g7", "/learn/tse-02-01"],
  ["alg1", "/learn/lf-01-02"],
  ["geo", "/learn/cp-04-03"],
  ["stats", "/learn/sp-02-01"],
  ["calc", "/learn/dc-01-02"],
  ["home", "/"],
  ["gallery", "/dev/widgets"],
];

(async () => {
  mkdirSync("/tmp/shots", { recursive: true });
  const browser = await chromium.launch({
    executablePath: process.env.PW_CHROMIUM_EXE || "/tmp/chromium",
    args: ["--no-sandbox", "--disable-gpu", "--disable-dev-shm-usage"],
  });
  for (const [w, h] of VIEWPORTS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: h } });
    const page = await ctx.newPage();
    for (const [name, route] of ROUTES) {
      // gallery only at desktop; lessons at all sizes
      if (name === "gallery" && w < 1024) continue;
      try {
        const resp = await page.goto(`http://localhost:3100${route}`, { waitUntil: "networkidle", timeout: 30000 });
        const status = resp ? resp.status() : 0;
        // detect horizontal overflow — the 360px acid test
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth
        );
        await page.screenshot({ path: `/tmp/shots/${name}-${w}x${h}.png`, fullPage: false });
        console.log(`${name} ${w}x${h} HTTP:${status} hOverflow:${overflow}px`);
      } catch (e) {
        console.log(`${name} ${w}x${h} ERROR ${String(e.message).slice(0, 90)}`);
      }
    }
    await ctx.close();
  }
  await browser.close();
  console.log("SHOTS_DONE");
})().catch((e) => {
  console.error("FATAL", e);
  process.exit(1);
});
