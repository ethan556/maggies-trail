import { describe, expect, it } from "vitest";
import { McqSpec, widgetIntegrityErrors } from "./schema";
import { evaluate } from "./evaluate";

/**
 * WS-G Phase 1 — plain `mcq` gains the same "exactly one correct option" integrity check the
 * ~10 newer Lab choice-widgets already have (scaledCircleLab, compoundEventLab,
 * compositeAreaLab, …; see schema.ts:6973/8154/8189 for the established pattern this mirrors).
 *
 * WHY IT EXISTS. evaluate.ts's mcq branch grades by looking up the selected option's `correct`
 * flag directly (`spec.options.find((o) => o.id === value).correct`) — it never checks that
 * exactly one option is marked correct. Before this check, an author marking two options
 * `correct: true` would ship silently: a learner is graded right no matter which of the two
 * they pick, and nothing in the repo caught it.
 */

const baseOptions = [
  { id: "a", label: "3", correct: true, feedback: "Yes — a triangle has exactly 3 sides." },
  { id: "b", label: "4", correct: false, feedback: "4 sides makes a quadrilateral, not a triangle." },
  { id: "c", label: "5", correct: false, feedback: "5 sides makes a pentagon, not a triangle." }
];

function mcq(options: typeof baseOptions) {
  return McqSpec.parse({
    type: "mcq",
    prompt: "How many sides does a triangle have?",
    options
  });
}

describe("WS-G mcq exactly-one-correct integrity check", () => {
  it("REJECTS zero correct options", () => {
    const spec = mcq(baseOptions.map((o) => ({ ...o, correct: false })));
    const errs = widgetIntegrityErrors(spec);
    expect(errs).toContain("mcq: expected exactly one correct option, found 0");
  });

  it("ACCEPTS exactly one correct option", () => {
    const spec = mcq(baseOptions);
    expect(widgetIntegrityErrors(spec)).toEqual([]);
  });

  it("REJECTS two correct options", () => {
    const spec = mcq(baseOptions.map((o) => (o.id === "b" ? { ...o, correct: true } : o)));
    const errs = widgetIntegrityErrors(spec);
    expect(errs).toContain("mcq: expected exactly one correct option, found 2");
  });

  it("demonstrates the exact defect the check prevents: with two options marked correct, evaluate() grades either pick as correct", () => {
    const broken = mcq(baseOptions.map((o) => (o.id === "b" ? { ...o, correct: true } : o)));
    // The check above would refuse this spec before it ships. This test pins WHY that refusal
    // matters: absent the check, evaluate.ts (unchanged by this gate) grades both "a" and "b"
    // correct, even though only one is the intended answer.
    expect(evaluate(broken, "a").correct).toBe(true);
    expect(evaluate(broken, "b").correct).toBe(true);
    expect(evaluate(broken, "c").correct).toBe(false);
  });
});
