// @vitest-environment jsdom
/**
 * P1 gate fallback (Playwright browsers not installable in this env — see QA_LOG):
 * a scripted DOM walk of the REAL LessonPlayer + REAL seed lesson content.
 * Covers the same assertions the Playwright spec (e2e/lesson.spec.ts) makes:
 *  1. correct path start-to-finish → completion screen + XP total
 *  2. forced-miss path → misconception-diagnosing feedback text (differentiator #1)
 *  3. two misses on one conceptTag → remedial pair injected, trail grows (differentiator #3)
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import React from "react";
import LessonPlayer from "./LessonPlayer";
import { Lesson } from "@/lib/schema";
import seedJson from "../../content/courses/multiplication-division/lessons/mult-01-01.json";

const lesson = Lesson.parse(seedJson);

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

const btn = (name: RegExp) => screen.getByRole("button", { name });
const radio = (name: RegExp) => screen.getByRole("radio", { name });
const clickContinue = () => fireEvent.click(btn(/^Continue$/));
const clickCheck = () => fireEvent.click(btn(/^Check$/));

/** i1 now opens with a prediction gate (added in the flagship tier upgrades):
 * the manipulative is mounted but inert until the learner commits. Commitments
 * are ungraded, so the walk picks the first option. */
function commitPrediction() {
  fireEvent.click(screen.getAllByRole("radio")[0]);
}

function setSlider(v: number) {
  // The learner can't touch the manipulative before committing the prediction
  // gate; the walk honors the same rule wherever it reaches for the slider.
  if (screen.queryByText(/Make a prediction first/)) commitPrediction();
  const slider = screen.getByRole("slider");
  fireEvent.change(slider, { target: { value: String(v) } });
}
function typeNumber(v: string) {
  const input = screen.getByRole("textbox");
  fireEvent.change(input, { target: { value: v } });
}

/** Plays i1 (slider→5), k1 (mcq a), c2, k2 (12), i2 (both 3-cookie plates), k3 (b), k4 (5), ch1 (18). */
function playCorrectFrom(step: "i1" | "k1") {
  if (step === "i1") {
    commitPrediction();
    setSlider(5);
    clickCheck();
    clickContinue();
  }
  // k1
  fireEvent.click(radio(/3 bags with 4 apples in each bag/));
  clickCheck();
  clickContinue();
  clickContinue(); // c2 concept
  typeNumber("12"); // k2
  clickCheck();
  clickContinue();
  fireEvent.click(screen.getAllByRole("button", { name: /Plate with 3 cookies/ })[0]); // i2
  fireEvent.click(screen.getAllByRole("button", { name: /Plate with 3 cookies/ })[1]);
  clickCheck();
  clickContinue();
  fireEvent.click(radio(/^3 times 5$/)); // k3
  clickCheck();
  clickContinue();
  typeNumber("5"); // k4 (new intermediate check: isolates the subtract-a-small-amount step
  clickCheck(); // before the challenge combines it with multiplication)
  clickContinue();
  typeNumber("18"); // ch1
  clickCheck();
  clickContinue();
  clickContinue(); // r1 recap
}

