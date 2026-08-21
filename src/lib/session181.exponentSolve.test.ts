import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { WidgetSpec, exactNumberTruth } from "./schema";
import { VARIANT_GENERATORS, type VariantForm } from "./variants";
import { mulberry32 } from "./prng";

/** S181: `exponentSolve` — solving b^x = target (and a·b^x = target) by EXACT integer
 * cross-multiplication over a bounded exponent window. No Math.log anywhere: a logarithm would
 * introduce float error precisely where the answer is an integer, and would also grade a
 * question by the operation the lesson has not taught yet. The truth searches x in [-12, 12],
 * comparing coef · bn^|x| · rd against rn · bd^|x| (sides flipped for negative x), and demands
 * EXACTLY ONE hit — so "no integer solution" is an error, never a rounded guess.
 *
 * Every expectation below is hand-computed and written as a literal. */

const MATCH_BASE: string = "exp-match-base__numeric";
const truth = (spec: Record<string, unknown>) =>
  exactNumberTruth({ task: "exponentSolve", values: [], ...spec } as never);
const keysOf = (spec: Record<string, unknown>) => truth(spec).stages.map((s) => s.key);

describe("exponentSolve: exact integer solving, hand-checked (S181)", () => {
  it("plain powers: the exponent counts the factors", () => {
    // 3·3·3·3 = 81, so x = 4.
    expect(truth({ esBaseNum: 3, esRhsNum: 81 }).answerNumber).toBe(4);
    // 2·2·2·2·2 = 32.
    expect(truth({ esBaseNum: 2, esRhsNum: 32 }).answerNumber).toBe(5);
    // 3·3·3·3·3 = 243.
    expect(truth({ esBaseNum: 3, esRhsNum: 243 }).answerNumber).toBe(5);
  });

  it("a coefficient is divided off, not subtracted", () => {
    // 2·3^x = 54 → 3^x = 27 = 3·3·3 → x = 3. (The trap answer 54−2 = 52 is not a power of 3.)
    expect(truth({ esCoef: 2, esBaseNum: 3, esRhsNum: 54 }).answerNumber).toBe(3);
    // 7·2^x = 56 → 2^x = 8 → x = 3.
    expect(truth({ esCoef: 7, esBaseNum: 2, esRhsNum: 56 }).answerNumber).toBe(3);
    // 2·5^x = 50 → 5^x = 25 → x = 2.
    expect(truth({ esCoef: 2, esBaseNum: 5, esRhsNum: 50 }).answerNumber).toBe(2);
  });

  it("reciprocal targets give negative exponents", () => {
    // 3^x = 1/9: 3² = 9, and a reciprocal flips the sign, so x = −2.
    expect(truth({ esBaseNum: 3, esRhsNum: 1, esRhsDen: 9 }).answerNumber).toBe(-2);
    // 2^x = 1/16: 2⁴ = 16 → x = −4.
    expect(truth({ esBaseNum: 2, esRhsNum: 1, esRhsDen: 16 }).answerNumber).toBe(-4);
    // 5^x = 1/25 → x = −2.
    expect(truth({ esBaseNum: 5, esRhsNum: 1, esRhsDen: 25 }).answerNumber).toBe(-2);
  });

  it("a reciprocal BASE grows under a negative exponent", () => {
    // (1/3)^x = 9 → (1/3)^−2 = 3² = 9, so x = −2.
    expect(truth({ esBaseNum: 1, esBaseDen: 3, esRhsNum: 9 }).answerNumber).toBe(-2);
    // (1/2)^x = 8 → x = −3.
    expect(truth({ esBaseNum: 1, esBaseDen: 2, esRhsNum: 8 }).answerNumber).toBe(-3);
    // (1/2)^x = 1/8 → the target is BELOW 1 and so is the base: x = +3, not −3.
    expect(truth({ esBaseNum: 1, esBaseDen: 2, esRhsNum: 1, esRhsDen: 8 }).answerNumber).toBe(3);
  });

  it("x = 0 is a real answer, not a missing one", () => {
    // 7·3^x = 7 → 3^x = 1 → x = 0.
    expect(truth({ esCoef: 7, esBaseNum: 3, esRhsNum: 7 }).answerNumber).toBe(0);
    expect(truth({ esBaseNum: 5, esRhsNum: 1 }).answerNumber).toBe(0);
  });

  it("REFUSES the cases a logarithm would silently round", () => {
    // 3^x = 10 sits between 3² = 9 and 3³ = 27. log₃10 ≈ 2.0959 — an engine that rounded would
    // answer 2 and mark a correct learner wrong.
    expect(() => truth({ esBaseNum: 3, esRhsNum: 10 })).toThrow(/exactly one integer exponent/);
    // 2^x = 48 is not a power of two, coefficient or not.
    expect(() => truth({ esBaseNum: 2, esRhsNum: 48 })).toThrow(/exactly one integer exponent/);
    // 3·2^x = 25: 25/3 is not even an integer.
    expect(() => truth({ esCoef: 3, esBaseNum: 2, esRhsNum: 25 })).toThrow(/exactly one integer exponent/);
    // Outside the search window: 2^20 is a genuine power but beyond the authored range, so the
    // engine refuses rather than pretending the window was the mathematics.
    expect(() => truth({ esBaseNum: 2, esRhsNum: 1048576 })).toThrow(/exactly one integer exponent/);
  });

  it("REFUSES a degenerate base of 1, which every exponent solves", () => {
    expect(() => truth({ esBaseNum: 1, esRhsNum: 1 })).toThrow(/base of 1/);
    expect(() => truth({ esBaseNum: 4, esBaseDen: 4, esRhsNum: 1 })).toThrow(/base of 1/);
  });

  it("REFUSES malformed inputs instead of coercing them", () => {
    expect(() => truth({ esRhsNum: 8 })).toThrow(/requires esBaseNum and esRhsNum/);
    expect(() => truth({ esBaseNum: 2 })).toThrow(/requires esBaseNum and esRhsNum/);
    expect(() => truth({ esBaseNum: 2, esRhsNum: 0 })).toThrow(/positive integer/);
    expect(() => truth({ esBaseNum: -2, esRhsNum: 8 })).toThrow(/positive integer/);
    expect(() => truth({ esBaseNum: 2.5, esRhsNum: 8 })).toThrow(/positive integer/);
    expect(() => truth({ esCoef: 0, esBaseNum: 2, esRhsNum: 8 })).toThrow(/positive integer/);
  });

  it("narrates the isolate step only when there IS a coefficient to isolate", () => {
    expect(keysOf({ esBaseNum: 3, esRhsNum: 81 })).toEqual(["exp:base", "exp:power", "exp:read"]);
    expect(keysOf({ esCoef: 2, esBaseNum: 3, esRhsNum: 54 })).toEqual([
      "exp:base", "exp:isolate", "exp:power", "exp:read",
    ]);
    const staged = truth({ esCoef: 2, esBaseNum: 3, esRhsNum: 54 }).stages;
    expect(staged.find((s) => s.key === "exp:isolate")?.value).toContain("27");
    expect(staged.find((s) => s.key === "exp:power")?.value).toBe("3^3");
    expect(truth({ esBaseNum: 1, esBaseDen: 3, esRhsNum: 9 }).stages[0]!.value).toBe("base 1/3");
  });
});

