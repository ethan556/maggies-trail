import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec, exactNumberTruth, evalApproxExpr, type ApproxExpr } from "./schema";
import { VARIANT_GENERATORS, type VariantForm } from "./variants";
import { mulberry32 } from "./prng";

/** S180: exp-function — all 7 named forms plus the unguarded `default` fallback (reached by an
 * ABSENT variant.form in three frozen steps), 16 steps across 4 lessons, zero new tasks.
 *
 * Representation choices, per the S178 honesty principle ("represent the action, don't restate
 * the number"):
 *   - a·b^v is the coefficient followed by v FACTORS of b — the ApproxExpr union has no pow op,
 *     and repeated multiplication is what the exponent means, so the chain IS the derivation.
 *   - decay is the start amount times one authored decay factor (1/2 or 1/4) per step.
 *   - b^0 is DERIVED as b ÷ b — the quotient law b^(1-1) — never asserted as a bare literal 1.
 *     This keeps the base (the exact quantity both trap distractors talk about) inside the spec,
 *     and the derived answer is provably INDEPENDENT of it, which is the concept being taught.
 *   - the geometric ratio is second-term ÷ first-term; the next term is last-term × that ratio.
 * Every expected value below is independent arithmetic (repeated multiplication or division by
 * hand), never a call into the code under test. */

const LESSONS = ["exp-01-01", "exp-01-03", "exp-02-01", "exp-02-02"] as const;
const lessonDoc = (id: string) =>
  JSON.parse(readFileSync(`content/courses/exponential-functions/lessons/${id}.json`, "utf8"));
const stepSpec = (lid: string, sid: string) => {
  const step = lessonDoc(lid).steps.find((s: any) => s.id === sid);
  expect(step.widget.type, `${lid}/${sid}`).toBe("exactNumberLab");
  return WidgetSpec.parse(step.widget) as Extract<import("./schema").TWidget, { type: "exactNumberLab" }>;
};

describe("exp-function: every form upgrades and self-derives across many draws (S180)", () => {
  const g = VARIANT_GENERATORS.find((x: any) => x.tag === "exp-function")!;
  const forms: VariantForm[] = [
    "initialValue", "growthModel", "startAmount", "decayModel", "decayStart", "ratio", "nextTerm", "default",
  ] as VariantForm[];
  it("8 forms x 30 seeds, exactNumberLab, truth === answer, params recompute independently", () => {
    let checked = 0;
    for (const form of forms) {
      for (let seed = 1; seed <= 30; seed++) {
        const rand = mulberry32(seed * 1009 + form.length * 101);
        const v = g.gen(rand, "core", form);
        expect(v.widget.type, `${form} seed ${seed}`).toBe("exactNumberLab");
        expect(exactNumberTruth(v.widget as any).answerNumber, `${form} seed ${seed}`).toBe(Number(v.answer));
        // Independent recompute from the PROMPT by repeated multiplication/division only —
        // never ** and never the spec's own formula. (The params channel is proven by the type
        // assertion above: upgradeExactVariant consumes params, and without a matching kind the
        // widget would have stayed "numeric".)
        const P = v.widget.prompt as string;
        let redo: number | undefined;
        let m: RegExpMatchArray | null;
        if ((m = P.match(/^For f\(x\) = (\d+) [*·] \d+\^x, what is the initial value f\(0\)\?$/))) redo = +m[1];
        else if ((m = P.match(/^For A\(x\) = (\d+) [*·] \d+\^x, what is the starting amount A\(0\)\?$/))) redo = +m[1];
        else if ((m = P.match(/^For A\(x\) = (\d+) [*·] \(1\/2\)\^x, what is the starting amount A\(0\)\?$/))) redo = +m[1];
        else if ((m = P.match(/\(x\) = (\d+) [*·] (\d+)\^x\. What is [A-Z]\((\d+)\)\?$/))) { redo = +m[1]; for (let i = 0; i < +m[3]; i++) redo *= +m[2]; }
        else if ((m = P.match(/\(x\) = (\d+) [*·] \(1\/(\d+)\)\^x\. What is [A-Z]\((\d+)\)\?$/))) { redo = +m[1]; for (let i = 0; i < +m[3]; i++) redo /= +m[2]; }
        else if ((m = P.match(/^In the sequence (\d+), (\d+), (\d+), (\d+), what is the constant ratio\?$/))) { const r = +m[2] / +m[1]; if (+m[3] / +m[2] !== r || +m[4] / +m[3] !== r) throw new Error("not geometric"); redo = r; }
        else if ((m = P.match(/^The sequence (\d+), (\d+), (\d+), (\d+) continues\. What is the next term\?$/))) { const r = +m[2] / +m[1]; if (+m[3] / +m[2] !== r || +m[4] / +m[3] !== r) throw new Error("not geometric"); redo = +m[4] * r; }
        else if ((m = P.match(/^For f\(x\) = (\d+) [*·] (\d+)\^x, what is f\((\d+)\)\?$/))) { redo = +m[1]; for (let i = 0; i < +m[3]; i++) redo *= +m[2]; }
        if (redo === undefined) throw new Error(`unparsed prompt for ${form}: ${P}`);
        expect(redo, `prompt-recompute ${form} seed ${seed}`).toBe(Number(v.answer));
        checked += 1;
      }
    }
    expect(checked).toBe(240);
  });
  it("an ABSENT form (the default fallback three frozen steps rely on) also upgrades", () => {
    const v = g.gen(mulberry32(7), "core");
    expect(v.widget.type).toBe("exactNumberLab");
    expect(exactNumberTruth(v.widget as any).answerNumber).toBe(Number(v.answer));
  });
});

