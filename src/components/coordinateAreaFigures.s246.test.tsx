import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";

const COURSE = join(process.cwd(), "content", "courses", "area-surface-volume", "lessons");
const PLACEMENTS = new Map([
  ["asv-03-02", ["asv-coordinate-rectangle-area", "asv-coordinate-right-triangle-legs"]],
  ["asv-03-03", ["asv-coordinate-composite-setup", "asv-coordinate-composite-sum"]],
]);

const lesson = (id: string) => JSON.parse(readFileSync(join(COURSE, `${id}.json`), "utf8")) as {
  steps: Array<{ id: string; kind: string; figure?: string }>;
};

const title = (markup: string) => markup.match(/<title>([^<]+)<\/title>/)?.[1] ?? "";

describe("S246 coordinate-polygon visual replacement packet", () => {
  it("binds every teaching moment to its exact coordinate-area representation", () => {
    for (const [lessonId, expected] of PLACEMENTS) {
      const concepts = lesson(lessonId).steps.filter((step) => step.kind === "concept");
      expect(concepts.map((step) => step.figure), lessonId).toEqual(expected);
      expect(concepts.every((step) => step.figure !== "asv-coord-area"), lessonId).toBe(true);
    }
  });

  it("registers four readable, self-describing SVGs", () => {
    for (const figureId of [...PLACEMENTS.values()].flatMap((ids) => ids)) {
      expect(FIGURE_IDS.has(figureId), figureId).toBe(true);
      expect(FIGURES[figureId], figureId).toBeDefined();
      const markup = renderToStaticMarkup(FIGURES[figureId]());
      expect(markup, figureId).toContain("<svg");
      expect(markup, figureId).toContain('role="img"');
      expect(title(markup).length, figureId).toBeGreaterThan(80);
      const fontSizes = [...markup.matchAll(/font-size="([\d.]+)"/g)].map((match) => Number(match[1]));
      expect(fontSizes.length, figureId).toBeGreaterThan(0);
      expect(fontSizes.every((size) => size >= 10), figureId).toBe(true);
    }
  });

  it("encodes the worked rectangle's coordinate differences and area truthfully", () => {
    const markup = renderToStaticMarkup(FIGURES["asv-coordinate-rectangle-area"]());
    expect(markup).toContain('data-width="4"');
    expect(markup).toContain('data-height="2"');
    expect(markup).toContain('data-area="8"');
    expect(title(markup)).toContain("width 4 and height 2");
    expect(title(markup)).toContain("area equals 8 square units");
  });

  it("uses perpendicular coordinate changes and the triangle half-area rule", () => {
    const markup = renderToStaticMarkup(FIGURES["asv-coordinate-right-triangle-legs"]());
    expect(markup).toContain('data-area-rule="one-half-base-times-height"');
    expect(markup).toContain("base = Δx");
    expect(markup).toContain("height = Δy");
    expect(markup).toContain("A = ½ × b × h");
  });

  it("withholds downstream computed answers from the composite setup figure", () => {
    const setup = renderToStaticMarkup(FIGURES["asv-coordinate-composite-setup"]());
    expect(setup).toContain('data-operation="add-attached-pieces"');
    expect(title(setup)).not.toMatch(/\b15\b|4\.5|19\.5/);
    expect(title(setup)).toMatch(/rectangle.*attached right triangle/i);
  });

  it("shows the already-taught composite sum only on the conclusion concept", () => {
    const markup = renderToStaticMarkup(FIGURES["asv-coordinate-composite-sum"]());
    expect(markup).toContain('data-rectangle-area="15"');
    expect(markup).toContain('data-triangle-area="4.5"');
    expect(markup).toContain('data-total-area="19.5"');
    expect(title(markup)).toContain("15 plus a triangle of area 4.5 equals 19.5");
  });

  it("keeps these answer-bearing illustrations off checks and challenges", () => {
    for (const [lessonId, figureIds] of PLACEMENTS) {
      const assessed = lesson(lessonId).steps.filter((step) => ["check", "challenge"].includes(step.kind));
      expect(assessed.every((step) => !step.figure || !figureIds.includes(step.figure)), lessonId).toBe(true);
    }
  });
});
