import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { isFigureTextAligned } from "./figureTextAlignment";
import { Lesson } from "./schema";

const path = join(process.cwd(), "content", "courses", "four-addends-g2", "lessons", "g2n-03-02.json");
const raw = JSON.parse(readFileSync(path, "utf8"));
const lesson = Lesson.parse(raw);
const concept = lesson.steps.find((step) => step.id === "c2");
const remedialConcept = lesson.remedials.find((route) => route.conceptTag === "g2n-check")?.concept;

describe("S293 four-addends-g2 visual repair", () => {
  it("binds the regrouping check to the exact equality rendered by the balance", () => {
    expect(concept).toMatchObject({
      id: "c2",
      kind: "concept",
      figure: "add-balance-scale",
      body: "The balance shows 6 + 4 = 10: both sides name the same amount. When adding four addends, regrouping does not change the total, so two correct paths agree.",
      narration: "The balance shows 6 + 4 = 10: both sides name the same amount. When adding four addends, regrouping does not change the total, so two correct paths agree.",
    });
    expect(FIGURE_IDS.has(concept?.figure ?? ""), concept?.figure).toBe(true);
    expect(isFigureTextAligned(concept?.figure ?? "", concept?.body ?? "")).toBe(true);
    expect(concept?.narration).toBe(concept?.body);
    expect(remedialConcept?.figure).toBeUndefined();
  });

  it("keeps evaluator-bearing learner jobs unchanged", () => {
    expect(lesson.steps.filter((step) => step.widget).map((step) => step.id)).toEqual(["i1", "k1", "i2", "k2", "k3", "ch1"]);
    expect(lesson.steps.find((step) => step.id === "i2")?.widget).toMatchObject({ type: "numberLineHop", start: 34, hop: 8, hops: 1, direction: "forward" });
    expect(lesson.steps.find((step) => step.id === "k1")?.widget).toMatchObject({ type: "numeric", answer: 35 });
    expect(lesson.steps.find((step) => step.id === "ch1")?.widget).toMatchObject({ type: "numeric", answer: 71 });
  });
});
