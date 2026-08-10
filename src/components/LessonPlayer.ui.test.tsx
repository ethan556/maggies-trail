// @vitest-environment jsdom
/**
 * Presentation-layer contract for the rebuilt lesson player (the excellence
 * pass). Behavior (state machine, XP, adaptivity, resume) is pinned by
 * LessonPlayer.play/predict tests; this suite pins the NEW presentation
 * guarantees so they can't silently regress:
 *
 *  1. Width tiers — a wide-lab step widens the main column; prose steps and
 *     narrow widgets keep the reading column; header/footer track the tier.
 *  2. Tone linkage — the stage frame carries the phase (error on retry,
 *     success on correct, info on reveal), tying footer feedback to the object.
 *  3. Hint ladder — hints render as labelled rungs (Nudge → Strategy →
 *     Worked step), revealed progressively, authored text untouched.
 *  4. Feedback containment — the footer's feedback stack lives in an
 *     internally-scrollable region so long diagnoses can't bury the actions.
 *  5. Completion consolidation — the finish names the lesson, shows the goal
 *     ring and streak, and frames the next lesson as the trail's next step.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import LessonPlayer from "./LessonPlayer";
import { Lesson } from "@/lib/schema";
import seedJson from "../../content/courses/multiplication-division/lessons/mult-01-01.json";
import type { TLesson } from "@/lib/schema";

const lesson = Lesson.parse(seedJson);

/** A tiny synthetic lesson that exercises tiers + hints without real content:
 * concept → wide lab (lineExplore) → challenge with a 3-rung ladder → recap. */
const tierLesson: TLesson = Lesson.parse({
  id: "test-tier-01",
  slug: "test-tier",
  title: "Tier Test Trail",
  courseId: "test",
  chapterId: "t1",
  minutes: 5,
  steps: [
    { id: "c1", kind: "concept", body: "A line has a **slope** and an intercept." },
    {
      id: "i1",
      kind: "interactive",
      body: "Build the line.",
      conceptTag: "tier-line",
      widget: {
        type: "lineExplore",
        prompt: "Make y = 2x + 1.",
        targetSlope: 2,
        targetIntercept: 1,
        successFeedback: "Slope 2 with intercept 1 — the line passes the check.",
        slopeFeedback: "The tilt is off — rise over one run must be 2.",
        interceptFeedback: "The crossing is off — it must meet the y-axis at 1."
      }
    },
    {
      id: "k1",
      kind: "check",
      body: "Read the slope.",
      conceptTag: "tier-line",
      widget: {
        type: "numeric",
        prompt: "What is the slope of y = 2x + 1?",
        answer: 2,
        tolerance: 0,
        commonErrors: [
          { value: 1, feedback: "1 is the intercept — the slope is the number multiplying x." }
        ],
        fallbackFeedback: "The slope is the coefficient on x in y = 2x + 1."
      },
      explanationVariants: [
        "In y = mx + b the m is the slope; here m = 2.",
        "Rise over run: each step right climbs 2, so the slope is 2."
      ]
    },
    { id: "k2", kind: "check", body: "One more.", conceptTag: "tier-line", widget: { type: "numeric", prompt: "What is the intercept of y = 2x + 1?", answer: 1, tolerance: 0, commonErrors: [{ value: 2, feedback: "2 is the slope — the intercept is the constant term added at the end." }], fallbackFeedback: "The intercept is the constant term: 1." }, explanationVariants: ["b = 1 in y = mx + b.", "At x = 0 the line sits at y = 1 — that's the intercept."] },
    { id: "k3", kind: "check", body: "Again.", conceptTag: "tier-line", widget: { type: "numeric", prompt: "At x = 3, what is y on y = 2x + 1?", answer: 7, tolerance: 0, commonErrors: [{ value: 6, feedback: "6 is 2×3 alone — the +1 intercept still has to be added on." }], fallbackFeedback: "2×3 + 1 = 7." }, explanationVariants: ["Substitute: 2(3) + 1 = 7.", "Three runs of 2 above the intercept 1: 1 + 6 = 7."] },
    { id: "k4", kind: "check", body: "Almost there.", conceptTag: "tier-line", widget: { type: "numeric", prompt: "At x = 5, what is y on y = 2x + 1?", answer: 11, tolerance: 0, commonErrors: [{ value: 10, feedback: "10 is 2×5 alone — the intercept 1 is still missing from the total." }], fallbackFeedback: "2×5 + 1 = 11." }, explanationVariants: ["Substitute: 2(5) + 1 = 11.", "Five runs of 2 above the intercept: 1 + 10 = 11."] },
    {
      id: "ch1",
      kind: "challenge",
      body: "Prove it.",
      conceptTag: "tier-line",
      widget: {
        type: "numeric",
        prompt: "Where does y = 2x + 1 cross y = 9? Give x.",
        answer: 4,
        tolerance: 0,
        commonErrors: [
          { value: 5, feedback: "5 forgets the intercept — subtract the 1 before dividing by 2." }
        ],
        fallbackFeedback: "Solve 2x + 1 = 9: subtract 1, divide by 2."
      },
      hints: [
        "The crossing is where the two y-values agree.",
        "Set 2x + 1 equal to 9 and undo the +1 first.",
        "2x = 8, so divide both sides by 2."
      ],
      explanationVariants: [
        "2x + 1 = 9 → 2x = 8 → x = 4.",
        "From the intercept 1, you need 8 more; at 2 per step that's 4 steps."
      ]
    },
    { id: "r1", kind: "recap", body: "You read every part of the line.", takeaways: ["m tilts, b slides."], teaser: "systems of two lines." }
  ],
  remedials: []
});

