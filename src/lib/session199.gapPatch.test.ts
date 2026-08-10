// S199 — G6-12 CCSS gap patch: ingestion + mastery-optimization contracts.
// Phase 1 ingested 21 authored lessons verbatim (2 new courses, 2 chapter insertions,
// 1 seam edit, 5 path edges). Phase 2 added ONLY: predicts hosted on manip>=2 widgets
// (moved verbatim; iar-01-03 authored fresh), one subject-true interactive per weak lesson,
// remedials cloning c2 + a check verbatim, and two formalization numerics. Expected values
// below are computed by independent arithmetic, never read from the implementation.
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

const root = join(__dirname, "../..");
const lesson = (course: string, id: string) =>
  JSON.parse(readFileSync(join(root, "content/courses", course, "lessons", `${id}.json`), "utf8"));
const courseJson = (slug: string) =>
  JSON.parse(readFileSync(join(root, "content/courses", slug, "course.json"), "utf8"));

const GAP: Array<[string, string[]]> = [
  ["inequalities-and-regions", ["iar-01-01","iar-01-02","iar-01-03","iar-02-01","iar-02-02","iar-02-03","iar-03-01","iar-03-02","iar-03-03"]],
  ["nonlinear-systems", ["nls-01-01","nls-01-02","nls-01-03","nls-02-01","nls-02-02","nls-02-03"]],
  ["statistical-inference", ["si-06-01","si-06-02","si-06-03"]],
  ["bivariate-statistics", ["bv-05-01","bv-05-02","bv-05-03"]],
];
const OPTIMIZED = new Set(["iar-01-03","iar-02-03","iar-03-03","nls-01-03","nls-02-03","si-06-01","si-06-03","bv-05-01","bv-05-02"]);
const MANIP2 = new Set(["plotPoint","systemsExplore","estimateSlider","sampleSim","scatterFit"]); // caps manip>=2

describe("S199 phase 1 — structural ingestion", () => {
  it("registers all 21 lessons in their declared chapters", () => {
    for (const [slug, ids] of GAP) {
      const declared = courseJson(slug).chapters.flatMap((ch: { lessonIds: string[] }) => ch.lessonIds);
      for (const id of ids) expect(declared, `${slug} declares ${id}`).toContain(id);
    }
  });
  it("inserts the bell-curve chapter between margin-of-error and is-the-difference-real", () => {
    const ids = courseJson("statistical-inference").chapters.map((ch: { id: string }) => ch.id);
    expect(ids.indexOf("ch6-the-bell")).toBe(ids.indexOf("ch3-margin-of-error") + 1);
    expect(ids.indexOf("ch4-is-the-difference-real")).toBe(ids.indexOf("ch6-the-bell") + 1);
  });
  it("appends the residuals chapter as the bivariate course close", () => {
    const ch = courseJson("bivariate-statistics").chapters;
    expect(ch[ch.length - 1].id).toBe("ch5-what-the-line-misses");
  });
  it("applies the si-03-03 seam edit verbatim", () => {
    const recap = lesson("statistical-inference", "si-03-03").steps.find((s: { kind: string }) => s.kind === "recap");
    expect(recap.teaser).toBe("Next: the SHAPE all that wobble builds \u2014 the bell curve, its 68-95-99.7 promise, and a ruler called z.");
  });
  it("wires the five path edges", () => {
    const cs = readFileSync(join(root, "src/lib/content.server.ts"), "utf8");
    for (const [f, t] of [["solving-equations","inequalities-and-regions"],["systems-equations","inequalities-and-regions"],["quadratics","nonlinear-systems"],["systems-equations","nonlinear-systems"],["nonlinear-systems","conic-sections"]])
      expect(cs).toContain(`{ from: "${f}", to: "${t}" }`);
  });
});

describe("S199 phase 2 — mastery recipe on every optimized lesson", () => {
  for (const [slug, ids] of GAP) for (const id of ids) {
    it(`${id}: predict hosted on a manip>=2 widget; optimized lessons carry a remedial`, () => {
      const L = lesson(slug, id);
      const predictSteps = L.steps.filter((s: { predict?: unknown }) => s.predict);
      expect(predictSteps.length, "exactly one predict").toBe(1);
      expect(MANIP2.has(predictSteps[0].widget?.type), `${id} predict host ${predictSteps[0].widget?.type}`).toBe(true);
      if (OPTIMIZED.has(id)) {
        expect(L.remedials?.length, "remedial present").toBe(1);
        const rem = L.remedials[0];
        const src = L.steps.find(
          (s: { body?: string; conceptTag?: string }) => s.body === rem.check.body && s.conceptTag === rem.conceptTag
        );
        expect(src, "remedial check clones a live step verbatim").toBeTruthy();
        expect(rem.check.widget).toEqual(src.widget);
        expect(L.steps.some((s: { kind: string; body: string }) => s.kind === "concept" && s.body === rem.concept.body)).toBe(true);
      }
    });
  }
});

