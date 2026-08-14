// @vitest-environment jsdom
/**
 * The predict → manipulate → observe loop, walked in the REAL player.
 * The contract under test:
 *  1. On a predict step, the manipulative is MOUNTED BUT INERT until the
 *     learner commits — visible (dimmed) so the learner sees what they are
 *     predicting about, but aria-hidden and non-interactive, with Check
 *     absent (WS-E Phase 3: the gate still gates, it just doesn't blank
 *     the stage).
 *  2. Committing activates the manipulative and pins the chosen prediction.
 *  3. Completing the step shows the outcome comparison: confirmation when the
 *     prediction held, the model's answer when it didn't — never a penalty.
 *  4. Enter stands down while a prediction is pending.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { progressStore } from "@/lib/progress";
import React from "react";
import LessonPlayer from "./LessonPlayer";
import { Lesson, type TLesson } from "@/lib/schema";

function predictLesson(): TLesson {
  return Lesson.parse({
    id: "predict-spec",
    slug: "predict-spec",
    title: "Prediction loop spec",
    courseId: "spec",
    chapterId: "spec-ch",
    minutes: 5,
    steps: [
      { id: "c1", kind: "concept", body: "Groups of 4: what happens as you add a group?" },
      {
        id: "i1",
        kind: "interactive",
        body: "Test your prediction with the slider.",
        conceptTag: "equal-groups",
        predict: {
          prompt: "You have 4 groups of 4. Add one more group — what happens to the total?",
          options: [
            { id: "plus1", label: "It goes up by 1" },
            { id: "plus4", label: "It goes up by 4" }
          ],
          outcomeId: "plus4",
          reveal: "Each new group carries 4 more — the total climbs in equal jumps of the group size."
        },
        widget: {
          type: "slider",
          prompt: "Slide to 5 groups. Watch the total.",
          min: 0,
          max: 32,
          step: 4,
          start: 16,
          target: 20,
          visual: "groups",
          groupSize: 4,
          lowFeedback: "Short a group — every slide adds another group of 4.",
          highFeedback: "Past 5 groups — ease back one.",
          successFeedback: "5 groups of 4 = 20: one more group meant 4 more, not 1 more."
        }
      },
      { id: "k1", kind: "check", conceptTag: "equal-groups", body: "", widget: { type: "numeric", prompt: "6 groups of 4 = ?", answer: 24, fallbackFeedback: "Count by fours: 4, 8, 12, 16, 20, 24 — six jumps of four.", commonErrors: [{ value: 10, feedback: "That adds 6 + 4. Six GROUPS of four means 4 six times over." }] } },
      { id: "c2", kind: "concept", body: "Equal groups grow by the **group size**." },
      { id: "k2", kind: "check", conceptTag: "equal-groups", body: "", widget: { type: "numeric", prompt: "7 groups of 4 = ?", answer: 28, fallbackFeedback: "One group more than 24 — add one more four to get 28.", commonErrors: [] } },
      { id: "k3", kind: "check", conceptTag: "equal-groups", body: "", widget: { type: "numeric", prompt: "8 groups of 4 = ?", answer: 32, fallbackFeedback: "One group more than 28 — add one more four to get 32.", commonErrors: [] } },
      { id: "ch1", kind: "challenge", conceptTag: "equal-groups", body: "", hints: ["How many fours?", "Count up by 4 nine times.", "36 = 9 × 4."], widget: { type: "numeric", prompt: "9 groups of 4 = ?", answer: 36, fallbackFeedback: "Nine jumps of four lands on 36 — one four past 32.", commonErrors: [] } },
      { id: "r1", kind: "recap", body: "", takeaways: ["Adding a group adds the group size."], teaser: "arrays" }
    ],
    remedials: []
  });
}

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

const btn = (name: RegExp) => screen.getByRole("button", { name });

describe("predict → manipulate → observe", () => {
  it("keeps the manipulative mounted but inert (and Check absent) until the learner commits", () => {
    render(<LessonPlayer lesson={predictLesson()} />);
    fireEvent.click(btn(/^Continue$/)); // past c1 → i1
    expect(screen.getByText(/Make a prediction first/)).toBeTruthy();
    // Out of the accessibility tree (aria-hidden)…
    expect(screen.queryByRole("slider")).toBeNull();
    // …but PRESENT in the DOM: the learner sees the thing they're predicting about.
    expect(screen.getByRole("slider", { hidden: true })).toBeTruthy();
    const shell = document.querySelector('[data-predict-pending="true"]') as HTMLElement;
    expect(shell).toBeTruthy();
    expect(shell.getAttribute("aria-hidden")).toBe("true");
    expect(shell.hasAttribute("inert")).toBe(true); // no focus, no clicks
    expect(shell.className).toContain("pointer-events-none");
    expect(shell.className).toContain("opacity-50"); // dimmed, not blank
    // The dim/undim transition runs only under motion-safe — reduced-motion
    // users get a plain state swap, never an animation.
    expect(shell.className).toContain("motion-safe:transition-opacity");
    expect(shell.className).not.toMatch(/(^|\s)transition-opacity/);
    expect(screen.queryByRole("button", { name: /^Check$/ })).toBeNull();
    // Enter stands down while a prediction is pending
    fireEvent.keyDown(window, { key: "Enter" });
    expect(screen.queryByRole("status")).toBeNull();
  });

  it("committing activates the manipulative, pins the prediction, and a CONFIRMED prediction says so", () => {
    render(<LessonPlayer lesson={predictLesson()} />);
    fireEvent.click(btn(/^Continue$/));
    fireEvent.click(screen.getByRole("radio", { name: /It goes up by 4/ }));
    expect(screen.getByText(/Your prediction:/)).toBeTruthy();
    // Fully interactive post-commit: back in the a11y tree, inert gate gone.
    expect(screen.getByRole("slider")).toBeTruthy();
    expect(document.querySelector('[data-predict-pending]')).toBeNull();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
    fireEvent.click(btn(/^Check$/));
    expect(screen.getByText(/Your prediction held/)).toBeTruthy();
    expect(screen.getByText(/equal jumps of the group size/)).toBeTruthy();
  });

  it("a wrong prediction gets the comparison, the model's answer, and NO penalty (full step XP)", () => {
    render(<LessonPlayer lesson={predictLesson()} />);
    fireEvent.click(btn(/^Continue$/));
    fireEvent.click(screen.getByRole("radio", { name: /It goes up by 1/ }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
    fireEvent.click(btn(/^Check$/));
    expect(screen.getByText(/Not what you predicted/)).toBeTruthy();
    expect(screen.getByText(/the model showed/)).toBeTruthy();
    // interactive solved first-try pays its full 10 XP — the prediction cost nothing
    expect(screen.getByText(/\+10 XP/)).toBeTruthy();
  });

  it("a prediction cannot be changed after commitment", () => {
    render(<LessonPlayer lesson={predictLesson()} />);
    fireEvent.click(btn(/^Continue$/));
    fireEvent.click(screen.getByRole("radio", { name: /It goes up by 1/ }));
    // the option buttons are gone; the pinned chip remains
    expect(screen.queryByRole("radio", { name: /It goes up by 4/ })).toBeNull();
    expect(screen.getByText(/now test it/)).toBeTruthy();
  });
});

/* ---------------- A REAL converted flagship, walked end to end ---------------- */