beforeEach(() => {
  cleanup();
  window.localStorage.clear();
});

const btn = (name: RegExp) => screen.getByRole("button", { name });
const mainEl = () => document.querySelector("main") as HTMLElement;

describe("width tiers in the player", () => {
  it("prose steps use the reading column; a wide lab widens main, header and footer together", () => {
    render(<LessonPlayer lesson={tierLesson} />);
    // c1: concept step → narrow
    expect(mainEl().className).toContain("max-w-xl");
    fireEvent.click(btn(/^Continue$/));
    // i1: lineExplore → wide, and all three regions agree
    expect(mainEl().className).toContain("max-w-3xl");
    const header = document.querySelector("header div") as HTMLElement;
    const footer = document.querySelector("footer div") as HTMLElement;
    expect(header.className).toContain("max-w-3xl");
    expect(footer.className).toContain("max-w-3xl");
    // the prose inside the wide step still reads at column width
    expect(mainEl().querySelector(".max-w-xl")).toBeTruthy();
  });

  it("a narrow widget (numeric) returns the column to reading width", () => {
    render(<LessonPlayer lesson={tierLesson} />);
    fireEvent.click(btn(/^Continue$/)); // c1 → i1 (wide)
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("slider", { name: /intercept b/ }), { target: { value: "1" } });
    fireEvent.click(btn(/^Check$/));
    fireEvent.click(btn(/^Continue$/)); // → k1 numeric
    expect(mainEl().className).toContain("max-w-xl");
  });
});

describe("stage tone linkage", () => {
  it("neutral while working, error on retry, success on correct", () => {
    render(<LessonPlayer lesson={tierLesson} />);
    fireEvent.click(btn(/^Continue$/)); // → i1
    const stage = () => document.querySelector("[data-tone]") as HTMLElement;
    expect(stage().dataset.tone).toBe("neutral");
    // wrong line → retry
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "3" } });
    fireEvent.click(btn(/^Check$/));
    expect(stage().dataset.tone).toBe("error");
    fireEvent.click(btn(/^Try again$/));
    expect(stage().dataset.tone).toBe("neutral");
    // right line → success
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("slider", { name: /intercept b/ }), { target: { value: "1" } });
    fireEvent.click(btn(/^Check$/));
    expect(stage().dataset.tone).toBe("success");
  });
});

describe("hint ladder", () => {
  it("reveals labelled rungs one at a time with the authored text verbatim", () => {
    render(<LessonPlayer lesson={tierLesson} />);
    // walk to ch1
    fireEvent.click(btn(/^Continue$/)); // c1 → i1
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "2" } });
    fireEvent.change(screen.getByRole("slider", { name: /intercept b/ }), { target: { value: "1" } });
    fireEvent.click(btn(/^Check$/));
    fireEvent.click(btn(/^Continue$/)); // → k1
    for (const [answer] of [["2"], ["1"], ["7"], ["11"]] as const) {
      fireEvent.change(screen.getByRole("textbox"), { target: { value: answer } });
      fireEvent.click(btn(/^Check$/));
      fireEvent.click(btn(/^Continue$/));
    }
    // ch1: climb the ladder
    expect(screen.queryByText(/Nudge/)).toBeNull();
    fireEvent.click(btn(/Hint/));
    expect(screen.getByText(/Nudge · 1 of 3/)).toBeTruthy();
    expect(screen.getByText(/The crossing is where the two y-values agree\./)).toBeTruthy();
    expect(screen.queryByText(/Strategy/)).toBeNull(); // not all at once
    fireEvent.click(btn(/Hint/));
    expect(screen.getByText(/Strategy · 2 of 3/)).toBeTruthy();
    fireEvent.click(btn(/Hint/));
    expect(screen.getByText(/Worked step · 3 of 3/)).toBeTruthy();
    const workedStep = screen.getByText(/Worked step · 3 of 3/).closest("div");
    expect(workedStep?.textContent).toContain("so divide both sides by 2.");
    expect(workedStep?.querySelector(".math-inline")).toBeTruthy();
  });
});

