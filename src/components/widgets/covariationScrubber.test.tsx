// @vitest-environment jsdom
/**
 * covariationScrubber — behavior-preserving test for the module extracted from `widgets.tsx`
 * (formerly its lines 17899-17906; see this module's own header comment for the extraction
 * contract). Mirrors `widgets.numberLineRay.s215.test.tsx`'s discipline: nothing here reaches
 * through `widgets.tsx` — `CovariationScrubberW` is imported directly, so this suite stands on its
 * own regardless of how (or whether) the monolith's dispatch wires it in.
 *
 * The dispatch itself (that `WidgetRenderer` still renders this engine correctly for
 * `spec.type === "covariationScrubber"`) is exercised by the pre-existing, untouched suites that
 * mount it through `WidgetRenderer`: `widgets.drag.test.tsx` ("covariationScrubber drag"),
 * `widgets.keyboard.test.tsx`, `widgets.axisCaptions.s237.test.tsx`, `engineCapabilities.test.ts`,
 * `session128.reuse.test.ts`, and `lengthCompare.difference.s119.test.tsx`'s window-math
 * regression — none of them changed by this extraction, and all of them still pass, which is the
 * strongest behavior-preservation evidence: the same dispatch line now resolves to an import
 * instead of a monolith-local function, and every consumer is none the wiser.
 */

import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useState } from "react";
import { CovariationScrubberW } from "./covariationScrubber";
import { SAMPLES } from "../widgetSamples";
import { CovariationScrubberSpec, WidgetSpec, type TCovariationScrubber } from "@/lib/schema";
import { canCheck, evaluate } from "@/lib/evaluate";
import { moveRelation, type ProcessEvent } from "@/lib/processEvents";
import { gridScales } from "@/components/plotUtils";

afterEach(cleanup);

/* ── fixtures ─────────────────────────────────────────────────────────────────────────────────── */

const RAW: TCovariationScrubber = CovariationScrubberSpec.parse({
  type: "covariationScrubber",
  prompt: "Move the input until the output is 11.",
  a: 2,
  b: 3,
  inputMin: 0,
  inputMax: 8,
  inputStart: 0,
  targetInput: 4,
  inputLabel: "hours",
  outputLabel: "miles",
  contextTemplate: "At {x} hours, the trip covers {y} miles.",
  successFeedback: "At 4 hours, 11 miles — the rate holds everywhere.",
  lowFeedback: "Increase the input.",
  highFeedback: "Decrease the input."
});

const SAMPLE = WidgetSpec.parse(
  (SAMPLES as Array<{ type?: string }>).find((s) => s?.type === "covariationScrubber")!
) as TCovariationScrubber;

/** Same domain→pixel map the engine draws with (W=340,H=220,pad=24; G/yMax mirror the widget's own
 * `Math.max(6, …)` floors) — used only to compute EXPECTED coordinates independently of the
 * component render, the same role `gridScales` plays in the widget itself. `gridScales` has its own
 * dedicated suite (`plotUtils.test.ts`); reusing it here tests this engine's WIRING of it, not its
 * arithmetic. */
function expectedPoint(spec: TCovariationScrubber, x: number) {
  const G = Math.max(6, spec.inputMax);
  const yMax = Math.max(6, spec.a * G + spec.b);
  const { sx, sy } = gridScales({ xMin: 0, xMax: G, yMin: 0, yMax, W: 340, H: 220, pad: 24 });
  return { cx: sx(x), cy: sy(spec.a * x + spec.b) };
}

/** Mount with real state, so an edit round-trips through `value` exactly as the player drives it. */
function mount(spec: TCovariationScrubber = RAW, opts: { disabled?: boolean } = {}) {
  const seen: unknown[] = [];
  const events: ProcessEvent[] = [];
  const Host = () => {
    const [v, setV] = useState<unknown>(null);
    return (
      <CovariationScrubberW
        spec={spec}
        value={v}
        onChange={(next) => {
          seen.push(next);
          setV(next);
        }}
        disabled={opts.disabled ?? false}
        onEvent={(e) => events.push(e)}
      />
    );
  };
  const utils = render(<Host />);
  return { ...utils, seen, events, latest: () => seen[seen.length - 1] };
}

function pinRect(svg: SVGSVGElement, w: number, h: number) {
  svg.getBoundingClientRect = () =>
    ({ left: 0, top: 0, x: 0, y: 0, width: w, height: h, right: w, bottom: h, toJSON: () => ({}) }) as DOMRect;
}