describe("exponentSolve: generators upgrade and self-derive across many draws (S181)", () => {
  // Independent recompute from the PROMPT, by repeated multiplication only — never ** and never
  // a logarithm. Returns the exponent the prose actually describes.
  const powerIndex = (base: number, target: number): number => {
    let acc = 1;
    for (let k = 0; k <= 12; k++) {
      if (acc === target) return k;
      acc *= base;
    }
    throw new Error(`not a power of ${base}: ${target}`);
  };
  const fromPrompt = (p: string): number => {
    let m: RegExpMatchArray | null;
    if ((m = p.match(/^Solve (\d+)\^x = 1\/(\d+)\.$/))) return -powerIndex(+m[1], +m[2]);
    if ((m = p.match(/^Solve \(1\/(\d+)\)\^x = (\d+)\.$/))) return -powerIndex(+m[1], +m[2]);
    if ((m = p.match(/^Solve (\d+) [*·] (\d+)\^x = (\d+)\.$/))) {
      const isolated = +m[3] / +m[1];
      if (!Number.isInteger(isolated)) throw new Error(`coefficient does not divide: ${p}`);
      return powerIndex(+m[2], isolated);
    }
    if ((m = p.match(/^Solve (\d+)\^x = (\d+)\.(?: What is x\?)?$/))) return powerIndex(+m[1], +m[2]);
    throw new Error(`unparsed prompt: ${p}`);
  };

  it("exp-solve: 3 forms x 30 seeds all upgrade, self-derive, and match the prose", () => {
    const g = VARIANT_GENERATORS.find((x) => x.tag === "exp-solve")!;
    let checked = 0;
    for (const form of ["default", "negExponent", "reciprocalBase"] as VariantForm[]) {
      for (let seed = 1; seed <= 30; seed++) {
        const v = g.gen(mulberry32(seed * 733 + form.length * 37), "core", form);
        expect(v.widget.type, `${form} seed ${seed}`).toBe("exactNumberLab");
        const spec = WidgetSpec.parse(v.widget) as never;
        expect(exactNumberTruth(spec).answerNumber, `${form} seed ${seed}`).toBe(Number(v.answer));
        expect(fromPrompt((v.widget as { prompt: string }).prompt), `prose ${form} seed ${seed}`).toBe(Number(v.answer));
        checked += 1;
      }
    }
    expect(checked).toBe(90);
  });

  it("exp-solve with an ABSENT form (what the frozen exp-03-02 steps use) upgrades too", () => {
    const g = VARIANT_GENERATORS.find((x) => x.tag === "exp-solve")!;
    const v = g.gen(mulberry32(11), "core");
    expect(v.widget.type).toBe("exactNumberLab");
    expect(exactNumberTruth(WidgetSpec.parse(v.widget) as never).answerNumber).toBe(Number(v.answer));
  });

  it("a1-exponential exp-match-base: 30 seeds across bands upgrade and self-derive", () => {
    const g = VARIANT_GENERATORS.find((x) => x.tag === "a1-exponential")!;
    for (const band of ["support", "core", "stretch"] as const) {
      for (let seed = 1; seed <= 10; seed++) {
        const v = g.gen(mulberry32(seed * 991 + band.length), band, MATCH_BASE as VariantForm);
        expect(v.widget.type, `${band} seed ${seed}`).toBe("exactNumberLab");
        expect(exactNumberTruth(WidgetSpec.parse(v.widget) as never).answerNumber).toBe(Number(v.answer));
        expect(fromPrompt((v.widget as { prompt: string }).prompt)).toBe(Number(v.answer));
      }
    }
  });
});

