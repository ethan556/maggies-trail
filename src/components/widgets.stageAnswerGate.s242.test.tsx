// @vitest-environment jsdom
/**
 * S242 / ENG-01 — A DERIVATION STAGE MAY NOT PRINT THE ANSWER BEFORE THE VERDICT.
 *
 * `ENG01_REVERSIBLE_PLAY_ASSESSMENT.md` measured seven staged-reveal engines, 648 authored
 * instances and **544 graded**, where the terminal derivation stage's `value` IS the graded answer.
 * On `exactNumberLab`'s `approximationEvaluate` task the leak is not even optional: 202 instances,
 * all graded, all with `authoredStages: []`, and 28 naming `approx:compute` in `requiredStageKeys` —
 * so `canCheck` refuses to enable the Check button until the learner has opened the panel that
 * prints the answer.
 *
 * These tests render the real widget through `WidgetRenderer` rather than calling the guard
 * directly, because the guard is only worth anything at the four places a stage reaches a learner:
 * the visible body, the accessible name, the extra "Exact state" line that an authored body does not
 * suppress, and the magnitude rail's landmarks.
 */
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { ExactNumberLabSpec } from "@/lib/schema";
import { canCheck } from "@/lib/evaluate";

/** The exact shape the 202 graded steps use: two given constants, a formula, a rounding place. */
const approx = ExactNumberLabSpec.parse({
  type: "exactNumberLab",
  task: "approximationEvaluate",
  answerMode: "numeric",
  prompt: "A projectile leaves at v_y and gravity is g. How high does it rise, to 2 decimal places?",
  values: [],
  choices: [],
  numericErrors: [],
  authoredStages: [],
  approxConstants: [
    { id: "vy", label: "v_y", value: 25 },
    { id: "g", label: "g", value: 10 }
  ],
  // The formula is a small expression TREE, not a string — `ApproxExprSpec` in schema.ts.
  approxFormula: {
    op: "divide",
    left: { op: "multiply", left: { op: "const", id: "vy" }, right: { op: "const", id: "vy" } },
    right: { op: "multiply", left: { op: "lit", value: 2 }, right: { op: "const", id: "g" } }
  },
  approxRound: 2,
  // The compulsion: the learner cannot answer until this stage is open.
  requiredStageKeys: ["approx:compute"],
  requiredExplorations: 3,
  tolerance: 0,
  successFeedback: "31.25 metres.",
  explorationFeedback: "Open the given constants.",
  fallbackFeedback: "Combine the constants and round."
});

/** 25² / (2 × 10) = 31.25 — the graded answer, and the thing that must not appear early. */
const ANSWER = "31.25";

function Host({ tone }: { tone?: "neutral" | "success" | "error" | "info" }) {
  const [v, setV] = useState<unknown>(null);
  return <WidgetRenderer spec={approx} value={v} disabled={false} tone={tone} onChange={setV} />;
}

const openEveryStage = () => {
  for (const button of screen.getAllByRole("button", { name: /Open exact-number stage/ })) fireEvent.click(button);
};

describe("ENG-01 — the answer-bearing stage is held until the verdict", () => {
  it("does not print the answer anywhere on screen while the learner is working", () => {
    render(<Host />);
    openEveryStage();
    // The whole rendered surface, not just the stage button: the rail's landmark ticks and the
    // readout are separate paths to the same number and each has leaked before.
    expect(document.body.textContent).not.toContain(ANSWER);
  });

  it("does not speak the answer either — the accessible name is a separate leak path", () => {
    render(<Host />);
    openEveryStage();
    for (const button of screen.getAllByRole("button")) {
      expect(button.getAttribute("aria-label") ?? "").not.toContain(ANSWER);
    }
    // `proportionalReasoningLab` put the value in the accessible name only, so a purely visual
    // check would have called that engine clean.
    expect(document.body.innerHTML).not.toContain(ANSWER);
  });

  it("still opens the stage and still says what the step IS", () => {
    // Withholding the value must not turn the stage into a dead end: the LABEL is the teaching, and
    // the learner is told this is the step they perform.
    render(<Host />);
    openEveryStage();
    expect(document.body.textContent).toContain("combine and round to 2 decimal places");
    expect(document.body.textContent).toContain("this is the step to work out yourself");
  });

  it("keeps the given constants visible — only the ANSWER is held", () => {
    // Over-withholding would be its own defect. The two constants are the learner's raw material.
    render(<Host />);
    openEveryStage();
    expect(document.body.textContent).toContain("v_y = 25");
    expect(document.body.textContent).toContain("g = 10");
  });

  it("reveals the answer after the verdict, where it teaches", () => {
    render(<Host tone="info" />);
    openEveryStage();
    expect(document.body.textContent).toContain(ANSWER);
  });

  it("leaves canCheck's requirement intact, which is now harmless rather than compulsory", () => {
    /* `requiredStageKeys: ["approx:compute"]` still forces the stage open — and that is fine now.
     * Opening it shows the learner which step is theirs to do and reveals no answer, so the
     * requirement went from "look at the answer before you may answer" to "read the instruction".
     * No content change was needed for the 28 steps that carry this key. */
    let latest: unknown = null;
    function Probe() {
      const [v, setV] = useState<unknown>(null);
      return <WidgetRenderer spec={approx} value={v} disabled={false} onChange={(x) => { latest = x; setV(x); }} />;
    }
    render(<Probe />);
    expect(canCheck(approx, latest)).toBe(false);
    openEveryStage();
    expect(canCheck(approx, latest)).toBe(false); // still needs a numeric answer
    expect((latest as { revealed?: string[] }).revealed).toContain("approx:compute");
  });
});
