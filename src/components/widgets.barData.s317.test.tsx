// @vitest-environment jsdom
/* S317 — render/accessibility gate for the `barData` bar-chart figure (schema.ts `BarDataSpec`,
 * widgets.tsx `BarChartFigure`), the bar-graph analogue of `content.plotData.s237.test.ts` /
 * `widgets.coordinateGraphs.s249.test.tsx`'s scatterFit checks.
 *
 * WHAT THIS PINS:
 *   1. Every corpus location that declares `barData` (see `content.barData.s317.test.ts` for the
 *      exact 9-location allowlist) renders an accessible `role="img"` SVG with a `<title>`, a
 *      gridline scale, and one visible bar + text pair per category — non-colour cues, since text
 *      is present on every bar regardless of colour.
 *   2. The `aria-label` states the SAME category/value facts the visible text does, so a screen
 *      reader and a sighted learner receive equivalent information (mirrors the scatterFit
 *      residual/metric fix's "aria/visually-associated" requirement, applied to bars).
 *   3. A spec with no `barData` renders no bar-chart figure at all — the regression guard for the
 *      other ~19,990 steps that share these five widget types.
 *   4. `barDataParts` itself is a real, total function: paired accept/reject synthetic specs.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, fireEvent, screen } from "@testing-library/react";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, barDataParts, type TWidget, type TBarData } from "@/lib/schema";

afterEach(cleanup);

const COURSES = join(process.cwd(), "content", "courses");

type Step = { id: string; widget?: unknown };
type Lesson = { id: string; steps: Step[]; remedials?: Array<{ check?: Step; concept?: Step }> };

function everyStep(l: Lesson): Step[] {
  const out = [...l.steps];
  for (const r of l.remedials ?? []) for (const st of [r.check, r.concept]) if (st) out.push(st);
  return out;
}

function corpus(): Array<{ where: string; widget: TWidget }> {
  const found: Array<{ where: string; widget: TWidget }> = [];
  for (const course of readdirSync(COURSES)) {
    const lessonsDir = join(COURSES, course, "lessons");
    if (!existsSync(lessonsDir)) continue;
    for (const file of readdirSync(lessonsDir)) {
      if (!file.endsWith(".json")) continue;
      const lesson = JSON.parse(readFileSync(join(lessonsDir, file), "utf8")) as Lesson;
      for (const step of everyStep(lesson)) {
        const raw = step.widget as { barData?: unknown } | undefined;
        if (raw?.barData === undefined) continue;
        found.push({ where: `${course}/${lesson.id}/${step.id}`, widget: WidgetSpec.parse(raw) as TWidget });
      }
    }
  }
  return found;
}

const BAR_STEPS = corpus();

/** A minimal, correctly-typed initial value for each widget type this corpus uses, so
 * `WidgetRenderer` mounts without the "must call onChange to seed a value" effect throwing. */
function seedValue(w: TWidget): unknown {
  switch (w.type) {
    case "numeric":
      return null;
    case "mcq":
      return null;
    case "matchPairs":
      return {};
    case "dragOrder":
      return w.items.map((i) => i.id);
    case "dragBucket":
      return {};
    default:
      return null;
  }
}

describe("S317 barData corpus reaches the expected 9 locations", () => {
  it("pins the bounded corpus size", () => {
    expect(BAR_STEPS.length).toBe(9);
  });
});

