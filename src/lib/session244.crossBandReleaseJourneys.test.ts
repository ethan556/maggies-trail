import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { Lesson, WidgetSpec, widgetIntegrityErrors } from "./schema";
import { lintLesson } from "./pedagogy";

type Journey = {
  id: string;
  band: string;
  grade: number;
  course: string;
  lesson: string;
  stepId: string;
  widgetType: string;
  predictionRequired: boolean;
};

const inventory = JSON.parse(
  readFileSync("reports/release/V4_CROSS_BAND_JOURNEYS.json", "utf8"),
) as { journeys: Journey[] };
const capabilities = JSON.parse(
  readFileSync("scripts/engine-capabilities.json", "utf8"),
) as { types: Record<string, { manip: number; a11y: number; mobile: number }> };

describe("S244 cross-band release journey inventory", () => {
  it("covers seven distinct curriculum bands and representative grades", () => {
    expect(inventory.journeys).toHaveLength(7);
    expect(new Set(inventory.journeys.map(({ id }) => id)).size).toBe(7);
    expect(new Set(inventory.journeys.map(({ band }) => band))).toEqual(
      new Set([
        "early",
        "elementary",
        "middle",
        "secondary-algebra",
        "secondary-geometry",
        "statistics",
        "calculus",
      ]),
    );
    expect(new Set(inventory.journeys.map(({ grade }) => grade))).toEqual(
      new Set([0, 3, 6, 9, 10, 11, 13]),
    );
    expect(new Set(inventory.journeys.map(({ course, lesson }) => `${course}/${lesson}`)).size).toBe(7);
  });

  for (const journey of inventory.journeys) {
    it(`${journey.id} points to a lint-clean, native, release-capable authored host`, () => {
      const document = Lesson.parse(
        JSON.parse(
          readFileSync(
            `content/courses/${journey.course}/lessons/${journey.lesson}.json`,
            "utf8",
          ),
        ),
      );
      expect(lintLesson(document)).toEqual([]);
      const course = JSON.parse(
        readFileSync(`content/courses/${journey.course}/course.json`, "utf8"),
      ) as { gradeLevel: number };
      expect(course.gradeLevel).toBe(journey.grade);

      const step = document.steps.find(({ id }) => id === journey.stepId);
      expect(step).toBeDefined();
      expect(step?.widget).toBeDefined();
      const widget = WidgetSpec.parse(step?.widget);
      expect(widget.type).toBe(journey.widgetType);
      expect(widgetIntegrityErrors(widget)).toEqual([]);
      expect(Boolean(step?.predict)).toBe(journey.predictionRequired);
      expect(capabilities.types[journey.widgetType]).toMatchObject({
        manip: expect.any(Number),
        a11y: expect.any(Number),
        mobile: expect.any(Number),
      });
      expect(capabilities.types[journey.widgetType].manip).toBeGreaterThanOrEqual(2);
      expect(capabilities.types[journey.widgetType].a11y).toBeGreaterThanOrEqual(2);
      expect(capabilities.types[journey.widgetType].mobile).toBeGreaterThanOrEqual(2);
    });
  }
});