describe("exponentSolve: the 8 frozen steps self-derive their frozen answers (S181)", () => {
  // S329: exp-03-01/ch1, exp-03-02/ch1, exp-03-03/ch1 were redesigned (a zero-exponent edge case,
  // a solve-for-coefficient task, and a combined coefficient+negative-exponent task) and moved off
  // the exactNumberLab/exponentSolve engine onto a plain `numeric` widget — the new ch1 tasks are
  // no longer expressible as this engine's b^x = target shape, so all three are dropped here
  // (11 → 8). The remaining k1/k2/k3 rows are untouched.
  const FROZEN: Array<[string, string, number]> = [
    ["exp-03-01", "k1", 4], ["exp-03-01", "k2", 5],
    ["exp-03-02", "k1", 3], ["exp-03-02", "k2", 3], ["exp-03-02", "k3", 2],
    ["exp-03-03", "k1", -2], ["exp-03-03", "k2", -4], ["exp-03-03", "k3", -2],
  ];
  const doc = (id: string) =>
    JSON.parse(readFileSync(`content/courses/exponential-functions/lessons/${id}.json`, "utf8"));

  it("derived truth equals the hand-computed frozen answer, step by step", () => {
    for (const [lid, sid, expected] of FROZEN) {
      const step = doc(lid).steps.find((s: { id: string }) => s.id === sid);
      expect(step.widget.type, `${lid}/${sid}`).toBe("exactNumberLab");
      const spec = WidgetSpec.parse(step.widget) as never;
      expect(exactNumberTruth(spec).answerNumber, `${lid}/${sid}`).toBe(expected);
      expect(exactNumberTruth(spec).stages.map((s) => s.key), `${lid}/${sid} stages`).toContain("exp:read");
    }
  });

  it("both families are COMPLETE: every exp-solve and exp-match-base step is converted", () => {
    const coursesDir = join(process.cwd(), "content/courses");
    let solve = 0;
    let matchBase = 0;
    for (const course of readdirSync(coursesDir).sort()) {
      const dir = join(coursesDir, course, "lessons");
      if (!existsSync(dir)) continue;
      for (const file of readdirSync(dir).filter((f) => f.endsWith(".json")).sort()) {
        for (const step of JSON.parse(readFileSync(join(dir, file), "utf8")).steps ?? []) {
          const gen = step.variant?.gen;
          const isMatchBase = gen === "a1-exponential" && step.variant?.form === "exp-match-base__numeric";
          if (gen !== "exp-solve" && !isMatchBase) continue;
          expect(step.widget?.type, `${file}/${step.id}`).toBe("exactNumberLab");
          expect(step.widget?.task, `${file}/${step.id}`).toBe("exponentSolve");
          if (isMatchBase) matchBase += 1;
          else solve += 1;
        }
      }
    }
    // S329: exp-03-02/ch1 and exp-03-03/ch1 (exp-solve) and exp-03-01/ch1 (a1-exponential
    // exp-match-base) were redesigned off this engine — solve 8 → 6, matchBase 3 → 2.
    expect(solve).toBe(6);
    expect(matchBase).toBe(2);
  });
});
