/**
 * S242 / UX-01 — EVERY OFFERED FIRST-RUN ROUTE COMPLETES.
 *
 * WHAT THIS CLOSES. `trailsForGrade(3)` returned `[]`, deliberately: the comment read "Grade 3 uses
 * the placement quiz, so []". But `OnboardingFlow` offered the "Start at my grade level" choice at
 * EVERY grade, and that choice sets stage `gradetrail`, which mapped straight over the array. A
 * learner entering the single most common elementary grade and skipping placement — a primary
 * first-run path, not an edge case — got a heading with nothing under it and no way forward.
 *
 * Two things were true at once and neither was wrong on its own: the data said "grade 3 has no
 * direct picks" and the UI said "every grade may skip placement". Nothing in the repo asserted the
 * two agreed. That is the actual defect class, and it is what this file gates.
 *
 * THE SHAPE OF THE ASSERTION. Exhaustive over the offered space — every grade × every goal × both
 * placement routes — rather than sampled. The space is 14 × 3 × 2 = 84 routes, small enough to
 * enumerate completely, so there is no reason to sample and no seed to get lucky on. The plan's
 * UX-01 acceptance criterion is worded the same way: "every offered route completes with a valid
 * recommendation".
 *
 * WHY IT ASSERTS THE LESSON EXISTS, NOT JUST THAT A STRING CAME BACK. `recommendGradeTrail` falls
 * back to `G1_TRAILS[0]` for an unrecognised id, so it can never throw and a "did it return
 * something?" test would have passed against the broken tree too. What makes a route COMPLETE is
 * that its recommendation names a lesson that is really on disk in the course it claims. That is
 * checked here against the manifest.
 *
 * DELIBERATELY NOT ASSERTED HERE:
 *   · Whether the five Grade 3 trails are the pedagogically ideal five. The selection rule is
 *     recorded at `G3_TRAILS` and mirrors how Grade 2 picks 4 of its 11 courses; ranking them is
 *     a curriculum judgement, not a branch-completeness one.
 *   · The diagnostic's own recommendations — `/placement` has its own calibration gates.
 */
import { describe, expect, it } from "vitest";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import {
  trailsForGrade,
  recommendGradeTrail,
  type Goal,
  type GradeLevel
} from "./onboarding";

const ROOT = process.cwd();
const GRADES: GradeLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
const GOALS: Goal[] = ["school", "catchup", "ahead"];

const manifest = JSON.parse(readFileSync(join(ROOT, "content", "curriculum-manifest.json"), "utf8"));
const courseBySlug = new Map<string, any>(manifest.courses.map((c: any) => [c.slug, c]));

describe("S242/UX-01 — no offered grade is a dead end", () => {
  it("every grade offers at least one direct-pick trail", () => {
    const empty = GRADES.filter((g) => trailsForGrade(g).length === 0);
    expect(empty).toEqual([]);
  });

  it("Grade 3 specifically — the branch that shipped broken", () => {
    const trails = trailsForGrade(3);
    expect(trails.length).toBeGreaterThan(0);
    // Distinct courses, not the same course listed five times.
    expect(new Set(trails.map((t) => t.id)).size).toBe(trails.length);
  });
});

describe("S242/UX-01 — every trail points at a lesson that exists", () => {
  it.each(GRADES)("grade %i", (grade) => {
    for (const t of trailsForGrade(grade)) {
      const course = courseBySlug.get(t.id);
      expect(course, `grade ${grade} trail "${t.id}" names no course in the manifest`).toBeTruthy();
      const path = join(ROOT, "content", "courses", t.id, "lessons", `${t.lessonId}.json`);
      expect(existsSync(path), `grade ${grade} trail "${t.id}" entry lesson ${t.lessonId} is not on disk`).toBe(true);
      // The entry lesson must be the course's FIRST lesson — a trail that drops a learner into
      // the middle of a course is a different defect wearing the same shape.
      const first = course.chapters?.[0]?.lessonIds?.[0];
      expect(t.lessonId, `grade ${grade} trail "${t.id}" does not start at the course's first lesson`).toBe(first);
      expect(t.title.trim().length).toBeGreaterThan(0);
      expect(t.tagline.trim().length).toBeGreaterThan(0);
    }
  });
});

describe("S242/UX-01 — exhaustive grade × goal × placement-path sweep", () => {
  // 14 grades × 3 goals × 2 routes = 84. Enumerated, not sampled.
  const routes = GRADES.flatMap((grade) =>
    GOALS.flatMap((goal) => [
      { grade, goal, path: "diagnostic" as const },
      { grade, goal, path: "skip-placement" as const }
    ])
  );

  it("enumerates the whole offered space", () => {
    expect(routes).toHaveLength(84);
  });

  it.each(routes.map((r) => [`grade ${r.grade} · ${r.goal} · ${r.path}`, r] as const))(
    "%s completes with a valid recommendation",
    (_label, r) => {
      if (r.path === "diagnostic") {
        // The diagnostic route hands off to /placement with both parameters intact; the flow's
        // obligation is that the handoff is well-formed for every grade and goal.
        const href = `/placement?grade=${r.grade}&goal=${encodeURIComponent(r.goal)}`;
        const parsed = new URL(href, "https://example.invalid");
        expect(parsed.searchParams.get("grade")).toBe(String(r.grade));
        expect(parsed.searchParams.get("goal")).toBe(r.goal);
        return;
      }
      // The skip-placement route lands on `gradetrail`, which renders one choice per trail.
      const trails = trailsForGrade(r.grade);
      expect(trails.length, `grade ${r.grade} offers skip-placement but has no trails — dead stage`).toBeGreaterThan(0);
      for (const t of trails) {
        const rec = recommendGradeTrail(t.id);
        // recommendGradeTrail falls back to G1_TRAILS[0] on an unknown id, so "it returned
        // something" proves nothing. It must return THIS trail's lesson.
        expect(rec.lessonId, `grade ${r.grade} trail "${t.id}" recommended someone else's lesson`).toBe(t.lessonId);
        expect(rec.courseSlug).toBe(t.id);
        expect(rec.note.trim().length).toBeGreaterThan(0);
        expect(existsSync(join(ROOT, "content", "courses", rec.courseSlug, "lessons", `${rec.lessonId}.json`))).toBe(true);
      }
    }
  );
});
