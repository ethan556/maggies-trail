// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, dotPlotLabel, type TWidget } from "@/lib/schema";

type Case = { where: string; spec: TWidget };

function authored(types: ReadonlySet<string>): Case[] {
  const out: Case[] = [];
  const courses = join(process.cwd(), "content", "courses");
  for (const course of readdirSync(courses)) {
    const lessons = join(courses, course, "lessons");
    if (!existsSync(lessons)) continue;
    for (const file of readdirSync(lessons)) {
      if (!file.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(lessons, file), "utf8")) as {
        id: string;
        steps?: Array<{ id: string; widget?: unknown }>;
        remedials?: Array<{ concept?: { id: string; widget?: unknown }; check?: { id: string; widget?: unknown } }>;
      };
      const steps = [
        ...(lesson.steps ?? []),
        ...(lesson.remedials ?? []).flatMap((remedial) => [remedial.concept, remedial.check]).filter(Boolean),
      ] as Array<{ id: string; widget?: unknown }>;
      for (const step of steps) {
        const parsed = WidgetSpec.safeParse(step.widget);
        if (parsed.success && types.has(parsed.data.type)) out.push({ where: `${lesson.id}/${step.id}`, spec: parsed.data });
      }
    }
  }
  return out;
}

const TYPES = new Set(["graphRead", "barBuilder", "dotPlot", "boxPlot"]);
const CASES = authored(TYPES);
const byType = <K extends TWidget["type"]>(type: K) =>
  CASES.filter((entry): entry is { where: string; spec: Extract<TWidget, { type: K }> } => entry.spec.type === type);

function draw(spec: TWidget, value: unknown) {
  return render(<WidgetRenderer spec={spec} value={value as never} onChange={vi.fn()} disabled={false} tone="neutral" />);
}

afterEach(cleanup);

