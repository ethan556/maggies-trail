// @vitest-environment jsdom
/**
 * HINT REACHABILITY (s200).
 *
 * The player rendered its hint control behind `s.kind === "challenge" || s.kind === "check"`,
 * while three other layers were already kind-agnostic:
 *
 *   - `usePlayer.hint()`      advances `hintsShown` for ANY step carrying `hints`;
 *   - the ladder renderer     draws `s.hints.slice(0, hintsShown)` for ANY step;
 *   - `xpFor()`               prices "interactive" hints at the same −2 XP as a check.
 *
 * The consequence was silent: 118 authored `interactive` hint ladders across nine courses
 * (decimal-operations 27, fractions-multiply 22, ratios-rates 17, decimals-place-value 12,
 * number-system 12, volume-measurement 12, coordinate-geometry 8, expressions-equations 7,
 * data-distributions 1) could never be surfaced by any learner action — no button, and
 * Enter does not call hint(). Authored scaffolding that the product could not deliver.
 *
 * The fixture mirrors the real shape of the stranded steps (dop-01-01 `i1`: kind
 * "interactive", numeric widget, three-rung ladder). Each assert below fails if the kind
 * gate is reintroduced, if hints leak onto ungraded steps, or if interactive hints stop
 * being priced.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import LessonPlayer from "./LessonPlayer";
import { Lesson, type TLesson } from "@/lib/schema";
import { usePlayer } from "./playerStore";
import { xpFor } from "@/lib/engine";

const HINTS = ["Add first: 2 + 3.", "That's 5.", "Then 5 x 4 = 20."];
const EXPLAIN = [
  "Left to right ignores that x binds tighter than +.",
  "Grouping decides the value, not reading order."
];

const numericWidget = {
  type: "numeric" as const,
  prompt: "Working strictly left to right, what would you get?",
  answer: 20,
  tolerance: 0,
  unit: "",
  fallbackFeedback: "Adding first: 2+3 = 5, then 5x4 = 20."
};

const lesson: TLesson = Lesson.parse({
  id: "test-hintreach-01",
  slug: "test-hintreach",
  title: "Hint Reachability Trail",
  courseId: "test",
  chapterId: "t1",
  minutes: 3,
  steps: [
    { id: "c0", kind: "concept", body: "Order of operations decides the value." },
    {
      id: "i1",
      kind: "interactive",
      body: "See the two answers.",
      conceptTag: "order-matters",
      hints: HINTS,
      widget: numericWidget,
      explanationVariants: [EXPLAIN[0], EXPLAIN[1]]
    },
    {
      id: "k1",
      kind: "check",
      body: "Now you try.",
      conceptTag: "order-matters",
      hints: ["Multiply before you add."],
      widget: { ...numericWidget, answer: 14 },
      explanationVariants: ["Multiplication binds tighter.", "x before + unless parentheses say otherwise."]
    },
    { id: "c1", kind: "concept", body: "Parentheses override the default order." },
    {
      id: "k2",
      kind: "check",
      body: "With parentheses now.",
      conceptTag: "order-matters",
      hints: ["Do the bracket first."],
      widget: { ...numericWidget, prompt: "What is (2 + 3) x 4?", answer: 20 },
      explanationVariants: ["Brackets first, then multiply.", "The bracket makes 5, and 5 x 4 = 20."]
    },
    { id: "c2", kind: "concept", body: "Same symbols, different grouping, different value." },
    {
      id: "k3",
      kind: "challenge",
      body: "Put it together.",
      conceptTag: "order-matters",
      hints: ["Find the multiplication.", "Do it before either addition."],
      widget: { ...numericWidget, prompt: "What is 1 + 2 x 3 + 4?", answer: 11 },
      explanationVariants: ["Multiply 2 x 3 first.", "1 + 6 + 4 = 11."]
    },
    { id: "r1", kind: "recap", body: "Done.", takeaways: ["Multiply before add."] }
  ]
});

function hintButton(): HTMLElement | null {
  return screen.queryByRole("button", { name: /hint/i });
}

/** Advance off an ungraded step exactly as a learner does. */
const advance = () => fireEvent.click(screen.getByRole("button", { name: /^Continue$/ }));