const slider = () => screen.getByRole("slider") as HTMLInputElement;
const graphSvg = () => screen.getByTestId("cvs-drag").closest("svg") as SVGSVGElement;
const point = () => graphSvg().querySelector("circle") as SVGCircleElement;

/* ── console.error trap (this path is not on vitest.setup's opt-in list, so it is set here) ────── */

let consoleErrors: string[] = [];
beforeEach(() => {
  consoleErrors = [];
  vi.spyOn(console, "error").mockImplementation((...args: unknown[]) => {
    consoleErrors.push(args.map(String).join(" "));
  });
});
afterEach(() => {
  const errs = consoleErrors;
  consoleErrors = [];
  vi.restoreAllMocks();
  expect(errs, `unexpected console.error:\n${errs.join("\n")}`).toEqual([]);
});

/* ── the suite ────────────────────────────────────────────────────────────────────────────────── */

describe("covariationScrubber — one input, every representation in lockstep", () => {
  it("mounts at inputStart and reports it upward, without waiting for a move", () => {
    const { latest } = mount();
    expect(latest()).toBe(0);
  });

  it("every representation names the same pair the props declare at mount", () => {
    mount();
    expect(screen.getByText("Move the input until the output is 11.")).toBeTruthy();
    // context sentence: {x}->0, {y}->2*0+3=3
    expect(screen.getByText("At 0 hours, the trip covers 3 miles.")).toBeTruthy();
    // table: headers use the authored labels, not hardcoded x/y
    const table = screen.getByRole("table");
    expect(within(table).getByText("hours")).toBeTruthy();
    expect(within(table).getByText("miles")).toBeTruthy();
    // equation / unit rate / current pair readouts. "unit rate"'s value ("2") is queried by its
    // label's sibling rather than screen.getByText("2") — the table's input=2 row also renders a
    // bare "2" cell, so a plain text query would (correctly) throw on multiple matches.
    expect(screen.getByText("y=2x+3")).toBeTruthy();
    expect(screen.getByText("unit rate").nextElementSibling?.textContent).toBe("2");
    expect(screen.getByText("(0, 3)")).toBeTruthy();
    // the graph's accessible name states the same claim independently
    expect(graphSvg().getAttribute("aria-label")).toBe("Graph of y equals 2 x plus 3, current point 0, 3.");
    // axis captions carry the authored labels, not the generic x/y default
    const captions = screen.getByTestId("axis-captions");
    expect(within(captions).getByText("hours")).toBeTruthy();
    expect(within(captions).getByText("miles")).toBeTruthy();
  });

  it("the table window holds 5 DISTINCT rows and highlights the current one (S119)", () => {
    mount();
    const table = screen.getByRole("table");
    const dataRows = within(table).getAllByRole("row").slice(1); // drop the header row
    expect(dataRows).toHaveLength(5);
    const cells = dataRows.map((r) => within(r).getAllByRole("cell").map((c) => c.textContent));
    const inputs = cells.map((c) => c[0]);
    expect(new Set(inputs).size).toBe(5); // no duplicate input, even this close to inputMin=0
    expect(inputs).toEqual(["0", "1", "2", "3", "4"]);
    expect(cells.map((c) => c[1])).toEqual(["3", "5", "7", "9", "11"]); // 2x+3 for each
    // the row for the current input (0) is visually distinguished from the rest
    expect(dataRows[0].className).toContain("font-black");
    expect(dataRows[1].className).not.toContain("font-black");
  });

  it("the graph point sits exactly where the shared scale puts (x, ax+b)", () => {
    mount();
    const { cx, cy } = expectedPoint(RAW, 0);
    expect(Number(point().getAttribute("cx"))).toBeCloseTo(cx, 5);
    expect(Number(point().getAttribute("cy"))).toBeCloseTo(cy, 5);
  });

  it("moving the slider moves every representation together, including the graph point", () => {
    const { latest } = mount();
    fireEvent.change(slider(), { target: { value: "2" } });
    expect(latest()).toBe(2);
    expect(screen.getByText("At 2 hours, the trip covers 7 miles.")).toBeTruthy();
    expect(screen.getByText("(2, 7)")).toBeTruthy();
    const { cx, cy } = expectedPoint(RAW, 2);
    expect(Number(point().getAttribute("cx"))).toBeCloseTo(cx, 5);
    expect(Number(point().getAttribute("cy"))).toBeCloseTo(cy, 5);
  });

  it("the current-pair readout only turns 'good' at the exact target input", () => {
    mount();
    const currentPairValue = () => screen.getByText(/^\(\d+, \d+\)$/).parentElement as HTMLElement;
    expect(currentPairValue().className).not.toContain("leaf");
    fireEvent.change(slider(), { target: { value: "4" } }); // targetInput
    expect(screen.getByText("(4, 11)").parentElement?.className).toContain("leaf");
  });
});

