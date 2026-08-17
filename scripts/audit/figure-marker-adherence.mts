/**
 * S242 / VIS-00 — A MARKER DRAWN ON A CURVE MUST ACTUALLY LIE ON IT.
 *
 * WHAT PROMPTED THIS. A learner-visible defect was reported from a screenshot, not from any gate:
 * `DiscriminantCases`, the three-parabola figure on `cn-04-02`, captioned its first panel
 * "D > 0: 2 roots" and drew `M 30 55 Q 60 130 90 55`. A quadratic Bézier does not pass through its
 * control point — its extreme is at t = ½, which is ¼·55 + ½·130 + ¼·55 = 92.5, ABOVE the axis at
 * y = 95. The curve had no real roots at all, and the two root dots sat on the axis about 12px away
 * from the curve they were supposed to mark.
 *
 * WHY NOTHING CAUGHT IT. `figures.tsx` is 29,669 lines of hand-authored SVG: 545 paths and 684
 * circles with no spec behind them. The gates that exist check axis semantics, label collision and
 * render health — none of them knows that a circle is *meant* to sit on a curve, because nothing
 * declares the relationship. It is invisible to typecheck, to vitest and to every corpus walk, and
 * the only reason this one surfaced is that somebody looked at it.
 *
 * THE INVARIANT THIS CAN CHECK MECHANICALLY. A marker circle drawn NEAR a path is almost always
 * meant to be ON it — a root, an intercept, a plotted point, a vertex. So: for every circle, find
 * the closest point on every path in the same SVG. A circle whose nearest curve is close enough to
 * be clearly associated but not close enough to be touching is the defect signature.
 *
 *   · under `ON` px      → attached, fine
 *   · `ON`…`NEAR` px     → REPORTED: near a curve, not on it
 *   · beyond `NEAR` px   → a standalone dot (a legend swatch, a vertex label, a scatter point on no
 *                          curve at all) and none of this script's business
 *
 * That middle band is a proposal, not a verdict. Six of the eight detectors written this session
 * turned out mostly false on their first run, so every row printed here is hand-read before any
 * number from it is believed.
 *
 * Run: npx tsx scripts/audit/figure-marker-adherence.mts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { execSync } from "node:child_process";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "vis");
const SRC = join(ROOT, "src/components/figures.tsx");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/** Touching, allowing for stroke width and sub-pixel authoring. */
const ON = 2.5;
/** Beyond this a dot is not plausibly a marker for that curve. */
const NEAR = 26;
/* THE FIRST RUN PROPOSED 42 AND THE TOP THREE WERE ALL FALSE, EACH FOR ITS OWN REASON — read, then
 * narrowed, which is the fifth time this session a detector has needed exactly that.
 *
 *   RepeatingDecimalCycle  r=22 and r=27 "circles" are BUBBLES in a flow diagram, and a node centre
 *                          is supposed to be far from the arrow between nodes.
 *   KsRollStack            r=22 is the BALL; the path above it is a motion arrow.
 *   SyDilationParallel     the dot sits on a <line> segment endpoint, and the nearest <path> is a
 *                          dilation ray it was never on.
 *
 * So: a marker is SMALL, and <line> counts as geometry a marker can legitimately sit on.
 *
 * THE SECOND RUN WAS ALSO MOSTLY FALSE, and for a reason no threshold fixes. Its new top rows were
 * `BvFitStrength`, `BvBestFitMiddle`, `DmCorrelationScale` — SCATTER PLOTS. A data point near a
 * line of best fit is supposed to be off the line; that is what a line of best fit is. "Near a
 * curve but not on it" cannot tell a mis-drawn marker from a residual, and no tightening of ON or
 * NEAR will make it, because the two look identical from the outside.
 *
 * SO THE RULE CHANGED TO THE ONE THAT ACTUALLY FOUND BOTH REAL DEFECTS: a marker sitting on a
 * Bézier CONTROL POINT. Nobody places a data point at a control point on purpose — it is not a
 * feature of the drawing, it is an authoring slip, and it is exactly the slip behind the
 * discriminant figure (control 130, curve 92.5), `TgReadLandmarks` (peak dot at the control (55,20)
 * when the curve peaks at 40) and `TgFivePoints` (the same two coordinates again). A scatter point
 * has no reason to land there, so the residual problem disappears rather than being thresholded
 * away. Narrower, and it is the difference between a gate and a list. */
