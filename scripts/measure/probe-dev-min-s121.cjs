const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ executablePath: "/tmp/chromium", args: ["--no-sandbox", "--disable-gpu"] });
  const p = await (await b.newContext({ viewport: { width: 360, height: 800 } })).newPage();
  await p.goto("http://localhost:3100/dev/widgets", { waitUntil: "networkidle", timeout: 60000 });
  const out = await p.evaluate(() => {
    const res = [];
    for (const el of document.querySelectorAll("main > *")) {
      const prev = el.style.width;
      el.style.width = "min-content";
      const w = el.offsetWidth;
      el.style.width = prev;
      const badge = el.querySelector("p")?.textContent?.trim().slice(0, 34) ?? el.tagName;
      if (w > 328) res.push(`${badge}  min-content:${w}`);
    }
    return res.slice(0, 10);
  });
  console.log(JSON.stringify(out, null, 1));
  await b.close();
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
