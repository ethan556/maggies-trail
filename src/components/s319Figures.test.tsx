// @vitest-environment jsdom
/**
 * S319 Lane A — figure-class contracts (curve-analysis ca-03-03/ca-04-01/ca-05-02/ca-05-03,
 * area-surface-volume asv-04-03/asv-05-01, coordinate-proofs cx-02-02/cx-02-03,
 * solid-geometry sg-03-02, decimals-intro-g4 dg4-01-03). Owner: src/components/figures.tsx.
 *
 * Verifies:
 *  1. Every touched lesson JSON parses cleanly.
 *  2. The five new additive, registered figure components render an accessible <title>
 *     carrying the lesson's actual numbers (not generic placeholder text).
 *  3. Every new/rebound (figureId, accompanying-text) binding this packet made resolves
 *     as aligned via the repo's own `figureTextAlignment` module (the same gate
 *     LessonPlayer/FigureView use), and its binding key is not in the mismatch blocklist.
 *  4. `BoxLayers` (asv-05-01) now renders 4 stacked layers (2×3 base × 4 = 24), not 3.
 *  5. sg-03-02's cube-tiling step (c1) no longer carries the cone/cylinder figure, and
 *     the cone/cylinder step (k3) does.
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

type Step = { id: string; body?: string; prompt?: string; figure?: string };
type Remedial = { concept: Step & { id: string }; check: Step & { id: string } };
type Lesson = { id: string; steps: Step[]; remedials?: Remedial[] };

function loadLesson(courseDir: string, lessonId: string): Lesson {
  const path = join(ROOT, "content", "courses", courseDir, "lessons", `${lessonId}.json`);
  const raw = readFileSync(path, "utf8");
  return JSON.parse(raw) as Lesson; // throws (fails the test) on any parse error
}

function render(id: string): string {
  const Figure = FIGURES[id];
  expect(Figure, `figure "${id}" must be registered`).toBeDefined();
  return renderToStaticMarkup(Figure());
}

function titleOf(svg: string): string {
  return svg.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "";
}

describe("S319 new figure components render accessible titles with the lesson's actual numbers", () => {
  it("ca-plus-c-family (ca-03-03/c2) states the +C family relationship", () => {
    const svg = render("ca-plus-c-family");
    expect(svg).toContain("<svg");
    expect(svg).toContain('role="img"');
    const title = titleOf(svg);
    expect(title).toContain("vertical shift");
    expect(title.toLowerCase()).toContain("tangent");
    expect(title.toLowerCase()).toContain("slope");
  });

  it("ca-open-box-setup (ca-05-02/c1) states the lesson's actual 12, x, 12−2x, 0<x<6", () => {
    const svg = render("ca-open-box-setup");
    const title = titleOf(svg);
    expect(title).toContain("12");
    expect(title).toContain("x");
    expect(title).toContain("12 minus 2x");
    expect(title).toContain("x between 0 and 6");
    expect(svg).toContain("V = x(12 − 2x)², 0 &lt; x &lt; 6");
  });

  it("ca-fence-against-wall (ca-05-03/c1, rc1) states the lesson's actual 100, x, 100−2x", () => {
    const svg = render("ca-fence-against-wall");
    const title = titleOf(svg);
    expect(title).toContain("100");
    expect(title.toLowerCase()).toContain("wall");
    expect(title).toContain("100 minus 2x");
    expect(svg).toContain("2x + y = 100");
  });

  it("asv-surface-vs-volume (asv-04-03/c2) states actual surface-area and volume numbers", () => {
    const svg = render("asv-surface-vs-volume");
    const title = titleOf(svg);
    expect(title).toContain("square units");
    expect(title).toContain("cubic units");
    expect(svg).toContain("16 sq units");
    expect(svg).toContain("4 cu units");
  });

  it("dpv-tenths-number-line (dg4-01-03/c1, c2) states the lesson's actual 0.4 on a 0-to-1 line", () => {
    const svg = render("dpv-tenths-number-line");
    const title = titleOf(svg);
    expect(title).toContain("0.4");
    expect(title).toContain("0 to 1");
    expect(svg).toContain(">0<");
    expect(svg).toContain(">1<");
  });

  it("all five new figure ids are registered in the generated FIGURE_IDS existence set", () => {
    for (const id of ["ca-plus-c-family", "ca-open-box-setup", "ca-fence-against-wall", "asv-surface-vs-volume", "dpv-tenths-number-line"]) {
      expect(FIGURE_IDS.has(id), `${id} missing from figureIds.ts — rerun scripts/gen-figure-ids.mjs`).toBe(true);
    }
  });
});

describe("S319 BoxLayers (asv-05-01) now matches the lesson's 2×3 base × 4 layers = 24 example", () => {
  it("renders 4 stacked layers, not 3", () => {
    const svg = render("box-layers");
    expect(svg).toContain("4 layers tall");
    expect(svg).not.toContain("3 layers tall");
    // 4 layers × 6 cubes/layer × 3 faces/cube (top, front, side) = 72 polygon facets.
    const polygonCount = (svg.match(/<polygon/g) ?? []).length;
    expect(polygonCount).toBe(4 * 6 * 3);
  });
});

describe("S319 lesson bindings resolve aligned and clear of the adversarial blocklist", () => {
  const cases: Array<{ course: string; lessonId: string; stepId: string; figureId: string; findStep: (lesson: Lesson) => Step | undefined }> = [
    { course: "curve-analysis", lessonId: "ca-03-03", stepId: "c2", figureId: "ca-plus-c-family", findStep: (l) => l.steps.find((s) => s.id === "c2") },
    { course: "curve-analysis", lessonId: "ca-04-01", stepId: "c1", figureId: "ha-degree-panels", findStep: (l) => l.steps.find((s) => s.id === "c1") },
    { course: "curve-analysis", lessonId: "ca-04-01", stepId: "c2", figureId: "end-behavior-quadrants", findStep: (l) => l.steps.find((s) => s.id === "c2") },
    { course: "curve-analysis", lessonId: "ca-04-01", stepId: "rc1", figureId: "ha-degree-panels", findStep: (l) => l.remedials?.[0]?.concept },
    { course: "curve-analysis", lessonId: "ca-05-02", stepId: "c1", figureId: "ca-open-box-setup", findStep: (l) => l.steps.find((s) => s.id === "c1") },
    { course: "curve-analysis", lessonId: "ca-05-03", stepId: "c1", figureId: "ca-fence-against-wall", findStep: (l) => l.steps.find((s) => s.id === "c1") },
    { course: "curve-analysis", lessonId: "ca-05-03", stepId: "rc1", figureId: "ca-fence-against-wall", findStep: (l) => l.remedials?.[0]?.concept },
    { course: "area-surface-volume", lessonId: "asv-04-03", stepId: "c2", figureId: "asv-surface-vs-volume", findStep: (l) => l.steps.find((s) => s.id === "c2") },
    { course: "coordinate-proofs", lessonId: "cx-02-02", stepId: "c1", figureId: "cx-parallel-slopes", findStep: (l) => l.steps.find((s) => s.id === "c1") },
    { course: "coordinate-proofs", lessonId: "cx-02-03", stepId: "c1", figureId: "cx-perp-slopes", findStep: (l) => l.steps.find((s) => s.id === "c1") },
    { course: "solid-geometry", lessonId: "sg-03-02", stepId: "k3", figureId: "cone-fills-cylinder", findStep: (l) => l.steps.find((s) => s.id === "k3") },
    { course: "decimals-intro-g4", lessonId: "dg4-01-03", stepId: "c1", figureId: "dpv-tenths-number-line", findStep: (l) => l.steps.find((s) => s.id === "c1") },
    { course: "decimals-intro-g4", lessonId: "dg4-01-03", stepId: "c2", figureId: "dpv-tenths-number-line", findStep: (l) => l.steps.find((s) => s.id === "c2") },
  ];

  for (const { course, lessonId, stepId, figureId, findStep } of cases) {
    it(`${lessonId}/${stepId} binds "${figureId}" aligned and off the blocklist`, () => {
      const lesson = loadLesson(course, lessonId);
      const step = findStep(lesson);
      expect(step, `${lessonId}/${stepId} must exist`).toBeDefined();
      expect(step?.figure).toBe(figureId);
      const text = step?.body ?? "";
      expect(isFigureTextAligned(figureId, text), `${lessonId}/${stepId} (${figureId}) must not be withheld`).toBe(true);
      const key = figureTextBindingKey(figureId, text);
      expect(FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key), `${lessonId}/${stepId} binding key must not be blocklisted`).toBe(false);
    });
  }
});

describe("S319 sg-03-02 figure moved off the cube-tiling step", () => {
  it("c1 (cube tiling) no longer carries cone-fills-cylinder", () => {
    const lesson = loadLesson("solid-geometry", "sg-03-02");
    const c1 = lesson.steps.find((s) => s.id === "c1");
    expect(c1).toBeDefined();
    expect(c1?.figure).toBeUndefined();
  });

  it("k3 (the cone joins) now carries cone-fills-cylinder", () => {
    const lesson = loadLesson("solid-geometry", "sg-03-02");
    const k3 = lesson.steps.find((s) => s.id === "k3");
    expect(k3?.figure).toBe("cone-fills-cylinder");
  });
});

describe("S319 dg4-01-03 grammar fixes hold singular/plural agreement", () => {
  it("ch1 no longer contains the '1 columns'/'1 tenths' defects", () => {
    const raw = readFileSync(join(ROOT, "content", "courses", "decimals-intro-g4", "lessons", "dg4-01-03.json"), "utf8");
    const ch1Match = raw.match(/"id": "ch1"[\s\S]*?\n  \{\n\s*"id": "r1"/);
    const ch1Text = ch1Match ? ch1Match[0] : raw;
    expect(ch1Text).not.toMatch(/1 columns/);
    expect(ch1Text).not.toMatch(/1 tenths\b/);
    expect(ch1Text).not.toMatch(/1 cells\b/);
    expect(ch1Text).toContain("1 column");
    expect(ch1Text).toContain("1 tenth:");
  });
});
