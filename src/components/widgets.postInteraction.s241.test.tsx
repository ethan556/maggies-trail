// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, hopSizeAnswer, type TWidget } from "@/lib/schema";
import { collisions, describeCollision, scanTextBoxes, type TextBox } from "./textBoxes.testkit";

/**
 * S241 / PG-04 — THE FRAMES A LEARNER SEES AFTER TOUCHING THE GRAPH.
 *
 * THE HOLE THIS CLOSES (GG-03, severity H). Every collision scanner in the repo renders
 * `value={null}` — the untouched opening frame — and `labelCollision.s237` sweeps the tones
 * `["neutral", "info"]` only. So two whole dimensions of the reachable label space had no failing
 * gate at all:
 *   · STATE I, the post-interaction frame. Labels anchored to what the learner DRAGS or BUILDS
 *     move with the value; a chart whose opening frame is clean can collide the moment a bar
 *     reaches its ceiling.
 *   · `tone="error"`, the frame every learner sees after a miss. It is the one frame a struggling
 *     learner sees MOST, and it was swept by nothing that could fail.
 *
 * WHAT BUILDING THIS FOUND, AND WHY THE SHAPE IS WHAT IT IS. Measured across these five engines:
 * only ONE of them draws SVG text that depends on the learner's value.
 *   barBuilder      — YES. The per-bar count label is the learner's own number, drawn against the
 *                     gridline ladder. `value: [8, 8]` on `maxVal: 8` puts both count labels at
 *                     the top gridline's baseline. This is GG-03's named hazard and it is the one
 *                     engine here where state I is a genuinely new label space.
 *   numberLinePlace — the marker carries NO label; the only value-dependent text is the reveal
 *                     ghost ("target") at `tone="info"`, drawn when the placement is not correct.
 *   numberLineHop   — the lattice and the ruler are spec-derived; the landing marker is unlabelled.
 *   boxPlot         — three floating axis numerals and nothing else (this absence is D-14, an open
 *                     defect; nothing here asserts it should stay that way).
 *   scatterFit      — the `y = mx + b` readout is HTML, not SVG (the absence of numerals on the
 *                     plane is D-25).
 * That measurement is the reason the gate still sweeps all five: "this engine's text does not move
 * with the value" is a property, and a future readout that starts moving with the value is exactly
 * the regression class this file exists to catch. It is asserted the honest way — by rendering the
 * states and checking them — not by asserting that no label exists.
 *
 * PAIRED ACCEPTANCE. Each frame must still SAY what the learner needs: the axis ladder, the
 * category names, the built counts, the reveal ghost. A gate that only says "no" can be satisfied
 * by suppressing the scale, which is a different defect rather than a fix.
 *
 * The full numberLineHop corpus (463 authored specs) runs behind an env flag, the shape the S238
 * sweeps established:
 *   POSTINTERACTION_SWEEP=1 npx vitest run src/components/widgets.postInteraction.s241.test.tsx
 */

afterEach(cleanup);

type Frame = { name: string; value: unknown; tone: "neutral" | "error" | "info" };

function scan(raw: Record<string, unknown>, frame: Frame): { boxes: TextBox[]; skipped: string[]; hits: string[] } {
  const spec = WidgetSpec.parse(raw) as TWidget;
  const { container } = render(
    <WidgetRenderer spec={spec} value={frame.value} onChange={() => {}} disabled={false} tone={frame.tone} />
  );
  const boxes: TextBox[] = [];
  const skipped: string[] = [];
  for (const svg of Array.from(container.querySelectorAll("svg"))) {
    const s = scanTextBoxes(svg);
    boxes.push(...s.boxes);
    skipped.push(...s.skipped.filter((x) => !x.includes("non-translate transform")));
  }
  cleanup();
  return { boxes, skipped, hits: collisions(boxes).map(describeCollision) };
}

const texts = (boxes: TextBox[]) => boxes.map((b) => b.text);

/** Every authored spec of a type, remedials included — a remedial check is a servable step. */
function corpus(type: string): Array<{ where: string; w: Record<string, unknown> }> {
  const out: Array<{ where: string; w: Record<string, unknown> }> = [];
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
        ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))
      ];
      for (const s of all) if (s.widget?.type === type) out.push({ where: `${lesson.id}/${s.id}`, w: s.widget! });
    }
  }
  return out;
}

