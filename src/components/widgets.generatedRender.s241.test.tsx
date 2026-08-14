// @vitest-environment jsdom
import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { WidgetRenderer } from "./widgets";
import { MAX_PLOT_POINT_DIM, WidgetSpec, type TWidget } from "@/lib/schema";
import { VARIANT_GENERATORS, variantFor, variantForGenForm } from "@/lib/variants";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

/**
 * S241 / PG-01 — THE GENERATED CORPUS IS RENDERED BY A GATE THAT CAN GO RED.
 *
 * THE HOLE THIS CLOSES (GG-01, severity C). Verified by cross-grep before this file existed: no
 * test in the repo both imported a `variantFor*` function AND rendered. Every widget spec that
 * reaches a learner through practice (`PracticeClient.tsx:74`), review (`ReviewClient.tsx:118`)
 * or the Mastery Studio bank (`masteryMission.server.ts:204`) had never been mounted by any gate.
 * The collision sweeps render authored specs; the variant sweeps check generated NUMBERS. State G
 * — a generated spec, drawn — was unmounted everywhere, which is how D-01, D-02 and D-03 all
 * shipped past a fully green suite.
 *
 * WHAT IT RENDERS. Every generator × every reachable form × ALL THREE BANDS, up to two DISTINCT
 * specs per cell. The cell, not the seed count, is the unit that matters: the form sweep in
 * `variants.test.ts` runs declared forms at the default band only and the band sweep hands a
 * non-declarationOnly generator only its `default` form, so a form whose spec depends on the band
 * fell between them — exactly where the 10×10 plotPoint reached the stretch band (D-03). Deduping
 * by serialized spec keeps the walk honest: rendering the same widget twenty times is not
 * twenty times the coverage.
 *
 * WHAT IT ASSERTS, per spec, at tones `neutral` AND `error` (the tone a learner sees after a miss,
 * which no failing gate swept before S241):
 *   (a) `WidgetSpec.parse` succeeds — the gate-time twin of the serve-time parse `variantForStep`
 *       runs. The runtime can only DECLINE a forbidden spec; this fails loudly instead.
 *   (b) the render throws nothing;
 *   (c) every `<svg>` it draws is collision-free under the S237 box model;
 *   (d) PAIRED ACCEPTANCE — a gate that passes by drawing nothing is worthless, so a graph-bearing
 *       spec must produce labels, and the ruler engines must produce a SCALE (≥ 2);
 *   (e) nothing goes quiet by becoming unmeasurable: the skip list stays empty apart from the one
 *       rotated y-caption transform the box model refuses corpus-wide.
 *
 * SCOPE, STATED PLAINLY. The always-on run covers the GRAPH-BEARING types — the surfaces
 * GRAPH_FIGURE_STANDARD.md governs. The whole generated corpus (every emitted type, 25 seeds,
 * three tones, no per-cell cap) runs behind an env flag, the same shape as the S238 sweeps:
 *   GENERATED_RENDER_SWEEP=1 npx vitest run src/components/widgets.generatedRender.s241.test.tsx
 */

afterEach(cleanup);

/** The types this file is responsible for: what the graph/figure standard actually governs. */
const GRAPH_BEARING = new Set([
  "numberLinePlace", "numberLineHop", "numberLineRay", "absValueLine",
  "plotPoint", "graphRead", "graphStoryLab", "pointSetReasoningLab",
  "affineRelationshipLab", "distributionCompareLab", "trialProbabilityLab",
  "signChart", "dotPlot", "barBuilder", "boxPlot", "scatterFit"
]);

/**
 * Engines whose whole job is a ruler: one surviving label is not a scale, it is a stray number.
 * graphRead is deliberately NOT here — in picture mode its SVG is a row of ICONS and the numeric
 * scale lives in the HTML button row beneath it, so a label count says nothing about that engine.
 * Its own acceptance is the icon count below, and its axis honesty is GG-04 (see
 * `widgetIntegrity.graphs.s241.test.ts`).
 */
