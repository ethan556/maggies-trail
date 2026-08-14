// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { collisions, describeCollision, scanTextBoxes, type TextBox } from "./textBoxes.testkit";

/**
 * S241 — A PLANE THAT SPEAKS IN NUMBERS HAS TO PRINT NUMBERS (D-10, D-11, D-12, D-25).
 *
 * THE SWEEP THIS FINISHES. S237 asked every coordinate surface WHAT ITS AXES MEASURE and captioned
 * 26 engines (`widgets.axisCaptions.s237.test.tsx`). It deliberately left a separate question
 * open — WHERE AM I ON THIS AXIS — and four engines escaped even the naming pass, three of them
 * because they postdate it:
 *
 *   D-10 parametricTrace        · drew a curve, a handle and a readout saying "t ≈ 2.00 → (3.00,
 *                                 4.00)" inside an SVG with no axis, no tick, no gridline and no
 *                                 origin. In line mode (x = t + lineX0) the framing box was fitted
 *                                 to the curve, so x = 0 was not merely unlabelled — it was off
 *                                 the picture. The learner was told a coordinate and shown a
 *                                 plane on which no coordinate could be located.
 *   D-11 feasibleRegionExplore  · two bare axis segments, no names, no ticks — and corner labels
 *                                 seated unconditionally to the right of their dot, so the corner
 *                                 at x = xMax printed past the 300-unit viewBox. The clipped part
 *                                 was the coordinate the task is about.
 *   D-12 argandExplore          · in multiply mode the grid radius follows |z·w|, so dragging z
 *                                 outward shrinks every square LIVE. With no numerals the rescale
 *                                 is invisible: an arrow of the same length means a different |z|
 *                                 from one frame to the next.
 *   D-25 scatterFit, slopeField, pointSetReasoningLab, plotPoint · value-graded planes with no
 *                                 tick values at all: m and b tuned as printed numbers over a
 *                                 surface where no number appears; an initial condition set by
 *                                 counting unlabelled rows; a coordinate read off an unnumbered
 *                                 grid; a 1…N cell lattice that never says where 0 is.
 *
 * WHAT IS PINNED HERE, AND WHY IN THIS SHAPE. Not "there is a <text> somewhere" — a scale is only
 * a scale if it is READABLE and TRUE, so each engine is asserted on three properties together:
 *   · the numerals EXIST, on both axes, with the origin among them;
 *   · they describe a REAL LINEAR SCALE — consecutive numerals sit at pixel gaps proportional to
 *     their value gaps, so a label cannot drift off the position it names (rule A10's spirit);
 *   · they cost nothing else — no label lands outside the viewBox and no two labels overlap, at
 *     every state the learner can reach by dragging (rules B1/B2).
 * Each rejection is paired with an acceptance, the S237b discipline: a fix that satisfied "nothing
 * clips" by drawing nothing would fail the presence assertions in the same file.
 *
 * Boxes are modelled by the S237 testkit (0.72em per character, measured in Chromium), the same
 * model `widgets.labelCollision.s237` and the S238 sweeps use.
 */

afterEach(cleanup);

type Case = { where: string; widget: Record<string, unknown> };

function authored(type: string): Case[] {
  const out: Case[] = [];
  const courses = join(process.cwd(), "content", "courses");
  for (const course of readdirSync(courses)) {
    const dir = join(courses, course, "lessons");
    if (!existsSync(dir)) continue;
    for (const f of readdirSync(dir)) {
      if (!f.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(dir, f), "utf8")) as {
        id: string;
        steps?: Array<{ id: string; widget?: Record<string, unknown> }>;
        remedials?: Array<{ check?: { id: string; widget?: Record<string, unknown> }; concept?: { id: string; widget?: Record<string, unknown> } }>;
      };
      const all = [
        ...(lesson.steps ?? []),
        ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is { id: string; widget?: Record<string, unknown> } => Boolean(s))
      ];
      for (const step of all) if (step.widget?.type === type) out.push({ where: `${lesson.id}/${step.id}`, widget: step.widget });
    }
  }
  return out;
}

type Drawn = { svg: SVGSVGElement; boxes: TextBox[]; skipped: string[]; view: { w: number; h: number }; root: HTMLElement };