describe("flagship conversion integration (fa-01-01, fraction equivalence)", () => {
  it("real content: predict → fraction bar appears → correct build → outcome comparison", async () => {
    const flagship = Lesson.parse(
      (await import("../../content/courses/fractions-add/lessons/fa-01-01.json")).default
    );
    // Land directly on i1 via a resume snapshot (the predict step under test).
    const i = flagship.steps.findIndex((s) => s.id === "i1");
    expect(i).toBeGreaterThan(0);
    window.localStorage.setItem(
      `numera:lesson:v1:c1:${flagship.id}`,
      JSON.stringify({
        v: 1,
        lessonId: flagship.id,
        stepIds: flagship.steps.map((s) => s.id),
        i,
        sessionXp: 0,
        history: [],
        injected: [],
        savedAt: new Date().toISOString()
      })
    );
    render(<LessonPlayer lesson={flagship} />);
    // predict gate up, manipulative hidden
    expect(screen.getByText(/Make a prediction first/)).toBeTruthy();
    expect(screen.queryByRole("slider")).toBeNull();
    fireEvent.click(screen.getByRole("radio", { name: /^Smaller$/ }));
    // fractionBar exposes numerator/denominator sliders — build 3/6 (≡ 1/2)
    const sliders = screen.getAllByRole("slider");
    expect(sliders.length).toBeGreaterThanOrEqual(2);
    fireEvent.change(sliders[0], { target: { value: "3" } });
    fireEvent.change(sliders[1], { target: { value: "6" } });
    fireEvent.click(btn(/^Check$/));
    expect(screen.getByText(/Your prediction held/)).toBeTruthy();
    expect(screen.getByText(/that trade IS equivalence/)).toBeTruthy();
  });

  it("tranche-4 engine swap: pv1000-03-03 predict gates the dragOrder, ordering 267/276/627/672 completes it", async () => {
    const flagship = Lesson.parse(
      (await import("../../content/courses/place-value-1000/lessons/pv1000-03-03.json")).default
    );
    const i = flagship.steps.findIndex((s) => s.id === "i2");
    expect(i).toBeGreaterThan(0);
    window.localStorage.setItem(
      `numera:lesson:v1:c1:${flagship.id}`,
      JSON.stringify({
        v: 1,
        lessonId: flagship.id,
        stepIds: flagship.steps.map((s) => s.id),
        i,
        sessionXp: 0,
        history: [],
        injected: [],
        savedAt: new Date().toISOString()
      })
    );
    render(<LessonPlayer lesson={flagship} />);
    // The predict gate is up; the manipulative is mounted but inert (out of
    // the a11y tree, present in the DOM) — WS-E Phase 3.
    expect(screen.getByText(/Make a prediction first/)).toBeTruthy();
    expect(screen.queryByRole("button", { name: /Move 267/ })).toBeNull();
    expect(screen.getByRole("button", { name: "Move 267 up", hidden: true })).toBeTruthy();
    fireEvent.click(screen.getByRole("radio", { name: /The hundreds spot/ }));
    // Presentation order is 627, 267, 672, 276 → sort ascending with arrow buttons.
    fireEvent.click(screen.getByRole("button", { name: "Move 267 up" })); // 267,627,672,276
    fireEvent.click(screen.getByRole("button", { name: "Move 276 up" })); // 267,627,276,672
    fireEvent.click(screen.getByRole("button", { name: "Move 276 up" })); // 267,276,627,672
    fireEvent.click(btn(/^Check$/));
    expect(screen.getByText(/Your prediction held/)).toBeTruthy();
    expect(screen.getByText(/hundreds split the pairs/)).toBeTruthy();
  });
});

