// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FIGURES } from "./figures";
import { scanTextBoxes } from "./textBoxes.testkit";

/**
 * S241 — WHAT A STATISTICAL FIGURE CLAIMS, IT HAS TO DRAW (D-15, D-16, D-17).
 *
 * THE HOLE THIS CLOSES. Three always-on gates already read every one of the 1,871 figures:
 * `figures.labelCollision.s238` (no two text boxes overlap), `figures.test.ts` (renders, has a
 * narrated <title>, no text under the 10-unit floor) and `figureTextAdversarialAudit` (the
 * figure's title/aria does not contradict the lesson text beside it). None of them can see
 * GEOMETRY — whether the marks a figure draws are countable, whether the claim in its caption
 * matches the lines on the page, whether an axis exists at all. That is exactly the class the
 * review found in the canonical statistical figures:
 *
 *   D-15 sp7-dotplot-overlap · group B's dots were drawn at group A's EXACT centres wherever
 *        the two shared a value: same cx, same cy, same r. A learner counting sky dots read the
 *        wrong frequency, and the "heavy overlap" the title narrates was drawn as data loss.
 *   D-16 single-scale-graph  · the caption said "each line = 1" and the title "each gridline is
 *        worth exactly one" over a chart with NO gridlines, numbered 0 · 2 · 4 · 6. The lesson's
 *        instruction — "read straight up from the top of the bar to the number beside it" — was
 *        impossible for the cats bar at 3.
 *   D-17 histogram-scores, scatter-association, scatter-best-fit · the lesson's canonical
 *        pictures of a histogram and of a scatter plot, drawn without the furniture that makes
 *        them those displays: no frequency axis at all on the histogram (counts floated above
 *        the bars instead), and bare 50%-opacity segments with no names, ticks or origin on the
 *        scatters.
 *
 * THE SHAPE OF EACH ASSERTION. Presence is never asserted alone — a figure could satisfy "has
 * tick labels" by printing numbers anywhere. Each rule below pairs EXISTENCE with TRUTH: the
 * labels exist AND their positions are linear in their values; the axis exists AND the bars
 * reach the tick their count names; the dots are separated AND both piles still hold every dot
 * they held before.
 */

afterEach(cleanup);

const INK = "#22314F";
const SKY = "#2E7CD6";
const TANGERINE = "#FF8A3D";

function figure(id: string): SVGElement {
  const F = FIGURES[id];
  expect(F, `figure "${id}" is not registered`).toBeDefined();
  const { container } = render(<F />);
  const svg = container.querySelector("svg");
  expect(svg, `figure "${id}" rendered no <svg>`).toBeTruthy();
  return svg as unknown as SVGElement;
}

const num = (el: Element, attr: string) => Number(el.getAttribute(attr));
const els = (svg: Element, tag: string) => Array.from(svg.querySelectorAll(tag));
type Txt = { text: string; x: number; y: number };
const texts = (svg: Element): Txt[] =>
  els(svg, "text").map((t) => ({ text: (t.textContent ?? "").trim(), x: num(t, "x"), y: num(t, "y") }));
const viewBox = (svg: Element) => (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);

/** Positions are linear in values: equal value steps sit at equal position steps (rule A10). */
function linear(points: Array<{ v: number; p: number }>, label: string): void {
  const sorted = [...points].sort((a, b) => a.v - b.v);
  const unit = (sorted[1].p - sorted[0].p) / (sorted[1].v - sorted[0].v);
  expect(Math.abs(unit), `${label}: the scale is degenerate`).toBeGreaterThan(0.5);
  for (let i = 1; i < sorted.length; i++) {
    const step = (sorted[i].p - sorted[i - 1].p) / (sorted[i].v - sorted[i - 1].v);
    expect(step, `${label}: ${sorted[i - 1].v}→${sorted[i].v} is drawn at a different scale`).toBeCloseTo(unit, 2);
  }
}

