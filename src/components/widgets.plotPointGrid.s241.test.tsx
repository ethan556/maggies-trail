// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { MAX_PLOT_POINT_DIM, WidgetSpec, type TWidget } from "@/lib/schema";
import { VARIANT_GENERATORS, variantFor, variantForGenForm } from "@/lib/variants";

/**
 * S241 / PG-03 — plotPoint IS A COORDINATE PLANE, AND IT IS INVISIBLE TO EVERY AXIS GATE.
 *
 * THE HOLE THIS CLOSES (GG-02, severity C). Every label gate in the repo keys off `<svg>`:
 * `scanTextBoxes` walks SVG text nodes, `axisCaptions.s237` looks for a `data-testid` group inside
 * one, the S238 sweeps iterate `container.querySelectorAll("svg")`. plotPoint draws a DOM BUTTON
 * GRID (`widgets.tsx:15176`) — no SVG, no text nodes, nothing any of them can see. The one check
 * that touched it at all is the variant branch's label COUNT
 * (`variants.test.ts:10731`). So on the single engine whose entire task is "tap the right cell",
 * label CONTENT, label DISTINCTNESS, label WIDTH at 390px and the accessible naming of the cells
 * were unchecked in both the authored and the generated state.
 *
 * WHAT IS PINNED. The properties a learner (sighted or not) needs to use the grid at all:
 *   · the grid is inside the schema's `MAX_PLOT_POINT_DIM` cap on EVERY serving path;
 *   · each axis's labels are non-empty and distinct — two columns named "3" is a plane where the
 *     answer is ambiguous, and the ambiguity is silent;
 *   · every one of `cols × rows` cells is a button, and the `cols × rows` accessible names are all
 *     DIFFERENT: the screen-reader learner navigates by those names and nothing else;
 *   · where axis labels exist the accessible name IS the label pair, so the spoken coordinate and
 *     the printed coordinate are the same coordinate (they are computed in two places);
 *   · each axis label is printed exactly once, on its own axis;
 *   · the label row fits: `max(label chars) × cols ≤ 52`, the 390px character budget.
 *
 * DELIBERATELY NOT ASSERTED, because a live defect blocks it:
 *   TODO(D-05): make `xLabels`/`yLabels` REQUIRED. The 12 unlabeled coordinate specs have since
 *     been authored, so the assertion `every plotPoint carries both label arrays` would pass on
 *     content today — but the rule belongs in `PlotPointSpec` (a schema refine), and until it is
 *     there a new unlabeled spec is legal. This file therefore asserts label CONTENT wherever
 *     labels exist and states the requiredness as a schema TODO rather than a content snapshot.
 *   TODO(D-04): the layout defect. The cell grid uses `minmax(0,1fr)` tracks
 *     (`widgets.tsx:15217`), the x-label row uses a FIXED `repeat(cols, 2.75rem)` (`:15277`), and
 *     the `connectTargets` polyline derives its geometry from a third source, the literal
 *     `const CELL = 48` (`:15193`). At `cols: 8` on a 334px stage the tracks fall to ~35px while
 *     the 44px buttons and the 2.75rem label row do not, so the labels drift off their columns and
 *     the "line through the points" misses the cells it is drawn through. Once the three share one
 *     track source, assert here that the polyline's vertices land on the rendered cell centres and
 *     that the label row's column count and pitch equal the grid's.
 */

afterEach(cleanup);

type Case = { widget: Extract<TWidget, { type: "plotPoint" }>; where: string; state: "authored" | "generated" };

function authoredPlotPoints(): Case[] {
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
      // Remedials included: a remedial check is a servable step, and pr-03-01/rem-ppl-k is a
      // connectTargets grid — exactly the shape D-04 is about.
      const all = [
        ...(lesson.steps ?? []),
        ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))
      ];
      for (const s of all) {
        if (s.widget?.type !== "plotPoint") continue;
        out.push({ widget: s.widget as Case["widget"], where: `${lesson.id}/${s.id}`, state: "authored" });
      }
    }
  }
  return out;
}

/** Every generator × form × band that emits a plotPoint, deduped — the D-03 corner included. */
function generatedPlotPoints(): Case[] {
  const out: Case[] = [];
  const seen = new Set<string>();
  for (const g of VARIANT_GENERATORS) {
    const forms: (string | undefined)[] = [...(g.declarationOnly ? [] : [undefined]), ...(g.forms ?? [])];
    for (const form of forms) {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let s = 0; s < 12; s++) {
          const v = form === undefined ? variantFor(g.tag, `grid-${s}`, band) : variantForGenForm(g.tag, form, `grid-${s}`, band);
          if (v === null || v.widget.type !== "plotPoint") continue;
          const key = JSON.stringify(v.widget);
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({ widget: v.widget as Case["widget"], where: `${g.tag}@${form ?? "default"}@${band} seed grid-${s}`, state: "generated" });
        }
      }
    }
  }
  return out;
}

const AUTHORED = authoredPlotPoints();
const GENERATED = generatedPlotPoints();
const ALL = [...AUTHORED, ...GENERATED];

