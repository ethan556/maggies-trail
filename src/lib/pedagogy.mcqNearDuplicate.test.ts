import { describe, expect, it } from "vitest";
import { Lesson } from "./schema";
import { lintLesson } from "./pedagogy";
import seedLesson from "../../content/courses/multiplication-division/lessons/mult-01-01.json";

/**
 * WS-G Phase 1 — near-duplicate mcq option-label detection, adjacent to the pre-existing
 * exact-duplicate check (pedagogy.ts, next to the S238 comment block). That block explicitly
 * declined to attempt near-duplicate detection because a check that needs semantic judgment
 * ("options whose labels differ but whose underlying scenarios overlap") cannot safely tell
 * "8" from "8 remainder 2" without false-positiving. This check does NOT attempt semantic
 * judgment — it is a deterministic fold (whitespace/case/edge-punctuation/one filler word) that
 * never touches a character embedded inside the text, so it inherits none of that risk.
 *
 * Both cases below are mutations of the same authored mcq step (mult-01-01/k1), so every other
 * pedagogy rule (feedback length, generic feedback, etc.) is already satisfied by the fixture and
 * only the near-duplicate rule is exercised by the mutation.
 */

const base = Lesson.parse(seedLesson);

describe("WS-G mcq near-duplicate option-label detection", () => {
  it("TRUE POSITIVE: catches phrasing that differs only by a leading filler word and trailing punctuation", () => {
    const bad = structuredClone(base);
    const k1 = bad.steps.find((s) => s.id === "k1");
    if (k1?.widget?.type !== "mcq") throw new Error("fixture drifted: k1 is no longer an mcq step");
    // Authored option "a" is "3 bags with 4 apples in each bag". Relabel option "d" to a
    // near-duplicate that folds to the identical text (leading "The " + trailing "." only).
    const optA = k1.widget.options.find((o) => o.id === "a")!;
    const optD = k1.widget.options.find((o) => o.id === "d")!;
    expect(optD.label).not.toBe(optA.label); // sanity: not already an exact duplicate pre-mutation
    optD.label = `The ${optA.label}.`;

    const errs = lintLesson(bad);
    expect(errs.some((e) => e.includes("near-duplicate phrasing"))).toBe(true);
    // The exact-duplicate check must NOT also fire — the two labels are not byte-identical, only
    // near-duplicate, and the two checks are deliberately kept from double-reporting one pair.
    expect(errs.some((e) => e.includes("share the label"))).toBe(false);
  });

  it("PROTECTED FALSE POSITIVE: '8' vs '8 remainder 2' must NOT be flagged", () => {
    const safe = structuredClone(base);
    const k1 = safe.steps.find((s) => s.id === "k1");
    if (k1?.widget?.type !== "mcq") throw new Error("fixture drifted: k1 is no longer an mcq step");
    const optA = k1.widget.options.find((o) => o.id === "a")!;
    const optB = k1.widget.options.find((o) => o.id === "b")!;
    optA.label = "8";
    optB.label = "8 remainder 2";

    const errs = lintLesson(safe);
    expect(errs.some((e) => e.includes("near-duplicate phrasing"))).toBe(false);
  });

  it("PROTECTED FALSE POSITIVE: an embedded decimal point is never folded away ('0.8' vs '08' style collision)", () => {
    const safe = structuredClone(base);
    const k1 = safe.steps.find((s) => s.id === "k1");
    if (k1?.widget?.type !== "mcq") throw new Error("fixture drifted: k1 is no longer an mcq step");
    const optA = k1.widget.options.find((o) => o.id === "a")!;
    const optB = k1.widget.options.find((o) => o.id === "b")!;
    optA.label = "0.8";
    optB.label = "0.08";

    const errs = lintLesson(safe);
    expect(errs.some((e) => e.includes("near-duplicate phrasing"))).toBe(false);
  });

  it("TRUE POSITIVE: catches phrasing that differs only by a TRAILING filler particle", () => {
    const bad = structuredClone(base);
    const k1 = bad.steps.find((s) => s.id === "k1");
    if (k1?.widget?.type !== "mcq") throw new Error("fixture drifted: k1 is no longer an mcq step");
    const optA = k1.widget.options.find((o) => o.id === "a")!;
    const optD = k1.widget.options.find((o) => o.id === "d")!;
    // "…, too." exercises the re-strip of edge punctuation exposed by removing the particle:
    // "3 bags…, too." → "3 bags…, too" → "3 bags…," → "3 bags…".
    optD.label = `${optA.label}, too.`;

    const errs = lintLesson(bad);
    expect(errs.some((e) => e.includes("near-duplicate phrasing"))).toBe(true);
    expect(errs.some((e) => e.includes("share the label"))).toBe(false);
  });

  it("PROTECTED FALSE POSITIVE: a quantitatively load-bearing trailing word is NOT filler ('18' vs '18 total')", () => {
    const safe = structuredClone(base);
    const k1 = safe.steps.find((s) => s.id === "k1");
    if (k1?.widget?.type !== "mcq") throw new Error("fixture drifted: k1 is no longer an mcq step");
    const optA = k1.widget.options.find((o) => o.id === "a")!;
    const optB = k1.widget.options.find((o) => o.id === "b")!;
    optA.label = "18";
    optB.label = "18 total";

    const errs = lintLesson(safe);
    expect(errs.some((e) => e.includes("near-duplicate phrasing"))).toBe(false);
  });

  it("PROTECTED FALSE POSITIVE: a bare one-word option is never folded to nothing ('Too' vs 'Also' stay distinct)", () => {
    const safe = structuredClone(base);
    const k1 = safe.steps.find((s) => s.id === "k1");
    if (k1?.widget?.type !== "mcq") throw new Error("fixture drifted: k1 is no longer an mcq step");
    const optA = k1.widget.options.find((o) => o.id === "a")!;
    const optB = k1.widget.options.find((o) => o.id === "b")!;
    optA.label = "Too";
    optB.label = "Also";

    const errs = lintLesson(safe);
    expect(errs.some((e) => e.includes("near-duplicate phrasing"))).toBe(false);
  });

  it("PROTECTED FALSE POSITIVE: a sign or embedded operator keeps options distinct ('(−4, 1)' vs '(4, 1)')", () => {
    // The corpus sweep behind this rule found 318 pairs of this exact shape (sign flips, decimal
    // shifts, ± mirrors) that an all-punctuation-stripping fold would have wrongly merged. They
    // are the single largest false-positive class, so they get a pinned regression test.
    const safe = structuredClone(base);
    const k1 = safe.steps.find((s) => s.id === "k1");
    if (k1?.widget?.type !== "mcq") throw new Error("fixture drifted: k1 is no longer an mcq step");
    const optA = k1.widget.options.find((o) => o.id === "a")!;
    const optB = k1.widget.options.find((o) => o.id === "b")!;
    const optC = k1.widget.options.find((o) => o.id === "c")!;
    optA.label = "(−4, 1)";
    optB.label = "(4, 1)";
    optC.label = "1.26";
    const optD = k1.widget.options.find((o) => o.id === "d")!;
    optD.label = "12.6";

    const errs = lintLesson(safe);
    expect(errs.some((e) => e.includes("near-duplicate phrasing"))).toBe(false);
  });

  it("the unmodified seed lesson still lints clean (self-check: the new rule adds no false positives here)", () => {
    expect(lintLesson(base)).toEqual([]);
  });
});