function draw(widget: Record<string, unknown>, value: unknown = null, tone: "neutral" | "error" | "info" = "neutral"): Drawn {
  const spec = WidgetSpec.parse(widget) as TWidget;
  const { container } = render(<WidgetRenderer spec={spec} value={value as never} onChange={() => {}} disabled={false} tone={tone} />);
  const svg = container.querySelector("svg") as SVGSVGElement;
  const vb = (svg?.getAttribute("viewBox") ?? "0 0 0 0").split(/\s+/).map(Number);
  const scan = svg ? scanTextBoxes(svg) : { boxes: [], skipped: [] };
  return { svg, boxes: scan.boxes, skipped: scan.skipped, view: { w: vb[2], h: vb[3] }, root: container };
}

/** Only the scale: labels whose whole text is a number. */
const numerals = (boxes: TextBox[]) => boxes.filter((b) => /^-?\d+(\.\d+)?$/.test(b.text));
const centreX = (b: TextBox) => (b.x0 + b.x1) / 2;
const centreY = (b: TextBox) => (b.y0 + b.y1) / 2;

/** Numerals sharing a baseline band — one axis's row of values, left to right. */
function rowAt(boxes: TextBox[], y: number, tol = 1.5): TextBox[] {
  return numerals(boxes).filter((b) => Math.abs(b.y0 - y) < tol).sort((a, b) => centreX(a) - centreX(b));
}
/**
 * One axis's column of values, top to bottom. Grouped by a shared edge rather than a shared
 * centre because a vertical scale is anchored to its axis, and which edge that is depends on which
 * side of the axis the engine had room for — scatterFit prints inside the left pad (start), the
 * rest hang off the axis (end). Both are tried and the bigger group wins.
 */
function columnAt(boxes: TextBox[], _x?: number): TextBox[] {
  const groups = new Map<string, TextBox[]>();
  for (const b of numerals(boxes)) {
    for (const key of [`L${b.x0.toFixed(1)}`, `R${b.x1.toFixed(1)}`]) groups.set(key, [...(groups.get(key) ?? []), b]);
  }
  let best: TextBox[] = [];
  for (const g of groups.values()) if (g.length > best.length) best = g;
  return [...best].sort((a, b) => centreY(a) - centreY(b));
}
/**
 * The corner origin is anchored to the CORNER, not centred on its own tick — it names the meeting
 * point of two axes, so it belongs to both rows and sits on neither's centre line. Its position is
 * asserted separately (the axis crossing); the linearity of a scale is measured without it.
 */
const withoutOrigin = (labels: TextBox[]) => labels.filter((b) => b.text !== "0");

/**
 * THE SCALE IS LINEAR AND THE LABELS SIT ON IT. Given labels sorted along an axis, the pixel gap
 * between consecutive labels must be proportional to the gap between the values they print — one
 * constant of proportionality for the whole axis. This is what makes a numeral a TICK rather than
 * a decoration: it fails if a label is drawn at a position that is not the position of its value.
 */
function scaleIsLinear(labels: TextBox[], at: (b: TextBox) => number): string | null {
  if (labels.length < 3) return null; // two points define any line; nothing to contradict
  const vals = labels.map((b) => Number(b.text));
  const ratios: number[] = [];
  for (let i = 1; i < labels.length; i++) {
    const dv = vals[i] - vals[i - 1];
    if (Math.abs(dv) < 1e-9) return `two labels print the same value: ${labels[i].text}`;
    ratios.push((at(labels[i]) - at(labels[i - 1])) / dv);
  }
  const first = ratios[0];
  const off = ratios.findIndex((r) => Math.abs(r - first) > 0.02 * Math.abs(first) + 0.05);
  return off < 0 ? null : `unit changes along the axis: ${first.toFixed(3)} px/unit then ${ratios[off].toFixed(3)} at "${labels[off + 1].text}"`;
}

function outside(d: Drawn): string[] {
  return d.boxes
    .filter((b) => b.x0 < -0.5 || b.x1 > d.view.w + 0.5 || b.y0 < -0.5 || b.y1 > d.view.h + 0.5)
    .map((b) => `"${b.text}" [${b.x0.toFixed(1)}..${b.x1.toFixed(1)} × ${b.y0.toFixed(1)}..${b.y1.toFixed(1)}] in ${d.view.w}×${d.view.h}`);
}

/* ------------------------------------------------------------------ *
 * D-10 — parametricTrace
 * ------------------------------------------------------------------ */

