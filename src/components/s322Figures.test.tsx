// @vitest-environment jsdom
/**
 * S322 Lane A — formal adoption of the orphaned ep-03-01 `monomial-distribute-area` figure.
 * S321 (reports/closure/S321_VERIFY_IMPL456.md) found it committed unattributed in a78d6a3,
 * mathematically correct in isolation, but authorized by no signed contract — REVISE, pending
 * an owned adoption. This packet performs that adoption: registration, accessible-title
 * accuracy, isFigureTextAligned + adversarial-audit-style conflict scan against ep-03-01/c1's
 * live prose, and SVG viewBox containment (the containment check found and fixed a real gap —
 * the figure's original bottom caption overflowed its own viewBox — see the diff in
 * src/components/figures.tsx).
 *
 * Also verifies `vm-sixty-cube-box` (an unrelated figure that landed in the SAME unattributed
 * commit, in the same file this worker sole-owns this round): its two bottom captions likewise
 * overflowed their viewBox, which by itself pushed the shared S260 viewport-parity gate over
 * its 261-overrun budget (263). Widening its viewBox is the minimal fix; it is additive/
 * non-semantic and not itself part of either owned task, but was required to keep the shared
 * gate green.
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

type Step = { id: string; body?: string; figure?: string };
type Lesson = { id: string; steps: Step[] };

function loadLesson(courseDir: string, lessonId: string): Lesson {
  const path = join(ROOT, "content", "courses", courseDir, "lessons", `${lessonId}.json`);
  return JSON.parse(readFileSync(path, "utf8")) as Lesson;
}

function render(id: string): string {
  const Figure = FIGURES[id];
  expect(Figure, `figure "${id}" must be registered`).toBeDefined();
  return renderToStaticMarkup(Figure());
}

function titleOf(svg: string): string {
  return (svg.match(/<title>([\s\S]*?)<\/title>/i)?.[1] ?? "").replace(/\s+/g, " ").trim();
}

describe("S322 — ep-03-01 monomial-distribute-area: registration", () => {
  it("is registered in FIGURE_IDS and the FIGURES render map", () => {
    expect(FIGURE_IDS.has("monomial-distribute-area")).toBe(true);
    expect(FIGURES["monomial-distribute-area"]).toBeDefined();
  });
});

describe("S322 — ep-03-01 monomial-distribute-area: accessible title truth", () => {
  it("renders an <svg role=img> with a <title> stating 3x(x+4) = 3x·x + 3x·4 = 3x² + 12x", () => {
    const svg = render("monomial-distribute-area");
    expect(svg).toContain("<svg");
    expect(svg).toContain('role="img"');
    const title = titleOf(svg);
    expect(title).toMatch(/three x times x equals three x squared/i);
    expect(title).toMatch(/three x times four equals twelve x/i);
    expect(title).toMatch(/three x times the quantity x plus four equals three x squared plus twelve x/i);
  });
});

describe("S322 — ep-03-01/c1 binding: isFigureTextAligned + blocklist", () => {
  const lesson = loadLesson("exponents-polynomials", "ep-03-01");
  const c1 = lesson.steps.find((s) => s.id === "c1");

  it("c1 is still bound to monomial-distribute-area and carries the matching 3x(x+4) prose", () => {
    expect(c1).toBeDefined();
    expect(c1!.figure).toBe("monomial-distribute-area");
    expect(c1!.body).toContain("3x(x + 4) = 3x·x + 3x·4");
    expect(c1!.body).toContain("3x² + 12x");
  });

  it("passes the repo's own isFigureTextAligned probe (the same gate LessonPlayer/FigureView use)", () => {
    expect(isFigureTextAligned(c1!.figure!, c1!.body!)).toBe(true);
  });

  it("its binding key is not held in the manual mismatch blocklist", () => {
    const key = figureTextBindingKey(c1!.figure!, c1!.body!);
    expect(FIGURE_TEXT_MISMATCH_BLOCKLIST.has(key)).toBe(false);
  });
});

describe("S322 — ep-03-01/c1 binding: adversarial risk scan (risk_reasons empty)", () => {
  // Narrow, self-contained re-implementation of figureTextAdversarialAudit.test.tsx's risks()
  // heuristic (that file doesn't export its helpers) — a disjoint-number / disjoint-operation
  // scan between the figure's illustration description and the lesson prose it sits beside.
  const numberWords: Record<string, number> = {
    zero: 0, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7,
    eight: 8, nine: 9, ten: 10, eleven: 11, twelve: 12,
  };
  function exampleNumbers(value: string): Set<number> {
    const text = value.toLowerCase();
    const found = new Set<number>();
    for (const match of text.matchAll(/(?<![a-z])[-−]?\d+(?:\.\d+)?/g)) {
      found.add(Math.abs(Number(match[0].replace("−", "-"))));
    }
    for (const [word, n] of Object.entries(numberWords)) {
      if (new RegExp(`\\b${word}\\b`).test(text)) found.add(n);
    }
    return found;
  }
  function disjoint(a: Set<number>, b: Set<number>): boolean {
    return a.size > 0 && b.size > 0 && [...a].every((v) => !b.has(v));
  }

  it("figure title numbers and c1 body numbers are NOT disjoint (no EXAMPLE_NUMBER_CONFLICT)", () => {
    const lesson = loadLesson("exponents-polynomials", "ep-03-01");
    const c1 = lesson.steps.find((s) => s.id === "c1")!;
    const title = titleOf(render("monomial-distribute-area"));
    const figureNumbers = exampleNumbers(title);
    const lessonNumbers = exampleNumbers(c1.body!);
    expect(disjoint(figureNumbers, lessonNumbers), `figure=${[...figureNumbers]} text=${[...lessonNumbers]}`).toBe(false);
    // both must actually name the shared 3, 4, 12 facts (not merely "non-disjoint by accident")
    expect(figureNumbers.has(3)).toBe(true);
    expect(figureNumbers.has(4)).toBe(true);
    expect(figureNumbers.has(12)).toBe(true);
    expect(lessonNumbers.has(3)).toBe(true);
    expect(lessonNumbers.has(4)).toBe(true);
    expect(lessonNumbers.has(12)).toBe(true);
  });

  it("both figure and text name multiplication/distribution (no OPERATION_CONFLICT)", () => {
    const lesson = loadLesson("exponents-polynomials", "ep-03-01");
    const c1 = lesson.steps.find((s) => s.id === "c1")!;
    const title = titleOf(render("monomial-distribute-area"));
    expect(/times/i.test(title)).toBe(true);
    expect(/distribute|multiply/i.test(c1.body!)).toBe(true);
  });
});

describe("S322 — SVG numeral viewport containment (the gap found and fixed)", () => {
  // Lightweight, self-contained re-implementation of figureViewportParity.s260.test.tsx's
  // anchor-aware bounding-box estimate, scoped to the two figures this worker touched.
  const CHAR_EM = 0.72;

  function checkFigureContainment(id: string) {
    const svg = render(id);
    const viewBox = (svg.match(/viewBox="([^"]+)"/)?.[1] ?? "").trim().split(/\s+/).map(Number);
    expect(viewBox.length, `${id}: malformed viewBox`).toBe(4);
    const [minX, minY, w, h] = viewBox;
    const maxX = minX + w;
    const maxY = minY + h;

    for (const match of svg.matchAll(/<text([^>]*)>([\s\S]*?)<\/text>/g)) {
      const attrs = match[1];
      const raw = match[2].replace(/<[^>]+>/g, "").replace(/&#(\d+);/g, "").trim();
      if (!/\d/.test(raw)) continue; // only numeral-bearing labels are in scope, as in S260
      const x = Number(attrs.match(/\bx="(-?[\d.]+)"/)?.[1] ?? "0");
      const y = Number(attrs.match(/\by="(-?[\d.]+)"/)?.[1] ?? "0");
      const fontSize = Number(attrs.match(/font-size="(-?[\d.]+)"/)?.[1] ?? "12");
      const anchor = attrs.match(/text-anchor="(\w+)"/)?.[1] ?? "start";
      const textWidth = raw.length * fontSize * CHAR_EM;
      const x0 = anchor === "middle" ? x - textWidth / 2 : anchor === "end" ? x - textWidth : x;
      const x1 = x0 + textWidth;
      const y0 = y - fontSize * 0.98;
      const y1 = y + fontSize * 0.28;
      expect(x0, `${id}: "${raw}" left edge ${x0.toFixed(1)} < viewBox minX ${minX}`).toBeGreaterThanOrEqual(minX - 0.5);
      expect(x1, `${id}: "${raw}" right edge ${x1.toFixed(1)} > viewBox maxX ${maxX}`).toBeLessThanOrEqual(maxX + 0.5);
      expect(y0, `${id}: "${raw}" top edge ${y0.toFixed(1)} < viewBox minY ${minY}`).toBeGreaterThanOrEqual(minY - 0.5);
      expect(y1, `${id}: "${raw}" bottom edge ${y1.toFixed(1)} > viewBox maxY ${maxY}`).toBeLessThanOrEqual(maxY + 0.5);
    }
  }

  it("monomial-distribute-area: every numeral label is inside its viewBox", () => {
    checkFigureContainment("monomial-distribute-area");
  });

  it("vm-sixty-cube-box: every numeral label is inside its viewBox (incidental fix)", () => {
    checkFigureContainment("vm-sixty-cube-box");
  });
});
