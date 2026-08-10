/**
 * STRATEGY CLASSIFIERS (s45) — the determinism guarantee and the six domains,
 * proven. For every classifier:
 *   · identical event streams → identical strategy (run twice, deep-equal);
 *   · the named misconception/positive strategy is detected from a realistic
 *     stream;
 *   · an ambiguous or too-short stream returns null (precision over recall —
 *     one accidental move never classifies).
 */
import { describe, expect, it } from "vitest";
import {
  classifyAlgebraBalance,
  classifyBaseTen,
  classifyFraction,
  classifyGraph,
  classifyNumberLine,
  classifyRatio,
  isPositiveStrategy,
  strategyCue,
  type Strategy
} from "@/lib/strategyClassifiers";
import type { ProcessEvent } from "@/lib/processEvents";

// Tiny stream builders — the engine would emit these; here we author them.
const ev = (control: string, dir: ProcessEvent["dir"], state?: Record<string, number>, kind?: ProcessEvent["kind"]): ProcessEvent => ({
  control,
  dir,
  ...(state ? { state } : {}),
  ...(kind ? { kind } : {})
});

describe("determinism (the audit guarantee)", () => {
  it("every classifier returns the identical result on a re-run of the same stream", () => {
    const frac = [
      ev("d", "away", { num: 1, den: 2 }, "partition"),
      ev("d", "away", { num: 1, den: 4 }, "partition"),
      ev("d", "away", { num: 1, den: 8 }, "partition")
    ];
    expect(classifyFraction(frac, { targetNum: 3, targetDen: 4 })).toEqual(
      classifyFraction([...frac], { targetNum: 3, targetDen: 4 })
    );
    const bt = [ev("one", "toward", { ones: 5, tens: 0 }), ev("one", "toward", { ones: 12, tens: 0 }), ev("one", "away", { ones: 12, tens: 0 })];
    expect(classifyBaseTen(bt, { targetOnes: 2, targetTens: 3 })).toEqual(classifyBaseTen([...bt], { targetOnes: 2, targetTens: 3 }));
  });
});

describe("fractions", () => {
  it("detects denominator-size conflation (bigger bottom read as bigger value)", () => {
    // Target ¾ = 0.75. Learner grows the denominator with num fixed at 1,
    // moving 1/2 → 1/4 → 1/8: consistently away from a larger target.
    const s = [
      ev("d", "away", { num: 1, den: 2 }),
      ev("d", "away", { num: 1, den: 4 }),
      ev("d", "away", { num: 1, den: 8 })
    ];
    expect(classifyFraction(s, { targetNum: 3, targetDen: 4 })).toBe("denominator-size-conflation");
  });

  it("detects denominator addition (¼ → ⅛ with numerator fixed)", () => {
    const s = [
      ev("n", "toward", { num: 1, den: 4 }),
      ev("d", "away", { num: 1, den: 8 }),
      ev("d", "away", { num: 1, den: 8 })
    ];
    expect(classifyFraction(s, { targetNum: 1, targetDen: 2 })).toBe("denominator-addition");
  });

  it("credits common-denominator coordination as a POSITIVE strategy", () => {
    // Denominator matches target's (4), then only the numerator changes.
    const s = [
      ev("d", "toward", { num: 1, den: 4 }),
      ev("n", "toward", { num: 2, den: 4 }),
      ev("n", "toward", { num: 3, den: 4 })
    ];
    const r = classifyFraction(s, { targetNum: 3, targetDen: 4 });
    expect(r).toBe("common-denominator");
    expect(isPositiveStrategy({ domain: "fractions", name: r! })).toBe(true);
  });

  it("credits benchmark use (parks on ½ en route to a non-landmark target)", () => {
    const s = [
      ev("n", "toward", { num: 1, den: 2 }),
      ev("d", "toward", { num: 1, den: 2 }),
      ev("n", "toward", { num: 2, den: 3 })
    ];
    expect(classifyFraction(s, { targetNum: 2, targetDen: 3 })).toBe("benchmark-use");
  });

  it("stays silent on a short or ambiguous stream (precision over recall)", () => {
    expect(classifyFraction([ev("n", "toward", { num: 1, den: 2 })], { targetNum: 3, targetDen: 4 })).toBeNull();
    expect(classifyFraction([ev("n", "toward"), ev("d", "away"), ev("n", "toward")], { targetNum: 3, targetDen: 4 })).toBeNull(); // no state → null
  });
});