/** The 390px character budget: a 334px stage across `cols` columns at the label row's ~12px font. */
const CHAR_BUDGET = 52;

function cellNames(spec: TWidget): string[] {
  const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
  const names = Array.from(container.querySelectorAll("button")).map((b) => b.getAttribute("aria-label") ?? "");
  cleanup();
  return names;
}

/** The two aria-hidden label containers the engine draws: the y column and the x row. */
function axisLabelRows(spec: TWidget, tone: "neutral" | "info" = "neutral"): string[][] {
  const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />);
  const rows = Array.from(container.querySelectorAll('div[aria-hidden="true"]')).map((d) =>
    Array.from(d.querySelectorAll(":scope > span")).map((s) => (s.textContent ?? "").trim())
  );
  cleanup();
  return rows;
}

describe("S241 PG-03 — the plotPoint corpus is reached in both states", () => {
  it("finds authored (including remedial) and generated coordinate grids", () => {
    expect(AUTHORED.length, "authored plotPoint specs").toBeGreaterThan(50);
    expect(AUTHORED.some((c) => c.where.includes("rem-")), "no remedial plotPoint reached").toBe(true);
    expect(GENERATED.length, "generated plotPoint specs").toBeGreaterThan(20);
    // The generators that emit this surface, named so a lost route shows up as a failure here
    // rather than as silently reduced coverage.
    const gens = new Set(GENERATED.map((c) => c.where.split("@")[0]));
    for (const g of ["coordinate-plot", "proportional-plot", "pr-graph-rate-g7", "g8-bv-scatter-basics"])
      expect(gens.has(g), `${g} no longer emits plotPoint`).toBe(true);
  });
});

describe("S241 GG-02 — the coordinate grid fits the stage it is drawn on", () => {
  it("no spec, authored or generated, exceeds the schema's column/row cap", () => {
    // The cap is not decorative: past 8 columns the 44px buttons overlap their neighbours on a
    // 390px viewport and adjacent tap targets become ambiguous — on the surface whose whole task
    // is tapping the right cell. This restates the cap at the two places specs come FROM, so a
    // generator emitting 10×10 fails here loudly instead of costing a silent declined refresh.
    const bad: string[] = [];
    for (const { widget: w, where } of ALL) {
      if (w.cols > MAX_PLOT_POINT_DIM) bad.push(`${where}: ${w.cols} columns`);
      if (w.rows > MAX_PLOT_POINT_DIM) bad.push(`${where}: ${w.rows} rows`);
      const parsed = WidgetSpec.safeParse(w);
      if (!parsed.success) bad.push(`${where}: does not parse — ${parsed.error.issues[0]?.message}`);
    }
    expect(bad).toEqual([]);
  });

  it("the axis label row fits the 390px character budget", () => {
    // mult-02-01 labels its columns with words ("stripes"), and pv-01-01 with place names. Those
    // are fine at 3 columns and would not be at 8 — the budget is the product, not either factor.
    const bad: string[] = [];
    for (const { widget: w, where } of ALL) {
      const widest = Math.max(0, ...(w.xLabels ?? []).map((l) => l.length));
      if (widest * w.cols > CHAR_BUDGET)
        bad.push(`${where}: ${widest} chars × ${w.cols} columns = ${widest * w.cols} > ${CHAR_BUDGET}`);
    }
    expect(bad).toEqual([]);
  });

  it("every axis label is non-empty, and distinct within its own axis", () => {
    // Two columns named "3" make the grid ambiguous in BOTH layers at once: the printed label row
    // and the cells' accessible names. Nothing in the schema forbids it (`z.array(z.string())`).
    const bad: string[] = [];
    for (const { widget: w, where } of ALL) {
      for (const [axis, labels, n] of [["xLabels", w.xLabels, w.cols], ["yLabels", w.yLabels, w.rows]] as const) {
        if (!labels) continue;
        if (labels.length !== n) bad.push(`${where}: ${axis} has ${labels.length} entries for ${n} tracks`);
        if (labels.some((l) => l.trim() === "")) bad.push(`${where}: ${axis} contains an empty label`);
        if (new Set(labels).size !== labels.length) bad.push(`${where}: ${axis} repeats a label — ${JSON.stringify(labels)}`);
      }
    }
    expect(bad).toEqual([]);
  });

  it("every target sits on the grid the spec draws", () => {
    // The unplottable-pair class: a target outside the grid is a point the learner is asked to
    // mark and given no cell to mark it in. (Cells are 1-based, which is why `x: 0` is off-grid —
    // the assumption that broke g5e-03-02's "(0,0)".)
    const bad: string[] = [];
    for (const { widget: w, where } of ALL) {
      for (const t of w.targets) {
        if (t.x < 1 || t.x > w.cols) bad.push(`${where}: target x=${t.x} outside 1…${w.cols}`);
        if (t.y < 1 || t.y > w.rows) bad.push(`${where}: target y=${t.y} outside 1…${w.rows}`);
      }
      const keys = w.targets.map((t) => `${t.x},${t.y}`);
      if (new Set(keys).size !== keys.length) bad.push(`${where}: the same cell is listed as a target twice`);
    }
    expect(bad).toEqual([]);
  });
});

