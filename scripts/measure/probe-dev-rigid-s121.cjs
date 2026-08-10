const { chromium } = require("@playwright/test");
(async () => {
  const b = await chromium.launch({ executablePath: "/tmp/chromium", args: ["--no-sandbox", "--disable-gpu"] });
  const p = await (await b.newContext({ viewport: { width: 360, height: 800 } })).newPage();
  await p.goto("http://localhost:3100/dev/widgets", { waitUntil: "networkidle", timeout: 60000 });
  const rigid = await p.evaluate(() => {
    const main = document.querySelector("main");
    main.style.width = "328px";
    main.style.maxWidth = "328px";
    const out = [];
    for (const sec of document.querySelectorAll("main > section")) {
      const badge = sec.querySelector("p")?.textContent?.trim().slice(0, 40) ?? "?";
      if (sec.scrollWidth > sec.clientWidth + 1) out.push(`${badge}  scroll:${sec.scrollWidth} client:${sec.clientWidth}`);
    }
    return out;
  });
  console.log(JSON.stringify(rigid, null, 1));
  await b.close();
})().catch((e) => { console.error("FATAL", e.message); process.exit(1); });
