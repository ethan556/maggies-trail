/**
 * S242 / VIS-05 — RENDERING EVERY FIGURE, AND A NEGATIVE RESULT ON AXIS ORIENTATION.
 *
 * `VIS04_TOPIC_DRIFT.md` named the blind spot it shares with VIS-03: *"A figure drawing the right
 * subject in the wrong ORIENTATION, the wrong direction, or with a mislabelled axis shares
 * vocabulary perfectly and is invisible here."* Such a figure shares every number too. It was
 * written off as needing a person looking at rendered SVG.
 *
 * The SVG turns out to be renderable — every figure is a pure component with no props, so
 * `renderToStaticMarkup` gives the real laid-out coordinates rather than the JSX expressions
 * (`X(n) = ox + n * u`) a static read would see. That part worked. The invariant did not.
 *
 * ── WHAT THIS FILE NOW DOES ──
 *
 * 1. RENDER HEALTH, which is a real gate. All 1,871 figures must render without throwing. This
 *    found nothing today and is cheap insurance: a figure that throws renders as nothing at all,
 *    and no other gate in the repository exercises `figures.tsx` at runtime.
 * 2. The axis-direction probe, kept and reported as EXPERIMENTAL with its measured precision,
 *    because the reason it fails is the useful part.
 *
 * ── THE INVARIANT, AND WHY IT DOES NOT HOLD ──
 *
 * SVG's y grows DOWNWARD, so a mathematical figure drawing a vertical scale must invert it, and
 * forgetting is the classic upside-down bug. The probe therefore asked: on a run of evenly-spaced,
 * evenly-valued numeric labels, does a vertical scale read DESCENDING when sorted by increasing y?
 *
 * 19 runs failed that test. **All 19 read by hand; 0 were defects.**
 *
 *   · `ratio-table`, `mapping-diagram`, `fg-function-test`, `ee-dep-indep`, `rr6-table-to-plane`,
 *     `pr7-k-fraction`, `log-scale-ladder` — TABLES and ladders. A table reads top to bottom, so
 *     its first column ascends downward. Correct.
 *   · `lc-continuity-conditions` [1 2 3] — a numbered LIST.
 *   · `c120-down-ten` [4 14 24 34] — a 120-chart, where going down a row adds ten BY CONSTRUCTION.
 *   · `fn-negative-diff` [20 15 10 5], `tno-count-down-tens` [65 55 45 35],
 *     `as-partners-ten` [9 8 7 6 5] — decreasing SEQUENCES, which is the subject of each figure.
 *
 * THE STRUCTURAL REASON, which is the finding: in a K–12 mathematics figure corpus, a vertical run
 * of evenly-spaced numbers is almost never a y-axis. It is a table column, a numbered list, or a
 * counting sequence — all of which correctly read top to bottom. Nothing in the SVG distinguishes a
 * y-axis from a table column: both are evenly spaced text at a constant x. Tightening the shape
 * test took the count from 84 to 19 and could not take it to a true positive, because the
 * discriminator needed is not geometric.
 *
 * So the original assessment was right, and now it is right for a stated reason rather than a
 * shrug: this class needs a person, because it needs to know what the drawing MEANS.
 *
 * Run: npx tsx scripts/audit/figure-axis-orientation.mts
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";
import { execSync } from "node:child_process";
import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";

/* `figures.tsx` compiles under the CLASSIC JSX runtime, so every element becomes
 * `React.createElement(...)` and expects `React` to be in scope. Next.js supplies that; a bare tsx
 * run does not, and every one of the 1,871 figures threw "React is not defined". The global is set
 * BEFORE the module is loaded, which is why the import below is dynamic — a static import is hoisted
 * above this line and the figures would be evaluated with React still missing. */
(globalThis as { React?: typeof React }).React = React;
const { FIGURES } = (await import("../../src/components/figures")) as { FIGURES: Record<string, () => unknown> };

const ROOT = process.cwd();
const OUT = join(ROOT, "reports", "vis");
const seal = execSync("git rev-parse --short HEAD", { encoding: "utf8" }).trim();

/** Same-axis tolerance in user units. Tick labels are rarely pixel-aligned. */
const ALIGN = 2.5;
/** A direction needs three points; two define no order a swap would not equally explain. */
const MIN_RUN = 3;