const MARKER_R = 6;
/** Close enough to a control point to be one rather than a coincidence. */
const CONTROL_TOL = 4;

type Pt = { x: number; y: number };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/**
 * Sample a path's points. Only the segment types `figures.tsx` actually uses are handled — M/L/Q/C
 * and their relative forms, plus H/V. An unparsed command makes the whole path UNKNOWN rather than
 * partially sampled, because a partially sampled curve would produce false "not on it" rows.
 */
function samplePath(d: string): Pt[] | null {
  const tokens = d.match(/[MmLlHhVvQqCcZz]|-?\d*\.?\d+(?:e-?\d+)?/g);
  if (!tokens) return null;
  const pts: Pt[] = [];
  let cur: Pt = { x: 0, y: 0 };
  let start: Pt = { x: 0, y: 0 };
  let i = 0;
  const n = () => Number(tokens[i++]);
  const quad = (p0: Pt, p1: Pt, p2: Pt) => {
    for (let t = 0; t <= 1.0001; t += 0.02)
      pts.push({
        x: (1 - t) ** 2 * p0.x + 2 * t * (1 - t) * p1.x + t ** 2 * p2.x,
        y: (1 - t) ** 2 * p0.y + 2 * t * (1 - t) * p1.y + t ** 2 * p2.y,
      });
  };
  const cubic = (p0: Pt, p1: Pt, p2: Pt, p3: Pt) => {
    for (let t = 0; t <= 1.0001; t += 0.02)
      pts.push({
        x: (1 - t) ** 3 * p0.x + 3 * t * (1 - t) ** 2 * p1.x + 3 * t ** 2 * (1 - t) * p2.x + t ** 3 * p3.x,
        y: (1 - t) ** 3 * p0.y + 3 * t * (1 - t) ** 2 * p1.y + 3 * t ** 2 * (1 - t) * p2.y + t ** 3 * p3.y,
      });
  };
  const line = (p0: Pt, p1: Pt) => {
    for (let t = 0; t <= 1.0001; t += 0.05) pts.push({ x: p0.x + t * (p1.x - p0.x), y: p0.y + t * (p1.y - p0.y) });
  };
  while (i < tokens.length) {
    const cmd = tokens[i];
    if (!/[MmLlHhVvQqCcZz]/.test(cmd)) return null; // implicit repeat: not parsed, so not judged
    i++;
    if (cmd === "M" || cmd === "m") {
      const p = cmd === "M" ? { x: n(), y: n() } : { x: cur.x + n(), y: cur.y + n() };
      cur = p; start = p; pts.push(p);
    } else if (cmd === "L" || cmd === "l") {
      const p = cmd === "L" ? { x: n(), y: n() } : { x: cur.x + n(), y: cur.y + n() };
      line(cur, p); cur = p;
    } else if (cmd === "H" || cmd === "h") {
      const p = { x: cmd === "H" ? n() : cur.x + n(), y: cur.y };
      line(cur, p); cur = p;
    } else if (cmd === "V" || cmd === "v") {
      const p = { x: cur.x, y: cmd === "V" ? n() : cur.y + n() };
      line(cur, p); cur = p;
    } else if (cmd === "Q" || cmd === "q") {
      const c = cmd === "Q" ? { x: n(), y: n() } : { x: cur.x + n(), y: cur.y + n() };
      const p = cmd === "Q" ? { x: n(), y: n() } : { x: cur.x + n(), y: cur.y + n() };
      quad(cur, c, p); cur = p;
    } else if (cmd === "C" || cmd === "c") {
      const c1 = cmd === "C" ? { x: n(), y: n() } : { x: cur.x + n(), y: cur.y + n() };
      const c2 = cmd === "C" ? { x: n(), y: n() } : { x: cur.x + n(), y: cur.y + n() };
      const p = cmd === "C" ? { x: n(), y: n() } : { x: cur.x + n(), y: cur.y + n() };
      cubic(cur, c1, c2, p); cur = p;
    } else if (cmd === "Z" || cmd === "z") {
      line(cur, start); cur = start;
    } else return null;
  }
  return pts.length ? pts : null;
}

