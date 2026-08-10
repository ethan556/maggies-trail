import { describe, expect, it } from "vitest";
import { dashboardRecommendation, type DashCourse } from "./DashboardClient";
import { emptyProfile, type Profile } from "@/lib/progress";
import type { ReviewItem } from "@/lib/engine";
import type { SkillState } from "@/lib/mastery";

const course = (slug: string, title: string, tags: string[], extra?: Partial<DashCourse>): DashCourse => ({
  courseId: slug,
  slug,
  title,
  tagline: "",
  comingSoon: false,
  gradeLevel: 3,
  chapters: [],
  lessonIds: [],
  firstLessonId: null,
  after: [],
  conceptTags: tags,
  ...extra
});
const courses = [course("fractions", "Fractions", ["equal-groups", "equivalence"])];
const skill = (tag: string, mastery: number, lastSeen: string): SkillState => ({ tag, mastery, attempts: 3, correctStreak: 1, lastSeen });
const review = (tag: string, due: string): ReviewItem => ({ key: `l:${tag}`, conceptTag: tag, lessonId: "l", stepId: "s", box: 1, due });

function profileWith(p: Partial<Profile>): Profile {
  return { ...emptyProfile(), ...p };
}

describe("dashboardRecommendation", () => {
  it("returns null when there is no mastery history and nothing due", () => {
    expect(dashboardRecommendation(emptyProfile(), "2026-07-11", courses)).toBeNull();
  });

  it("prioritizes a due review with a link to /review", () => {
    const p = profileWith({
      mastery: { equivalence: skill("equivalence", 0.8, "2026-06-01") },
      review: [review("equivalence", "2026-07-10")]
    });
    const rec = dashboardRecommendation(p, "2026-07-11", courses);
    expect(rec?.tone).toBe("tangerine");
    expect(rec?.href).toBe("/review");
    expect(rec?.headline).toMatch(/fading/);
  });

  it("otherwise nudges the lowest-mastery touched skill toward its course", () => {
    const p = profileWith({
      mastery: {
        "equal-groups": skill("equal-groups", 0.85, "2026-07-11"),
        equivalence: skill("equivalence", 0.3, "2026-07-11")
      }
    });
    const rec = dashboardRecommendation(p, "2026-07-11", courses);
    expect(rec?.tone).toBe("leaf");
    expect(rec?.headline).toBe("Keep building: equivalence");
    expect(rec?.href).toBe("/basecamp/fractions");
  });

  it("returns null when every touched skill is mastered and fresh", () => {
    const p = profileWith({ mastery: { equivalence: skill("equivalence", 0.95, "2026-07-11") } });
    expect(dashboardRecommendation(p, "2026-07-11", courses)).toBeNull();
  });
});

/* ---------------- upNextLesson / learnerGradeBand ---------------- */

import { learnerGradeBand, upNextLesson } from "./DashboardClient";

const ob = (grade?: number, recommendedLessonId = "") => ({
  goal: "school",
  comfort: 2,
  correctCount: 0,
  recommendedLessonId,
  completedAt: "2026-07-13T00:00:00Z",
  ...(grade === undefined ? {} : { grade })
});
const doneLessons = (ids: string[]) =>
  Object.fromEntries(ids.map((id) => [id, { completed: true, bestXp: 10 }]));

const ladder = [
  course("k-count", "Counting", [], { gradeLevel: 0, lessonIds: ["k1", "k2"] }),
  course("g5-frac", "Fractions", [], { gradeLevel: 5, lessonIds: ["f1", "f2", "f3", "f4"] }),
  course("g5-dec", "Decimals", [], { gradeLevel: 5, lessonIds: ["d1", "d2"] }),
  course("g8-fun", "Functions", [], { gradeLevel: 8, lessonIds: ["fn1", "fn2"] })
];

describe("learnerGradeBand", () => {
  it("stated onboarding grade always wins", () => {
    const p = profileWith({ onboarding: ob(8), lessons: doneLessons(["k1", "k2", "f1"]) });
    expect(learnerGradeBand(p, ladder)).toBe(8);
  });
  it("infers the band holding the most completed lessons", () => {
    const p = profileWith({ lessons: doneLessons(["f1", "f2", "k1"]) });
    expect(learnerGradeBand(p, ladder)).toBe(5);
  });
  it("breaks ties upward — a straddling learner is moving up", () => {
    const p = profileWith({ lessons: doneLessons(["k1", "f1"]) });
    expect(learnerGradeBand(p, ladder)).toBe(5);
  });
  it("null with no signal at all", () => {
    expect(learnerGradeBand(emptyProfile(), ladder)).toBeNull();
  });
});

describe("upNextLesson", () => {
  it("a brand-new Grade 5 learner is NOT pointed at Kindergarten", () => {
    const p = profileWith({ onboarding: ob(5) });
    expect(upNextLesson(p, ladder)).toEqual({ id: "f1", courseTitle: "Fractions" });
  });
  it("the onboarding recommendation wins when nothing is in progress", () => {
    const p = profileWith({ onboarding: ob(5, "d1") });
    expect(upNextLesson(p, ladder)).toEqual({ id: "d1", courseTitle: "Decimals" });
  });
  it("an in-progress course beats the onboarding recommendation", () => {
    const p = profileWith({ onboarding: ob(5, "d1"), lessons: doneLessons(["f1", "f2"]) });
    expect(upNextLesson(p, ladder)).toEqual({ id: "f3", courseTitle: "Fractions" });
  });
  it("continues the course the learner is FURTHEST into", () => {
    const p = profileWith({ lessons: doneLessons(["f1", "f2", "f3", "d1"]) });
    expect(upNextLesson(p, ladder)).toEqual({ id: "f4", courseTitle: "Fractions" });
  });
  it("a finished course is never 'continued' — the band's next course is", () => {
    const p = profileWith({ onboarding: ob(5), lessons: doneLessons(["f1", "f2", "f3", "f4"]) });
    expect(upNextLesson(p, ladder)).toEqual({ id: "d1", courseTitle: "Decimals" });
  });
  it("with no signal at all, falls back to catalog order (old behavior, last resort)", () => {
    expect(upNextLesson(emptyProfile(), ladder)).toEqual({ id: "k1", courseTitle: "Counting" });
  });
  it("null when everything is walked", () => {
    const p = profileWith({ lessons: doneLessons(["k1", "k2", "f1", "f2", "f3", "f4", "d1", "d2", "fn1", "fn2"]) });
    expect(upNextLesson(p, ladder)).toBeNull();
  });
});
