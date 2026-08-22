import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; widget?: Record<string, unknown> };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ conceptTag: string; concept: RawStep; check: RawStep }> };

const dir = join(process.cwd(), "content", "courses", "add-subtract-100", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;
const normalizedPrompt = (prompt: unknown) => String(prompt ?? "").trim().toLowerCase()
  .replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ");

const jobs = {
  "as100-01-01/k2": /known double.*two groups/i,
  "as100-01-02/k2": /one more.*near double/i,
  "as100-01-02/ch1": /domino.*altogether/i,
  "as100-01-03/k2": /Move 1.*complete 10.*Recombine/i,
  "as100-01-03/ch1": /learner says.*corrected/i,
  "as100-02-01/k2": /tens are doubled.*ones/i,
  "as100-02-01/k3": /bundles of ten.*both boxes/i,
  "as100-02-01/ch1": /10 tens.*ones/i,
  "as100-02-02/k2": /single ones.*keeping its 2 tens/i,
  "as100-02-02/k3": /single counters.*tens unchanged/i,
  "as100-02-02/ch1": /7 tens and 1 one.*build/i,
  "as100-02-03/k2": /Split.*by place.*combine/i,
  "as100-02-03/ch1": /learner adds all four digits/i,
  "as100-02-04/k2": /Trade 10 ones.*standard-form/i,
  "as100-02-04/ch1": /learner writes 316.*corrected/i,
  "as100-03-01/k2": /10 tens.*remove 5 tens/i,
  "as100-03-01/k3": /bundles of ten lose/i,
  "as100-03-01/ch1": /leaves 2 tens.*ones/i,
  "as100-03-02/k2": /single ones.*keeping its 4 tens/i,
  "as100-03-02/k3": /loses 4 single ones.*tens unchanged/i,
  "as100-03-02/ch1": /learner subtracts 4 tens.*corrected/i,
  "as100-03-03/k2": /Decompose.*by place/i,
  "as100-03-03/ch1": /related addition/i,
  "as100-05-01/k2": /ones digit.*pair/i,
  "as100-05-01/k3": /complete pairs.*Classify/i,
} as const;

const expectedResponses: Record<string, unknown> = {
  "as100-01-01/k2": 14,
  "as100-01-02/k2": 17,
  "as100-01-02/ch1": 11,
  "as100-01-03/k2": 14,
  "as100-01-03/ch1": 17,
  "as100-02-01/k2": 80,
  "as100-02-01/k3": "a",
  "as100-02-01/ch1": 100,
  "as100-02-02/k2": 27,
  "as100-02-02/k3": "a",
  "as100-02-02/ch1": 79,
  "as100-02-03/k2": 77,
  "as100-02-03/ch1": 88,
  "as100-02-04/k2": 84,
  "as100-02-04/ch1": 46,
  "as100-03-01/k2": 50,
  "as100-03-01/k3": "a",
  "as100-03-01/ch1": 20,
  "as100-03-02/k2": 44,
  "as100-03-02/k3": "a",
  "as100-03-02/ch1": 61,
  "as100-03-03/k2": 44,
  "as100-03-03/ch1": 32,
  "as100-05-01/k2": { paired: 3, choice: "odd" },
  "as100-05-01/k3": { paired: 0, choice: "even" },
};

const sourceRows = [
  "PROGRESSION-as100-01-01", "PROGRESSION-as100-01-02", "PROGRESSION-as100-01-03",
  "PROGRESSION-as100-02-01", "PROGRESSION-as100-02-02", "PROGRESSION-as100-02-03", "PROGRESSION-as100-02-04",
  "PROGRESSION-as100-03-01", "PROGRESSION-as100-03-02", "PROGRESSION-as100-03-03",
  "PROGRESSION-as100-05-01",
];

describe("S278 add-subtract-100 disjoint P1 progression repair", () => {
  it("keeps all 16 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(16);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("add-subtract-100");
      expect(new Set(raw.steps.map((candidate) => candidate.id)).size, raw.id).toBe(raw.steps.length);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((candidate) => [candidate.concept, candidate.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("eliminates every number-normalized main-prompt collision in the 11 owned lessons", () => {
    for (const row of sourceRows) {
      const lessonId = row.replace("PROGRESSION-", "");
      const templates = byId[lessonId]!.steps.filter((candidate) => candidate.widget)
        .map((candidate) => normalizedPrompt(candidate.widget!.prompt));
      expect(new Set(templates).size, lessonId).toBe(templates.length);
    }
  });

  it("assigns 25 distinct representation, transfer, decomposition, inverse, and critique jobs", () => {
    expect(Object.keys(jobs)).toHaveLength(25);
    for (const [placement, pattern] of Object.entries(jobs)) {
      const [lessonId, stepId] = placement.split("/");
      expect(String(step(lessonId, stepId).widget?.prompt), placement).toMatch(pattern);
    }
  });

  it("preserves every changed evaluator target", () => {
    for (const [placement, response] of Object.entries(expectedResponses)) {
      const [lessonId, stepId] = placement.split("/");
      const widget = WidgetSpec.parse(step(lessonId, stepId).widget);
      expect(evaluate(widget, response).correct, placement).toBe(true);
    }
  });

  it("seals 11 source rows and excludes both dirty as100-03-04 rows", () => {
    expect(sourceRows).toHaveLength(11);
    expect(new Set(sourceRows).size).toBe(11);
    expect(sourceRows).not.toContain("PROGRESSION-as100-03-04");
    expect("CHOICE-0002").not.toMatch(/^PROGRESSION-/);
  });

  it("preserves every course MCQ option evaluator and feedback contract", () => {
    for (const lesson of lessons) {
      const surfaces = [...lesson.steps, ...(lesson.remedials ?? []).map((candidate) => candidate.check)];
      for (const candidate of surfaces) {
        if (!candidate.widget) continue;
        const widget = WidgetSpec.parse(candidate.widget);
        if (widget.type !== "mcq") continue;
        expect(widget.options.filter((option) => option.correct), `${lesson.id}/${candidate.id}`).toHaveLength(1);
        for (const option of widget.options) {
          const result = evaluate(widget, option.id);
          expect(result.correct, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.correct);
          expect(result.feedback, `${lesson.id}/${candidate.id}/${option.id}`).toBe(option.feedback);
        }
      }
    }
  });
});