describe("S241 D-15 (rule A14) — sp7-dotplot-overlap draws overlap without erasing a group", () => {
  const id = "sp7-dotplot-overlap";
  const dots = (svg: Element) =>
    els(svg, "circle").map((c) => ({
      cx: num(c, "cx"),
      cy: num(c, "cy"),
      r: num(c, "r"),
      fill: c.getAttribute("fill") ?? "",
      stroke: c.getAttribute("stroke")
    }));

  it("no two marks share a centre", () => {
    // The defect in one line: B's dots sat at A's exact (cx, cy). Any repeat of a centre is a
    // dot that cannot be counted, whichever group it belongs to.
    const seen = new Map<string, number>();
    for (const d of dots(figure(id))) seen.set(`${d.cx},${d.cy}`, (seen.get(`${d.cx},${d.cy}`) ?? 0) + 1);
    expect([...seen.entries()].filter(([, n]) => n > 1)).toEqual([]);
  });

  it("the two piles are dodged far enough apart to be counted separately", () => {
    const all = dots(figure(id));
    const a = all.filter((d) => d.fill === SKY);
    const b = all.filter((d) => d.fill !== SKY);
    const bad: string[] = [];
    for (const p of a)
      for (const q of b) {
        const gap = Math.hypot(p.cx - q.cx, p.cy - q.cy);
        if (gap < p.r + q.r) bad.push(`(${p.cx}, ${p.cy}) and (${q.cx}, ${q.cy}) overlap by ${(p.r + q.r - gap).toFixed(1)}`);
      }
    expect(bad).toEqual([]);
  });

  it("both groups still hold every dot they held — the fix is a dodge, not a deletion", () => {
    // The cheap "fix" for occlusion is fewer dots. Both piles keep their five columns and their
    // 2-3-4-3-2 shape, which is what makes the picture about overlap in the first place.
    const all = dots(figure(id)).filter((d) => d.cy < 70); // the piles, not the legend swatches
    const shape = (fill: (d: { fill: string }) => boolean) => {
      const cols = new Map<number, number>();
      for (const d of all.filter(fill)) cols.set(d.cx, (cols.get(d.cx) ?? 0) + 1);
      return [...cols.entries()].sort((p, q) => p[0] - q[0]).map(([, n]) => n);
    };
    expect(shape((d) => d.fill === SKY)).toEqual([2, 3, 4, 3, 2]);
    expect(shape((d) => d.fill !== SKY)).toEqual([2, 3, 4, 3, 2]);
  });

  it("and the groups are told apart without relying on colour", () => {
    // A14's second redundancy: filled vs hollow survives a colour-blind reader and a greyscale
    // print, where two similar-luminance hues do not.
    const all = dots(figure(id));
    expect(all.filter((d) => d.fill === SKY).every((d) => !d.stroke), "group A must stay solid").toBe(true);
    const hollow = all.filter((d) => d.fill !== SKY);
    expect(hollow.length).toBeGreaterThan(10);
    expect(hollow.every((d) => d.fill === "#ffffff" && d.stroke === TANGERINE), "group B must be hollow").toBe(true);
  });

  it("the shared scale is ticked, so a dodged pile still reads against its value", () => {
    // Dodging is only honest if the value each pile belongs to is marked: the pair straddles
    // its own tick.
    const svg = figure(id);
    const axis = els(svg, "line").filter((l) => num(l, "y1") === num(l, "y2"));
    const ticks = els(svg, "line").filter((l) => num(l, "x1") === num(l, "x2"));
    expect(axis.length, "the shared axis").toBe(1);
    expect(ticks.length, "one tick per plotted value").toBe(6);
    const xs = ticks.map((t) => num(t, "x1")).sort((p, q) => p - q);
    for (let i = 1; i < xs.length; i++) expect(xs[i] - xs[i - 1], "the ticks are evenly spaced").toBe(xs[1] - xs[0]);
    const all = dots(svg).filter((d) => d.cy < 70); // the piles, not the legend swatches
    for (const d of all) expect(xs.some((x) => Math.abs(x - d.cx) <= 4), `a dot at ${d.cx} belongs to no value`).toBe(true);
  });
});