describe("lesson playthrough (scripted DOM walk)", () => {
  it("plays mult-01-01 start-to-finish on the correct path and lands on completion with XP", () => {
    render(<LessonPlayer lesson={lesson} />);
    // c1 concept visible, its figure on the shared learning stage
    expect(screen.getByText(/Maya packs 3 bags/)).toBeTruthy();
    expect(document.querySelector(".stage")).toBeTruthy();
    clickContinue();
    // i1 opens with the prediction gate — the manipulative is mounted but INERT
    // (dimmed, aria-hidden, untouchable) until the learner commits, so the learner
    // sees what they are predicting about (WS-E Phase 3). Commit lifts the gate
    // and the widget becomes interactive on its stage.
    expect(screen.getByText(/Make a prediction first/)).toBeTruthy();
    expect(document.querySelector('[data-predict-pending="true"] .stage')).toBeTruthy();
    commitPrediction();
    expect(document.querySelector("[data-predict-pending]")).toBeNull();
    expect(document.querySelector(".stage")).toBeTruthy();
    setSlider(5);
    clickCheck();
    clickContinue();
    playCorrectFrom("k1");
    // completion screen
    expect(screen.getByText("Trail complete!")).toBeTruthy();
    // all first-try, no hints: 6×10 (i1,k1,k2,i2,k3,k4 — check/interactive base 10 each) + ch1 20
    expect(screen.getByText(/\+80 XP earned/)).toBeTruthy();
  });

  it("forced miss on k1 surfaces misconception-diagnosing feedback, then retry succeeds", () => {
    render(<LessonPlayer lesson={lesson} />);
    clickContinue(); // past c1
    setSlider(5);
    clickCheck();
    clickContinue(); // past i1
    // k1: pick the adding misconception
    fireEvent.click(radio(/3 apples and 4 more apples/));
    clickCheck();
    // diagnostic, not generic: names the add-instead-of-multiply error
    expect(screen.getByTestId("feedback-scroll").textContent).toContain("That's adding: 3 + 4 = 7");
    expect(screen.queryByText(/^Incorrect/)).toBeNull();
    fireEvent.click(btn(/Try again/));
    fireEvent.click(radio(/3 bags with 4 apples in each bag/));
    clickCheck();
    // retry success pays half XP for a check
    expect(screen.getByText(/\+5 XP/)).toBeTruthy();
  });

  it("two misses on one conceptTag inject that tag's remedial pair and grow the trail", () => {
    render(<LessonPlayer lesson={lesson} />);
    const dots = () => screen.getByRole("group", { name: /Step \d+ of \d+/ });
    expect(dots().getAttribute("aria-label")).toContain("of 10");

    clickContinue(); // c1
    setSlider(5);
    clickCheck();
    clickContinue(); // i1

    // k1 (mult-meaning): wrong twice → reveal (miss #1 for the tag)
    fireEvent.click(radio(/1 bag with 34 apples/));
    clickCheck();
    fireEvent.click(btn(/Try again/));
    fireEvent.click(radio(/1 bag with 34 apples/));
    clickCheck();
    expect(screen.getByText(/Here's how it works/)).toBeTruthy();
    clickContinue();

    clickContinue(); // c2
    typeNumber("12"); // k2 correct (equal-groups — interleaved tag must not reset the count)
    clickCheck();
    clickContinue();
    fireEvent.click(screen.getAllByRole("button", { name: /Plate with 3 cookies/ })[0]); // i2
    fireEvent.click(screen.getAllByRole("button", { name: /Plate with 3 cookies/ })[1]);
    clickCheck();
    clickContinue();

    // k3 (mult-meaning): wrong twice → miss #2 → remediation injected on finalize
    fireEvent.click(radio(/^5 \+ 3$/));
    clickCheck();
    fireEvent.click(btn(/Try again/));
    fireEvent.click(radio(/^5 minus 3$/));
    clickCheck();
    clickContinue();

    // trail grew 10 → 12 and the remedial concept is on screen
    expect(dots().getAttribute("aria-label")).toContain("of 12");
    // the injected remedial dots are visually marked (adaptive moment made visible)
    expect(dots().getAttribute("aria-label")).toContain("the trail grew");
    expect(dots().querySelectorAll(".ring-berry\\/60").length).toBe(2);
    expect(screen.getByText(/Quick rewind/)).toBeTruthy();
    expect(screen.getByText(/groups of/)).toBeTruthy();

    // remedial check answers correctly and the lesson still completes
    clickContinue();
    fireEvent.click(radio(/^2 groups of 6$/));
    clickCheck();
    clickContinue();
    typeNumber("5"); // k4 (spliced after the remedial pair, still before ch1)
    clickCheck();
    clickContinue();
    typeNumber("18"); // ch1
    clickCheck();
    clickContinue();
    clickContinue(); // recap
    expect(screen.getByText("Trail complete!")).toBeTruthy();
  });

  it("a revealed answer echoes the learner's own wrong choice next to the correct one", () => {
    render(<LessonPlayer lesson={lesson} />);
    clickContinue(); // c1
    setSlider(5);
    clickCheck();
    clickContinue(); // i1 → k1

    // k1 is an mcq; miss it twice to force the reveal.
    fireEvent.click(radio(/1 bag with 34 apples/));
    clickCheck();
    fireEvent.click(btn(/Try again/));
    fireEvent.click(radio(/1 bag with 34 apples/));
    clickCheck();

    // The reveal now shows BOTH the learner's submission and the answer, so the
    // mistake is legible (and announced) rather than the answer standing alone.
    // Scope to the reveal status banner: the chosen label also appears on the
    // frozen mcq still on the stage, so an unscoped query would match twice.
    const banner = screen.getByRole("status");
    expect(within(banner).getByText(/^You answered$/)).toBeTruthy();
    expect(within(banner).getByText(/1 bag with 34 apples/)).toBeTruthy();
    expect(within(banner).getByText(/The answer/)).toBeTruthy();
  });
});

/* ---------------- Mid-lesson resume (refresh must not destroy the walk) ---------------- */

describe("mid-lesson resume", () => {
  it("unmount + remount resumes at the saved step with session XP intact", () => {
    const { unmount } = render(<LessonPlayer lesson={lesson} />);
    clickContinue(); // c1 → i1
    setSlider(5);
    clickCheck();
    clickContinue(); // i1 done → k1 (index 2), snapshot written
    expect(screen.getByText(/Which picture matches 3 × 4\?/)).toBeTruthy(); // k1 prompt on screen

    unmount(); // "refresh"
    render(<LessonPlayer lesson={lesson} />);

    // resumed at k1, not back at c1
    expect(screen.getByText(/Resumed at step 3 of 10/)).toBeTruthy();
    expect(screen.getByText(/step 3 of 10/)).toBeTruthy();
    expect(screen.queryByText(/Maya packs 3 bags/)).toBeNull(); // c1 not shown
    // session XP from i1 survived (10 XP chip in the header)
    expect(screen.getByText(/10 XP/)).toBeTruthy();

    // the walk still completes from here, and total XP is the full-run total
    playCorrectFrom("k1");
    expect(screen.getByText("Trail complete!")).toBeTruthy();
    expect(screen.getByText(/\+80 XP earned/)).toBeTruthy();
  });

  it("the resume notice's Start over button restarts fresh and drops the snapshot", () => {
    const { unmount } = render(<LessonPlayer lesson={lesson} />);
    clickContinue();
    setSlider(5);
    clickCheck();
    clickContinue();
    unmount();

    render(<LessonPlayer lesson={lesson} />);
    fireEvent.click(btn(/Start over/));
    expect(screen.getByText(/Maya packs 3 bags/)).toBeTruthy(); // back at c1
    expect(screen.queryByText(/Picked up where you left off/)).toBeNull();
    expect(window.localStorage.getItem(`numera:lesson:v1:c1:${lesson.id}`)).toBeNull();
  });

  it("completing a lesson clears its snapshot so replay starts fresh", () => {
    render(<LessonPlayer lesson={lesson} />);
    clickContinue();
    playCorrectFrom("i1");
    expect(screen.getByText("Trail complete!")).toBeTruthy();
    expect(window.localStorage.getItem(`numera:lesson:v1:c1:${lesson.id}`)).toBeNull();
  });

  it("a snapshot whose step ids no longer exist is discarded (fresh start, no crash)", () => {
    window.localStorage.setItem(
      `numera:lesson:v1:c1:${lesson.id}`,
      JSON.stringify({
        v: 1,
        lessonId: lesson.id,
        stepIds: ["ghost-1", "ghost-2", "ghost-3"],
        i: 1,
        sessionXp: 999,
        history: [],
        injected: [],
        savedAt: new Date().toISOString()
      })
    );
    render(<LessonPlayer lesson={lesson} />);
    expect(screen.getByText(/Maya packs 3 bags/)).toBeTruthy(); // c1 — fresh
    expect(screen.queryByText(/Picked up where you left off/)).toBeNull();
  });
});

describe("Enter drives the loop", () => {
  const pressEnter = () => fireEvent.keyDown(window, { key: "Enter" });

  it("Enter advances a concept, checks a ready answer, then continues", () => {
    render(<LessonPlayer lesson={lesson} />);
    // c1 concept: Enter = Continue
    pressEnter();
    // i1 slider: set the answer, Enter = Check…
    setSlider(5);
    pressEnter();
    // Two live regions after a predicted step checks: the XP status and the
    // prediction-outcome banner. The XP one is what Enter's check must produce.
    expect(screen.getAllByRole("status").map((e) => e.textContent).join(" ")).toMatch(/XP/);
    // …and Enter again = Continue.
    pressEnter();
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("Enter does nothing while the answer is incomplete", () => {
    render(<LessonPlayer lesson={lesson} />);
    pressEnter(); // past c1
    setSlider(5);
    pressEnter(); // check i1
    pressEnter(); // continue → k1 (mcq), nothing selected
    pressEnter();
    expect(screen.queryByRole("status")).toBeNull(); // no check fired
  });

  it("Enter is inert when focus is on a button (native activation owns it)", () => {
    render(<LessonPlayer lesson={lesson} />);
    pressEnter(); // past c1
    setSlider(5);
    const check = btn(/^Check$/);
    check.focus();
    fireEvent.keyDown(check, { key: "Enter" });
    // Our handler stood down; jsdom fires no native click on keyDown, so
    // nothing happened at all — exactly one activation path exists.
    expect(screen.queryByRole("status")).toBeNull();
  });
});

/* ---------------- Hints on check steps (graduated support, not challenge-only) ---------------- */

describe("hint ladder on check steps", () => {
  it("a check step with authored hints exposes the Hint button, and hints cost XP", async () => {
    const hinted = Lesson.parse(
      (await import("../../content/courses/add-subtract-100/lessons/as100-01-01.json")).default
    );
    // Seed a resume snapshot to land directly on k1, the hinted check — the
    // preceding interactive (matchPairs) is out of scope for this assertion.
    window.localStorage.setItem(
      `numera:lesson:v1:c1:${hinted.id}`,
      JSON.stringify({
        v: 1,
        lessonId: hinted.id,
        stepIds: hinted.steps.map((s) => s.id),
        i: 2,
        sessionXp: 0,
        history: [],
        injected: [],
        savedAt: new Date().toISOString()
      })
    );
    render(<LessonPlayer lesson={hinted} />);
    expect(screen.getByText(/8 \+ 8 = \?/)).toBeTruthy();
    // The ladder is reachable on a CHECK step (it used to be challenge-only,
    // leaving 365 authored check-step hint ladders unreachable inside lessons).
    fireEvent.click(screen.getByRole("button", { name: /Hint/ }));
    expect(screen.getByText(/Same number twice\./)).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: /Hint/ }));
    expect(screen.getByText(/8 and 8 more\./)).toBeTruthy();
    // Solve after two hints: check XP is 10 − 2×2 = 6 (hints still cost).
    typeNumber("16");
    clickCheck();
    expect(screen.getByText(/\+6 XP/)).toBeTruthy();
  });
});