interface Label { x: number; y: number; value: number }

/**
 * Pull every `<text>` that carries a bare number, with the coordinates it will actually lay out at.
 *
 * `transform` is deliberately NOT interpreted. A figure that positions its labels by translating a
 * group is common, and guessing at the composed transform would produce coordinates that are wrong
 * in a way nothing downstream could detect. Those labels are dropped instead, which costs coverage
 * and cannot cost correctness — the failure direction this file can afford.
 */
function numericLabels(svg: string): Label[] {
  const out: Label[] = [];
  for (const match of svg.matchAll(/<text\b([^>]*)>([^<]*)<\/text>/g)) {
    const attributes = match[1];
    if (/\btransform=/.test(attributes)) continue;
    const content = match[2].replace(/&#x2212;|&minus;/g, "-").replace(/[−–—]/g, "-").trim();
    if (!/^-?\d+(?:\.\d+)?$/.test(content)) continue;
    const x = Number(/\bx="(-?[\d.]+)"/.exec(attributes)?.[1]);
    const y = Number(/\by="(-?[\d.]+)"/.exec(attributes)?.[1]);
    if (!Number.isFinite(x) || !Number.isFinite(y)) continue;
    out.push({ x, y, value: Number(content) });
  }
  return out;
}

/** Group labels that share one coordinate (within ALIGN) and vary along the other. */
function runs(labels: Label[], axis: "horizontal" | "vertical"): Label[][] {
  const shared = (label: Label) => (axis === "horizontal" ? label.y : label.x);
  const along = (label: Label) => (axis === "horizontal" ? label.x : label.y);
  const buckets: Label[][] = [];
  for (const label of [...labels].sort((a, b) => shared(a) - shared(b))) {
    const bucket = buckets.find((b) => Math.abs(shared(b[0]) - shared(label)) <= ALIGN);
    if (bucket) bucket.push(label); else buckets.push([label]);
  }
  return buckets
    .map((bucket) => [...bucket].sort((a, b) => along(a) - along(b)))
    .filter((bucket) => bucket.length >= MIN_RUN && new Set(bucket.map((l) => l.value)).size === bucket.length);
}

/**
 * An AXIS, as distinct from a table column, a grid, or a plotted series.
 *
 * The first run reported 84 wrong-direction runs and the first three read settled what was wrong:
 *
 *   · `cpr-event-as-set` [1 6 11 16] — a 5×4 sample-space GRID. Its columns count downward because
 *     it is a grid of outcomes, not a scale.
 *   · `cpr-two-way-table` [40 70 110] — a two-way TABLE column ending in a total.
 *   · `exp-decay-16` [16 8 4 2] — exponential decay. Values SHOULD fall left to right; that is the
 *     mathematics, not a defect.
 *
 * An axis is the one shape where position and value are proportional: evenly spaced ticks carrying
 * evenly spaced numbers. Decay fails on values, the table fails on values, and the grid fails
 * because a grid puts a run on EVERY column — a figure with five parallel vertical runs is not a
 * figure with five y-axes.
 */
const arithmetic = (values: number[]): boolean => {
  const step = values[1] - values[0];
  if (Math.abs(step) < 1e-9) return false;
  return values.every((v, i) => i === 0 || Math.abs(v - values[i - 1] - step) < 1e-6);
};

/** Positions evenly spaced too, within the same tolerance that groups a run. */
const evenlySpaced = (positions: number[]): boolean => {
  const step = positions[1] - positions[0];
  if (Math.abs(step) < 1e-9) return false;
  return positions.every((p, i) => i === 0 || Math.abs(p - positions[i - 1] - step) <= ALIGN);
};

/** Strictly monotone in the direction a reader expects, or not a scale at all. */
function direction(values: number[]): "ascending" | "descending" | "neither" {
  let up = true;
  let down = true;
  for (let i = 1; i < values.length; i++) {
    if (values[i] <= values[i - 1]) up = false;
    if (values[i] >= values[i - 1]) down = false;
  }
  return up ? "ascending" : down ? "descending" : "neither";
}

interface Row { figure: string; axis: string; verdict: string; labels: string; coords: string }
const rows: Row[] = [];
let figures = 0;
let rendered = 0;
let withRuns = 0;
let runsChecked = 0;
const failures = new Map<string, string[]>();

for (const [id, Component] of Object.entries(FIGURES)) {
  figures++;
  let svg = "";
  /* THE CATCH REPORTS. An earlier cut swallowed every render failure and the audit printed
   * "0 rendered" while exiting cleanly — the same vacuous green the VIS-03 registry parse produced.
   * A figure that cannot render is itself a finding, so it is counted and named rather than
   * silently skipped. */
  try { svg = renderToStaticMarkup(Component() as never); } catch (error) {
    const message = (error as Error).message.slice(0, 120);
    failures.set(message, [...(failures.get(message) ?? []), id]);
    continue;
  }
  rendered++;
  const labels = numericLabels(svg);
  if (labels.length < MIN_RUN) continue;

  let sawRun = false;
  for (const axis of ["horizontal", "vertical"] as const) {
    const found = runs(labels, axis);
    /* A grid puts a parallel run on every column or row. Two is the most any figure needs (a scale
     * and its mirror); five means the shape is a lattice of values and none of them is an axis. */
    if (found.length > 2) continue;
    for (const run of found) {
      sawRun = true;
      runsChecked++;
      const values = run.map((l) => l.value);
      const positions = run.map((l) => (axis === "horizontal" ? l.x : l.y));
      if (!arithmetic(values) || !evenlySpaced(positions)) continue;
      const order = direction(values);
      if (order === "neither") continue; // an unordered set of numbers is not a scale
      /* A horizontal scale reads left to right, so ascending is correct. A vertical scale is sorted
       * by INCREASING y, which is DOWNWARD on screen, so a correct one reads descending. */
      const correct = axis === "horizontal" ? "ascending" : "descending";
      if (order === correct) continue;
      rows.push({
        figure: id, axis,
        verdict: axis === "vertical" ? "vertical scale increases downward" : "horizontal scale increases right to left",
        labels: values.join(" "),
        coords: run.map((l) => `(${l.x},${l.y})`).join(" ")
      });
    }
  }
  if (sawRun) withRuns++;
}

mkdirSync(OUT, { recursive: true });
const csv = join(OUT, "VIS05_AXIS_ORIENTATION.csv");
writeFileSync(csv, [
  `# sourceSeal=${seal} align=${ALIGN} minRun=${MIN_RUN} — S242/VIS-05. Figures rendered to static SVG;`,
  "# every run of 3+ distinct numeric labels sharing an axis is checked for reading direction.",
  "# SVG y grows DOWNWARD, so a correct vertical scale reads DESCENDING when sorted by increasing y.",
  "# Labels carrying a transform are skipped rather than guessed at.",
  "figure,axis,verdict,labels,coords",
  ...rows.map((r) => [r.figure, r.axis, r.verdict, r.labels, r.coords]
    .map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))
].join("\n") + "\n");

console.log(`figure-axis-orientation @ ${seal}`);
console.log(`  ${figures} figures, ${rendered} rendered to static SVG`);
for (const [message, ids] of failures) console.log(`    RENDER FAILED ×${ids.length}: ${message}  e.g. ${ids.slice(0, 3).join(", ")}`);
console.log(`  ${withRuns} carry at least one numeric label run; ${runsChecked} runs checked`);
console.log(`  ${rows.length} runs read in the wrong direction — EXPERIMENTAL, measured 0/19 true`);
console.log("  The probe is retained for its reason, not its yield: a vertical run of evenly-spaced");
console.log("  numbers in this corpus is a table column, a numbered list or a counting sequence far");
console.log("  more often than a y-axis, and nothing in the SVG tells those apart.");
if (failures.size) { console.log("\n  RENDER HEALTH FAILED — a figure that throws renders as nothing at all."); process.exit(1); }
console.log(`\n  render health: ${rendered}/${figures} figures render cleanly`);
console.log(`  wrote ${relative(ROOT, csv)}`);
for (const row of rows.slice(0, 25)) console.log(`    ${row.figure} [${row.axis}] ${row.labels}`);