describe("hint reachability on interactive steps", () => {
  beforeEach(() => {
    cleanup();
    // Mid-lesson resume persists position; without this the previous test's
    // progress is restored and the fixture no longer starts at step 0.
    window.localStorage.clear();
  });

  it("offers the hint control on an interactive step that authored a ladder", () => {
    render(<LessonPlayer lesson={lesson} />);
    advance(); // concept -> interactive

    expect(usePlayer.getState().queue[usePlayer.getState().i].kind).toBe("interactive");
    // The stranded case: the control existed for check/challenge only, so this
    // assertion is exactly what a reintroduced kind gate would break.
    expect(hintButton()).not.toBeNull();
  });

  it("walks the authored rungs one at a time and stops at the last one", () => {
    render(<LessonPlayer lesson={lesson} />);
    advance();

    // Nothing shown before the learner asks.
    expect(screen.queryByText(HINTS[0])).toBeNull();

    fireEvent.click(hintButton()!);
    expect(screen.getByText(HINTS[0])).toBeTruthy();
    expect(screen.queryByText(HINTS[1])).toBeNull(); // progressive, never all at once

    fireEvent.click(hintButton()!);
    expect(screen.getByText(HINTS[1])).toBeTruthy();

    fireEvent.click(hintButton()!);
    expect(screen.getByText(HINTS[2])).toBeTruthy();
    expect(usePlayer.getState().hintsShown).toBe(HINTS.length);

    // Ladder exhausted -> the control retires rather than dead-clicking.
    expect(hintButton()).toBeNull();
  });

  it("does not offer hints on ungraded concept or recap steps", () => {
    render(<LessonPlayer lesson={lesson} />);
    expect(usePlayer.getState().queue[usePlayer.getState().i].kind).toBe("concept");
    expect(hintButton()).toBeNull();
  });

  it("shows the authored explanation after an interactive step is finalized", () => {
    render(<LessonPlayer lesson={lesson} />);
    advance(); // -> interactive

    // Nothing while the learner is still working.
    expect(screen.queryByText(EXPLAIN[0])).toBeNull();

    fireEvent.change(screen.getByRole("textbox"), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));

    expect(usePlayer.getState().phase).toBe("correct");
    // The kind gate used to drop this entirely on interactive steps: the learner
    // explored, was told "correct", and never got the "why".
    expect(screen.getByText(EXPLAIN[0])).toBeTruthy();

    // And the second variant is still reachable through the existing swap control.
    fireEvent.click(screen.getByRole("button", { name: /explain/i }));
    expect(screen.getByText(EXPLAIN[1])).toBeTruthy();
  });

  it("prices an interactive hint exactly as the existing XP rule always did", () => {
    // Not a new rule — proof that the rule was already written for this kind and
    // only the control was missing. First-try interactive base is 10; each rung -2.
    expect(xpFor("interactive", 0, 0, false)).toBe(10);
    expect(xpFor("interactive", 0, 1, false)).toBe(8);
    expect(xpFor("interactive", 0, 3, false)).toBe(4);
  });

  it("keeps the check-step behaviour it always had", () => {
    render(<LessonPlayer lesson={lesson} />);
    advance(); // -> interactive
    usePlayer.getState().next(); // interactive is answered, not skipped; jump to the check
    expect(usePlayer.getState().queue[usePlayer.getState().i].kind).toBe("check");
    expect(hintButton()).not.toBeNull();
  });
});

