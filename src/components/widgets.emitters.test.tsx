// @vitest-environment jsdom
/**
 * PROCESS-EMITTER CONTRACT, per engine. Each instrumented widget must emit
 * {control, dir} events that are TRUE about its own mathematics:
 *
 *  - numberLineHop: taps measured against the real landing (start ± hop·hops)
 *  - percentBar / estimateSlider: 1-D moves vs the authored target
 *  - lineExplore: PER-CONTROL vs each parameter's own target component
 *  - scatterFit: vs the mean-squared miss (no per-param target exists; "past"
 *    cannot occur for a squared error)
 *
 * Fixtures pass through WidgetSpec.parse (house rule: schema defaults are real).
 */
import { describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";
import type { ProcessEvent } from "@/lib/processEvents";

function mount(raw: unknown) {
  const spec = WidgetSpec.parse(raw) as TWidget;
  const events: ProcessEvent[] = [];
  const onEvent = vi.fn((e: ProcessEvent) => events.push(e));
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return <WidgetRenderer spec={spec} value={value} onChange={setValue} disabled={false} onEvent={onEvent} />;
  }
  render(<Host />);
  return { events };
}

describe("process emitters", () => {
  it("numberLineHop: a tap on the wrong side of the landing reads as away; the landing itself is silent", () => {
    cleanup();
    const { events } = mount({
      type: "numberLineHop",
      prompt: "Start at 2 and hop forward 3 times by 1.",
      min: 0,
      max: 8,
      start: 2,
      hop: 1,
      hops: 3,
      direction: "forward",
      missFeedback: "Count each hop from the start mark.",
      successFeedback: "Three hops forward from 2 lands on 5."
    }); // landing = 5
    fireEvent.click(screen.getByRole("radio", { name: "Land on 1" })); // away (from 2 toward 1)
    fireEvent.click(screen.getByRole("radio", { name: "Land on 4" })); // toward
    fireEvent.click(screen.getByRole("radio", { name: "Land on 5" })); // exact landing → silent
    expect(events.map((e) => e.dir)).toEqual(["away", "toward"]);
    expect(events.every((e) => e.control === "landing")).toBe(true);
  });

  it("percentBar: slider moves measure against targetPercent, including crossing as past", () => {
    cleanup();
    const { events } = mount({
      type: "percentBar",
      prompt: "Shade 40% of the bar.",
      whole: 200,
      targetPercent: 40,
      startPercent: 0,
      successFeedback: "40% of 200 is 80.",
      lowFeedback: "Not enough of the bar is shaded yet.",
      highFeedback: "Too much of the bar is shaded."
    });
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "20" } }); // toward
    fireEvent.change(slider, { target: { value: "70" } }); // past (crossed 40)
    fireEvent.change(slider, { target: { value: "90" } }); // away
    expect(events.map((e) => e.dir)).toEqual(["toward", "past", "away"]);
  });

  it("estimateSlider: direction against the target survives the log scale", () => {
    cleanup();
    const { events } = mount({
      type: "estimateSlider",
      prompt: "About how many liters fill a bathtub?",
      min: 1,
      max: 10000,
      start: 10,
      target: 300,
      factor: 2,
      successFeedback: "A bathtub holds roughly 300 liters.",
      lowFeedback: "A bathtub holds more than that.",
      highFeedback: "That's more water than a bathtub holds."
    });
    const slider = screen.getByRole("slider");
    fireEvent.change(slider, { target: { value: "600" } }); // higher position → value closer to 300
    const first = events[0];
    expect(first.control).toBe("estimate");
    expect(["toward", "past"]).toContain(first.dir); // strictly nearer or crossed — never "away"
  });

  it("lineExplore: each slider emits against ITS OWN target component", () => {
    cleanup();
    const { events } = mount({
      type: "lineExplore",
      prompt: "Build y = 2x + 1.",
      targetSlope: 2,
      targetIntercept: 1,
      successFeedback: "Slope 2 with intercept 1 matches the target line.",
      slopeFeedback: "The tilt is off — the rise over one run must be 2.",
      interceptFeedback: "The crossing is off — it must meet the y-axis at 1."
    });
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "-1" } }); // m: 0→-1 away from 2
    fireEvent.change(screen.getByRole("slider", { name: /intercept b/ }), { target: { value: "1" } }); // b lands exactly → silent
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "1" } }); // toward
    expect(events).toEqual([
      { control: "m", dir: "away" },
      { control: "m", dir: "toward" }
    ]);
  });

  it("scatterFit: moves measure against the mean-squared miss; no 'past' can occur", () => {
    cleanup();
    const { events } = mount({
      type: "scatterFit",
      prompt: "Fit the trend.",
      points: [
        [0, 1],
        [1, 3],
        [2, 5],
        [3, 7]
      ], // exactly y = 2x + 1
      xMin: 0,
      xMax: 4,
      yMin: 0,
      yMax: 10,
      tolerance: 0.5,
      successFeedback: "The line runs through the middle of the cloud.",
      slopeFeedback: "The tilt doesn't follow the points.",
      offsetFeedback: "The whole line sits too high or too low."
    });
    fireEvent.change(screen.getByRole("slider", { name: /line slope/ }), { target: { value: "2" } }); // mse shrinks
    fireEvent.change(screen.getByRole("slider", { name: /line intercept/ }), { target: { value: "-3" } }); // mse grows
    expect(events).toEqual([
      { control: "m", dir: "toward" },
      { control: "b", dir: "away" }
    ]);
    expect(events.some((e) => e.dir === "past")).toBe(false);
  });
});

