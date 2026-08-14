// @vitest-environment jsdom
//
// S241 — TWO GRAPH-INTEGRITY PROPERTIES THAT NOTHING WAS CHECKING.
//
//   D-09 (rule B3) — A DOT PILE MAY NOT OUTGROW ITS FRAME. sampleSim and shuffleTest retain 200
//   polls / 300 relabellings and stacked them at a fixed 5px pitch with no ceiling, so past ~22
//   dots in one column the stack drew above the viewBox and the surplus dots vanished — while the
//   readout went on counting the full n. The learner's whole judgement ("could chance alone do
//   this?") was being made against a truncated null distribution. The tests below run each engine
//   to its RETENTION CAP, on the densest legal shape of data, and demand that every retained
//   observation is both DRAWN and INSIDE the viewBox, with the drawing's count matching the
//   readout's.
//
//   D-13 (rule E4) — `touch-action: none` BELONGS TO THE HANDLE, NOT THE STAGE. Four engines
//   spread the drag hit surface over the whole plot rect, contradicting useSvgDrag's own
//   documented contract ("the handle only — the page still scrolls natively") and leaving a
//   ~334x300px scroll-dead zone mid-lesson on a phone. The tests below measure each engine's hit
//   surface against its plot rect and require it to be a small fraction of it, AND to sit on the
//   object it grabs (the point, the traced point, the image, the fence) rather than floating
//   somewhere over the plane.
//
// jsdom has no layout, so geometry is read from the SVG attributes the engines emit — which is
// exactly what a browser would hit-test.

import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { afterEach, describe, expect, it } from "vitest";
import { WidgetRenderer } from "./widgets";
import { WidgetSpec, type TWidget } from "@/lib/schema";

afterEach(cleanup);

function mount(spec: TWidget, disabled = false) {
  const holder: { v: unknown } = { v: null };
  function Host() {
    const [value, setValue] = useState<unknown>(null);
    return (
      <WidgetRenderer
        spec={spec}
        value={value}
        onChange={(v) => {
          holder.v = v;
          setValue(v);
        }}
        disabled={disabled}
      />
    );
  }
  const utils = render(<Host />);
  return { holder, ...utils };
}

function viewBox(svg: SVGSVGElement): { w: number; h: number } {
  const [, , w, h] = (svg.getAttribute("viewBox") ?? "0 0 0 0").split(/\s+/).map(Number);
  return { w, h };
}

/** Every dot the engine drew, as (cx, cy, r) in viewBox units. */
function dots(container: HTMLElement): Array<{ cx: number; cy: number; r: number }> {
  return Array.from(container.querySelectorAll("circle.mt-dot")).map((c) => ({
    cx: Number(c.getAttribute("cx")),
    cy: Number(c.getAttribute("cy")),
    r: Number(c.getAttribute("r"))
  }));
}

function press(name: string, times: number) {
  const button = screen.getByRole("button", { name });
  for (let i = 0; i < times; i++) fireEvent.click(button);
}

