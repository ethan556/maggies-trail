#!/usr/bin/env node
// S240 throwaway QA capture — NOT part of any gate, deleted after use (matches the "temporary
// e2e capture spec" convention from S238/S239, just as a standalone script instead of a .spec.ts
// so it doesn't touch the playwright test count). Seeds localStorage directly to the target step
// (same technique as e2e/wave04-math-rendering.spec.ts's seedStep) so each shot needs no manual
// click-through, then screenshots at 1440x900 against the local `next start -p 3100` server.
import { chromium } from "playwright";
import fs from "node:fs";

const OUT = "S240_SCREENSHOTS";
fs.mkdirSync(OUT, { recursive: true });

const profile = { xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [] };

async function seedStep(page, lessonId, stepIds, index) {
  await page.goto("http://127.0.0.1:3100/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ({ lessonId, stepIds, index, profile }) => {
      window.localStorage.clear();
      window.localStorage.setItem(
        `numera:lesson:v1:c1:${lessonId}`,
        JSON.stringify({
          v: 1, lessonId, stepIds, i: index, sessionXp: 0, history: [], injected: [], predictions: [],
          signalCounts: {}, remediated: [], savedAt: "2026-08-13T12:00:00.000Z"
        })
      );
      window.localStorage.setItem("numera:profile:v1:c1", JSON.stringify(profile));
    },
    { lessonId, stepIds, index, profile }
  );
}

const targets = [
  { name: "01-pr-04b-02-i2b-percentBar-flatFee", lessonId: "pr-04b-02", stepIds: ["c1","i1","k1","k2","c2","i2","i2b","k3","ch1","r1"], index: 6 },
  { name: "02-pr-04b-02-k3-check", lessonId: "pr-04b-02", stepIds: ["c1","i1","k1","k2","c2","i2","i2b","k3","ch1","r1"], index: 7 },
  { name: "03-iar-03-01-i2-feasibleRegion", lessonId: "iar-03-01", stepIds: ["c1","k1","i1","c2","k2","k3","i2","ch1","r1"], index: 6 },
  { name: "04-iar-03-01-ch1-challenge", lessonId: "iar-03-01", stepIds: ["c1","k1","i1","c2","k2","k3","i2","ch1","r1"], index: 7 },
  { name: "05-iar-03-03-i2-feasibleRegion", lessonId: "iar-03-03", stepIds: ["c1","k1","k2","i1","i1b","c2","k3","i2","ch1","r1"], index: 7 },
  { name: "06-iar-03-03-ch1-challenge", lessonId: "iar-03-03", stepIds: ["c1","k1","k2","i1","i1b","c2","k3","i2","ch1","r1"], index: 8 },
  { name: "07-pp-04-01-i1b-parametricTrace-line", lessonId: "pp-04-01", stepIds: ["c1","i1","i1b","k1","c2","i2","k2","k3","ch1","r1"], index: 2 },
  { name: "08-pp-04-01-k1-check", lessonId: "pp-04-01", stepIds: ["c1","i1","i1b","k1","c2","i2","k2","k3","ch1","r1"], index: 3 },
  { name: "09-pp-04-01-i2-parametricTrace-circle", lessonId: "pp-04-01", stepIds: ["c1","i1","i1b","k1","c2","i2","k2","k3","ch1","r1"], index: 5 },
  { name: "10-pp-04-01-k2-check", lessonId: "pp-04-01", stepIds: ["c1","i1","i1b","k1","c2","i2","k2","k3","ch1","r1"], index: 6 },
  { name: "11-mmt-04-03-i4-elapsedTime-interactive", lessonId: "mmt-04-03", stepIds: ["c1","e1","i4","k4","i1","k1","c2","i2","c3","i3","k2","k3","ch1","r1"], index: 2 },
  { name: "12-mmt-04-03-k4-elapsedTime-GRADED-NEW", lessonId: "mmt-04-03", stepIds: ["c1","e1","i4","k4","i1","k1","c2","i2","c3","i3","k2","k3","ch1","r1"], index: 3 },
  { name: "13-cpr-01-03-i1-markdown-bold", lessonId: "cpr-01-03", stepIds: ["c1","i1","k1","k2","c2","k3","ch1","r1"], index: 1 }
];

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium", args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const results = [];
for (const t of targets) {
  try {
    await seedStep(page, t.lessonId, t.stepIds, t.index);
    await page.goto(`http://127.0.0.1:3100/learn/${t.lessonId}`, { waitUntil: "domcontentloaded" });
    await page.waitForTimeout(900);
    const dialogCount = await page.locator("[data-nextjs-dialog]").count();
    await page.screenshot({ path: `${OUT}/${t.name}.png`, fullPage: true });
    results.push({ ...t, dialogCount, ok: true });
    console.log(`OK   ${t.name}  nextjsDialogs=${dialogCount}`);
  } catch (err) {
    results.push({ ...t, ok: false, error: String(err) });
    console.log(`FAIL ${t.name}  ${String(err)}`);
  }
}

await browser.close();
fs.writeFileSync(`${OUT}/manifest.json`, JSON.stringify(results, null, 2));
const failed = results.filter((r) => !r.ok || r.dialogCount > 0);
console.log(`\n${results.length - failed.length}/${results.length} captured clean, 0 next.js error overlays`);
if (failed.length) {
  console.log("FAILURES/OVERLAYS:", JSON.stringify(failed, null, 2));
  process.exitCode = 1;
}
