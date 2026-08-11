// @vitest-environment jsdom
/**
 * PROCESS-AWARE NOTICING — full-loop contract in the real player:
 *
 *  1. Three away-moves on an instrumented engine surface the tentative cue,
 *     near the object, in the engine's own copy.
 *  2. The cue latches: more bad moves don't stack or replace it.
 *  3. It never gates: Check works exactly as before, grading unchanged.
 *  4. It resets per step and never leaks onto the next one.
 *  5. Toward-only manipulation never triggers it (exploration ≠ misconception).
 *  6. It disappears once the step finalizes (the diagnosis takes over).
 *
 * Fixtures go through Lesson.parse so schema defaults are real (house rule).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import LessonPlayer from "./LessonPlayer";
import { Lesson, type TLesson } from "@/lib/schema";
import { progressStore } from "@/lib/progress";

const lesson: TLesson = Lesson.parse({
  id: "test-proc-01",
  slug: "test-proc",
  title: "Noticing Test Trail",
  courseId: "test",
  chapterId: "t1",
  minutes: 3,
  steps: [
    { id: "c0", kind: "concept", body: "Numbers live on a **line**; direction is meaning." },
    {
      id: "i1",
      kind: "interactive",
      body: "Find the spot.",
      conceptTag: "proc-line",
      widget: {
        type: "numberLinePlace",
        prompt: "Place -4 on the line.",
        min: -6,
        max: 6,
        step: 1,
        tickStep: 2,
        target: -4,
        start: 0,
        successFeedback: "That's -4: four steps left of zero.",
        lowFeedback: "Too far left — count back toward zero.",
        highFeedback: "Not far enough left — negative numbers grow leftward."
      }
    },
    {
      id: "i2",
      kind: "interactive",
      body: "Again, fresh.",
      conceptTag: "proc-line",
      widget: {
        type: "numberLinePlace",
        prompt: "Place 3 on the line.",
        min: -6,
        max: 6,
        step: 1,
        tickStep: 2,
        target: 3,
        start: 0,
        successFeedback: "That's 3.",
        lowFeedback: "Not far enough right.",
        highFeedback: "Too far right."
      }
    },
    { id: "k1", kind: "check", body: "Quick check.", conceptTag: "proc-line", widget: { type: "numeric", prompt: "How many steps from 0 to 4?", answer: 4, tolerance: 0, commonErrors: [{ value: 5, feedback: "5 counts the tick you started on — steps are the gaps, not the marks." }], fallbackFeedback: "Count the steps from zero along the line." }, explanationVariants: ["Count 4 steps.", "The line shows 4."] },
    { id: "k2", kind: "check", body: "Quick check.", conceptTag: "proc-line", widget: { type: "numeric", prompt: "How many steps from 0 to -2?", answer: 2, tolerance: 0, commonErrors: [{ value: -2, feedback: "-2 is the position; the DISTANCE walked is 2." }], fallbackFeedback: "Count the steps from zero along the line." }, explanationVariants: ["Count 2 steps.", "The line shows 2."] },
    { id: "k3", kind: "check", body: "Quick check.", conceptTag: "proc-line", widget: { type: "numeric", prompt: "How many steps from -1 to 2?", answer: 3, tolerance: 0, commonErrors: [{ value: 1, feedback: "1 subtracts positions the wrong way — count the gaps crossed." }], fallbackFeedback: "Count the steps from zero along the line." }, explanationVariants: ["Count 3 steps.", "The line shows 3."] },
    { id: "k4", kind: "check", body: "Quick check.", conceptTag: "proc-line", widget: { type: "numeric", prompt: "How many steps from -3 to -1?", answer: 2, tolerance: 0, commonErrors: [{ value: 4, feedback: "4 adds the sizes — the walk only crosses 2 gaps." }], fallbackFeedback: "Count the steps from zero along the line." }, explanationVariants: ["Count 2 steps.", "The line shows 2."] },
    { id: "r1", kind: "recap", body: "Done.", takeaways: ["Direction matters."] }
  ],
  remedials: []
});

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

const start = () => fireEvent.click(screen.getByRole("button", { name: /^Continue$/ })); // past c0
const slider = () => screen.getByRole("slider");
const setMarker = (v: number) => fireEvent.change(slider(), { target: { value: String(v) } });
const cue = () => screen.queryByTestId("process-cue");

describe("process-aware noticing in the player", () => {
  it("three away-moves surface the engine's tentative cue; toward-moves never do", () => {
    render(<LessonPlayer lesson={lesson} />);
    start();
    // target -4; drift the wrong way: 0→1→2→3 = three away-moves
    expect(cue()).toBeNull();
    setMarker(1);
    setMarker(2);
    expect(cue()).toBeNull(); // two is exploration
    setMarker(3);
    const el = cue();
    expect(el).toBeTruthy();
    expect(el!.textContent).toMatch(/moving away from where it needs to go/);
    expect(el!.textContent).toMatch(/It looks like/);
  });

  it("latches once per step and never blocks Check or changes grading", () => {
    render(<LessonPlayer lesson={lesson} />);
    start();
    setMarker(1);
    setMarker(2);
    setMarker(3);
    const first = cue()!.textContent;
    setMarker(4); // more bad moves after the latch
    setMarker(5);
    expect(cue()!.textContent).toBe(first); // unchanged, not stacked
    // the learner can still turn around, land it, and Check exactly as before
    setMarker(-4);
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    expect(screen.getByText(/four steps left of zero/)).toBeTruthy();
    // cue is gone once finalized — the outcome feedback owns the screen now
    expect(cue()).toBeNull();
  });

  it("treats a correct result as a saved checkpoint and keeps the model explorable", () => {
    render(<LessonPlayer lesson={lesson} />);
    start();
    setMarker(-4);
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));

    expect((slider() as HTMLInputElement).disabled).toBe(false);
    expect(screen.getByText(/Checkpoint saved. Keep exploring the model/)).toBeTruthy();

    setMarker(-3);
    fireEvent.click(screen.getByRole("button", { name: "Check this state" }));
    expect(screen.getByText(/This state does not meet the target/)).toBeTruthy();
    expect(screen.getByText(/Not far enough left/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /^Continue$/ })).toBeTruthy();
  });

  it("resets on step advance: the next step starts with a clean slate", () => {
    render(<LessonPlayer lesson={lesson} />);
    start();
    setMarker(1);
    setMarker(2);
    setMarker(3);
    expect(cue()).toBeTruthy();
    setMarker(-4);
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
    // step i2 (target 3): no cue, and two aways still aren't enough
    expect(cue()).toBeNull();
    setMarker(-1);
    setMarker(-2);
    expect(cue()).toBeNull();
    // pure toward-moves to the end: still silent
    setMarker(1);
    setMarker(2);
    setMarker(3);
    expect(cue()).toBeNull();
  });

  it("oscillation across the target reads as its own signal", () => {
    render(<LessonPlayer lesson={lesson} />);
    start();
    // target -4: cross it repeatedly: 0→-6 (past), →-2 (past), →-6 (past)
    setMarker(-6);
    setMarker(-2);
    setMarker(-6);
    const el = cue();
    expect(el).toBeTruthy();
    expect(el!.textContent).toMatch(/crossed back and forth/);
  });
});

describe("process evidence persistence (Pillar Two learner model)", () => {
  it("a latched signal on an interactive step lands in the concept's ledger — score untouched", () => {
    render(<LessonPlayer lesson={lesson} />);
    start();
    // i1 (target -4): three away-moves latch wrong-direction, then answer correctly.
    setMarker(1);
    setMarker(2);
    setMarker(3);
    expect(cue()).toBeTruthy();
    setMarker(-4);
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    const skill = progressStore.load().mastery?.["proc-line"];
    expect(skill?.signals).toEqual({ "wrong-direction": 1 });
    // interactive steps still contribute NO graded evidence: ledger only
    expect(skill?.mastery).toBe(0);
    expect(skill?.attempts).toBe(0);
    expect(skill?.lastSeen).toBeNull();
  });

  it("a clean, toward-only walk records nothing at all", () => {
    render(<LessonPlayer lesson={lesson} />);
    start();
    setMarker(-2);
    setMarker(-4);
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    expect(progressStore.load().mastery?.["proc-line"]).toBeUndefined();
  });

  it("graded evidence later on the same tag keeps the ledger and stays score-identical to a clean run", () => {
    const play = (thrash: boolean) => {
      window.localStorage.clear();
      cleanup();
      render(<LessonPlayer lesson={lesson} />);
      start();
      if (thrash) {
        setMarker(1);
        setMarker(2);
        setMarker(3);
      }
      setMarker(-4);
      fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
      fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
      // i2 clean, then k1 graded correctly → mastery evidence lands on proc-line
      setMarker(3);
      fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
      fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
      fireEvent.change(screen.getByRole("textbox"), { target: { value: "4" } });
      fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
      return progressStore.load().mastery!["proc-line"];
    };
    const clean = play(false);
    const thrashed = play(true);
    expect(thrashed.mastery).toBe(clean.mastery); // evidence, never a penalty
    expect(thrashed.attempts).toBe(clean.attempts);
    expect(clean.signals).toBeUndefined();
    expect(thrashed.signals).toEqual({ "wrong-direction": 1 });
  });
});

describe("per-control fixation in the player (two-parameter engines)", () => {
  const lineLesson: TLesson = Lesson.parse({
    id: "test-proc-02",
    slug: "test-proc-line",
    title: "Fixation Test Trail",
    courseId: "test",
    chapterId: "t1",
    minutes: 3,
    steps: [
      { id: "c0", kind: "concept", body: "A line's **slope** tilts it; its intercept slides it." },
      {
        id: "i1",
        kind: "interactive",
        body: "Build the line.",
        conceptTag: "proc-slope",
        widget: {
          type: "lineExplore",
          prompt: "Make y = 2x + 1.",
          targetSlope: 2,
          targetIntercept: 1,
          successFeedback: "Slope 2 with intercept 1 matches the target line.",
          slopeFeedback: "The tilt is off — the rise over one run must be 2.",
          interceptFeedback: "The crossing is off — it must meet the y-axis at 1."
        }
      },
      { id: "k1", kind: "check", body: "Quick check.", conceptTag: "proc-slope", widget: { type: "numeric", prompt: "What is the slope of y = 2x + 1?", answer: 2, tolerance: 0, commonErrors: [{ value: 1, feedback: "1 is the intercept — the slope multiplies x." }], fallbackFeedback: "Read the value from y = 2x + 1." }, explanationVariants: ["Substitute into y = 2x + 1.", "Two per step above the crossing at 1."] },
      { id: "k2", kind: "check", body: "Quick check.", conceptTag: "proc-slope", widget: { type: "numeric", prompt: "Where does y = 2x + 1 cross the y-axis?", answer: 1, tolerance: 0, commonErrors: [{ value: 2, feedback: "2 is the slope — the crossing is the constant term." }], fallbackFeedback: "Read the value from y = 2x + 1." }, explanationVariants: ["Substitute into y = 2x + 1.", "Two per step above the crossing at 1."] },
      { id: "k3", kind: "check", body: "Quick check.", conceptTag: "proc-slope", widget: { type: "numeric", prompt: "At x = 2, what is y?", answer: 5, tolerance: 0, commonErrors: [{ value: 4, feedback: "4 is 2×2 alone — the +1 still has to be added." }], fallbackFeedback: "Read the value from y = 2x + 1." }, explanationVariants: ["Substitute into y = 2x + 1.", "Two per step above the crossing at 1."] },
      { id: "k4", kind: "check", body: "Quick check.", conceptTag: "proc-slope", widget: { type: "numeric", prompt: "At x = 3, what is y?", answer: 7, tolerance: 0, commonErrors: [{ value: 6, feedback: "6 is 2×3 alone — the +1 still has to be added." }], fallbackFeedback: "Read the value from y = 2x + 1." }, explanationVariants: ["Substitute into y = 2x + 1.", "Two per step above the crossing at 1."] },
      { id: "k5", kind: "check", body: "Quick check.", conceptTag: "proc-slope", widget: { type: "numeric", prompt: "At x = 5, what is y?", answer: 11, tolerance: 0, commonErrors: [{ value: 10, feedback: "10 is 2×5 alone — the +1 still has to be added." }], fallbackFeedback: "Read the value from y = 2x + 1." }, explanationVariants: ["Substitute into y = 2x + 1.", "Two per step above the crossing at 1."] },
      { id: "r1", kind: "recap", body: "Done.", takeaways: ["m tilts, b slides."] }
    ],
    remedials: []
  });

  it("riding only the intercept latches the b-fixation cue and persists the signal", () => {
    render(<LessonPlayer lesson={lineLesson} />);
    start(); // past c0
    const b = () => screen.getByRole("slider", { name: /intercept b/ });
    // Four b-moves, never touching m: 3 (away from 1), 4 (away), 2 (toward), 5 (away)
    for (const v of [3, 4, 2, 5]) fireEvent.change(b(), { target: { value: String(v) } });
    const cueEl = screen.getByTestId("process-cue");
    expect(cueEl.textContent).toContain("steepness hasn't changed");
    // finalize (correct) → ledger carries the fixation on the tag, score untouched
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "2" } });
    fireEvent.change(b(), { target: { value: "1" } });
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    const skill = progressStore.load().mastery?.["proc-slope"];
    expect(skill?.signals).toEqual({ "one-control-fixation": 1 });
    expect(skill?.attempts).toBe(0);
  });

  it("alternating both controls never fixates, even with some away-moves", () => {
    render(<LessonPlayer lesson={lineLesson} />);
    start(); // past c0
    fireEvent.change(screen.getByRole("slider", { name: /intercept b/ }), { target: { value: "3" } }); // away
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "1" } }); // toward
    fireEvent.change(screen.getByRole("slider", { name: /intercept b/ }), { target: { value: "2" } }); // toward
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "2" } }); // silent (arrival)
    expect(screen.queryByTestId("process-cue")).toBeNull();
  });
});