describe("S199 phase 2 — the added mathematics, verified independently", () => {
  it("plotPoint additions: targets inside the grid, traps distinct from targets", () => {
    for (const [slug, id] of [["inequalities-and-regions","iar-02-03"],["inequalities-and-regions","iar-03-03"],["nonlinear-systems","nls-01-03"],["nonlinear-systems","nls-02-03"],["bivariate-statistics","bv-05-01"]] as const) {
      const w = lesson(slug, id).steps.find((s: { id: string }) => s.id === "i1b").widget;
      expect(w.type).toBe("plotPoint");
      for (const t of w.targets) { expect(t.x).toBeGreaterThanOrEqual(1); expect(t.x).toBeLessThanOrEqual(w.cols); expect(t.y).toBeGreaterThanOrEqual(1); expect(t.y).toBeLessThanOrEqual(w.rows); }
      for (const e of w.pointErrors) expect(w.targets.some((t: {x:number;y:number}) => t.x === e.x && t.y === e.y)).toBe(false);
    }
  });
  it("iar-02-03 i1b sits on the cap: x + y = 6 at x = 4", () => {
    const t = lesson("inequalities-and-regions","iar-02-03").steps.find((s: {id:string}) => s.id==="i1b").widget.targets[0];
    expect(t.x + t.y).toBe(6); expect(t.x).toBe(4);
  });
  it("iar-03-03 i1b is the vertex of x = 4 and x + 2y = 8", () => {
    const t = lesson("inequalities-and-regions","iar-03-03").steps.find((s: {id:string}) => s.id==="i1b").widget.targets[0];
    expect(t.x).toBe(4); expect(t.x + 2 * t.y).toBe(8);
  });
  it("nls-01-03 i1b is the double root of x\u00b2 = 2x \u2212 1", () => {
    const t = lesson("nonlinear-systems","nls-01-03").steps.find((s: {id:string}) => s.id==="i1b").widget.targets[0];
    expect(t.y).toBe(t.x * t.x);            // on the parabola
    expect(t.y).toBe(2 * t.x - 1);          // on the line
    expect((t.x - 1) ** 2).toBe(0);         // the double root
  });
  it("nls-02-03 i1b satisfies both y = 3 and x\u00b2 + y\u00b2 = 25", () => {
    const t = lesson("nonlinear-systems","nls-02-03").steps.find((s: {id:string}) => s.id==="i1b").widget.targets[0];
    expect(t.y).toBe(3); expect(t.x * t.x + t.y * t.y).toBe(25);
  });
  it("bv-05-01 i1b: observed = prediction of 2x+1 at x=2, plus residual +1", () => {
    const t = lesson("bivariate-statistics","bv-05-01").steps.find((s: {id:string}) => s.id==="i1b").widget.targets[0];
    expect(t.x).toBe(2); expect(t.y).toBe(2 * t.x + 1 + 1);
  });
  it("bv-05-02 scatterFit: least squares over (1,1),(2,4),(3,9),(4,16) is \u0177 = 5x \u2212 5, residuals +1,\u22121,\u22121,+1, two negative", () => {
    const step = lesson("bivariate-statistics","bv-05-02").steps.find((s: {id:string}) => s.id==="i1b");
    const pts: Array<[number, number]> = step.widget.points;
    const n = pts.length;
    const xbar = pts.reduce((a, p) => a + p[0], 0) / n, ybar = pts.reduce((a, p) => a + p[1], 0) / n;
    const sxy = pts.reduce((a, p) => a + p[0] * p[1], 0) - n * xbar * ybar;
    const sxx = pts.reduce((a, p) => a + p[0] * p[0], 0) - n * xbar * xbar;
    const m = sxy / sxx, b = ybar - m * xbar;
    expect(m).toBe(5); expect(b).toBe(-5);
    expect(step.widget.mMax).toBeGreaterThanOrEqual(m); expect(step.widget.bMin).toBeLessThanOrEqual(b);
    expect((m - step.widget.mMin) % step.widget.mStep).toBe(0); // reachable on the grid
    const residuals = pts.map((p) => p[1] - (m * p[0] + b));
    expect(residuals).toEqual([1, -1, -1, 1]);
    const k0b = lesson("bivariate-statistics","bv-05-02").steps.find((s: {id:string}) => s.id==="k0b");
    expect(k0b.widget.answer).toBe(residuals.filter((r) => r < 0).length);
  });
  it("si-06-03 slider: z of 130 on (\u03bc=100, \u03c3=10), lint-legal bounds", () => {
    const w = lesson("statistical-inference","si-06-03").steps.find((s: {id:string}) => s.id==="i0").widget;
    expect(w.target).toBe((130 - 100) / 10);
    expect(w.min).toBeGreaterThan(0); expect(w.min).toBeLessThan(w.target); expect(w.target).toBeLessThan(w.max);
  });
  it("si-06-01 numeric: the pile centers on the true 50; traps are distinct", () => {
    const w = lesson("statistical-inference","si-06-01").steps.find((s: {id:string}) => s.id==="k1c").widget;
    expect(w.answer).toBe(50);
    expect(w.commonErrors.length).toBeGreaterThanOrEqual(2);
    for (const e of w.commonErrors) expect(e.value).not.toBe(w.answer);
  });
  it("iar-01-03 predict: (2,3) on the boundary fails the strict test", () => {
    const i1 = lesson("inequalities-and-regions","iar-01-03").steps.find((s: {id:string}) => s.id==="i1");
    expect(3 > 2 + 1).toBe(false);                       // the mathematics of the outcome
    expect(i1.predict.outcomeId).toBe("reject");
    expect(i1.predict.options.some((o: {id:string}) => o.id === "reject")).toBe(true);
  });
});
