// @vitest-environment jsdom
/**
 * S187 — the fact-grain review loop, end to end.
 *
 * S186 built `weakestFacts`/`dueFacts` and the `factItems` leech box, but NOTHING consumed them:
 * the review page still served only `lessonId:stepId` cards, so a learner's actual weakest facts
 * were tracked and then never surfaced. These tests pin the loop that closes that gap:
 * a due family becomes a drill, answering it moves that family's box, and the fact queue can
 * never crowd out or corrupt the conceptual queue it sits beside.
 */
import { describe, expect, it } from "vitest";
import { applyFactResult, dueFacts, factDrillFor, factReviewKey, weakestFacts, type FactItemState } from "@/lib/factFluency";
import { evaluate } from "@/lib/evaluate";
import { WidgetSpec, type TWidget } from "@/lib/schema";

const TODAY = "2026-08-02";
const LATER = "2026-08-09";

/** The selection the review page performs, factored out so the test pins the POLICY rather than
 * React internals: due families only, weakest first, capped. */
function selectFactFamilies(states: Record<string, FactItemState>, today: string, cap: number): string[] {
  const due = dueFacts(states, today);
  return weakestFacts(states, due.length > 0 ? due : [], cap, today);
}

describe("S187 review selection — only due, only met, weakest first", () => {
  it("a family that is due is selected and becomes a gradable drill", () => {
    let s: Record<string, FactItemState> = {};
    s = applyFactResult(s, "7x8", false, TODAY); // missed → due TODAY+1
    const picked = selectFactFamilies(s, LATER, 5);
    expect(picked).toContain("7x8");

    const drill = factDrillFor("7x8", 0);
    const w = WidgetSpec.parse(drill.widget) as TWidget;
    expect(evaluate(w, w.type === "numeric" ? w.answer : null).correct).toBe(true);
  });

  it("never introduces a fact the learner has not met", () => {
    // empty leech box → nothing due → nothing selected, even though the universe is large
    expect(selectFactFamilies({}, TODAY, 5)).toEqual([]);
  });

  it("a graduated family is not re-served", () => {
    let s: Record<string, FactItemState> = {};
    for (let i = 0; i < 4; i++) s = applyFactResult(s, "2x2", true, TODAY);
    expect(s["2x2"].due).toBe("");
    expect(selectFactFamilies(s, LATER, 5)).not.toContain("2x2");
  });

  it("is capped, so a fluency backlog cannot crowd out the conceptual queue", () => {
    let s: Record<string, FactItemState> = {};
    for (const f of ["2x3", "2x4", "2x5", "2x6", "2x7", "2x8", "2x9"]) s = applyFactResult(s, f, false, TODAY);
    expect(selectFactFamilies(s, LATER, 5)).toHaveLength(5);
  });

  it("selection is deterministic — same states and day give the same cards", () => {
    let s: Record<string, FactItemState> = {};
    for (const f of ["3x4", "5x6", "7x9"]) s = applyFactResult(s, f, false, TODAY);
    expect(selectFactFamilies(s, LATER, 5)).toEqual(selectFactFamilies(s, LATER, 5));
  });
});

describe("S187 review recording — fact keys route to the leech box", () => {
  /** The record() branch the review page runs for a `fact:` key. */
  const recordFact = (states: Record<string, FactItemState>, key: string,
    r: { firstTry: boolean; hintsUsed: number; revealed: boolean }, today: string) => {
    expect(key.startsWith("fact:")).toBe(true);
    return applyFactResult(states, key.slice("fact:".length), r.firstTry && !r.revealed && r.hintsUsed === 0, today);
  };

  it("an unaided first-try success advances that family's box", () => {
    let s: Record<string, FactItemState> = applyFactResult({}, "7x8", false, TODAY);
    expect(s["7x8"].box).toBe(0);
    s = recordFact(s, factReviewKey("7x8"), { firstTry: true, hintsUsed: 0, revealed: false }, LATER);
    expect(s["7x8"].box).toBe(1);
    expect(s["7x8"].correctStreak).toBe(1);
  });

  it("a hinted or revealed success does NOT advance the box — fluency means unaided recall", () => {
    const base: Record<string, FactItemState> = applyFactResult({}, "7x8", true, TODAY);
    const hinted = recordFact(base, factReviewKey("7x8"), { firstTry: true, hintsUsed: 1, revealed: false }, LATER);
    expect(hinted["7x8"].box).toBe(0);
    const revealed = recordFact(base, factReviewKey("7x8"), { firstTry: true, hintsUsed: 0, revealed: true }, LATER);
    expect(revealed["7x8"].box).toBe(0);
  });

  it("only the answered family moves; the rest of the leech box is untouched", () => {
    let s: Record<string, FactItemState> = {};
    s = applyFactResult(s, "7x8", false, TODAY);
    s = applyFactResult(s, "6x9", false, TODAY);
    const before = JSON.stringify(s["6x9"]);
    s = recordFact(s, factReviewKey("7x8"), { firstTry: true, hintsUsed: 0, revealed: false }, LATER);
    expect(JSON.stringify(s["6x9"])).toBe(before);
  });

  it("fact keys are namespaced so they can never be mistaken for a lessonId:stepId card", () => {
    expect(factReviewKey("7x8")).toBe("fact:7x8");
    // a real review key from the lesson queue must not match the fact branch
    expect("mf3-01-01:k1".startsWith("fact:")).toBe(false);
  });
});
