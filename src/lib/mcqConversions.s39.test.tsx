// @vitest-environment jsdom
/**
 * s39 MCQ→interaction conversions: every distractor's misconception must still
 * be detectable after the replacement. These load the ACTUAL shipped lessons
 * and drive each converted step's evaluator through the wrong-state each old
 * MCQ option encoded.
 *
 * fr-02-02 k1/k2 (mcq → numberLinePlace): the "placed at the b-th mark = 1"
 * misconception, previously a distractor, is now a reachable landing with its
 * own diagnosis.
 * fr-01-04 ch1 (mcq → fractionEntry): the numerator/denominator SWAP, once a
 * distractor, is now a trap on the entered fraction.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { evaluate } from "@/lib/evaluate";
import { WidgetSpec, type TWidget } from "@/lib/schema";

function stepWidget(rel: string, id: string): TWidget {
  const l = JSON.parse(readFileSync(join(process.cwd(), rel), "utf8"));
  const s = l.steps.find((x: { id: string }) => x.id === id);
  if (!s?.widget) throw new Error(`${rel}#${id} has no widget`);
  // Parse through the schema so zod defaults (whole:0, sign:1, …) apply exactly
  // as they do in the running app — evaluate receives parsed widgets, not raw JSON.
  return WidgetSpec.parse(s.widget) as TWidget;
}

describe("fr-02-02 conversion — placing 1/b on a jump line", () => {
  const k1 = stepWidget("content/courses/fractions/lessons/fr-02-02.json", "k1");
  const k2 = stepWidget("content/courses/fractions/lessons/fr-02-02.json", "k2");

  it("k1 is now a numberLinePlace at the first mark", () => {
    expect(k1.type).toBe("numberLinePlace");
    expect(evaluate(k1, 1).correct).toBe(true); // 1/6 = one jump
  });

  it("k1 detects the 'b-th mark = the fraction' misconception (mark 6 = 6/6 = 1)", () => {
    const r = evaluate(k1, 6);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/6\/6.*is 1|whole trip/);
  });

  it("k2 detects Nia's error — 1/5 is not the fifth mark", () => {
    expect(k2.type).toBe("numberLinePlace");
    expect(evaluate(k2, 1).correct).toBe(true); // correct: first mark
    const r = evaluate(k2, 5);
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/5\/5 = 1|finish line/);
  });
});

describe("fr-01-04 ch1 conversion — writing the corrected fraction", () => {
  const ch1 = stepWidget("content/courses/fractions/lessons/fr-01-04.json", "ch1");

  it("is now a fractionEntry whose answer is 2/6", () => {
    expect(ch1.type).toBe("fractionEntry");
    expect(evaluate(ch1, { whole: 0, num: 2, den: 6, sign: 1 }).correct).toBe(true);
  });

  it("detects the numerator/denominator SWAP (Sam's 6/2)", () => {
    const r = evaluate(ch1, { whole: 0, num: 6, den: 2, sign: 1 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/swap|six halves|three cakes/i);
  });

  it("detects taking the whole cake (6/6)", () => {
    const r = evaluate(ch1, { whole: 0, num: 6, den: 6, sign: 1 });
    expect(r.correct).toBe(false);
    expect(r.feedback).toMatch(/all six|whole cake/i);
  });
});
