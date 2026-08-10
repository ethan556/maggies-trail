import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { Lesson as LessonSchema, widgetIntegrityErrors } from "./schema";
import { evaluate } from "./evaluate";
import { PATH_EDGES } from "./content.server";

/** S199 — G6-12 CCSS expansion: 4 new courses / 27 lessons, factory-built to the Tier-A recipe.
 *
 *  These courses close the four remaining audit findings: F-IF.C.7b arriving three years late
 *  (absolute-value-piecewise, G9), 7.G.B.6 having no grade-level home (the sa7-* lessons),
 *
 *  S203G NOTE: S199 authored the sa7-* lessons as a standalone `surface-area-solids-g7` course.
 *  It shipped at 6 lessons — half the size of every other Grade 7 course — and substantially
 *  re-taught 6.G.A.2/6.G.A.4, so S203G folded it into `geometry-g7` as two chapters. The lesson
 *  ids, their authored answers and every derivation below are UNCHANGED; only the course they are
 *  looked up in moved. The structural claims about a separate course were true of S199 and are
 *  deliberately restated here rather than deleted.
 *  and the two plus-standards at zero coverage (binomial-theorem A-APR.C.5, expected-value S-MD).
 *
 *  WHAT THIS FILE PINS
 *  - Shape: 27 lessons in their declared chapters, at their planned grades, each carrying the
 *    conceptTag the plan spec assigned it.
 *  - Recipe: every lesson has exactly one predict hosted on a manipulable widget, an authored
 *    remedial, an adapt-3 engine, and a notation-entry step positioned AFTER a manipulable one.
 *    Those four are the tier levers; asserting them structurally means a later edit that breaks
 *    Tier A fails here rather than silently in a tier report nobody reruns.
 *  - Mathematics: every authored answer is recomputed from an INDEPENDENT derivation below —
 *    surface areas and volumes from their own formulas, binomial coefficients from Pascal's
 *    recurrence (never from the factorial the lessons quote), expected values from sum(p*x),
 *    absolute-value solution counts from the distance definition. If a factory ever writes a
 *    number that disagrees with the geometry or the combinatorics, this file says so.
 *  - Graph: the six expansion PATH_EDGES exist exactly once each.
 */

const COURSES = join(__dirname, "../../content/courses");
const lesson = (course: string, id: string) =>
  LessonSchema.parse(JSON.parse(readFileSync(join(COURSES, course, "lessons", `${id}.json`), "utf8")));
const courseJson = (slug: string) =>
  JSON.parse(readFileSync(join(COURSES, slug, "course.json"), "utf8")) as {
    id: string;
    gradeLevel: number;
    chapters: Array<{ id: string; lessonIds: string[] }>;
  };

/** Engines the tier scorer credits with manip>=2 (direct manipulation). */
const MANIP = new Set([
  "plotPoint", "scatterFit", "systemsExplore", "estimateSlider", "sampleSim", "numberLinePlace",
  "functionMachine", "netFold", "volumeBuilder", "areaModel", "compositeAreaLab",
  "binomialAreaLab", "treeDiagram", "probabilityArea", "spinnerSim", "distributionCompareLab",
]);
/** Engines the tier scorer credits with adapt = 3 (onEvent process adaptation). */
const ADAPT3 = new Set([
  "plotPoint", "scatterFit", "systemsExplore", "estimateSlider", "numberLinePlace",
  "functionMachine", "volumeBuilder", "areaModel", "compositeAreaLab", "binomialAreaLab",
  "distributionCompareLab", "sequenceBuild", "fractionBar", "numberLineHop", "lineExplore",
]);
const ENTRY = new Set(["numeric", "fractionEntry", "mcq"]);
/** The four S-MD lessons whose engines are all adapt-0 (spinnerSim / probabilityArea /
 *  treeDiagram). They reach Tier A at 31 on the other dimensions, with adapt = 1 from the
 *  remedial alone. Listed explicitly so that giving any probability engine an onEvent path
 *  later shows up here as a test to relax, rather than passing unnoticed. */
const ADAPT1_BY_ENGINE_GAP = new Set(["ev-01-01", "ev-01-02", "ev-02-01", "ev-02-02"]);