describe("S249 shared statistical-display conventions", () => {
  it("covers every live authored and remedial consumer", () => {
    expect(CASES.length).toBeGreaterThan(0);
    expect(byType("graphRead").length).toBeGreaterThan(0);
    expect(byType("barBuilder").length).toBeGreaterThan(0);
    expect(byType("dotPlot").length).toBeGreaterThan(0);
    expect(byType("boxPlot").length).toBeGreaterThan(0);
  });

  it("renders every bar-mode graphRead with scaled tick truth, tick strokes, a title, and data/ARIA parity", () => {
    const bars = byType("graphRead").filter(({ spec }) => spec.mode === "bar");
    expect(bars.length).toBeGreaterThan(0);
    for (const { where, spec } of bars) {
      const view = draw(spec, { picked: spec.drawn * spec.unitValue });
      const svg = view.container.querySelector("svg[role='img']")!;
      const expectedTicks = Math.ceil(spec.scaleMax / spec.unitValue) + 1;
      expect(svg.querySelectorAll("[data-testid='gread-grid']"), where).toHaveLength(expectedTicks);
      expect(svg.querySelectorAll("[data-testid='gread-tick']"), where).toHaveLength(expectedTicks);
      const name = svg.getAttribute("aria-label") ?? "";
      expect(name, where).toContain(`${spec.categoryLabel} reaches ${spec.drawn * spec.unitValue}`);
      expect(name, where).toContain(spec.valueAxisLabel ?? `Number of ${spec.unitNounPlural}`);
      cleanup();
    }
  });

  it("supports scaled graphRead bars instead of printing gridline indices", () => {
    const spec = WidgetSpec.parse({
      type: "graphRead", prompt: "Read the scaled bar.", mode: "bar", drawn: 3, unitValue: 5,
      categoryLabel: "Tuesday", unitNoun: "book", unitNounPlural: "books", scaleMax: 20,
      title: "Books Read", valueAxisLabel: "Number of books", commonResults: [],
      fallbackFeedback: "Read the scale.", successFeedback: "Correct.",
    });
    const view = draw(spec, { picked: 15 });
    const svg = view.container.querySelector("svg[role='img']")!;
    const tickValues = Array.from(svg.querySelectorAll("[data-testid='gread-tick'] + text")).map((node) => node.textContent);
    expect(tickValues).toEqual(["0", "5", "10", "15", "20"]);
    expect(svg.getAttribute("aria-label")).toContain("Tuesday reaches 15 books");
  });

  it("renders a visible key for every picture-mode graphRead consumer", () => {
    const pictures = byType("graphRead").filter(({ spec }) => spec.mode === "picture");
    expect(pictures.length).toBeGreaterThan(0);
    for (const { where, spec } of pictures) {
      const view = draw(spec, { picked: spec.drawn * spec.unitValue });
      const key = view.container.querySelector("[data-testid='gread-key']");
      expect(key?.textContent, where).toContain(`= ${spec.unitValue}`);
      expect(key?.textContent, where).toContain(spec.unitValue === 1 ? spec.unitNoun : spec.unitNounPlural);
      cleanup();
    }
  });

  it("renders every vertical bar chart with a zero baseline, major ticks, ruled grid, titles, and current data in its name", () => {
    const charts = byType("barBuilder").filter(({ spec }) => spec.display === "bar");
    expect(charts.length).toBeGreaterThan(0);
    for (const { where, spec } of charts) {
      const view = draw(spec, spec.target);
      const svg = view.container.querySelector("svg[role='img']")!;
      expect(svg.querySelector("[data-testid='bb-title']"), where).toBeTruthy();
      expect(svg.querySelectorAll("[data-testid='bb-grid']").length, where).toBeGreaterThanOrEqual(3);
      expect(svg.querySelectorAll("[data-testid='bb-tick']").length, where).toBeGreaterThanOrEqual(3);
      expect(svg.textContent, where).toContain(spec.valueAxisLabel ?? "Frequency");
      expect(svg.textContent, where).toContain(spec.axisLabel ?? (spec.histogram ? "Value interval" : "Category"));
      const name = svg.getAttribute("aria-label") ?? "";
      for (let index = 0; index < spec.categories.length; index += 1) {
        expect(name, where).toContain(`${spec.categories[index]} ${spec.target[index]}`);
      }
      cleanup();
    }
  }, 30_000);

  it("renders a visible one-icon key for every barBuilder pictograph", () => {
    const pictures = byType("barBuilder").filter(({ spec }) => spec.display === "pictograph");
    expect(pictures.length).toBeGreaterThan(0);
    for (const { where, spec } of pictures) {
      const view = draw(spec, spec.target);
      expect(view.container.querySelector("[data-testid='bb-key']")?.textContent, where).toContain(`${spec.icon} = 1 count`);
      cleanup();
    }
  });

  it("renders the authored histogram as touching bins labelled at shared edges with a frequency axis", () => {
    const histograms = byType("barBuilder").filter(({ spec }) => spec.histogram);
    expect(histograms).toHaveLength(1);
    const { spec } = histograms[0];
    const view = draw(spec, spec.target);
    const svg = view.container.querySelector("svg[role='img']")!;
    const bars = Array.from(svg.querySelectorAll("rect.bb-bar"));
    expect(bars).toHaveLength(4);
    for (let index = 1; index < bars.length; index += 1) {
      const priorRight = Number(bars[index - 1].getAttribute("x")) + Number(bars[index - 1].getAttribute("width"));
      expect(Number(bars[index].getAttribute("x"))).toBeCloseTo(priorRight, 6);
      expect(bars[index].getAttribute("stroke")).toBe("none");
    }
    expect(Array.from(svg.querySelectorAll("[data-testid='hist-edge-tick'] + text")).map((node) => node.textContent)).toEqual(["0", "10", "20", "30", "40"]);
    expect(svg.textContent).toContain("Frequency");
  });

  it("renders every read/build dot plot on a ticked, ruled, titled number line with visible/ARIA-equivalent values", () => {
    const plots = byType("dotPlot");
    expect(plots.filter(({ spec }) => spec.given).length).toBeGreaterThan(0);
    expect(plots.filter(({ spec }) => !spec.given).length).toBeGreaterThan(0);
    for (const { where, spec } of plots) {
      const labels = spec.values.map((value) => dotPlotLabel(value, spec.denominator));
      if (spec.given) {
        const view = draw(spec, spec.given.map(() => 0));
        const group = view.container.querySelector("[role='group']")!;
        expect(view.container.querySelectorAll("[data-testid='dpr-tick']"), where).toHaveLength(spec.values.length);
        expect(group.getAttribute("aria-label"), where).toContain(spec.axisLabel ?? "Value");
        labels.forEach((label) => expect(group.getAttribute("aria-label"), where).toContain(label));
      } else {
        const view = draw(spec, spec.target);
        const svg = view.container.querySelector("svg[role='img']")!;
        expect(svg.querySelectorAll("[data-testid='dp-grid']"), where).toHaveLength(spec.values.length);
        expect(svg.querySelectorAll("[data-testid='dp-tick']"), where).toHaveLength(spec.values.length);
        expect(svg.querySelectorAll("[data-testid='dp-arrow']"), where).toHaveLength(1);
        labels.forEach((label, index) => expect(svg.getAttribute("aria-label"), where).toContain(`${label} has ${spec.target[index]} dots`));
      }
      cleanup();
    }
  }, 30_000);

  it("renders every box plot above a real number line with five standard labelled landmarks and matching accessible text", () => {
    const plots = byType("boxPlot");
    for (const { where, spec } of plots) {
      const value = { min: spec.startMin, q1: spec.startQ1, med: spec.startMed, q3: spec.startQ3, max: spec.startMax };
      const view = draw(spec, value);
      const svg = view.container.querySelector("svg[role='img']")!;
      expect(svg.querySelectorAll("[data-testid='bp-grid']").length, where).toBeGreaterThanOrEqual(3);
      expect(svg.querySelectorAll("[data-testid='bp-tick']").length, where).toBeGreaterThanOrEqual(3);
      expect(svg.querySelectorAll("[data-testid='bp-landmark-label']"), where).toHaveLength(5);
      expect(svg.querySelector("[data-testid='bp-arrow']"), where).toBeTruthy();
      const name = svg.getAttribute("aria-label") ?? "";
      expect(name, where).toContain(`Minimum ${value.min}`);
      expect(name, where).toContain(`Q1 lower quartile ${value.q1}`);
      expect(name, where).toContain(`median ${value.med}`);
      expect(name, where).toContain(`Q3 upper quartile ${value.q3}`);
      expect(name, where).toContain(`maximum ${value.max}`);
      cleanup();
    }
  });
});