describe("S241 D-09 — a dot pile at its retention cap is fully drawn, inside the frame", () => {
  // si-06-01's live numbers: the bell-shape step, whose smaller size (10) is the one that piles
  // deepest — a poll of 10 can only land on 11 proportions, so 200 polls stack into 11 columns.
  const bell = WidgetSpec.parse({
    type: "sampleSim",
    prompt: "Population truth: 50% purple. Draw 20 samples of 50 and stack their proportions.",
    populationP: 0.5,
    sizes: [10, 50],
    targetSize: 50,
    requiredDraws: 20,
    seed: 21,
    successFeedback: "A mound: tallest at 0.5, thinning symmetrically to both sides.",
    wrongSizeFeedback: "Use samples of 50 — the bigger sample makes the bell tighter.",
    moreDrawsFeedback: "Keep drawing — the shape needs about 20 stacked samples to show itself."
  }) as TWidget;

  // The densest legal sampleSim: the smallest allowed sample (5) at the smallest allowed
  // proportion (0.05) puts ~77% of every poll on p = 0, i.e. one enormous column in bin 0.
  const spike = WidgetSpec.parse({
    ...(bell as unknown as Record<string, unknown>),
    populationP: 0.05,
    sizes: [5, 50],
    targetSize: 50,
    seed: 3
  }) as TWidget;

  for (const [label, spec] of [["a live mound", bell], ["the densest legal spike", spike]] as const) {
    it(`draws all 200 polls inside the viewBox — ${label}`, () => {
      const { container } = mount(spec);
      press("run ten polls", 20); // 200 = the retention cap in `draw`

      const svg = container.querySelector("svg") as SVGSVGElement;
      const { w, h } = viewBox(svg);
      const drawn = dots(container);

      // The counter may not diverge from the drawing (rule B3).
      expect(drawn).toHaveLength(200);
      expect(container.textContent).toContain("200 polls");

      // Nothing above the top edge, nothing below the bottom, nothing off the sides.
      const highest = Math.min(...drawn.map((d) => d.cy - d.r));
      expect(highest, "a dot pile drew above the viewBox").toBeGreaterThanOrEqual(0);
      for (const d of drawn) {
        expect(d.cy + d.r).toBeLessThanOrEqual(h);
        expect(d.cx - d.r).toBeGreaterThanOrEqual(0);
        expect(d.cx + d.r).toBeLessThanOrEqual(w);
        expect(d.r, "a dot shrank to nothing").toBeGreaterThan(0.5);
      }

      // The pile is compressed by a SINGLE pitch, so column heights stay proportional to their
      // counts: every gap between neighbouring rows of the same column is the same number.
      const byColumn = new Map<number, number[]>();
      for (const d of drawn) {
        const key = Math.round(d.cx * 100);
        byColumn.set(key, [...(byColumn.get(key) ?? []), d.cy]);
      }
      const pitches: number[] = [];
      for (const ys of byColumn.values()) {
        const sorted = [...ys].sort((a, b) => b - a);
        for (let i = 1; i < sorted.length; i++) pitches.push(sorted[i - 1] - sorted[i]);
      }
      expect(pitches.length).toBeGreaterThan(0);
      for (const p of pitches) expect(p).toBeCloseTo(pitches[0], 6);

      // The data really is dense enough to have clipped: the old fixed 5px pitch left the frame
      // at ~22 dots, and the tallest column here is deeper than that. Without this the
      // containment assertions above could pass on data that never stressed anything.
      const tallest = Math.max(...[...byColumn.values()].map((ys) => ys.length));
      expect(tallest, "this fixture no longer stresses the pile height").toBeGreaterThan(22);
      // A squeezed pile can no longer be counted by eye, so the readout says how deep it got.
      expect(container.textContent).toContain(`tallest pile ${tallest}`);
    });
  }

  it("draws all 300 relabellings inside the viewBox — shuffleTest at its cap", () => {
    // Three 5s against three 3s: the pool has only four distinct relabelled gaps, so 300
    // shuffles pile ~135 deep in each of the two middle columns — 675px of stack at the old
    // fixed pitch, on a 150-unit-tall stage.
    const spec = WidgetSpec.parse({
      type: "shuffleTest",
      prompt: "Relabel the two groups at random and watch how big a gap chance alone produces.",
      groupALabel: "sun",
      groupBLabel: "shade",
      groupA: [5, 5, 5],
      groupB: [3, 3, 3],
      requiredShuffles: 20,
      targetVerdict: "real",
      seed: 5,
      successFeedback: "Chance almost never reaches a gap that big, so the difference is real.",
      moreShufflesFeedback: "Keep relabelling — the pile needs more shuffles to show its width.",
      wrongVerdictFeedback: "Look again at how often chance alone reached your gap."
    }) as TWidget;

    const { container } = mount(spec);
    press("relabel twenty times", 15); // 300 = the retention cap in `run`

    const svg = container.querySelector("svg") as SVGSVGElement;
    const { w, h } = viewBox(svg);
    const drawn = dots(container);

    expect(drawn).toHaveLength(300);
    expect(container.textContent).toContain("300 relabellings");
    expect(Math.min(...drawn.map((d) => d.cy - d.r)), "a null pile drew above the viewBox").toBeGreaterThanOrEqual(0);

    // Same guard as above: the deepest column must be past the old 5px-pitch clipping threshold.
    const depth = new Map<number, number>();
    for (const d of drawn) depth.set(Math.round(d.cx * 100), (depth.get(Math.round(d.cx * 100)) ?? 0) + 1);
    const tallest = Math.max(...depth.values());
    expect(tallest, "this fixture no longer stresses the pile height").toBeGreaterThan(22);
    expect(container.textContent).toContain(`tallest pile ${tallest}`);
    for (const d of drawn) {
      expect(d.cy + d.r).toBeLessThanOrEqual(h);
      expect(d.cx - d.r).toBeGreaterThanOrEqual(0);
      expect(d.cx + d.r).toBeLessThanOrEqual(w);
      expect(d.r).toBeGreaterThan(0.5);
    }
  });

  it("D-21 — the gap axis prints enough numerals to reveal the scale it is currently on", () => {
    const spec = WidgetSpec.parse({
      type: "shuffleTest",
      prompt: "Relabel the two groups at random and watch how big a gap chance alone produces.",
      groupALabel: "sun",
      groupBLabel: "shade",
      groupA: [9, 8, 10],
      groupB: [4, 5, 3],
      requiredShuffles: 20,
      targetVerdict: "real",
      seed: 5,
      successFeedback: "Chance almost never reaches a gap that big, so the difference is real.",
      moreShufflesFeedback: "Keep relabelling — the pile needs more shuffles to show its width.",
      wrongVerdictFeedback: "Look again at how often chance alone reached your gap."
    }) as TWidget;

    const { container } = mount(spec);
    const axis = container.querySelector('[data-testid="sht-axis"]') as SVGGElement;
    const numerals = Array.from(axis.querySelectorAll("text")).map((t) => t.textContent?.trim() ?? "");

    // observed = 5, so lim = 6.75: the ends of the scale are stated, not left to be guessed.
    expect(numerals).toContain("0");
    expect(numerals.filter((n) => n !== "0").length, "a single '0' does not reveal a scale").toBeGreaterThanOrEqual(2);
    expect(numerals).toContain("6.75");
    expect(numerals).toContain("-6.75");
  });
});