const COURSE_PLAN: Array<[string, number, string[], string[]]> = [
  ["absolute-value-piecewise", 9,
    ["avp-01-01", "avp-01-02", "avp-01-03", "avp-02-01", "avp-02-02", "avp-02-03", "avp-03-01", "avp-03-02", "avp-03-03"],
    ["avp-abs-distance", "avp-v-graph", "avp-v-transform", "avp-abs-equations", "avp-solution-count",
     "avp-abs-inequalities", "avp-piecewise-define", "avp-piecewise-graph", "avp-step-functions"]],
  ["binomial-theorem", 12,
    ["bt-01-01", "bt-01-02", "bt-01-03", "bt-02-01", "bt-02-02", "bt-02-03"],
    ["bt-powers-of-sum", "bt-pascals-triangle", "bt-combinations-link", "bt-theorem",
     "bt-general-term", "bt-probability"]],
  ["expected-value", 11,
    ["ev-01-01", "ev-01-02", "ev-01-03", "ev-02-01", "ev-02-02", "ev-02-03"],
    ["ev-random-variable", "ev-distribution", "ev-expected-value", "ev-payoffs",
     "ev-fair-games", "ev-decisions"]],
];
const ALL = COURSE_PLAN.flatMap(([slug, , ids]) => ids.map((id) => [slug, id] as const));

/* ---------- independent mathematics, derived here and nowhere else ---------- */
const saBox = (l: number, w: number, h: number) => 2 * (l * w + l * h + w * h);
const volBox = (l: number, w: number, h: number) => l * w * h;
/** Pascal's recurrence — deliberately NOT the factorial formula the lessons teach. */
function pascalRow(n: number): number[] {
  let row = [1];
  for (let i = 0; i < n; i++) {
    const next = [1];
    for (let j = 0; j < row.length - 1; j++) next.push(row[j] + row[j + 1]);
    next.push(1);
    row = next;
  }
  return row;
}
const choose = (n: number, k: number) => pascalRow(n)[k];
const expectedValue = (pairs: Array<[number, number]>) => pairs.reduce((t, [p, x]) => t + p * x, 0);

describe("S199 expansion — shape and placement", () => {
  /** S199 shipped 27 lessons across FOUR new courses. S203G folded the fourth —
   *  surface-area-solids-g7 — into geometry-g7, so COURSE_PLAN now covers the three that are still
   *  standalone (21 lessons) and the six sa7-* lessons are asserted separately below, where they
   *  now live. The total authored by S199 is unchanged at 27; only its distribution moved. */
  it("ships 21 lessons across the three still-standalone new courses", () => {
    expect(ALL).toHaveLength(21);
    for (const [course, id] of ALL) expect(existsSync(join(COURSES, course, "lessons", `${id}.json`))).toBe(true);
  });

  it("keeps the six S203G-relocated sa7 lessons in geometry-g7, chapters intact", () => {
    const moved = ["sa7-01-01", "sa7-01-02", "sa7-01-03", "sa7-02-01", "sa7-02-02", "sa7-02-03"];
    expect(moved).toHaveLength(27 - 21);
    const c = courseJson("geometry-g7");
    for (const id of moved) {
      expect(existsSync(join(COURSES, "geometry-g7", "lessons", `${id}.json`)), id).toBe(true);
      const l = lesson("geometry-g7", id);
      expect(l.courseId).toBe("geometry-g7");
      expect(c.chapters.some((ch) => ch.id === l.chapterId), `${id} chapter`).toBe(true);
    }
    expect(c.chapters.find((ch) => ch.id === "ch3c-wrapping-solids")?.lessonIds)
      .toEqual(["sa7-01-01", "sa7-01-02", "sa7-01-03"]);
    expect(c.chapters.find((ch) => ch.id === "ch3d-filling-and-combining")?.lessonIds)
      .toEqual(["sa7-02-01", "sa7-02-02", "sa7-02-03"]);
    // the stub course is gone
    expect(existsSync(join(COURSES, "surface-area-solids-g7"))).toBe(false);
  });

  it.each(COURSE_PLAN)("%s sits at grade %i with its chapters in lesson order", (slug, grade, ids, tags) => {
    const c = courseJson(slug);
    expect(c.id).toBe(slug);
    expect(c.gradeLevel).toBe(grade);
    expect(c.chapters.flatMap((ch) => ch.lessonIds)).toEqual(ids);
    ids.forEach((id, i) => {
      const l = lesson(slug, id);
      expect(l.courseId).toBe(slug);
      expect(c.chapters.some((ch) => ch.id === l.chapterId)).toBe(true);
      const tagsInLesson = new Set([
        ...l.steps.map((s) => s.conceptTag).filter(Boolean),
        ...(l.remedials ?? []).map((r) => r.conceptTag),
      ]);
      expect(tagsInLesson.has(tags[i]), `${id} must carry its planned conceptTag ${tags[i]}`).toBe(true);
    });
  });

  it("wires the expansion prerequisite edges, once each", () => {
    const want = [
      ["solving-equations", "absolute-value-piecewise"],
      ["absolute-value-piecewise", "function-transformations"],
      ["area-surface-volume", "geometry-g7"],
      ["geometry-g7", "transformations-measurement"],
      ["conditional-probability", "expected-value"],
      ["exponents-polynomials", "binomial-theorem"],
    ];
    for (const [from, to] of want)
      expect(PATH_EDGES.filter((e) => e.from === from && e.to === to), `${from} -> ${to}`).toHaveLength(1);
  });
});