const RULERS = new Set(["numberLinePlace", "numberLineHop", "numberLineRay", "absValueLine"]);

/**
 * NEW DEFECTS FOUND BY THIS GATE ON ITS FIRST RUN — NOT APPROVED EXEMPTIONS.
 *
 * Both were invisible to every existing gate for the same reason this file exists: their AUTHORED
 * specs are clean (the S238 remainder ledger is at zero corpus-wide) and their GENERATED specs
 * were never rendered. Both are keyed `widgetType|generatorTag@form`, and only the COLLISION
 * clause is waived — parse, render, skip-list and paired acceptance still apply to them.
 *
 * The list ratchets: a collision in any cell not named here fails immediately, and entries should
 * only ever leave. Do not add to it to make a build pass.
 *
 *  1. `trialProbabilityLab|prob-fraction@trialRelFreq` — 13 of 72 sampled specs.
 *     The "compares successes to NON-successes" trap is an improper fraction (7/1, 9/1, 13/2,
 *     19/1, 37/3). `axisMax = max(total, ceil(maxClaim))` (`widgets.tsx:1915`) is driven by that
 *     trap, so a 0…40 claim line becomes a 0…280 one and the `whole = 40` end-anchored label
 *     (`:1971`) is crushed back onto the `0` tick (`:1962`). The S240 comment above that line
 *     fixed the RIGHT-edge overflow of the same label; nobody considered the left-edge crush that
 *     a distractor-driven rescale produces. The learner cannot read either end of the scale.
 *  2. `affineRelationshipLab|g8-les-system-verify@lesVerifyPoint` — 48 of 72 sampled specs.
 *     The line labels are staggered against EACH OTHER by `lineLabelY` (`widgets.tsx:8199`) and
 *     the candidate-point label (`:8208`) is placed at a fixed `(+8, −8)` offset from the point
 *     with no obstacle awareness. The plot's domain is computed FROM the candidate point
 *     (`:8163`/`:8168`), so on a verify-the-solution item the candidate is routinely at the
 *     domain's top-right corner — the seat the line labels already occupy.
 */
const KNOWN_GENERATED_COLLISIONS = new Set<string>([
  "trialProbabilityLab|prob-fraction@trialRelFreq",
  "affineRelationshipLab|g8-les-system-verify@lesVerifyPoint"
]);

type Emitted = { widget: TWidget; cell: string; where: string };

/** Every generator × form × band, deduped, capped per cell. `typeFilter` selects what to keep. */
function walk(opts: { perCell: number; seeds: number; keep: (type: string) => boolean }): Emitted[] {
  const out: Emitted[] = [];
  for (const g of VARIANT_GENERATORS) {
    const forms: (string | undefined)[] = [...(g.declarationOnly ? [] : [undefined]), ...(g.forms ?? [])];
    for (const form of forms) {
      for (const band of ["support", "core", "stretch"] as const) {
        const seen = new Set<string>();
        for (let s = 0; s < opts.seeds && seen.size < opts.perCell; s++) {
          const v =
            form === undefined
              ? variantFor(g.tag, `render-${s}`, band)
              : variantForGenForm(g.tag, form, `render-${s}`, band);
          if (v === null || !opts.keep(v.widget.type)) continue;
          const key = JSON.stringify(v.widget);
          if (seen.has(key)) continue;
          seen.add(key);
          out.push({
            widget: v.widget,
            cell: `${v.widget.type}|${g.tag}@${form ?? "default"}`,
            where: `${v.widget.type} ${g.tag}@${form ?? "default"}@${band} seed render-${s}`
          });
        }
      }
    }
  }
  return out;
}

type Finding = { collisions: string[]; skipped: string[]; labels: number; svgs: number; threw: string | null };

