import { describe, expect, it, vi } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

vi.mock("server-only", () => ({}));

/**
 * S237 — THE MASTERY STUDIO LINK MUST LEAD SOMEWHERE.
 *
 * Reported from the running app: finishing a lesson offers "Deepen, mix, and transfer — Open
 * Mastery Studio →", and clicking it lands on "404 · TRAIL MARKER MISSING".
 *
 * The lesson page offered the link whenever the lesson had a primary concept tag. But
 * /mastery/[conceptTag] calls notFound() when buildMasteryMission returns null, and it returns
 * null for any tag the mastery index has no cell or no tagged steps for. **571 of 1,701 lessons
 * offered that link and 404'd on it** — one completion in three, at the most rewarding moment the
 * product has.
 *
 * WHAT THIS PINS. Two things, and the second matters more than the first:
 *
 *  1. masteryMissionExists agrees with buildMasteryMission on every authored tag. The cheap
 *     predicate exists so a page can ask "is there a destination?" without building a whole
 *     32-state mission to throw away — but a cheap copy of someone else's guards is exactly the
 *     kind of thing that drifts. If a third null path is added to the builder and not to the
 *     predicate, this fails rather than quietly restoring the 404.
 *  2. The corpus still contains tags with no mission, so the guard is load-bearing. If that ever
 *     reaches zero the fix is not to delete this test — it is to check whether the index changed.
 */

const lessons = (() => {
  const out: Array<{ id?: string; steps?: unknown }> = [];
  (function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const file = join(dir, entry.name);
      if (entry.isDirectory()) walk(file);
      else if (file.endsWith(".json")) {
        try { out.push(JSON.parse(readFileSync(file, "utf8"))); } catch { /* not a lesson */ }
      }
    }
  })("content/courses");
  return out.filter((l) => Array.isArray(l.steps));
})();

describe("S237 mastery studio links", () => {
  it("the predicate and the builder never disagree", async () => {
    const mod = await import("@/lib/masteryMission.server");
    const disagreements: string[] = [];
    const tags = new Set<string>();
    for (const lesson of lessons) {
      const tag = await mod.primaryConceptTag(lesson as never);
      if (tag) tags.add(tag);
    }
    expect(tags.size).toBeGreaterThan(100);
    for (const tag of tags) {
      const [exists, mission] = await Promise.all([
        mod.masteryMissionExists(tag),
        mod.buildMasteryMission(tag, 1),
      ]);
      if (exists !== Boolean(mission)) disagreements.push(`${tag}: predicate=${exists} builder=${Boolean(mission)}`);
    }
    expect(disagreements.slice(0, 10)).toEqual([]);
  }, 300000);

  it("the guard is load-bearing: tags without a mission still exist", async () => {
    const mod = await import("@/lib/masteryMission.server");
    let missing = 0;
    for (const lesson of lessons) {
      const tag = await mod.primaryConceptTag(lesson as never);
      if (tag && !(await mod.masteryMissionExists(tag))) missing++;
    }
    // 571 at the time of the fix. If this hits 0 the guard is free, not unnecessary.
    expect(missing).toBeGreaterThan(0);
  }, 300000);
});
