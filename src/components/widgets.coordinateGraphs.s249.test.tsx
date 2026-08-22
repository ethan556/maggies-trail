// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

afterEach(cleanup);

type GraphType = "scatterFit" | "plotPoint";
type Case<T extends GraphType> = {
  where: string;
  widget: Extract<TWidget, { type: T }>;
};

function corpus<T extends GraphType>(type: T): Case<T>[] {
  const found: Case<T>[] = [];
  const root = join(process.cwd(), "content", "courses");
  for (const course of readdirSync(root)) {
    const lessons = join(root, course, "lessons");
    if (!existsSync(lessons)) continue;
    for (const file of readdirSync(lessons)) {
      if (!file.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(lessons, file), "utf8")) as {
        id: string;
        steps?: Array<{ id: string; widget?: unknown }>;
        remedials?: Array<{
          check?: { id: string; widget?: unknown };
          concept?: { id: string; widget?: unknown };
        }>;
      };
      const surfaces = [
        ...(lesson.steps ?? []),
        ...(lesson.remedials ?? []).flatMap((r) => [r.check, r.concept]).filter((s): s is NonNullable<typeof s> => Boolean(s))
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

const SCATTER = corpus("scatterFit");
const PLOT = corpus("plotPoint");
const fmt = (n: number) => String(Math.round(n * 100) / 100);

describe("S249 coordinate-graph packet reaches the complete authored/remedial authority", () => {
  it("pins the bounded 86-consumer portfolio", () => {
    // bivariate-statistics/bv-01-01/ch1 was converted from a plotPoint build to a
    // swapped-coordinate diagnosis MCQ (S316_LANEA_MIXED_REVISION_IMPLEMENTATION.md), so the
    // plotPoint corpus shrank by one; scatterFit is unaffected.
    // number-system/ns-04b-01 gained a new plotPoint challenge step `ch2` (double sign-flip,
    // (3,-1)->(-3,1)), documented in reports/closure/S329_QDIVERSITY_Q2.md; corpus re-pinned 72->73.
    expect(SCATTER.length, "scatterFit consumers").toBe(14);
    expect(PLOT.length, "plotPoint consumers").toBe(73);
    expect(SCATTER.length + PLOT.length).toBe(87);
  });
});

describe("S249 scatterFit graph conventions and visible/ARIA truth", () => {
  it("renders every cloud with graph paper, axes, scale endpoints, origin discipline, and data parity", () => {
    const defects: string[] = [];
    for (const { where, widget: w } of SCATTER) {
      const { container } = render(
        <WidgetRenderer spec={w} value={{ m: w.mStart, b: w.bStart }} onChange={() => {}} disabled={false} />
      );
      const svg = container.querySelector<SVGSVGElement>('svg[role="img"]');
      if (!svg) {
        defects.push(`${where}: missing accessible SVG`);
        cleanup();
        continue;
      }
      const title = w.title ?? "Scatter plot with line of fit";
      const xName = w.xAxisLabel ?? "x";
      const yName = w.yAxisLabel ?? "y";
      const visible = container.textContent ?? "";
      const spoken = svg.getAttribute("aria-label") ?? "";
      for (const testId of ["sf-minor-grid", "sf-major-grid", "sf-x-axis", "sf-y-axis", "sf-axis-arrows", "sf-ticks"])
        if (!svg.querySelector(`[data-testid='${testId}']`)) defects.push(`${where}: missing ${testId}`);
      for (const end of [w.xMin, w.xMax, w.yMin, w.yMax])
        if (!Array.from(svg.querySelectorAll("text")).some((node) => node.textContent === fmt(end)))
          defects.push(`${where}: scale endpoint ${end} is not visible`);
      const zeroes = Array.from(svg.querySelectorAll("text")).filter((node) => node.textContent === "0").length;
      if (w.xMin <= 0 && w.xMax >= 0 && w.yMin <= 0 && w.yMax >= 0 && zeroes !== 1)
        defects.push(`${where}: origin printed ${zeroes} times`);
      for (const token of [title, xName, yName, fmt(w.xMin), fmt(w.xMax), fmt(w.yMin), fmt(w.yMax)])
        if (!spoken.includes(token)) defects.push(`${where}: accessible description omits ${JSON.stringify(token)}`);
      for (const [x, y] of w.points) {
        const point = `(${fmt(x)}, ${fmt(y)})`;
        if (!spoken.includes(point)) defects.push(`${where}: accessible description omits point (${x}, ${y})`);
        if (!visible.includes(point)) defects.push(`${where}: visible point inventory omits point (${x}, ${y})`);
      }
      if (!visible.includes(title) || visible.includes("^") || spoken.includes("^")) defects.push(`${where}: title/caret presentation failure`);
      cleanup();
    }
    expect(defects).toEqual([]);
  }, 60_000);

  it("accepts authored titles and unit-bearing axis names without changing evaluator fields", () => {
    const base = SCATTER[0]!.widget;
    const custom = WidgetSpec.parse({ ...base, title: "Seedling growth", xAxisLabel: "Time (days)", yAxisLabel: "Height (cm)" }) as Extract<TWidget, { type: "scatterFit" }>;
    const { container } = render(<WidgetRenderer spec={custom} value={{ m: base.mStart, b: base.bStart }} onChange={() => {}} disabled={false} />);
    const svg = container.querySelector('svg[role="img"]')!;
    expect(container.textContent).toContain("Seedling growth");
    expect(svg.textContent).toContain("Time (days)");
    expect(svg.textContent).toContain("Height (cm)");
    expect(svg.getAttribute("aria-label")).toContain("Height (cm)");
    expect(custom.points).toEqual(base.points);
    expect(custom.tolerance).toBe(base.tolerance);
  });
});

describe("S249 plotPoint graph conventions and stable interaction surface", () => {
  it("renders every target lattice with graph paper, axes, ticks, endpoints, captions, and unique cells", () => {
    const defects: string[] = [];
    for (const { where, widget: w } of PLOT) {
      const { container } = render(<WidgetRenderer spec={w} value={w.targets} onChange={() => {}} disabled={false} />);
      const paper = container.querySelector<SVGSVGElement>("[data-testid='pp-graph-paper']");
      const group = container.querySelector<HTMLElement>('[role="group"]');
      const buttons = Array.from(container.querySelectorAll<HTMLButtonElement>("button"));
      if (!paper || !group) {
        defects.push(`${where}: missing graph paper or accessible group`);
        cleanup();
        continue;
      }
      for (const testId of ["pp-minor-grid", "pp-major-grid", "pp-axes", "pp-axis-arrows"])
        if (!paper.querySelector(`[data-testid='${testId}']`)) defects.push(`${where}: missing ${testId}`);
      if (paper.getAttribute("viewBox") !== `0 0 ${w.cols} ${w.rows}`) defects.push(`${where}: non-responsive viewBox`);
      if (paper.getAttribute("preserveAspectRatio") !== "none") defects.push(`${where}: graph paper does not follow responsive tracks`);
      if (paper.querySelectorAll("[data-testid='pp-x-tick']").length !== w.cols) defects.push(`${where}: x tick count`);
      if (paper.querySelectorAll("[data-testid='pp-y-tick']").length !== w.rows) defects.push(`${where}: y tick count`);
      if (buttons.length !== w.cols * w.rows) defects.push(`${where}: evaluator button count changed`);
      const names = buttons.map((b) => b.getAttribute("aria-label") ?? "");
      if (new Set(names).size !== names.length || names.some((name) => !name)) defects.push(`${where}: cell names are not unique`);
      const spoken = group.getAttribute("aria-label") ?? "";
      const title = w.title ?? "Coordinate plotting grid";
      const xName = w.xAxisLabel ?? "x";
      const yName = w.yAxisLabel ?? "y";
      for (const token of [title, xName, yName, "Marked points:"])
        if (!spoken.includes(token)) defects.push(`${where}: accessible group omits ${JSON.stringify(token)}`);
      if (!(container.textContent ?? "").includes(title) || (container.textContent ?? "").includes("^") || spoken.includes("^"))
        defects.push(`${where}: title/caret presentation failure`);
      cleanup();
    }
    expect(defects).toEqual([]);
  }, 120_000);

  it("accepts authored titles and unit-bearing axes while preserving targets and cell coordinates", () => {
    const base = PLOT[0]!.widget;
    const custom = WidgetSpec.parse({ ...base, title: "Walking trail", xAxisLabel: "Time (min)", yAxisLabel: "Distance (m)" }) as Extract<TWidget, { type: "plotPoint" }>;
    const { container } = render(<WidgetRenderer spec={custom} value={base.targets} onChange={() => {}} disabled={false} />);
    expect(container.textContent).toContain("Walking trail");
    expect(container.textContent).toContain("Time (min)");
    expect(container.textContent).toContain("Distance (m)");
    expect(custom.targets).toEqual(base.targets);
    expect(container.querySelectorAll("button")).toHaveLength(base.cols * base.rows);
  });
});
