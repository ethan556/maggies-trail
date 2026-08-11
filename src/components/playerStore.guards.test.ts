// @vitest-environment jsdom
/**
 * RAPID-INPUT & PERSISTENCE HARDENING — S111 regression spec.
 *
 * Pins four behaviors the original brief demanded and Session 111 enforced:
 *  1. phase guards — check/tryAgain/reveal/next are no-ops outside their
 *     legal phases, so double-submit cannot duplicate history/XP/mastery;
 *  2. the advance latch — a double-fired Continue between two ungraded
 *     steps advances exactly one step;
 *  3. idempotent completion — a double-Continue on the final step runs
 *     persistCompletion exactly once (lesson XP, prediction outcomes, and
 *     daily counts are applied once);
 *  4. the strict persisted-state parser — poisoned saves (out-of-range i,
 *     malformed history elements) are rejected AND removed from storage.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { usePlayer, resetAdvanceLatch, setAdvanceLatchForTest } from "./playerStore";
import { loadLessonState, saveLessonState, lessonStateKey } from "@/lib/lessonState";
import { progressStore } from "@/lib/progress";
import type { TLesson } from "@/lib/schema";

const LESSON: TLesson = {
  id: "guard-l1",
  title: "Guard lesson",
  minutes: 3,
  steps: [
    { id: "g1", kind: "concept", md: "Read one." },
    { id: "g2", kind: "concept", md: "Read two." },
    {
      id: "g3",
      kind: "check",
      md: "Match the line.",
      conceptTag: "lin-si",
      widget: {
        type: "lineExplore" as const,
        prompt: "Tune the line to match.",
        targetSlope: 2,
        targetIntercept: 3,
        slopeStart: 2,
        interceptStart: 0,
        successFeedback: "Matched.",
        slopeFeedback: "Slope is off.",
        interceptFeedback: "Intercept is off."
      },
      hints: ["Look at where it crosses the axis."]
    }
  ]
} as unknown as TLesson;

function boot() {
  window.localStorage.clear();
  resetAdvanceLatch();
  setAdvanceLatchForTest(0);
  usePlayer.getState().load(LESSON);
}

beforeEach(boot);

describe("phase guards", () => {
  it("check is a no-op outside work — a double-submit records one verdict", () => {
    const p = usePlayer.getState;
    p().next(); // g1 -> g2
    p().next(); // g2 -> g3
    p().setValue({ m: 2, b: 3 });
    p().check();
    expect(p().phase).toBe("correct");
    const historyLen = p().history.length;
    const xp = p().sessionXp;
    p().check(); // the second half of a double-click
    p().check();
    expect(p().history.length).toBe(historyLen);
    expect(p().sessionXp).toBe(xp);
    expect(p().phase).toBe("correct");
  });

  it("keeps the graded checkpoint while post-verdict exploration checks remain ungraded", () => {
    const p = usePlayer.getState;
    p().next();
    p().next();
    p().setValue({ m: 2, b: 3 });
    p().check();
    const historyLen = p().history.length;
    const xp = p().sessionXp;

    p().setValue({ m: 2, b: 0 });
    expect(p().phase).toBe("correct");
    expect(p().explorationActive).toBe(true);
    p().check();
    expect(p().explorationCorrect).toBe(false);
    expect(p().explorationFeedback).toContain("Intercept is off");
    expect(p().history).toHaveLength(historyLen);
    expect(p().sessionXp).toBe(xp);

    p().setValue({ m: 2, b: 3 });
    p().check();
    expect(p().explorationCorrect).toBe(true);
    expect(p().history).toHaveLength(historyLen);
    expect(p().sessionXp).toBe(xp);
  });

  it("tryAgain and reveal are no-ops outside retry", () => {
    const p = usePlayer.getState;
    p().tryAgain();
    expect(p().phase).toBe("work"); // unchanged, and no verdict conjured
    p().reveal();
    expect(p().phase).toBe("work");
    expect(p().history.length).toBe(0);
  });

  it("a wrong answer, double-reveal finalizes once", () => {
    const p = usePlayer.getState;
    p().next();
    p().next();
    p().setValue({ m: 2, b: 0 });
    p().check();
    expect(p().phase).toBe("retry");
    p().reveal();
    const historyLen = p().history.length;
    p().reveal(); // double-click on Reveal
    expect(p().history.length).toBe(historyLen);
    expect(p().phase).toBe("revealed");
  });
});

describe("advance latch", () => {
  it("a double-fired Continue between ungraded steps advances one step", () => {
    setAdvanceLatchForTest(350);
    const p = usePlayer.getState;
    expect(p().i).toBe(0);
    p().next(); // the click
    p().next(); // its double, a few ms later (same tick here — inside latch)
    expect(p().i).toBe(1); // g2, not g3 — the reading step was not skipped
  });

  it("the latch is per-run: a restart inside the window honors the first Continue", () => {
    // The S111 review's theoretical suppression case, made a contract: the
    // latch timestamp lives in the store and every run-establishing set
    // clears it, so beginning a new run within 350ms of an advance must
    // not swallow that run's first legitimate Continue.
    setAdvanceLatchForTest(350);
    const p = usePlayer.getState;
    p().next(); // accepted advance stamps the latch
    expect(p().i).toBe(1);
    p().restart(); // same tick — well inside the window
    expect(p().i).toBe(0);
    p().next(); // first Continue of the fresh run
    expect(p().i).toBe(1); // NOT suppressed
  });

  it("the latch is per-run: a fresh load inside the window honors the first Continue", () => {
    setAdvanceLatchForTest(350);
    const p = usePlayer.getState;
    p().next();
    expect(p().i).toBe(1);
    window.localStorage.clear();
    p().load(LESSON); // same tick — new run via load
    expect(p().i).toBe(0);
    p().next();
    expect(p().i).toBe(1);
  });
});

describe("idempotent completion", () => {
  it("double-Continue on the final step applies completion once", () => {
    const p = usePlayer.getState;
    p().next();
    p().next();
    p().setValue({ m: 2, b: 3 });
    p().check();
    expect(p().phase).toBe("correct");
    p().next(); // -> done, persistCompletion runs
    expect(p().phase).toBe("done");
    const after1 = progressStore.load();
    const xp1 = after1.xp;
    const day1 = JSON.stringify(after1.lessonsByDay ?? {});
    p().next(); // the double — must be inert in phase done
    p().next();
    const after2 = progressStore.load();
    expect(after2.xp).toBe(xp1);
    expect(JSON.stringify(after2.lessonsByDay ?? {})).toBe(day1);
    expect(after2.lessons["guard-l1"]?.completed).toBe(true);
  });
});

describe("strict persisted-state parser", () => {
  const good = () => ({
    v: 1 as const,
    lessonId: "guard-l1",
    stepIds: ["g1", "g2", "g3"],
    i: 1,
    sessionXp: 4,
    history: [{ conceptTag: "add-within-10", correct: true, firstTry: true }],
    injected: [],
    predictions: [],
    signalCounts: {},
    remediated: [],
    savedAt: new Date().toISOString()
  });

  it("accepts a well-formed snapshot", () => {
    saveLessonState(good());
    expect(loadLessonState("guard-l1")?.i).toBe(1);
  });

  it("rejects and REMOVES an out-of-range i (the repeating-crash save)", () => {
    saveLessonState({ ...good(), i: 99 });
    expect(loadLessonState("guard-l1")).toBeNull();
    expect(window.localStorage.getItem(lessonStateKey("guard-l1"))).toBeNull();
  });

  it("rejects and removes a malformed history element", () => {
    const bad = good();
    (bad.history as unknown[]).push({ conceptTag: 7, correct: "yes" });
    saveLessonState(bad as unknown as Parameters<typeof saveLessonState>[0]);
    expect(loadLessonState("guard-l1")).toBeNull();
    expect(window.localStorage.getItem(lessonStateKey("guard-l1"))).toBeNull();
  });

  it("rejects and removes non-string stepIds", () => {
    const bad = good();
    (bad.stepIds as unknown[]).push(42);
    saveLessonState(bad as unknown as Parameters<typeof saveLessonState>[0]);
    expect(loadLessonState("guard-l1")).toBeNull();
  });
});