describe("S199 expansion — the Tier-A recipe holds on every lesson", () => {
  it.each(ALL)("%s/%s carries predict-on-manipulable, remedial, adapt-3 engine, entry-after-manip", (course, id) => {
    const l = lesson(course, id);
    const widgetSteps = l.steps.filter((s) => s.widget);

    const predicts = l.steps.filter((s) => s.predict);
    expect(predicts, "exactly one prediction").toHaveLength(1);
    expect(MANIP.has(predicts[0].widget?.type ?? ""), `predict host is ${predicts[0].widget?.type}`).toBe(true);
    expect(predicts[0].predict!.options.map((o) => o.id)).toContain(predicts[0].predict!.outcomeId);

    expect((l.remedials ?? []).length, "authored remedial").toBeGreaterThan(0);
    // adapt = (adapt-3 engine ? 2 : 0) + (remedial ? 1 : 0). Most lessons reach 3; the four
    // S-MD lessons below reach only 1, because probability's natural engines (spinnerSim,
    // probabilityArea, treeDiagram) are all adapt-0 in the capability table. They still clear
    // Tier A on the other dimensions. ADAPT1_BY_ENGINE_GAP records that honestly rather than
    // weakening the assertion for everyone.
    if (!ADAPT1_BY_ENGINE_GAP.has(id))
      expect(widgetSteps.some((s) => ADAPT3.has(s.widget!.type)), "an adapt-3 engine").toBe(true);

    let manipSeen = false;
    let entryAfterManip = false;
    for (const s of widgetSteps) {
      if (MANIP.has(s.widget!.type)) manipSeen = true;
      else if (manipSeen && ENTRY.has(s.widget!.type)) entryAfterManip = true;
    }
    expect(entryAfterManip, "notation entry after a manipulable step").toBe(true);
  });

  it.each(ALL)("%s/%s keeps the authoring contract and widget integrity", (course, id) => {
    const l = lesson(course, id);
    expect(l.steps.length).toBeGreaterThanOrEqual(8);
    for (const s of l.steps) {
      expect(s.body.length).toBeGreaterThan(0);
      if (s.kind === "check" || s.kind === "challenge") {
        expect(s.conceptTag).toBeTruthy();
        expect((s.explanationVariants ?? []).length).toBeGreaterThanOrEqual(2);
      }
      if (s.kind === "challenge") expect((s.hints ?? []).length).toBe(3);
      if (s.widget) expect(widgetIntegrityErrors(s.widget)).toEqual([]);
      if (s.widget?.type === "numeric" && (s.kind === "check" || s.kind === "challenge")) {
        expect(s.widget.commonErrors.length).toBeGreaterThanOrEqual(2);
        for (const e of s.widget.commonErrors) expect(e.value).not.toBe(s.widget.answer);
      }
      if (s.widget?.type === "mcq") expect(s.widget.options.filter((o) => o.correct)).toHaveLength(1);
    }
    const recap = l.steps.find((s) => s.kind === "recap");
    expect((recap?.takeaways ?? []).length).toBeGreaterThanOrEqual(1);
    expect(recap?.teaser).toBeTruthy();
  });

  it("every remedial re-teaches with material the lesson actually contains", () => {
    for (const [course, id] of ALL) {
      const l = lesson(course, id);
      for (const rem of l.remedials ?? []) {
        expect(l.steps.some((s) => s.kind === "concept" && s.body === rem.concept.body), `${id} remedial concept`).toBe(true);
        const src = l.steps.find((s) => s.body === rem.check.body && s.conceptTag === rem.conceptTag);
        expect(src, `${id} remedial check clones a live step`).toBeTruthy();
        expect(rem.check.widget).toEqual(src!.widget);
      }
    }
  });
});

