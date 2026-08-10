import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const ROUTES = ["/", "/dashboard", "/courses/add-subtract-100", "/standards", "/profile", "/leaderboard", "/premium", "/account"];

(async () => {
  const browser = await chromium.launch({ executablePath: process.env.PW_CHROMIUM_EXE });
  const ctx = await browser.newContext();
  await ctx.addInitScript(() => window.localStorage.setItem("numera:theme", "dark"));
  const page = await ctx.newPage();
  for (const route of ROUTES) {
    await page.goto(`http://127.0.0.1:3100${route}`, { waitUntil: "networkidle" });
    const res = await new AxeBuilder({ page }).withRules(["color-contrast"]).analyze();
    for (const v of res.violations) {
      for (const n of v.nodes) {
        const d = n.any[0]?.data as { fgColor?: string; bgColor?: string; contrastRatio?: number } | undefined;
        console.log(`${route} :: ${n.target.join(" ")} :: fg=${d?.fgColor} bg=${d?.bgColor} ratio=${d?.contrastRatio}`);
        console.log(`   html: ${n.html.slice(0, 160)}`);
      }
    }
  }
  await browser.close();
})();
