// S239: inventory the remaining WS-C frontier — every component in widgets.tsx that
// renders an <input type="range">, whether it already uses the useSvgDrag substrate,
// joined against corpus usage (engine-map.csv). Mirrors the wave-16 measurement.
import fs from "node:fs";

const src = fs.readFileSync("src/components/widgets.tsx", "utf8");
const lines = src.split("\n");

// component starts: `function NameW(` at top level (widgets.tsx convention)
const comps = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^function ([A-Za-z0-9]+)\(/);
  if (m) comps.push({ name: m[1], start: i + 1 });
}
for (let i = 0; i < comps.length; i++) comps[i].end = i + 1 < comps.length ? comps[i + 1].start - 1 : lines.length;

const compAt = (ln) => comps.find((c) => ln >= c.start && ln <= c.end);

const rangeLines = [];
lines.forEach((l, i) => {
  if (l.includes('type="range"')) rangeLines.push(i + 1);
});

const byComp = new Map();
for (const ln of rangeLines) {
  const c = compAt(ln);
  if (!c) continue;
  if (!byComp.has(c.name)) byComp.set(c.name, { ranges: 0, comp: c });
  byComp.get(c.name).ranges++;
}

// drag adoption: does the component body call useSvgDrag(
for (const [, v] of byComp) {
  const body = lines.slice(v.comp.start - 1, v.comp.end).join("\n");
  v.drag = body.includes("useSvgDrag(");
}

// usage from engine map
const map = fs.readFileSync("COWORK_CACHE/engine-map.csv", "utf8").trim().split("\n").slice(1);
const usage = new Map();
const kindOf = new Map();
for (const row of map) {
  const [kind, fn, , , uses] = row.split(",");
  usage.set(fn, Number(uses));
  kindOf.set(fn, kind);
}

const out = [...byComp.entries()]
  .map(([name, v]) => ({
    component: name,
    kind: kindOf.get(name) ?? "?",
    uses: usage.get(name) ?? -1,
    ranges: v.ranges,
    drag: v.drag ? "HAS-DRAG" : "NO-DRAG",
    line: v.comp.start,
  }))
  .sort((a, b) => b.uses - a.uses);

console.log("component,kind,uses,rangeInputs,drag,line");
for (const r of out) console.log(`${r.component},${r.kind},${r.uses},${r.ranges},${r.drag},${r.line}`);
const frontier = out.filter((r) => r.drag === "NO-DRAG");
console.log(`\nTOTAL range-carrying components: ${out.length}; NO-DRAG frontier: ${frontier.length}`);
console.log(`Frontier authored-step exposure: ${frontier.reduce((s, r) => s + Math.max(0, r.uses), 0)}`);

// second pass: bespoke direct-manipulation detection on the NO-DRAG set
console.log("\n--- NO-DRAG components with bespoke pointer handling (candidate: already direct) ---");
for (const r of frontier) {
  const c = comps.find((x) => x.name === r.component);
  const body = lines.slice(c.start - 1, c.end).join("\n");
  const sig = [];
  if (/onPointerDown/.test(body)) sig.push("pointerDown");
  if (/onMouseDown/.test(body)) sig.push("mouseDown");
  if (/onTouchStart/.test(body)) sig.push("touchStart");
  if (/onClick=/.test(body)) sig.push("click");
  console.log(`${r.component},${r.uses},${sig.join("+") || "SLIDER-ONLY"}`);
}
