// S121: horizontal-overflow sweep across shell routes at phone widths.
// Reports scrollWidth−clientWidth per route×viewport and the offending elements.
const { chromium } = require("@playwright/test");
const ROUTES = [
  "/", "/courses", "/courses/volume-measurement", "/daily", "/dashboard", "/family",
  "/leaderboard", "/notebook", "/onboarding", "/placement", "/premium", "/profile",
  "/review", "/standards", "/teach", "/admin", "/account",
  "/learn/vm-01-01", "/mastery/metric-convert", "/dev/widgets"
];
(async () => {
  const b = await chromium.launch({ executablePath: "/tmp/chromium", args: ["--no-sandbox", "--disable-gpu"] });
  let bad = 0;
  for (const width of [360, 390]) {
    const ctx = await b.newContext({ viewport: { width, height: 800 } });
    const p = await ctx.newPage();
    for (const r of ROUTES) {
      try {
        const resp = await p.goto(`http://localhost:3100${r}`, { waitUntil: "networkidle", timeout: 30000 });
        const m = await p.evaluate(() => {
          const cw = document.documentElement.clientWidth;
          const sw = document.documentElement.scrollWidth;
          const culprits = [];
          if (sw > cw + 1)
            for (const el of document.querySelectorAll("*")) {
              const rc = el.getBoundingClientRect();
              if (rc.right > cw + 1)
                culprits.push(`${el.tagName}.${String(el.className).slice(0, 60)} R${Math.round(rc.right)}`);
            }
          return { over: sw - cw, culprits: culprits.slice(0, 5) };
        });
        const flag = m.over > 1 ? "  << OVERFLOW" : "";
        if (m.over > 1) bad++;
        console.log(`${width} ${r} HTTP${resp?.status()} over:${m.over}px${flag}`);
        for (const c of m.culprits) console.log(`    ${c}`);
      } catch (e) {
        console.log(`${width} ${r} ERROR ${e.message.slice(0, 60)}`);
      }
    }
    await ctx.close();
  }
  await b.close();
  console.log(`SWEEP_DONE overflowing:${bad}`);
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