function drawOnce(spec: TWidget, tone: "neutral" | "error" | "info"): Finding {
  const f: Finding = { collisions: [], skipped: [], labels: 0, svgs: 0, threw: null };
  try {
    const { container } = render(
      <WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} tone={tone} />
    );
    const svgs = Array.from(container.querySelectorAll("svg"));
    f.svgs = svgs.length;
    for (const svg of svgs) {
      const scan = scanTextBoxes(svg);
      f.labels += scan.boxes.length;
      // The rotated y-axis caption is the ONE transform this model refuses, corpus-wide; every
      // other unplaceable label means a widget has gone unmeasurable, which is not a pass.
      f.skipped.push(...scan.skipped.filter((s) => !s.includes("non-translate transform")));
      f.collisions.push(...collisions(scan.boxes).map(describeCollision));
    }
  } catch (err) {
    f.threw = (err as Error).message.slice(0, 160);
  }
  cleanup();
  return f;
}

const GRAPH_SPECS = walk({ perCell: 2, seeds: 12, keep: (t) => GRAPH_BEARING.has(t) });

describe("S241 PG-01 — every generated graph spec parses, draws, and draws legibly", () => {
  it("the walk reaches the generated graph corpus", () => {
    // Vacuity guard: every assertion below is universally quantified over this set.
    expect(GRAPH_SPECS.length).toBeGreaterThan(400);
    const kinds = new Set<string>(GRAPH_SPECS.map((e) => e.widget.type));
    // The engines the generators actually emit. A generator that starts emitting a NEW graph type
    // is picked up automatically by GRAPH_BEARING; one that stops emitting an old one shows here.
    for (const must of ["numberLinePlace", "numberLineHop", "plotPoint", "graphStoryLab", "pointSetReasoningLab", "affineRelationshipLab", "distributionCompareLab"])
      expect(kinds.has(must), `${must} no longer generated — the sweep lost coverage`).toBe(true);
  });

  it("every generated graph spec survives the schema it will be served through", () => {
    // (a) The gate-time twin of the serve-time parse. A spec the schema forbids costs the learner
    // a refresh at runtime (it is declined) and is a defect here.
    const bad: string[] = [];
    for (const { widget, where } of GRAPH_SPECS) {
      const parsed = WidgetSpec.safeParse(widget);
      if (!parsed.success) bad.push(`${where}: ${parsed.error.issues.slice(0, 2).map((i) => `${i.path.join(".")} ${i.message}`).join("; ")}`);
    }
    expect(bad).toEqual([]);
  });

  it("renders every one of them at neutral AND error tone without throwing", () => {
    // (b) The error tone is the frame every learner sees after a miss and was swept by no failing
    // gate before S241 (GG-03's other half).
    const bad: string[] = [];
    for (const { widget, where } of GRAPH_SPECS) {
      const spec = WidgetSpec.parse(widget) as TWidget;
      for (const tone of ["neutral", "error"] as const) {
        const f = drawOnce(spec, tone);
        if (f.threw) bad.push(`${where} [${tone}]: ${f.threw}`);
      }
    }
    expect(bad).toEqual([]);
  }, 300_000);

  it("no generated graph draws two labels on top of each other", () => {
    // (c) + the ratchet. See KNOWN_GENERATED_COLLISIONS — two cells are open findings, everything
    // else must be clean, and anything new fails here on arrival.
    const fresh: string[] = [];
    const knownStillFiring = new Set<string>();
    for (const { widget, where, cell } of GRAPH_SPECS) {
      const spec = WidgetSpec.parse(widget) as TWidget;
      for (const tone of ["neutral", "error"] as const) {
        const f = drawOnce(spec, tone);
        if (f.collisions.length === 0) continue;
        if (KNOWN_GENERATED_COLLISIONS.has(cell)) knownStillFiring.add(cell);
        else fresh.push(`${where} [${tone}]: ${f.collisions.slice(0, 2).join(" | ")}`);
      }
    }
    if (fresh.length) {
      // eslint-disable-next-line no-console
      console.log(`\n[PG-01] ${fresh.length} NEW generated collision(s):\n  ${fresh.slice(0, 20).join("\n  ")}`);
    }
    const stale = [...KNOWN_GENERATED_COLLISIONS].filter((c) => !knownStillFiring.has(c));
    if (stale.length) {
      // eslint-disable-next-line no-console
      console.log(`\n[PG-01] baseline entries that no longer fire — delete them:\n  ${stale.join("\n  ")}`);
    }
    expect(fresh).toEqual([]);
  }, 300_000);

  it("nothing passes by drawing nothing, and nothing goes quiet by becoming unmeasurable", () => {
    // (d) + (e). Suppression that eats the scale is a different defect, not a fix — the same
    // paired-acceptance rule labelCollision.s237 states for the authored engines.
    const bad: string[] = [];
    for (const { widget, where } of GRAPH_SPECS) {
      const spec = WidgetSpec.parse(widget) as TWidget;
      for (const tone of ["neutral", "error"] as const) {
        const f = drawOnce(spec, tone);
        if (f.skipped.length) bad.push(`${where} [${tone}] — unmodellable: ${f.skipped.slice(0, 2).join("; ")}`);
        // plotPoint is a DOM button grid, not an SVG — it has no text boxes to count, and its own
        // acceptance lives in widgets.plotPointGrid.s241.test.tsx (GG-02).
        if (spec.type === "plotPoint") continue;
        if (f.svgs === 0) bad.push(`${where} [${tone}] — a graph engine drew no SVG at all`);
        else if (f.labels === 0) bad.push(`${where} [${tone}] — drew an SVG with no labels at all`);
        else if (RULERS.has(spec.type) && f.labels < 2)
          bad.push(`${where} [${tone}] — a ruler with ${f.labels} label is not a scale`);
      }
    }
    expect(bad).toEqual([]);
  }, 300_000);

  it("a generated pictograph draws one icon per unit it claims to draw", () => {
    // graphRead's own paired acceptance, in its own terms. The picture-mode SVG carries no scale —
    // the count IS the picture, and `drawn` is the number the aria label and the grader both use.
    // A generated pictograph that drew nine icons for `drawn: 10` would be a silent data lie no
    // label-counting rule could see.
    const picture = GRAPH_SPECS.filter((e) => e.widget.type === "graphRead");
    expect(picture.length, "no generated graphRead was reached").toBeGreaterThan(0);
    for (const { widget, where } of picture) {
      const w = widget as Extract<TWidget, { type: "graphRead" }>;
      if (w.mode !== "picture") continue;
      const { container } = render(
        <WidgetRenderer spec={WidgetSpec.parse(w) as TWidget} value={null} onChange={() => {}} disabled={false} />
      );
      expect(container.querySelectorAll("[data-testid='gread-icon']").length, `${where}: icons drawn`).toBe(w.drawn);
      cleanup();
    }
  });

  it("D-03 regression pin: the stretch band's scatter grid stays inside the schema cap", () => {
    // The named seed from the plan. g8-bv-scatter-basics × bvScatterPlot × stretch emitted a
    // 10×10 plotPoint against `PlotPointSpec`'s max(8) and reached learners unparsed. It is
    // pinned here as a RENDER, which is the evidence class that was missing: 100 fixed-width
    // 44px buttons cannot fit the 334px stage a 390px viewport offers.
    for (let s = 0; s < 12; s++) {
      const v = variantForGenForm("g8-bv-scatter-basics", "bvScatterPlot", `pin-${s}`, "stretch");
      expect(v, "the D-03 seed must still generate").not.toBeNull();
      const w = v!.widget as Extract<TWidget, { type: "plotPoint" }>;
      expect(w.type).toBe("plotPoint");
      expect(w.cols, `seed pin-${s}: columns`).toBeLessThanOrEqual(MAX_PLOT_POINT_DIM);
      expect(w.rows, `seed pin-${s}: rows`).toBeLessThanOrEqual(MAX_PLOT_POINT_DIM);
      const spec = WidgetSpec.parse(w) as TWidget;
      const { container } = render(<WidgetRenderer spec={spec} value={null} onChange={() => {}} disabled={false} />);
      expect(container.querySelectorAll("button").length, `seed pin-${s}: one button per cell`).toBe(w.cols * w.rows);
      cleanup();
    }
  });
});

