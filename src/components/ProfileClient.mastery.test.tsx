// @vitest-environment jsdom
/**
 * The mastery progress surface renders live off Profile.mastery: empty state before any
 * practice, then headline stats, per-course rollup, and a retention-driven "fading" list.
 */
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import { MasteryPanel, type ProfileCourse } from "./ProfileClient";
import { emptyProfile, type Profile } from "@/lib/progress";
import type { SkillState } from "@/lib/mastery";

afterEach(cleanup);

const courses: ProfileCourse[] = [
  { slug: "fractions", title: "Fractions", gradeLevel: 3, lessonIds: [], conceptTags: ["equal-groups", "equivalence"] },
  { slug: "quadratics", title: "Quadratics", gradeLevel: 9, lessonIds: [], conceptTags: ["vertex-form"] }
];
const skill = (mastery: number, lastSeen: string): SkillState => ({ tag: "x", mastery, attempts: 3, correctStreak: 1, lastSeen });

function withMastery(map: Record<string, SkillState>): Profile {
  return { ...emptyProfile(), mastery: map };
}

describe("MasteryPanel", () => {
  it("shows a friendly empty state before any skill is practiced", () => {
    render(<MasteryPanel profile={emptyProfile()} courses={courses} today="2026-07-11" />);
    expect(screen.getByText(/your skill mastery grows here/i)).toBeTruthy();
  });

  it("summarizes practiced skills and rolls mastery up per course", () => {
    const map = {
      "equal-groups": { ...skill(0.95, "2026-07-11"), tag: "equal-groups" },
      equivalence: { ...skill(0.5, "2026-07-11"), tag: "equivalence" },
      "vertex-form": { ...skill(0.8, "2026-07-11"), tag: "vertex-form" }
    };
    render(<MasteryPanel profile={withMastery(map)} courses={courses} today="2026-07-11" />);
    expect(screen.getByText("skills practiced")).toBeTruthy();
    expect(screen.getByText("Fractions")).toBeTruthy();
    expect(screen.getByText("Quadratics")).toBeTruthy();
    // both fraction skills are touched; one is mastered (≥0.9)
    expect(screen.getByText("1/2 mastered")).toBeTruthy();
  });

  it("flags a once-proficient skill that has faded past the review threshold", () => {
    // mastered long ago → retained mastery has decayed below proficient
    const map = { equivalence: { ...skill(0.95, "2026-05-01"), tag: "equivalence" } };
    render(<MasteryPanel profile={withMastery(map)} courses={courses} today="2026-07-11" />);
    expect(screen.getByText(/fading — worth a review/i)).toBeTruthy();
    expect(screen.getByText("equivalence")).toBeTruthy();
  });
});
