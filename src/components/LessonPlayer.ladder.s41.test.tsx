// @vitest-environment jsdom
/**
 * ADAPTIVE-RESPONSE LADDER in the real player (s41) — the full contract:
 *
 *  1st latch of a signal  → tentative cue near the object.
 *  2nd latch (next step)  → the misused control LOCKS, with the engine's own
 *                           chip explaining why; the lock releases on the
 *                           learner's first move on the OTHER control — a
 *                           moment of contrast, never a cage.
 *  3rd latch + wrong check → the concept's remedial pair is injected even
 *                           where outcome history alone wouldn't yet do it.
 *  RESUME coverage lives in ladder.s41.test.tsx (single shared resume test
 *  with the union of asserts — chip, disabled state, no repeated cue).
 *
 * The fixture drives the slope↔intercept confusion tag on lineExplore: every
 * step starts with the SLOPE already correct, so moving the slope slider is
 * definitionally the misused control.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import LessonPlayer from "./LessonPlayer";
import { Lesson, type TLesson } from "@/lib/schema";

const line = (id: string, targetIntercept: number) => ({
  id,
  kind: "check" as const,
  body: "Match the line.",
  conceptTag: "lin-si",
  widget: {
    type: "lineExplore" as const,
    prompt: "Tune the line to match.",
    targetSlope: 2,
    targetIntercept,
    slopeStart: 2, // slope already correct — the remaining gap is the intercept
    interceptStart: 0,
    successFeedback: "Matched.",
    slopeFeedback: "Slope is off.",
    interceptFeedback: "Intercept is off."
  },
  explanationVariants: ["The slope was already right.", "Only b needed to move."]
});

const lesson: TLesson = Lesson.parse({
  id: "test-ladder-01",
  slug: "test-ladder",
  title: "Ladder Test Trail",
  courseId: "test",
  chapterId: "t1",
  minutes: 3,
  steps: [
    { id: "c0", kind: "concept", body: "Lines have a **tilt** and a **crossing point**." },
    line("k1", 3),
    line("k2", -2),
    line("k3", 4),
    line("k4", 5),
    { id: "cx", kind: "concept", body: "The tilt is m." },
    { id: "cy", kind: "concept", body: "The crossing is b." },
    { id: "r1", kind: "recap", body: "Done.", takeaways: ["m tilts, b slides."] }
  ],
  remedials: [
    {
      conceptTag: "lin-si",
      concept: { id: "rem-c", kind: "concept", body: "REMEDIAL: the slope control tilts; the intercept control slides." },
      check: {
        id: "rem-k",
        kind: "check",
        body: "One more.",
        conceptTag: "lin-si",
        widget: {
          type: "numeric",
          prompt: "y = 2x + 5 crosses the y-axis at…",
          answer: 5,
          tolerance: 0,
          fallbackFeedback: "The + number is the crossing."
        },
        explanationVariants: ["b is the crossing.", "Read the + 5."]
      }
    }
  ]
});

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

const start = () => fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
const mSlider = () => screen.getByRole("slider", { name: /slope/i }) as HTMLInputElement;
const bSlider = () => screen.getByRole("slider", { name: /intercept/i }) as HTMLInputElement;
const setM = (v: number) => fireEvent.change(mSlider(), { target: { value: String(v) } });
const setB = (v: number) => fireEvent.change(bSlider(), { target: { value: String(v) } });
const check = () => fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
const cont = () => fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));

/** Latch slope-for-intercept on the current step: two detached wrong-control
 * moves (2→3 tags; 3→2 lands exactly and emits nothing; 2→3 tags again). */
const latchConfusion = () => {
  setM(3);
  setM(2);
  setM(3);
  setM(2); // leave the slope back on target for a clean solve
};

const solve = (b: number) => {
  setB(b);
  check();
  cont();
};

describe("the response ladder, end to end", () => {
  it("cue on the first latch, lock with chip on the second, release on the other control", () => {
    render(<LessonPlayer lesson={lesson} />);
    start();

    // ── k1: first latch → tentative cue in the confusion's own words ──
    latchConfusion();
    const cue = screen.getByTestId("process-cue");
    expect(cue.textContent).toMatch(/tilt already matches/i);
    expect(mSlider().disabled).toBe(false);
    solve(3);

    // ── k2: second latch → the slope control locks, chip explains ──
    latchConfusion();
    expect(mSlider().disabled).toBe(true);
    expect(screen.getByTestId("lock-chip").textContent).toMatch(/resting for a moment/i);

    // first move on the OTHER control releases the lock
    setB(-1);
    expect(mSlider().disabled).toBe(false);
    expect(screen.queryByTestId("lock-chip")).toBeNull();
    // Solve k2 with one miss first: the third-rung check below must not read
    // as fluent (two first-try successes would rightly suppress the ladder).
    check(); // -1 is wrong → retry
    fireEvent.click(screen.getByRole("button", { name: /^Try again$/ }));
    setB(-2);
    check();
    cont();

    // ── k3: third latch + a wrong answer → the remedial pair is injected ──
    latchConfusion();
    setB(1); // wrong intercept
    check(); // first miss → retry phase
    fireEvent.click(screen.getByRole("button", { name: /^Try again$/ }));
    check(); // second miss finalizes
    cont();
    expect(screen.getByText(/REMEDIAL: the slope control tilts/)).toBeTruthy();
  });
});

describe("fluent learners are never slowed", () => {
  it("after two first-try successes, a latch produces no response at all", () => {
    render(<LessonPlayer lesson={lesson} />);
    start();
    solve(3); // k1, first try
    solve(-2); // k2, first try — the learner is demonstrably fluent
    latchConfusion(); // k3: the signal still classifies and is still EVIDENCE…
    expect(screen.queryByTestId("process-cue")).toBeNull(); // …but nothing slows them
    expect(screen.queryByTestId("lock-chip")).toBeNull();
    expect(mSlider().disabled).toBe(false);
  });
});