describe("exp-function: all 16 frozen steps self-derive their frozen answers (S180)", () => {
  // [lesson, step, expected] — expected computed by hand: 5·3·3=45; 3·2·2·2·2=48; f(0)=5;
  // 2·3·3·3=54; 10÷5=2; 4÷1=4; 24·(6÷3)=48; 135·(15÷5)=405; 500·2·2·2=4000; 150·2·2·2·2=2400;
  // A(0)=500; 20·3·3·3=540; 640÷2÷2÷2=80; 24000÷2÷2÷2=3000; A(0)=640; 256÷4÷4=16.
  const FROZEN: Array<[string, string, number]> = [
    ["exp-01-01", "k1", 45], ["exp-01-01", "k2", 48], ["exp-01-01", "k3", 5], ["exp-01-01", "ch1", 54],
    ["exp-01-03", "k1", 2], ["exp-01-03", "k2", 4], ["exp-01-03", "k3", 48], ["exp-01-03", "ch1", 405],
    ["exp-02-01", "k1", 4000], ["exp-02-01", "k2", 2400], ["exp-02-01", "k3", 500], ["exp-02-01", "ch1", 540],
    ["exp-02-02", "k1", 80], ["exp-02-02", "k2", 3000], ["exp-02-02", "k3", 640], ["exp-02-02", "ch1", 16],
  ];
  it("derived truth equals the hand-computed frozen answer, step by step", () => {
    for (const [lid, sid, expected] of FROZEN) {
      expect(exactNumberTruth(stepSpec(lid, sid)).answerNumber, `${lid}/${sid}`).toBe(expected);
    }
  });
  it("the family is COMPLETE: every exp-function step anywhere in content is converted", () => {
    const coursesDir = join(process.cwd(), "content/courses");
    let total = 0;
    for (const course of readdirSync(coursesDir).sort()) {
      const dir = join(coursesDir, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
        const d = JSON.parse(readFileSync(join(dir, file), "utf8"));
        for (const step of d.steps ?? []) {
          if (step.variant?.gen !== "exp-function") continue;
          expect(step.widget?.type, `${file}/${step.id}`).toBe("exactNumberLab");
          total += 1;
        }
      }
    }
    expect(total).toBe(16);
  });
});

describe("exp-function: the formulas DERIVE — structure, liveness, and the x=0 concept (S180)", () => {
  const refs = (node: any, out: string[] = []): string[] => {
    if (!node || typeof node !== "object") return out;
    if (node.op === "const") out.push(node.id);
    for (const k of ["arg", "left", "right"]) if (node[k]) refs(node[k], out);
    return out;
  };
  const perturbed = (spec: any, id: string): number | undefined => {
    const constants = spec.approxConstants.map((c: any) => (c.id === id ? { ...c, value: c.value + 1 } : c));
    return evalApproxExpr(spec.approxFormula as ApproxExpr, constants);
  };
  const allSpecs = () => {
    const out: Array<[string, any]> = [];
    for (const lid of LESSONS) {
      for (const step of lessonDoc(lid).steps) {
        if (step.variant?.gen === "exp-function") out.push([`${lid}/${step.id}`, stepSpec(lid, step.id)]);
      }
    }
    return out;
  };
  it("no bare-const formulas, no literal nodes, no dead constants anywhere in the family", () => {
    for (const [key, spec] of allSpecs()) {
      expect(spec.approxFormula.op, key).not.toBe("const");
      expect(JSON.stringify(spec.approxFormula), key).not.toContain('"op":"lit"');
      const used = new Set(refs(spec.approxFormula));
      for (const c of spec.approxConstants) expect(used.has(c.id), `${key} dead '${c.id}'`).toBe(true);
    }
  });
  it("x = 0 steps: the base is present, cancels as b/b, and provably does not matter", () => {
    for (const [lid, sid, coef, baseId] of [
      ["exp-01-01", "k3", 5, "b"], ["exp-02-01", "k3", 500, "b"], ["exp-02-02", "k3", 640, "h"],
    ] as const) {
      const spec = stepSpec(lid, sid) as any;
      const f = spec.approxFormula;
      expect(f.op, `${lid}/${sid}`).toBe("multiply");
      expect(f.right.op, `${lid}/${sid}`).toBe("divide");
      expect(f.right.left.id, `${lid}/${sid}`).toBe(baseId);
      expect(f.right.right.id, `${lid}/${sid}`).toBe(baseId);
      // The concept itself, as an executable claim: nudging the base leaves f(0) fixed at the
      // coefficient; nudging the coefficient moves it one-for-one.
      expect(perturbed(spec, baseId), `${lid}/${sid} base-independence`).toBe(coef);
      expect(perturbed(spec, "a"), `${lid}/${sid} coefficient-liveness`).toBe(coef + 1);
    }
  });
  it("every constant of every evaluation/decay/sequence step is load-bearing", () => {
    for (const [key, spec] of allSpecs()) {
      const f = spec.approxFormula as any;
      const zeroPower = f.op === "multiply" && f.right?.op === "divide" && f.right.left?.id === f.right.right?.id;
      const base = exactNumberTruth(spec).answerNumber;
      for (const c of spec.approxConstants) {
        if (zeroPower && c.id !== "a") continue; // base-independence at x=0 is asserted above
        expect(perturbed(spec, c.id), `${key} perturb '${c.id}'`).not.toBe(base);
      }
    }
  });
});