describe("S241 D-10 — parametricTrace draws the coordinate system its readout quotes", () => {
  const specs = authored("parametricTrace");

  it("both authored specs are reached", () => {
    expect(specs.map((s) => s.where).length).toBeGreaterThanOrEqual(2);
  });

  it("draws two axes, an origin mark and a numeral scale on each", () => {
    for (const { where, widget } of specs) {
      const d = draw(widget);
      const axes = d.svg.querySelector("[data-testid='ptr-axes']");
      expect(axes, `${where}: no axis group`).toBeTruthy();
      // Two axis strokes plus a tick stroke per value, and the origin dot.
      expect(axes!.querySelectorAll("line").length, `${where}: axis + tick strokes`).toBeGreaterThanOrEqual(4);
      expect(axes!.querySelector("circle"), `${where}: no origin mark`).toBeTruthy();
      const nums = numerals(d.boxes);
      expect(nums.some((b) => b.text === "0"), `${where}: the origin is not labelled`).toBe(true);
      // A row (x) and a column (y), each with the origin plus at least one more value.
      const row = rowAt(d.boxes, nums.find((b) => b.text === "0")!.y0);
      const col = columnAt(d.boxes, nums.find((b) => b.text === "0")!.x1);
      expect(row.length, `${where}: x-axis values ${JSON.stringify(row.map((b) => b.text))}`).toBeGreaterThanOrEqual(2);
      expect(col.length, `${where}: y-axis values ${JSON.stringify(col.map((b) => b.text))}`).toBeGreaterThanOrEqual(2);
      expect(scaleIsLinear(withoutOrigin(row), centreX), `${where} x`).toBeNull();
      expect(scaleIsLinear(withoutOrigin(col), centreY), `${where} y`).toBeNull();
      // EVERY NUMERAL SITS ON A TICK. These windows only fit two values per axis besides the
      // origin, which is not enough for the linearity check above to contradict anything — so the
      // numerals are matched to the tick STROKES instead: a value printed anywhere other than its
      // own tick is a label about the wrong place.
      const strokes = Array.from(axes!.querySelectorAll("line"));
      const xTicks = strokes.filter((l) => Number(l.getAttribute("x1")) === Number(l.getAttribute("x2"))).map((l) => Number(l.getAttribute("x1")));
      const yTicks = strokes.filter((l) => Number(l.getAttribute("y1")) === Number(l.getAttribute("y2"))).map((l) => Number(l.getAttribute("y1")));
      for (const b of withoutOrigin(row)) {
        expect(xTicks.some((x) => Math.abs(x - centreX(b)) < 0.6), `${where}: "${b.text}" is not on a tick`).toBe(true);
      }
      for (const b of withoutOrigin(col)) {
        expect(yTicks.some((y) => Math.abs(y - centreY(b)) < 2), `${where}: "${b.text}" is not on a tick`).toBe(true);
      }
      cleanup();
    }
  });

  it("names both axes, and the captions stay decorative", () => {
    for (const { where, widget } of specs) {
      const d = draw(widget);
      const group = d.svg.querySelector("[data-testid='axis-captions']");
      expect(group, `${where}: no axis captions`).toBeTruthy();
      expect(group!.getAttribute("aria-hidden"), where).toBe("true");
      expect(Array.from(group!.querySelectorAll("text")).map((n) => n.textContent), where).toEqual(["x", "y"]);
      cleanup();
    }
  });

  it("THE FIX THAT MATTERS: the origin is inside the picture, not merely undrawn", () => {
    // pp-04-01/i1b is x = t + 1 with t from 0, so the curve's own bounding box starts at x = 1.
    // Before S241 the window was fitted to the curve and x = 0 fell outside it — "x = t + 1" was
    // a statement about a place the learner could not see.
    for (const { where, widget } of specs) {
      const d = draw(widget);
      const axes = d.svg.querySelector("[data-testid='ptr-axes']")!;
      const origin = axes.querySelector("circle")!;
      const ox = Number(origin.getAttribute("cx"));
      const oy = Number(origin.getAttribute("cy"));
      // The two axis lines span the plot box, so "the origin is in frame" is exactly "the axes
      // cross inside their own spans" — not the weaker "somewhere in the viewBox", which the
      // pre-S241 curve-fitted window also satisfied by putting x = 0 five units from the edge,
      // outside the padded plot and under the y-axis caption.
      const [xAxis, yAxis] = Array.from(axes.querySelectorAll("line"));
      const left = Number(xAxis.getAttribute("x1")), right = Number(xAxis.getAttribute("x2"));
      const top = Number(yAxis.getAttribute("y1")), bottom = Number(yAxis.getAttribute("y2"));
      expect(ox, `${where}: origin x ${ox} outside the plot [${left}, ${right}]`).toBeGreaterThan(left + 12);
      expect(ox, `${where}: origin x ${ox} outside the plot [${left}, ${right}]`).toBeLessThan(right - 12);
      expect(oy, `${where}: origin y ${oy} outside the plot [${top}, ${bottom}]`).toBeGreaterThan(top + 12);
      expect(oy, `${where}: origin y ${oy} outside the plot [${top}, ${bottom}]`).toBeLessThan(bottom - 12);
      // and the two axis lines cross exactly there
      expect(Number(xAxis.getAttribute("y1")), `${where}: x-axis is not at y = 0`).toBeCloseTo(oy, 6);
      expect(Number(yAxis.getAttribute("x1")), `${where}: y-axis is not at x = 0`).toBeCloseTo(ox, 6);
      cleanup();
    }
  });

  it("the traced point lands where the scale says it does", () => {
    // Independent route: the line spec's own formula, x = t + lineX0, read off the spec rather
    // than from the engine. At t = 1 the point is at x = 1 + lineX0 = 2, and "2" is a printed
    // tick — so the handle must sit at that numeral's position. This is the property the readout
    // is making a claim about, and nothing in the repo checked it.
    const line = specs.find((s) => s.widget.mode === "line");
    expect(line, "no authored line-mode parametricTrace").toBeTruthy();
    const d = draw(line!.widget, 1);
    const x = 1 + Number(line!.widget.lineX0 ?? 1);
    const tick = numerals(d.boxes).find((b) => Number(b.text) === x);
    expect(tick, `no "${x}" tick to check the handle against`).toBeTruthy();
    // The handle is the tangerine circle; the origin dot is the ink one.
    const handle = Array.from(d.svg.querySelectorAll("circle")).find((c) => (c.getAttribute("fill") ?? "").toLowerCase() !== "none" && c.getAttribute("stroke") === "#fff");
    expect(handle, "no traced point").toBeTruthy();
    expect(Number(handle!.getAttribute("cx"))).toBeCloseTo(centreX(tick!), 1);
  });

  it("no label overlaps another or leaves the canvas, at any t on the lattice", () => {
    for (const { where, widget } of specs) {
      const step = Number(widget.tStep ?? 0.1);
      const tMin = Number(widget.tMin ?? 0);
      const tMax = Number(widget.tMax);
      for (let t = tMin; t <= tMax + 1e-9; t += step * 5) {
        for (const tone of ["neutral", "info"] as const) {
          const d = draw(widget, Number(t.toFixed(4)), tone);
          const at = `${where} t=${t.toFixed(2)} [${tone}]`;
          expect(collisions(d.boxes).map(describeCollision), at).toEqual([]);
          expect(outside(d), at).toEqual([]);
          cleanup();
        }
      }
    }
  }, 60_000);
});

