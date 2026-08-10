/**
 * EVIDENCE LADDER + FAMILY METRICS (s42) — the parent product's numbers.
 *
 * Pinned here:
 *  - each of the five rungs requires strictly MORE evidence than the last, and
 *    the boundaries are the ones the copy promises (unaided proficiency for
 *    "mastered", surviving decay for "retained", ≥2 contexts for "transferable");
 *  - hint-assisted work alone can never reach "mastered" (the ceiling holds
 *    through this surface too);
 *  - repaired misconceptions require BOTH halves: a recorded signal AND
 *    retained proficiency now;
 *  - review reporting never invents a completion rate;
 *  - placement needs breadth (≥5 met, ≥60% solid) and says when it's early;
 *  - the downloadable report leads with the ladder, never with minutes.
 */
import { describe, expect, it } from "vitest";
import { emptySkill, PROFICIENT, type SkillState } from "@/lib/mastery";
import { ladderCounts, rungOf } from "@/lib/evidenceLadder";
import {
  familyReportMarkdown,
  fragileSkills,
  placementEstimate,
  repairedMisconceptions,
  reviewCompletion,
  weeklyActivity,
  weeklyMinutes,
  type ManifestCourse
} from "@/lib/family";
import type { Profile } from "@/lib/progress";

const TODAY = "2026-07-17";

const skill = (over: Partial<SkillState>): SkillState => ({ ...emptySkill(over.tag ?? "t"), ...over });

const profile = (over: Partial<Profile>): Profile => ({
  xp: 0,
  activity: { active: ["2026-07-15", "2026-07-16", TODAY], frozen: [] },
  review: [],
  lessons: {},
  badges: [],
  ...over
});

const courses: ManifestCourse[] = [
  {
    id: "c1",
    title: "Counting",
    gradeLevel: 0,
    category: "Math",
    lessonCount: 2,
    lessons: [
      { id: "l1", title: "One", minutes: 6 },
      { id: "l2", title: "Two", minutes: 8 }
    ]
  }
];

describe("the evidence ladder", () => {
  it("climbs exposed → practiced → mastered → retained → transferable, each on stronger evidence", () => {
    expect(rungOf(skill({ attempts: 1, mastery: 0.2, lastSeen: TODAY }), TODAY)).toBe("exposed");
    expect(rungOf(skill({ attempts: 3, mastery: 0.5, lastSeen: TODAY }), TODAY)).toBe("practiced");
    expect(rungOf(skill({ attempts: 4, mastery: PROFICIENT, lastSeen: TODAY }), TODAY)).toBe("retained");
    // Proficient long ago with no re-proof: decay pulls it below the line → mastered, not retained.
    expect(rungOf(skill({ attempts: 6, mastery: 0.72, lastSeen: "2026-05-01" }), TODAY)).toBe("mastered");
    // Retained + two distinct unaided contexts = transferable.
    expect(
      rungOf(skill({ attempts: 6, mastery: 0.9, lastSeen: TODAY, contexts: ["l1", "l2"] }), TODAY)
    ).toBe("transferable");
    // One context is not transfer, however strong the skill.
    expect(rungOf(skill({ attempts: 6, mastery: 0.95, lastSeen: TODAY, contexts: ["l1"] }), TODAY)).toBe("retained");
  });

  it("the assisted ceiling means a hint-built 0.65 can only ever be 'practicing'", () => {
    expect(rungOf(skill({ attempts: 50, mastery: 0.65, lastSeen: TODAY }), TODAY)).toBe("practiced");
  });

  it("counts skip zero-attempt skills — no evidence, no claim", () => {
    const counts = ladderCounts(
      { a: skill({ tag: "a", attempts: 0 }), b: skill({ tag: "b", attempts: 1, mastery: 0.1, lastSeen: TODAY }) },
      TODAY
    );
    expect(counts.exposed).toBe(1);
    expect(Object.values(counts).reduce((x, y) => x + y, 0)).toBe(1);
  });
});

