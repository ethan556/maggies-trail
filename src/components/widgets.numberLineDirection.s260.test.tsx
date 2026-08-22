// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, hopSizeAnswer, type TWidget } from "@/lib/schema";

const TYPES = new Set(["numberLinePlace", "numberLineHop", "numberLineRay", "doubleNumberLine"]);
type Case = { where: string; widget: TWidget };

function corpus(): Case[] {
  const found: Case[] = [];
  const root = join(process.cwd(), "content", "courses");
  for (const course of readdirSync(root)) {
    const lessons = join(root, course, "lessons");
    if (!existsSync(lessons)) continue;
    for (const file of readdirSync(lessons).filter((name) => name.endsWith(".json"))) {
      const lesson = JSON.parse(readFileSync(join(lessons, file), "utf8")) as {
        id: string;
        steps?: Array<{ id: string; widget?: unknown }>;
        remedials?: Array<{ concept?: { id: string; widget?: unknown }; check?: { id: string; widget?: unknown } }>;
      };
      const surfaces = [
        ...(lesson.steps ?? []),
        ...(lesson.remedials ?? []).flatMap((route) => [route.concept, route.check]).filter((step): step is NonNullable<typeof step> => Boolean(step)),
      ];
      for (const surface of surfaces) {
        const raw = surface.widget as { type?: string } | undefined;
        if (!raw?.type || !TYPES.has(raw.type)) continue;
        found.push({ where: `${course}/${lesson.id}/${surface.id}`, widget: WidgetSpec.parse(raw) });
      }
    }
  }
  return found;
}

const CASES = corpus();
const initialValue = (widget: TWidget): unknown => {
  if (widget.type === "numberLinePlace") return widget.target;
  if (widget.type === "numberLineHop") {
    if (widget.hopSizeTargets) return hopSizeAnswer(widget.start, widget.hopSizeTargets, widget.hopSizeMin ?? 1, widget.hopSizeMax ?? 12) ?? widget.hopSizeMin ?? 1;
    return widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops;
  }
  if (widget.type === "doubleNumberLine") return widget.targetTop;
  return null;
};

const numeric = (node: Element, name: string) => Number(node.getAttribute(name));

afterEach(cleanup);

describe("S260 system-wide runtime number-line direction and clipping contract", () => {
  it("pins all 503 authored runtime consumers", () => {
    // 502 → 503: commit a78d6a3 (S320-IMPL-A5-kcw-02-04, contract S320_ASSESS_A5.md, verified
    // KEEP by S321-V1-kcw-02-04) converted number-writing-k/kcw-02-04/ch1 subitizeFlash →
    // numberLineHop; recounted with this file's own corpus() — see S326_RECONCILE_R3.md.
    const counts = Object.fromEntries([...TYPES].map((type) => [type, CASES.filter(({ widget }) => widget.type === type).length]));
    expect(counts).toEqual({ numberLinePlace: 63, numberLineHop: 431, numberLineRay: 4, doubleNumberLine: 5 });
  });

  it("keeps axes, direction heads, labels, and ARIA inside every responsive viewBox", () => {
    const defects: string[] = [];
    for (const { where, widget } of CASES) {
      const { container } = render(<WidgetRenderer spec={widget} value={initialValue(widget)} onChange={() => {}} disabled={false} tone="neutral" />);
      const svg = container.querySelector<SVGSVGElement>("svg[role='img']");
      if (!svg) { defects.push(`${where}: missing role=img SVG`); cleanup(); continue; }
      const box = (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
      const width = box[2] ?? 0, height = box[3] ?? 0;
      if (box.length !== 4 || box.some((part) => !Number.isFinite(part)) || width <= 0 || height <= 0) defects.push(`${where}: invalid viewBox`);
      if (svg.getAttribute("preserveAspectRatio") !== "xMidYMid meet") defects.push(`${where}: responsive scaling contract missing`);
      const axes = [...svg.querySelectorAll("[data-number-line-axis='continuing']")];
      const expectedAxes = widget.type === "doubleNumberLine" ? 2 : 1;
      if (axes.length !== expectedAxes) defects.push(`${where}: expected ${expectedAxes} continuing axes, got ${axes.length}`);
      for (const axis of axes) {
        const x1 = numeric(axis, "data-axis-start"), x2 = numeric(axis, "data-axis-end");
        if (!(x1 >= 6 && x2 <= width - 6 && x2 > x1)) defects.push(`${where}: axis/head clipping risk ${x1}..${x2} in ${width}`);
        if (axis.querySelectorAll("[data-axis-arrow='left']").length !== 1 || axis.querySelectorAll("[data-axis-arrow='right']").length !== 1) defects.push(`${where}: axis does not have exactly two direction heads`);
      }
      for (const text of svg.querySelectorAll<SVGTextElement>("text[x][y]")) {
        const x = numeric(text, "x"), y = numeric(text, "y");
        const size = Number(text.getAttribute("font-size") ?? text.getAttribute("fontSize") ?? 10);
        const estimatedWidth = (text.textContent ?? "").trim().length * size * 0.72;
        const anchor = text.getAttribute("text-anchor") ?? "start";
        const left = anchor === "middle" ? x - estimatedWidth / 2 : anchor === "end" ? x - estimatedWidth : x;
        const right = anchor === "middle" ? x + estimatedWidth / 2 : anchor === "end" ? x : x + estimatedWidth;
        if (left < -0.5 || right > width + 0.5 || y < size || y > height) defects.push(`${where}: clipped text ${JSON.stringify((text.textContent ?? "").trim())} at ${left.toFixed(1)}..${right.toFixed(1)}, y=${y}`);
      }
      const spoken = svg.getAttribute("aria-label") ?? "";
      if (!spoken.toLowerCase().includes("line")) defects.push(`${where}: ARIA omits number-line identity`);
      if (widget.type === "numberLineHop" && !widget.hopSizeTargets) {
        const heads = [...svg.querySelectorAll("[data-number-line-direction]")];
        if (heads.length !== widget.hops) defects.push(`${where}: ${heads.length}/${widget.hops} hop direction heads`);
        const expected = widget.direction === "back" ? "left" : "right";
        if (heads.some((head) => head.getAttribute("data-number-line-direction") !== expected)) defects.push(`${where}: visible hop direction disagrees with authored ${widget.direction}`);
        if (!spoken.toLowerCase().includes(widget.direction === "back" ? "back" : "forward")) defects.push(`${where}: ARIA omits ${widget.direction} direction`);
      }
      if (widget.type === "numberLineRay" && svg.querySelectorAll("[data-number-line-direction]").length !== 1) defects.push(`${where}: ray has no unique visible direction head`);
      cleanup();
    }
    expect(defects).toEqual([]);
  }, 180_000);
});
