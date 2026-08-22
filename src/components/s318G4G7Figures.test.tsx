// @vitest-environment jsdom
/**
 * S318 Lane A — WITHHELD figure-placement clearance for measure-problems-g4,
 * unlike-fractions-g5, decimal-fluency-g5, geometry-g7 (12 placements from
 * reports/vis/VIS01_PLACEMENTS.csv whose cause != RENDERS).
 *
 * No component was modified or added in this packet — every placement is
 * cleared by rewording the adjacent lesson prose. Verifies:
 *  1. All touched lesson JSON files still parse cleanly.
 *  2. Every touched (figureId, step-body) binding recomputes as NOT withheld
 *     via the repo's own `figureTextAlignment` module (the same function
 *     LessonPlayer/FigureView gate rendering on).
 *  3. None of the 12 bindings collide with any key in the generated
 *     figure/text mismatch blocklist (proof no hand-edit of that file was
 *     needed or made).
 *  4. Every touched body is <=80 words.
 *  5. The two figure components at the center of the measure-problems-g4
 *     group (mc-length-ladder, the pre-existing generic metric-unit ladder;
 *     g4v-clock-60, the S316-built clock figure) still render with role="img"
 *     and an accessible title — confirming neither needed a truthfulness
 *     change, only the withhold-causing stale fingerprint needed clearing.
 *  6. Every non-target `figure`/`concept.figure` key in the 5 touched lesson
 *     files is unchanged (only the 12 named bodies were reworded).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";
import { FIGURE_IDS } from "./figureIds";
import { figureTextBindingKey, isFigureTextAligned } from "@/lib/figureTextAlignment";
import { FIGURE_TEXT_MISMATCH_BLOCKLIST } from "@/lib/figureTextMismatchBlocklist.generated";

const ROOT = process.cwd();

type Step = { id: string; body?: string; figure?: string };
type RemedialConcept = { id: string; body?: string; figure?: string };
type Remedial = { concept: RemedialConcept; check?: { id: string; body?: string } };
type Lesson = { id: string; steps: Step[]; remedials?: Remedial[] };

function loadLesson(courseDir: string, lessonId: string): Lesson {
  const path = join(ROOT, "content", "courses", courseDir, "lessons", `${lessonId}.json`);
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as Lesson; // throws (fails the test) on any parse error
}

function findBody(lesson: Lesson, stepId: string): string {
  const step = lesson.steps.find((s) => s.id === stepId);
  if (step) return step.body ?? "";
  const remedial = lesson.remedials?.find((r) => r.concept.id === stepId);
  if (remedial) return remedial.concept.body ?? "";
  throw new Error(`step ${stepId} not found`);
}

function findFigure(lesson: Lesson, stepId: string): string | undefined {
  const step = lesson.steps.find((s) => s.id === stepId);
  if (step) return step.figure;
  const remedial = lesson.remedials?.find((r) => r.concept.id === stepId);
  if (remedial) return remedial.concept.figure;
  throw new Error(`step ${stepId} not found`);
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

type Target = { courseDir: string; lessonId: string; stepId: string; figure: string };

const targets: Target[] = [
  { courseDir: "measure-problems-g4", lessonId: "g4v-01-01", stepId: "c1", figure: "mc-length-ladder" },
  { courseDir: "measure-problems-g4", lessonId: "g4v-01-02", stepId: "c2", figure: "mc-length-ladder" },
  { courseDir: "measure-problems-g4", lessonId: "g4v-01-02", stepId: "rem-g4v-table-c", figure: "mc-length-ladder" },
  { courseDir: "measure-problems-g4", lessonId: "g4v-02-02", stepId: "c1", figure: "g4v-clock-60" },
  { courseDir: "unlike-fractions-g5", lessonId: "g5u-01-01", stepId: "c2", figure: "fm-add-unlike" },
  { courseDir: "unlike-fractions-g5", lessonId: "g5u-01-01", stepId: "rem-g5u-why-common-c", figure: "fm-add-unlike" },
  { courseDir: "unlike-fractions-g5", lessonId: "g5u-01-05", stepId: "c2", figure: "fa-add-like" },
  { courseDir: "unlike-fractions-g5", lessonId: "g5u-02-02", stepId: "c1", figure: "fa-add-like" },
  { courseDir: "unlike-fractions-g5", lessonId: "g5u-03-02", stepId: "c1", figure: "fm-add-unlike" },
  { courseDir: "decimal-fluency-g5", lessonId: "g5d-01-04", stepId: "c1", figure: "dpv-trailing-zero" },
  { courseDir: "decimal-fluency-g5", lessonId: "g5d-03-01", stepId: "c2", figure: "pv4-times10-shift" },
  { courseDir: "geometry-g7", lessonId: "g7-03-03", stepId: "c2", figure: "g7-solve-angles" },
];

describe("S318 lane A: parses cleanly", () => {
  it("every touched lesson JSON parses", () => {
    for (const t of new Map(targets.map((t) => [`${t.courseDir}/${t.lessonId}`, t])).values()) {
      expect(() => loadLesson(t.courseDir, t.lessonId)).not.toThrow();
    }
  });
});

describe("S318 lane A: figure key unchanged, body rebound to pass isFigureTextAligned", () => {
  for (const t of targets) {
    it(`${t.lessonId}/${t.stepId} (${t.figure}) is registered, keeps its figure key, is aligned, unblocklisted, <=80 words`, () => {
      const lesson = loadLesson(t.courseDir, t.lessonId);
      expect(findFigure(lesson, t.stepId)).toBe(t.figure);
      expect(FIGURE_IDS.has(t.figure)).toBe(true);

      const body = findBody(lesson, t.stepId);
      expect(wordCount(body)).toBeLessThanOrEqual(80);

      const key = figureTextBindingKey(t.figure, body);
      expect(FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key)).toBe(false);
      expect(isFigureTextAligned(t.figure, body)).toBe(true);
    });
  }
});

describe("S318 lane A: no truthfulness change needed to the two measure-problems-g4 figures", () => {
  it("mc-length-ladder still renders the generic metric-unit ladder (mm/cm/m/km), unmodified", () => {
    const Component = FIGURES["mc-length-ladder"];
    const markup = renderToStaticMarkup(<Component />);
    expect(markup).toContain('role="img"');
    expect(markup).toContain("10 mm");
    expect(markup).toContain("100 cm");
    expect(markup).toContain("1000 m");
  });

  it("g4v-clock-60 still renders the S316-built 60-tick clock, unmodified", () => {
    const Component = FIGURES["g4v-clock-60"];
    const markup = renderToStaticMarkup(<Component />);
    expect(markup).toContain('role="img"');
    expect(markup).toContain("sixty minutes");
    expect(markup).toContain("sixty seconds");
  });
});

describe("S318 lane A: only the 12 named bodies were touched", () => {
  it("every other figure/concept.figure key in the 5 touched lesson files is unchanged", () => {
    const expected: Record<string, Record<string, string | undefined>> = {
      "g4v-01-01": { c1: "mc-length-ladder", c2: "g4v-meter-cm-table" },
      "g4v-01-02": { c1: "g4v-meter-cm-table", c2: "mc-length-ladder" },
      "g4v-02-02": { c1: "g4v-clock-60" },
      "g5u-01-01": { c2: "fm-add-unlike" },
      "g5u-01-05": { c2: "fa-add-like" },
      "g5u-02-02": { c1: "fa-add-like" },
      "g5u-03-02": { c1: "fm-add-unlike" },
      "g5d-01-04": { c1: "dpv-trailing-zero" },
      "g5d-03-01": { c2: "pv4-times10-shift" },
      "g7-03-03": { c2: "g7-solve-angles" },
    };
    const byCourse: Record<string, string> = {
      "g4v-01-01": "measure-problems-g4",
      "g4v-01-02": "measure-problems-g4",
      "g4v-02-02": "measure-problems-g4",
      "g5u-01-01": "unlike-fractions-g5",
      "g5u-01-05": "unlike-fractions-g5",
      "g5u-02-02": "unlike-fractions-g5",
      "g5u-03-02": "unlike-fractions-g5",
      "g5d-01-04": "decimal-fluency-g5",
      "g5d-03-01": "decimal-fluency-g5",
      "g7-03-03": "geometry-g7",
    };
    for (const [lessonId, steps] of Object.entries(expected)) {
      const lesson = loadLesson(byCourse[lessonId], lessonId);
      for (const [stepId, figure] of Object.entries(steps)) {
        expect(findFigure(lesson, stepId)).toBe(figure);
      }
    }
  });
});