/** Run every frame of every spec and collect what went wrong. */
function sweep(specs: Array<{ where: string; w: Record<string, unknown> }>, frames: (w: Record<string, unknown>) => Frame[], accept?: (t: string[], w: Record<string, unknown>, f: Frame) => string | null): string[] {
  const bad: string[] = [];
  for (const { where, w } of specs) {
    for (const frame of frames(w)) {
      const { boxes, skipped, hits } = scan(w, frame);
      const at = `${where} · ${frame.name} [${frame.tone}]`;
      if (skipped.length) bad.push(`${at} — unmodellable: ${skipped.slice(0, 2).join("; ")}`);
      if (hits.length) bad.push(`${at} — ${hits.slice(0, 2).join(" | ")}`);
      const miss = accept?.(texts(boxes), w, frame);
      if (miss) bad.push(`${at} — ${miss}`);
    }
  }
  return bad;
}

/* ------------------------------------------------------------------ *
 * barBuilder — the one engine here whose drawn text is the learner's
 * own number. The plan's named fixture is "maxVal:8 fully built (per-bar
 * count labels vs gridline labels)"; the corpus sweep generalises it.
 * ------------------------------------------------------------------ */

/** The states a learner actually passes through: empty, the answer, the ceiling, and an overshoot. */
function barFrames(w: Record<string, unknown>): Frame[] {
  const target = w.target as number[];
  const maxVal = w.maxVal as number;
  const step = w.step as number;
  const zeros = target.map(() => 0);
  const ceiling = target.map(() => maxVal);
  // One bar pushed a full step past its answer — the commonest wrong build, and the one that puts
  // a count label somewhere the target never does.
  const over = target.map((t, i) => (i === 0 ? Math.min(maxVal, t + step) : t));
  const out: Frame[] = [];
  for (const [name, value] of [["empty", zeros], ["built to target", target], ["every bar at the ceiling", ceiling], ["one bar overshot", over]] as const)
    for (const tone of ["neutral", "error"] as const) out.push({ name, value, tone });
  // The reveal ghost only draws at info, and only against a state that is not already the answer.
  out.push({ name: "reveal against an overshoot", value: over, tone: "info" });
  return out;
}

describe("S241 GG-03 — barBuilder's built states, at every tone including error", () => {
  const specs = corpus("barBuilder");

  it("finds the corpus", () => {
    expect(specs.length).toBeGreaterThan(50);
  });

  it("no built state, at any tone, puts two labels on top of each other", () => {
    // The acceptance is display-aware, because the three displays draw in different layers.
    // `display: "bar"` draws an SVG axis; `"tally"` draws one mark-SVG per category with no text
    // in it; `"pictograph"` draws no SVG at all — its icons and counts are HTML. Asserting SVG
    // labels for all three would have failed g2g-02-01 for having the layout it is supposed to
    // have, which is a gate bug rather than a finding.
    const bad = sweep(
      specs.filter(({ w }) => (w.display ?? "bar") === "bar"),
      barFrames,
      (t, w, f) => {
        // Paired acceptance, per frame: the axis still states its floor and ceiling, every column
        // keeps its name, and the learner's own counts are printed. Suppression that ate the count
        // labels would silence the very thing the built state is about.
        const missing: string[] = [];
        if (!t.includes("0")) missing.push("axis floor 0");
        if (!t.includes(String(w.maxVal))) missing.push(`axis ceiling ${w.maxVal}`);
        for (const c of w.categories as string[]) if (!t.includes(c)) missing.push(`column name "${c}"`);
        if (Array.isArray(f.value)) for (const v of new Set(f.value as number[])) if (!t.includes(String(v))) missing.push(`built count ${v}`);
        return missing.length ? `missing ${missing.slice(0, 3).join(", ")}` : null;
      }
    );
    expect(bad).toEqual([]);
  }, 300_000);

  it("tally and pictograph builds keep their counts and category names too", () => {
    // The same paired acceptance for the two mark-making displays, read where they actually draw:
    // the DOM. A built pictograph must show each category, its icons and its count.
    const marks = specs.filter(({ w }) => (w.display ?? "bar") !== "bar");
    expect(marks.length, "no tally/pictograph barBuilder in the corpus").toBeGreaterThan(0);
    const bad: string[] = [];
    for (const { where, w } of marks) {
      const spec = WidgetSpec.parse(w) as TWidget;
      const built = (w.target as number[]).slice();
      for (const tone of ["neutral", "error", "info"] as const) {
        const { container } = render(
          <WidgetRenderer spec={spec} value={built} onChange={() => {}} disabled={false} tone={tone} />
        );
        const said = container.textContent ?? "";
        for (const c of w.categories as string[]) if (!said.includes(c)) bad.push(`${where} [${tone}]: lost category "${c}"`);
        for (const v of new Set(built)) if (!said.includes(String(v))) bad.push(`${where} [${tone}]: lost count ${v}`);
        cleanup();
      }
    }
    expect(bad).toEqual([]);
  }, 120_000);

  it("the named fixture: maxVal 8, fully built — count labels against the top gridline", () => {
    // The plan's fixture, spelled out so the failure it guards is readable without the sweep.
    const spec = {
      type: "barBuilder", prompt: "p", categories: ["A", "B"], target: [5, 3], maxVal: 8, step: 1,
      successFeedback: "y", partialFeedback: "keep building"
    };
    for (const tone of ["neutral", "error", "info"] as const) {
      const { boxes, hits } = scan(spec, { name: "fully built", value: [8, 8], tone });
      expect(hits, `maxVal 8 fully built [${tone}]`).toEqual([]);
      // Both counts are drawn AND the gridline they sit against is still labelled.
      expect(texts(boxes).filter((s) => s === "8").length, "the ceiling gridline plus two counts of 8").toBeGreaterThanOrEqual(3);
    }
  });
});