/* ---------------- Approach-pass engine rebuild: the horizontal-shift misconception ---------------- */

describe("flagship conversion integration (ft-02-02, horizontal shifts on quadraticExplore)", () => {
  it("the classic wrong prediction — '(x + 3)² moves right' — is disproven by the live equation, at no XP cost", async () => {
    const flagship = Lesson.parse(
      (await import("../../content/courses/function-transformations/lessons/ft-02-02.json")).default
    );
    const i = flagship.steps.findIndex((s) => s.id === "i1");
    expect(i).toBeGreaterThan(0);
    window.localStorage.setItem(
      `numera:lesson:v1:c1:${flagship.id}`,
      JSON.stringify({
        v: 1,
        lessonId: flagship.id,
        stepIds: flagship.steps.map((s) => s.id),
        i,
        sessionXp: 0,
        history: [],
        injected: [],
        savedAt: new Date().toISOString()
      })
    );
    render(<LessonPlayer lesson={flagship} />);
    // Predict gate up; the parabola lab is hidden until commitment.
    expect(screen.getByText(/Make a prediction first/)).toBeTruthy();
    expect(screen.queryByRole("slider", { name: /h \(left\/right\)/ })).toBeNull();
    // Commit the misconception: right 3 must be written (x + 3)².
    fireEvent.click(screen.getByRole("radio", { name: /x \+ 3/ }));
    // The lab appears. Slide the vertex right to x = 3 and watch the equation.
    fireEvent.change(screen.getByRole("slider", { name: /h \(left\/right\)/ }), { target: { value: "3" } });
    fireEvent.click(btn(/^Check$/));
    // The manipulation succeeded; the prediction did not — comparison, reveal, full XP.
    expect(screen.getByText(/Not what you predicted/)).toBeTruthy();
    expect(screen.getByText(/opposite to the direction of travel/)).toBeTruthy();
    expect(screen.getByText(/\+10 XP/)).toBeTruthy();
  });
});

