// @vitest-environment jsdom
/**
 * S186 REGRESSION SPEC — fact-family evidence must be strictly ADDITIVE.
 *
 * The bug this pins: when the fact-family write was first wired into finalize(), the
 * pre-existing `progressStore.save(pm)` — the call that persists the conceptTag mastery update
 * from applyResult() — was accidentally moved INSIDE the `if (s.variant?.factFamily)` branch.
 * Since almost no lesson sets factFamily, that silently stopped persisting mastery for
 * essentially every ordinary check/challenge step in the app. Nothing in the existing suite
 * asserted mastery PERSISTENCE (only that it isn't duplicated), so the whole suite stayed green.
 *
 * These tests therefore assert the property that was violated — mastery reaches storage on a
 * step with NO factFamily — plus the fact-grain behavior itself, so neither can regress alone.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { usePlayer, resetAdvanceLatch, setAdvanceLatchForTest } from "./playerStore";
import { progressStore } from "@/lib/progress";
import type { TLesson } from "@/lib/schema";

/** A numeric check with an easily-hit answer, so the test drives grading rather than widget math. */
function numericStep(id: string, conceptTag: string, variant?: Record<string, unknown>) {
  return {
    id,
    kind: "check",
    md: "Answer it.",
    conceptTag,
    ...(variant ? { variant } : {}),
    widget: {
      type: "numeric" as const,
      prompt: "7 x 8 = ?",
      answer: 56,
      tolerance: 0,
      unit: "",
      commonErrors: [{ value: 54, feedback: "That is 6 x 9 — a neighbouring fact, not this one." }],
      fallbackFeedback: "Count up by sevens, or lean on 7 x 4 doubled."
    },
    hints: ["Think 7 x 4, doubled."]
  };
}

const PLAIN: TLesson = {
  id: "s186-plain",
  title: "Plain check",
  minutes: 3,
  steps: [numericStep("k1", "g3m-x7")]
} as unknown as TLesson;

const FLUENCY: TLesson = {
  id: "s186-fluency",
  title: "Fluency check",
  minutes: 3,
  steps: [numericStep("k1", "g3m-x7", { gen: "g3-mult-fluency", form: "MultFactNumeric", factFamily: "7x8" })]
} as unknown as TLesson;

const p = () => usePlayer.getState();

function boot(lesson: TLesson) {
  window.localStorage.clear();
  resetAdvanceLatch();
  setAdvanceLatchForTest(0);
  p().load(lesson);
}

beforeEach(() => {
  window.localStorage.clear();
  resetAdvanceLatch();
  setAdvanceLatchForTest(0);
});

describe("S186 regression — conceptTag mastery persists regardless of factFamily", () => {
  it("a check with NO factFamily still writes mastery to storage (the exact regression)", () => {
    boot(PLAIN);
    p().setValue(56);
    p().check();
    const saved = progressStore.load();
    expect(saved.mastery).toBeDefined();
    expect(saved.mastery!["g3m-x7"]).toBeDefined();
    expect(saved.mastery!["g3m-x7"].attempts).toBe(1);
    expect(saved.mastery!["g3m-x7"].mastery).toBeGreaterThan(0);
  });

  it("a check with NO factFamily writes no factItems at all", () => {
    boot(PLAIN);
    p().setValue(56);
    p().check();
    const saved = progressStore.load();
    expect(saved.factItems ?? {}).toEqual({});
  });

  it("a check WITH factFamily writes mastery AND factItems in the same finalize", () => {
    boot(FLUENCY);
    p().setValue(56);
    p().check();
    const saved = progressStore.load();
    expect(saved.mastery!["g3m-x7"].attempts).toBe(1);
    expect(saved.factItems!["7x8"]).toBeDefined();
    expect(saved.factItems!["7x8"].family).toBe("7x8");
  });
});

describe("S186 — fact evidence is stricter than mastery evidence", () => {
  it("first-try correct advances the fact box", () => {
    boot(FLUENCY);
    p().setValue(56);
    p().check();
    const saved = progressStore.load();
    expect(saved.factItems!["7x8"].box).toBe(1);
    expect(saved.factItems!["7x8"].correctStreak).toBe(1);
    expect(saved.factItems!["7x8"].misses).toBe(0);
  });

  it("a retry-recovered answer counts as a MISS for fluency even though mastery still credits it", () => {
    boot(FLUENCY);
    p().setValue(54); // wrong first
    p().check();
    expect(p().phase).toBe("retry");
    p().tryAgain();
    p().setValue(56); // right on the retry
    p().check();
    const saved = progressStore.load();
    // fluency = instant recall: a second-attempt success is not automatic recall
    expect(saved.factItems!["7x8"].box).toBe(0);
    expect(saved.factItems!["7x8"].misses).toBe(1);
    expect(saved.factItems!["7x8"].correctStreak).toBe(0);
    // ...but the conceptTag mastery estimate still records real (partial) evidence
    expect(saved.mastery!["g3m-x7"].attempts).toBe(1);
    expect(saved.mastery!["g3m-x7"].mastery).toBeGreaterThan(0);
  });

  it("a revealed answer counts as a miss for the fact family", () => {
    boot(FLUENCY);
    p().setValue(54);
    p().check();
    p().reveal();
    const saved = progressStore.load();
    expect(saved.factItems!["7x8"].misses).toBe(1);
    expect(saved.factItems!["7x8"].box).toBe(0);
  });
});