describe("S241 D-16 (rules A4/C1) — single-scale-graph draws the scale it claims", () => {
  const id = "single-scale-graph";

  it("the caption's claim is on the page: one gridline per unit", () => {
    const svg = figure(id);
    const caption = texts(svg).find((t) => /each line/i.test(t.text));
    expect(caption?.text, "the figure no longer states its scale").toBe("each line = 1");
    const horizontals = els(svg, "line").filter((l) => num(l, "y1") === num(l, "y2"));
    // Six gridlines above the baseline, plus the baseline itself: the bar of 6 can be READ by
    // counting lines, which is the claim.
    expect(horizontals.length).toBe(7);
    const ys = horizontals.map((l) => num(l, "y1")).sort((a, b) => b - a);
    for (let i = 1; i < ys.length; i++) expect(ys[i - 1] - ys[i], "gridlines are one unit apart").toBeCloseTo(ys[0] - ys[1], 5);
  });

  it("every gridline carries its own number, one apart, in the right place", () => {
    // Labelling by 2s over unlabelled lines is what made "each line = 1" unreadable: the cats
    // bar at 3 had no number to read. Every line is numbered, and the numbers step by exactly
    // the unit the caption claims.
    const svg = figure(id);
    const numerals = texts(svg).filter((t) => /^\d+$/.test(t.text)).map((t) => ({ v: Number(t.text), p: t.y }));
    expect(numerals.map((n) => n.v).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4, 5, 6]);
    linear(numerals, "the y axis");
    const gridYs = els(svg, "line").filter((l) => num(l, "y1") === num(l, "y2")).map((l) => num(l, "y1"));
    for (const n of numerals) {
      const nearest = gridYs.reduce((best, y) => (Math.abs(y - n.p) < Math.abs(best - n.p) ? y : best), gridYs[0]);
      expect(Math.abs(nearest - n.p), `the label ${n.v} is not on a gridline`).toBeLessThanOrEqual(4);
    }
  });

  it("and the bars are as tall as the numbers say", () => {
    // Paired acceptance: the gridlines could have been drawn at a pitch the bars do not use.
    // Each bar's top must land on the gridline its value names — 3 for cats, 6 for dogs, 4 for
    // birds, the values the <title> narrates.
    const svg = figure(id);
    const numerals = texts(svg).filter((t) => /^\d+$/.test(t.text));
    const yOf = (v: number) => numerals.find((t) => t.text === String(v))!.y;
    const bars = els(svg, "rect").sort((a, b) => num(a, "x") - num(b, "x"));
    expect(bars.length).toBe(3);
    [3, 6, 4].forEach((v, i) => {
      expect(num(bars[i], "y"), `bar ${i} does not reach ${v}`).toBeCloseTo(yOf(v) - 3.5, 5);
      expect(num(bars[i], "y") + num(bars[i], "height"), `bar ${i} does not start at 0`).toBeCloseTo(yOf(0) - 3.5, 5);
    });
  });
});

describe("S241 D-17 (rule C1) — histogram-scores has a frequency axis", () => {
  const id = "histogram-scores";

  it("draws the axis, names what it counts, and ticks every count", () => {
    const svg = figure(id);
    const verticals = els(svg, "line").filter((l) => num(l, "x1") === num(l, "x2"));
    expect(verticals.length, "no vertical axis line").toBeGreaterThanOrEqual(1);
    const name = texts(svg).find((t) => /how many/i.test(t.text));
    expect(name?.text, "the frequency axis does not say what it counts").toBeTruthy();
    const numerals = texts(svg)
      .filter((t) => /^\d+$/.test(t.text) && t.x < 44) // the axis gutter, left of the first bar
      .map((t) => ({ v: Number(t.text), p: t.y }));
    expect(numerals.map((n) => n.v).sort((a, b) => a - b)).toEqual([0, 1, 2, 3, 4]);
    linear(numerals, "the frequency axis");
    expect(numerals.find((n) => n.v === 4)!.p, "the axis must climb, not fall").toBeLessThan(numerals.find((n) => n.v === 0)!.p);
  });

  it("bar heights agree with the axis, and the bars still touch", () => {
    // C1's other two halves, held together: a frequency axis that the bars do not honour is
    // worse than none, and a histogram whose bars separate is a bar chart.
    const svg = figure(id);
    const numerals = texts(svg).filter((t) => /^\d+$/.test(t.text) && t.x < 44);
    const yOf = (v: number) => numerals.find((t) => t.text === String(v))!.y;
    const bars = els(svg, "rect").sort((a, b) => num(a, "x") - num(b, "x"));
    expect(bars.length).toBe(4);
    [1, 2, 4, 3].forEach((v, i) => {
      expect(num(bars[i], "y"), `bin ${i} does not reach ${v}`).toBeCloseTo(yOf(v) - 3.5, 5);
    });
    for (let i = 1; i < bars.length; i++)
      expect(num(bars[i], "x"), "the bins must share edges").toBeCloseTo(num(bars[i - 1], "x") + num(bars[i - 1], "width"), 5);
  });
});