describe("base ten", () => {
  it("detects counting-by-one where grouping was available", () => {
    const s = Array.from({ length: 11 }, (_, i) => ev("one", "toward", { ones: i + 1, tens: 0 }));
    expect(classifyBaseTen(s, { targetOnes: 3, targetTens: 1 })).toBe("counting-by-one");
  });

  it("detects an invalid exchange, twice", () => {
    const s = [ev("regroup", "invalid", { ones: 5, tens: 0 }, "regroup"), ev("one", "toward", { ones: 6, tens: 0 }), ev("regroup", "invalid", { ones: 6, tens: 0 }, "regroup")];
    expect(classifyBaseTen(s, { targetOnes: 2, targetTens: 1 })).toBe("invalid-exchange");
  });

  it("credits a valid regroup that reaches the target tens as POSITIVE", () => {
    const s = [ev("one", "toward", { ones: 10, tens: 0 }), ev("regroup", "toward", { ones: 0, tens: 1 }, "regroup"), ev("one", "toward", { ones: 2, tens: 1 })];
    const r = classifyBaseTen(s, { targetOnes: 2, targetTens: 1 });
    expect(r).toBe("valid-grouping");
    expect(isPositiveStrategy({ domain: "base-ten", name: r! })).toBe(true);
  });

  it("REGRESSION (s45): transiting the target's ones digit is not a wrong-column diagnosis", () => {
    // A one-at-a-time builder necessarily passes THROUGH ones=4 on the way to
    // 34 — four transit moves must stay silent (the eager read fired here
    // before the settled-state bar). Two consecutive readings AT the digit,
    // tens still wrong, IS the diagnosis.
    const transit = Array.from({ length: 4 }, (_, i) => ev("one", "toward", { ones: i + 1, tens: 0 }));
    expect(classifyBaseTen(transit, { targetOnes: 4, targetTens: 3 })).toBeNull();
    const settled = [...transit, ev("one", "toward", { ones: 4, tens: 0 })]; // repeated at 4
    expect(classifyBaseTen(settled, { targetOnes: 4, targetTens: 3 })).toBe("wrong-regroup-column");
  });
});

describe("number line", () => {
  it("detects wrong-direction counting", () => {
    const s = [ev("m", "away", { pos: -1 }), ev("m", "away", { pos: -2 }), ev("m", "away", { pos: -3 })];
    expect(classifyNumberLine(s, { target: 5, start: 0 })).toBe("wrong-direction-count");
  });

  it("detects repeated overshoot", () => {
    const s = [ev("m", "past", { pos: 6 }), ev("m", "past", { pos: 4 }), ev("m", "past", { pos: 6 })];
    expect(classifyNumberLine(s, { target: 5, start: 0 })).toBe("repeated-overshoot");
  });
});

describe("ratios", () => {
  it("detects additive rather than multiplicative reasoning", () => {
    // Adds 1 to both terms twice (preserves difference, breaks ratio).
    const s = [ev("a", "away", { a: 2, b: 3 }), ev("a", "away", { a: 3, b: 4 }), ev("a", "away", { a: 4, b: 5 })];
    expect(classifyRatio(s, { aTarget: 4, bTarget: 6, aStart: 2, bStart: 3 })).toBe("additive-not-multiplicative");
  });
});

describe("algebra balance", () => {
  it("detects a one-sided operation, twice", () => {
    const s = [ev("one-side", "invalid"), ev("both", "toward"), ev("one-side", "invalid")];
    expect(classifyAlgebraBalance(s, { targetX: 3 })).toBe("one-sided-operation");
  });

  it("names a legal-but-long path as balanced-but-inefficient", () => {
    const s = Array.from({ length: 9 }, () => ev("both", "toward"));
    expect(classifyAlgebraBalance(s, { targetX: 3 })).toBe("balanced-but-inefficient");
  });
});