/* ------------------------------------------------------------------ *
 * OPT-IN FULL RATCHET — the whole generated corpus, every emitted type,
 * every generator × form × band cell, three distinct specs per cell drawn
 * from a 25-seed pool, all three tones. ~9,246 cells → ~25k specs → ~75k
 * renders, about ten minutes, so it is committed and skipped by default
 * in the shape the S238 sweeps established:
 *   GENERATED_RENDER_SWEEP=1 npx vitest run \
 *     src/components/widgets.generatedRender.s241.test.tsx
 * Unlike collisionSweep.s238 this one IS a gate — it fails on parse,
 * throw, and any collision outside the named baseline.
 *
 * Unmodellable labels are ratcheted BY ENGINE rather than by count. One
 * engine legitimately lands there: shapeHierarchyLab writes its
 * side-length labels with no `font-size`, so the box model refuses to
 * place them — in the AUTHORED corpus (18 texts across its 19 specs)
 * exactly as in the generated one. That is part of the pre-existing
 * 288-text skip total collisionSweep.s238 already reports, not something
 * a generator introduced, and failing on the COUNT here would be
 * importing another gate's open ledger. Failing on a NEW ENGINE name is
 * the property that matters: it would mean an engine had just gone
 * invisible to every collision model in the repo. The always-on block
 * above keeps the strict zero-skip assertion, where it is earned — the
 * graph-bearing engines skip nothing.
 * ------------------------------------------------------------------ */

