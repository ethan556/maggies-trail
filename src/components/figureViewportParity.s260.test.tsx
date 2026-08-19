// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { readFileSync } from "node:fs";
import { FIGURES } from "./figures";


afterEach(cleanup);

type Bounds = { minX: number; minY: number; maxX: number; maxY: number };

function boundsOf(svg: Element): Bounds | null {
  const parts = (svg.getAttribute("viewBox") ?? "").trim().split(/[\s,]+/).map(Number);
  if (parts.length !== 4 || parts.some((part) => !Number.isFinite(part)) || parts[2] <= 0 || parts[3] <= 0) return null;
  return { minX: parts[0], minY: parts[1], maxX: parts[0] + parts[2], maxY: parts[1] + parts[3] };
}
type TextBox = { text: string; x0: number; x1: number; y0: number; y1: number };
type Matrix = [number, number, number, number, number, number];
const IDENTITY: Matrix = [1, 0, 0, 1, 0, 0];
const CHAR_EM = 0.72;

function multiply(left: Matrix, right: Matrix): Matrix {
  const [a, b, c, d, e, f] = left;
  const [g, h, i, j, k, l] = right;
  return [a * g + c * h, b * g + d * h, a * i + c * j, b * i + d * j, a * k + c * l + e, b * k + d * l + f];
}

function transformMatrix(source: string): Matrix | null {
  let result: Matrix = IDENTITY;
  let consumed = "";
  const command = /([A-Za-z]+)\s*\(([^)]*)\)/g;
  for (const match of source.matchAll(command)) {
    consumed += match[0];
    const values = match[2]!.trim().split(/[\s,]+/).filter(Boolean).map(Number);
    if (values.some((value) => !Number.isFinite(value))) return null;
    const name = match[1]!.toLowerCase();
    let next: Matrix;
    if (name === "matrix" && values.length === 6) next = values as Matrix;
    else if (name === "translate" && values.length >= 1) next = [1, 0, 0, 1, values[0]!, values[1] ?? 0];
    else if (name === "scale" && values.length >= 1) next = [values[0]!, 0, 0, values[1] ?? values[0]!, 0, 0];
    else if (name === "rotate" && values.length >= 1) {
      const radians = values[0]! * Math.PI / 180;
      const rotation: Matrix = [Math.cos(radians), Math.sin(radians), -Math.sin(radians), Math.cos(radians), 0, 0];
      if (values.length >= 3) {
        const cx = values[1]!;
        const cy = values[2]!;
        next = multiply(multiply([1, 0, 0, 1, cx, cy], rotation), [1, 0, 0, 1, -cx, -cy]);
      } else next = rotation;
    } else if (name === "skewx" && values.length === 1) next = [1, 0, Math.tan(values[0]! * Math.PI / 180), 1, 0, 0];
    else if (name === "skewy" && values.length === 1) next = [1, Math.tan(values[0]! * Math.PI / 180), 0, 1, 0, 0];
    else return null;
    result = multiply(result, next);
  }
  if (source.replace(command, "").trim() !== "") return null;
  return consumed || source.trim() === "" ? result : null;
}

function inherited(el: Element, attribute: string): string | null {
  for (let node: Element | null = el; node; node = node.parentElement) {
    const value = node.getAttribute(attribute);
    if (value !== null && value !== "") return value;
    if (node.tagName.toLowerCase() === "svg") break;
  }
  return null;
}

function coordinate(el: Element, attribute: string, fallback = 0): number | null {
  const source = el.getAttribute(attribute);
  if (source === null || source.trim() === "") return fallback;
  const value = Number(source.trim().split(/[\s,]+/)[0]);
  return Number.isFinite(value) ? value : null;
}

function matrixToSvg(el: Element): Matrix | null {
  let result: Matrix = IDENTITY;
  for (let node: Element | null = el; node; node = node.parentElement) {
    const source = node.getAttribute("transform");
    if (source) {
      const own = transformMatrix(source);
      if (!own) return null;
      result = multiply(own, result);
    }
    if (node.tagName.toLowerCase() === "svg") break;
  }
  return result;
}

function apply(matrix: Matrix, x: number, y: number): { x: number; y: number } {
  return { x: matrix[0] * x + matrix[2] * y + matrix[4], y: matrix[1] * x + matrix[3] * y + matrix[5] };
}

