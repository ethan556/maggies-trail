import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURES } from "./figures";

const COURSE = join(
  process.cwd(),
  "content",
  "courses",
  "add-subtract-10-k",
  "lessons",
);
const EXPECTED = new Map([
  ["koa-01-01", "koa-join-two-groups"],
  ["koa-01-02", "koa-add-with-fingers"],
  ["koa-01-03", "koa-add-with-drawing"],
  ["koa-01-04", "koa-act-out-a-join"],
  ["koa-01-05", "koa-addition-sentence"],
]);

describe("S245 Kindergarten joining visual-first canary", () => {
  it("binds both concept moments in each lesson to its concept-specific figure", () => {
    for (const [lessonId, figureId] of EXPECTED) {
      const lesson = JSON.parse(
        readFileSync(join(COURSE, `${lessonId}.json`), "utf8"),
      );
      const concepts = lesson.steps.filter(
        (step: { kind: string }) => step.kind === "concept",
      );

      expect(concepts, lessonId).toHaveLength(2);
      expect(
        concepts.map((step: { figure?: string }) => step.figure),
        lessonId,
      ).toEqual([figureId, figureId]);
      expect(
        concepts.some(
          (step: { figure?: string }) => step.figure === "count-on-hops",
        ),
        lessonId,
      ).toBe(false);
    }
  });

  it("registers self-describing SVGs for all five representations", () => {
    for (const figureId of EXPECTED.values()) {
      expect(FIGURES[figureId], `${figureId} must be registered`).toBeDefined();
      const markup = renderToStaticMarkup(FIGURES[figureId]());

      expect(markup, figureId).toContain("<svg");
      expect(markup, figureId).toContain('role="img"');
      expect(markup, figureId).toMatch(/<title>[^<]{40,}<\/title>/);
      const fontSizes = [...markup.matchAll(/font-size="([\d.]+)"/g)].map(
        (match) => Number(match[1]),
      );
      expect(
        fontSizes.length,
        `${figureId} must contain readable visible labels`,
      ).toBeGreaterThan(0);
      expect(
        fontSizes.every((size) => size >= 10),
        `${figureId} contains undersized text`,
      ).toBe(true);
    }
  });

  it("keeps the figures on teaching steps rather than answer-bearing checks", () => {
    for (const lessonId of EXPECTED.keys()) {
      const lesson = JSON.parse(
        readFileSync(join(COURSE, `${lessonId}.json`), "utf8"),
      );
      const assessed = lesson.steps.filter((step: { kind: string }) =>
        ["check", "challenge"].includes(step.kind),
      );
      expect(
        assessed.every(
          (step: { figure?: string }) => step.figure === undefined,
        ),
        lessonId,
      ).toBe(true);
    }
  });

  it("keeps the concrete addition sentence mathematically true", () => {
    const markup = renderToStaticMarkup(FIGURES["koa-addition-sentence"]());
    expect(markup).toContain('data-part-size="3"');
    expect(markup).toContain('data-part-size="2"');
    expect(markup).toContain('data-whole-size="5"');
    expect(markup).toContain("3 + 2");
  });
});
