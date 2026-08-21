/**
 * S324 ENG-FIG — figure-authority remediations for the signed S323 ESCALATE records
 * (s323-P3-df3-*, s323-P6-g2l-*, s323-P7-pc-*, s323-P8-vec-04-01, s323-P8-sy-06-01).
 *
 * Pins, per group:
 *  A (division-fluency-g3): the five new parameterized mult3 instantiations render their
 *    own lessons' true numbers, and the rebound placements point at them.
 *  C (calculus/HS): the three purpose-built pc figures, the distinct vec row-recipe
 *    figure, and the SyDilationParallel single-k truth fix (image computed from one
 *    dilation factor, rays collinear with the center through each original endpoint).
 *  (B — number-line-g2 — is pinned by session308.numberLineG2ChoiceOrder and
 *   session244.visualPromiseNumberLines, updated in the same packet.)
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";

type Step = { id: string; figure?: string; body?: string };
type Lesson = { steps: Step[]; remedials?: Array<{ concept: Step; check?: Step }> };

function loadLesson(courseDir: string, lessonId: string): Lesson {
  return JSON.parse(
    readFileSync(join(process.cwd(), "content", "courses", courseDir, "lessons", `${lessonId}.json`), "utf8"),
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
  { id: "mult3-fair-shares-16-over-2", expectSubstrings: ["16 ÷ 2 = 8", "16 shared into 2 groups"] },
  { id: "mult3-fair-shares-12-over-2", expectSubstrings: ["12 ÷ 2 = 6", "12 shared into 2 groups"] },
  { id: "mult3-fair-shares-18-over-3", expectSubstrings: ["18 ÷ 3 = 6", "18 shared into 3 groups"] },
  { id: "mult3-how-many-groups-21-over-3", expectSubstrings: ["21 ÷ 3 = 7", "21 split into groups of 3"] },
  { id: "mult3-divide-by-nine-54-over-9", expectSubstrings: ["54 ÷ 9 = 6 groups", "6 × 10 = 60; remove 6 → 6 × 9 = 54"] },
  { id: "pc-arc-length-hypotenuses", expectSubstrings: ["√(dx² + dy²)", "dx", "dy", "add up the hypotenuses"] },
  { id: "pc-integrand-speed", expectSubstrings: ["√((dx/dt)² + (dy/dt)²) = |v| = speed", "L = ∫ speed dt"] },
  { id: "pc-motion-vectors", expectSubstrings: ["r(t)", "speed = |v|", "v = ⟨x′, y′⟩   a = ⟨x″, y″⟩"] },
  { id: "vec-matrix-row-recipe", expectSubstrings: ["ax + by", "cx + dy", "top row → new x • bottom row → new y"] },
];

const bindings: Array<[courseDir: string, lessonId: string, stepId: string, figure: string]> = [
  ["division-fluency-g3", "df3-01-01", "c1", "mult3-fair-shares-16-over-2"],
  ["division-fluency-g3", "df3-01-01", "rem-g3d-div2-c", "mult3-fair-shares-12-over-2"],
  ["division-fluency-g3", "df3-01-02", "c1", "mult3-how-many-groups-21-over-3"],
  ["division-fluency-g3", "df3-01-02", "rem-g3d-div3-c", "mult3-fair-shares-18-over-3"],
  ["division-fluency-g3", "df3-02-01", "rem-g3d-div89-c", "mult3-divide-by-nine-54-over-9"],
  ["parametric-polar-calculus", "pc-01-02", "c1", "pc-arc-length-hypotenuses"],
  ["parametric-polar-calculus", "pc-01-02", "c2", "pc-integrand-speed"],
  ["parametric-polar-calculus", "pc-01-02", "rc1", "pc-arc-length-hypotenuses"],
  ["parametric-polar-calculus", "pc-03-01", "c1", "pc-motion-vectors"],
  ["parametric-polar-calculus", "pc-03-01", "rc1", "pc-motion-vectors"],
  ["vectors-matrices", "vec-04-01", "c1", "vec-matrix-row-dot"],
  ["vectors-matrices", "vec-04-01", "c2", "vec-matrix-row-recipe"],
];

describe("S324 ENG-FIG: new figures render truthfully", () => {
  for (const c of renderCases) {
    it(`${c.id} renders role="img" with a title and its real content`, () => {
      const Component = FIGURES[c.id];
      expect(Component).toBeDefined();
      expect(FIGURE_IDS.has(c.id)).toBe(true);
      const markup = renderToStaticMarkup(createElement(Component));
      expect(markup).toContain('role="img"');
      expect(markup).toMatch(/<title>/);
      for (const s of c.expectSubstrings) expect(markup).toContain(s);
    });
  }

  it("keeps the divide-by-nine family's number-word title convention (no arithmetic claim admitted)", () => {
    const markup = renderToStaticMarkup(createElement(FIGURES["mult3-divide-by-nine-54-over-9"]));
    const title = markup.match(/<title>([\s\S]*?)<\/title>/)?.[1] ?? "";
    expect(title).toBe("Six groups of 10 minus one from each group makes six groups of 9.");
    // digits appear only as the shared 10/9 group sizes, never as an equality —
    // same shape as the fixed original, so the claims generator does not admit it.
    expect(title).not.toMatch(/[=]|\bequals?\b/i);
  });

  it("leaves mult3-fair-shares-15-over-5 and the fixed originals byte-compatible", () => {
    const fifteen = renderToStaticMarkup(createElement(FIGURES["mult3-fair-shares-15-over-5"]));
    expect(fifteen).toContain('viewBox="0 0 340 108"');
    expect(fifteen).not.toContain("translate");
    expect(renderToStaticMarkup(createElement(FIGURES["mult3-fair-shares"]))).toContain("12 ÷ 3 = 4 each");
    expect(renderToStaticMarkup(createElement(FIGURES["mult3-how-many-groups"]))).toContain("12 ÷ 4 = 3");
    expect(renderToStaticMarkup(createElement(FIGURES["mult3-divide-by-nine"]))).toContain("63 ÷ 9 = 7 groups");
  });
});

describe("S324 ENG-FIG: rebound placements point at the new figures", () => {
  for (const [courseDir, lessonId, stepId, figure] of bindings) {
    it(`${lessonId}/${stepId} binds ${figure}`, () => {
      expect(findFigure(loadLesson(courseDir, lessonId), stepId)).toBe(figure);
      expect(FIGURE_IDS.has(figure)).toBe(true);
    });
  }

  it("keeps pc-03-01/c2 deliberately unfigured (session271 withheld contract)", () => {
    expect(findFigure(loadLesson("parametric-polar-calculus", "pc-03-01"), "c2")).toBeUndefined();
  });
});

describe("S324 ENG-FIG: SyDilationParallel draws a true single-k dilation", () => {
  it("computes the image from one factor, rays collinear with the center through each original endpoint", () => {
    const markup = renderToStaticMarkup(createElement(FIGURES["sy-dilation-parallel"]));
    const rays = [...markup.matchAll(/d="M(\d+) (\d+) L(\d+(?:\.\d+)?) (\d+(?:\.\d+)?)"/g)].map((m) =>
      m.slice(1, 5).map(Number),
    );
    expect(rays).toHaveLength(2);
    const center: [number, number] = [40, 130];
    const originals: Array<[number, number]> = [
      [100, 70],
      [140, 70],
    ];
    const factors = rays.map((ray, i) => {
      const [x1, y1, x2, y2] = ray;
      expect([x1, y1]).toEqual(center);
      const [px, py] = originals[i];
      const kx = (x2 - center[0]) / (px - center[0]);
      const ky = (y2 - center[1]) / (py - center[1]);
      expect(kx).toBeCloseTo(ky, 9); // one k per ray — collinear through the original endpoint
      return kx;
    });
    expect(factors[0]).toBeCloseTo(factors[1], 9); // one k for the whole dilation
    expect(factors[0]).toBeGreaterThan(1);
    const image = markup.match(/x1="([\d.]+)" y1="([\d.]+)" x2="([\d.]+)" y2="([\d.]+)" stroke="[^"]+" stroke-width="2.4" stroke-dasharray="5 3"/);
    expect(image).not.toBeNull();
    expect(image![2]).toBe(image![4]); // image parallel to the horizontal original
  });
});
