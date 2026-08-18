import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

const ROOT = join(process.cwd(), "content", "courses", "decimals-intro-g4", "lessons");
const BEFORE_PATHS = {
  "dg4-01-01": "i2 k2 ch1",
  "dg4-01-02": "i2 k3 ch1",
  "dg4-01-03": "i2 k3 ch1",
  "dg4-01-04": "i2 k3 ch1",
  "dg4-01-05": "i2 k3 ch1",
  "dg4-01-06": "i2 k2 ch1",
  "dg4-02-01": "i2 k3 ch1",
  "dg4-02-02": "i2 k2 ch1",
  "dg4-02-03": "i2 k2 k3 ch1",
  "dg4-02-04": "i2 k2 k3 ch1",
  "dg4-02-05": "i2 k2 k3 ch1",
  "dg4-02-06": "i2 k2 k3 ch1",
  "dg4-03-01": "i2 k2 k3 ch1",
  "dg4-03-02": "i2 k2 k3 ch1",
  "dg4-03-03": "i2 k2 k3 ch1",
  "dg4-03-04": "k3 ch1 i2",
  "dg4-03-05": "i2 k2 k3 ch1",
  "dg4-03-06": "i2 k2 k3 ch1",
} as const;

type LessonId = keyof typeof BEFORE_PATHS;
type Lesson = {
  id: LessonId;
  steps: Array<{
    id: string;
    kind: string;
    figure?: string;
    widget?: Record<string, unknown> & { type?: string; prompt?: string; answer?: unknown };
  }>;
  remedials: Array<{ check: { widget: Record<string, unknown> & { prompt?: string } } }>;
};

const LESSON_IDS = Object.keys(BEFORE_PATHS) as LessonId[];
const lessons = Object.fromEntries(LESSON_IDS.map((id) => [
  id,
  JSON.parse(readFileSync(join(ROOT, `${id}.json`), "utf8")) as Lesson,
])) as Record<LessonId, Lesson>;

const normalizedPrompt = (prompt: string) => prompt
  .toLowerCase()
  .replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#")
  .replace(/\s+/g, " ");

const repeatedTemplateIds = (lesson: Lesson) => {
  const widgets = lesson.steps.filter((step) => step.widget).map((step) => ({
    id: step.id,
    template: normalizedPrompt(String(step.widget?.prompt ?? "").trim()),
  }));
  return [...new Set(widgets.filter((item, index) => item.template &&
    widgets.findIndex((candidate) => candidate.template === item.template) !== index)
    .map((item) => item.id))];
};

const step = (lesson: Lesson, id: string) => lesson.steps.find((candidate) => candidate.id === id)!;

describe("S246 Grade 4 decimals complete-course progression packet", () => {
  it("closes all 18 queue-defined rows and 63 normalized-repeat placements", () => {
    expect(LESSON_IDS).toHaveLength(18);
    expect(Object.values(BEFORE_PATHS).flatMap((path) => path.split(" "))).toHaveLength(63);

    for (const lessonId of LESSON_IDS) {
      const lesson = lessons[lessonId];
      expect(repeatedTemplateIds(lesson), lessonId).toEqual([]);
      for (const lessonStep of lesson.steps.filter((candidate) => candidate.widget)) {
        const parsed = WidgetSpec.parse(lessonStep.widget);
        expect(widgetIntegrityErrors(parsed), `${lessonId}/${lessonStep.id}`).toEqual([]);
      }
    }
  });

  it("preserves the visual-first hundredths model throughout the course", () => {
    for (const lessonId of LESSON_IDS) {
      const lesson = lessons[lessonId];
      expect(step(lesson, "c1").figure, `${lessonId}/c1 figure`).toBe("dpv-hundredths-grid");
      expect(step(lesson, "c2").figure, `${lessonId}/c2 figure`).toBe("dpv-hundredths-grid");
      expect(step(lesson, "i1").widget?.type, `${lessonId}/i1 visual host`).toBe("hundredthsGrid");
      expect(step(lesson, "i2").widget?.type, `${lessonId}/i2 visual host`).toBe("hundredthsGrid");
    }
  });

  it("assigns every challenge a distinct, grade-appropriate transfer job", () => {
    const challengeContract: Record<LessonId, RegExp> = {
      "dg4-01-01": /trail sections/i,
      "dg4-01-02": /trail markers/i,
      "dg4-01-03": /runner.*course/i,
      "dg4-01-04": /recipe.*oats/i,
      "dg4-01-05": /Maya.*columns/i,
      "dg4-01-06": /mosaic/i,
      "dg4-02-01": /designer.*tile/i,
      "dg4-02-02": /bead trail/i,
      "dg4-02-03": /trail.*woods.*bridge/i,
      "dg4-02-04": /tiles.*blue/i,
      "dg4-02-05": /3 tenths.*6 hundredths/i,
      "dg4-02-06": /trail crew/i,
      "dg4-03-01": /mosaic.*tiles/i,
      "dg4-03-02": /hiker.*trail/i,
      "dg4-03-03": /game meter/i,
      "dg4-03-04": /hikers.*progress/i,
      "dg4-03-05": /donation jar/i,
      "dg4-03-06": /plant.*centimeters/i,
    };

    for (const lessonId of LESSON_IDS) {
      const challenge = step(lessons[lessonId], "ch1");
      expect(challenge.kind, `${lessonId}/challenge kind`).toBe("challenge");
      expect(challenge.widget?.prompt, `${lessonId}/challenge transfer`).toMatch(challengeContract[lessonId]);
    }
  });

  it("uses distinct, simpler remedial language instead of copying a main question", () => {
    for (const lessonId of LESSON_IDS) {
      const lesson = lessons[lessonId];
      expect(lesson.remedials).toHaveLength(1);
      const remedial = lesson.remedials[0]!.check.widget;
      const parsed = WidgetSpec.parse(remedial);
      expect(widgetIntegrityErrors(parsed), `${lessonId}/remedial`).toEqual([]);

      const primaryTemplates = new Set(lesson.steps
        .filter((candidate) => candidate.widget?.prompt)
        .map((candidate) => normalizedPrompt(String(candidate.widget!.prompt))));
      expect(primaryTemplates.has(normalizedPrompt(String(remedial.prompt))), `${lessonId}/remedial copy`).toBe(false);
      expect(String(remedial.prompt).split(/\s+/).length, `${lessonId}/remedial length`).toBeLessThanOrEqual(22);
    }
  });
});