/* ------------------------------------------------------------------ *
 * numberLinePlace — the reveal ghost is the value-dependent label, and
 * the adversarial case is a marker sitting exactly ON a labelled tick.
 * ------------------------------------------------------------------ */

function placeFrames(w: Record<string, unknown>): Frame[] {
  const target = w.target as number;
  const min = w.min as number, max = w.max as number, step = w.step as number;
  const placements = (w.commonPlacements as Array<{ value: number }> | undefined) ?? [];
  const trap = placements[0]?.value ?? Math.min(max, target + step);
  const out: Frame[] = [];
  for (const [name, value] of [["at the target", target], ["at the first trap placement", trap], ["at the low end", min], ["at the high end", max]] as const)
    for (const tone of ["neutral", "error"] as const) out.push({ name, value, tone });
  // The reveal, drawn against a wrong placement — the ghost's label is the one that moves.
  out.push({ name: "reveal against the trap", value: trap, tone: "info" });
  return out;
}

describe("S241 GG-03 — numberLinePlace after the marker has been dragged", () => {
  const specs = corpus("numberLinePlace");

  it("finds the corpus", () => {
    expect(specs.length).toBeGreaterThan(40);
  });

  it("no placement, at any tone, collides — and the line still states its own range", () => {
    const bad = sweep(specs, placeFrames, (t, w) => {
      const ends = [w.min, w.max].map(String);
      // A fraction line labels its ends in jump units too, so both spellings are accepted; what
      // may never happen is a line that has stopped naming where it starts and stops.
      const named = ends.filter((e) => t.includes(e)).length;
      return named === 0 ? `the line names neither end (${ends.join(" … ")})` : null;
    });
    expect(bad).toEqual([]);
  }, 300_000);

  it("the named fixture: a marker AT a labelled negative tick", () => {
    // ns-04-01/e1's shape with the marker parked on −5, a tick the ruler labels. The sign glyph
    // makes "−5" the widest label on the line; if the marker ever gains a readout this is where
    // it lands on the tick's own label.
    const spec = {
      type: "numberLinePlace", prompt: "p", min: -10, max: 10, tickStep: 1, step: 1, start: 0, target: -5,
      commonPlacements: [{ value: 5, feedback: "sign dropped: 5 is the mirror of −5, not −5" }],
      successFeedback: "y", lowFeedback: "low", highFeedback: "high"
    };
    for (const value of [-5, 5, -10, 10]) {
      for (const tone of ["neutral", "error", "info"] as const) {
        const { boxes, hits } = scan(spec, { name: `marker ${value}`, value, tone });
        expect(hits, `marker at ${value} [${tone}]`).toEqual([]);
        expect(texts(boxes), `marker at ${value} [${tone}]: the negative end`).toContain("-10");
      }
    }
    // The reveal ghost IS drawn against a wrong placement, and does not collide with the ruler.
    const revealed = scan(spec, { name: "reveal", value: 5, tone: "info" });
    expect(texts(revealed.boxes), "the reveal ghost").toContain("target");
    expect(revealed.hits).toEqual([]);
  });
});