/** The control points of every Q/C segment — the coordinates a curve is steered by but never reaches. */
function controlPoints(d: string): Pt[] {
  const out: Pt[] = [];
  const tokens = d.match(/[MmLlHhVvQqCcZz]|-?\d*\.?\d+(?:e-?\d+)?/g);
  if (!tokens) return out;
  let cur: Pt = { x: 0, y: 0 };
  let i = 0;
  const n = () => Number(tokens[i++]);
  while (i < tokens.length) {
    const cmd = tokens[i];
    if (!/[MmLlHhVvQqCcZz]/.test(cmd)) return out;
    i++;
    const abs = cmd === cmd.toUpperCase();
    const pt = (): Pt => (abs ? { x: n(), y: n() } : { x: cur.x + n(), y: cur.y + n() });
    if (/[MmLl]/.test(cmd)) cur = pt();
    else if (/[Hh]/.test(cmd)) cur = { x: abs ? n() : cur.x + n(), y: cur.y };
    else if (/[Vv]/.test(cmd)) cur = { x: cur.x, y: abs ? n() : cur.y + n() };
    else if (/[Qq]/.test(cmd)) { out.push(pt()); cur = pt(); }
    else if (/[Cc]/.test(cmd)) { out.push(pt()); out.push(pt()); cur = pt(); }
  }
  return out;
}

