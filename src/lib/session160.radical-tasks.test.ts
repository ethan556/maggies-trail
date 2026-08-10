// @vitest-environment node
/** Session 160 — four radical tasks on exactNumberLab.
 *
 * Claim under test: each new task's truth branch derives, by integer-exact arithmetic, the same
 * answer that `scripts/measure/coverage-prover.mjs a1-radicals` proved independently against
 * frozen authored content (38/38, MISMATCH 0). The prover and the engine are two separate
 * implementations; agreement between them is the check that matters.
 *
 * Also asserted: the two new source fields are PURELY ADDITIVE. Omitting `coefficient` and
 * `rootIndex` must leave every pre-existing task byte-identical in behaviour, because ~1,100
 * shipped lessons depend on that.
 */
import { describe, expect, it } from "vitest";
import { exactNumberTruth, ExactNumberLabSpec, type ExactNumberTask } from "./schema";

const base = {
  type: "exactNumberLab" as const,
  answerMode: "numeric" as const,
  prompt: "p",
  successFeedback: "s",
  explorationFeedback: "e",
  fallbackFeedback: "f",
};

function truthOf(partial: Record<string, unknown>) {
  const spec = ExactNumberLabSpec.parse({ ...base, ...partial });
  return exactNumberTruth(spec as never);
}
const root = (id: string, radicand: number, coefficient?: number) =>
  ({ id, label: coefficient && coefficient !== 1 ? `${coefficient}√${radicand}` : `√${radicand}`, kind: "root" as const, radicand, ...(coefficient === undefined ? {} : { coefficient }) });

describe("S160 radical tasks derive the prover-verified answers", () => {
  it("radicalSimplifyCoef: √72 = a√2 -> 6, √18 = a√2 -> 3, √12 = a√3 -> 2", () => {
    for (const [n, target, want] of [[72, 2, 6], [18, 2, 3], [12, 3, 2], [50, 2, 5]] as const) {
      const t = truthOf({ task: "radicalSimplifyCoef", values: [root("r", n)], targetRadicand: target });
      expect(t.answerNumber, `√${n} over √${target}`).toBe(want);
    }
  });

  it("radicalCombine: 6√5 − 2√5 = 4√5, 4√3 + 2√3 = 6√3, and simplify-then-combine √12 + √3 = 3√3", () => {
    expect(truthOf({ task: "radicalCombine", operation: "subtract", targetRadicand: 5, values: [root("a", 5, 6), root("b", 5, 2)] }).answerNumber).toBe(4);
    expect(truthOf({ task: "radicalCombine", operation: "add", targetRadicand: 3, values: [root("a", 3, 4), root("b", 3, 2)] }).answerNumber).toBe(6);
    // the case that broke the S152 prover: unequal radicands that simplify onto a common one
    expect(truthOf({ task: "radicalCombine", operation: "add", targetRadicand: 3, values: [root("a", 12), root("b", 3)] }).answerNumber).toBe(3);
    expect(truthOf({ task: "radicalCombine", operation: "add", targetRadicand: 2, values: [root("a", 18), root("b", 2)] }).answerNumber).toBe(4);
  });

  it("radicalProduct: 3√2·2√5 = 6√10, √3·√6 = 3√2, and plain √3·√12 = 6", () => {
    expect(truthOf({ task: "radicalProduct", targetRadicand: 10, values: [root("a", 2, 3), root("b", 5, 2)] }).answerNumber).toBe(6);
    expect(truthOf({ task: "radicalProduct", targetRadicand: 2, values: [root("a", 3), root("b", 6)] }).answerNumber).toBe(3);
    expect(truthOf({ task: "radicalProduct", targetRadicand: 1, values: [root("a", 3), root("b", 12)] }).answerNumber).toBe(6);
    expect(truthOf({ task: "radicalProduct", targetRadicand: 1, values: [root("a", 5), root("b", 20)] }).answerNumber).toBe(10);
  });

  it("rationalExponentEvaluate: 27^(1/3)=3, 16^(3/4)=8, 8^(4/3)=16, 81^(3/4)=27, 100^(1/2)=10", () => {
    const pow = (base: number, exponent: number, rootIndex: number) =>
      ({ id: "p", label: `${base}^(${exponent}/${rootIndex})`, kind: "power" as const, base, exponent, rootIndex });
    for (const [b, m, n, want] of [[27, 1, 3, 3], [16, 3, 4, 8], [8, 4, 3, 16], [81, 3, 4, 27], [100, 1, 2, 10], [4, 3, 2, 8], [8, 1, 3, 2], [64, 1, 3, 4]] as const) {
      expect(truthOf({ task: "rationalExponentEvaluate", values: [pow(b, m, n)] }).answerNumber, `${b}^(${m}/${n})`).toBe(want);
    }
  });

  it("refuses to guess: unsatisfiable specs throw rather than returning a wrong number", () => {
    // 20 over √2 leaves 10, not a perfect square
    expect(() => truthOf({ task: "radicalSimplifyCoef", values: [root("r", 20)], targetRadicand: 2 })).toThrow(/perfect square/);
    // radicand not a multiple of the target
    expect(() => truthOf({ task: "radicalSimplifyCoef", values: [root("r", 12)], targetRadicand: 5 })).toThrow(/multiple/);
    // 10 is not a perfect cube
    expect(() => truthOf({ task: "rationalExponentEvaluate", values: [{ id: "p", label: "10^(1/3)", kind: "power", base: 10, exponent: 1, rootIndex: 3 }] })).toThrow(/perfect/);
    // combine needs an operation
    expect(() => truthOf({ task: "radicalCombine", targetRadicand: 5, values: [root("a", 5, 6), root("b", 5, 2)] })).toThrow(/operation/);
  });

  it("is purely additive: omitting coefficient and rootIndex preserves every prior task", () => {
    // root without coefficient still classifies and squares exactly as before
    expect(truthOf({ task: "rootClassify", answerMode: "choice", values: [root("r", 49)] }).answerClaim).toBe("root:rational:7");
    expect(truthOf({ task: "rootClassify", answerMode: "choice", values: [root("r", 50)] }).answerClaim).toBe("root:irrational");
    expect(truthOf({ task: "squareEvaluate", values: [root("r", 49)] }).answerNumber).toBe(49);
    // power without rootIndex is unchanged integer exponentiation
    expect(truthOf({ task: "powerEvaluate", values: [{ id: "p", label: "2^5", kind: "power", base: 2, exponent: 5 }] }).answerNumber).toBe(32);
  });

  it("every new task is reachable through the spec parser", () => {
    const tasks: ExactNumberTask[] = ["radicalSimplifyCoef", "radicalCombine", "radicalProduct", "rationalExponentEvaluate"];
    for (const task of tasks) expect(ExactNumberLabSpec.shape.task.options).toContain(task);
  });
});