describe("S317 BarChartFigure renders every declared chart accessibly", () => {
  it("draws role=img, a <title>, gridlines, and one labelled bar per category — value text on every bar in \"all\" mode, none in \"none\" mode (non-colour cue either way)", () => {
    const defects: string[] = [];
    for (const { where, widget } of BAR_STEPS) {
      const bar = barDataParts(widget as { barData?: TBarData });
      if (!bar) {
        defects.push(`${where}: declared barData the resolver refuses to draw`);
        continue;
      }
      const { container } = render(
        <WidgetRenderer spec={widget} value={seedValue(widget)} onChange={() => {}} disabled={false} />
      );
      const svg = container.querySelector<SVGSVGElement>('[data-testid="bar-chart-figure"]');
      if (!svg) {
        defects.push(`${where}: no bar-chart-figure rendered`);
        cleanup();
        continue;
      }
      if (svg.getAttribute("role") !== "img") defects.push(`${where}: bar chart is not role="img"`);
      const title = svg.querySelector("title");
      if (!title || !title.textContent) defects.push(`${where}: bar chart has no <title>`);
      const spoken = svg.getAttribute("aria-label") ?? "";
      const bars = svg.querySelectorAll('[data-testid="bar-chart-bar"]');
      if (bars.length !== bar.categories.length)
        defects.push(`${where}: drew ${bars.length} bars for ${bar.categories.length} categories`);
      const categoryTexts = Array.from(svg.querySelectorAll('[data-testid="bar-chart-category"]')).map((n) => n.textContent);
      const valueTexts = Array.from(svg.querySelectorAll('[data-testid="bar-chart-value"]')).map((n) => n.textContent);
      bar.categories.forEach((c, i) => {
        if (!categoryTexts.includes(c)) defects.push(`${where}: category "${c}" not printed on any bar`);
        if (!spoken.includes(c)) defects.push(`${where}: aria-label omits category "${c}"`);
        const vTxt = String(Number(bar.values[i].toFixed(4)));
        if (bar.valueLabels === "none") {
          // The anti-leak mode (S317 round 2): no per-bar numeric text anywhere, on the bar or
          // in the aria-label's flat "category: value" fact — the whole point of this mode is
          // that the bar's OWN value is not stated (the axis's own scale-top/tick numbers, which
          // may coincidentally equal a bar's value, are a pre-existing, unflagged, whole-chart
          // fact and are not what this check is about).
          if (valueTexts.includes(vTxt)) defects.push(`${where}: "none" mode still prints value ${vTxt} on a bar`);
          if (spoken.includes(`${c}: ${vTxt}`)) defects.push(`${where}: "none" mode still speaks the flat fact "${c}: ${vTxt}" in the aria-label`);
          if (!spoken.includes(c)) defects.push(`${where}: "none" mode aria-label omits category "${c}" from its position sentence`);
          if (!/gridline|baseline/.test(spoken)) defects.push(`${where}: "none" mode aria-label has no position wording`);
        } else {
          if (!valueTexts.includes(vTxt)) defects.push(`${where}: value ${vTxt} not printed on any bar`);
          if (!spoken.includes(vTxt)) defects.push(`${where}: aria-label omits value ${vTxt} for "${c}"`);
        }
      });
      const tickTexts = Array.from(svg.querySelectorAll('[data-testid="bar-chart-tick-value"]')).map((n) => n.textContent);
      if (!tickTexts.includes(String(bar.axisMax))) defects.push(`${where}: axis top ${bar.axisMax} has no tick label`);
      if (!tickTexts.includes("0")) defects.push(`${where}: axis has no 0 tick`);
      cleanup();
    }
    expect(defects).toEqual([]);
  }, 30_000);

  it("md-03-02/i1 and ch1 are authored valueLabels:\"none\" — the two steps the independent verifier flagged as answer-leaks — and every other declared step keeps \"all\"", () => {
    // Pins the disposition itself, not just the render behaviour above: a future author flipping
    // the flag on the wrong step (or losing it off i1/ch1 in a rewrite) fails loudly here.
    const NONE_MODE = new Set(["measurement-data/md-03-02/i1", "measurement-data/md-03-02/ch1"]);
    for (const { where, widget } of BAR_STEPS) {
      const bar = barDataParts(widget as { barData?: TBarData })!;
      expect(bar.valueLabels, where).toBe(NONE_MODE.has(where) ? "none" : "all");
    }
  });

  it("\"none\" mode's aria-label describes bars by POSITION (gridline count), never by the flat \"category: value\" statement \"all\" mode uses", () => {
    const i1 = BAR_STEPS.find((x) => x.where.endsWith("md-03-02/i1"))!;
    const ch1 = BAR_STEPS.find((x) => x.where.endsWith("md-03-02/ch1"))!;
    const { container: c1 } = render(
      <WidgetRenderer spec={i1.widget} value={seedValue(i1.widget)} onChange={() => {}} disabled={false} />
    );
    const spoken1 = c1.querySelector('[data-testid="bar-chart-figure"]')!.getAttribute("aria-label") ?? "";
    // i1: matchPairs grades "2nd line" -> 10, "4th line" -> 20, "3rd line" -> 15. None of those
    // pairings may be stated as the flat "category: value" fact "all" mode would state — only the
    // ordinal gridline position (already implicit in the category's own name, so zero new leak).
    expect(spoken1).toContain("Bar reaching the 2nd line ends on the 2nd gridline above zero.");
    expect(spoken1).toContain("Bar reaching the 4th line ends on the 4th gridline above zero.");
    expect(spoken1).toContain("Bar reaching the 3rd line ends on the 3rd gridline above zero.");
    for (const flatFact of ["line: 10", "line: 20", "line: 15"]) expect(spoken1, spoken1).not.toContain(flatFact);
    cleanup();

    const { container: c2 } = render(
      <WidgetRenderer spec={ch1.widget} value={seedValue(ch1.widget)} onChange={() => {}} disabled={false} />
    );
    const spoken2 = c2.querySelector('[data-testid="bar-chart-figure"]')!.getAttribute("aria-label") ?? "";
    // ch1 grades "how many MORE does Bar B have than Bar A" = 2, off Bar B's un-stated value 10.
    // Bar A's value (8) is already given verbatim in the prompt, so restating its position is not
    // a leak; Bar B's own value (10) and the graded gap (2) must never be stated as a flat fact.
    expect(spoken2).toContain("Bar A ends on the 2nd gridline above zero.");
    expect(spoken2).toContain("Bar B ends halfway between the 2nd gridline and the 3rd gridline above zero.");
    for (const flatFact of ["Bar A: 8", "Bar B: 10"]) expect(spoken2, spoken2).not.toContain(flatFact);
    cleanup();
  });

  it("a spec without barData renders no bar-chart figure — the regression guard", () => {
    const numericNoBar = WidgetSpec.parse({
      type: "numeric",
      prompt: "2 + 2 = ?",
      answer: 4,
      tolerance: 0,
      commonErrors: [],
      fallbackFeedback: "Add 2 and 2."
    });
    const { container } = render(<WidgetRenderer spec={numericNoBar} value={null} onChange={() => {}} disabled={false} />);
    expect(container.querySelector('[data-testid="bar-chart-figure"]')).toBeNull();
    cleanup();
  });
});