/* ------------------------------------------------------------------ *
 * D-11 — feasibleRegionExplore
 * ------------------------------------------------------------------ */

describe("S241 D-11 — feasibleRegionExplore names and numbers its axes, and keeps its labels on the card", () => {
  const specs = authored("feasibleRegionExplore");

  it("both authored specs are reached", () => {
    expect(specs.length).toBeGreaterThanOrEqual(2);
  });

  it("names both axes and numbers both, origin included", () => {
    for (const { where, widget } of specs) {
      const d = draw(widget);
      const captions = d.svg.querySelector("[data-testid='axis-captions']");
      expect(captions, `${where}: no axis captions`).toBeTruthy();
      expect(Array.from(captions!.querySelectorAll("text")).map((n) => n.textContent), where).toEqual(["x", "y"]);
      const axes = d.svg.querySelector("[data-testid='fre-axes']");
      expect(axes, `${where}: no axis group`).toBeTruthy();
      const zero = numerals(d.boxes).find((b) => b.text === "0");
      expect(zero, `${where}: the origin is not labelled`).toBeTruthy();
      const row = rowAt(d.boxes, zero!.y0);
      const col = columnAt(d.boxes, zero!.x1);
      // The row is x's values (0 is drawn in the corner, so it belongs to both).
      expect(row.map((b) => b.text), `${where}: x values`).toEqual(["0", "2", "4", "6", "8"]);
      expect(col.map((b) => b.text), `${where}: y values`).toEqual(["8", "6", "4", "2", "0"]);
      expect(scaleIsLinear(withoutOrigin(row), centreX), `${where} x`).toBeNull();
      expect(scaleIsLinear(withoutOrigin(col), centreY), `${where} y`).toBeNull();
      cleanup();
    }
  });

  it("THE REPORTED CLIP: no label leaves the 300-unit canvas at any fence position", () => {
    // The corner ON the fence moves with the drag; at x = xMax its "(8, 0)" label used to start at
    // X(8) + 6 = 272 and run to 311 in a 300-wide box. Every reachable fence position, both tones.
    for (const { where, widget } of specs) {
      const min = Number(widget.verticalMin), max = Number(widget.verticalMax), step = Number(widget.verticalStep ?? 1);
      for (let v = min; v <= max; v += step) {
        for (const tone of ["neutral", "info"] as const) {
          const d = draw(widget, v, tone);
          expect(outside(d), `${where} fence=${v} [${tone}]`).toEqual([]);
          expect(collisions(d.boxes).map(describeCollision), `${where} fence=${v} [${tone}]`).toEqual([]);
          cleanup();
        }
      }
    }
  }, 60_000);

  it("PAIRED ACCEPTANCE: every corner still prints its coordinates, and the fence still names itself", () => {
    // "Nothing clips" is trivially satisfiable by drawing nothing. The corner labels are the
    // answer surface of this task — feasibleRegionCorners derives them — so they must all be there.
    for (const { where, widget } of specs) {
      const min = Number(widget.verticalMin), max = Number(widget.verticalMax);
      for (const v of [min, max]) {
        const d = draw(widget, v);
        const coords = d.boxes.filter((b) => /^\(-?[\d.]+, -?[\d.]+\)$/.test(b.text));
        const dots = Array.from(d.svg.querySelectorAll("circle")).length;
        expect(coords.length, `${where} fence=${v}: corner labels`).toBe(dots);
        expect(coords.length, `${where} fence=${v}`).toBeGreaterThanOrEqual(3);
        expect(d.boxes.some((b) => b.text.includes(`x ≤ ${v}`)), `${where} fence=${v}: fence banner`).toBe(true);
        cleanup();
      }
    }
  });
});

