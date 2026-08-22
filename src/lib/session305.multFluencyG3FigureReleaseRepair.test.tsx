import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "../components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";
import { Lesson } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body?: string;
  narration?: string;
  figure?: string;
  widget?: {
    type?: string;
    targetArea?: number;
    requireFactors?: { w?: number; h?: number };
    successFeedback?: string;
  };
  predict?: {
    outcomeId?: string;
    options?: Array<{ id?: string; label?: string }>;
    reveal?: string;
  };
  takeaways?: string[];
};

type RawLesson = {
  id: string;
  courseId: string;
  steps: RawStep[];
  remedials?: Array<{ check?: RawStep }>;
};

const lessonDir = join(process.cwd(), "content", "courses", "mult-fluency-g3", "lessons");
const alignedConcepts = [
  ["mf3-01-01", "c1", "mult3-double", "Times two is doubling: two equal groups join together."],
  ["mf3-01-06", "c2", "mult3-break-apart", "For 7 × 6, use 7 × 6 = 5 × 6 + 2 × 6."],
  ["mf3-02-02", "c2", "mult3-nines", "The nines pattern has one digit rising while the other falls."],
  ["mf3-02-05", "c1", "mult3-mult-table", "A multiplication table organizes rows and columns; practise harder facts until recall is reliable."],
  ["mf3-02-06", "c1", "mult3-break-apart", "When a fact does not come, break it into known groups: 7 × 6 = 5 × 6 + 2 × 6."],
  ["mf3-03-02", "c1", "mult3-mult-table", "A multiplication table organizes rows and columns; practise facts out of order to test recall."],
] as const;

function lesson(lessonId: string): RawLesson {
  return JSON.parse(readFileSync(join(lessonDir, `${lessonId}.json`), "utf8")) as RawLesson;
}

function step(current: RawLesson, stepId: string): RawStep {
  const found = current.steps.find((candidate) => candidate.id === stepId);
  if (!found) throw new Error(`${current.id}/${stepId} missing`);
  return found;
}

describe("S305 Grade 3 multiplication-fluency figure and release repair", () => {
  it("keeps every approved concept binding registered, visible, and text-aligned", () => {
    for (const [lessonId, stepId, figure, body] of alignedConcepts) {
      const concept = step(lesson(lessonId), stepId);
      expect(concept.figure).toBe(figure);
      expect(concept.body).toBe(body);
      expect(concept.narration).toBe(body);
      expect(FIGURES[figure]).toBeDefined();
      expect(isFigureTextAligned(figure, body)).toBe(true);
    }
  });

  it("keeps the whole eighteen-lesson course schema-valid after the bounded source repair", () => {
    const files = readdirSync(lessonDir).filter((file) => file.endsWith(".json")).sort();
    expect(files).toHaveLength(18);
    for (const file of files) {
      const current = lesson(file.replace(/\.json$/, ""));
      expect(current.courseId).toBe("mult-fluency-g3");
      expect(Lesson.safeParse(current).success, file).toBe(true);
    }
  });

  it("keeps the hard-facts prediction truthful without changing its stable outcome or area evaluator", () => {
    const hardFacts = lesson("mf3-02-05");
    const build = step(hardFacts, "i1");
    expect(build.predict?.outcomeId).toBe("a");
    expect(build.predict?.options?.[0]).toEqual({ id: "a", label: "Their patterns are less immediate" });
    expect(build.predict?.reveal).toBe("×5, ×9, and ×10 offer quick patterns; ×6 through ×8 often need direct recall or a derived step.");
    expect(build.widget?.type).toBe("areaModel");
    expect(build.widget?.targetArea).toBe(56);
    expect(build.widget?.requireFactors).toEqual({ w: 8, h: 7 });
    expect(step(hardFacts, "r1").takeaways?.[0]).toBe("Some facts need a strategy before they become automatic.");
    expect(JSON.stringify(hardFacts)).not.toContain("no skip-count shortcut");
    expect(JSON.stringify(hardFacts)).not.toContain("Some facts have no pattern.");
  });

  it("uses inverse-operation language for each fact-family evaluator feedback route", () => {
    const factFamilies = lesson("mf3-03-05");
    const feedback = ["k1", "k2", "k3", "ch1"].map((stepId) => step(factFamilies, stepId).widget?.successFeedback);
    feedback.push(factFamilies.remedials?.[0]?.check?.widget?.successFeedback);
    expect(feedback).toEqual([
      "Correct — 42 ÷ 6 = 7; division undoes 6 × 7 = 42.",
      "Correct — 72 ÷ 8 = 9; division undoes 8 × 9 = 72.",
      "Correct — 56 ÷ 7 = 8; division undoes 7 × 8 = 56.",
      "Correct — 54 ÷ 6 = 9; division undoes 6 × 9 = 54.",
      "Correct — 42 ÷ 6 = 7; division undoes 6 × 7 = 42.",
    ]);
    expect(JSON.stringify(factFamilies)).not.toMatch(/reciprocal of/i);
  });

  it("re-proves the corrected shared table through its course consumers", () => {
    const markup = renderToStaticMarkup(FIGURES["mult3-mult-table"]());
    expect(markup).toContain("4 × 4 = 16 (highlighted square fact)");
    expect(markup).toContain("four times four highlighted at sixteen");
    expect(markup).not.toContain("4 × 6 = 24 (highlighted)");
    expect(markup).not.toContain("four and six highlighted at twenty-four");

    for (const lessonId of ["mf3-02-05", "mf3-03-01", "mf3-03-02", "mf3-03-03", "mf3-03-06"]) {
      for (const stepId of ["c1", "c2"]) {
        const concept = step(lesson(lessonId), stepId);
        expect(concept.figure).toBe("mult3-mult-table");
        expect(isFigureTextAligned("mult3-mult-table", concept.body ?? "")).toBe(true);
      }
    }
  });
});
