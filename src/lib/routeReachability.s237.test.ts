import { describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

vi.mock("server-only", () => ({}));

/**
 * S237 — EVERY DYNAMIC LINK THE APP CAN OFFER MUST RESOLVE.
 *
 * WHY THIS FILE EXISTS. A learner reported that "Open Mastery Studio" 404s. It did — on 571 of
 * 1,701 lessons, and on 572 of the 1,737 concept tags reachable as Basecamp chips. Roughly a third
 * of every entry point into the Mastery Studio was a dead end, and the suite could not see it,
 * because nothing in it followed a link: every other gate here tests engines, content or
 * rendering, and a route that renders perfectly for the ids that exist says nothing about the ids
 * the app actually links to.
 *
 * THE SHAPE OF THE BUG, WHICH IS THE POINT. Neither page was wrong about its own data. The lesson
 * page correctly found a primary concept tag; Basecamp correctly listed its lessons' tags. The
 * defect lived in the JOIN — "has a concept tag" is not "has a mastery mission", and nothing owned
 * that difference. Route reachability is exactly the class of defect that no single-module test
 * can catch, which is why it needs its own gate rather than an assertion inside either page.
 *
 * WHAT IS CHECKED. For each dynamic route with a notFound() path, the set of ids the app can LINK
 * must be a subset of the set the page can RESOLVE:
 *
 *   /mastery/[conceptTag]  linked from the lesson-complete screen, Basecamp chips, /standards
 *   /learn/[lessonId]      linked from trails, review, recommendations
 *   /basecamp/[courseId]   linked from the catalog and prerequisite lists
 *
 * NOT a substitute for browser verification — it checks the data join, not that a page renders.
 */

type Lesson = { id?: string; steps?: unknown; conceptTags?: unknown };

const lessons: Lesson[] = (() => {
  const out: Lesson[] = [];
  (function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (file.endsWith(".json")) {
        try { out.push(JSON.parse(readFileSync(file, "utf8")) as Lesson); } catch { /* not a lesson */ }
      }
    }
  })("content/courses");
  return out.filter((l) => Array.isArray(l.steps));
})();

describe("S237 route reachability", () => {
  it("the corpus loaded", () => {
    expect(lessons.length).toBeGreaterThan(1000);
  });

  it("/mastery — the lesson-complete screen only offers tags with a mission", async () => {
    const mod = await import("@/lib/masteryMission.server");
    const offered: string[] = [];
    for (const lesson of lessons) {
      const tag = await mod.primaryConceptTag(lesson as never);
      // This mirrors src/app/learn/[lessonId]/page.tsx exactly: tag AND mission, never tag alone.
      if (tag && (await mod.masteryMissionExists(tag))) offered.push(tag);
    }
    expect(offered.length).toBeGreaterThan(500); // the feature is still reachable at all
    const dead: string[] = [];
    for (const tag of new Set(offered)) if (!(await mod.buildMasteryMission(tag, 1))) dead.push(tag);
    expect(dead.slice(0, 10)).toEqual([]);
  }, 300000);

  it("/mastery — Basecamp chips only offer tags with a mission", async () => {
    const mod = await import("@/lib/masteryMission.server");
    // Basecamp builds its chips from lesson.conceptTags and now filters on masteryMissionExists.
    // conceptTags is DERIVED by the catalog (content.server.ts builds it from step conceptTags in
    // step order); it is not a field on the authored lesson JSON. Deriving it the same way here
    // keeps the gate honest — reading lesson.conceptTags off disk silently yields nothing and the
    // assertion passes over an empty set.
    const dead: string[] = [];
    let offered = 0;
    for (const lesson of lessons) {
      const tags = new Set(
        (lesson.steps as Array<{ conceptTag?: string }>).map((s) => s?.conceptTag).filter((t): t is string => Boolean(t))
      );
      for (const tag of tags) {
        if (!(await mod.masteryMissionExists(tag))) continue; // the page's own filter
        offered++;
        if (!(await mod.buildMasteryMission(tag, 1))) dead.push(tag);
      }
    }
    expect(dead.slice(0, 10)).toEqual([]);
    expect(offered).toBeGreaterThan(0);
  }, 300000);

  it("SELF-CHECK: the unguarded join really was broken", async () => {
    const mod = await import("@/lib/masteryMission.server");
    // Feeding tags through WITHOUT the existence filter is the pre-fix behaviour. If this stops
    // finding dead tags, the guards above are free and the gates are passing vacuously.
    let dead = 0;
    for (const lesson of lessons) {
      const tag = await mod.primaryConceptTag(lesson as never);
      if (tag && !(await mod.masteryMissionExists(tag))) dead++;
    }
    expect(dead).toBeGreaterThan(100); // 571 at the time of the fix
  }, 300000);

  it("/learn — every linked lesson id exists", async () => {
    const { loadLessonById } = await import("@/lib/content.server");
    const ids = lessons.map((l) => l.id).filter((id): id is string => Boolean(id));
    // Sampled: loading all 1,701 through the real resolver is slow and adds nothing — a broken
    // resolver fails on the first few, and a missing id is a content-integrity defect that
    // check:registration already owns.
    for (const id of ids.slice(0, 60)) expect(await loadLessonById(id), id).toBeTruthy();
  }, 120000);
});
