import { describe, expect, it } from "vitest";
import { awardNewBadges, BADGES } from "./achievements";
import type { Profile } from "./progress";

function profile(over: Partial<Profile> = {}): Profile {
  return { xp: 0, activity: { active: [], frozen: [] }, review: [], lessons: {}, badges: [], ...over };
}

describe("achievements", () => {
  it("ships at least 15 badges with unique ids", () => {
    expect(BADGES.length).toBeGreaterThanOrEqual(15);
    expect(new Set(BADGES.map((b) => b.id)).size).toBe(BADGES.length);
  });

  it("uses only owned AppIcon identifiers, never platform emoji", () => {
    for (const badge of BADGES) expect(badge.icon, badge.id).toMatch(/^icon-\d{3}$/);
  });

  it("awards lesson-count and XP badges, exactly once", () => {
    const p = profile({ xp: 600, lessons: { a: { completed: true, bestXp: 65 } } });
    const first = awardNewBadges(p);
    expect(first.map((b) => b.id)).toEqual(
      expect.arrayContaining(["first-step", "big-haul", "xp-500"])
    );
    expect(awardNewBadges(p)).toHaveLength(0); // idempotent
  });

  it("counts a streak that spans a freeze day", () => {
    const p = profile({ activity: { active: ["2026-07-01", "2026-07-03"], frozen: ["2026-07-02"] } });
    const ids = awardNewBadges(p).map((b) => b.id);
    expect(ids).toContain("streak-3");
    expect(ids).not.toContain("streak-7");
  });

  it("detects a full daily plate on a single date", () => {
    const dailyDone: Record<string, boolean> = {};
    for (const c of ["multiplication", "place-value", "fractions", "measurement", "geometry"])
      dailyDone[`2026-07-05:${c}`] = true;
    dailyDone["2026-07-04:fractions"] = true;
    const ids = awardNewBadges(profile({ dailyDone })).map((b) => b.id);
    expect(ids).toContain("daily-five");
    expect(ids).toContain("daily-first");
  });

  it("course badges need ctx and full completion", () => {
    const lessons = Object.fromEntries(["m1", "m2"].map((id) => [id, { completed: true, bestXp: 0 }]));
    const p = profile({ lessons });
    const ctx = { courses: [{ slug: "multiplication-division", lessonIds: ["m1", "m2"] }] };
    expect(awardNewBadges(p).map((b) => b.id)).not.toContain("flagship-finisher");
    expect(awardNewBadges(p, ctx).map((b) => b.id)).toContain("flagship-finisher");
  });
});
