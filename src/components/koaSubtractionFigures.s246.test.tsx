// @vitest-environment jsdom
import { mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import sharp from "sharp";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";
import { isFigureTextAligned } from "@/lib/figureTextAlignment";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

const COURSE = join(process.cwd(), "content", "courses", "add-subtract-10-k", "lessons");
const EXPECTED = new Map([
  ["koa-02-01", "koa-take-away-removal"],
  ["koa-02-02", "koa-subtraction-cross-out"],
  ["koa-02-03", "koa-subtraction-act-out"],
  ["koa-02-04", "koa-subtraction-sentence"],
  ["koa-02-05", "koa-count-back-left"],
]);

describe("S246 Kindergarten subtraction visual-first canary", () => {
  it("replaces all ten generic concept bindings with the right subtraction representation", () => {
    for (const [lessonId, figureId] of EXPECTED) {
      const lesson = JSON.parse(readFileSync(join(COURSE, `${lessonId}.json`), "utf8"));
      const concepts = lesson.steps.filter((step: { kind: string }) => step.kind === "concept");

      expect(concepts, lessonId).toHaveLength(2);
      expect(concepts.map((step: { figure?: string }) => step.figure), lessonId).toEqual([figureId, figureId]);
      expect(concepts.every((step: { body: string }) => isFigureTextAligned(figureId, step.body)), lessonId).toBe(true);
      expect(concepts.some((step: { figure?: string }) => step.figure === "count-on-hops"), lessonId).toBe(false);
    }
  });

  it("registers five accessible, readable SVG figures", () => {
    for (const figureId of EXPECTED.values()) {
      expect(FIGURE_IDS.has(figureId), figureId).toBe(true);
      expect(FIGURES[figureId], figureId).toBeDefined();
      const markup = renderToStaticMarkup(FIGURES[figureId]());
      expect(markup).toContain("<svg");
      expect(markup).toContain('role="img"');
      expect(markup, figureId).toMatch(/<title>[^<]{80,}<\/title>/);
      const fontSizes = [...markup.matchAll(/font-size="([\d.]+)"/g)].map((match) => Number(match[1]));
      expect(fontSizes.length, `${figureId} must have visible labels`).toBeGreaterThan(0);
      expect(fontSizes.every((size) => size >= 10), `${figureId} has undersized text`).toBe(true);
    }
  });

  it("keeps every visible label collision-free", () => {
    for (const figureId of EXPECTED.values()) {
      const Figure = FIGURES[figureId];
      const { container } = render(<Figure />);
      const found = Array.from(container.querySelectorAll("svg")).flatMap((svg) =>
        collisions(scanTextBoxes(svg).boxes).map(describeCollision),
      );
      expect(found, figureId).toEqual([]);
      cleanup();
    }
  });

  it("keeps worked examples off every answer-bearing surface", () => {
    for (const lessonId of EXPECTED.keys()) {
      const lesson = JSON.parse(readFileSync(join(COURSE, `${lessonId}.json`), "utf8"));
      const assessed = lesson.steps.filter((step: { kind: string }) => ["interactive", "check", "challenge"].includes(step.kind));
      expect(assessed.every((step: { figure?: string }) => step.figure === undefined), lessonId).toBe(true);
    }
  });

  it("keeps every pictured subtraction relationship mathematically true", () => {
    const cases = [
      ["koa-take-away-removal", "6", "2", "4", "data-start-size", "data-removed-size", "data-remaining-size"],
      ["koa-subtraction-cross-out", "7", "3", "4", "data-start-size", "data-crossed-out-size", "data-remaining-size"],
      ["koa-subtraction-act-out", "5", "2", "3", "data-start-size", "data-leaving-size", "data-remaining-size"],
      ["koa-subtraction-sentence", "6", "2", "4", "data-start-size", "data-subtracted-size", "data-difference-size"],
      ["koa-count-back-left", "7", "3", "4", "data-start-value", "data-count-back", "data-landing-value"],
    ] as const;

    for (const [figureId, start, removed, remaining, startKey, removedKey, remainingKey] of cases) {
      const markup = renderToStaticMarkup(FIGURES[figureId]());
      expect(markup).toContain(`${startKey}="${start}"`);
      expect(markup).toContain(`${removedKey}="${removed}"`);
      expect(markup).toContain(`${remainingKey}="${remaining}"`);
      expect(Number(start) - Number(removed), figureId).toBe(Number(remaining));
    }
  });

  it("writes review PNGs only when explicitly requested", async () => {
    if (process.env.UPDATE_KOA_SUBTRACTION_PREVIEWS !== "1") return;

    const output = join(process.cwd(), "reports", "vis", "previews", "koa-subtraction-s246");
    mkdirSync(output, { recursive: true });
    const tiles: Buffer[] = [];
    for (const figureId of EXPECTED.values()) {
      const svg = renderToStaticMarkup(FIGURES[figureId]());
      const png = await sharp(Buffer.from(svg)).resize(720, 380).png().toBuffer();
      await sharp(png).toFile(join(output, `${figureId}.png`));
      tiles.push(png);
    }

    await sharp({
      create: { width: 1440, height: 1140, channels: 4, background: "#FFFDF8" },
    })
      .composite(
        tiles.map((input, index) => ({
          input,
          left: (index % 2) * 720,
          top: Math.floor(index / 2) * 380,
        })),
      )
      .png()
      .toFile(join(output, "koa-subtraction-contact-sheet.png"));
  });
});
