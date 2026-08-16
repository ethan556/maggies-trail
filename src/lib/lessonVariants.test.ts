/**
 * S242 / ADAPT-01 — THE LESSON PATH CONSULTS THE LEARNER, AND RESUME STILL WORKS.
 *
 * Two properties carry this design and they pull in opposite directions:
 *
 *   · A learner RESUMING a lesson must see the same problem they were looking at. A lesson is a
 *     long walk that can be interrupted, and `restoreQueue` rebuilds the queue from the authored
 *     lesson every time — so anything that made the widget depend on mutable state would hand back
 *     a different question mid-problem.
 *   · A learner REPLAYING a lesson must see different problems, or the second walk measures memory
 *     of the questions rather than command of the ideas, which is the entire premise of the variant
 *     architecture.
 *
 * The run index reconciles them: constant during a walk, incremented at completion. Both properties
 * are asserted below, because a change that satisfied one and broke the other would look correct in
 * a diff.
 */
import { describe, expect, it } from "vitest";
import { refreshLessonSteps, lessonRunIndex } from "./lessonVariants";
import { emptyProfile, type Profile } from "./progress";
import type { TLesson } from "./schema";
import { loadLessonById } from "./content.server";

/** A real lesson with real generator declarations — a synthetic one would prove nothing about the corpus. */
async function lessonWithVariants(): Promise<TLesson> {
  for (const id of ["pr-02-02", "dr-02-02", "les-04-03", "rr-05-03", "se-04-02"]) {
    const lesson = await loadLessonById(id);
    if (lesson && lesson.steps.some((step) => step.variant)) return lesson;
  }
  throw new Error("no seeded lesson carries a variant declaration");
}

const widgetsOf = (steps: readonly { widget?: unknown }[]) => steps.map((s) => JSON.stringify(s.widget ?? null));

/** A learner who has already walked this lesson — the only state in which it refreshes. */
const replayProfile = (lessonId: string, walks = 1): Profile => ({
  ...emptyProfile(),
  counters: { [`walk:${lessonId}`]: walks }
});

describe("ADAPT-01 — refreshLessonSteps", () => {
  it("serves the AUTHORED lesson on the first walk", async () => {
    /* The lesson's prose is written around its authored numbers — mult-01-01 tells a story about 3
     * bags of 4 apples, asks about 3 × 4, then explains 3 × 4 = 12. Refreshing the walk the prose
     * was written for desynchronises the lesson from itself. */
    const lesson = await lessonWithVariants();
    const out = refreshLessonSteps(lesson, emptyProfile(), "2026-08-15");
    expect(out.refreshed).toBe(0);
    expect(widgetsOf(out.steps)).toEqual(widgetsOf(lesson.steps));
  });

  it("regenerates the steps that declare a generator and leaves every other step alone", async () => {
    const lesson = await lessonWithVariants();
    const out = refreshLessonSteps(lesson, replayProfile(lesson.id), "2026-08-15");
    expect(out.refreshed).toBeGreaterThan(0);
    expect(out.steps).toHaveLength(lesson.steps.length);
    // Ids, kinds and ordering are what `restoreQueue`, the remedial injector and the prediction
    // ledger key on. A refreshed step is the same step with different numbers.
    expect(out.steps.map((s) => s.id)).toEqual(lesson.steps.map((s) => s.id));
    expect(out.steps.map((s) => s.kind)).toEqual(lesson.steps.map((s) => s.kind));
    expect(out.steps.map((s) => s.conceptTag)).toEqual(lesson.steps.map((s) => s.conceptTag));
    // The engine may not change: `variantForStep` refuses a type-changing variant, and the widget
    // renderer, the evaluator and the resume path all assume the authored surface.
    for (const [i, step] of out.steps.entries()) {
      expect((step.widget as { type?: string } | undefined)?.type)
        .toBe((lesson.steps[i].widget as { type?: string } | undefined)?.type);
    }
  });

  it("is byte-identical on a resume — the same walk gives the same problems", async () => {
    const lesson = await lessonWithVariants();
    const profile = replayProfile(lesson.id);
    const first = refreshLessonSteps(lesson, profile, "2026-08-15");
    /* THE RESUME CASE, EXACTLY. The first visit wrote its fingerprints into the anti-repeat window;
     * a second call with THAT profile is what `load()` does after a refresh. If the transform
     * consulted the window it would now re-draw away from what the learner is looking at. */
    const resumed = refreshLessonSteps(lesson, { ...profile, recentVariants: first.served }, "2026-08-15");
    expect(widgetsOf(resumed.steps)).toEqual(widgetsOf(first.steps));
  });

  it("gives a different set of problems on the next walk", async () => {
    const lesson = await lessonWithVariants();
    const first = refreshLessonSteps(lesson, replayProfile(lesson.id, 1), "2026-08-15");
    const second = refreshLessonSteps(lesson, replayProfile(lesson.id, 2), "2026-08-15");
    expect(first.refreshed).toBeGreaterThan(0);
    expect(widgetsOf(second.steps)).not.toEqual(widgetsOf(first.steps));
  });

  it("records what it served, so review and practice do not immediately repeat it", async () => {
    const lesson = await lessonWithVariants();
    const out = refreshLessonSteps(lesson, replayProfile(lesson.id), "2026-08-15");
    const keys = Object.keys(out.served);
    expect(keys.length).toBe(out.refreshed);
    for (const key of keys) expect(key.startsWith(`${lesson.id}:`)).toBe(true);
  });

  it("chooses a band PER STEP from the mastery model, not one band for the lesson", async () => {
    const lesson = await lessonWithVariants();
    const tags = [...new Set(lesson.steps.map((s) => s.conceptTag).filter(Boolean))] as string[];
    if (tags.length < 2) return;
    /* A lesson crosses several conceptTags and a learner is rarely equally fragile across all of
     * them. One band for the whole lesson would serve a stretch surface on the weakest tag. */
    const fragile: Profile = {
      ...replayProfile(lesson.id),
      mastery: {
        [tags[0]]: { tag: tags[0], mastery: 0.05, attempts: 6, correctStreak: 0, lastSeen: "2026-08-15" },
        [tags[1]]: { tag: tags[1], mastery: 0.98, attempts: 30, correctStreak: 12, lastSeen: "2026-08-15" }
      }
    };
    const out = refreshLessonSteps(lesson, fragile, "2026-08-15");
    const chosen = new Set(Object.values(out.bands));
    // Only assert divergence where both tags actually resolved a variant; otherwise this is vacuous.
    if (Object.keys(out.bands).length >= 2 && chosen.size === 1) {
      const tagsRefreshed = new Set(
        lesson.steps.filter((s) => out.bands[String(s.id)] !== undefined).map((s) => s.conceptTag)
      );
      expect(tagsRefreshed.size, "one band across two graded tags means the band never varied").toBe(1);
    }
  });

  it("treats an already-completed lesson from an old profile as a second walk", async () => {
    // A profile written before the walk counter existed must not replay a finished lesson with the
    // numbers it just saw.
    const lesson = await lessonWithVariants();
    const legacy: Profile = {
      ...emptyProfile(),
      lessons: { [lesson.id]: { completed: true, bestXp: 40 } }
    };
    expect(lessonRunIndex(legacy, lesson.id)).toBe(1);
    expect(lessonRunIndex(emptyProfile(), lesson.id)).toBe(0);
  });
});
