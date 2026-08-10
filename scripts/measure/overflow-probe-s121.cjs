const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ executablePath: "/tmp/chromium", args: ["--no-sandbox", "--disable-gpu"] });
  const p = await (await b.newContext({ viewport: { width: 360, height: 800 } })).newPage();
  await p.goto("http://localhost:3100/", { waitUntil: "networkidle", timeout: 30000 });
  const wide = await p.evaluate(() => {
    const cw = document.documentElement.clientWidth;
    const out = [];
    for (const el of document.querySelectorAll("*")) {
      const r = el.getBoundingClientRect();
      if (r.right > cw + 1 || r.left < -1) {
        const cls = (el.className && typeof el.className === "string" ? el.className : "").slice(0, 80);
        out.push(`${el.tagName}.${cls} L${Math.round(r.left)} R${Math.round(r.right)} W${Math.round(r.width)}`);
      }
    }
    return { cw, sw: document.documentElement.scrollWidth, els: out.slice(0, 15) };
  });
  console.log(JSON.stringify(wide, null, 1));
  await b.close();
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
