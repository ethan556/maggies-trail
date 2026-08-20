// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";

/**
 * S317 place-value implementation (see reports/closure/S317_PLACE_VALUE_IMPLEMENTATION.md).
 * pv-02-04 c1 and pv-03-04 c1 each reused the single-number pv3-round-hundred figure
 * (349 -> 300) beside prose introducing a two-addend estimation story — an off-topic figure,
 * not a numeric mismatch. This adds two new additive figures, each depicting the lesson's own
 * two-addend rounding-then-combine story, and rebinds c1 to the new id. This file verifies,
 * for each: (1) the lesson JSON is bound to the new registered figure id, (2) the rendered
 * SVG's title/accessible description states the lesson's actual numbers, and (3) the old
 * off-topic 349/300 figure no longer appears on that step.
 */

const COURSE = join(process.cwd(), "content", "courses", "place-value", "lessons");

type Step = { id: string; kind: string; figure?: string };
type Lesson = { id: string; steps: Step[] };

const lesson = (id: string): Lesson =>
  JSON.parse(readFileSync(join(COURSE, `${id}.json`), "utf8")) as Lesson;

const stepFigure = (lessonId: string, stepId: string): string | undefined =>
  lesson(lessonId).steps.find((step) => step.id === stepId)?.figure;

const render = (figureId: string): string => {
  expect(FIGURE_IDS.has(figureId), figureId).toBe(true);
  expect(FIGURES[figureId], figureId).toBeDefined();
  return renderToStaticMarkup(FIGURES[figureId]());
};

const title = (markup: string): string => markup.match(/<title>([^<]*)<\/title>/)?.[1] ?? "";

describe("S317 place-value: two-addend estimate figures replace off-topic pv3-round-hundred reuse", () => {
  it("pv-02-04 c1: pv3-estimate-add-pair states 289, 512, and 800, replacing the off-topic single-number 349-to-300 figure", () => {
    expect(stepFigure("pv-02-04", "c1")).toBe("pv3-estimate-add-pair");
    const markup = render("pv3-estimate-add-pair");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    expect(t).toMatch(/289/);
    expect(t).toMatch(/512/);
    expect(t).toMatch(/800/);
    expect(markup).toMatch(/rounds up to 300/);
    expect(markup).toMatch(/rounds down to 500/);
    expect(markup).toMatch(/289/);
    expect(markup).toMatch(/512/);
    expect(markup).toMatch(/300/);
    expect(markup).toMatch(/500/);
    expect(markup).toMatch(/800/);
    expect(markup).not.toMatch(/\b349\b/);
  });

  it("pv-03-04 c1: pv3-estimate-sub-pair states 512, 289, and 200, replacing the off-topic single-number 349-to-300 figure", () => {
    expect(stepFigure("pv-03-04", "c1")).toBe("pv3-estimate-sub-pair");
    const markup = render("pv3-estimate-sub-pair");
    expect(markup).toContain('role="img"');
    const t = title(markup);
    expect(t).toMatch(/512/);
    expect(t).toMatch(/289/);
    expect(t).toMatch(/200/);
    expect(markup).toMatch(/rounds down to 500/);
    expect(markup).toMatch(/rounds up to 300/);
    expect(markup).toMatch(/512/);
    expect(markup).toMatch(/289/);
    expect(markup).toMatch(/500/);
    expect(markup).toMatch(/300/);
    expect(markup).toMatch(/200/);
    expect(markup).not.toMatch(/\b349\b/);
  });

  it("pv-03-04 c2 still correctly narrates the unrelated pv3-round-hundred figure (349 rounds down to 300) — untouched", () => {
    expect(stepFigure("pv-03-04", "c2")).toBe("pv3-round-hundred");
    const markup = render("pv3-round-hundred");
    const t = title(markup);
    expect(t).toMatch(/349 rounds to 300, not 400/);
  });

  it("neither new figure id is left dangling: both are used on exactly the intended step", () => {
    expect(stepFigure("pv-02-04", "c1")).not.toBe("pv3-round-hundred");
    expect(stepFigure("pv-03-04", "c1")).not.toBe("pv3-round-hundred");
  });
});
