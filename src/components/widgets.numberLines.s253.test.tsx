// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, hopLabel, hopSizeAnswer, type TWidget } from "@/lib/schema";

type LineType = "numberLinePlace" | "numberLineHop";
type Case<T extends LineType> = { where: string; widget: Extract<TWidget, { type: T }> };

function corpus<T extends LineType>(type: T): Case<T>[] {
  const found: Case<T>[] = [];
  const root = join(process.cwd(), "content", "courses");
  for (const course of readdirSync(root)) {
    const lessonDir = join(root, course, "lessons");
    if (!existsSync(lessonDir)) continue;
    for (const file of readdirSync(lessonDir)) {
      if (!file.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(lessonDir, file), "utf8")) as {
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
        if (raw?.type !== type) continue;
        found.push({ where: `${course}/${lesson.id}/${surface.id}`, widget: WidgetSpec.parse(raw) as Case<T>["widget"] });
      }
    }
  }
  return found;
}

const PLACES = corpus("numberLinePlace");
const HOPS = corpus("numberLineHop");
const label = (value: number, denominator?: number) => denominator === undefined
  ? String(Number(value.toFixed(4))).replace(/^-/, "−")
  : hopLabel(Math.round(value), denominator);
const axis = (axisLabel: string | undefined, unit: string | undefined, fraction: boolean) => {
  const base = axisLabel ?? (fraction ? "Fraction" : "Position");
  return unit ? `${base} (${unit})` : base;
};
const labels = (svg: SVGSVGElement, testId: string) => Array.from(svg.querySelectorAll(`[data-testid='${testId}']`)).map((node) => node.getAttribute("data-label") ?? "");

afterEach(cleanup);