/* ---------------- Prediction tally: process evidence at the retention moment ---------------- */

describe("completion-screen prediction tally", () => {
  const clickContinue = () => fireEvent.click(btn(/^Continue$/));
  const clickCheck = () => fireEvent.click(btn(/^Check$/));
  const typeNumber = (v: string) =>
    fireEvent.change(screen.getByRole("textbox"), { target: { value: v } });

  function playFromK1ToDone() {
    typeNumber("24"); clickCheck(); clickContinue(); // k1
    clickContinue(); // c2
    typeNumber("28"); clickCheck(); clickContinue(); // k2
    typeNumber("32"); clickCheck(); clickContinue(); // k3
    typeNumber("36"); clickCheck(); clickContinue(); // ch1
    clickContinue(); // recap
  }

  it("reports a held prediction, and the tally survives a mid-lesson refresh", () => {
    const lesson = predictLesson();
    const { unmount } = render(<LessonPlayer lesson={lesson} />);
    clickContinue(); // c1 → i1
    fireEvent.click(screen.getByRole("radio", { name: /It goes up by 4/ }));
    fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
    clickCheck(); clickContinue(); // i1 done, snapshot written with the tally

    unmount(); // "refresh"
    render(<LessonPlayer lesson={lesson} />);
    playFromK1ToDone();
    expect(screen.getByText("Trail complete!")).toBeTruthy();
    expect(screen.getByText(/Predictions: 1 of 1 held/)).toBeTruthy();
    expect(screen.getByText(/you saw it coming/)).toBeTruthy();
  });

  it("a missed prediction is reported without judgement", () => {
    render(<LessonPlayer lesson={predictLesson()} />);
    clickContinue();
    fireEvent.click(screen.getByRole("radio", { name: /It goes up by 1/ })); // wrong commitment
    fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
    clickCheck(); clickContinue();
    playFromK1ToDone();
    expect(screen.getByText(/Predictions: 0 of 1 held/)).toBeTruthy();
    expect(screen.getByText(/the misses are where the learning happened/)).toBeTruthy();
  });

  it("lessons without predictions show no tally line", () => {
    const bare = predictLesson();
    delete (bare.steps[1] as { predict?: unknown }).predict;
    render(<LessonPlayer lesson={bare} />);
    clickContinue();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
    clickCheck(); clickContinue();
    playFromK1ToDone();
    expect(screen.getByText("Trail complete!")).toBeTruthy();
    expect(screen.queryByText(/Predictions:/)).toBeNull();
  });
});

/* ---------------- End-to-end: a missed prediction lands in the profile ---------------- */

describe("completion persists the missed-prediction record", () => {
  it("a missed prediction is remembered; a held-only completion writes nothing", () => {
    render(<LessonPlayer lesson={predictLesson()} />);
    fireEvent.click(btn(/^Continue$/));
    fireEvent.click(screen.getByRole("radio", { name: /It goes up by 1/ })); // will miss
    fireEvent.change(screen.getByRole("slider"), { target: { value: "20" } });
    fireEvent.click(btn(/^Check$/)); fireEvent.click(btn(/^Continue$/));
    // finish the lesson
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "24" } });
    fireEvent.click(btn(/^Check$/)); fireEvent.click(btn(/^Continue$/));
    fireEvent.click(btn(/^Continue$/));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "28" } });
    fireEvent.click(btn(/^Check$/)); fireEvent.click(btn(/^Continue$/));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "32" } });
    fireEvent.click(btn(/^Check$/)); fireEvent.click(btn(/^Continue$/));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "36" } });
    fireEvent.click(btn(/^Check$/)); fireEvent.click(btn(/^Continue$/));
    fireEvent.click(btn(/^Continue$/)); // recap → done (persistCompletion fires)

    const p = progressStore.load();
    const entry = p.missedPredictions?.[predictLesson().id];
    expect(entry).toBeTruthy();
    expect(entry!.missed).toBe(1);
    expect(entry!.total).toBe(1);
  });
});
