/* derivativeTrace feedback truth — a corpus lint, not a spot check.
 *
 * WHY THIS EXISTS. S205B shipped an inserted lab whose lowFeedback read "the f′ pane is still
 * below zero here, and the curve is falling" on f(x) = x³. f′ = 3x² is NEVER negative, so that
 * sentence was false at every x where it could fire — and nothing caught it, because no gate reads
 * feedback prose against the function it describes. Schema validation, pedagogy lint and the
 * solvability gate all passed a lesson that told the learner the opposite of what the picture
 * showed.
 *
 * WHAT IT CHECKS. For every derivativeTrace widget in the corpus, compute the exact set of x the
 * learner can actually reach (the renderer's slider AND drag both snap to the same 0.5 grid on
 * [-4, 4], widgets.tsx), partition it into the range where each feedback string FIRES (from the
 * grader in evaluate.ts, not from a re-derivation), and assert that any directional claim the
 * prose makes is true SOMEWHERE in that range.
 *
 * The bar is deliberately "true somewhere", not "true everywhere": feedback legitimately describes
 * the region near the target rather than the whole tail. A claim false at EVERY reachable firing
 * position is not a nuance, it is an error — that is the class this catches, and the only class it
 * asserts on, so it cannot fail on defensible wording.
 */
import { readdirSync, readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { traceSlopeAt, type TraceFn } from "@/lib/evaluate";

const COURSES = join(process.cwd(), "content", "courses");

/** The renderer's reachable grid: <input type="range" min={-4} max={4} step={0.5} /> and the
 * pointer path's snapToStep(raw, XMIN, XMAX, 0.5) — same grid, so this is every x, not a sample. */
const REACHABLE: number[] = [];
for (let x = -4; x <= 4 + 1e-9; x += 0.5) REACHABLE.push(Number(x.toFixed(1)));

type Trace = {
  type: "derivativeTrace"; fn: TraceFn; mode: "slope" | "point";
  targetX?: number; targetSlope?: number;
  lowFeedback: string; highFeedback: string; successFeedback: string;
};

/** Which x values make the grader emit `which`. Mirrors evaluate.ts:1483-1498 exactly. */
function firingRange(w: Trace, which: "low" | "high"): number[] {
  if (w.mode === "point") {
    const t = w.targetX ?? 0;
    return REACHABLE.filter((x) => (which === "low" ? x < t : x > t));
  }
  const t = w.targetSlope ?? 0;
  return REACHABLE.filter((x) => {
    const d = traceSlopeAt(w.fn, x);
    if (d === null) return which === "low"; // undefined slope routes to lowFeedback
    if (Math.abs(d - t) < 1e-9) return false; // that's success, not a miss
    return which === "low" ? d < t : d > t;
  });
}

/** Directional claims about f′, each paired with the fact that must hold somewhere in range. */
const CLAIMS: Array<{ re: RegExp; needs: (d: number | null) => boolean; says: string }> = [
  { re: /below zero|negative slope|f′ is negative/i, needs: (d) => d !== null && d < 0, says: "f′ < 0" },
  { re: /\bfalling\b|\bdescending\b|curve (?:is )?(?:going )?down/i, needs: (d) => d !== null && d < 0, says: "the curve falling (f′ < 0)" },
  { re: /above zero|positive slope|f′ is positive/i, needs: (d) => d !== null && d > 0, says: "f′ > 0" },
  { re: /\bclimbing\b|\brising\b|\bgoing up\b/i, needs: (d) => d !== null && d > 0, says: "the curve climbing (f′ > 0)" },
];

function collect(): Array<{ lesson: string; stepId: string; w: Trace }> {
  const out: Array<{ lesson: string; stepId: string; w: Trace }> = [];
  for (const dir of readdirSync(COURSES)) {
    const ld = join(COURSES, dir, "lessons");
    if (!existsSync(ld)) continue;
    for (const f of readdirSync(ld)) {
      if (!f.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(ld, f), "utf8"));
      for (const s of lesson.steps ?? []) {
        if (s.widget?.type === "derivativeTrace") out.push({ lesson: f.replace(".json", ""), stepId: s.id, w: s.widget as Trace });
        for (const r of s.remedial ?? []) {
          if (r.widget?.type === "derivativeTrace") out.push({ lesson: f.replace(".json", ""), stepId: `${s.id}/remedial`, w: r.widget as Trace });
        }
      }
    }
  }
  return out;
}

const ALL = collect();

describe("derivativeTrace feedback describes the function it is actually drawn on", () => {
  it("finds derivativeTrace steps to check (the lint is not silently vacuous)", () => {
    expect(ALL.length).toBeGreaterThan(0);
  });

  it("no low/high feedback makes a directional claim that is false at EVERY reachable firing x", () => {
    const violations: string[] = [];
    for (const { lesson, stepId, w } of ALL) {
      for (const which of ["low", "high"] as const) {
        const prose = which === "low" ? w.lowFeedback : w.highFeedback;
        const xs = firingRange(w, which);
        if (xs.length === 0) continue; // unreachable branch — a different concern, not this lint's
        for (const c of CLAIMS) {
          if (!c.re.test(prose)) continue;
          const holdsSomewhere = xs.some((x) => c.needs(traceSlopeAt(w.fn, x)));
          if (!holdsSomewhere) {
            violations.push(
              `${lesson} step ${stepId} (${w.fn}, ${w.mode}) ${which}Feedback claims ${c.says}, ` +
              `but no reachable x in [${xs[0]}, ${xs[xs.length - 1]}] satisfies it — prose: "${prose}"`
            );
          }
        }
      }
    }
    expect(violations, violations.join("\n")).toEqual([]);
  });

  it("catches the exact S205B defect when it is reintroduced (failure-first proof)", () => {
    // The shipped-and-corrected string, on the function it was attached to.
    const broken: Trace = {
      type: "derivativeTrace", fn: "cubic", mode: "point", targetX: 0,
      lowFeedback: "Not flat yet — the f′ pane is still below zero here, and the curve is falling.",
      highFeedback: "ok", successFeedback: "ok"
    };
    const xs = firingRange(broken, "low");
    expect(xs.length).toBeGreaterThan(0);
    const caught = CLAIMS.filter((c) => c.re.test(broken.lowFeedback))
      .filter((c) => !xs.some((x) => c.needs(traceSlopeAt(broken.fn, x))));
    // Both false claims are caught: "below zero" and "falling".
    expect(caught.map((c) => c.says).sort()).toEqual(["f′ < 0", "the curve falling (f′ < 0)"]);
  });
});
