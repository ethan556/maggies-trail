/**
 * S242 / VIS-00 — A MARKER MUST NOT SIT ON A BÉZIER CONTROL POINT. ZERO-BASELINE RATCHET.
 *
 * WHAT THIS CLOSES, AND WHY IT IS THIS RULE AND NOT A LOOSER ONE.
 *
 * A learner-visible defect was reported from a screenshot rather than by any gate: `DiscriminantCases`
 * on `cn-04-02` captioned a panel "D > 0: 2 roots" and drew `M 30 55 Q 60 130 90 55`. A quadratic
 * Bézier never reaches its control point — its extreme is at t = ½, which is ¼·55 + ½·130 + ¼·55 =
 * 92.5, ABOVE the axis at y = 95. The curve had no real roots and the two root dots sat 12px off it.
 *
 * `figures.tsx` is ~29,700 lines of hand-authored SVG with no spec behind it. Nothing declares that
 * a circle is meant to lie on a curve, so nothing could check it.
 *
 * THE FIRST TWO RULES TRIED HERE WERE BOTH WRONG, and the reasons are why this one is narrow:
 *
 *   1. "a marker near a path but not on it" proposed 42, and the top three were all false —
 *      `RepeatingDecimalCycle` and `KsRollStack` circles are flow-diagram bubbles and a ball
 *      (r = 22–27), and `SyDilationParallel`'s dot sits on a <line> the rule was not comparing to.
 *   2. Restricting to small circles and adding <line> raised coverage from 72 markers to 261 — and
 *      the new top rows were SCATTER PLOTS. A point near a line of best fit is supposed to be off
 *      the line. No threshold separates a mis-drawn marker from a residual, because from the
 *      outside they are the same thing.
 *
 * So the rule became the one that actually found the defects: a marker sitting ON A CONTROL POINT
 * while off every curve. Nobody puts a data point at a control point deliberately — it is not a
 * feature of any drawing, it is the specific slip of mistaking the steering handle for the path.
 * The residual problem disappears rather than being thresholded away.
 *
 * It found four, all real, in two figures — `TgReadLandmarks` and `TgFivePoints`, whose sine peak
 * and trough dots were at the Q controls (55, 20) and (125, 100) when the curve reaches 40 and 80.
 * Both are fixed and this asserts zero.
 *
 * WHAT IT DELIBERATELY DOES NOT CATCH, stated so the number is not mistaken for a guarantee:
 * `FnVerticalLineTest` illustrated the vertical line test with a DOWNWARD parabola — a function,
 * which passes the test — captioned "hits twice → not a function". That is a mathematical error in
 * the figure and no marker rule can see it. It was found by reading, it is fixed, and the class
 * remains uncovered.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const SRC = join(process.cwd(), "src/components/figures.tsx");
/** Touching, allowing for stroke width and sub-pixel authoring. */
const ON = 2.5;
/** Close enough to a control point to be one rather than a coincidence. */
const CONTROL_TOL = 4;
/** A marker is small. A bubble, a ball or a pie slice is not a marker. */
const MARKER_R = 6;

type Pt = { x: number; y: number };
const dist = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Walk a path, collecting sampled points and the control points of every Q/C segment. */
function walk(d: string): { pts: Pt[]; controls: Pt[] } | null {
  const tokens = d.match(/[MmLlHhVvQqCcZz]|-?\d*\.?\d+(?:e-?\d+)?/g);
  if (!tokens) return null;
  const pts: Pt[] = [];
  const controls: Pt[] = [];
  let cur: Pt = { x: 0, y: 0 };
  let start: Pt = { x: 0, y: 0 };
  let i = 0;
  const n = () => Number(tokens[i++]);
  const lerp = (p0: Pt, p1: Pt) => {
    for (let t = 0; t <= 1.0001; t += 0.05) pts.push({ x: p0.x + t * (p1.x - p0.x), y: p0.y + t * (p1.y - p0.y) });
  };
  while (i < tokens.length) {
    const cmd = tokens[i];
    // An implicit repeated command is not parsed, so the whole path is judged UNKNOWN rather than
    // partially sampled — a half-sampled curve would manufacture "not on it" failures.
    if (!/[MmLlHhVvQqCcZz]/.test(cmd)) return null;
    i++;
    const abs = cmd === cmd.toUpperCase();
    const pt = (): Pt => (abs ? { x: n(), y: n() } : { x: cur.x + n(), y: cur.y + n() });
    if (/[Mm]/.test(cmd)) { cur = pt(); start = cur; pts.push(cur); }
    else if (/[Ll]/.test(cmd)) { const p = pt(); lerp(cur, p); cur = p; }
    else if (/[Hh]/.test(cmd)) { const p = { x: abs ? n() : cur.x + n(), y: cur.y }; lerp(cur, p); cur = p; }
    else if (/[Vv]/.test(cmd)) { const p = { x: cur.x, y: abs ? n() : cur.y + n() }; lerp(cur, p); cur = p; }
    else if (/[Qq]/.test(cmd)) {
      const c = pt(), p = pt();
      controls.push(c);
      for (let t = 0; t <= 1.0001; t += 0.02)
        pts.push({
          x: (1 - t) ** 2 * cur.x + 2 * t * (1 - t) * c.x + t ** 2 * p.x,
          y: (1 - t) ** 2 * cur.y + 2 * t * (1 - t) * c.y + t ** 2 * p.y,
        });
      cur = p;
    } else if (/[Cc]/.test(cmd)) {
      const c1 = pt(), c2 = pt(), p = pt();
      controls.push(c1, c2);
      for (let t = 0; t <= 1.0001; t += 0.02)
        pts.push({
          x: (1 - t) ** 3 * cur.x + 3 * t * (1 - t) ** 2 * c1.x + 3 * t ** 2 * (1 - t) * c2.x + t ** 3 * p.x,
          y: (1 - t) ** 3 * cur.y + 3 * t * (1 - t) ** 2 * c1.y + 3 * t ** 2 * (1 - t) * c2.y + t ** 3 * p.y,
        });
      cur = p;
    } else if (/[Zz]/.test(cmd)) { lerp(cur, start); cur = start; }
  }
  return pts.length ? { pts, controls } : null;
}

