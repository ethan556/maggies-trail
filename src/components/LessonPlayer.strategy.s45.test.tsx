// @vitest-environment jsdom
/**
 * STRATEGY-AWARE PLAYER (s45) — the LIVE pipe, end to end, for the two engines
 * instrumented this session. Unit tests prove the classifiers on synthetic
 * events; this file proves the whole chain in the real player:
 *
 *   real taps → widget emits {control, dir, state} → detectStrategy routes to
 *   the DOMAIN classifier → noteSignal walks the SAME adaptive ladder → the
 *   strategy's mathematically-specific cue renders near the object.
 *
 *  · numberLineHop: three landings crossing the target ("past" ×3) latch
 *    repeated-overshoot — the cue names the overshoot pattern, not the answer.
 *  · baseTenCompose: ten one-at-a-time Ones taps with the tens rod untouched
 *    latch counting-by-one — the cue points at grouping, and never reveals
 *    the target build.
 *  · silence guard: two moves (below MIN_MOVES) latch NOTHING — exploration
 *    is not yet evidence, exactly the classifier contract.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import LessonPlayer from "./LessonPlayer";
import { Lesson, type TLesson } from "@/lib/schema";

const hopStep = (id: string) => ({
  id,
  kind: "check" as const,
  body: "Hop it out.",
  conceptTag: "nl-hop",
  widget: {
    type: "numberLineHop" as const,
    prompt: "Start at 2 and make 2 hops of 2.",
    min: 0,
    max: 10,
    start: 2,
    hop: 2,
    hops: 2, // landing = 6
    missFeedback: "Count the hops from 2.",
    successFeedback: "Landed."
  },
  explanationVariants: ["Two hops of 2 from 2 lands on 6.", "2 + 2 + 2 = 6."]
});

const baseTenStep = (id: string) => ({
  id,
  kind: "check" as const,
  body: "Build it.",
  conceptTag: "bt-build",
  widget: {
    type: "baseTenCompose" as const,
    prompt: "Build 34 with tens and ones.",
    target: 34,
    missFeedback: "Check the tens and ones.",
    successFeedback: "Built."
  },
  explanationVariants: ["3 tens and 4 ones make 34.", "30 + 4 = 34."]
});

const mkLesson = (steps: unknown[]): TLesson =>
  Lesson.parse({
    id: "test-strategy-01",
    slug: "test-strategy",
    title: "Strategy Test Trail",
    courseId: "test",
    chapterId: "t1",
    minutes: 3,
    steps: [
      { id: "c0", kind: "concept", body: "Numbers live on a **line** and in **columns**." },
      ...steps,
      { id: "cx", kind: "concept", body: "Hops move you along the line." },
      { id: "cy", kind: "concept", body: "Ten ones make a ten." },
      { id: "cz", kind: "concept", body: "Columns hold place value." },
      { id: "r1", kind: "recap", body: "Done.", takeaways: ["Lines and columns."] }
    ]
  });

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

const start = () => fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
const land = (n: number) => fireEvent.click(screen.getByRole("radio", { name: `Land on ${n}` }));

describe("number line: repeated overshoot latches through real landings", () => {
  it("three crossings of the landing produce the overshoot cue, mid-work, target unrevealed", () => {
    render(<LessonPlayer lesson={mkLesson([hopStep("k1"), hopStep("k2"), hopStep("k3"), hopStep("k4")])} />);
    start();
    // Landing is 6. Each tap crosses it: 2→8 (past), 8→4 (past), 4→8 (past).
    land(8);
    land(4);
    expect(screen.queryByText(/passing the target/)).toBeNull(); // 2 moves: silence
    land(8);
    // Third "past" latches repeated-overshoot; the strategy cue renders.
    expect(screen.getByText(/You keep passing the target/)).toBeTruthy();
    // The cue coaches the PROCESS — it must not name the landing.
    expect(screen.queryByText(/\b6\b.*answer|answer.*\b6\b/)).toBeNull();
  });
});

describe("base ten: counting-by-one latches through real Ones taps", () => {
  it("ten single-ones adds with the tens rod untouched produce the grouping cue", () => {
    render(<LessonPlayer lesson={mkLesson([baseTenStep("k1"), baseTenStep("k2"), baseTenStep("k3"), baseTenStep("k4")])} />);
    start();
    // Stepper is declared inside the widget, so its buttons REMOUNT on every
    // render — re-query per tap (a held node goes stale after one click).
    const addOne = () => fireEvent.click(screen.getByRole("button", { name: "Add a Ones unit" }));
    for (let i = 0; i < 9; i++) addOne();
    expect(screen.queryByText(/counting one at a time/)).toBeNull(); // 9 is under the floor
    addOne(); // the 10th single-one move
    const cue = screen.getByText(/counting one at a time/);
    expect(cue.textContent).toMatch(/grouping/); // coaches the strategy…
    // …and never the decomposition: the prompt may name 34 (the task), but
    // the CUE must carry no digits — no "3 tens", no "4 ones", no answer.
    expect(cue.textContent).not.toMatch(/\d/);
  });
});