describe("S241 GG-02 — the rendered grid names every cell, once, distinctly", () => {
  it("draws exactly one button per cell", () => {
    const bad: string[] = [];
    for (const { widget: w, where } of ALL) {
      const names = cellNames(WidgetSpec.parse(w) as TWidget);
      if (names.length !== w.cols * w.rows) bad.push(`${where}: ${names.length} buttons for a ${w.cols}×${w.rows} grid`);
    }
    expect(bad).toEqual([]);
  }, 120_000);

  it("no two cells share an accessible name", () => {
    // THE property for a screen-reader learner: the accessible name is the only thing that tells
    // them which cell they are on, and `aria-label` is the ONLY carrier of the coordinates (the
    // printed label rows are `aria-hidden`). Two identical names is a plane they cannot navigate.
    const bad: string[] = [];
    for (const { widget: w, where } of ALL) {
      const names = cellNames(WidgetSpec.parse(w) as TWidget);
      const dupes = names.filter((n, i) => names.indexOf(n) !== i);
      if (dupes.length) bad.push(`${where}: repeated cell name(s) ${[...new Set(dupes)].slice(0, 3).join(" · ")}`);
      if (names.some((n) => !n.trim())) bad.push(`${where}: an unnamed cell`);
    }
    expect(bad).toEqual([]);
  }, 120_000);

  it("a labelled axis names its cells with the labels the learner can see", () => {
    // The spoken coordinate and the printed coordinate are produced by two different expressions
    // (`:15230` for the button, `:15214`/`:15272` for the label rows). They must agree, or the
    // accessible plane and the visible plane are different planes.
    const bad: string[] = [];
    let checked = 0;
    for (const { widget: w, where } of ALL) {
      if (!w.xLabels || !w.yLabels) continue; // see TODO(D-05): requiredness is a schema change
      checked++;
      const names = cellNames(WidgetSpec.parse(w) as TWidget);
      // Rows render top → bottom (y = rows … 1), columns left → right.
      const expected: string[] = [];
      for (let y = w.rows; y >= 1; y--) for (let x = 1; x <= w.cols; x++) expected.push(`${w.xLabels[x - 1]}, ${w.yLabels[y - 1]}`);
      if (names.join("|") !== expected.join("|")) {
        const i = names.findIndex((n, k) => n !== expected[k]);
        bad.push(`${where}: cell ${i} named "${names[i]}", expected "${expected[i]}"`);
      }
    }
    expect(bad).toEqual([]);
    expect(checked, "no labelled plotPoint was reached — the rule would be vacuous").toBeGreaterThan(50);
  }, 120_000);

  it("each axis prints its labels exactly once, on its own axis", () => {
    // Paired acceptance for everything above: the grid must not satisfy the distinctness rules by
    // printing no scale at all. Both label bands are drawn, each label once, in spec order.
    const bad: string[] = [];
    for (const { widget: w, where } of ALL) {
      if (!w.xLabels || !w.yLabels) continue;
      const rows = axisLabelRows(WidgetSpec.parse(w) as TWidget);
      if (rows.length !== 2) {
        bad.push(`${where}: ${rows.length} axis label band(s), expected 2`);
        continue;
      }
      // The y column is rendered first (top → bottom, so reversed), the x row last.
      const [yBand, xBand] = rows;
      if (yBand.join("|") !== [...w.yLabels].reverse().join("|")) bad.push(`${where}: y band ${JSON.stringify(yBand)} vs ${JSON.stringify([...w.yLabels].reverse())}`);
      if (xBand.join("|") !== w.xLabels.join("|")) bad.push(`${where}: x band ${JSON.stringify(xBand)} vs ${JSON.stringify(w.xLabels)}`);
    }
    expect(bad).toEqual([]);
  }, 120_000);

  it("the reveal ghost marks the target cells and only the target cells", () => {
    // At `tone="info"` the engine rings every target. That ring is the answer being shown, so
    // ringing a NON-target cell is a wrong answer drawn on the plane — and ringing nothing leaves
    // the reveal empty. Neither is visible to any gate that only reads text.
    const bad: string[] = [];
    for (const { widget: w, where } of ALL) {
      const spec = WidgetSpec.parse(w) as TWidget;
      const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone="info" />);
      const buttons = Array.from(container.querySelectorAll("button"));
      const ringed = new Set<string>();
      buttons.forEach((b, i) => {
        if (!b.querySelector("[data-testid='pp-ghost']")) return;
        const y = w.rows - Math.floor(i / w.cols);
        const x = (i % w.cols) + 1;
        ringed.add(`${x},${y}`);
      });
      cleanup();
      const want = new Set(w.targets.map((t) => `${t.x},${t.y}`));
      if (ringed.size !== want.size || [...want].some((k) => !ringed.has(k)))
        bad.push(`${where}: ghost on ${[...ringed].sort().join(" ")}, targets ${[...want].sort().join(" ")}`);
    }
    expect(bad).toEqual([]);
  }, 120_000);
});
