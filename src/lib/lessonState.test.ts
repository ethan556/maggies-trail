// @vitest-environment jsdom
/**
 * Mid-lesson resume: the snapshot must restore EXACTLY the machine state the
 * learner left — queue shape including injected remedials, index, XP, history —
 * and must refuse to restore anything it cannot honour precisely. A confusing
 * hybrid lesson is worse than a fresh start.
 */
import { beforeEach, describe, expect, it } from "vitest";
import { Lesson } from "@/lib/schema";
import {
  clearLessonState,
  lessonStateKey,
  loadLessonState,
  restoreQueue,
  saveLessonState,
  stepIndex,
  type LessonSnapshot
} from "@/lib/lessonState";
import seedJson from "../../content/courses/multiplication-division/lessons/mult-01-01.json";

const lesson = Lesson.parse(seedJson);

function snap(over: Partial<LessonSnapshot> = {}): LessonSnapshot {
  return {
    v: 1,
    lessonId: lesson.id,
    stepIds: lesson.steps.map((s) => s.id),
    i: 3,
    sessionXp: 25,
    history: [{ conceptTag: "mult-meaning", correct: true, firstTry: true }],
    injected: [],
    savedAt: new Date().toISOString(),
    ...over
  };
}

beforeEach(() => window.localStorage.clear());

describe("restoreQueue", () => {
  it("round-trips the base queue at the saved index", () => {
    const q = restoreQueue(lesson, snap());
    expect(q).not.toBeNull();
    expect(q!.map((s) => s.id)).toEqual(lesson.steps.map((s) => s.id));
  });

  it("restores a GROWN queue including injected remedial steps by id", () => {
    const rem = lesson.remedials[0];
    expect(rem).toBeTruthy();
    const base = lesson.steps.map((s) => s.id);
    // remedial pair injected after step 4, learner now on the remedial concept
    const stepIds = [...base.slice(0, 5), rem.concept.id, rem.check.id, ...base.slice(5)];
    const q = restoreQueue(lesson, snap({ stepIds, i: 5, injected: [rem.conceptTag] }));
    expect(q).not.toBeNull();
    expect(q!.map((s) => s.id)).toEqual(stepIds);
    expect(q![5].id).toBe(rem.concept.id);
  });

  it("refuses an unknown step id (content changed underneath the snapshot)", () => {
    const stepIds = [...lesson.steps.map((s) => s.id)];
    stepIds[2] = "ghost-step";
    expect(restoreQueue(lesson, snap({ stepIds }))).toBeNull();
  });

  it("refuses a lesson-id mismatch, i=0, and out-of-range i", () => {
    expect(restoreQueue(lesson, snap({ lessonId: "other" }))).toBeNull();
    expect(restoreQueue(lesson, snap({ i: 0 }))).toBeNull();
    expect(restoreQueue(lesson, snap({ i: lesson.steps.length }))).toBeNull();
    expect(restoreQueue(lesson, snap({ i: -1 }))).toBeNull();
  });
});

describe("storage round-trip", () => {
  it("save → load → clear, namespaced per lesson", () => {
    const s = snap();
    saveLessonState(s);
    expect(loadLessonState(lesson.id)).toEqual(s);
    expect(loadLessonState("some-other-lesson")).toBeNull();
    clearLessonState(lesson.id);
    expect(loadLessonState(lesson.id)).toBeNull();
  });

  it("rejects corrupt or shape-invalid payloads instead of throwing", () => {
    window.localStorage.setItem(lessonStateKey(lesson.id), "{not json");
    expect(loadLessonState(lesson.id)).toBeNull();
    window.localStorage.setItem(lessonStateKey(lesson.id), JSON.stringify({ v: 2 }));
    expect(loadLessonState(lesson.id)).toBeNull();
  });

  it("is namespaced by the active child from the roster key", () => {
    saveLessonState(snap()); // default child c1
    window.localStorage.setItem("numera:roster:v1", JSON.stringify({ activeId: "c2" }));
    expect(loadLessonState(lesson.id)).toBeNull(); // c2 has no snapshot
    window.localStorage.removeItem("numera:roster:v1");
    expect(loadLessonState(lesson.id)).not.toBeNull();
  });
});

describe("stepIndex", () => {
  it("covers every base step and every remedial pair", () => {
    const idx = stepIndex(lesson);
    for (const s of lesson.steps) expect(idx.get(s.id)).toBe(s);
    for (const r of lesson.remedials) {
      expect(idx.get(r.concept.id)).toBe(r.concept);
      expect(idx.get(r.check.id)).toBe(r.check);
    }
  });
});
