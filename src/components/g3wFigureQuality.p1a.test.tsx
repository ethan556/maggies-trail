// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { FIGURES } from "./figures";
import { PALETTE, contrastRatio } from "@/lib/palette";
import { collisions, describeCollision, scanTextBoxes } from "./textBoxes.testkit";

const TARGETS = ["g3w-share-then-add", "g3w-relevant-information"] as const;
const WHITE = "#FFFFFF";

afterEach(cleanup);

function figure(id: (typeof TARGETS)[number]): SVGSVGElement {
  const Figure = FIGURES[id];
  expect(Figure, `${id} must remain registered`).toBeTypeOf("function");
  const { container } = render(<Figure />);
  const svg = container.querySelector("svg");
  expect(svg, `${id} must render an SVG`).toBeTruthy();
  return svg as SVGSVGElement;
}

function visibleText(svg: SVGSVGElement): string {
  return Array.from(svg.querySelectorAll("text"))
    .map((node) => node.textContent?.trim() ?? "")
    .filter(Boolean)
    .join(" ");
}

function asHex(color: string): string {
  if (color.toLowerCase() === "white") return WHITE;
  expect(color, `hex colour expected, received ${color}`).toMatch(/^#[0-9a-f]{6}$/i);
  return color.toUpperCase();
}

function compositeOver(foreground: string, background: string, opacity: number): string {
  const foregroundHex = asHex(foreground).slice(1);
  const backgroundHex = asHex(background).slice(1);
  const channel = (offset: number) => {
    const foregroundChannel = Number.parseInt(foregroundHex.slice(offset, offset + 2), 16);
    const backgroundChannel = Number.parseInt(backgroundHex.slice(offset, offset + 2), 16);
    return Math.round(foregroundChannel * opacity + backgroundChannel * (1 - opacity));
  };
  return `#${[0, 2, 4].map(channel).map((value) => value.toString(16).padStart(2, "0")).join("")}`.toUpperCase();
}

function translatedPoint(node: Element, x: number, y: number): { x: number; y: number } {
  let current: Element | null = node;
  let translatedX = x;
  let translatedY = y;
  while (current) {
    const match = current.getAttribute("transform")?.match(/translate\(\s*(-?[\d.]+)(?:[\s,]+(-?[\d.]+))?\s*\)/);
    if (match) {
      translatedX += Number(match[1]);
      translatedY += Number(match[2] ?? 0);
    }
    current = current.parentElement;
  }
  return { x: translatedX, y: translatedY };
}

function numericAttribute(node: Element, name: string): number {
  let current: Element | null = node;
  while (current) {
    const value = current.getAttribute(name);
    if (value !== null) return Number(value);
    current = current.parentElement;
  }
  return 0;
}

function inheritedFill(node: Element): string {
  let current: Element | null = node;
  while (current) {
    const fill = current.getAttribute("fill");
    if (fill) return asHex(fill);
    current = current.parentElement;
  }
  return PALETTE.ink;
}

function renderedBackground(svg: SVGSVGElement, label: Element): string {
  const point = translatedPoint(label, numericAttribute(label, "x"), numericAttribute(label, "y"));
  const containingRectangles = Array.from(svg.querySelectorAll("rect")).filter((rect) => {
    const origin = translatedPoint(rect, numericAttribute(rect, "x"), numericAttribute(rect, "y"));
    const width = numericAttribute(rect, "width");
    const height = numericAttribute(rect, "height");
    return point.x >= origin.x && point.x <= origin.x + width && point.y >= origin.y && point.y <= origin.y + height;
  });
  const surface = containingRectangles.at(-1);
  if (!surface) return WHITE;
  const opacity = Number(surface.getAttribute("fill-opacity") ?? 1) * Number(surface.getAttribute("opacity") ?? 1);
  return compositeOver(surface.getAttribute("fill") ?? WHITE, WHITE, opacity);
}
function viewBox(svg: SVGSVGElement): { minX: number; minY: number; maxX: number; maxY: number } {
  const [minX = Number.NaN, minY = Number.NaN, width = Number.NaN, height = Number.NaN] = (svg.getAttribute("viewBox") ?? "")
    .split(/[\s,]+/)
    .map(Number);
  expect([minX, minY, width, height].every(Number.isFinite), "a usable viewBox").toBe(true);
  expect(width, "a positive viewBox width").toBeGreaterThan(0);
  expect(height, "a positive viewBox height").toBeGreaterThan(0);
  return { minX, minY, maxX: minX + width, maxY: minY + height };
}

describe("P1A Grade 3 word-problem figure-quality floor", () => {
  it("keeps every instructional label at least 10 SVG units", () => {
    for (const id of TARGETS) {
      const svg = figure(id);
      const labels = Array.from(svg.querySelectorAll("text"));
      expect(labels.length, `${id} has visible labels`).toBeGreaterThan(0);
      for (const label of labels) {
        const size = Number(label.getAttribute("font-size") ?? label.getAttribute("fontSize") ?? 0);
        expect(size, `${id}: ${JSON.stringify(label.textContent?.trim())}`).toBeGreaterThanOrEqual(10);
      }
    }
  });

  it("renders the extra-information label in full-contrast dark instructional ink", () => {
    const svg = figure("g3w-relevant-information");
    const extra = svg.querySelector("[data-label-role='extra-information']");
    expect(extra?.textContent?.trim()).toBe("extra");
    expect(extra?.getAttribute("fill")).toBe(PALETTE.ink);
    expect(extra?.closest("g")?.getAttribute("opacity")).toBeNull();
    expect(contrastRatio(PALETTE.ink, "#FFFFFF")).toBeGreaterThanOrEqual(4.5);
  });

  it("renders every visible instructional label at WCAG AA contrast against its actual light surface", () => {
    const expectedLabelCounts = new Map<(typeof TARGETS)[number], number>([
      ["g3w-share-then-add", 6],
      ["g3w-relevant-information", 8]
    ]);
    for (const id of TARGETS) {
      const svg = figure(id);
      const labels = Array.from(svg.querySelectorAll("text, tspan"))
        .filter((label) => !label.querySelector("tspan") && Boolean(label.textContent?.trim()));
      expect(labels, `${id}: every visible instructional label is audited`).toHaveLength(expectedLabelCounts.get(id) ?? 0);
      for (const label of labels) {
        const foreground = inheritedFill(label);
        const background = renderedBackground(svg, label);
        const ratio = contrastRatio(foreground, background);
        expect(foreground, `${id}: ${JSON.stringify(label.textContent?.trim())} uses instructional ink`).toBe(PALETTE.ink);
        expect(
          ratio,
          `${id}: ${JSON.stringify(label.textContent?.trim())} renders ${foreground} on ${background} at ${ratio.toFixed(2)}:1`
        ).toBeGreaterThanOrEqual(4.5);
      }
    }
  });
  it("keeps every label inside its viewBox without collisions", () => {
    for (const id of TARGETS) {
      const svg = figure(id);
      const bounds = viewBox(svg);
      const { boxes, skipped } = scanTextBoxes(svg);
      expect(skipped, `${id} has no unaudited labels`).toEqual([]);
      const outOfBounds = boxes.filter((box) => box.x0 < bounds.minX || box.x1 > bounds.maxX || box.y0 < bounds.minY || box.y1 > bounds.maxY);
      expect(outOfBounds, `${id} labels stay inside the ${bounds.maxX}×${bounds.maxY} viewBox`).toEqual([]);
      expect(collisions(boxes).map(describeCollision), `${id} has no overlapping labels`).toEqual([]);
    }
  });

  it("keeps each visible relationship represented in the title and ARIA description", () => {
    const share = figure("g3w-share-then-add");
    const shareVisible = visibleText(share);
    expect(shareVisible).toContain("18 ÷ 3 = 6 in each bag");
    expect(shareVisible).toContain("+2 goes into every bag");
    expect(shareVisible).toContain("(18 ÷ 3) + 2 = 8 each");
    expect(share.querySelector("title")?.textContent).toContain("add 2 to each share");
    expect(share.getAttribute("aria-label")).toContain("Two more are added to every bag");

    const relevant = figure("g3w-relevant-information");
    const relevantVisible = visibleText(relevant);
    expect(relevantVisible).toContain("3 red bags");
    expect(relevantVisible).toContain("extra");
    expect(relevantVisible).toContain("4 blue bags");
    expect(relevantVisible).toContain("6 marbles");
    expect(relevantVisible).toContain("4 × 6 = 24 blue marbles");
    expect(relevant.querySelector("[data-testid='g3w-extra-crossout']")).toBeTruthy();
    expect(relevant.querySelector("title")?.textContent).toContain("3 red bags is extra information");
    expect(relevant.getAttribute("aria-label")).toContain("The three red bags are crossed out as extra information");
    expect(relevant.getAttribute("aria-label")).toContain("twenty-four blue marbles");
  });
});