describe("S241 D-17 (rules A1/C4) — the scatter figures name and scale their axes", () => {
  it("scatter-association: every panel names both axes, marks its origin and ticks its scale", () => {
    const svg = figure("scatter-association");
    const t = texts(svg);
    expect(t.filter((n) => n.text === "x").length, "one x name per panel").toBe(3);
    expect(t.filter((n) => n.text === "y").length, "one y name per panel").toBe(3);
    expect(t.filter((n) => n.text === "0").length, "one origin per panel").toBe(3);
    // The names are the lesson's own vocabulary (bv-01-01: "across-position (x)", "up-position (y)").
    expect(t.some((n) => /across-position/.test(n.text) && /up-position/.test(n.text)), "the axes are unexplained").toBe(true);
    const ticks = els(svg, "line").filter((l) => {
      const len = Math.hypot(num(l, "x2") - num(l, "x1"), num(l, "y2") - num(l, "y1"));
      return len <= 5;
    });
    expect(ticks.length, "two ticks per axis per panel").toBe(12);
    // Paired acceptance: the three point clouds are all still drawn.
    expect(els(svg, "circle").length).toBe(21);
  });

  it("scatter-best-fit: named axes, numbered ticks, and the numbers where their values are", () => {
    const svg = figure("scatter-best-fit");
    const t = texts(svg);
    expect(t.some((n) => n.text === "x"), "the horizontal axis is unnamed").toBe(true);
    expect(t.some((n) => n.text === "y"), "the vertical axis is unnamed").toBe(true);
    // The x numerals sit under the baseline; the y numerals in the gutter left of the axis
    // (`ox = 30`), where the shared origin 0 also lives.
    const xNums = t.filter((n) => /^\d+$/.test(n.text) && n.y > 120 && n.x > 30).map((n) => ({ v: Number(n.text), p: n.x }));
    const yNums = t.filter((n) => /^\d+$/.test(n.text) && n.x < 30).map((n) => ({ v: Number(n.text), p: n.y }));
    expect(xNums.map((n) => n.v).sort((a, b) => a - b)).toEqual([2, 4, 6, 8]);
    expect(yNums.map((n) => n.v).sort((a, b) => a - b)).toEqual([0, 4, 8]);
    linear(xNums, "the x axis");
    linear(yNums, "the y axis");
    // Paired acceptance: the cloud and the fit line the figure exists to show are untouched.
    expect(els(svg, "circle").length).toBe(12);
    expect(els(svg, "line").filter((l) => l.getAttribute("stroke") === TANGERINE).length, "the fit line").toBe(1);
  });
});

describe("S241 — the new axis furniture costs nothing it was meant to buy", () => {
  it("every added numeral and axis name is inside its viewBox and collides with nothing", () => {
    // Rules B1/B2 for the five figures this session touched. The corpus ratchet
    // (`figures.labelCollision.s238`) already forbids overlap registry-wide; what it cannot say
    // is that a label stayed on the canvas. Scoped to the labels added here — the pre-existing
    // "balances the cloud" annotation on scatter-best-fit overruns its viewBox and is a separate
    // finding (rule B2), not something this file silently adopts.
    const ADDED = /^(\d+|x|y|how many scores|x = across-position · y = up-position|each line = 1)$/;
    const bad: string[] = [];
    for (const id of ["sp7-dotplot-overlap", "single-scale-graph", "histogram-scores", "scatter-association", "scatter-best-fit"]) {
      const svg = figure(id);
      const [, , w, h] = viewBox(svg);
      const { boxes, skipped } = scanTextBoxes(svg);
      expect(skipped, `${id}: an unmeasurable label (rotation or tspan)`).toEqual([]);
      for (const b of boxes) {
        if (!ADDED.test(b.text.trim())) continue;
        if (b.x0 < 0 || b.x1 > w || b.y0 < 0 || b.y1 > h)
          bad.push(`${id}: "${b.text}" runs outside the ${w}×${h} viewBox (${b.x0.toFixed(1)}…${b.x1.toFixed(1)}, ${b.y0.toFixed(1)}…${b.y1.toFixed(1)})`);
      }
      cleanup();
    }
    expect(bad).toEqual([]);
  });

  it("and no label dropped below the 10-unit readability floor", () => {
    // The easy way to make new furniture fit is to shrink it out of legibility. `figures.test.ts`
    // enforces the floor registry-wide; restated here on the five so a local regression names
    // itself.
    for (const id of ["sp7-dotplot-overlap", "single-scale-graph", "histogram-scores", "scatter-association", "scatter-best-fit"]) {
      const svg = figure(id);
      for (const el of els(svg, "text")) {
        const size = Number(el.getAttribute("font-size") ?? el.getAttribute("fontSize") ?? 0);
        expect(size, `${id}: "${el.textContent}" at ${size}`).toBeGreaterThanOrEqual(10);
      }
      cleanup();
    }
  });
});

describe("S241 — the ink these figures teach with is the shared palette", () => {
  it("keeps the instructional colours (a11y-checked ink, sky, tangerine)", () => {
    // The figures were re-drawn, not re-styled: every stroke and fill added here is one of the
    // palette constants the rest of the registry uses (plus white for the hollow marks).
    const allowed = new Set([INK, SKY, TANGERINE, "#ffffff", "none", ""]);
    const bad: string[] = [];
    for (const id of ["sp7-dotplot-overlap", "single-scale-graph", "histogram-scores"]) {
      const svg = figure(id);
      for (const el of Array.from(svg.querySelectorAll("line, circle, rect, text"))) {
        for (const attr of ["fill", "stroke"]) {
          const v = el.getAttribute(attr);
          if (v !== null && !allowed.has(v)) bad.push(`${id}: <${el.tagName}> ${attr}="${v}"`);
        }
      }
      cleanup();
    }
    expect(bad).toEqual([]);
  });
});
