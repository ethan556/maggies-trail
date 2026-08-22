import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import { createElement } from "react";
import { describe, expect, it } from "vitest";
import { FIGURES } from "@/components/figures";
import { isFigureTextAligned } from "./figureTextAlignment";

const ROOT = process.cwd();
const lesson = JSON.parse(
  readFileSync(join(ROOT, "content", "courses", "measurement-data", "lessons", "md-03-01.json"), "utf8")
) as {
  steps: Array<{ id: string; body: string; figure?: string }>;
  remedials: Array<{ check: { id: string; body: string; figure?: string } }>;
};

const expected = new Map([
  ["k1", "md3-pictograph-four-apples"],
  ["k2", "md3-pictograph-three-and-half-stars"],
  ["ch1", "md3-pictograph-three-and-half-books"],
  ["rem-pg-k", "md3-pictograph-three-apples"]
] as const);

function surface(id: string) {
  return lesson.steps.find((step) => step.id === id) ?? lesson.remedials.flatMap((remedial) => [remedial.check]).find((step) => step.id === id);
}

describe("S285 K–5 exact question visuals", () => {
  it("keeps the system-wide keyed-pictograph audit current", () => {
    expect(() => execFileSync(process.execPath, ["scripts/audit/k5-question-visual-support.mjs", "--check"], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: "pipe"
    })).not.toThrow();
  });

  it("shows every named pictograph row without revealing the answer", () => {
    for (const [id, figureId] of expected) {
      const step = surface(id);
      expect(step, id).toBeDefined();
      expect(step?.figure, id).toBe(figureId);
      expect(isFigureTextAligned(figureId, step?.body ?? ""), `${id} must retain exact data alignment`).toBe(true);

      const Figure = FIGURES[figureId];
      expect(Figure, `${figureId} must remain registered`).toBeTypeOf("function");
      const markup = renderToStaticMarkup(createElement(Figure));
      expect(markup, `${figureId} must identify its supplied row`).toContain("No total is shown.");
    }

    const stars = renderToStaticMarkup(createElement(FIGURES["md3-pictograph-three-and-half-stars"]));
    expect(stars).toContain("3 full stars and one half-star");
    expect(stars).toContain("10 points");
    expect(stars).not.toContain("35");
  });
});