describe("covariationScrubber — process events match moveRelation's own contract", () => {
  it("a move strictly closer to the target reports 'toward', tagged efficient", () => {
    const { events } = mount();
    fireEvent.change(slider(), { target: { value: "2" } }); // 0 -> 2, target 4
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ control: "input", dir: moveRelation(0, 2, 4), kind: "efficient" });
    expect(events[0].dir).toBe("toward");
  });

  it("a move strictly farther from the target reports 'away'", () => {
    const { events } = mount();
    fireEvent.change(slider(), { target: { value: "2" } }); // 0 -> 2 (toward)
    fireEvent.change(slider(), { target: { value: "1" } }); // 2 -> 1 (away)
    expect(events).toHaveLength(2);
    expect(events[1]).toEqual({ control: "input", dir: "away", kind: "efficient" });
  });

  it("a move that crosses the target reports 'past'", () => {
    const { events } = mount();
    fireEvent.change(slider(), { target: { value: "2" } }); // 0 -> 2
    fireEvent.change(slider(), { target: { value: "6" } }); // 2 -> 6, crossing 4
    expect(events).toHaveLength(2);
    expect(events[1]).toEqual({ control: "input", dir: "past", kind: "efficient" });
  });

  it("arriving exactly at the target is treated as success, not process evidence", () => {
    const { events, latest } = mount();
    fireEvent.change(slider(), { target: { value: "4" } }); // 0 -> 4 == targetInput
    expect(latest()).toBe(4);
    expect(events).toHaveLength(0);
  });
});

describe("covariationScrubber — direct manipulation on the graph", () => {
  it("a press on the graph pulls the shared input to the integer under the pointer", () => {
    const { latest } = mount();
    pinRect(graphSvg(), 340, 220);
    // pad=24, G=max(6,8)=8, usable 292px; x=4 sits at 24 + (4/8)*292 = 170
    fireEvent.pointerDown(screen.getByTestId("cvs-drag"), { clientX: 170, clientY: 100, pointerId: 1 });
    expect(latest()).toBe(4);
  });

  it("the slider (keyboard-parity path) survives; the drag surface disappears when disabled", () => {
    mount(RAW, { disabled: true });
    expect(screen.getByRole("slider")).toBeTruthy();
    expect(screen.queryByTestId("cvs-drag")).toBeNull();
    expect(slider().disabled).toBe(true);
  });
});

describe("covariationScrubber — stays compatible with the shared evaluator", () => {
  it("evaluate() grades the bare number value exactly as the widget emits it", () => {
    expect(evaluate(RAW, 4)).toEqual({ correct: true, feedback: RAW.successFeedback });
    expect(evaluate(RAW, 2)).toEqual({ correct: false, feedback: RAW.lowFeedback });
    expect(evaluate(RAW, 6)).toEqual({ correct: false, feedback: RAW.highFeedback });
    expect(evaluate(RAW, null).correct).toBe(false);
  });

  it("canCheck() is false before any value exists and true for whatever the widget emits", () => {
    expect(canCheck(RAW, null)).toBe(false);
    expect(canCheck(RAW, undefined)).toBe(false);
    const { latest } = mount();
    expect(canCheck(RAW, latest())).toBe(true);
  });
});

describe("covariationScrubber — the shipped sample renders cleanly", () => {
  it("parses and mounts the authored widgetSamples.ts entry without warnings", () => {
    mount(SAMPLE);
    expect(screen.getByText(SAMPLE.prompt)).toBeTruthy();
    expect(
      screen.getByText(
        SAMPLE.contextTemplate.replace("{x}", String(SAMPLE.inputStart)).replace("{y}", String(SAMPLE.a * SAMPLE.inputStart + SAMPLE.b))
      )
    ).toBeTruthy();
  });
});