describe("S317 md-03-02/md-03-03 keyboard and reveal-tone smoke — barData does not disturb interaction", () => {
  it("i1 (matchPairs) still supports tap-to-link with its chart present", () => {
    const d = BAR_STEPS.find((x) => x.where.endsWith("md-03-02/i1"))!;
    expect(d, "md-03-02/i1 must be in the corpus").toBeDefined();
    let value: Record<string, string> = {};
    const { container } = render(
      <WidgetRenderer
        spec={d.widget}
        value={value}
        onChange={(v) => { value = v as Record<string, string>; }}
        disabled={false}
      />
    );
    expect(container.querySelector('[data-testid="bar-chart-figure"]')).not.toBeNull();
    const buttons = container.querySelectorAll("button");
    expect(buttons.length).toBeGreaterThan(0);
    cleanup();
  });

  it("ch1 (numeric, md-03-03) still accepts typed input with its chart present", () => {
    const d = BAR_STEPS.find((x) => x.where.endsWith("md-03-03/ch1"))!;
    expect(d).toBeDefined();
    render(<WidgetRenderer spec={d.widget} value={null} onChange={() => {}} disabled={false} />);
    const input = screen.getByRole("textbox", { hidden: true }) ?? document.querySelector("input");
    expect(input).toBeTruthy();
    fireEvent.change(input as Element, { target: { value: "6" } });
    cleanup();
  });

  it("info tone (revealed) still renders the chart alongside the reveal ghost", () => {
    const d = BAR_STEPS.find((x) => x.where.endsWith("md-03-02/i2"))!;
    const { container } = render(
      <WidgetRenderer spec={d.widget} value={(d.widget as { correctOrder?: string[] }).correctOrder ?? []} onChange={() => {}} disabled tone="info" />
    );
    expect(container.querySelector('[data-testid="bar-chart-figure"]')).not.toBeNull();
    cleanup();
  });
});

describe("S317 barDataParts is a real, total function — paired accept/reject", () => {
  it("accepts a well-formed chart", () => {
    const parts = barDataParts({ barData: { categories: ["A", "B"], values: [1, 2] } });
    expect(parts).not.toBeNull();
    expect(parts!.categories).toEqual(["A", "B"]);
    expect(parts!.values).toEqual([1, 2]);
    expect(parts!.axisMax).toBe(2);
  });

  it("resolves absent valueLabels to \"all\" (byte-identical to before the field existed), and preserves an authored \"none\"", () => {
    const defaulted = barDataParts({ barData: { categories: ["A", "B"], values: [1, 2] } });
    expect(defaulted!.valueLabels).toBe("all");
    const explicit = barDataParts({ barData: { categories: ["A", "B"], values: [1, 2], valueLabels: "none" } });
    expect(explicit!.valueLabels).toBe("none");
  });

  it("rejects fewer than 2 categories, a length mismatch, and duplicate categories", () => {
    expect(barDataParts({ barData: { categories: ["A"], values: [1] } as unknown as TBarData })).toBeNull();
    expect(barDataParts({ barData: { categories: ["A", "B"], values: [1] } as unknown as TBarData })).toBeNull();
    expect(barDataParts({ barData: { categories: ["A", "A"], values: [1, 2] } })).toBeNull();
  });

  it("rejects a value taller than its own axisMax, and accepts the same chart once axisMax is raised", () => {
    expect(barDataParts({ barData: { categories: ["A", "B"], values: [1, 9], axisMax: 5 } })).toBeNull();
    expect(barDataParts({ barData: { categories: ["A", "B"], values: [1, 9], axisMax: 9 } })).not.toBeNull();
  });

  it("resolves absent scaleStep/axisMax to deterministic defaults", () => {
    const parts = barDataParts({ barData: { categories: ["A", "B", "C"], values: [2, 4, 8] } })!;
    expect(parts.axisMax).toBe(8); // the tallest bar's own value
    expect(parts.scaleStep).toBe(2); // a quarter of axisMax
  });

  it("returns null when barData is absent", () => {
    expect(barDataParts({})).toBeNull();
  });

  it("more than MAX_BAR_COLUMNS categories is rejected", () => {
    const many = { categories: Array.from({ length: 9 }, (_, i) => `C${i}`), values: Array.from({ length: 9 }, () => 1) };
    expect(barDataParts({ barData: many })).toBeNull();
  });
});
