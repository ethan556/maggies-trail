// @vitest-environment jsdom
/**
 * S328 laneA-E2 — figure-authority remediation for the two signed S327-A4 ESCALATE
 * records whose visual axis was blocked on `src/**` authority (per S316 §1.4/§7.8):
 * `s327-A4-g5v-03-01` (notch-subtraction has no visual anywhere in the lesson) and
 * `s327-A4-g5v-03-03` (the equal-volumes claim is only ever asserted in feedback prose).
 *
 * Follows the S324 ENG-FIG precedent's own shape (src/components/s324Figures.test.tsx):
 * render-content pins, binding pins, a deliberately-unfigured pin, and a scoped
 * zero-collision check for just the two new figures (the corpus-wide ratchet in
 * figures.labelCollision.s238.test.tsx covers these once registered, but pinning it
 * here too means a regression here names itself instead of reporting a generic
 * 1,900-figure diff).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { cleanup, render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";
import { collisions, scanTextBoxes } from "./textBoxes.testkit";

type Step = { id: string; figure?: string; body?: string };
type Lesson = { steps: Step[]; remedials?: Array<{ concept: Step; check?: Step }> };

function loadLesson(lessonId: string): Lesson {
  return JSON.parse(
    readFileSync(join(process.cwd(), "content", "courses", "volume-problems-g5", "lessons", `${lessonId}.json`), "utf8"),
  ) as Lesson;
}

function findFigure(lesson: Lesson, stepId: string): string | undefined {
  const step = lesson.steps.find((s) => s.id === stepId);
  if (step) return step.figure;
  const remedial = lesson.remedials?.find((r) => r.concept.id === stepId);
  if (remedial) return remedial.concept.figure;
  throw new Error(`step ${stepId} not found`);
}

const renderCases: { id: string; expectSubstrings: string[] }[] = [
  {
    id: "vm-notch-block",
    expectSubstrings: ["48 − 15 = 33 unit cubes remain", "full block: 48", "notch: 15", "48 − 15 = 33 remain"],
  },
  {
    id: "vm-equal-volumes-compare",
    expectSubstrings: [
      "20 × 3 = 12 × 5 = 60",
      "base 20 × 3 layers",
      "base 12 × 5 layers",
    ],
  },
];

const bindings: Array<[lessonId: string, stepId: string, figure: string]> = [
  ["g5v-03-01", "c1", "vm-notch-block"],
  ["g5v-03-01", "c2", "vm-notch-block"],
  ["g5v-03-01", "rem-g5v-composite-c", "vm-notch-block"],
  ["g5v-03-03", "c2", "vm-equal-volumes-compare"],
  ["g5v-03-03", "rem-g5v-compare-c", "vm-equal-volumes-compare"],
];

describe("S328 laneA-E2: new figures render truthfully", () => {
  for (const c of renderCases) {
    it(`${c.id} renders role="img" with a title, an aria-label, and its real content`, () => {
      const Component = FIGURES[c.id];
      expect(Component).toBeDefined();
      expect(FIGURE_IDS.has(c.id)).toBe(true);
      const markup = renderToStaticMarkup(createElement(Component));
      expect(markup).toContain('role="img"');
      expect(markup).toMatch(/<title>/);
      expect(markup).toMatch(/aria-label="[^"]{40,}"/); // a real screen-reader description, not a stub
      for (const s of c.expectSubstrings) expect(markup).toContain(s);
    });
  }

  it("vm-notch-block's arithmetic is correct and matches no worked pair already in the lesson", () => {
    const full = 48, notch = 15, remaining = 33;
    expect(full - notch).toBe(remaining);
    const lesson = loadLesson("g5v-03-01");
    const wideningPairs: Array<[number, number]> = [
      [30, 8], // i1: 5x6 block, notch 8
      [28, 6], // i2: 4x7 block, notch 6, and the remedial (same pair)
      [24, 16], // k2: 6x4 block, notch 16
      [36, 24], // ch1: 4x9 block, notch 24
    ];
    expect(wideningPairs).not.toContainEqual([full, notch]);
    expect(lesson.steps.map((s) => s.id)).toContain("c1"); // sanity: lesson still shaped as expected
  });

  it("vm-equal-volumes-compare's arithmetic is exactly i1's own already-revealed pair (20x3 = 12x5 = 60), not i2's", () => {
    expect(20 * 3).toBe(60);
    expect(12 * 5).toBe(60);
    expect(14 * 4).toBe(56); // i2's own pair — confirms it is NOT what this figure renders
    expect(7 * 8).toBe(56);
    const lesson = loadLesson("g5v-03-03");
    const i1 = lesson.steps.find((s) => s.id === "i1") as { widget?: { prompt?: string; target?: number } } | undefined;
    expect(i1?.widget?.prompt).toContain("20 by 3");
    expect(i1?.widget?.prompt).toContain("12 by 5");
    expect(i1?.widget?.target).toBe(60);
  });
});

describe("S328 laneA-E2: bindings point at the new figures", () => {
  for (const [lessonId, stepId, figure] of bindings) {
    it(`${lessonId}/${stepId} binds ${figure}`, () => {
      expect(findFigure(loadLesson(lessonId), stepId)).toBe(figure);
      expect(FIGURE_IDS.has(figure)).toBe(true);
    });
  }

  it("keeps g5v-03-03/c1 deliberately unfigured (precedes i1's predict-before-reveal question; the equal-volumes pair would spoil it)", () => {
    expect(findFigure(loadLesson("g5v-03-03"), "c1")).toBeUndefined();
  });
});

describe("S328 laneA-E2: zero label collisions in the two new figures", () => {
  for (const id of ["vm-notch-block", "vm-equal-volumes-compare"]) {
    it(`${id} renders with zero colliding text pairs`, () => {
      const { container } = render(createElement(FIGURES[id]));
      for (const svg of Array.from(container.querySelectorAll("svg"))) {
        const { boxes } = scanTextBoxes(svg);
        expect(collisions(boxes)).toEqual([]);
      }
      cleanup();
    });
  }
});
