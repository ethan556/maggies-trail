import { dueItems } from "@/lib/engine";
import { recommendNext } from "@/lib/mastery";
import type { Profile } from "@/lib/progress";

export interface RecommendationCourse {
  /** Canonical world id. Basecamp is the one course surface (S201), so the recommendation must
   * link straight to it — routing through `/courses/[slug]` only to be redirected puts a
   * permanent 308 on the product's most-clicked CTA. */
  courseId: string;
  slug: string;
  title: string;
  comingSoon: boolean;
  conceptTags: string[];
}

export interface DashRec {
  tone: "tangerine" | "leaf" | "sky";
  kicker: string;
  headline: string;
  sub: string;
  cta: string;
  href: string;
}

/**
 * The one shared mastery-driven recommendation used by both the legacy Dashboard and the
 * Trailhead. Keeping it pure and central prevents two learner surfaces from disagreeing about
 * which fading or settling skill deserves attention.
 */
export function dashboardRecommendation(
  profile: Profile,
  today: string,
  courses: RecommendationCourse[]
): DashRec | null {
  const mastery = profile.mastery ?? {};
  const dueTagList = dueItems(profile.review, today).map((item) => item.conceptTag);
  const candidateTags = Array.from(new Set([...Object.keys(mastery), ...dueTagList]));
  if (candidateTags.length === 0) return null;
  const recommendation = recommendNext({ states: mastery, candidateTags, dueTags: dueTagList, today });
  if (!recommendation) return null;

  if (recommendation.reason === "review") {
    const count = new Set(dueTagList).size;
    return {
      tone: "tangerine",
      kicker: "Recommended for you",
      headline: `${count} skill${count === 1 ? "" : "s"} fading — a quick review locks them in`,
      sub: "Spaced review is how it sticks.",
      cta: "Review now",
      href: "/review"
    };
  }

  const tagCourse: Record<string, { title: string; courseId: string }> = {};
  for (const course of courses) {
    if (course.comingSoon) continue;
    for (const tag of course.conceptTags) {
      if (!(tag in tagCourse)) tagCourse[tag] = { title: course.title, courseId: course.courseId };
    }
  }
  const course = tagCourse[recommendation.tag];
  return {
    tone: "leaf",
    kicker: "Recommended for you",
    headline: `Keep building: ${recommendation.tag.replace(/-/g, " ")}`,
    sub: course ? `in ${course.title}` : "Strengthen a skill that's still settling.",
    cta: "Practice",
    href: course ? `/basecamp/${course.courseId}` : "/atlas"
  };
}
