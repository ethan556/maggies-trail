/* s205-shots.cjs — fresh release-seal screenshots against the already-running :3100 server.
 * Captures the learner-facing core surfaces at a mobile and a desktop viewport.
 * Usage: node scripts/session/s205-shots.cjs   (server must answer on :3100)
 */
const { chromium } = require("playwright");
const { mkdirSync } = require("node:fs");

const BASE = "http://localhost:3100";
const OUT = "/mnt/user-data/outputs/s205-shots";
const surfaces = [
  ["home", "/"],
  ["trailhead", "/trailhead"],
  ["atlas", "/atlas"],
  ["dashboard", "/dashboard"],
  ["family", "/family"],
  ["teach", "/teach"],
  ["admin", "/admin"],
  // The lesson route is /learn/{lessonId} — flat, NOT /learn/{courseSlug}/{lessonId}.
  // (The course-scoped form 404s; verified by curl against the running server.)
  ["lesson-alg1", "/learn/se-01-01"],
  ["lesson-g2", "/learn/as100-01-01"],
];
const viewports = [
  ["mobile-390", { width: 390, height: 844 }],
  ["desktop-1440", { width: 1440, height: 900 }],
];

(async () => {
  mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  let failures = 0;
  for (const [vpName, viewport] of viewports) {
    const page = await browser.newPage({ viewport });
    for (const [name, path] of surfaces) {
      try {
        const res = await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 });
        if (!res || res.status() >= 400) { console.error(`✗ ${name} ${vpName}: HTTP ${res && res.status()}`); failures++; continue; }
        await page.waitForTimeout(400);
        await page.screenshot({ path: `${OUT}/${name}--${vpName}.png`, fullPage: false });
        console.log(`✓ ${name} ${vpName}`);
      } catch (e) { console.error(`✗ ${name} ${vpName}: ${String(e).slice(0, 120)}`); failures++; }
    }
    await page.close();
  }
  await browser.close();
  process.exit(failures ? 1 : 0);
})();
