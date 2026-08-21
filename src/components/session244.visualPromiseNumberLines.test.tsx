import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { lintLesson } from "../lib/pedagogy";
import { Lesson as LessonSchema } from "../lib/schema";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";

type Option = { id: string; label: string; correct?: boolean };
type Step = {
  id: string;
  kind: string;
  figure?: string;
  widget?: { type?: string; prompt?: string; options?: Option[] };
};
type LessonDocument = {
  steps: Step[];
  remedials?: Array<{ concept?: Step; check?: Step }>;
};

const root = process.cwd();

function lesson(course: string, id: string): LessonDocument {
  return JSON.parse(
    readFileSync(join(root, "content", "courses", course, "lessons", `${id}.json`), "utf8"),
  ) as LessonDocument;
}

function findStep(document: LessonDocument, id: string): Step {
  const candidates = [
    ...document.steps,
    ...(document.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check]),
  ];
  const found = candidates.find((candidate) => candidate?.id === id);
  expect(found, `step ${id} exists`).toBeDefined();
  return found!;
}

const numberLinePacket = [
  ["g2l-02-01", "k3", "g2l-choice-add-33-20", "33 + 20"],
  ["g2l-02-02", "k3", "g2l-choice-gap-54-34", "54 and 34"],
  ["g2l-03-01", "k1", "g2l-choice-add-44-20", "44 + 20"],
  ["g2l-03-01", "rem-g2l-show-sum-k", "g2l-choice-add-44-20", "44 + 20"],
  ["g2l-03-02", "rem-g2l-show-diff-k", "g2l-choice-gap-53-33", "53 and 33"],
] as const;

/**
 * S324 (F5 §49–§51): g2l-03-01/k3, g2l-03-02/k1, and g2l-03-03/k3 no longer run
 * the which-drawing candidate template — each now binds a single-line
 * "read the drawing" figure whose asked-for quantity is drawn as "?".
 * The session308 choice-order test pins their new prompts/options/figures.
 */
const readDrawingPacket = [
  ["g2l-03-01", "k3", "g2l-read-landing-45-20", "45 + 20", ["45", "+10", "?"]],
  ["g2l-03-02", "k1", "g2l-read-gap-53-33", "33 and 53", ["33", "53", "?"]],
  ["g2l-03-03", "k3", "g2l-read-missing-jump-33-43", "start at 33", ["33", "43", "?"]],
] as const;

describe("S244 visual-promise number-line packet", () => {
  it("keeps every changed lesson schema-valid and pedagogy-clean", () => {
    const changedLessons = [
      ["counting-to-20-k", "kc-03-03"],
      ["integration-applications", "ia-01-01"],
      ...["g2l-02-01", "g2l-02-02", "g2l-03-01", "g2l-03-02", "g2l-03-03"].map(
        (id) => ["number-line-g2", id],
      ),
    ];
    for (const [course, id] of changedLessons) {
      const parsed = LessonSchema.parse(lesson(course, id));
      expect(lintLesson(parsed), `${course}/${id} pedagogy`).toEqual([]);
    }
  });

  it.each(numberLinePacket)(
    "%s/%s binds its promised drawings to a semantic four-panel figure",
    (lessonId, stepId, figureId, promptMath) => {
      const target = findStep(lesson("number-line-g2", lessonId), stepId);
      expect(target.kind).toBe("check");
      expect(target.figure).toBe(figureId);
      expect(FIGURE_IDS.has(figureId)).toBe(true);
      expect(target.widget?.type).toBe("mcq");
      expect(target.widget?.prompt).toContain("Which drawing");
      expect(target.widget?.prompt).toContain(promptMath);
      // S308 shuffled option order (session308.numberLineG2ChoiceOrder pins the
      // exact arrangement), so the lettered labels are asserted as a set.
      expect([...(target.widget?.options?.map((option) => option.label) ?? [])].sort()).toEqual([
        "Drawing A",
        "Drawing B",
        "Drawing C",
        "Drawing D",
      ]);
      expect(target.widget?.options?.filter((option) => option.correct)).toHaveLength(1);
      expect(target.widget?.options?.find((option) => option.correct)?.id).toBe("o0");
    },
  );

  it.each(readDrawingPacket)(
    "%s/%s binds its replaced check to a single read-the-drawing figure",
    (lessonId, stepId, figureId, promptMath) => {
      const target = findStep(lesson("number-line-g2", lessonId), stepId);
      expect(target.kind).toBe("check");
      expect(target.figure).toBe(figureId);
      expect(FIGURE_IDS.has(figureId)).toBe(true);
      expect(target.widget?.type).toBe("mcq");
      expect(target.widget?.prompt).toContain(promptMath);
      expect(target.widget?.options?.filter((option) => option.correct)).toHaveLength(1);
      expect(target.widget?.options?.find((option) => option.correct)?.id).toBe("o0");
    },
  );

  it("renders every read-the-drawing figure as one accessible line with its asked-for quantity unlabeled", () => {
    for (const [, , figureId, , fragments] of readDrawingPacket) {
      const markup = renderToStaticMarkup(FIGURES[figureId]());
      expect(markup).toContain('role="img"');
      expect(markup).toMatch(/<title>A single number-line drawing/);
      for (const fragment of fragments) {
        expect(markup, `${figureId} shows ${fragment}`).toContain(`>${fragment}</text>`);
      }
    }
  });

  it("renders every distinct candidate set as an accessible, lettered number-line comparison", () => {
    const ids = [...new Set(numberLinePacket.map(([, , figureId]) => figureId))];
    expect(ids).toHaveLength(4);
    for (const id of ids) {
      const markup = renderToStaticMarkup(FIGURES[id]());
      expect(markup).toContain('role="img"');
      expect(markup).toContain("<title>Four number-line drawings labeled A through D.");
      for (const letter of ["A", "B", "C", "D"]) {
        expect(markup).toContain(`>${letter}</text>`);
      }
      expect(markup.match(/<line/g)?.length ?? 0).toBeGreaterThan(8);
      expect(markup.match(/<path/g)?.length ?? 0).toBeGreaterThan(0);
    }
  });

  it("closes the two concept-figure holes with aligned semantic figures", () => {
    const kindergarten = lesson("counting-to-20-k", "kc-03-03");
    const calculus = lesson("integration-applications", "ia-01-01");
    expect(findStep(kindergarten, "c1").figure).toBe("kc-ten-hops-to-100");
    expect(findStep(kindergarten, "rem-kc0303-c").figure).toBe("kc-ten-hops-to-100");
    expect(findStep(calculus, "c2").figure).toBe("ia-top-bottom-swap");
    expect(FIGURE_IDS.has("kc-ten-hops-to-100")).toBe(true);
    expect(FIGURE_IDS.has("ia-top-bottom-swap")).toBe(true);
  });
});
