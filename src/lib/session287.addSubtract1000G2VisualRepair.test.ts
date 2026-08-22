import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { isFigureTextAligned } from "./figureTextAlignment";
import { Lesson } from "./schema";

type ConceptPlacement = {
  kind: string;
  figure: string;
  body: string;
  narration?: string;
};

const directory = join(process.cwd(), "content", "courses", "add-subtract-1000-g2", "lessons");
const acrossZero = Lesson.parse(JSON.parse(readFileSync(join(directory, "g2b-02-04.json"), "utf8")));
const mentalHundred = Lesson.parse(JSON.parse(readFileSync(join(directory, "g2b-02-06.json"), "utf8")));

function conceptStep(lesson: typeof acrossZero, id: "c1" | "c2") {
  const step = lesson.steps.find((candidate) => candidate.id === id);
  expect(step, `${lesson.id}/${id}`).toBeDefined();
  expect(step!.kind, `${lesson.id}/${id}`).toBe("concept");
  return step as unknown as ConceptPlacement;
}

function remedialConcept(lesson: typeof acrossZero, conceptTag: string) {
  const remedial = lesson.remedials.find((candidate) => candidate.conceptTag === conceptTag);
  expect(remedial, `${lesson.id}/${conceptTag}`).toBeDefined();
  return remedial!.concept as unknown as ConceptPlacement;
}

describe("S287 add/subtract within 1,000, Grade 2 — visual source repair", () => {
  it("replaces the clipped Grade 3 borrow exemplar with visible, grade-aligned trading diagrams", () => {
    const firstTrade = conceptStep(acrossZero, "c1");
    const secondTrade = conceptStep(acrossZero, "c2");
    const remedial = remedialConcept(acrossZero, "g2b-across-zero");

    expect(firstTrade.figure).toBe("pv1000-cascade-down");
    expect(secondTrade.figure).toBe("pv1000-trade-down");
    expect(remedial.figure).toBe("pv1000-trade-down");
    expect([firstTrade, secondTrade, remedial].map((concept) => concept.figure)).not.toContain("pv3-borrow-zero");

    for (const concept of [firstTrade, secondTrade, remedial]) {
      expect(FIGURE_IDS.has(concept.figure), concept.figure).toBe(true);
      expect(isFigureTextAligned(concept.figure, concept.body), `${concept.figure}: ${concept.body}`).toBe(true);
    }

    expect(firstTrade.body).toContain("1 hundred into 10 tens");
    expect(secondTrade.body).toContain("1 of those tens into 10 ones");
    expect(remedial.body).toBe(secondTrade.body);
  });

  it("binds the hundred-count illustration to the exact displayed number sequence", () => {
    const concept = conceptStep(mentalHundred, "c2");
    const remedial = remedialConcept(mentalHundred, "g2b-mental-hundred");
    // Reworded by S318-FIGA-g2b-02-06 (committed 992b590) to escape a blocklisted stale figure
    // fingerprint and spell "two hundred" for skip-count-line's word-number title alignment, then
    // trimmed by s326-R1-g2b-02-06 to fit the S247 language-length contract and sync narration.
    // Independently re-verified aligned=true, not blocklisted (see LESSON_REVIEW_DECISIONS_S244.jsonl).
    const expected = "Skip-count by hundreds from two hundred: 200, 300, 400, 500, 600. Each +100 hop slides the hundreds digit.";

    for (const placement of [concept, remedial]) {
      expect(placement.figure).toBe("skip-count-line");
      expect(placement.body).toBe(expected);
      expect(placement.narration).toBe(expected);
      expect(FIGURE_IDS.has(placement.figure), placement.figure).toBe(true);
      expect(isFigureTextAligned(placement.figure, placement.body)).toBe(true);
      expect(placement.body).not.toContain("348");
      expect(placement.body).not.toContain("448");
      expect(placement.body).not.toContain("548");
    }
  });
});