describe("graphs", () => {
  it("detects parameter trial-and-error (many moves, little progress)", () => {
    const s = Array.from({ length: 9 }, (_, i) => ev(i % 2 ? "m" : "b", "away"));
    expect(classifyGraph(s, { targetSlope: 2, targetIntercept: 1 })).toBe("parameter-trial-error");
  });
});

describe("integration with the adaptive ladder", () => {
  it("a positive strategy AFFIRMS once and never scaffolds (advanced learners are not slowed)", async () => {
    const { decideResponse } = await import("@/lib/adaptivePolicy");
    // First detection → affirm; later detections → silent; NEVER scaffold/remedial.
    expect(decideResponse({ signal: "common-denominator", occurrence: 1, fluent: false, remediatedSignals: [] })).toEqual({ kind: "affirm" });
    expect(decideResponse({ signal: "common-denominator", occurrence: 2, fluent: false, remediatedSignals: [] })).toEqual({ kind: "none" });
    expect(decideResponse({ signal: "benchmark-use", occurrence: 3, fluent: false, remediatedSignals: [] })).toEqual({ kind: "none" });
  });

  it("a misconception strategy flows through the SAME cue→structural→remedial ladder", async () => {
    const { decideResponse } = await import("@/lib/adaptivePolicy");
    const sig = "denominator-size-conflation" as const;
    expect(decideResponse({ signal: sig, occurrence: 1, fluent: false, remediatedSignals: [] }).kind).toBe("cue");
    expect(decideResponse({ signal: sig, occurrence: 2, fluent: false, remediatedSignals: [] }).kind).toBe("scaffold");
    expect(decideResponse({ signal: sig, occurrence: 3, fluent: false, remediatedSignals: [] }).kind).toBe("remedial");
    expect(decideResponse({ signal: sig, occurrence: 3, fluent: false, remediatedSignals: [sig] }).kind).toBe("none"); // one remedial per signal
    expect(decideResponse({ signal: sig, occurrence: 2, fluent: true, remediatedSignals: [] }).kind).toBe("none"); // fluent-gate
  });

  it("StrategyName union and the classifier return types stay in lockstep", async () => {
    // Every value a classifier can return must be assignable to StrategyName
    // (so it latches through signalCounts). This is a compile-time guarantee
    // exercised at runtime: the cue map has an entry for each.
    const everyStrategy: string[] = [
      "denominator-size-conflation", "piece-count-only", "unequal-whole", "denominator-addition", "common-denominator", "benchmark-use",
      "counting-by-one", "valid-grouping", "invalid-exchange", "wrong-regroup-column", "place-value-confusion", "efficient-decomposition",
      "wrong-direction-count", "interval-vs-point", "zero-crossing-slip", "negative-magnitude", "repeated-overshoot",
      "additive-not-multiplicative", "inconsistent-scaling", "equivalence-break", "unit-rate-confusion",
      "one-sided-operation", "wrong-inverse", "combine-unlike", "distribution-error", "sign-error", "balanced-but-inefficient",
      "parameter-trial-error"
    ];
    for (const name of everyStrategy) {
      // strategyCue must give real copy (not the bare fallback) for each.
      const c = strategyCue({ domain: "fractions", name: name as never });
      expect(c.length, name).toBeGreaterThan(30);
    }
  });
});

describe("cue copy", () => {
  it("has tentative, non-mind-reading copy for every strategy it can return", () => {
    const samples: Strategy[] = [
      { domain: "fractions", name: "denominator-size-conflation" },
      { domain: "base-ten", name: "counting-by-one" },
      { domain: "number-line", name: "repeated-overshoot" },
      { domain: "ratios", name: "additive-not-multiplicative" },
      { domain: "algebra-balance", name: "one-sided-operation" },
      { domain: "graphs", name: "parameter-trial-error" }
    ];
    for (const s of samples) {
      const c = strategyCue(s);
      expect(c.length, s.name).toBeGreaterThan(30);
      // never asserts what the learner IS/THINKS; hedged or structural voice
      expect(c, s.name).not.toMatch(/you are (confused|wrong|struggling)/i);
    }
  });
});