describe("S241 D-22 — the sequence dial draws the negative half of its own range", () => {
  // fn-04-01/i1's live numbers. The dial runs from d = −5, so the negative range is one drag away.
  const spec = WidgetSpec.parse({
    type: "sequenceBuild", mode: "arithmetic", task: "dial", answerMode: "dial",
    first: 3, targetD: 4, atPosition: 10, targetTerm: 39,
    prompt: "3, 7, 11, 15 grows by a fixed step. Dial the common difference until the 10th term lands on 39.",
    successFeedback: "d = 4: ten terms means nine gaps, so 3 + 9×4 = 39.",
    lowFeedback: "Too small — the 10th term falls short of 39.",
    highFeedback: "Too large — the 10th term overshoots 39."
  }) as TWidget;

  it("bars hang from a zero line, in the frame, with length proportional to the partial sum", () => {
    const { container } = mount(spec);
    fireEvent.change(screen.getByRole("slider", { name: "the common difference" }), { target: { value: "-5" } });

    const svg = container.querySelector("svg") as SVGSVGElement;
    const { h } = viewBox(svg);
    // d = −5 from a first term of 3: 3, −2, −7, … so the partial sums run 3, 1, −6, … −116.
    const terms = Array.from({ length: 8 }, (_, i) => 3 - 5 * i);
    const sums = terms.reduce<number[]>((acc, t) => [...acc, (acc[acc.length - 1] ?? 0) + t], []);
    expect(sums[0]).toBeGreaterThan(0);
    expect(sums[7]).toBeLessThan(0);

    const zeroLine = Array.from(container.querySelectorAll("line")).find(
      (l) => l.getAttribute("x1") === "20" && l.getAttribute("x2") === "300"
    );
    expect(zeroLine, "no zero baseline drawn").toBeTruthy();
    const zeroY = Number(zeroLine?.getAttribute("y1"));

    const bars = Array.from(container.querySelectorAll("rect[stroke]")).map((r) => ({
      y: Number(r.getAttribute("y")),
      h: Number(r.getAttribute("height"))
    }));
    expect(bars).toHaveLength(8);

    // Pixels per unit, read off the longest bar; every other bar must agree with it (bars shorter
    // than the 1px visibility floor are drawn at the floor, which is the one allowed exception).
    const scale = bars[7].h / Math.abs(sums[7]);
    bars.forEach((bar, i) => {
      // Inside the frame — no bar clipped off the bottom of a 130-unit stage.
      expect(bar.y).toBeGreaterThanOrEqual(0);
      expect(bar.y + bar.h).toBeLessThanOrEqual(h);
      // On the correct side of zero.
      if (sums[i] > 0) expect(bar.y + bar.h).toBeCloseTo(zeroY, 6);
      else expect(bar.y).toBeCloseTo(zeroY, 6);
      // Length says the size of the sum — never the 1px sliver at a meaningless position that
      // the old clamp produced for every negative bar.
      expect(bar.h, `bar ${i} is not to scale`).toBeCloseTo(Math.max(Math.abs(sums[i]) * scale, 1), 6);
    });

    // With a negative half on stage, the baseline says which line is zero.
    expect(container.querySelector("svg")?.textContent).toContain("0");
  });

  it("leaves the all-positive case exactly as it was", () => {
    const { container } = mount(spec);
    fireEvent.change(screen.getByRole("slider", { name: "the common difference" }), { target: { value: "4" } });
    const zeroLine = Array.from(container.querySelectorAll("line")).find(
      (l) => l.getAttribute("x1") === "20" && l.getAttribute("x2") === "300"
    );
    expect(Number(zeroLine?.getAttribute("y1"))).toBe(130 - 18); // the frame's bottom, as before
    for (const r of Array.from(container.querySelectorAll("rect[stroke]"))) {
      expect(Number(r.getAttribute("y")) + Number(r.getAttribute("height"))).toBeCloseTo(112, 6);
    }
  });
});

