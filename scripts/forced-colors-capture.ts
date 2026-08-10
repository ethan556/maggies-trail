import { chromium } from "@playwright/test";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_EXE });
  const ctx = await browser.newContext({
    forcedColors: "active",
    colorScheme: "dark",
    viewport: { width: 720, height: 1100 }
  });
  const page = await ctx.newPage();

  await page.goto("http://127.0.0.1:3100/dashboard", { waitUntil: "networkidle" });
  await page.screenshot({ path: "/tmp/fc-dashboard.png", fullPage: false });

  await page.goto("http://127.0.0.1:3100/learn/as100-01-01", { waitUntil: "networkidle" });
  await page.waitForTimeout(600);
  await page.screenshot({ path: "/tmp/fc-lesson.png", fullPage: false });
  // Tab into the stage so a focus ring is visible in the capture.
  for (let i = 0; i < 4; i++) await page.keyboard.press("Tab");
  await page.screenshot({ path: "/tmp/fc-lesson-focus.png", fullPage: false });

  await page.goto("http://127.0.0.1:3100/dev/widgets", { waitUntil: "networkidle" });
  await page.waitForTimeout(800);
  await page.screenshot({ path: "/tmp/fc-widgets.png", fullPage: false });

  await browser.close();
  console.log("captured");
})();