describe("multi-control emitters (fixation-capable engines)", () => {
  it("quadDrag: each slider emits against its own target coordinate", () => {
    cleanup();
    const { events } = mount({
      type: "quadDrag",
      prompt: "Finish the rectangle.",
      fixed: [
        [1, 1],
        [5, 1],
        [5, 4]
      ],
      targetX: 1,
      targetY: 4,
      startX: 3,
      startY: 2,
      targetName: "a rectangle",
      successFeedback: "Four right angles, opposite sides equal — that's the rectangle.",
      sideFeedback: "A side length is off — opposite sides of a rectangle match.",
      angleFeedback: "A corner isn't square — every rectangle angle is 90°."
    });
    fireEvent.change(screen.getByRole("slider", { name: /fourth corner across/i }), { target: { value: "2" } }); // toward 1
    fireEvent.change(screen.getByRole("slider", { name: /fourth corner up/i }), { target: { value: "1" } }); // away from 4
    expect(events).toEqual([
      { control: "x", dir: "toward" },
      { control: "y", dir: "away" }
    ]);
  });

  it("transformExplore: emits toward the needed offset — and goes SILENT under the wrong reflect", () => {
    cleanup();
    const { events } = mount({
      type: "transformExplore",
      prompt: "Slide the shape onto the target.",
      shape: [
        [1, 1],
        [3, 1],
        [2, 3]
      ],
      target: [
        [4, 2],
        [6, 2],
        [5, 4]
      ], // pure translation by (3, 1) under reflect: none
      allowReflect: true,
      successFeedback: "Slid three right and one up — every point moved the same way.",
      offsetFeedback: "The slide is off — every point must move by the same amounts.",
      reflectFeedback: "The shape is flipped — this target needs no reflection."
    });
    fireEvent.change(screen.getByRole("slider", { name: /slide x/i }), { target: { value: "2" } }); // toward 3
    fireEvent.change(screen.getByRole("slider", { name: /slide y/i }), { target: { value: "-2" } }); // away from 1
    expect(events).toEqual([
      { control: "dx", dir: "toward" },
      { control: "dy", dir: "away" }
    ]);
    // flip the reflect: the needed translation no longer exists → silence
    fireEvent.click(screen.getByRole("button", { name: /reflect over x-axis/i }));
    fireEvent.change(screen.getByRole("slider", { name: /slide x/i }), { target: { value: "3" } });
    expect(events).toHaveLength(2);
  });
});

