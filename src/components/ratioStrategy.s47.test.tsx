// @vitest-environment jsdom
/**
 * RATIO ENGINES, STRATEGY-INSTRUMENTED (s47): emission contract + live pipe.
 *
 * Doctrine carried from s45: arrival is SILENT, and slider engines emit per
 * DIRECTION SEGMENT — one event when the move's relation to the target
 * changes — so a single overshoot drag can never read as wandering (the
 * transit lesson). The reciprocal-rate landing is the one precisely
 * detectable unit-rate inversion and is kind-tagged "reversal".
 *
 * The e2e half proves the whole chain in the real player for ratioTable:
 * zigzag drags → segment events → classifyRatio → the equivalence-break cue.
 */
import { beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React, { useState } from "react";
import { WidgetRenderer } from "./widgets";
import LessonPlayer from "./LessonPlayer";
import { Lesson, WidgetSpec, type TWidget } from "@/lib/schema";
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

const ratioSpec = {
  type: "ratioTable",
  prompt: "3 cups flour go with 2 cups sugar. How much sugar for 12 cups flour?",
  colA: "flour",
  colB: "sugar",
  rows: [[3, 2]],
  askA: 12,
  targetB: 8, // 12 · (2/3)
  bMax: 24,
  bStep: 1,
  successFeedback: "12 : 8 keeps the 3 : 2 relationship.",
  lowFeedback: "Too little sugar — 12 cups of flour is four times 3, so sugar scales by four too.",
  highFeedback: "Too much sugar — the 3 : 2 relationship means sugar stays SMALLER than flour."
};
// reciprocal-rate landing: b = askA · (rowA/rowB) = 12 · 3/2 = 18

const slide = (to: number) => fireEvent.change(screen.getByLabelText("missing value"), { target: { value: String(to) } });

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

describe("ratioTable emissions", () => {
  it("a monotone drag is ONE segment event, not one per step", () => {
    const { events } = mount(ratioSpec);
    slide(3);
    slide(4);
    slide(5); // still approaching 8 from below — same relation
    expect(events).toHaveLength(1);
    expect(events[0]).toEqual({ control: "b", dir: "toward", state: { a: 12, b: 3 } });
  });

  it("arrival at the target is silent", () => {
    const { events } = mount(ratioSpec);
    slide(8);
    expect(events).toHaveLength(0);
  });

  it("zigzag emits one event per direction segment, state riding each", () => {
    const { events } = mount(ratioSpec);
    slide(4); // toward
    slide(2); // away
    slide(6); // toward again
    expect(events.map((e) => e.dir)).toEqual(["toward", "away", "toward"]);
    expect(events.map((e) => (e.state as { b: number }).b)).toEqual([4, 2, 6]);
  });

  it("landing on the reciprocal-rate value carries kind:'reversal'", () => {
    const { events } = mount(ratioSpec);
    slide(18); // 12 · 3/2 — the inverted unit rate
    expect(events).toHaveLength(1);
    expect(events[0].kind).toBe("reversal");
    expect((events[0].state as { b: number }).b).toBe(18);
  });
});

describe("doubleNumberLine emissions", () => {
  const dnlSpec = {
    type: "doubleNumberLine",
    prompt: "The top line counts miles, the bottom counts hours.",
    topLabel: "miles",
    bottomLabel: "hours",
    steps: 5,
    topPerStep: 12,
    bottomPerStep: 2,
    askAtStep: 3,
    targetTop: 36,
    topMax: 60,
    topStep: 1,
    successFeedback: "3 steps of 12 miles is 36.",
    lowFeedback: "Not enough miles for 3 steps — each tick adds 12.",
    highFeedback: "Past the mark — count 12 miles per tick, three ticks."
  };
  const slideTop = (to: number) =>
    fireEvent.change(screen.getByLabelText("paired value"), { target: { value: String(to) } });

  it("segment gating and silence hold; reading the bottom value onto the top is tagged", () => {
    const { events } = mount(dnlSpec);
    slideTop(10);
    slideTop(20); // same toward segment → still one event
    expect(events).toHaveLength(1);
    slideTop(6); // bottomAt = 3·2 — the inversion landing (also an "away" move)
    expect(events).toHaveLength(2);
    expect(events[1].kind).toBe("reversal");
    expect(events[1].dir).toBe("away");
    slideTop(36); // arrival — silent
    expect(events).toHaveLength(2);
  });
});

/* ------------------------------------------------------------------ e2e --- */

const ratioStep = (id: string) => ({
  id,
  kind: "check" as const,
  body: "Keep the ratio.",
  conceptTag: "ratio-scale",
  widget: ratioSpec,
  explanationVariants: ["Multiply both terms of 3 : 2 by four to reach 12 : 8.", "12 is 3 × 4, so sugar is 2 × 4 = 8."]
});

const mkLesson = () =>
  Lesson.parse({
    id: "rt-e2e-01",
    slug: "rt-e2e",
    title: "Ratio strategy pipe",
    courseId: "test",
    chapterId: "t1",
    minutes: 3,
    steps: [
      { id: "c0", kind: "concept", body: "Ratios scale by **multiplying** both terms." },
      ...["k1", "k2", "k3", "k4"].map(ratioStep),
      { id: "cx", kind: "concept", body: "The multiplier is the same for both quantities." },
      { id: "cy", kind: "concept", body: "That is what equivalent means." },
      { id: "r1", kind: "recap", body: "Done.", takeaways: ["Same multiplier, both terms."] }
    ]
  });

describe("live pipe: ratioTable → classifyRatio → cue", () => {
  it("three away segments with the ratio still off latch equivalence-break mid-work", () => {
    render(<LessonPlayer lesson={mkLesson()} />);
    fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
    const s = (to: number) => slide(to);
    s(4); // toward
    s(2); // away 1
    s(5); // toward
    s(1); // away 2
    expect(screen.queryByTestId("process-cue")).toBeNull(); // aways=2 — not yet
    s(6); // toward
    s(3); // away 3 — last ratio 12/3 ≠ 12/8
    const cue = screen.getByTestId("process-cue");
    expect(cue.textContent).toMatch(/equivalent|proportion|relationship/i);
    expect(cue.textContent).not.toMatch(/\b8\b/); // never the answer
  });
});