describe("S253 shared number-line portfolio boundary", () => {
  it("pins exactly 494 authored and remedial consumers", () => {
    // 493 → 494 (hops 430 → 431): commit a78d6a3 (S320-IMPL-A5-kcw-02-04, contract
    // S320_ASSESS_A5.md, verified KEEP by S321-V1-kcw-02-04) converted
    // number-writing-k/kcw-02-04/ch1 subitizeFlash → numberLineHop (no denom, no
    // hopSizeTargets, so the sub-counts are untouched). See S326_RECONCILE_R3.md.
    expect(PLACES).toHaveLength(63);
    expect(HOPS).toHaveLength(431);
    expect(PLACES.length + HOPS.length).toBe(494);
    expect(PLACES.filter(({ widget }) => widget.fractionDen !== undefined)).toHaveLength(16);
    expect(HOPS.filter(({ widget }) => widget.denom !== undefined)).toHaveLength(5);
    expect(HOPS.filter(({ widget }) => widget.hopSizeTargets !== undefined)).toHaveLength(1);
  });

  it("renders all 63 placement lines with conventional complete scales and visible/ARIA parity", () => {
    const defects: string[] = [];
    for (const { where, widget } of PLACES) {
      const before = JSON.stringify(widget);
      const { container } = render(<WidgetRenderer spec={widget} value={widget.target} onChange={() => {}} disabled={false} tone="neutral" />);
      const svg = container.querySelector<SVGSVGElement>("svg[role='img']");
      if (!svg) { defects.push(`${where}: no accessible SVG`); cleanup(); continue; }
      const visibleLabels = labels(svg, "nlp-label");
      const spoken = svg.getAttribute("aria-label") ?? "";
      const title = widget.title ?? "Number line";
      const axisTitle = axis(widget.axisLabel, widget.unit, widget.fractionDen !== undefined);
      for (const testId of ["nlp-axis", "nlp-arrows", "nlp-ruled-scale", "nlp-axis-title", "nlp-marker"])
        if (!svg.querySelector(`[data-testid='${testId}']`)) defects.push(`${where}: missing ${testId}`);
      if (svg.getAttribute("viewBox") !== "0 0 360 118" || svg.getAttribute("preserveAspectRatio") !== "xMidYMid meet") defects.push(`${where}: non-responsive or clipping-prone viewBox`);
      if (visibleLabels.length < 3 || visibleLabels.length > 12) defects.push(`${where}: ${visibleLabels.length} major labels outside 3–12`);
      for (const endpoint of [label(widget.min, widget.fractionDen), label(widget.max, widget.fractionDen)])
        if (!visibleLabels.includes(endpoint)) defects.push(`${where}: missing endpoint ${endpoint}`);
      if (widget.min <= 0 && widget.max >= 0 && visibleLabels.filter((value) => value === "0").length !== 1) defects.push(`${where}: origin is not labelled exactly once`);
      if (svg.querySelectorAll("[data-testid='nlp-major-tick']").length !== visibleLabels.length) defects.push(`${where}: major tick/label mismatch`);
      if (svg.querySelectorAll("[data-testid='nlp-ruled-scale'] line").length !== visibleLabels.length) defects.push(`${where}: guide/label mismatch`);
      for (const token of [title, axisTitle, ...visibleLabels, label(widget.target, widget.fractionDen)])
        if (!spoken.includes(token)) defects.push(`${where}: accessible name omits ${JSON.stringify(token)}`);
      if (!(container.textContent ?? "").includes(title) || !(container.textContent ?? "").includes(axisTitle)) defects.push(`${where}: title/axis title not visible`);
      if ((container.textContent ?? "").includes("^") || spoken.includes("^")) defects.push(`${where}: learner-visible caret`);
      const input = container.querySelector<HTMLInputElement>("input[type='range']");
      if (!input || input.min !== String(widget.min) || input.max !== String(widget.max) || input.step !== String(widget.step) || !input.className.includes("h-11")) defects.push(`${where}: native keyboard/touch range contract changed`);
      if (widget.fractionDen !== undefined && svg.querySelectorAll("[data-testid='nl-fraction-bar']").length === 0) defects.push(`${where}: fraction scale has no stacked fraction label`);
      if (JSON.stringify(widget) !== before) defects.push(`${where}: render mutated evaluator spec`);
      cleanup();
    }
    expect(defects).toEqual([]);
  }, 60_000);

  it("renders all 431 hop lines with true hop structure, complete scales, and stable controls", () => {
    const defects: string[] = [];
    for (const { where, widget } of HOPS) {
      const before = JSON.stringify(widget);
      const hopSizeMode = widget.hopSizeTargets !== undefined;
      const landing = widget.start + (widget.direction === "back" ? -1 : 1) * widget.hop * widget.hops;
      const current = hopSizeMode
        ? hopSizeAnswer(widget.start, widget.hopSizeTargets ?? [], widget.hopSizeMin ?? 1, widget.hopSizeMax ?? 12) ?? widget.hopSizeMin ?? 1
        : landing;
      const { container } = render(<WidgetRenderer spec={widget} value={current} onChange={() => {}} disabled={false} tone="neutral" />);
      const svg = container.querySelector<SVGSVGElement>("svg[role='img']");
      if (!svg) { defects.push(`${where}: no accessible SVG`); cleanup(); continue; }
      const visibleLabels = labels(svg, "nlh-label");
      const spoken = svg.getAttribute("aria-label") ?? "";
      const title = widget.title ?? (hopSizeMode ? "Hop-size number line" : "Number-line hops");
      const axisTitle = axis(widget.axisLabel, widget.unit, widget.denom !== undefined);
      for (const testId of ["nlh-axis", "nlh-arrows", "nlh-ruled-scale", "nlh-axis-title"])
        if (!svg.querySelector(`[data-testid='${testId}']`)) defects.push(`${where}: missing ${testId}`);
      const viewBox = (svg.getAttribute("viewBox") ?? "").split(/\s+/).map(Number);
      if (viewBox.length !== 4 || viewBox[0] !== 0 || viewBox[1] !== 0 || viewBox[2] !== 360 || viewBox[3] < 132 || svg.getAttribute("preserveAspectRatio") !== "xMidYMid meet") defects.push(`${where}: non-responsive or clipping-prone viewBox`);
      if (visibleLabels.length < 3 || visibleLabels.length > 12) defects.push(`${where}: ${visibleLabels.length} major labels outside 3–12`);
      for (const endpoint of [label(widget.min, widget.denom), label(widget.max, widget.denom)])
        if (!visibleLabels.includes(endpoint)) defects.push(`${where}: missing endpoint ${endpoint}`);
      if (widget.min <= 0 && widget.max >= 0 && visibleLabels.filter((value) => value === "0").length !== 1) defects.push(`${where}: origin is not labelled exactly once`);
      if (svg.querySelectorAll("[data-testid='nlh-major-tick']").length !== visibleLabels.length) defects.push(`${where}: major tick/label mismatch`);
      if (svg.querySelectorAll("[data-testid='nlh-ruled-scale'] line").length !== visibleLabels.length) defects.push(`${where}: guide/label mismatch`);
      for (const token of [title, axisTitle, ...visibleLabels]) if (!spoken.includes(token)) defects.push(`${where}: accessible name omits ${JSON.stringify(token)}`);
      if (!(container.textContent ?? "").includes(title) || !(container.textContent ?? "").includes(axisTitle)) defects.push(`${where}: title/axis title not visible`);
      if ((container.textContent ?? "").includes("^") || spoken.includes("^")) defects.push(`${where}: learner-visible caret`);
      if (widget.denom !== undefined && svg.querySelectorAll("[data-testid='nl-fraction-bar']").length === 0) defects.push(`${where}: rational scale has no stacked fraction label`);
      if (hopSizeMode) {
        const input = container.querySelector<HTMLInputElement>("input[type='range']");
        if (!input || input.min !== String(widget.hopSizeMin ?? 1) || input.max !== String(widget.hopSizeMax ?? 12) || !input.className.includes("h-11")) defects.push(`${where}: hop-size keyboard/touch range changed`);
      } else {
        const radios = Array.from(container.querySelectorAll<HTMLButtonElement>("button[role='radio']"));
        const expected = new Set<number>([widget.start]);
        for (let k = 1; widget.start + k * widget.hop <= widget.max; k++) expected.add(widget.start + k * widget.hop);
        for (let k = 1; widget.start - k * widget.hop >= widget.min; k++) expected.add(widget.start - k * widget.hop);
        for (const common of widget.commonLandings) if (common.value >= widget.min && common.value <= widget.max) expected.add(common.value);
        if (radios.length !== expected.size || radios.some((radio) => !radio.className.includes("min-h-11") || !radio.className.includes("min-w-11"))) defects.push(`${where}: stable radio/touch choices changed`);
        if (svg.querySelectorAll("[data-testid='nlh-arc']").length !== widget.hops) defects.push(`${where}: expected ${widget.hops} hop arcs`);
      }
      if (JSON.stringify(widget) !== before) defects.push(`${where}: render mutated evaluator spec`);
      cleanup();
    }
    expect(defects).toEqual([]);
  }, 120_000);

  it("accepts contextual titles and upright unit-bearing axes without changing grading", () => {
    const placeBase = PLACES[0]!.widget;
    const place = WidgetSpec.parse({ ...placeBase, title: "Temperature change", axisLabel: "Temperature", unit: "°C" }) as Extract<TWidget, { type: "numberLinePlace" }>;
    const onPlace = vi.fn();
    const placeView = render(<WidgetRenderer spec={place} value={place.start} onChange={onPlace} disabled={false} />);
    expect(placeView.container.textContent).toContain("Temperature change");
    expect(placeView.container.textContent).toContain("Temperature (°C)");
    fireEvent.change(placeView.container.querySelector("input[type='range']")!, { target: { value: String(place.target) } });
    expect(onPlace).toHaveBeenLastCalledWith(place.target);
    cleanup();

    const hopBase = HOPS.find(({ widget }) => widget.hopSizeTargets === undefined)!.widget;
    const hop = WidgetSpec.parse({ ...hopBase, title: "Trail distance", axisLabel: "Distance", unit: "km" }) as Extract<TWidget, { type: "numberLineHop" }>;
    const onHop = vi.fn();
    const hopView = render(<WidgetRenderer spec={hop} value={null} onChange={onHop} disabled={false} />);
    expect(hopView.container.textContent).toContain("Trail distance");
    expect(hopView.container.textContent).toContain("Distance (km)");
    fireEvent.click(hopView.getByRole("radio", { name: `Land on ${label(hop.start, hop.denom)}` }));
    expect(onHop).toHaveBeenLastCalledWith(hop.start);
    expect(place.target).toBe(placeBase.target);
    expect(hop.hop).toBe(hopBase.hop);
    expect(hop.hops).toBe(hopBase.hops);
  });

  it("rejects caret-bearing display metadata at the schema boundary", () => {
    expect(WidgetSpec.safeParse({ ...PLACES[0]!.widget, title: "x^2 positions" }).success).toBe(false);
    expect(WidgetSpec.safeParse({ ...HOPS[0]!.widget, axisLabel: "10^2 steps" }).success).toBe(false);
  });
});