/* ------------------------------------------------------------------ *
 * D-12 — argandExplore
 * ------------------------------------------------------------------ */

describe("S241 D-12 — argandExplore makes its live rescale visible", () => {
  const specs = authored("argandExplore");
  const multiply = specs.filter((s) => s.widget.mode === "multiply");

  it("the multiply-mode corpus is reached", () => {
    expect(multiply.length).toBeGreaterThanOrEqual(4);
  });

  it("both axes carry values, including the origin, on the integer lattice the sliders snap to", () => {
    for (const { where, widget } of specs) {
      const d = draw(widget);
      expect(d.svg.querySelector("[data-testid='ag-ticks']"), `${where}: no tick group`).toBeTruthy();
      const nums = numerals(d.boxes);
      expect(nums.some((b) => b.text === "0"), `${where}: origin unlabelled`).toBe(true);
      const zero = nums.find((b) => b.text === "0")!;
      const real = rowAt(d.boxes, zero.y0);
      const imag = columnAt(d.boxes, zero.x1);
      // The extents are the plane's OWN radius, which in multiply mode already holds the target
      // ring: symmetric, integral, and never smaller than the authored gridMax.
      expect(real.length, `${where}: real axis ${JSON.stringify(real.map((b) => b.text))}`).toBe(3);
      expect(imag.length, `${where}: imaginary axis ${JSON.stringify(imag.map((b) => b.text))}`).toBe(3);
      const g = Number(real[2].text);
      expect(real.map((b) => b.text), `${where}: real axis`).toEqual([`-${g}`, "0", `${g}`]);
      expect(imag.map((b) => b.text), `${where}: imaginary axis`).toEqual([`${g}`, "0", `-${g}`]);
      expect(g, `${where}: the plane cannot be smaller than its own gridMax`).toBeGreaterThanOrEqual(Number(widget.gridMax ?? 5));
      expect(g, `${where}: the target ring must be inside the printed extents`).toBeGreaterThanOrEqual(Math.max(Math.abs(Number(widget.targetRe)), Math.abs(Number(widget.targetIm))));
      for (const b of [...real, ...imag]) expect(Number.isInteger(Number(b.text)), `${where}: off-lattice tick ${b.text}`).toBe(true);
      cleanup();
    }
  });

  it("THE DEFECT: when the drag grows the grid, the printed extents grow with it", () => {
    // cn-03-02 multiplies by 2 + 3i. At z = 0 the plane is the authored ±5. Drag z to −4 + 5i and
    // the product is −23 − 2i, so G becomes 23 and every square shrinks to 4.9 units from 22.4 —
    // the same arrow length now means a different modulus. Before S241 nothing on the plane said
    // so; the assertion is that the numbers move when the unit moves.
    const spec = multiply.find((s) => s.where.startsWith("cn-03-02")) ?? multiply[0];
    const before = draw(spec.widget, { re: 0, im: 0 });
    const beforeVals = numerals(before.boxes).map((b) => b.text).sort();
    const beforeUnit = unitOf(before);
    cleanup();
    const after = draw(spec.widget, { re: -4, im: 5 });
    const afterVals = numerals(after.boxes).map((b) => b.text).sort();
    const afterUnit = unitOf(after);
    expect(afterUnit, "the grid unit did not actually change — pick a harder drag").toBeLessThan(beforeUnit - 1);
    expect(afterVals, "the plane rescaled and the printed scale did not follow").not.toEqual(beforeVals);
    expect(afterVals.some((t) => Math.abs(Number(t)) > 5), `extents after the drag: ${afterVals.join(",")}`).toBe(true);
  });

  it("the numerals never collide with the labels that ride the data, anywhere on the lattice", () => {
    // z is dragged on the integer lattice within ±gridMax, and z·w (and the reveal ghost) follow
    // it; those are the labels a new scale row could collide with. The whole reachable lattice.
    for (const { where, widget } of multiply) {
      const g = Number(widget.gridMax ?? 5);
      for (let re = -g; re <= g; re++) {
        for (let im = -g; im <= g; im++) {
          const d = draw(widget, { re, im }, "info");
          const nums = new Set(numerals(d.boxes).map((b) => b.text));
          const hits = collisions(d.boxes).filter((c) => nums.has(c.a.text) || nums.has(c.b.text));
          expect(hits.map(describeCollision), `${where} z=${re}${im < 0 ? "" : "+"}${im}i`).toEqual([]);
          cleanup();
        }
      }
    }
  }, 180_000);
});

