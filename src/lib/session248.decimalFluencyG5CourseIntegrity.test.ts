import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { evaluate } from "./evaluate";
import { lintLesson } from "./pedagogy";
import { seededShuffle } from "./prng";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body?: string;
  narration?: string;
  figure?: string;
  widget?: unknown;
};

type RawLesson = {
  id: string;
  title: string;
  courseId: string;
  steps: RawStep[];
  remedials?: Array<{ concept?: RawStep; check?: RawStep }>;
};

const lessonDir = join(
  process.cwd(),
  "content",
  "courses",
  "decimal-fluency-g5",
  "lessons",
);

const lessons = readdirSync(lessonDir)
  .filter((name) => name.endsWith(".json"))
  .sort()
  .map(
    (name) =>
      JSON.parse(readFileSync(join(lessonDir, name), "utf8")) as RawLesson,
  );

const stable = (value: unknown): string => {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") {
    return `{${Object.keys(value)
      .sort()
      .map(
        (key) =>
          `${JSON.stringify(key)}:${stable((value as Record<string, unknown>)[key])}`,
      )
      .join(",")}}`;
  }
  return JSON.stringify(value);
};

const normalizedPrompt = (prompt: string) =>
  prompt
    .toLowerCase()
    .replace(/[-−+]?\d+(?:[.,/]\d+)*/g, "#")
    .replace(/\s+/g, " ");

const allSteps = (lesson: RawLesson): RawStep[] => [
  ...lesson.steps,
  ...(lesson.remedials ?? []).flatMap((remedial) =>
    [remedial.concept, remedial.check].filter(
      (step): step is RawStep => Boolean(step),
    ),
  ),
];

