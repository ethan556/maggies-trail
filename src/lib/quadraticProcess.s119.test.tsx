// @vitest-environment jsdom
/**
 * S119 — `quadraticExplore` process instrumentation, and why the rating had to change WITH the code.
 *
 * Eighteen lessons use this engine and seven of them sat at Tier D with `adapt` among their gaps —
 * not because the lessons were weak but because the engine emitted no process events, so its
 * capability row carried `adapt: 0`. The fix is not to edit the row: that would be exactly the
 * flattery `engineCapabilities.test.ts` exists to prevent. The fix is to make the claim true, in
 * BOTH forms, and then raise it.
 *
 * The subtle case is root interchangeability. (x − 3)(x + 2) and (x + 2)(x − 3) are the same
 * parabola, so a learner holding the right pair in the opposite order must never be told they are
 * moving "away" from anything. That is asserted directly below.
 */
import { describe, it, expect, afterEach } from "vitest";
import { cleanup, render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { WidgetRenderer } from "@/components/widgets";
import { WidgetSpec, type TWidget } from "./schema";
import { MULTI_CONTROL, processCue, type ProcessEvent } from "./processEvents";

afterEach(() => cleanup());

const roots = (o: Record<string, unknown> = {}) =>
  WidgetSpec.parse({
    type: "quadraticExplore",
    prompt: "p",
    form: "roots",
    targetA: 1,
    targetR1: -2,
    targetR2: 3,
    targetH: 0,
    targetK: 0,
    r1Start: 0,
    r2Start: 0,
    aStart: 1,
    successFeedback: "ok",
    shapeFeedback: "shape",
    vertexFeedback: "vertex",
    ...o
  }) as TWidget;

const vertex = (o: Record<string, unknown> = {}) =>
  WidgetSpec.parse({
    type: "quadraticExplore",
    prompt: "p",
    targetA: 1,
    targetH: 2,
    targetK: -3,
    aStart: 1,
    hStart: 0,
    kStart: 0,
    successFeedback: "ok",
    shapeFeedback: "shape",
    vertexFeedback: "vertex",
    ...o
  }) as TWidget;

function mount(spec: TWidget) {
  const events: ProcessEvent[] = [];
  function Host() {
    const [v, setV] = useState<unknown>(null);
    return (
      <WidgetRenderer spec={spec} value={v} disabled={false} onChange={setV} onEvent={(e) => events.push(e)} />
    );
  }
  const { container } = render(<Host />);
  return { events, container };
}

/** Drive a control through TWO distinct values. A React controlled range suppresses the change
 * event when the new value equals the one it already holds, so a single write that happens to
 * match the start emits nothing — the trap this session hit once already in binomialAreaLab's
 * keyboard drive. */
const drive = (el: HTMLElement, a: string, b: string) => {
  fireEvent.change(el, { target: { value: a } });
  fireEvent.change(el, { target: { value: b } });
};

describe("the capability claim is backed by BOTH forms, not one", () => {
  it("the roots form emits a direction event when a root is dragged", () => {
    const { events } = mount(roots());
    drive(screen.getByLabelText("first root"), "1", "-2");
    expect(events.length).toBeGreaterThan(0);
    expect(events.some((e) => e.control === "r1")).toBe(true);
  });

  it("the roots form emits for the second root and the leading coefficient too", () => {
    const { events } = mount(roots());
    drive(screen.getByLabelText("second root"), "1", "3");
    drive(screen.getByLabelText("leading coefficient"), "2", "1");
    const controls = new Set(events.map((e) => e.control));
    expect(controls.has("r2")).toBe(true);
    expect(controls.has("a")).toBe(true);
  });

  it("the vertex form emits for every one of its three sliders", () => {
    const { events } = mount(vertex());
    drive(screen.getByLabelText(/h \(left\/right\)/i), "1", "2");
    drive(screen.getByLabelText(/k \(up\/down\)/i), "-1", "-3");
    drive(screen.getByLabelText(/a \(stretch\/flip\)/i), "2", "3");
    const controls = new Set(events.map((e) => e.control));
    expect(controls.has("h")).toBe(true);
    expect(controls.has("k")).toBe(true);
    expect(controls.has("a")).toBe(true);
  });

  it("a move TOWARD the target is reported as toward, and away as away", () => {
    const { events } = mount(vertex());
    fireEvent.change(screen.getByLabelText(/h \(left\/right\)/i), { target: { value: "1" } }); // 0 -> 1, target 2
    expect(events.find((e) => e.control === "h")?.dir).toBe("toward");
    fireEvent.change(screen.getByLabelText(/h \(left\/right\)/i), { target: { value: "-1" } }); // 1 -> -1
    expect(events.filter((e) => e.control === "h").pop()?.dir).toBe("away");
  });
});

describe("ADVERSARIAL — the roots are interchangeable, and the signal must respect that", () => {
  it("landing the right pair in the OPPOSITE order is never reported as moving away", () => {
    // Target pair is (−2, 3). Dragging r1 to 3 is the right pair reversed, not a mistake.
    const { events } = mount(roots());
    drive(screen.getByLabelText("first root"), "1", "3");
    const r1 = events.filter((e) => e.control === "r1");
    // Scored against the nearer target, so this reads as progress, not regression.
    expect(r1.length > 0 ? r1[r1.length - 1].dir : "toward").not.toBe("away");
  });

  it("(x − 3)(x + 2) and (x + 2)(x − 3) really are the same parabola", () => {
    // Expanded both ways by hand: x² − x − 6 either way.
    const wayA = { b: -(3 + -2), c: 3 * -2 };
    const wayB = { b: -(-2 + 3), c: -2 * 3 };
    expect(wayA).toEqual(wayB);
  });
});

describe("the process copy exists for every control the engine emits", () => {
  it("quadraticExplore is registered as multi-control", () => {
    expect(MULTI_CONTROL.has("quadraticExplore")).toBe(true);
  });

  it("has engine-specific direction cues, not the generic fallback", () => {
    // Read through the public accessor. The comparison that matters is against a widget with no
    // entry of its own: if ours matched that, the table would be doing nothing.
    const mine = processCue("quadraticExplore", "wrong-direction");
    const generic = processCue("numeric", "wrong-direction");
    expect(mine).toBeTruthy();
    expect(mine).not.toBe(generic);
    expect(processCue("quadraticExplore", "oscillating")).not.toBe(processCue("numeric", "oscillating"));
  });

  it("has fixation copy for EVERY control name the component emits", () => {
    // The S116 rule: a half-filled table gives one control a specific nudge and its partner a
    // generic one, which reads as the engine not knowing what the learner did.
    const generic = processCue("numeric", "one-control-fixation");
    for (const control of ["a", "h", "k", "r1", "r2"])
      expect(
        processCue("quadraticExplore", "one-control-fixation", control),
        `no control-specific fixation copy for "${control}"`
      ).not.toBe(generic);
  });

  it("each control's cue is distinct — no copy-paste across controls", () => {
    const seen = ["a", "h", "k", "r1", "r2"].map((c) => processCue("quadraticExplore", "one-control-fixation", c));
    expect(new Set(seen).size).toBe(seen.length);
  });
});