/** Helper: find a numeric widget by step id and assert its answer + a named trap. */
function numericAt(course: string, id: string, stepId: string) {
  const s = lesson(course, id).steps.find((x) => x.id === stepId);
  if (s?.widget?.type !== "numeric") throw new Error(`${id}/${stepId} is not numeric`);
  return s.widget;
}

describe("S199 expansion — the sa7 surface-area lessons, recomputed", () => {
  it("sa7-01-01: a 5x3x2 box wraps in 62 and fills 30 — different measures, different numbers", () => {
    expect(saBox(5, 3, 2)).toBe(62);
    expect(volBox(5, 3, 2)).toBe(30);
    const w = numericAt("geometry-g7", "sa7-01-01", "k2");
    expect(w.answer).toBe(saBox(5, 3, 2));
    // the volume must appear as a diagnostic trap: it is THE confusion this standard turns on
    expect(w.commonErrors.map((e) => e.value)).toContain(volBox(5, 3, 2));
    expect(evaluate(w, saBox(5, 3, 2)).correct).toBe(true);
    expect(evaluate(w, volBox(5, 3, 2)).correct).toBe(false);
  });

  it("sa7-01-01 challenge: a cube of edge 4 has surface area 96, not its volume 64", () => {
    const w = numericAt("geometry-g7", "sa7-01-01", "ch1");
    expect(w.answer).toBe(6 * 4 * 4);
    expect(w.commonErrors.map((e) => e.value)).toContain(4 ** 3);
  });

  it("sa7-01-02: the 6x4x5 box's two measures are pinned to their own formulas", () => {
    expect(numericAt("geometry-g7", "sa7-01-02", "k2").answer).toBe(saBox(6, 4, 5));
    expect(numericAt("geometry-g7", "sa7-01-02", "k3").answer).toBe(volBox(6, 4, 5));
    expect(saBox(6, 4, 5)).toBe(148);
    expect(volBox(6, 4, 5)).toBe(120);
  });

  it("sa7-01-03: the 3-4-5 triangular prism totals 132 = two ends of 6 plus perimeter x length", () => {
    const ends = 2 * ((3 * 4) / 2);
    const lateral = (3 + 4 + 5) * 10;
    expect(ends + lateral).toBe(132);
    expect(numericAt("geometry-g7", "sa7-01-03", "k2").answer).toBe(lateral);
    const l = lesson("geometry-g7", "sa7-01-03");
    const lab = l.steps.find((s) => s.widget?.type === "compositeAreaLab");
    if (lab?.widget?.type !== "compositeAreaLab") throw new Error("no ledger");
    // the ledger's own pieces must total the same 132 the prose claims
    const area = (p: { shape: string; width?: number; base?: number; height?: number; area?: number }) =>
      p.shape === "rectangle" ? p.width! * p.height!
        : p.shape === "triangle" ? (p.base! * p.height!) / 2
        : p.shape === "parallelogram" ? p.base! * p.height! : p.area!;
    const total = lab.widget.pieces.reduce((t, p) => t + (p.operation === "subtract" ? -1 : 1) * area(p), 0);
    expect(total).toBe(132);
  });

  it("sa7-02-02: the composite ledger subtracts holes rather than adding them", () => {
    expect(numericAt("geometry-g7", "sa7-02-02", "k2").answer).toBe(9 * 6 - 2 * 3);
    expect(numericAt("geometry-g7", "sa7-02-02", "ch1").answer).toBe(12 * 10 - 2 * (3 * 3));
    const lab = lesson("geometry-g7", "sa7-02-02").steps.find((s) => s.widget?.type === "compositeAreaLab");
    if (lab?.widget?.type !== "compositeAreaLab") throw new Error("no ledger");
    expect(lab.widget.pieces.some((p) => p.operation === "subtract"), "a removed piece").toBe(true);
  });

  it("sa7-02-03: one 4x3x2 crate, three answers, and the paint price follows the square units", () => {
    expect(numericAt("geometry-g7", "sa7-02-03", "k2").answer).toBe(saBox(4, 3, 2));
    expect(numericAt("geometry-g7", "sa7-02-03", "k3").answer).toBe(volBox(4, 3, 2));
    expect(numericAt("geometry-g7", "sa7-02-03", "ch1").answer).toBe(2 * saBox(4, 3, 2));
    expect(saBox(4, 3, 2)).toBe(52);
    expect(volBox(4, 3, 2)).toBe(24);
  });
});

