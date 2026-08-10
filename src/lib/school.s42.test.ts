/**
 * SCHOOL LAYER (s42): permission-gated aggregation, honest coverage, and the
 * privacy line — an admin sums ladders but can never reach one learner's
 * record through this layer.
 */
import { describe, expect, it } from "vitest";
import { emptySkill, type SkillState } from "@/lib/mastery";
import type { Profile } from "@/lib/progress";
import type { Actor, OwnershipContext } from "@/lib/permissions";
import { can } from "@/lib/permissions";
import { coverageByGrade, districtRollup, schoolLadderDistribution, type ClassRoster, type School } from "@/lib/school";

const TODAY = "2026-07-17";
const skill = (over: Partial<SkillState>): SkillState => ({ ...emptySkill(over.tag ?? "t"), ...over });
const profile = (over: Partial<Profile>): Profile => ({
  xp: 0,
  activity: { active: [], frozen: [] },
  review: [],
  lessons: {},
  badges: [],
  ...over
});

const school: School = { id: "s1", name: "Hillside", teacherAccountIds: ["acct-A"] };
const admin: Actor = { role: "school-admin", accountId: "acct-S" };
const outsider: Actor = { role: "school-admin", accountId: "acct-Z" };

const ctx: OwnershipContext = {
  rosterOf: {},
  classOwner: { cl1: "acct-A" },
  classMembers: { cl1: ["kid1", "kid2"] },
  schoolTeachers: { s1: ["acct-A"] },
  adminSchool: { "acct-S": "s1" }
};

const rosters: ClassRoster[] = [
  {
    classId: "cl1",
    teacherAccountId: "acct-A",
    members: [
      {
        childId: "kid1",
        profile: profile({
          mastery: {
            a: skill({ tag: "a", attempts: 4, mastery: 0.9, lastSeen: TODAY, contexts: ["x", "y"] }),
            b: skill({ tag: "b", attempts: 3, mastery: 0.5, lastSeen: TODAY })
          }
        })
      },
      {
        childId: "kid2",
        profile: profile({ mastery: { a: skill({ tag: "a", attempts: 2, mastery: 0.45, lastSeen: TODAY }) } })
      }
    ]
  }
];

describe("school aggregation", () => {
  it("sums ladder distributions across every class, gated by school permission", () => {
    const d = schoolLadderDistribution(admin, school, rosters, ctx, TODAY);
    expect(d).toEqual({ exposed: 0, practiced: 2, mastered: 0, retained: 0, transferable: 1 });
    expect(() => schoolLadderDistribution(outsider, school, rosters, ctx, TODAY)).toThrow(/permission denied/);
  });

  it("coverage counts tags met and retained-solid per grade — tags stated as the unit, not standards codes", () => {
    const rows = coverageByGrade(admin, school, rosters, { a: 3, b: 3, c: 3, z: 5 }, ctx, TODAY);
    expect(rows).toEqual([{ grade: 3, tagsTotal: 3, tagsMet: 2, tagsSolid: 1 }]);
  });

  it("a district is a sum — additive rollup, no new data path", () => {
    const d1 = { exposed: 1, practiced: 2, mastered: 3, retained: 4, transferable: 5 };
    const d2 = { exposed: 5, practiced: 4, mastered: 3, retained: 2, transferable: 1 };
    expect(districtRollup([d1, d2])).toEqual({ exposed: 6, practiced: 6, mastered: 6, retained: 6, transferable: 6 });
  });

  it("the privacy line: an admin can read a class aggregate, never an individual learner", () => {
    expect(can(admin, "read-class", { classId: "cl1" }, ctx)).toBe(true);
    expect(can(admin, "read-learner", { childId: "kid1" }, ctx)).toBe(false);
  });
});