describe("numberLineHop tap-choice lattice", () => {
  it("hop=1 renders every integer, exactly as before", () => {
    cleanup();
    mount({
      type: "numberLineHop", prompt: "Hop to it.", min: 0, max: 8, start: 2, hop: 1, hops: 3,
      direction: "forward", missFeedback: "Count each hop from the start mark.",
      successFeedback: "Three hops forward from 2 lands on 5."
    });
    expect(screen.getAllByRole("radio")).toHaveLength(9);
  });

  it("hop=10 over 0–100 collapses to the reachable lattice, and off-lattice traps stay tappable", () => {
    cleanup();
    mount({
      type: "numberLineHop", prompt: "Count by tens.", min: 0, max: 100, start: 20, hop: 10, hops: 3,
      direction: "forward",
      commonLandings: [{ value: 45, feedback: "45 is a half-hop. Tens land on 50." }],
      missFeedback: "Hops of ten land on the tens.", successFeedback: "20, 30, 40, 50."
    });
    // lattice from 20 by tens across 0..100 = 11 positions, plus the 45 trap
    expect(screen.getAllByRole("radio")).toHaveLength(12);
    expect(screen.getByRole("radio", { name: "Land on 45" })).toBeTruthy();
    expect(screen.getByRole("radio", { name: "Land on 50" })).toBeTruthy();
  });
});

describe("lengthCompare (new engine)", () => {
  it("renders proportional bars as radio choices; picking grades through evaluate", async () => {
    cleanup();
    const spec = WidgetSpec.parse({
      type: "lengthCompare",
      prompt: "Which is longer? Tap it.",
      unitLabel: "paperclips",
      items: [
        { id: "pencil", label: "pencil", length: 5 },
        { id: "eraser", label: "eraser", length: 3, feedback: "The eraser is only 3 paperclips long. The pencil, at 5, is longer." }
      ],
      answerId: "pencil",
      missFeedback: "Count the stripes on each bar — more stripes means longer.",
      successFeedback: "Yes — 5 paperclips is more than 3, so the pencil is longer."
    }) as TWidget;
    const { evaluate, canCheck } = await import("@/lib/evaluate");
    expect(canCheck(spec, null)).toBe(false);
    mount(spec);
    const pencil = screen.getByRole("radio", { name: "pencil, 5 paperclips" });
    const eraser = screen.getByRole("radio", { name: "eraser, 3 paperclips" });
    expect(pencil).toBeTruthy();
    fireEvent.click(eraser);
    expect(evaluate(spec, "eraser").feedback).toContain("only 3 paperclips");
    expect(evaluate(spec, "eraser").correct).toBe(false);
    expect(evaluate(spec, "pencil")).toEqual({
      correct: true,
      feedback: "Yes — 5 paperclips is more than 3, so the pencil is longer."
    });
    expect(canCheck(spec, "eraser")).toBe(true);
  });

  it("wrong pick without an authored feedback falls to missFeedback; vertical mode renders", async () => {
    cleanup();
    const spec = WidgetSpec.parse({
      type: "lengthCompare",
      prompt: "Which is taller?",
      orientation: "v",
      items: [
        { id: "giraffe", label: "giraffe", length: 9 },
        { id: "pony", label: "pony", length: 4 }
      ],
      answerId: "giraffe",
      missFeedback: "Same ground, higher head: taller.",
      successFeedback: "Yes — same ground, higher head: taller."
    }) as TWidget;
    const { evaluate } = await import("@/lib/evaluate");
    expect(evaluate(spec, "pony").feedback).toBe("Same ground, higher head: taller.");
    mount(spec);
    expect(screen.getByRole("radio", { name: "giraffe" })).toBeTruthy();
  });
});
