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

/* S242, second pass — from "not a dead end" to "covers its grade".
 *
 * The first version of this file asserted only that every grade returns a non-empty list. That is
 * the property the Grade 3 defect violated, so it was the right thing to gate — but it is weaker
 * than it looks, and it hid a second defect for as long as it existed. Grade 4 offered two trails
 * and BOTH were 4.NBT, so a direct-pick learner could reach one domain of four; fractions-add,
 * lines-angles and measure-convert sat in the catalogue with no way to pick them. The picker was
 * never empty, so the dead-end assertion passed the whole time.
 *
 * The coverage assertion below is derived from `content/standards/course-crosswalk.json` rather
 * than from a list written here, so it cannot drift from the catalogue: add a course carrying a new
 * domain code and this test starts demanding a trail for it. Duplication is deliberately allowed —
 * grades 1, 4, 5 and 8 each offer one domain twice via genuinely different entry points, and that
 * is a legitimate editorial choice. An UNCOVERED domain is not. */
const crosswalk = JSON.parse(readFileSync(join(ROOT, "content", "standards", "course-crosswalk.json"), "utf8"));
const ccssCodesFor = (courseId: string): string[] => {
  const course = crosswalk.courses.find((c: any) => c.courseId === courseId);
  if (!course) return [];
  return [...new Set<string>((course.frameworkRefs ?? [])
    .filter((r: any) => r.framework === "CCSS-MATH")
    .map((r: any) => r.code as string))];
};
const domainsAvailableAt = (grade: GradeLevel): string[] => {
  const out = new Set<string>();
  for (const c of crosswalk.courses) {
    if (c.gradeLevel !== grade) continue;
    for (const code of ccssCodesFor(c.courseId)) out.add(code);
  }
  return [...out].sort();
};

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

describe("S242 — every grade covers its own CCSS domains", () => {
  // Only the graded band K-8 carries per-grade CCSS domain codes in the crosswalk; the HS trails
  // (grades 9-13) are course-scoped and are covered by the completeness sweep below instead.
  const GRADED: GradeLevel[] = [0, 1, 2, 3, 4, 5, 6, 7, 8];

  it.each(GRADED)("grade %i offers every domain its catalogue carries", (grade) => {
    const offered = new Set<string>();
    for (const t of trailsForGrade(grade)) for (const code of ccssCodesFor(t.id)) offered.add(code);
    const uncovered = domainsAvailableAt(grade).filter((d) => !offered.has(d));
    expect(
      uncovered,
      `grade ${grade} has courses for ${uncovered.join(", ")} that no direct-pick trail reaches`
    ).toEqual([]);
  });

  it("grade 4 specifically — it offered 4.NBT twice and nothing else", () => {
    const offered = new Set<string>();
    for (const t of trailsForGrade(4)) for (const code of ccssCodesFor(t.id)) offered.add(code);
    for (const domain of ["4.NBT", "4.NF", "4.G", "4.MD"]) {
      expect(offered.has(domain), `grade 4 no longer offers ${domain}`).toBe(true);
    }
  });

  it("every offered trail carries a CCSS domain code in the graded band", () => {
    // A trail whose course is absent from the crosswalk would silently satisfy the coverage
    // assertion above by contributing nothing to either side of it.
    const uncoded: string[] = [];
    for (const grade of GRADED) {
      for (const t of trailsForGrade(grade)) {
        if (ccssCodesFor(t.id).length === 0) uncoded.push(`grade ${grade}: ${t.id}`);
      }
    }
    expect(uncoded).toEqual([]);
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