/** Pixels per unit, read off the two extent numerals — the thing the learner cannot otherwise see. */
function unitOf(d: Drawn): number {
  const nums = numerals(d.boxes);
  const zero = nums.find((b) => b.text === "0")!;
  const row = rowAt(d.boxes, zero.y0);
  const lo = row[0], hi = row[row.length - 1];
  return (centreX(hi) - centreX(lo)) / (Number(hi.text) - Number(lo.text));
}

/* ------------------------------------------------------------------ *
 * D-25 — the value-graded planes
 * ------------------------------------------------------------------ */

describe("S241 D-25 — scatterFit prints the scale its readout is tuned against", () => {
  const specs = authored("scatterFit");

  it("the corpus is reached", () => expect(specs.length).toBeGreaterThanOrEqual(10));

  it("every spec numbers both axes with its own authored window, ends included", () => {
    for (const { where, widget } of specs) {
      const d = draw(widget);
      expect(d.svg.querySelector("[data-testid='sf-ticks']"), `${where}: no tick group`).toBeTruthy();
      const texts = numerals(d.boxes).map((b) => b.text);
      for (const end of [widget.xMin, widget.xMax, widget.yMin, widget.yMax]) {
        expect(texts, `${where}: window end ${end} unlabelled`).toContain(String(end));
      }
      expect(numerals(d.boxes).length, `${where}: only ${texts.length} numerals`).toBeGreaterThanOrEqual(6);
      cleanup();
    }
  });

  it("the y scale is linear and readable — b is checkable against the picture", () => {
    for (const { where, widget } of specs) {
      const d = draw(widget);
      const col = columnAt(d.boxes);
      expect(col.length, `${where}: y values ${JSON.stringify(col.map((b) => b.text))}`).toBeGreaterThanOrEqual(3);
      expect(col.map((b) => b.text), `${where}: the window's ends must be readable`).toContain(String(widget.yMax));
      expect(scaleIsLinear(col, centreY), `${where} y`).toBeNull();
      cleanup();
    }
  });

  it("no numeral leaves the canvas or lands on another label", () => {
    // SCOPED TO THE SCALE, AND SAYING SO. scatterFit has a separate, older clipping defect this
    // change does not touch: at `tone="info"` the "best fit" ghost label is seated 6 units above
    // the least-squares line at xMax, so on a spec whose best-fit line leaves the window near the
    // top (dm-02-01's 30…70 by 0…140 cloud) the label draws above y = 0. It is recorded rather
    // than folded in here — widening this assertion to every label would fail on a defect that
    // predates the tick values and belongs to its own fix.
    for (const { where, widget } of specs) {
      for (const tone of ["neutral", "info"] as const) {
        const d = draw(widget, null, tone);
        const nums = new Set(numerals(d.boxes).map((b) => b.text));
        expect(outside({ ...d, boxes: numerals(d.boxes) }), `${where} [${tone}]`).toEqual([]);
        const hits = collisions(d.boxes).filter((c) => nums.has(c.a.text) || nums.has(c.b.text));
        expect(hits.map(describeCollision), `${where} [${tone}]`).toEqual([]);
        cleanup();
      }
    }
  }, 30_000);
});

