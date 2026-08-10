/**
 * EMULATED FRAME-RATE PROBE (S110) — the closest honest proxy this container
 * can offer for the owed "60fps on mid-range hardware" item. Runs the lesson
 * route under 4x CDP CPU throttle (a common mid-range emulation), performs a
 * scripted pointer drag across the manipulative stage, and samples
 * requestAnimationFrame deltas during the interaction. Reports mean/p95 frame
 * time. This is EMULATION on server-class silicon, not a device measurement —
 * the report must label it as such.
 */
import { chromium } from "playwright";

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_EXE });
  const page = await browser.newPage();
  const cdp = await page.context().newCDPSession(page);
  await cdp.send("Emulation.setCPUThrottlingRate", { rate: 4 });
  await page.goto("http://127.0.0.1:3100/learn/as100-01-01", { waitUntil: "networkidle" });
  // pass the prediction gate if present so the widget mounts
  const predict = page.getByRole("button", { name: /higher|lower|same|yes|no|more|fewer/i }).first();
  if (await predict.isVisible().catch(() => false)) {
    await predict.click();
    await page.waitForTimeout(400);
  }
  const stage = page.locator(".stage").first();
  await stage.waitFor({ state: "visible", timeout: 8000 }).catch(() => {});
  const box = await stage.boundingBox();
  if (!box) {
    console.log("PROBE: no stage box; aborting");
    await browser.close();
    process.exit(1);
  }
  await page.evaluate(() => {
    window.__ft = [];
    let last = performance.now();
    const w = window;
    const loop = (t) => {
      w.__ft.push(t - last);
      last = t;
      if (!w.__stop) requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  });
  const y = box.y + box.height / 2;
  await page.mouse.move(box.x + 10, y);
  await page.mouse.down();
  for (let i = 0; i <= 60; i++) {
    await page.mouse.move(box.x + 10 + ((box.width - 20) * i) / 60, y + Math.sin(i / 6) * 12);
    await page.waitForTimeout(16);
  }
  await page.mouse.up();
  const frames = await page.evaluate(() => {
    const w = window;
    w.__stop = true;
    return w.__ft.slice(5); // drop warmup
  });
  frames.sort((a, b) => a - b);
  const mean = frames.reduce((s, x) => s + x, 0) / frames.length;
  const p95 = frames[Math.floor(frames.length * 0.95)];
  const over = frames.filter((f) => f > 20).length;
  console.log(
    `PROBE frames=${frames.length} mean=${mean.toFixed(1)}ms p95=${p95.toFixed(1)}ms >20ms=${over} (${((over / frames.length) * 100).toFixed(1)}%) @4x-throttle`
  );
  await browser.close();
})();