interface Offence { fig: string; marker: Pt; gap: number; path: string }

function scan(): { offences: Offence[]; markers: number; figures: number } {
  const lines = readFileSync(SRC, "utf8").split("\n");
  const bounds: Array<{ name: string; from: number; to: number }> = [];
  lines.forEach((l, idx) => {
    const m = l.match(/^(?:export )?function (\w+)\s*\(/);
    if (m) bounds.push({ name: m[1], from: idx, to: lines.length });
  });
  bounds.forEach((f, k) => { if (bounds[k + 1]) f.to = bounds[k + 1].from; });

  const offences: Offence[] = [];
  let markers = 0;
  let figures = 0;

  for (const fig of bounds) {
    const block = lines.slice(fig.from, fig.to).join("\n");
    if (!block.includes("viewBox")) continue;
    figures++;
    const geometry: Array<{ d: string; pts: Pt[] }> = [];
    const controls: Array<{ p: Pt; d: string }> = [];
    for (const m of block.matchAll(/<path[^>]*\sd=(?:"([^"]+)"|\{`([^`]+)`\})/g)) {
      const d = m[1] ?? m[2];
      if (d.includes("${")) continue; // templated: not statically knowable
      const w = walk(d);
      if (!w) continue;
      geometry.push({ d, pts: w.pts });
      for (const c of w.controls) controls.push({ p: c, d });
    }
    // A <line> is geometry a marker may legitimately sit on.
    for (const m of block.matchAll(/<line[^>]*?x1=\{(-?[\d.]+)\}[^>]*?y1=\{(-?[\d.]+)\}[^>]*?x2=\{(-?[\d.]+)\}[^>]*?y2=\{(-?[\d.]+)\}/g)) {
      const a = { x: Number(m[1]), y: Number(m[2]) }, b = { x: Number(m[3]), y: Number(m[4]) };
      const pts: Pt[] = [];
      for (let t = 0; t <= 1.0001; t += 0.02) pts.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y) });
      geometry.push({ d: "line", pts });
    }

    /* Markers are written two ways here, and reading only the first is how a gate stops being one:
     * `TgFivePoints` hid the same slip as `TgReadLandmarks` inside `{[[20,60],[55,22],…].map(…)}`,
     * where `cx` is a variable. */
    const found: Pt[] = [];
    for (const m of block.matchAll(/<circle[^>]*?cx=\{(-?[\d.]+)\}[^>]*?cy=\{(-?[\d.]+)\}[^>]*?r=\{([\d.]+)\}/g))
      if (Number(m[3]) <= MARKER_R) found.push({ x: Number(m[1]), y: Number(m[2]) });
    for (const arr of block.matchAll(/\{\s*\[((?:\s*\[-?[\d.]+\s*,\s*-?[\d.]+\]\s*,?)+)\]\s*\.map\(/g)) {
      if (!block.slice(arr.index ?? 0, (arr.index ?? 0) + 400).includes("<circle")) continue;
      for (const pair of arr[1].matchAll(/\[(-?[\d.]+)\s*,\s*(-?[\d.]+)\]/g))
        found.push({ x: Number(pair[1]), y: Number(pair[2]) });
    }

    /* Counted BEFORE the control-point early-exit below, not after. The first cut skipped the whole
     * figure when it had no Bézier, which made `markers` 66 rather than 261 — the coverage floor
     * would then have been measuring the offence path instead of the corpus, which is the vacuous
     * -assertion failure this file exists to avoid. The floor caught it. */
    markers += found.length;
    if (!controls.length) continue;

    for (const c of found) {
      let best = Infinity;
      for (const g of geometry) for (const q of g.pts) best = Math.min(best, dist(c, q));
      if (best <= ON) continue;
      const control = controls.find((k) => dist(c, k.p) <= CONTROL_TOL);
      if (control) offences.push({ fig: fig.name, marker: c, gap: Number(best.toFixed(1)), path: control.d.slice(0, 70) });
    }
  }
  return { offences, markers, figures };
}

describe("VIS-00 — no marker sits on a control point instead of the curve", () => {
  const { offences, markers, figures } = scan();

  it("examines a corpus large enough for the assertion to mean something", () => {
    // If a refactor moves the figures out of this file, the zero below would become vacuous — the
    // failure mode this session has hit repeatedly. These floors make that a red test instead.
    expect(figures, "figures.tsx no longer holds the SVG components this gate reads").toBeGreaterThan(500);
    expect(markers, "no marker circles were parsed — the extraction has drifted from the source").toBeGreaterThan(150);
  });

  it("finds none", () => {
    expect(
      offences.map((o) => `${o.fig} circle(${o.marker.x}, ${o.marker.y}) is ${o.gap}px off ${o.path}`),
      "a marker is drawn at a Bézier control point, which the curve never reaches — the dot will float clear of the line it labels"
    ).toEqual([]);
  });
});
