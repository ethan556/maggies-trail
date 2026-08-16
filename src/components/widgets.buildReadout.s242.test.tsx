// @vitest-environment jsdom
/**
 * S242 / ENG-01 R4 — DOES `buildExpression`'s LIVE READOUT ANNOUNCE THE VERDICT TOO?
 *
 * `dragOrder`'s size plot was one of four engines given a "live consequence" readout in s48, and
 * measuring it found an oracle: the plot sorted the list the learner was being graded on ordering.
 * The obvious next question is whether its siblings do the same, and `buildExpression` is the one
 * that could — `readExpression` (`widgets.tsx:15575`) evaluates the built sequence and the readout
 * prints, in leaf-green or berry-red, `— both sides equal` / `— the sides differ` whenever the
 * build contains a single `=` with two numerically-evaluable sides.
 *
 * On a step whose task is "build a TRUE equation", that verdict is the grading, announced before
 * Check.
 *
 * Rather than reason about `readExpression`'s reach from its source, this renders EVERY authored
 * `buildExpression` spec with its own correct sequence already placed — the most favourable state
 * for a leak — and reads what a learner would see. The measurement is the assertion: if a future
 * authored step ever does build a numerically-balanced equation, this goes red and the readout has
 * to be gated the way `dragOrder`'s plot now is.
 *
 * Result at seal 245605c: **0 of 232**. Twelve authored steps do build an equation, and every one
 * of them is algebraic (`x² + y² = 4`, `y − 5 = 3(x − 2)`, `t ÷ 4 = 5`) or carries units
 * (`4 × 6 tens = 24 tens`), so `readExpression` returns `balance: null` and the readout says
 * nothing about correctness. The engine is clean today, by content rather than by construction —
 * which is exactly the kind of fact that needs a gate rather than a note.
 */
import { describe, expect, it } from "vitest";
import { render, cleanup, screen } from "@testing-library/react";
import { afterEach } from "vitest";
import { readFileSync, globSync } from "node:fs";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import { WidgetRenderer } from "./widgets";

afterEach(() => cleanup());

interface Case { lesson: string; step: string; kind: string; spec: TWidget; correct: string[] }

const cases: Case[] = [];
for (const file of globSync("content/courses/*/lessons/*.json")) {
  const lesson = JSON.parse(readFileSync(file, "utf8")) as { steps?: Array<Record<string, unknown>> };
  for (const step of lesson.steps ?? []) {
    const raw = step.widget as { type?: string; correct?: string[] } | undefined;
    if (!raw || raw.type !== "buildExpression" || !Array.isArray(raw.correct)) continue;
    const parsed = WidgetSpec.safeParse(raw);
    if (!parsed.success) continue;
    cases.push({
      lesson: file.split("/").pop()!.replace(".json", ""),
      step: String(step.id), kind: String(step.kind ?? "?"),
      spec: parsed.data as TWidget, correct: raw.correct,
    });
  }
}

describe("S242 — buildExpression's live readout does not announce correctness", () => {
  it("found buildExpression steps to render", () => {
    expect(cases.length).toBeGreaterThan(200);
  });

  it("never shows a balance verdict during active work, on any authored step", () => {
    const leaking: string[] = [];
    for (const c of cases) {
      // The correct sequence already placed and NO tone — the most favourable state for a leak.
      render(<WidgetRenderer spec={c.spec} value={c.correct} onChange={() => {}} disabled={false} />);
      const readout = screen.queryByTestId("be-reading")?.textContent ?? "";
      if (/both sides equal|the sides differ/.test(readout))
        leaking.push(`${c.lesson}#${c.step} (${c.kind}): "${readout.slice(0, 70)}"`);
      cleanup();
    }
    expect(
      leaking,
      "the readout grades the built equation before the learner presses Check"
    ).toEqual([]);
  });
});