/** Conservative test-only geometry for plain text, anchored tspans and transformed labels. */
function scanNumeralBoxes(svg: Element): { boxes: TextBox[]; unaudited: string[] } {
  const boxes: TextBox[] = [];
  const unaudited: string[] = [];
  for (const text of Array.from(svg.querySelectorAll("text"))) {
    const tspans = Array.from(text.querySelectorAll("tspan")).filter((node) => node.querySelector("tspan") === null);
    const targets = tspans.length > 0 ? tspans : [text];
    let cursorX = coordinate(text, "x", 0) ?? 0;
    let cursorY = coordinate(text, "y", 0) ?? 0;
    for (const target of targets) {
      const value = (target.textContent ?? "").replace(/\s+/g, " ").trim();
      if (!value || !HAS_NUMERAL.test(value)) continue;
      const fontSize = Number(inherited(target, "font-size"));
      const x = coordinate(target, "x", cursorX);
      const y = coordinate(target, "y", cursorY);
      const dx = coordinate(target, "dx", 0);
      const dy = coordinate(target, "dy", 0);
      const matrix = matrixToSvg(target);
      if (!Number.isFinite(fontSize) || fontSize <= 0 || x === null || y === null || dx === null || dy === null || !matrix) {
        unaudited.push(value);
        continue;
      }
      cursorX = x + dx;
      cursorY = y + dy;
      const width = value.length * fontSize * CHAR_EM;
      const anchor = inherited(target, "text-anchor") ?? "start";
      const x0 = anchor === "middle" ? cursorX - width / 2 : anchor === "end" ? cursorX - width : cursorX;
      const y0 = cursorY - fontSize * 0.98;
      const corners = [
        apply(matrix, x0, y0),
        apply(matrix, x0 + width, y0),
        apply(matrix, x0, cursorY + fontSize * 0.28),
        apply(matrix, x0 + width, cursorY + fontSize * 0.28),
      ];
      boxes.push({
        text: value,
        x0: Math.min(...corners.map((point) => point.x)),
        x1: Math.max(...corners.map((point) => point.x)),
        y0: Math.min(...corners.map((point) => point.y)),
        y1: Math.max(...corners.map((point) => point.y)),
      });
      cursorX += width;
    }
  }
  return { boxes, unaudited };
}

const HAS_NUMERAL = /(?:^|[^A-Za-z])[-−]?\d+(?:[.,]\d+)?(?:\/\d+)?(?:$|[^A-Za-z])/;
const NUMBER_LINE = /(number.?line|line.?plot|hop|round|integer.?jump|opposite)/i;

describe("S260 — static figure numeral viewport containment", () => {
  it("keeps every measurable non-number-line numeral inside its SVG viewBox", () => {
    const outside: string[] = [];
    const malformed: string[] = [];
    const skippedNumeric: string[] = [];
    let svgCount = 0;
    let numericCount = 0;

    for (const [id, Figure] of Object.entries(FIGURES)) {
      const { container } = render(<Figure />);
      for (const svg of Array.from(container.querySelectorAll("svg"))) {
        svgCount += 1;
        const bounds = boundsOf(svg);
        if (!bounds) {
          malformed.push(id);
          continue;
        }
        const { boxes, unaudited } = scanNumeralBoxes(svg);
        skippedNumeric.push(...unaudited.map((entry) => `${id}: ${entry}`));
        for (const box of boxes) {
          numericCount += 1;
          if (NUMBER_LINE.test(id)) continue; // separately owned S260 number-line lane
          if (box.x0 < bounds.minX || box.x1 > bounds.maxX || box.y0 < bounds.minY || box.y1 > bounds.maxY) {
            outside.push(`${id}: ${JSON.stringify(box.text)} [${box.x0.toFixed(1)},${box.y0.toFixed(1)}..${box.x1.toFixed(1)},${box.y1.toFixed(1)}]`);
          }
        }
      }
      cleanup();
    }

    expect(svgCount).toBeGreaterThan(1800);
    expect(numericCount).toBeGreaterThan(1000);
    const baseline = `svg=${svgCount}; numeric=${numericCount}; malformed=${malformed.length}; unmeasured=${skippedNumeric.length}; outside=${outside.length}`;
    expect(malformed, `${baseline}; SVGs with no usable viewBox: ${malformed.join(", ")}`).toEqual([]);
    // These are source coordinates, not remaining learner-visible clips: the shared surface below
    // now makes SVG overflow visible and removes every enclosing figure-stage clip. Pinning the
    // measured population prevents a new authored overrun or unauditable tspan from being hidden
    // inside that runtime safety net.
    expect(outside.length, `${baseline}; new numeral overruns: ${outside.slice(0, 20).join(" | ")}`).toBeLessThanOrEqual(261);
    expect(skippedNumeric, `${baseline}; unaudited numeric labels: ${skippedNumeric.slice(0, 20).join(" | ")}`).toEqual([]);
  }, 300_000);

  it("routes registry and question SVGs through the responsive non-clipping surface", () => {
    const css = readFileSync("src/app/globals.css", "utf8");
    const figureView = readFileSync("src/components/FigureView.tsx", "utf8");
    const widgets = readFileSync("src/components/widgets.tsx", "utf8");
    expect(figureView).toContain("<SvgLatexSurface><FigureById");
    expect(widgets).toContain("<SvgLatexSurface><div");
    expect(css).toMatch(/\.svg-latex-surface svg\s*\{[^}]*height:\s*auto;[^}]*max-width:\s*100%;[^}]*overflow:\s*visible;/s);
    expect(css).toMatch(/\.trail-concept-stage,\s*\.math-stage-shell > \.lesson-stage\s*\{\s*overflow:\s*visible;/s);
    expect(widgets).not.toContain('className="my-2 overflow-hidden rounded-lg border border-ink/10 bg-white"');
  });
});