/** Bounding box of a hit surface, in viewBox units, whatever shape the engine used for it. */
function hitBox(el: Element): { x: number; y: number; w: number; h: number } {
  const n = (name: string) => Number(el.getAttribute(name) ?? 0);
  if (el.tagName.toLowerCase() === "circle") {
    return { x: n("cx") - n("r"), y: n("cy") - n("r"), w: 2 * n("r"), h: 2 * n("r") };
  }
  if (el.tagName.toLowerCase() === "polygon") {
    const pts = (el.getAttribute("points") ?? "")
      .trim()
      .split(/\s+/)
      .map((p) => p.split(",").map(Number));
    const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
    return { x: Math.min(...xs), y: Math.min(...ys), w: Math.max(...xs) - Math.min(...xs), h: Math.max(...ys) - Math.min(...ys) };
  }
  return { x: n("x"), y: n("y"), w: n("width"), h: n("height") };
}

describe("S241 D-13 — the drag hit surface is the handle, not the whole plot", () => {
  const distanceGrid = WidgetSpec.parse({
    type: "distanceGrid", prompt: "Move the point to (6, 6).",
    anchor: [2, 3], targetPoint: [6, 6], gridMin: 0, gridMax: 8, startX: 2, startY: 3,
    successFeedback: "√(4² + 3²) = 5.", wrongPointFeedback: "Not at (6, 6) yet."
  }) as TWidget;

  const parametricTrace = WidgetSpec.parse({
    type: "parametricTrace",
    prompt: "For x = t + 1, y = 2t, drag the point forward and watch which way the arrows point.",
    mode: "line", lineX0: 1, lineYK: 2, tMin: 0, tMax: 3, tStep: 0.1, tStart: 0, targetT: 2, tTolerance: 0.15,
    successFeedback: "At t = 2 the point has reached (3, 4).", lowFeedback: "Not far enough yet.", highFeedback: "Too far."
  }) as TWidget;

  const rotationRule = WidgetSpec.parse({
    type: "rotationLab", mode: "coordinateRule", prompt: "Quarter turn counterclockwise.",
    point: [5, 2], centre: [0, 0], targetAngle: 90, angleStart: 0, angleStep: 90, gridMax: 8,
    successFeedback: "The image is (−2, 5).", lowFeedback: "Not far enough.", highFeedback: "Too far."
  }) as TWidget;

  const rotationSymmetry = WidgetSpec.parse({
    type: "rotationLab", mode: "symmetryOrder", prompt: "Hunt the smallest turn that drops the square back onto itself.",
    shape: [[2, 2], [-2, 2], [-2, -2], [2, -2]], centre: [0, 0], targetAngle: 90, angleStart: 0, angleStep: 15, gridMax: 8,
    successFeedback: "A quarter turn lands it, so the square has rotational order four.",
    lowFeedback: "The shape has not come back around yet at that turn.", highFeedback: "The shape came back around before that turn."
  }) as TWidget;

  const feasibleRegion = WidgetSpec.parse({
    type: "feasibleRegionExplore",
    prompt: "Drag the flour limit fence and watch what happens to the corner at (6, 0).",
    slantM: -1, slantB: 6, verticalMin: 2, verticalMax: 6, verticalStep: 1, verticalStart: 6, verticalTarget: 4,
    xMax: 8, yMax: 8, fenceLabel: "flour limit",
    successFeedback: "At x ≤ 4 the corner (6,0) is gone.", lowFeedback: "Still farther out than x = 4.", highFeedback: "Past x = 4."
  }) as TWidget;

  const cases = [
    ["distanceGrid", distanceGrid, "dgr-drag"],
    ["parametricTrace", parametricTrace, "ptr-drag"],
    ["rotationLab · coordinateRule", rotationRule, "rl-drag"],
    ["rotationLab · symmetryOrder", rotationSymmetry, "rl-drag"],
    ["feasibleRegionExplore", feasibleRegion, "fre-drag"]
  ] as const;

  for (const [name, spec, testid] of cases) {
    it(`${name}: the hit surface covers a small fraction of the plot rect`, () => {
      const { container } = mount(spec);
      const svg = container.querySelector("svg") as SVGSVGElement;
      const plot = viewBox(svg);
      const hit = hitBox(screen.getByTestId(testid));

      expect(hit.w).toBeGreaterThan(0);
      expect(hit.h).toBeGreaterThan(0);
      // A full-stage rect is what rule E4 forbids: at 390px it is a scroll-dead zone the size of
      // the whole graph. A handle is a handle — well under a third of the plot.
      const share = (hit.w * hit.h) / (plot.w * plot.h);
      expect(share, `${name} hit surface covers ${Math.round(share * 100)}% of the plot`).toBeLessThan(0.3);
      // And it cannot be the plot rect in disguise: at least one side is far short of the stage.
      expect(Math.min(hit.w / plot.w, hit.h / plot.h)).toBeLessThan(0.5);
    });
  }

  it("distanceGrid, parametricTrace and rotationLab put the hit surface ON the mark it grabs", () => {
    for (const [name, spec, testid] of cases.filter(([, , id]) => id !== "fre-drag")) {
      const { container, unmount } = mount(spec);
      const hit: Element = screen.getByTestId(testid);
      const box = hitBox(hit);
      const cx = box.x + box.w / 2, cy = box.y + box.h / 2;

      if (hit.tagName.toLowerCase() === "polygon") {
        // symmetryOrder grabs the image polygon itself — the same points the picture draws.
        const drawn = Array.from(container.querySelectorAll("polygon")).filter((p) => p !== hit);
        expect(drawn.some((p) => p.getAttribute("points") === hit.getAttribute("points")), `${name}`).toBe(true);
      } else {
        // The puck is centred on a drawn mark (the moving point / traced point / image point),
        // never floating over empty plane.
        const marks = Array.from(container.querySelectorAll("circle")).filter((c) => c !== hit);
        const onAMark = marks.some(
          (m) => Math.hypot(Number(m.getAttribute("cx")) - cx, Number(m.getAttribute("cy")) - cy) < 1
        );
        expect(onAMark, `${name} hit puck is not centred on any drawn mark`).toBe(true);
      }
      unmount();
    }
  });

  it("feasibleRegionExplore's band tracks the fence it drags", () => {
    const { container } = mount(feasibleRegion);
    const box = hitBox(screen.getByTestId("fre-drag"));
    const fence = Array.from(container.querySelectorAll("line")).find(
      (l) => l.getAttribute("x1") === l.getAttribute("x2") && l.getAttribute("stroke-dasharray") === "5 4"
    );
    expect(fence, "no dashed fence line found").toBeTruthy();
    const fx = Number(fence?.getAttribute("x1"));
    expect(fx).toBeGreaterThanOrEqual(box.x);
    expect(fx).toBeLessThanOrEqual(box.x + box.w);
  });
});
