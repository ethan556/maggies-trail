// @vitest-environment jsdom
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { FIGURE_IDS } from "./figureIds";
import { FIGURES } from "./figures";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

type Concept = { id: string; body: string; narration: string; figure?: string };
type Lesson = { id: string; steps: Concept[] };

const lesson = (id: string) => JSON.parse(readFileSync(join(process.cwd(), "content", "courses", "mult-fluency-g3", "lessons", `${id}.json`), "utf8")) as Lesson;
const byId = (raw: Lesson, id: string) => raw.steps.find((step) => step.id === id)!;
const timesTen = lesson("mf3-02-03");
const squares = lesson("mf3-02-04");

const expected = [
  [timesTen, "c1", "mult3-times-ten-place-value", ["7 × 10 = 70", "7 tens", "ones"]],
  [timesTen, "c2", "mult3-times-ten-empty-ones", ["7 tens and 0 ones", "empty ones place"]],
  [squares, "c1", "mult3-square-array", ["3 × 3 = 9", "3 rows", "3 columns"]],
  [squares, "c2", "mult3-next-square-growth", ["new row: 4 tiles", "new column", "9 + 7 = 16"]],
] as const;

describe("S259 mult-fluency-g3 exact concept figures", () => {
  afterEach(cleanup);

  it.each(expected)("binds $0/$1 to exact registered, narrated semantics", (raw, stepId, figureId, tokens) => {
    const concept = byId(raw, stepId);
    expect(concept.figure).toBe(figureId);
    expect(concept.body).toBe(concept.narration);
    expect(FIGURE_IDS.has(figureId)).toBe(true);
    expect(FIGURES[figureId], figureId).toBeDefined();

    const { container } = render(<>{FIGURES[figureId]()}</>);
    const svg = container.querySelector("svg");
    expect(svg?.getAttribute("role")).toBe("img");
    expect(svg?.querySelector("title")?.textContent?.trim().length).toBeGreaterThan(20);
    const semanticText = `${svg?.getAttribute("aria-label") ?? ""} ${svg?.textContent ?? ""}`.toLowerCase();
    for (const token of tokens) expect(semanticText, `${figureId}/${token}`).toContain(token.toLowerCase());
  });

  it.each(expected)("keeps $2 labels collision-free", (_raw, _stepId, figureId) => {
    const { container } = render(<>{FIGURES[figureId]()}</>);
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
    expect(collisions(scanTextBoxes(svg!).boxes).map(describeCollision), figureId).toEqual([]);
  });

  it("models next-square growth without double-counting the new corner", () => {
    const { container } = render(<>{FIGURES["mult3-next-square-growth"]()}</>);
    expect(container.querySelectorAll("rect")).toHaveLength(16);
    expect(container.textContent).toContain("new row: 4 tiles");
    expect(container.textContent).toContain("3 more tiles");
    expect(container.textContent).toContain("9 + 7 = 16");
  });
});