/* ------------------------------------------------------------------ *
 * boxPlot and scatterFit — five handles and two sliders the learner
 * drags. Their SVG text does not move today; their MARKS do, and a
 * degenerate drag (Q1 = med = Q3, or a near-vertical fit) is the state
 * where a future readout would land on the axis.
 * ------------------------------------------------------------------ */

function boxFrames(w: Record<string, unknown>): Frame[] {
  const n = (k: string) => w[k] as number;
  const mid = Math.round((n("axisMin") + n("axisMax")) / 2);
  const states: Array<[string, unknown]> = [
    ["the authored start", { min: n("startMin"), q1: n("startQ1"), med: n("startMed"), q3: n("startQ3"), max: n("startMax") }],
    ["the solved plot", { min: n("targetMin"), q1: n("targetQ1"), med: n("targetMed"), q3: n("targetQ3"), max: n("targetMax") }],
    ["degenerate box — Q1 = med = Q3", { min: n("axisMin"), q1: mid, med: mid, q3: mid, max: n("axisMax") }],
    ["all five handles collapsed", { min: mid, q1: mid, med: mid, q3: mid, max: mid }],
    ["whiskers at both extremes", { min: n("axisMin"), q1: n("axisMin"), med: mid, q3: n("axisMax"), max: n("axisMax") }]
  ];
  return states.flatMap(([name, value]) => (["neutral", "error", "info"] as const).map((tone) => ({ name, value, tone })));
}

describe("S241 GG-03 — boxPlot's dragged states", () => {
  const specs = corpus("boxPlot");

  it("finds the corpus", () => {
    expect(specs.length).toBeGreaterThan(0);
  });

  it("every reachable five-handle state renders clean, degenerate ones included", () => {
    const bad = sweep(specs, boxFrames, (t, w) => {
      // Paired acceptance: the axis numerals survive every drag. (That there are only three of
      // them, with no tick strokes and no handle readouts, is D-14 — an open defect, deliberately
      // NOT pinned here. This asserts the axis is still drawn, not that three is enough.)
      const ends = [String(w.axisMin), String(w.axisMax)];
      return ends.every((e) => t.includes(e)) ? null : `the axis stopped naming ${ends.join(" … ")}`;
    });
    expect(bad).toEqual([]);
  }, 120_000);
});

function scatterFrames(w: Record<string, unknown>): Frame[] {
  const num = (k: string, d: number) => (typeof w[k] === "number" ? (w[k] as number) : d);
  const mMin = num("mMin", -3), mMax = num("mMax", 3), bMin = num("bMin", -5), bMax = num("bMax", 15);
  const states: Array<[string, unknown]> = [
    ["the authored start", { m: num("mStart", 0), b: num("bStart", 0) }],
    ["steepest positive tilt", { m: mMax, b: bMax }],
    ["steepest negative tilt", { m: mMin, b: bMin }],
    ["flat line, mid height", { m: 0, b: Math.round((bMin + bMax) / 2) }]
  ];
  return states.flatMap(([name, value]) => (["neutral", "error", "info"] as const).map((tone) => ({ name, value, tone })));
}

describe("S241 GG-03 — scatterFit's dragged fit line", () => {
  const specs = corpus("scatterFit");

  it("finds the corpus", () => {
    expect(specs.length).toBeGreaterThan(5);
  });

  it("every slider extreme renders clean, and the plane keeps naming its axes", () => {
    const bad = sweep(specs, scatterFrames, (t) =>
      t.length === 0 ? "the plane drew no labels at all" : null
    );
    expect(bad).toEqual([]);
  }, 120_000);
});

/* ------------------------------------------------------------------ *
 * numberLineHop — the landing states. Always-on as the ten named cases
 * from labelCollision.s237 (its fixture set, now driven through
 * landings and the error tone); the full 463-spec corpus behind the
 * env flag.
 * ------------------------------------------------------------------ */

const hop = (extra: Record<string, unknown>): Record<string, unknown> => ({
  type: "numberLineHop", prompt: "p", direction: "forward", commonLandings: [],
  successFeedback: "y", missFeedback: "z", ...extra
});

const trap = (value: number) => ({ value, feedback: "a computed misconception, named in full" });

