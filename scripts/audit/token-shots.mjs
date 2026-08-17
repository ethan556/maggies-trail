/**
 * S242 — before/after captures for the `text-content` / `text-content-2` token collision.
 * Usage: node scripts/audit/token-shots.mjs <label>   (writes S242_SCREENSHOTS/<label>-<route>.png)
 */
import { chromium } from "@playwright/test";
import { mkdirSync } from "node:fs";

const label = process.argv[2] ?? "shot";
const base = process.env.PW_BASE_URL ?? "http://127.0.0.1:3200";
const exe = process.env.PW_CHROMIUM_EXE ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";
const DIR = "S242_SCREENSHOTS";
mkdirSync(DIR, { recursive: true });

const SHOTS = [
  { name: "landing-390", path: "/", width: 390, height: 844 },
  { name: "landing-1024", path: "/", width: 1024, height: 900 },
  { name: "trailhead-390", path: "/trailhead", width: 390, height: 844 },
  { name: "courses-390", path: "/courses", width: 390, height: 844 },
  { name: "dashboard-390", path: "/dashboard", width: 390, height: 844 },
  { name: "notebook-320-xl", path: "/notebook", width: 320, height: 720, xl: true },
  { name: "journal-390", path: "/journal", width: 390, height: 844 },
  { name: "atlas-1024", path: "/atlas", width: 1024, height: 800 }
];

const browser = await chromium.launch({ executablePath: exe, args: ["--no-sandbox"] });
for (const s of SHOTS) {
  const page = await browser.newPage({ viewport: { width: s.width, height: s.height } });
  if (s.xl) {
    await page.addInitScript(() =>
      localStorage.setItem(
        "numera:profile:v1:c1",
        JSON.stringify({ xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [], textScale: "xl", openReading: true })
      )
    );
  }
  await page.goto(base + s.path, { waitUntil: "networkidle" });
  await page.waitForTimeout(500);
  await page.screenshot({ path: `${DIR}/${label}-${s.name}.png`, fullPage: false });
  console.log(`  ${DIR}/${label}-${s.name}.png`);
  await page.close();
}
await browser.close();
