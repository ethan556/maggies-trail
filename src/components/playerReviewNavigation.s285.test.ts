// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from "vitest";
import type { TLesson } from "@/lib/schema";
import { resetAdvanceLatch, setAdvanceLatchForTest, usePlayer } from "./playerStore";

const LESSON = {
  id: "review-navigation-fixture",
  title: "Review navigation fixture",
  minutes: 3,
  steps: [
    { id: "c1", kind: "concept", body: "Read the model." },
    {
      id: "k1",
      kind: "check",
      body: "Submit 7.",
      conceptTag: "review-navigation",
      widget: {
        type: "numeric",
        prompt: "What number is shown?",
        answer: 7,
        tolerance: 0,
        unit: "",
        fallbackFeedback: "7 is the shown number."
      }
    },
    { id: "c2", kind: "concept", body: "Keep walking." }
  ]
} as unknown as TLesson;

beforeEach(() => {
  window.localStorage.clear();
  resetAdvanceLatch();
  setAdvanceLatchForTest(0);
  usePlayer.getState().load(LESSON);
});

describe("completed-step review navigation", () => {
  it("opens completed items without changing the active item or its submitted evidence", () => {
    const player = usePlayer.getState;
    player().next(); // c1 -> k1
    player().setValue(7);
    player().check();
    expect(player().phase).toBe("correct");
    player().next(); // k1 verdict -> c2

    const before = {
      i: player().i,
      phase: player().phase,
      value: player().value,
      attempts: player().attempts,
      history: JSON.stringify(player().history),
      xp: player().sessionXp,
      predictions: JSON.stringify(player().predictions),
      signals: JSON.stringify(player().signalCounts)
    };

    player().reviewPrevious();
    expect(player().reviewingIndex).toBe(1);
    expect(player().i).toBe(before.i);

    // Every state-changing entry point must be inert while a completed item is
    // reviewed. The canonical current item, submitted result, XP, and adaptive
    // evidence are deliberately untouched.
    player().setValue(99);
    player().check();
    player().tryAgain();
    player().reveal();
    player().next();
    player().hint();
    player().swapVariant();
    expect(player().noteSignal("wrong-direction", { lockCapable: true })).toEqual({ kind: "none" });
    player().clearLock();
    player().commitPrediction("a");

    expect({
      i: player().i,
      phase: player().phase,
      value: player().value,
      attempts: player().attempts,
      history: JSON.stringify(player().history),
      xp: player().sessionXp,
      predictions: JSON.stringify(player().predictions),
      signals: JSON.stringify(player().signalCounts)
    }).toEqual(before);

    player().reviewStep(0);
    expect(player().reviewingIndex).toBe(0);
    player().returnToCurrent();
    expect(player().reviewingIndex).toBeNull();
    expect(player().i).toBe(before.i);
  });

  it("never opens the current or a future item for review", () => {
    const player = usePlayer.getState;
    player().reviewPrevious();
    expect(player().reviewingIndex).toBeNull();
    player().reviewStep(0);
    expect(player().reviewingIndex).toBeNull();
  });
});