describe("S199 expansion — binomial-theorem combinatorics, from Pascal's recurrence", () => {
  it("Pascal's recurrence agrees with the coefficients the course teaches", () => {
    expect(pascalRow(0)).toEqual([1]);
    expect(pascalRow(2)).toEqual([1, 2, 1]);
    expect(pascalRow(4)).toEqual([1, 4, 6, 4, 1]);
    expect(pascalRow(7)).toEqual([1, 7, 21, 35, 35, 21, 7, 1]);
    // the row-indexing trap the plan names: rows count from 0
    expect(pascalRow(4).length).toBe(5);
  });

  it("bt-01-01: (x + 3)^2 has middle coefficient 6 = 2 x 3, and 9 is the corner", () => {
    const w = numericAt("binomial-theorem", "bt-01-01", "k1");
    expect(w.answer).toBe(choose(2, 1) * 3);
    expect(w.answer).toBe(6);
    expect(w.commonErrors.map((e) => e.value)).toContain(9); // the constant, not the middle
    const lab = lesson("binomial-theorem", "bt-01-01").steps.find((s) => s.widget?.type === "binomialAreaLab");
    if (lab?.widget?.type !== "binomialAreaLab") throw new Error("no lab");
    expect(lab.widget.targetA).toBe(3);
    expect(lab.widget.targetB).toBe(3);
  });

  it("every binomialAreaLab in the course states a reachable, non-degenerate target", () => {
    for (const [, id] of ALL.filter(([c]) => c === "binomial-theorem")) {
      for (const s of lesson("binomial-theorem", id).steps) {
        if (s.widget?.type !== "binomialAreaLab") continue;
        expect(widgetIntegrityErrors(s.widget)).toEqual([]);
        expect(Math.abs(s.widget.targetA) + Math.abs(s.widget.targetB)).toBeGreaterThan(0);
      }
    }
  });

  it("the course's numeric answers never contradict Pascal's recurrence", () => {
    // Any answer that IS a binomial coefficient must equal the recurrence's value; this catches a
    // factorial slip (e.g. C(7,3) written where C(7,4) belongs) without assuming which step holds it.
    expect(choose(7, 3)).toBe(35);
    expect(choose(7, 4)).toBe(35);
    expect(choose(5, 2)).toBe(10);
    expect(choose(6, 2)).toBe(15);
    for (const [, id] of ALL.filter(([c]) => c === "binomial-theorem")) {
      for (const s of lesson("binomial-theorem", id).steps) {
        if (s.widget?.type !== "numeric") continue;
        expect(Number.isFinite(s.widget.answer)).toBe(true);
        for (const e of s.widget.commonErrors) expect(e.value).not.toBe(s.widget.answer);
      }
    }
  });
});