/** Engines whose labels the S237 box model cannot place, corpus-wide, authored included. */
const UNMODELLABLE_BY_DESIGN = new Set(["shapeHierarchyLab"]);

describe.skipIf(!process.env.GENERATED_RENDER_SWEEP)("S241 PG-01 — full generated corpus", () => {
  let specs: Emitted[] = [];
  beforeAll(() => {
    specs = walk({ perCell: 3, seeds: 25, keep: () => true });
  });

  it("every generated spec of every type parses, renders and stays legible", () => {
    expect(specs.length).toBeGreaterThan(20_000);
    const bad: string[] = [];
    const unmodellable = new Map<string, number>();
    for (const { widget, where, cell } of specs) {
      const parsed = WidgetSpec.safeParse(widget);
      if (!parsed.success) {
        bad.push(`${where}: PARSE ${parsed.error.issues[0]?.message}`);
        continue;
      }
      for (const tone of ["neutral", "error", "info"] as const) {
        const f = drawOnce(parsed.data as TWidget, tone);
        if (f.threw) bad.push(`${where} [${tone}]: THREW ${f.threw}`);
        if (f.skipped.length) unmodellable.set(widget.type, (unmodellable.get(widget.type) ?? 0) + f.skipped.length);
        if (f.collisions.length && !KNOWN_GENERATED_COLLISIONS.has(cell))
          bad.push(`${where} [${tone}]: ${f.collisions.slice(0, 2).join(" | ")}`);
      }
    }
    if (unmodellable.size) {
      // Counts are informational (vitest hides stdout from passing tests — run with
      // `--reporter=verbose` to see them); the ENGINE LIST is the ratchet, asserted below.
      // eslint-disable-next-line no-console
      console.log(`\n[PG-01 sweep] unmodellable labels by engine: ${[...unmodellable.entries()].sort((a, b) => b[1] - a[1]).map(([t, n]) => `${t}:${n}`).join(" ")}`);
    }
    if (bad.length) {
      // eslint-disable-next-line no-console
      console.log(`\n[PG-01 sweep] ${bad.length} finding(s):\n  ${[...new Set(bad)].slice(0, 60).join("\n  ")}`);
    }
    const newlyUnmeasurable = [...unmodellable.keys()].filter((t) => !UNMODELLABLE_BY_DESIGN.has(t)).sort();
    expect(newlyUnmeasurable, "an engine has gone invisible to the collision model").toEqual([]);
    expect(bad).toEqual([]);
  }, 1_800_000);
});
