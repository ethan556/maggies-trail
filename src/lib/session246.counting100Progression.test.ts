import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { WidgetSpec, widgetIntegrityErrors } from "./schema";

const ROOT = join(process.cwd(), "content", "courses", "counting-to-100-k", "lessons");
const BEFORE_PATHS = {
  "k100-01-01": "k2 ch1",
  "k100-01-02": "ch1",
  "k100-01-03": "ch1",
  "k100-01-04": "k2",
  "k100-01-05": "k2 ch1",
  "k100-01-06": "ch1",
  "k100-02-01": "ch1",
  "k100-02-02": "k3 ch1",
  "k100-02-03": "k2 ch1",
  "k100-02-04": "k3 ch1",
  "k100-02-05": "k2 ch1",
  "k100-03-01": "k1 ch1",
  "k100-03-02": "k1 ch1",
  "k100-03-03": "ch1",
  "k100-03-04": "k1 ch1",
  "k100-03-05": "ch1",
  "k100-03-06": "k2 ch1",
  "k100-03-07": "k1 ch1",
} as const;

type LessonId = keyof typeof BEFORE_PATHS;
type Lesson = {
  id: LessonId;
  steps: Array<{
    id: string;
    kind: string;
    figure?: string;
    widget?: Record<string, unknown> & { type?: string; prompt?: string };
  }>;
  remedials: Array<{ check: { widget: Record<string, unknown> & { type?: string; prompt?: string; answer?: number } } }>;
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

describe("S246 Counting to 100 complete-course progression packet", () => {
  it("closes all 18 queue-defined rows and 29 normalized-repeat placements", () => {
    expect(LESSON_IDS).toHaveLength(18);
    expect(Object.values(BEFORE_PATHS).flatMap((path) => path.split(" "))).toHaveLength(29);

    for (const lessonId of LESSON_IDS) {
      const lesson = lessons[lessonId];
      expect(repeatedTemplateIds(lesson), lessonId).toEqual([]);
      for (const lessonStep of lesson.steps.filter((candidate) => candidate.widget)) {
        const parsed = WidgetSpec.parse(lessonStep.widget);
        expect(widgetIntegrityErrors(parsed), `${lessonId}/${lessonStep.id}`).toEqual([]);
      }
    }
  });

  it("preserves the visual-first hosts throughout the complete course", () => {
    for (const lessonId of LESSON_IDS) {
      const lesson = lessons[lessonId];
      expect(step(lesson, "c1").figure, `${lessonId}/c1 figure`).toBe("number-track");
      expect(step(lesson, "c2").figure, `${lessonId}/c2 figure`).toBe("number-track");
      expect(step(lesson, "i1").widget?.type, `${lessonId}/i1 causal host`).toBe("numberLineHop");
      expect(step(lesson, "i2").widget?.type, `${lessonId}/i2 ordering host`).toBe("dragOrder");
    }
  });

  it("uses contextual, constraint, or reverse-direction challenge jobs instead of template repeats", () => {
    const challengeContract: Record<LessonId, RegExp> = {
      "k100-01-01": /hiker.*marker/i,
      "k100-01-02": /train.*station/i,
      "k100-01-03": /bead.*six spaces/i,
      "k100-01-04": /right before.*hop one back/i,
      "k100-01-05": /climber.*marker/i,
      "k100-01-06": /rocket.*seven spaces/i,
      "k100-02-01": /tray.*bundles of ten/i,
      "k100-02-02": /box.*bundles of ten/i,
      "k100-02-03": /token.*down.*row/i,
      "k100-02-04": /class.*towers of ten/i,
      "k100-02-05": /beads.*groups of ten/i,
      "k100-03-01": /game piece.*five spaces/i,
      "k100-03-02": /hiker.*five markers/i,
      "k100-03-03": /rabbit.*four spaces/i,
      "k100-03-04": /rocket.*six spaces/i,
      "k100-03-05": /counter.*last square/i,
      "k100-03-06": /Milo.*after.*before/i,
      "k100-03-07": /game piece.*backward five spaces/i,
    };

    for (const lessonId of LESSON_IDS) {
      const challenge = step(lessons[lessonId], "ch1");
      expect(challenge.kind, `${lessonId}/challenge kind`).toBe("challenge");
      expect(challenge.widget?.prompt, `${lessonId}/challenge job`).toMatch(challengeContract[lessonId]);
    }
  });

  it("gives every lesson a simpler concrete remedial whose prompt agrees with its answer", () => {
    const answerContract: Record<LessonId, number> = {
      "k100-01-01": 24,
      "k100-01-02": 30,
      "k100-01-03": 44,
      "k100-01-04": 60,
      "k100-01-05": 80,
      "k100-01-06": 99,
      "k100-02-01": 30,
      "k100-02-02": 70,
      "k100-02-03": 33,
      "k100-02-04": 40,
      "k100-02-05": 40,
      "k100-03-01": 13,
      "k100-03-02": 60,
      "k100-03-03": 31,
      "k100-03-04": 82,
      "k100-03-05": 36,
      "k100-03-06": 43,
      "k100-03-07": 9,
    };

    for (const lessonId of LESSON_IDS) {
      const lesson = lessons[lessonId];
      expect(lesson.remedials).toHaveLength(1);
      const remedial = lesson.remedials[0]!.check.widget;
      const parsed = WidgetSpec.parse(remedial);
      expect(widgetIntegrityErrors(parsed), `${lessonId}/remedial`).toEqual([]);
      expect(remedial.type, `${lessonId}/remedial surface`).toBe("numeric");
      expect(remedial.answer, `${lessonId}/remedial truth`).toBe(answerContract[lessonId]);
      expect(String(remedial.prompt), `${lessonId}/remedial action`).toMatch(/counter|bundles|boxes/i);

      const primaryTemplates = new Set(lesson.steps
        .filter((candidate) => candidate.widget?.prompt)
        .map((candidate) => normalizedPrompt(String(candidate.widget!.prompt))));
      expect(primaryTemplates.has(normalizedPrompt(String(remedial.prompt))), `${lessonId}/remedial copy`).toBe(false);
    }
  });
});
