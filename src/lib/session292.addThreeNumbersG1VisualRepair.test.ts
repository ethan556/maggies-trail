import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { isFigureTextAligned } from "./figureTextAlignment";
import { Lesson } from "./schema";

const path = join(process.cwd(), "content", "courses", "add-three-numbers-g1", "lessons", "g1t-01-01.json");
const raw = JSON.parse(readFileSync(path, "utf8"));
const lesson = Lesson.parse(raw);
const concept = lesson.steps.find((step) => step.id === "c1");

describe("S292 add-three-numbers-g1 visual repair", () => {
  it("binds the Grade 1 three-addends bridge to the exact rendered bar model", () => {
    expect(concept).toMatchObject({
      id: "c1",
      kind: "concept",
      figure: "bar-join",
      body: "The bar model shows 7 + 5 = 12. When adding three groups, join two parts first, then add the third group.",
      narration: "The bar model shows 7 + 5 = 12. When adding three groups, join two parts first, then add the third group.",
    });
    expect(FIGURE_IDS.has(concept?.figure ?? ""), concept?.figure).toBe(true);
    expect(isFigureTextAligned(concept?.figure ?? "", concept?.body ?? "")).toBe(true);
    expect(concept?.narration).toBe(concept?.body);
  });

  it("keeps learner jobs and evaluator-bearing steps untouched", () => {
    expect(lesson.steps.filter((step) => step.widget).map((step) => step.id)).toEqual(["i1", "k1", "i2", "k2", "k3", "ch1"]);
    expect(lesson.steps.find((step) => step.id === "i1")?.widget).toMatchObject({ type: "numberLineHop", start: 7, hops: 2, direction: "forward" });
    expect(lesson.steps.find((step) => step.id === "k1")?.widget).toMatchObject({ type: "numeric", answer: 9 });
    expect(lesson.steps.find((step) => step.id === "ch1")?.widget).toMatchObject({ type: "numeric", answer: 13 });
  });
});
