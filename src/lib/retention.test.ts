// The retention loop, end to end — and the hole it had.
import { describe, expect, it } from "vitest";
import { applyResult, classify, emptySkill, retainedMastery } from "./mastery";
import { dueItems, onMiss, onReviewResult } from "./engine";
import { hasVariants, variantFor } from "./variants";

const hit = { firstTry: true, hintsUsed: 0, revealed: false };

describe("reviewing a skill must MOVE it", () => {
  it("a review result now feeds the mastery model (it did not before)", () => {
    // Before this fix, only LessonPlayer called applyResult. Review and Practice wrote XP and a
    // schedule box and left mastery untouched — so a learner could review a skill ten times and the
    // number a parent sees would never budge, and the "slipping" list could never recover.
    let m: Record<string, ReturnType<typeof emptySkill>> = { "eq-two-step": emptySkill("eq-two-step") };
    const before = m["eq-two-step"].mastery;
    for (let i = 0; i < 4; i++) m = applyResult(m, "eq-two-step", hit, "2026-03-01");
    expect(m["eq-two-step"].mastery).toBeGreaterThan(before);
    expect(classify(m["eq-two-step"])).not.toBe("new");
  });

  it("recovers a slipping skill: decayed, reviewed, restored", () => {
    let m: Record<string, ReturnType<typeof emptySkill>> = {};
    for (let i = 0; i < 5; i++) m = applyResult(m, "dr-chain-rule", hit, "2025-11-01");
    const scored = m["dr-chain-rule"].mastery;
    const cold = retainedMastery(m["dr-chain-rule"], "2026-03-01"); // 120 days later
    expect(cold).toBeLessThan(scored); // it has slipped...

    m = applyResult(m, "dr-chain-rule", hit, "2026-03-01"); // ...and a single review touches it
    expect(retainedMastery(m["dr-chain-rule"], "2026-03-01")).toBeGreaterThan(cold);
  });
});

describe("what a review actually TESTS", () => {
  it("a due item with a generator is re-served with fresh numbers, not the same question", () => {
    const key = "alg1-01-01:k1";
    const asked = variantFor("eq-two-step", `${key}:0:2026-03-01`)!; // box 0, first review
    const later = variantFor("eq-two-step", `${key}:1:2026-03-08`)!; // box 1, a week on
    expect(asked.tag).toBe(later.tag); // the same IDEA comes back...
    expect(asked.widget).not.toEqual(later.widget); // ...wearing different numbers
    // so passing it twice is evidence about the CONCEPT, not about remembering one question
  });

  it("and a concept with no generator is re-served exactly as authored", () => {
    expect(hasVariants("ca-mvt-consequences")).toBe(false);
    expect(variantFor("ca-mvt-consequences", "x")).toBeNull();
  });

  it("the SM-2 schedule still governs WHEN it comes back", () => {
    const r = onMiss([], { conceptTag: "eq-two-step", lessonId: "l", stepId: "s" }, "2026-03-01");
    expect(dueItems(r, "2026-03-01")).toHaveLength(0); // not the same day
    expect(dueItems(r, "2026-03-02")).toHaveLength(1); // 1d
    const passed = onReviewResult(r, "l:s", true, "2026-03-02");
    expect(dueItems(passed, "2026-03-03")).toHaveLength(0); // pushed out to 3d
    expect(dueItems(passed, "2026-03-05")).toHaveLength(1);
  });
});