describe("S241 D-25 — slopeField numbers the axis its answer is read off", () => {
  const specs = authored("slopeField");

  it("prints the initial condition's whole range on the y-axis, and the origin", () => {
    // The graded value IS y at x = 0, on a slider from 0 to 8. Both ends must be readable, or the
    // learner is counting unlabelled segment rows to place the answer.
    for (const { where, widget } of specs) {
      const d = draw(widget);
      expect(d.svg.querySelector("[data-testid='sfd-ticks']"), `${where}: no tick group`).toBeTruthy();
      const zero = numerals(d.boxes).find((b) => b.text === "0");
      expect(zero, `${where}: origin unlabelled`).toBeTruthy();
      const col = columnAt(d.boxes, zero!.x1);
      expect(col.map((b) => b.text), `${where}: y values`).toEqual(["8", "6", "4", "2", "0"]);
      expect(scaleIsLinear(withoutOrigin(col), centreY), `${where} y`).toBeNull();
      const row = rowAt(d.boxes, zero!.y0);
      expect(row.map((b) => b.text), `${where}: x values`).toEqual(["-3", "-2", "0", "2", "3"]);
      cleanup();
    }
  });

  it("the numerals stay clear of the labels the solution carries", () => {
    for (const { where, widget } of specs) {
      for (const y0 of [0, 1, 4, 8]) {
        for (const tone of ["neutral", "info"] as const) {
          const d = draw(widget, y0, tone);
          const nums = new Set(numerals(d.boxes).map((b) => b.text));
          const hits = collisions(d.boxes).filter((c) => nums.has(c.a.text) || nums.has(c.b.text));
          expect(hits.map(describeCollision), `${where} y0=${y0} [${tone}]`).toEqual([]);
          expect(outside(d), `${where} y0=${y0} [${tone}]`).toEqual([]);
          cleanup();
        }
      }
    }
  }, 60_000);
});

describe("S241 D-25 — pointSetReasoningLab numbers the plane it asks a value off", () => {
  const specs = authored("pointSetReasoningLab").filter((s) => {
    const sets = (s.widget.sets ?? []) as Array<{ points: Array<{ y?: number }> }>;
    const id = s.widget.targetSetId as string | undefined;
    const target = sets.find((x) => (x as unknown as { id: string }).id === id) ?? sets[0];
    return target?.points.some((p) => p.y !== undefined);
  });

  it("the two-dimensional corpus is reached", () => expect(specs.length).toBeGreaterThanOrEqual(8));

  it("both axes carry values and the origin is named once", () => {
    for (const { where, widget } of specs) {
      const d = draw(widget);
      const values = Array.from(d.svg.querySelectorAll("[data-testid='point-set-tick-value']"));
      const ticks = Array.from(d.svg.querySelectorAll("[data-testid='point-set-tick']"));
      expect(values.length, `${where}: tick values`).toBeGreaterThanOrEqual(4);
      expect(ticks.length, `${where}: tick strokes`).toBe(values.length - 1); // the origin shares the corner
      expect(values.filter((n) => n.textContent === "0").length, `${where}: origin printed once`).toBe(1);
      const zero = numerals(d.boxes).find((b) => b.text === "0")!;
      expect(rowAt(d.boxes, zero.y0).length, `${where}: x values`).toBeGreaterThanOrEqual(2);
      expect(columnAt(d.boxes, zero.x1).length, `${where}: y values`).toBeGreaterThanOrEqual(2);
      expect(scaleIsLinear(rowAt(d.boxes, zero.y0).filter((b) => b.text !== "0"), centreX), `${where} x`).toBeNull();
      cleanup();
    }
  });

  it("PAIRED ACCEPTANCE: the axis NAMES survive the numbering, and nothing prints off the card", () => {
    // The names were never gated (D-25: "names unpinned"), so they are pinned here alongside the
    // values — and the coordinate labels, which used to run to x = 461 in a 440-unit box when a
    // point sat at the domain's right edge, are asserted inside it.
    for (const { where, widget } of specs) {
      for (const tone of ["neutral", "info"] as const) {
        const d = draw(widget, null, tone);
        expect(d.boxes.some((b) => b.text === widget.xLabel), `${where}: x axis name missing`).toBe(true);
        expect(outside(d), `${where} [${tone}]`).toEqual([]);
        expect(collisions(d.boxes).map(describeCollision), `${where} [${tone}]`).toEqual([]);
        cleanup();
      }
    }
  }, 30_000);
});