describe("family metrics", () => {
  it("weekly activity covers exactly the last seven days in order", () => {
    const p = profile({ lessonsByDay: { "2026-07-11": 2, "2026-07-17": 1, "2026-07-01": 9 } });
    const act = weeklyActivity(p, TODAY);
    expect(act).toHaveLength(7);
    expect(act[0].date).toBe("2026-07-11");
    expect(act[0].lessons).toBe(2);
    expect(act[6].lessons).toBe(1);
    expect(act.some((d) => d.date === "2026-07-01")).toBe(false);
  });

  it("weekly minutes = authored minutes of lessons completed IN the window, an estimate not surveillance", () => {
    const p = profile({
      lessons: {
        l1: { completed: true, bestXp: 10, completedAt: "2026-07-15" },
        l2: { completed: true, bestXp: 10, completedAt: "2026-06-01" } // outside the window
      }
    });
    expect(weeklyMinutes(p, courses, TODAY)).toBe(6);
  });

  it("fragile = was proficient, now decayed below the line; sorted most-slipped first", () => {
    const p = profile({
      mastery: {
        fresh: skill({ tag: "fresh", attempts: 5, mastery: 0.9, lastSeen: TODAY }),
        old: skill({ tag: "old", attempts: 5, mastery: 0.72, lastSeen: "2026-04-01" }),
        older: skill({ tag: "older", attempts: 5, mastery: 0.71, lastSeen: "2026-02-01" })
      }
    });
    const f = fragileSkills(p, TODAY);
    expect(f.map((s) => s.tag)).toEqual(["older", "old"]);
  });

  it("repaired requires BOTH the recorded signal and retained proficiency now", () => {
    const p = profile({
      mastery: {
        fixed: skill({ tag: "fixed", attempts: 8, mastery: 0.9, lastSeen: TODAY, signals: { "one-control-fixation": 2 } }),
        stillOff: skill({ tag: "stillOff", attempts: 8, mastery: 0.5, lastSeen: TODAY, signals: { "one-control-fixation": 3 } }),
        neverOff: skill({ tag: "neverOff", attempts: 8, mastery: 0.9, lastSeen: TODAY })
      }
    });
    const r = repairedMisconceptions(p, TODAY);
    expect(r.map((x) => x.tag)).toEqual(["fixed"]);
    expect(r[0].note.length).toBeGreaterThan(0);
  });

  it("review reporting states overdue/dueToday and never fabricates a rate", () => {
    const p = profile({
      review: [
        { key: "a:1", conceptTag: "a", lessonId: "a", stepId: "1", box: 0, due: "2026-07-10" },
        { key: "b:1", conceptTag: "b", lessonId: "b", stepId: "1", box: 1, due: TODAY },
        { key: "c:1", conceptTag: "c", lessonId: "c", stepId: "1", box: 1, due: "2026-08-01" }
      ]
    });
    expect(reviewCompletion(p, TODAY)).toEqual({ overdue: 1, dueToday: 1, onTrack: false });
    expect(reviewCompletion(profile({}), TODAY).onTrack).toBe(true);
  });

  it("placement needs breadth: ≥5 met at a grade and ≥60% retained-solid; ≥10 met makes it confident", () => {
    const tagGrade: Record<string, number> = {};
    const mastery: Record<string, SkillState> = {};
    for (let i = 0; i < 6; i++) {
      const tag = `g2-${i}`;
      tagGrade[tag] = 2;
      mastery[tag] = skill({ tag, attempts: 4, mastery: i < 4 ? 0.85 : 0.3, lastSeen: TODAY }); // 4/6 solid
    }
    // Grade 3: met only 3 tags — breadth too thin to claim, however solid.
    for (let i = 0; i < 3; i++) {
      const tag = `g3-${i}`;
      tagGrade[tag] = 3;
      mastery[tag] = skill({ tag, attempts: 4, mastery: 0.9, lastSeen: TODAY });
    }
    const est = placementEstimate(profile({ mastery }), tagGrade, TODAY);
    expect(est).toEqual({ grade: 2, confident: false });
    expect(placementEstimate(profile({}), tagGrade, TODAY)).toBeNull();
  });

  it("the downloadable report leads with the evidence ladder and closes on the no-time-measures line", () => {
    const p = profile({
      mastery: { a: skill({ tag: "a", attempts: 4, mastery: 0.9, lastSeen: TODAY, contexts: ["l1", "l2"] }) },
      lessonsByDay: { [TODAY]: 1 }
    });
    const md = familyReportMarkdown("Maya", p, courses, {}, TODAY);
    const ladderAt = md.indexOf("Uses anywhere: 1");
    const minutesAt = md.indexOf("Estimated minutes");
    expect(ladderAt).toBeGreaterThan(-1);
    expect(minutesAt).toBeGreaterThan(ladderAt); // ladder first, time later
    expect(md).toMatch(/never by minutes watched or lessons counted/);
  });
});