/**
 * FIGURE REACHABILITY (s200, third instance of the same class).
 *
 * `{s.kind === "concept" && s.figure && FIGURE_IDS.has(s.figure)}` discarded the authored,
 * REGISTERED figure on two interactive steps — cp-01-02 `i1` (perp-bisector-stage1) and
 * cp-01-03 `i1` (angle-bisector-construction) — so two construction lessons opened their
 * steppedReveal with no construction on screen. Only concept and interactive steps author
 * `figure` anywhere in the corpus, so availability plus FIGURE_IDS membership is the whole guard.
 *
 * The label suppression matters: the widget block renders its own TrailClearingLabel, so a
 * figure-bearing interactive step would otherwise show that decorative label twice.
 */
describe("figure reachability on interactive steps", () => {
  const REAL_FIGURE = "perp-bisector-stage1"; // registered in FIGURE_IDS

  const figureLesson: TLesson = Lesson.parse({
    id: "test-figreach-01",
    slug: "test-figreach",
    title: "Figure Reachability Trail",
    courseId: "test",
    chapterId: "t1",
    minutes: 3,
    steps: [
      { id: "c0", kind: "concept", body: "A construction fixes a point by two constraints.", figure: REAL_FIGURE },
      {
        id: "i1",
        kind: "interactive",
        body: "Walk the construction.",
        conceptTag: "constructions",
        figure: REAL_FIGURE,
        widget: numericWidget
      },
      {
        id: "k1",
        kind: "check",
        body: "Now you try.",
        conceptTag: "constructions",
        hints: ["Two constraints, one point."],
        widget: { ...numericWidget, answer: 14 },
        explanationVariants: ["Both constraints must hold.", "One constraint leaves a whole line."]
      },
      { id: "c1", kind: "concept", body: "The same recipe bisects an angle." },
      {
        id: "k2",
        kind: "check",
        body: "Again.",
        conceptTag: "constructions",
        hints: ["Same recipe."],
        widget: { ...numericWidget, answer: 20 },
        explanationVariants: ["Equal radii.", "The compass never changes."]
      },
      { id: "c2", kind: "concept", body: "Constructions prove; drawings only suggest." },
      {
        id: "k3",
        kind: "challenge",
        body: "Put it together.",
        conceptTag: "constructions",
        hints: ["Find the two constraints.", "Intersect them."],
        widget: { ...numericWidget, answer: 11 },
        explanationVariants: ["Intersection of two loci.", "Each arc is a constraint."]
      },
      { id: "r1", kind: "recap", body: "Done.", takeaways: ["Two constraints fix a point."] }
    ]
  });

  const figureNode = () => document.querySelector(".figure-reveal");
  const clearingLabels = () => document.querySelectorAll(".trail-clearing-label");

  beforeEach(() => {
    cleanup();
    window.localStorage.clear();
  });

  it("renders an authored registered figure on an interactive step", () => {
    render(<LessonPlayer lesson={figureLesson} />);
    advance(); // concept -> interactive

    expect(usePlayer.getState().queue[usePlayer.getState().i].kind).toBe("interactive");
    // The kind gate used to drop this entirely.
    expect(figureNode()).not.toBeNull();
  });

  it("does not place decorative stage-kind labels ahead of the widget", () => {
    render(<LessonPlayer lesson={figureLesson} />);
    advance(); // -> interactive, which has BOTH a figure and a widget

    expect(clearingLabels().length).toBe(0);
  });

  it("keeps the concept-step figure without adding shell copy above it", () => {
    render(<LessonPlayer lesson={figureLesson} />);
    expect(usePlayer.getState().queue[usePlayer.getState().i].kind).toBe("concept");
    expect(figureNode()).not.toBeNull();
    expect(clearingLabels().length).toBe(0);
  });

  it("renders no figure block on a step that authors none", () => {
    render(<LessonPlayer lesson={figureLesson} />);
    advance(); // -> i1 interactive (has figure)
    expect(figureNode()).not.toBeNull();

    // Answer and continue through the UI: a direct store call would not re-render.
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "20" } });
    fireEvent.click(screen.getByRole("button", { name: /^Check$/ }));
    advance(); // -> k1 check, which authors no figure

    expect(usePlayer.getState().queue[usePlayer.getState().i].id).toBe("k1");
    expect(figureNode()).toBeNull();
  });
});