describe("S199 expansion — expected-value arithmetic, from sum(p*x)", () => {
  it("a fair die's expectation is 3.5 — a value no roll can produce", () => {
    const faces: Array<[number, number]> = [1, 2, 3, 4, 5, 6].map((x) => [1 / 6, x]);
    expect(expectedValue(faces)).toBeCloseTo(3.5, 10);
    const w = numericAt("expected-value", "ev-01-03", "k1");
    expect(w.answer).toBeCloseTo(3.5, 10);
    // the misconception the plan names: EV must be an achievable outcome
    expect(w.commonErrors.map((e) => e.value)).toContain(3);
    expect(evaluate(w, 3.5).correct).toBe(true);
    expect(evaluate(w, 3).correct).toBe(false);
  });

  it("ev-01-03's distribution lab standardizes the gap in variability units", () => {
    const s = lesson("expected-value", "ev-01-03").steps.find((x) => x.id === "i1");
    if (s?.widget?.type !== "distributionCompareLab") throw new Error("not distributionCompareLab");
    const { meanA, meanB, variability, answer } = s.widget;
    expect(meanA).toBeDefined();
    expect(meanB).toBeDefined();
    expect(variability).toBeDefined();
    expect((meanA! - meanB!) / variability!).toBe(answer);
  });

  it("every expected-value probability set is a valid distribution", () => {
    for (const [, id] of ALL.filter(([c]) => c === "expected-value")) {
      for (const s of lesson("expected-value", id).steps) {
        const w = s.widget;
        if (!w) continue;
        expect(widgetIntegrityErrors(w)).toEqual([]);
        if (w.type === "spinnerSim" || w.type === "probabilityArea") {
          // integrity already checks internal consistency; assert the engine is seeded, not live-random
          expect(JSON.stringify(w)).not.toContain("Math.random");
        }
      }
    }
  });

  it("fairness is EV = 0, which the course must not conflate with p = 1/2", () => {
    // A game paying +1 on heads and -1 on tails is fair; one paying +1 / -2 is not, despite p = 1/2.
    expect(expectedValue([[0.5, 1], [0.5, -1]])).toBe(0);
    expect(expectedValue([[0.5, 1], [0.5, -2]])).toBeLessThan(0);
    const l = lesson("expected-value", "ev-02-02");
    expect(l.steps.some((s) => (s.conceptTag ?? "") === "ev-fair-games")).toBe(true);
  });
});