/**
 * numberLineHop is TWO engines behind one type (`widgets.tsx:15762`), and their `value` means
 * different things: in LANDING mode it is a position on the line, in HOP-SIZE mode (the GCF shape,
 * `hopSizeTargets` present) it is the STRIDE. Driving one with the other's values is not a
 * learner-reachable frame — it is a harness bug, and the first draft of this file was exactly
 * that: a landing of 0 became a stride of 0 and `HopSizeW`'s landing loop
 * (`for (let k = 0; start + k*h <= max; k++)`, `:15784`) never terminated. The stride is
 * slider-bounded to `hopSizeMin ?? 1` and the schema floors `hopSizeMin` at 1, so 0 is not a state
 * a learner can produce; the frames below stay inside each mode's own value contract.
 */
function hopFrames(w: Record<string, unknown>): Frame[] {
  const start = w.start as number;
  const states: Array<[string, unknown]> = [];
  if (Array.isArray(w.hopSizeTargets)) {
    const lo = (w.hopSizeMin as number | undefined) ?? 1;
    const hi = (w.hopSizeMax as number | undefined) ?? 12;
    const answer = hopSizeAnswer(start, w.hopSizeTargets as number[], lo, hi);
    states.push(["the smallest stride", lo], ["the largest stride", hi]);
    if (answer !== null && answer !== lo && answer !== hi) states.push(["the answering stride", answer]);
  } else {
    const step = w.hop as number, hops = w.hops as number;
    const dir = w.direction === "back" ? -1 : 1;
    const landings = (w.commonLandings as Array<{ value: number }> | undefined) ?? [];
    states.push(
      ["the correct landing", start + dir * step * hops],
      ["the first trap landing", landings[0]?.value ?? start],
      ["still at the start", start]
    );
  }
  return states.flatMap(([name, value]) => (["neutral", "error", "info"] as const).map((tone) => ({ name, value, tone })));
}

const HOP_CASES: Array<{ where: string; w: Record<string, unknown> }> = [
  { where: "g3w-01-02/i1 — 0…60, hops of 7, trap landings 28 and 8", w: hop({ min: 0, max: 60, start: 0, hop: 7, hops: 5, commonLandings: [trap(28), trap(8)] }) },
  { where: "0…20, start 9, one hop of 9", w: hop({ min: 0, max: 20, start: 9, hop: 9, hops: 1 }) },
  { where: "count by tens", w: hop({ min: 0, max: 100, start: 0, hop: 10, hops: 3 }) },
  { where: "backwards, with the reveal ghost drawn", w: hop({ min: 0, max: 20, start: 17, hop: 3, hops: 2, direction: "back" }) },
  { where: "a rational lattice — sixths", w: hop({ min: 0, max: 8, start: 0, hop: 1, hops: 3, denom: 6 }) },
  { where: "negatives across zero", w: hop({ min: -10, max: 10, start: 0, hop: 3, hops: 2 }) },
  { where: "a thousand-wide line", w: hop({ min: 0, max: 1000, start: 0, hop: 125, hops: 4 }) },
  { where: "adjacent trap landings", w: hop({ min: 0, max: 60, start: 0, hop: 7, hops: 5, commonLandings: [trap(8), trap(9)] }) }
];

describe("S241 GG-03 — numberLineHop after a landing is chosen", () => {
  it("every landing state of the named cases is clean at all three tones", () => {
    const bad = sweep(HOP_CASES, hopFrames, (t, w) => {
      // The ruler is still a ruler after the tap: a real scale, not two orphaned marks. Ends are
      // checked only on INTEGER lines — a `denom` line prints its lattice as fractions ("1/6",
      // "1 1/3"), so `String(max)` is not the string the engine draws, and pinning that spelling
      // belongs to a fraction-label gate rather than to a collision one.
      if (t.length < 4) return `only ${t.length} labels left on the line`;
      if (w.denom !== undefined) return null;
      const ends = [String(w.min), String(w.max)];
      return ends.some((e) => t.includes(e)) ? null : `the line names neither end (${ends.join(" … ")})`;
    });
    expect(bad).toEqual([]);
  });
});

describe.skipIf(!process.env.POSTINTERACTION_SWEEP)("S241 GG-03 — the full numberLineHop corpus in state I", () => {
  it("all 400+ authored hop lines, three landing states, three tones", () => {
    const specs = corpus("numberLineHop");
    expect(specs.length).toBeGreaterThan(400);
    const bad = sweep(specs, hopFrames);
    if (bad.length) {
      // eslint-disable-next-line no-console
      console.log(`\n[PG-04 sweep] ${bad.length} finding(s):\n  ${bad.slice(0, 40).join("\n  ")}`);
    }
    expect(bad).toEqual([]);
  }, 1_800_000);
});