describe("S248 decimal-fluency-g5 whole-course integrity", () => {
  it("keeps all 16 lessons schema-valid, pedagogy-clean, and widget-integral", () => {
    expect(lessons).toHaveLength(16);
    for (const raw of lessons) {
      expect(raw.courseId).toBe("decimal-fluency-g5");
      expect(raw.steps.map((step) => step.id)).toEqual([
        "c1",
        "i1",
        "k1",
        "c2",
        "i2",
        "k2",
        "k3",
        "ch1",
        "r1",
      ]);
      const parsed = Lesson.parse(raw);
      expect(lintLesson(parsed), raw.id).toEqual([]);
      for (const step of allSteps(raw)) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        expect(widgetIntegrityErrors(widget), `${raw.id}/${step.id}`).toEqual(
          [],
        );
      }
    }
  });

  it("uses synchronized decimal visuals instead of the former generic hop figure", () => {
    const figures = new Set<string>();
    for (const lesson of lessons) {
      const concepts = lesson.steps.filter((step) => step.kind === "concept");
      expect(concepts, lesson.id).toHaveLength(2);
      expect(concepts[0].figure, lesson.id).not.toBe(concepts[1].figure);
      for (const concept of concepts) {
        expect(concept.figure, `${lesson.id}/${concept.id}`).toBeTruthy();
        expect(concept.figure, `${lesson.id}/${concept.id}`).not.toBe(
          "count-on-hops",
        );
        expect(FIGURE_IDS.has(concept.figure!), `${lesson.id}/${concept.id}`).toBe(
          true,
        );
        expect(concept.narration).toBe(concept.body);
        expect(concept.body?.length).toBeGreaterThan(70);
        figures.add(concept.figure!);
      }
    }
    expect(figures.size).toBe(13);
  });

  it("closes every live same-sitting repetition cause used by the authoritative detector", () => {
    for (const lesson of lessons) {
      const widgets = lesson.steps
        .filter((step) => step.widget)
        .map((step) => {
          const widget = step.widget as { prompt?: string };
          return {
            id: step.id,
            signature: stable(widget),
            prompt: String(widget.prompt ?? "").trim(),
          };
        });

      expect(new Set(widgets.map((row) => row.signature)).size, lesson.id).toBe(
        widgets.length,
      );
      expect(new Set(widgets.map((row) => row.prompt)).size, lesson.id).toBe(
        widgets.length,
      );
      expect(
        new Set(widgets.map((row) => normalizedPrompt(row.prompt))).size,
        lesson.id,
      ).toBe(widgets.length);

      const i1 = lesson.steps.find((step) => step.id === "i1")!;
      const i2 = lesson.steps.find((step) => step.id === "i2")!;
      expect(stable(i1.widget), lesson.id).not.toBe(stable(i2.widget));
      expect(i2.body, lesson.id).toContain("claim");
    }
  });

  it("keeps authored MCQs cue-resistant, runtime-shuffled, and evaluator-true", () => {
    const prompts = new Set<string>();
    let count = 0;

    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        if (widget.type !== "mcq") continue;
        count += 1;
        expect(prompts.has(widget.prompt), `${lesson.id}/${step.id}`).toBe(false);
        prompts.add(widget.prompt);
        expect(widget.options.filter((option) => option.correct)).toHaveLength(1);
        expect(widget.options.find((option) => option.correct)?.id).toBe("o0");
        expect(new Set(widget.options.map((option) => option.label)).size).toBe(
          widget.options.length,
        );
        expect(new Set(widget.options.map((option) => option.feedback)).size).toBe(
          widget.options.length,
        );

        const lengths = widget.options.map((option) => option.label.length);
        expect(Math.max(...lengths) - Math.min(...lengths)).toBeLessThanOrEqual(14);
        expect(widget.options[0].correct).toBe(true);

        for (const option of widget.options) {
          const result = evaluate(widget, option.id);
          expect(result.correct, `${lesson.id}/${step.id}/${option.id}`).toBe(
            option.correct,
          );
          expect(result.feedback).toBe(option.feedback);
          expect(option.feedback.length).toBeGreaterThan(45);
        }

        const shuffledPositions = new Set<number>();
        for (let index = 0; index < 32; index += 1) {
          const seed = `s248:${lesson.id}:${step.id}:${index}`;
          const first = seededShuffle(widget.options, seed);
          const second = seededShuffle(widget.options, seed);
          expect(first.map((option) => option.id)).toEqual(
            second.map((option) => option.id),
          );
          expect(first.map((option) => option.id).sort()).toEqual(
            widget.options.map((option) => option.id).sort(),
          );
          shuffledPositions.add(first.findIndex((option) => option.correct));
        }
        expect([...shuffledPositions].sort()).toEqual([0, 1, 2, 3]);
      }
    }

    expect(count).toBe(23);
  });

  it("preserves numeric evaluator truth and removes the unrelated column feedback", () => {
    for (const lesson of lessons) {
      for (const step of lesson.steps) {
        if (!step.widget) continue;
        const widget = WidgetSpec.parse(step.widget);
        if (widget.type === "numeric") {
          expect(
            evaluate(widget, widget.answer).correct,
            `${lesson.id}/${step.id}`,
          ).toBe(true);
        }
        if (widget.type === "columnCalc") {
          const answer = widget.op === "add" ? widget.a + widget.b : widget.a - widget.b;
          expect(widget.successFeedback).toContain(`${answer} hundredths`);
          expect(widget.successFeedback).not.toContain("24,681");
          expect(widget.fallbackFeedback).not.toMatch(/Add column/i);
        }
      }
    }
  });

  it("uses concise Grade 5 directions and specific transfer tasks", () => {
    const learnerText = JSON.stringify(lessons);
    expect(learnerText).not.toMatch(/Try it again|One more, for the road|You did it!/);
    expect(learnerText).not.toMatch(
      /ADDS the decimal places|SAME size|DIVISOR:|SIZE is possible/,
    );
    expect(learnerText).not.toContain("the teacher adds 0");

    for (const lesson of lessons) {
      const challenge = lesson.steps.find((step) => step.id === "ch1")!;
      const prompt = String(
        (challenge.widget as { prompt?: string } | undefined)?.prompt ?? "",
      );
      expect(challenge.body).toBe("Solve the transfer challenge.");
      expect(prompt.length, lesson.id).toBeGreaterThan(35);
      expect(prompt.endsWith("?") || prompt.endsWith(".")).toBe(true);
    }
  });
});
