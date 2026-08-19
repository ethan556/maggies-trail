import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = { id: string; kind: string; body?: string; widget?: Record<string, unknown> };
type RawLesson = { id: string; courseId: string; steps: RawStep[]; remedials?: Array<{ conceptTag: string; concept: RawStep; check: RawStep }> };

const dir = join(process.cwd(), "content", "courses", "add-subtract-20", "lessons");
const lessons = readdirSync(dir).filter((name) => name.endsWith(".json")).sort()
  .map((name) => JSON.parse(readFileSync(join(dir, name), "utf8")) as RawLesson);
const byId = Object.fromEntries(lessons.map((lesson) => [lesson.id, lesson]));
const step = (lessonId: string, stepId: string) => byId[lessonId]!.steps.find((candidate) => candidate.id === stepId)!;
const normalizedPrompt = (prompt: unknown) => String(prompt ?? "").trim().toLowerCase()
  .replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#").replace(/\s+/g, " ");

const jobs = {
  "as-01-01/k1": /predict.*verify/i,
  "as-01-02/ch1": /Mia.*counters/i,
  "as-01-03/k3": /shorter route/i,
  "as-02-01/i2": /missing partner/i,
  "as-02-01/k2": /empty/i,
  "as-02-03/k2": /Move 2.*complete a ten/i,
  "as-02-04/k2": /Recombine the parts/i,
  "as-03-01/i2": /birds.*flying away/i,
  "as-03-01/k2": /counters.*Cover/i,
  "as-03-01/ch1": /Sam says.*because he added/i,
  "as-03-02/i2": /number line to check/i,
  "as-03-02/k2": /plus 5 rebuilds 7/i,
  "as-03-02/ch1": /Nia says.*only 3 backward counts/i,
  "as-03-03/i2": /Compare 10 and 6 on the number line/i,
  "as-03-03/k2": /cubes.*tower/i,
  "as-03-03/ch1": /shelf.*books/i,
  "as-03-04/i2": /Verify.*predict/i,
  "as-03-04/k2": /related addition/i,
  "as-03-04/ch1": /learner claims/i,
  "as-04-02/ch1": /left side.*same value/i,
  "as-04-03/k3": /birds.*Some arrive/i,
  "as-05-03/i2": /number-line gap/i,
} as const;

const expectedResponses: Record<string, unknown> = {
  "as-01-01/k1": 7,
  "as-01-02/ch1": 10,
  "as-01-03/k3": 11,
  "as-02-01/i2": 10,
  "as-02-01/k2": 4,
  "as-02-03/k2": 14,
  "as-02-04/k2": 15,
  "as-03-01/i2": 7,
  "as-03-01/k2": 3,
  "as-03-01/ch1": 7,
  "as-03-02/i2": 6,
  "as-03-02/k2": 2,
  "as-03-02/ch1": 8,
  "as-03-03/i2": 10,
  "as-03-03/k2": 4,
  "as-03-03/ch1": 4,
  "as-03-04/i2": 9,
  "as-03-04/k2": 9,
  "as-03-04/ch1": 8,
  "as-04-02/ch1": 3,
  "as-04-03/k3": 5,
  "as-05-03/i2": 14,
};

const sourceRows = [
  "PROGRESSION-as-01-01", "PROGRESSION-as-01-02", "PROGRESSION-as-01-03",
  "PROGRESSION-as-02-01", "PROGRESSION-as-02-03", "PROGRESSION-as-02-04",
  "PROGRESSION-as-03-01", "PROGRESSION-as-03-02", "PROGRESSION-as-03-03", "PROGRESSION-as-03-04",
  "PROGRESSION-as-04-02", "PROGRESSION-as-04-03", "PROGRESSION-as-05-03",
];

describe("S278 add-subtract-20 disjoint P1 progression repair", () => {
  it("keeps all 17 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(17);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("add-subtract-20");
      expect(new Set(raw.steps.map((candidate) => candidate.id)).size, raw.id).toBe(raw.steps.length);
      expect(lintLesson(Lesson.parse(raw)), raw.id).toEqual([]);
      const surfaces = [...raw.steps, ...(raw.remedials ?? []).flatMap((candidate) => [candidate.concept, candidate.check])];
      for (const candidate of surfaces) if (candidate.widget) {
        expect(widgetIntegrityErrors(WidgetSpec.parse(candidate.widget)), `${raw.id}/${candidate.id}`).toEqual([]);
      }
    }
  });

  it("eliminates every number-normalized main-prompt collision in the 13 owned lessons", () => {
    for (const row of sourceRows) {
      const lessonId = row.replace("PROGRESSION-", "");
      const templates = byId[lessonId]!.steps.filter((candidate) => candidate.widget)
        .map((candidate) => normalizedPrompt(candidate.widget!.prompt));
      expect(new Set(templates).size, lessonId).toBe(templates.length);
    }
  });

  it("assigns 22 distinct verification, transfer, representation, inverse, and critique jobs", () => {
    expect(Object.keys(jobs)).toHaveLength(22);
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

  it("seals exactly 13 source rows and excludes the dirty as-04-01 lesson", () => {
    expect(sourceRows).toHaveLength(13);
    expect(new Set(sourceRows).size).toBe(13);
    expect(sourceRows).not.toContain("PROGRESSION-as-04-01");
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