describe("S241 D-25 — plotPoint says where zero is", () => {
  const specs = authored("plotPoint");

  it("the corpus is reached", () => expect(specs.length).toBeGreaterThan(50));

  it("a 1…N numeric lattice marks its origin", () => {
    // Cell 1 spans [0, 1], so the corner where the two label bands meet IS (0, 0) — the number the
    // grid never printed, on the engine whose lessons teach coordinates.
    let checked = 0;
    for (const { where, widget } of specs) {
      const x = widget.xLabels as string[] | undefined;
      const y = widget.yLabels as string[] | undefined;
      if (!x || !y || x[0] !== "1" || y[0] !== "1" || !x.every((l) => Number.isFinite(Number(l))) || !y.every((l) => Number.isFinite(Number(l)))) continue;
      checked++;
      const spec = WidgetSpec.parse(widget) as TWidget;
      const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
      const origin = container.querySelector("[data-testid='pp-origin']");
      expect(origin, `${where}: no origin marker`).toBeTruthy();
      expect(origin!.textContent, where).toBe("0");
      expect(origin!.getAttribute("aria-hidden"), `${where}: the origin must not join the accessible name`).toBe("true");
      cleanup();
    }
    expect(checked, "no 1…N labelled plotPoint was reached — the rule would be vacuous").toBeGreaterThan(40);
  }, 60_000);

  it("and stays silent where there is no origin to mark", () => {
    // A categorical grid ("Hundreds / Tens / Ones" against "1st / 2nd / 3rd") has no zero, and a
    // grid whose labels already run from 0 shows its own. A number about nothing is worse than no
    // number: both cases must NOT print one.
    let categorical = 0, alreadyZeroed = 0;
    for (const { where, widget } of specs) {
      const x = widget.xLabels as string[] | undefined;
      const y = widget.yLabels as string[] | undefined;
      const numericBand = (l?: string[]) => l !== undefined && l.every((s) => s.trim() !== "" && Number.isFinite(Number(s)));
      const isCategorical = !numericBand(x) || !numericBand(y);
      const startsAtZero = numericBand(x) && numericBand(y) && (Number(x![0]) === 0 || Number(y![0]) === 0);
      if (!isCategorical && !startsAtZero) continue;
      if (isCategorical) categorical++; else alreadyZeroed++;
      const spec = WidgetSpec.parse(widget) as TWidget;
      const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
      expect(container.querySelector("[data-testid='pp-origin']"), `${where}: origin marked on a plane with no origin`).toBeNull();
      cleanup();
    }
    expect(categorical, "no categorical grid reached").toBeGreaterThan(0);
    expect(alreadyZeroed, "no already-zeroed grid reached").toBeGreaterThan(0);
  }, 30_000);

  it("the origin does not become a cell, a label band, or part of a cell's name", () => {
    // The two label bands are read positionally by `widgets.plotPointGrid.s241` (`div[aria-hidden]`
    // → its spans), and every cell's accessible name is the learner's only coordinate. The marker
    // is a span outside both bands and outside the grid tracks, so all three stay as they were.
    const one = specs.find((s) => {
      const x = s.widget.xLabels as string[] | undefined;
      return x?.[0] === "1";
    })!;
    const spec = WidgetSpec.parse(one.widget) as TWidget;
    const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
    const bands = Array.from(container.querySelectorAll('div[aria-hidden="true"]'));
    expect(bands.length, "the x and y label bands").toBe(2);
    for (const band of bands) {
      expect(Array.from(band.querySelectorAll(":scope > span")).some((s) => s.getAttribute("data-testid") === "pp-origin")).toBe(false);
    }
    const buttons = Array.from(container.querySelectorAll("button"));
    expect(buttons.length).toBe(Number(one.widget.cols) * Number(one.widget.rows));
    expect(buttons.some((b) => (b.getAttribute("aria-label") ?? "").includes("0")), "cells keep their own names").toBe(
      (one.widget.xLabels as string[]).some((l) => l.includes("0")) || (one.widget.yLabels as string[]).some((l) => l.includes("0"))
    );
  });
});