/** Split the file into one block per SVG component so a circle is only compared to its own figure. */
const source = readFileSync(SRC, "utf8");
const lines = source.split("\n");
interface Fig { name: string; from: number; to: number }
const figs: Fig[] = [];
lines.forEach((l, idx) => {
  const m = l.match(/^(?:export )?function (\w+)\s*\(/);
  if (m) figs.push({ name: m[1], from: idx, to: lines.length });
});
figs.forEach((f, k) => { if (figs[k + 1]) f.to = figs[k + 1].from; });

interface Row { fig: string; line: number; cx: number; cy: number; gap: number; path: string }
const rows: Row[] = [];
let circlesSeen = 0;
let attached = 0;
let standalone = 0;
let unparsed = 0;

for (const fig of figs) {
  const block = lines.slice(fig.from, fig.to).join("\n");
  if (!block.includes("viewBox")) continue;
  const paths: Array<{ d: string; pts: Pt[] }> = [];
  const controls: Array<{ p: Pt; d: string }> = [];
  for (const m of block.matchAll(/<path[^>]*\sd=(?:"([^"]+)"|\{`([^`]+)`\})/g)) {
    const d = m[1] ?? m[2];
    // A templated path carries `${…}` and is not statically knowable.
    if (d.includes("${")) { unparsed++; continue; }
    const pts = samplePath(d);
    if (pts) paths.push({ d, pts }); else unparsed++;
    if (pts) for (const c of controlPoints(d)) controls.push({ p: c, d });
  }
  // A <line> is geometry a marker sits on just as legitimately as a <path>.
  for (const m of block.matchAll(/<line[^>]*?x1=\{(-?[\d.]+)\}[^>]*?y1=\{(-?[\d.]+)\}[^>]*?x2=\{(-?[\d.]+)\}[^>]*?y2=\{(-?[\d.]+)\}/g)) {
    const a = { x: Number(m[1]), y: Number(m[2]) }, b = { x: Number(m[3]), y: Number(m[4]) };
    const pts: Pt[] = [];
    for (let t = 0; t <= 1.0001; t += 0.02) pts.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
    paths.push({ d: `line ${a.x},${a.y} → ${b.x},${b.y}`, pts });
  }
  if (!paths.length) continue;
  /* Two ways a marker is written here. `TgFivePoints` hides the SAME control-point bug as
   * `TgReadLandmarks` inside `{[[20,60],[55,22],…].map(…)}`, where `cx` is a variable — a detector
   * that only reads `cx={number}` cannot see it, and missing a known-bad figure is how a gate
   * quietly stops being one. */
  const markers: Array<{ c: Pt; idx: number }> = [];
  for (const m of block.matchAll(/<circle[^>]*?cx=\{(-?[\d.]+)\}[^>]*?cy=\{(-?[\d.]+)\}[^>]*?r=\{([\d.]+)\}/g))
    if (Number(m[3]) <= MARKER_R) markers.push({ c: { x: Number(m[1]), y: Number(m[2]) }, idx: m.index ?? 0 });
  for (const arr of block.matchAll(/\{\s*\[((?:\s*\[-?[\d.]+\s*,\s*-?[\d.]+\]\s*,?)+)\]\s*\.map\(/g)) {
    if (!block.slice(arr.index ?? 0, (arr.index ?? 0) + 400).includes("<circle")) continue;
    for (const pair of arr[1].matchAll(/\[(-?[\d.]+)\s*,\s*(-?[\d.]+)\]/g))
      markers.push({ c: { x: Number(pair[1]), y: Number(pair[2]) }, idx: arr.index ?? 0 });
  }
  for (const marker of markers) {
    circlesSeen++;
    const c = marker.c;
    let best = Infinity;
    let bestPath = "";
    for (const p of paths) {
      for (const q of p.pts) {
        const dd = dist(c, q);
        if (dd < best) { best = dd; bestPath = p.d; }
      }
    }
    if (best <= ON) { attached++; continue; }
    // Off every curve. Is it sitting on a control point — the authoring slip — or is it simply a
    // data point that was never meant to touch anything?
    const onControl = controls.find((k) => dist(c, k.p) <= CONTROL_TOL);
    if (!onControl) { standalone++; continue; }
    bestPath = onControl.d;
    const at = fig.from + block.slice(0, marker.idx).split("\n").length;
    rows.push({ fig: fig.name, line: at, cx: c.x, cy: c.y, gap: Number(best.toFixed(2)), path: bestPath.slice(0, 60) });
  }
}

mkdirSync(OUT, { recursive: true });
const out = join(OUT, "FIGURE_MARKER_ADHERENCE.csv");
writeFileSync(out, [
  `# sourceSeal=${seal} — S242/VIS-00. Marker circles in figures.tsx placed on a Bezier CONTROL`,
  `# POINT rather than on the curve it steers. gapPx is the distance to the nearest drawn geometry.`,
  "figure,line,cx,cy,gapPx,nearestPath",
  ...rows.sort((a, b) => b.gap - a.gap).map((r) => [r.fig, r.line, r.cx, r.cy, r.gap, `"${r.path.replace(/"/g, "'")}"`].join(",")),
].join("\n") + "\n");

console.log(`figure-marker-adherence @ ${seal}`);
console.log(`  figures with a parsable path      ${figs.filter((f) => lines.slice(f.from, f.to).join("\n").includes("viewBox")).length}`);
console.log(`  marker circles examined           ${circlesSeen}`);
console.log(`    attached (<= ${ON}px)             ${attached}`);
console.log(`    off-curve, not on a control      ${standalone}   ← data points, legend dots, free labels`);
console.log(`    OFF THE CURVE, ON A CONTROL PT   ${rows.length}   ← the authoring slip; read every one`);
console.log(`  paths skipped (templated/unparsed) ${unparsed}`);
console.log("\n── markers sitting on a control point instead of the curve ──");
for (const r of rows.sort((a, b) => b.gap - a.gap).slice(0, 40))
  console.log(`  ${r.gap.toFixed(1).padStart(6)}px  ${r.fig}:${r.line}  circle(${r.cx}, ${r.cy})\n            ${r.path}`);
console.log(`\n  wrote ${relative(ROOT, out)}`);
