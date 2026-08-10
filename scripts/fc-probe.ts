import { chromium } from "@playwright/test";
(async () => {
  const b = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_EXE });
  const ctx = await b.newContext({ forcedColors: "active" });
  const p = await ctx.newPage();
  await p.goto("http://127.0.0.1:3100/learn/as100-01-01", { waitUntil: "networkidle" });
  for (let i = 1; i <= 5; i++) {
    await p.keyboard.press("Tab");
    console.log(i, await p.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const cs = getComputedStyle(el);
      return `${el.tagName}.${(el.className||"").toString().slice(0,60)} outline=${cs.outlineWidth} ${cs.outlineStyle}`;
    }));
  }
  await b.close();
})();