describe("feedback containment", () => {
  it("the footer feedback stack renders inside an internally-scrollable region", () => {
    render(<LessonPlayer lesson={tierLesson} />);
    fireEvent.click(btn(/^Continue$/)); // → i1
    fireEvent.change(screen.getByRole("slider", { name: /slope m/ }), { target: { value: "3" } });
    fireEvent.click(btn(/^Check$/));
    const status = screen.getByRole("status");
    const scroller = status.closest(".overflow-y-auto");
    expect(scroller).toBeTruthy();
    // the primary action lives OUTSIDE the scroll region so it can never be buried
    const tryAgain = btn(/^Try again$/);
    expect(scroller!.contains(tryAgain)).toBe(false);
  });
});

describe("completion consolidation", () => {
  it("names the lesson, shows goal + streak + framed next action", () => {
    render(
      <LessonPlayer lesson={lesson} next={{ id: "mult-01-02", title: "Arrays: Rows and Columns" }} />
    );
    // fast-forward with the real content walk (mirrors play.test's correct path)
    fireEvent.click(btn(/^Continue$/)); // c1
    fireEvent.click(screen.getAllByRole("radio")[0]); // i1 prediction gate: commit (ungraded) to reveal the slider
    fireEvent.change(screen.getByRole("slider"), { target: { value: "5" } });
    fireEvent.click(btn(/^Check$/));
    fireEvent.click(btn(/^Continue$/));
    fireEvent.click(screen.getByRole("radio", { name: /3 bags with 4 apples in each bag/ }));
    fireEvent.click(btn(/^Check$/));
    fireEvent.click(btn(/^Continue$/));
    fireEvent.click(btn(/^Continue$/)); // c2
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "12" } });
    fireEvent.click(btn(/^Check$/));
    fireEvent.click(btn(/^Continue$/));
    fireEvent.click(screen.getAllByRole("button", { name: /Plate with 3 cookies/ })[0]);
    fireEvent.click(screen.getAllByRole("button", { name: /Plate with 3 cookies/ })[1]);
    fireEvent.click(btn(/^Check$/));
    fireEvent.click(btn(/^Continue$/));
    fireEvent.click(screen.getByRole("radio", { name: /^3 × 5$/ }));
    fireEvent.click(btn(/^Check$/));
    fireEvent.click(btn(/^Continue$/));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "5" } });
    fireEvent.click(btn(/^Check$/));
    fireEvent.click(btn(/^Continue$/));
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "18" } });
    fireEvent.click(btn(/^Check$/));
    fireEvent.click(btn(/^Continue$/));
    fireEvent.click(btn(/^Continue$/)); // recap

    expect(screen.getByText("Trail complete!")).toBeTruthy();
    // consolidation: what was walked, the goal it fed, the streak, the next step
    expect(screen.getByText(lesson.title)).toBeTruthy();
    expect(screen.getByText(/toward today's goal|Daily goal met!/)).toBeTruthy();
    expect(screen.getByText(/day streak/)).toBeTruthy();
    expect(screen.getByText(/Next on this trail/)).toBeTruthy();
    expect(screen.getByText(/Next: Arrays: Rows and Columns/)).toBeTruthy();
    expect(screen.getByRole("button", { name: /Walk it again/ })).toBeTruthy();
  });
});

describe("math-first active shell", () => {
  it("keeps one compact lesson heading and removes repeated waypoint and clearing chrome", () => {
    render(
      <LessonPlayer
        lesson={tierLesson}
        trailContext={{
          courseTitle: "Linear Relationships",
          chapterTitle: "Lines as trails",
          chapterNumber: 1,
          chapterCount: 2,
          lessonNumber: 3,
          lessonCount: 12
        }}
      />
    );

    expect(document.querySelector(".lesson-trail-shell--active")).toBeTruthy();
    expect(document.querySelector(".trail-atmosphere")).toBeNull();
    expect(screen.getByRole("heading", { level: 1, name: "Tier Test Trail" })).toBeTruthy();
    expect(screen.getByRole("img", { name: "Step 1 of 8" })).toBeTruthy();
    expect(document.querySelector(".trail-waypoint")).toBeNull();
    expect(document.querySelector(".trail-clearing-label")).toBeNull();

    fireEvent.click(btn(/^Continue$/));
    expect((mainEl().dataset.stepKind)).toBe("interactive");
    expect(screen.getByRole("img", { name: "Step 2 of 8" })).toBeTruthy();
    expect(document.querySelector(".trail-clearing-label")).toBeNull();
    expect(document.querySelector(".trail-action-dock")).toBeTruthy();
  });
});
