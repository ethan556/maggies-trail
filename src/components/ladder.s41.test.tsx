// @vitest-environment jsdom
/**
 * ADAPTIVE-RESPONSE LADDER — full-loop contract in the real player (s41):
 *
 *  1. First latch of a signal → the tentative cue (noticing question).
 *  2. Second latch (later step) → the structural response: on lineExplore the
 *     misused control LOCKS with a chip; the first move elsewhere releases it.
 *  3. The ladder survives resume: signalCounts persist in the lesson snapshot,
 *     so a refresh cannot re-arm rung one.
 *  4. Third latch arms the remedial rung; it fires only when the step ends
 *     revealed (struggle that self-resolves stays evidence, not intervention),
 *     injecting the concept's remedial pair once.
 *  5. Fluent learners (two unaided first-tries) get NO response at any rung.
 *
 * Fixtures go through Lesson.parse so schema defaults are real (house rule).
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import LessonPlayer from "./LessonPlayer";
import { Lesson, type TLesson } from "@/lib/schema";

const line = (over: Record<string, unknown>) => ({
  type: "lineExplore",
  prompt: "Match the line y = 2x + 3.",
  targetSlope: 2,
  targetIntercept: 3,
  slopeStart: 2, // slope pre-matched: adjusting it witnesses slope-for-intercept
  interceptStart: 0,
  successFeedback: "Matched.",
  slopeFeedback: "Slope is off.",
  interceptFeedback: "Intercept is off.",
  swappedFeedback: "m and b traded places.",
  signFeedback: "A sign flipped.",
  ...over
});

const filler = (id: string, q: string, a: number) => ({
  id,
  kind: "check",
  body: "Steady on.",
  conceptTag: "lad-line",
  widget: { type: "numeric", prompt: q, answer: a, tolerance: 0, commonErrors: [], fallbackFeedback: "Count it." },
  explanationVariants: ["Count it.", "Count again."]
});

const ladderLesson: TLesson = Lesson.parse({
  id: "test-ladder-01",
  slug: "test-ladder",
  title: "Ladder Test Trail",
  courseId: "test",
  chapterId: "t1",
  minutes: 4,
  steps: [
    { id: "c0", kind: "concept", body: "Lines have a **tilt** and a crossing height." },
    { id: "i1", kind: "interactive", body: "Match it.", conceptTag: "lad-line", widget: line({}) },
    { id: "i2", kind: "interactive", body: "Match it again.", conceptTag: "lad-line", widget: line({}) },
    {
      id: "k1",
      kind: "check",
      body: "Now for keeps.",
      conceptTag: "lad-line",
      widget: line({}),
      explanationVariants: ["Slope tilts, intercept slides.", "b is where it crosses."]
    },
    filler("f1", "1 + 1?", 2),
    filler("f2", "2 + 2?", 4),
    filler("f3", "3 + 3?", 6),
    { id: "r1", kind: "recap", body: "Done.", takeaways: ["Two controls, two jobs."] }
  ],
  remedials: [
    {
      conceptTag: "lad-line",
      concept: { id: "rc1", kind: "concept", body: "Bridge: the intercept is the crossing height at x = 0." },
      check: {
        id: "rk1",
        kind: "check",
        body: "Bridge check.",
        conceptTag: "lad-line",
        widget: {
          type: "numeric",
          prompt: "Where does y = 2x + 3 cross the y-axis?",
          answer: 3,
          tolerance: 0,
          commonErrors: [{ value: 2, feedback: "2 is the slope — the crossing height is the +3." }],
          fallbackFeedback: "Read the +3 in y = 2x + 3."
        },
        explanationVariants: ["The +3 is the crossing.", "At x = 0, y = 3."]
      }
    }
  ]
});

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

const start = () => fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
const slope = () => screen.getByRole("slider", { name: /slope/i });
const intercept = () => screen.getByRole("slider", { name: /intercept/i });
const cue = () => screen.queryByTestId("process-cue");
const chip = () => screen.queryByTestId("lock-chip");
/** The real confusion pattern: nudge the already-correct slope, return it,
 * nudge again — two departures from correctness, the second tag latches.
 * (Returning to the target emits nothing: arriving is success, not evidence.) */
