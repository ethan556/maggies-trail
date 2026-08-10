import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec, exactNumberTruth, evalApproxExpr, type ApproxExpr } from "./schema";
import { VARIANT_GENERATORS, type VariantForm } from "./variants";
import { mulberry32 } from "./prng";

/** S181b: the remaining a1-exponential numeric surfaces, reusing the S180 dispatch kinds plus one
 * new one — `exp-rate`, for a RATIONAL growth factor (a percent change expressed as the fraction
 * the prose actually shows: 50% growth is x3/2, applied once per step). The percent branch is the
 * only place a factor is not an integer, and 5/4, 3/2, 3/4, 1/2 and 2 are all exact in binary, so
 * the repeated multiplication stays exact — no rounding decides an answer. */

const PERCENT: string = "exp-percent__numeric";
const A1 = () => VARIANT_GENERATORS.find((g) => g.tag === "a1-exponential")!;
// Declared as strings and cast at the call site, matching the S179 pattern: the a1 family's
// "concept__surface" forms are passed through as strings by the shared factory.
const FORMS: string[] = [
  "exp-compare__numeric", "exp-graph-read__numeric", "exp-growth-decay__numeric",
  "exp-percent__numeric", "exp-vs-linear__numeric", "exp-match-base__numeric",
];

describe("a1-exponential: every numeric surface upgrades and self-derives (S181)", () => {
  it("6 forms x 3 bands x 12 seeds: exactNumberLab, truth === answer", () => {
    let checked = 0;
    for (const form of FORMS) {
      for (const band of ["support", "core", "stretch"] as const) {
        for (let seed = 1; seed <= 12; seed++) {
          const v = A1().gen(mulberry32(seed * 617 + form.length * 29 + band.length), band, form as VariantForm);
          expect(v.widget.type, `${form} ${band} ${seed}`).toBe("exactNumberLab");
          const spec = WidgetSpec.parse(v.widget) as never;
          expect(exactNumberTruth(spec).answerNumber, `${form} ${band} ${seed}`).toBe(Number(v.answer));
          checked += 1;
        }
      }
    }
    expect(checked).toBe(216);
  });

  it("the percent surface stays EXACT: no rounding, and the factor matches the prose fraction", () => {
    for (let seed = 1; seed <= 60; seed++) {
      const v = A1().gen(mulberry32(seed * 37 + 5), "core", PERCENT as VariantForm);
      const spec = WidgetSpec.parse(v.widget) as never;
      const derived = exactNumberTruth(spec).answerNumber!;
      expect(Number.isInteger(derived), `seed ${seed} produced ${derived}`).toBe(true);
      expect(derived).toBe(Number(v.answer));
      // The factor constant is a ratio of small integers, stated in the label, and the answer is
      // reproduced by multiplying by it — by hand — the stated number of times.
      const cs = (spec as { approxConstants: Array<{ id: string; label: string; value: number }> }).approxConstants;
      const start = cs.find((c) => c.id === "a")!.value;
      const factor = cs.find((c) => c.id === "f")!;
      const m = factor.label.match(/factor (\d+)(?:\/(\d+))?/);
      expect(m, factor.label).not.toBeNull();
      expect(factor.value).toBe(Number(m![1]) / (m![2] ? Number(m![2]) : 1));
      let redo = start;
      let steps = 0;
      while (redo !== derived && steps < 12) { redo *= factor.value; steps += 1; }
      expect(redo, `seed ${seed} could not be reached by repeated multiplication`).toBe(derived);
    }
  });
});

describe("the exponential-functions course is COMPLETE and honest (S181)", () => {
  const dir = join(process.cwd(), "content/courses/exponential-functions/lessons");
  const steps = () => {
    const out: Array<[string, string, Record<string, unknown>]> = [];
    for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
      for (const step of JSON.parse(readFileSync(join(dir, file), "utf8")).steps ?? []) {
        if (step.variant?.gen) out.push([file, step.id, step]);
      }
    }
    return out;
  };

  it("every variant-backed numeric step in the course is engine-backed", () => {
    let converted = 0;
    for (const [file, id, step] of steps()) {
      const w = step.widget as { type?: string; task?: string } | undefined;
      if (w?.type === "mcq" || w?.type === "buildExpression" || w?.type === "matchPairs") continue;
      expect(w?.type, `${file}/${id}`).toBe("exactNumberLab");
      converted += 1;
    }
    expect(converted).toBe(39);
  });

  it("the 12 newly converted answers are exactly the frozen ones", () => {
    // Hand-computed: 81/9=9; 32/16=2; 25·8=200; 8·(3/2)³=27; intercepts 3, 10, 4;
    // 10·4=40; 1·64=64; 2·9=18; 3·16=48; 5·8=40.
    const FROZEN: Array<[string, string, number]> = [
      ["exp-01-02", "k3", 9], ["exp-01-02", "ch1", 2],
      ["exp-02-03", "k2", 200], ["exp-02-03", "ch1", 27],
      ["exp-04-01", "k1", 3], ["exp-04-01", "k3", 10], ["exp-04-01", "ch1", 4],
      ["exp-04-02", "k1", 40], ["exp-04-02", "k3", 64], ["exp-04-02", "ch1", 18],
      ["exp-04-03", "k2", 48], ["exp-04-03", "ch1", 40],
    ];
    for (const [lid, sid, expected] of FROZEN) {
      const doc = JSON.parse(readFileSync(join(dir, `${lid}.json`), "utf8"));
      const step = doc.steps.find((s: { id: string }) => s.id === sid);
      expect(exactNumberTruth(WidgetSpec.parse(step.widget) as never).answerNumber, `${lid}/${sid}`).toBe(expected);
    }
  });

  it("no dead constants anywhere in the course, and y-intercept steps prove base-independence", () => {
    const refs = (node: unknown, out: string[] = []): string[] => {
      const n = node as { op?: string; id?: string; arg?: unknown; left?: unknown; right?: unknown };
      if (!n || typeof n !== "object") return out;
      if (n.op === "const" && n.id) out.push(n.id);
      for (const k of ["arg", "left", "right"] as const) if (n[k]) refs(n[k], out);
      return out;
    };
    for (const [file, id, step] of steps()) {
      const w = step.widget as { task?: string; approxFormula?: ApproxExpr; approxConstants?: Array<{ id: string; value: number }> };
      if (w.task !== "approximationEvaluate") continue;
      const used = new Set(refs(w.approxFormula));
      for (const c of w.approxConstants ?? []) expect(used.has(c.id), `${file}/${id} dead '${c.id}'`).toBe(true);
    }
    // f(0) = a: perturbing the base must not move the answer; perturbing the coefficient must.
    for (const [lid, sid, coef] of [["exp-04-01", "k1", 3], ["exp-04-01", "k3", 10], ["exp-04-01", "ch1", 4]] as const) {
      const doc = JSON.parse(readFileSync(join(dir, `${lid}.json`), "utf8"));
      const spec = doc.steps.find((s: { id: string }) => s.id === sid).widget as {
        approxFormula: ApproxExpr; approxConstants: Array<{ id: string; label: string; value: number }>;
      };
      const bump = (target: string) =>
        evalApproxExpr(spec.approxFormula, spec.approxConstants.map((c) => (c.id === target ? { ...c, value: c.value + 1 } : c)));
      expect(bump("b"), `${lid}/${sid} base-independence`).toBe(coef);
      expect(bump("a"), `${lid}/${sid} coefficient-liveness`).toBe(coef + 1);
    }
  });
});
