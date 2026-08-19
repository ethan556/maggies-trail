import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "../components/figureIds";
import { isFigureTextAligned } from "./figureTextAlignment";
import { lintLesson } from "./pedagogy";
import { Lesson } from "./schema";

type RawStep = {
  id: string;
  kind: string;
  body?: string;
  narration?: string;
  figure?: string;
  widget?: { type?: string };
};

type RawLesson = {
  id: string;
  courseId: string;
  title: string;
  steps: RawStep[];
  remedials?: Array<{ concept?: RawStep; check?: RawStep }>;
};

const lessonDir = join(
  process.cwd(),
  "content",
  "courses",
  "mult-fluency-g3",
  "lessons",
);

const lessonIds = [
  "mf3-01-01",
  "mf3-01-02",
  "mf3-01-03",
  "mf3-01-04",
  "mf3-01-05",
  "mf3-01-06",
  "mf3-02-01",
  "mf3-02-02",
  "mf3-02-03",
  "mf3-02-04",
  "mf3-02-05",
  "mf3-02-06",
  "mf3-03-01",
  "mf3-03-02",
  "mf3-03-03",
  "mf3-03-04",
  "mf3-03-05",
  "mf3-03-06",
] as const;

const expectedFigures: Record<
  (typeof lessonIds)[number],
  string | readonly [string, string] | null
> = {
  "mf3-01-01": "mult3-double",
  "mf3-01-02": "mult3-equal-groups",
  "mf3-01-03": "mult3-double-double",
  "mf3-01-04": "mult3-fives",
  "mf3-01-05": "mult3-break-apart",
  "mf3-01-06": "mult3-break-apart",
  "mf3-02-01": "mult3-double-double",
  "mf3-02-02": "mult3-nines",
  "mf3-02-03": ["mult3-times-ten-place-value", "mult3-times-ten-empty-ones"],
  "mf3-02-04": ["mult3-square-array", "mult3-next-square-growth"],
  "mf3-02-05": "mult3-mult-table",
  "mf3-02-06": "mult3-break-apart",
  "mf3-03-01": "mult3-mult-table",
  "mf3-03-02": "mult3-mult-table",
  "mf3-03-03": "mult3-mult-table",
  "mf3-03-04": "mult3-missing-factor",
  "mf3-03-05": "mult3-fact-family",
  "mf3-03-06": "mult3-mult-table",
};

const lessons = lessonIds.map((lessonId) =>
  JSON.parse(
    readFileSync(join(lessonDir, `${lessonId}.json`), "utf8"),
  ) as RawLesson,
);

const step = (lesson: RawLesson, id: string) => {
  const found = lesson.steps.find((candidate) => candidate.id === id);
  expect(found, `${lesson.id} is missing ${id}`).toBeDefined();
  return found as RawStep;
};

describe("S248 Grade 3 multiplication-fluency whole-course integrity", () => {
  it("contains exactly the intended 18-lesson portfolio", () => {
    const files = readdirSync(lessonDir)
      .filter((name) => name.endsWith(".json"))
      .map((name) => name.replace(/\.json$/, ""))
      .sort();

    expect(files).toEqual([...lessonIds]);
    expect(lessons.every((lesson) => lesson.courseId === "mult-fluency-g3")).toBe(
      true,
    );
  });

  it("keeps every lesson schema-valid and free of pedagogy errors", () => {
    for (const rawLesson of lessons) {
      const parsed = Lesson.safeParse(rawLesson);
      expect(parsed.success, `${rawLesson.id} schema failure`).toBe(true);
      if (!parsed.success) continue;

      expect(lintLesson(parsed.data)).toEqual([]);
    }
  });

  it("preserves the full concept-action-check progression in every lesson", () => {
    const expectedStepIds = [
      "c1",
      "i1",
      "k1",
      "c2",
      "i2",
      "k2",
      "k3",
      "ch1",
      "r1",
    ];

    for (const lesson of lessons) {
      expect(lesson.steps.map((candidate) => candidate.id)).toEqual(
        expectedStepIds,
      );
      expect(step(lesson, "i1").widget?.type).toBe("areaModel");
      expect(step(lesson, "i2").widget?.type).toBe("areaModel");
      expect(lesson.remedials).toHaveLength(1);
      expect(lesson.remedials?.[0]?.concept?.kind).toBe("concept");
      expect(lesson.remedials?.[0]?.check?.kind).toBe("check");
    }
  });

  it("tracks complete registered concept figures while removing every bar comparison", () => {
    const registeredFigures = new Set<string>(FIGURE_IDS);
    let semanticPlacementCount = 0;
    let intentionallyUnillustratedCount = 0;
    const independentlyWithheld: string[] = [];

    for (const lesson of lessons) {
      const expected = expectedFigures[lesson.id as (typeof lessonIds)[number]];
      for (const [index, id] of (["c1", "c2"] as const).entries()) {
        const concept = step(lesson, id);
        const expectedFigure = Array.isArray(expected) ? expected[index] : expected;
        expect(concept.figure).toBe(expectedFigure ?? undefined);
        expect(concept.body).toBe(concept.narration);

        if (expectedFigure) {
          expect(registeredFigures.has(expectedFigure)).toBe(true);
          expect(expectedFigure.startsWith("mult3-")).toBe(true);
          if (!isFigureTextAligned(expectedFigure, concept.body ?? "")) independentlyWithheld.push(`${lesson.id}/${id}`);
          semanticPlacementCount += 1;
        } else {
          const next = lesson.steps[lesson.steps.indexOf(concept) + 1];
          expect(next.kind).toBe("interactive");
          expect(next.widget?.type).toBe("areaModel");
          intentionallyUnillustratedCount += 1;
        }
      }
    }

    expect(semanticPlacementCount).toBe(36);
    expect(intentionallyUnillustratedCount).toBe(0);
    expect(independentlyWithheld).toEqual([]);
    expect(JSON.stringify(lessons)).not.toContain('"figure":"bar-compare"');
  });

  it("uses truthful place-value language for multiplying by ten", () => {
    const learnerText = JSON.stringify(lessons);
    expect(learnerText).not.toMatch(/shifts every digit|digits move up/i);
    expect(learnerText).not.toContain("Digits shift one place left.");

    const timesTen = lessons.find((lesson) => lesson.id === "mf3-02-03");
    expect(timesTen).toBeDefined();
    expect(step(timesTen as RawLesson, "c1").body).toContain(
      "each digit worth ten times as much",
    );
    expect(timesTen?.remedials?.[0]?.concept?.body).toContain(
      "empty ones place",
    );
  });

  it("avoids the two audited Grade 3 overclaims", () => {
    const learnerText = JSON.stringify(lessons);
    expect(learnerText).not.toMatch(/×7 facts have no easy pattern/i);
    expect(learnerText).not.toMatch(/resist every pattern/i);
    expect(step(lessons[5], "c1").body).toContain("facts you already know");
    expect(step(lessons[10], "c1").body).toMatch(/practise.*recall/i);
  });
});