const latchConfusion = () => {
  fireEvent.change(slope(), { target: { value: "3" } });
  fireEvent.change(slope(), { target: { value: "2" } });
  fireEvent.change(slope(), { target: { value: "3" } });
};
const answerRight = () => {
  fireEvent.change(slope(), { target: { value: "2" } });
  fireEvent.change(intercept(), { target: { value: "3" } });
  fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
  fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
};

describe("the response ladder in the player", () => {
  it("rung 1 cues; rung 2 locks the misused control and the first move elsewhere releases it", () => {
    render(<LessonPlayer lesson={ladderLesson} />);
    start();
    latchConfusion(); // i1 — occurrence 1
    expect(cue()?.textContent).toMatch(/tilt already matches/i);
    expect(chip()).toBeNull();
    answerRight();

    latchConfusion(); // i2 — occurrence 2 → lock m
    expect(chip()?.textContent).toMatch(/slope is resting/i);
    expect((slope() as HTMLInputElement).disabled).toBe(true);
    expect((intercept() as HTMLInputElement).disabled).toBe(false);

    fireEvent.change(intercept(), { target: { value: "1" } }); // first move elsewhere
    expect(chip()).toBeNull();
    expect((slope() as HTMLInputElement).disabled).toBe(false);
  });

  it("the ladder survives resume: a refresh cannot re-arm rung one", () => {
    const first = render(<LessonPlayer lesson={ladderLesson} />);
    start();
    latchConfusion(); // occurrence 1 recorded
    answerRight(); // advance = durable checkpoint (signalCounts saved)
    first.unmount();

    render(<LessonPlayer lesson={ladderLesson} />); // resumes at i2
    latchConfusion(); // occurrence 2 straight away
    expect(chip()?.textContent).toMatch(/slope is resting/i);
    expect((slope() as HTMLInputElement).disabled).toBe(true);
    expect(cue()).toBeNull(); // no rung-1 cue on the resumed ladder
  });

  it("rung 3 arms the remedial; a revealed graded step injects the pair once", () => {
    render(<LessonPlayer lesson={ladderLesson} />);
    start();
    latchConfusion();
    answerRight(); // i1: occurrence 1
    latchConfusion();
    fireEvent.change(intercept(), { target: { value: "3" } }); // release lock
    fireEvent.change(slope(), { target: { value: "2" } });
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Continue$/ })); // i2: occurrence 2

    latchConfusion(); // k1: occurrence 3 → pendingRemedial armed, silently
    expect(chip()).toBeNull();
    // Wrong twice on the graded step → revealed → the fold injects the pair.
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    fireEvent.click(screen.getByRole("button", { name: /try again/i }));
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
    expect(screen.getByText(/Bridge: the intercept is the crossing height/)).toBeTruthy();
  });

  it("fluent learners get no response at any rung", () => {
    const fluentLesson: TLesson = Lesson.parse({
      ...ladderLesson,
      id: "test-ladder-02",
      slug: "test-ladder-2",
      steps: [
        ladderLesson.steps[0],
        {
          id: "q1",
          kind: "check",
          body: "Warm-up.",
          conceptTag: "lad-line",
          widget: { type: "numeric", prompt: "2 + 3?", answer: 5, tolerance: 0, commonErrors: [], fallbackFeedback: "Add them." },
          explanationVariants: ["It's 5.", "Five."]
        },
        {
          id: "q2",
          kind: "check",
          body: "Warm-up.",
          conceptTag: "lad-line",
          widget: { type: "numeric", prompt: "4 + 3?", answer: 7, tolerance: 0, commonErrors: [], fallbackFeedback: "Add them." },
          explanationVariants: ["It's 7.", "Seven."]
        },
        ladderLesson.steps[1],
        filler("f1", "1 + 1?", 2),
        filler("f2", "2 + 2?", 4),
        filler("f3", "3 + 3?", 6),
        ladderLesson.steps[7]
      ],
      remedials: []
    });
    render(<LessonPlayer lesson={fluentLesson} />);
    start();
    for (const ans of ["5", "7"]) {
      fireEvent.change(screen.getByRole("textbox"), { target: { value: ans } });
      fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
      fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));
    }
    latchConfusion(); // signal latches, but the learner is fluent
    expect(cue()).toBeNull();
    expect(chip()).toBeNull();
  });
});