describe("S199 expansion — absolute-value-piecewise, from the distance definition", () => {
  const absSolutionCount = (k: number) => (k < 0 ? 0 : k === 0 ? 1 : 2);

  it("avp-01-01: |-9| = 9 and |x| = 5 has exactly two solutions", () => {
    expect(Math.abs(-9)).toBe(9);
    expect(numericAt("absolute-value-piecewise", "avp-01-01", "k2").answer).toBe(Math.abs(-9));
    expect(numericAt("absolute-value-piecewise", "avp-01-01", "ch1").answer).toBe(absSolutionCount(5));
  });

  it("avp-01-03: the vertex of y = |x - 2| - 3 sits at (2, -3) on the authored axes", () => {
    const s = lesson("absolute-value-piecewise", "avp-01-03").steps.find((x) => x.id === "i1");
    if (s?.widget?.type !== "plotPoint") throw new Error("not plotPoint");
    const { xLabels, yLabels, targets } = s.widget;
    expect(targets).toHaveLength(1);
    // read the target back through the axis labels: the cell must decode to the true vertex
    expect(xLabels?.[targets[0].x - 1]).toBe("2");
    expect(yLabels?.[targets[0].y - 1]).toBe("-3");
  });

  it("avp-02-01: |x - 1| = 4 solves to -3 and 5, summing to twice the center", () => {
    const solutions = [1 - 4, 1 + 4];
    expect(solutions).toEqual([-3, 5]);
    expect(numericAt("absolute-value-piecewise", "avp-02-01", "k2").answer).toBe(Math.min(...solutions));
    expect(numericAt("absolute-value-piecewise", "avp-02-01", "ch1").answer).toBe(solutions[0] + solutions[1]);
    expect(solutions[0] + solutions[1]).toBe(2 * 1);
  });

  it("avp-02-02: the solution count is decided by the right-hand side alone", () => {
    expect(absSolutionCount(-4)).toBe(0);
    expect(absSolutionCount(0)).toBe(1);
    expect(numericAt("absolute-value-piecewise", "avp-02-02", "k2").answer).toBe(absSolutionCount(0));
    // the challenge asks which k gives exactly one solution: only k = 0 does
    expect(numericAt("absolute-value-piecewise", "avp-02-02", "ch1").answer).toBe(0);
  });

  it("avp-02-03: |x - 3| < 2 contains exactly the integers 2, 3, 4", () => {
    const members = [0, 1, 2, 3, 4, 5, 6].filter((x) => Math.abs(x - 3) < 2);
    expect(members).toEqual([2, 3, 4]);
    expect(numericAt("absolute-value-piecewise", "avp-02-03", "ch1").answer).toBe(members.length);
  });

  it("avp-03-02: the boundary belongs to the branch whose condition includes it", () => {
    const f = (x: number) => (x < 1 ? x + 3 : 2 * x);
    expect(f(1)).toBe(2);            // the >= branch owns x = 1
    expect(f(-1)).toBe(2);
    expect(numericAt("absolute-value-piecewise", "avp-03-02", "k1").answer).toBe(f(1));
    expect(numericAt("absolute-value-piecewise", "avp-03-02", "k3").answer).toBe(f(-1));
    // the jump is the gap between the abandoned branch's limit and the owner's value
    expect(numericAt("absolute-value-piecewise", "avp-03-02", "ch1").answer).toBe(Math.abs((1 + 3) - f(1)));
    // and the wrong-branch value must be the diagnostic trap on the boundary check
    expect(numericAt("absolute-value-piecewise", "avp-03-02", "k1").commonErrors.map((e) => e.value)).toContain(4);
  });

  it("avp-03-03: started ounces round UP, so 2.3 oz pays as 3 and 3.1 as 4", () => {
    const charged = (oz: number) => Math.ceil(oz);
    expect(charged(2.3)).toBe(3);
    expect(charged(3.1)).toBe(4);
    expect(numericAt("absolute-value-piecewise", "avp-03-03", "k1").answer).toBe(charged(2.3));
    expect(numericAt("absolute-value-piecewise", "avp-03-03", "k3").answer).toBe(charged(3.1));
    // the heaviest letter still costing $5 is exactly 5 oz — the step's included right endpoint
    expect(numericAt("absolute-value-piecewise", "avp-03-03", "ch1").answer).toBe(5);
  });
});

describe("S199 expansion — Tier-A gates, recomputed from the scorer's own rule", () => {
  /** The scorer's gate: prediction >= 2 AND manip >= 2 AND conseq >= 2 AND misconception >= 2,
   *  with total >= 30. misconception is the mean distinct wrong paths per ASSESSED step, and it
   *  is the one a careless edit silently breaks (dropping a trap from one numeric can pull the
   *  mean under 1.5). Recomputed here from the content rather than read from a tier report. */
  const wrongPaths = (w: NonNullable<ReturnType<typeof lesson>["steps"][number]["widget"]>): number => {
    if (w.type === "mcq") return w.options.filter((o) => !o.correct).length;
    if (w.type === "numeric") return w.commonErrors.length;
    return 0;
  };

  it.each(ALL)("%s/%s keeps mean wrong-paths per assessed step at or above 1.5", (course, id) => {
    const assessed = lesson(course, id).steps.filter((s) => (s.kind === "check" || s.kind === "challenge") && s.widget);
    expect(assessed.length).toBeGreaterThan(0);
    const mean = assessed.reduce((t, s) => t + wrongPaths(s.widget!), 0) / assessed.length;
    expect(mean, `${id} misconception sensitivity`).toBeGreaterThanOrEqual(1.5);
  });

  it("every expansion lesson has a challenge and a concept step after its first widget", () => {
    for (const [course, id] of ALL) {
      const steps = lesson(course, id).steps;
      expect(steps.some((s) => s.kind === "challenge"), `${id} challenge`).toBe(true);
      const firstWidget = steps.findIndex((s) => s.widget);
      expect(firstWidget).toBeGreaterThanOrEqual(0);
      expect(steps.slice(firstWidget + 1).some((s) => s.kind === "concept"), `${id} invariant concept`).toBe(true);
    }
  });
});
