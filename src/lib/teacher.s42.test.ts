/**
 * TEACHER PLATFORM + PERMISSIONS (s42).
 *
 * The denial tests here ARE the product's "permissions are enforced" claim:
 * a teacher cannot read a class they don't own, a learner outside their
 * classes, or another teacher's aggregates — the guard throws, every path.
 *
 * Also pinned: deterministic printable join codes; assignment expansion for
 * all six kinds; on-time/late/incomplete against real completedAt dates;
 * heatmap levels matching the evidence ladder's honesty; intervention groups
 * needing ≥2 learners; CSV golden shapes.
 */
import { describe, expect, it } from "vitest";
import { emptySkill, type SkillState } from "@/lib/mastery";
import type { Profile } from "@/lib/progress";
import { can, type Actor, type OwnershipContext } from "@/lib/permissions";
import {
  assignmentCsv,
  assignmentProgress,
  assignmentStatusFor,
  classForCode,
  classSummary,
  commonMisconceptions,
  interventionGroups,
  joinCodeFor,
  lessonsForAssignment,
  masteryHeatmap,
  ownershipFrom,
  summaryCsv,
  type Assignment,
  type TeachStore
} from "@/lib/teacher";
import type { ManifestCourse } from "@/lib/family";

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

const courses: ManifestCourse[] = [
  {
    id: "counting",
    title: "Counting",
    gradeLevel: 0,
    category: "Math",
    lessonCount: 2,
    lessons: [
      { id: "l1", title: "One", minutes: 6 },
      { id: "l2", title: "Two", minutes: 6 }
    ]
  },
  {
    id: "shapes",
    title: "Shapes",
    gradeLevel: 0,
    category: "Math",
    lessonCount: 1,
    lessons: [{ id: "l3", title: "Three", minutes: 6 }]
  }
];

const msA: Actor = { role: "teacher", accountId: "acct-A" };
const msB: Actor = { role: "teacher", accountId: "acct-B" };

const storeA: TeachStore = {
  classes: [{ id: "cl1", name: "Period 1", createdAt: TODAY }],
  links: [
    { classId: "cl1", childId: "kid1", joinedAt: TODAY },
    { classId: "cl1", childId: "kid2", joinedAt: TODAY }
  ],
  assignments: []
};

const ctx: OwnershipContext = {
  rosterOf: { "acct-P": ["kid9"] },
  ...ownershipFrom("acct-A", storeA),
  schoolTeachers: { s1: ["acct-A"] },
  adminSchool: { "acct-S": "s1" }
};

const members = [
  {
    childId: "kid1",
    name: "Ana",
    profile: profile({
      lessons: { l1: { completed: true, bestXp: 50, completedAt: "2026-07-15" }, l2: { completed: true, bestXp: 40, completedAt: "2026-07-16" } },
      lessonsByDay: { "2026-07-15": 1, "2026-07-16": 1 },
      mastery: {
        frac: skill({ tag: "frac", attempts: 5, mastery: 0.9, lastSeen: TODAY }),
        old1: skill({ tag: "old1", attempts: 5, mastery: 0.72, lastSeen: "2026-04-01" })
      }
    })
  },
  {
    childId: "kid2",
    name: "Ben",
    profile: profile({
      lessons: { l1: { completed: true, bestXp: 30, completedAt: "2026-07-16" } },
      mastery: {
        old1: skill({ tag: "old1", attempts: 4, mastery: 0.75, lastSeen: "2026-03-20" }),
        sig: skill({ tag: "sig", attempts: 4, mastery: 0.4, lastSeen: TODAY, signals: { "wrong-direction": 2 } })
      }
    })
  }
];

describe("permissions — the denial proofs", () => {
  it("a parent reads only their own roster's learners", () => {
    const p: Actor = { role: "parent", accountId: "acct-P" };
    expect(can(p, "read-learner", { childId: "kid9" }, ctx)).toBe(true);
    expect(can(p, "read-learner", { childId: "kid1" }, ctx)).toBe(false);
  });

  it("a teacher reads only learners who JOINED a class they OWN", () => {
    expect(can(msA, "read-learner", { childId: "kid1" }, ctx)).toBe(true);
    expect(can(msB, "read-learner", { childId: "kid1" }, ctx)).toBe(false);
    expect(can(msA, "read-learner", { childId: "kid9" }, ctx)).toBe(false); // rostered elsewhere, never joined
  });

  it("class management and assignment writes stop at ownership", () => {
    expect(can(msA, "write-assignment", { classId: "cl1" }, ctx)).toBe(true);
    expect(can(msB, "write-assignment", { classId: "cl1" }, ctx)).toBe(false);
    expect(can(msB, "read-class", { classId: "cl1" }, ctx)).toBe(false);
  });

  it("a school admin aggregates registered teachers' classes but never reads an individual learner", () => {
    const admin: Actor = { role: "school-admin", accountId: "acct-S" };
    expect(can(admin, "read-class", { classId: "cl1" }, ctx)).toBe(true);
    expect(can(admin, "read-learner", { childId: "kid1" }, ctx)).toBe(false);
    expect(can(admin, "read-school", { schoolId: "s1" }, ctx)).toBe(true);
    expect(can(admin, "read-school", { schoolId: "s2" }, ctx)).toBe(false);
  });

  it("guarded reporting functions THROW for the wrong teacher — no unguarded path", () => {
    expect(() => classSummary(msB, "cl1", members, ctx, TODAY)).toThrow(/permission denied/);
    expect(() => masteryHeatmap(msB, "cl1", members, {}, ctx, TODAY)).toThrow(/permission denied/);
    expect(() => commonMisconceptions(msB, "cl1", members, ctx)).toThrow(/permission denied/);
    expect(() => interventionGroups(msB, "cl1", members, ctx, TODAY)).toThrow(/permission denied/);
  });
});

describe("join codes", () => {
  it("are deterministic, 6 chars, unambiguous alphabet, and resolvable", () => {
    const code = joinCodeFor("acct-A", "cl1");
    expect(code).toBe(joinCodeFor("acct-A", "cl1"));
    expect(code).toMatch(/^[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{6}$/);
    expect(classForCode("acct-A", storeA, code.toLowerCase())?.id).toBe("cl1");
    const mirrored = { ...storeA, classes: [{ ...storeA.classes[0], serverCode: "AB2345" }] };
    expect(classForCode("acct-A", mirrored, "ab2345")?.id).toBe("cl1");
    expect(classForCode("acct-A", storeA, "XXXXXX")).toBeNull();
    expect(joinCodeFor("acct-A", "cl2")).not.toBe(code);
  });
});

describe("assignments", () => {
  const mk = (kind: Assignment["kind"], refId: string, due = "2026-07-16"): Assignment => ({
    id: "a1",
    classId: "cl1",
    kind,
    refId,
    title: "HW",
    dueDate: due,
    createdAt: TODAY
  });

  it("expand correctly for every kind", () => {
    expect(lessonsForAssignment(mk("lesson", "l1"), courses)).toEqual(["l1"]);
    expect(lessonsForAssignment(mk("course", "counting"), courses)).toEqual(["l1", "l2"]);
    expect(lessonsForAssignment(mk("domain", "0:Math"), courses)).toEqual(["l1", "l2", "l3"]);
    expect(lessonsForAssignment(mk("review", "-"), courses)).toEqual([]);
    expect(lessonsForAssignment(mk("challenge", "l3"), courses)).toEqual(["l3"]);
  });

  it("status from real completedAt dates: on-time, late, incomplete", () => {
    const a = mk("course", "counting", "2026-07-16");
    expect(assignmentStatusFor(a, members[0].profile, courses, TODAY)).toBe("on-time"); // last done 07-16
    expect(assignmentStatusFor(a, members[1].profile, courses, TODAY)).toBe("incomplete"); // l2 missing
    const late = { ...members[0].profile, lessons: { ...members[0].profile.lessons, l2: { completed: true, bestXp: 1, completedAt: "2026-07-17" } } };
    expect(assignmentStatusFor(a, late, courses, TODAY)).toBe("late");
  });

  it("review assignments judge the queue: clear = compliant, overdue past due = late", () => {
    const a = mk("review", "-", "2026-07-16");
    expect(assignmentStatusFor(a, members[0].profile, courses, TODAY)).toBe("on-time");
    const behind = profile({ review: [{ key: "x:1", conceptTag: "x", lessonId: "x", stepId: "1", box: 0, due: "2026-07-10" }] });
    expect(assignmentStatusFor(a, behind, courses, TODAY)).toBe("late");
  });

  it("assignmentProgress is guarded and reports per learner", () => {
    const a = mk("lesson", "l1");
    const rows = assignmentProgress(msA, a, members, courses, ctx, TODAY);
    expect(rows).toEqual([
      { childId: "kid1", name: "Ana", status: "on-time" },
      { childId: "kid2", name: "Ben", status: "on-time" }
    ]);
    expect(() => assignmentProgress(msB, a, members, courses, ctx, TODAY)).toThrow(/permission denied/);
  });
});

describe("class analytics", () => {
  const tagGrade = { frac: 3, old1: 3, sig: 4 };

  it("heatmap levels track the ladder: retained=3, mastered=2, touched=1", () => {
    const h = masteryHeatmap(msA, "cl1", members, tagGrade, ctx, TODAY);
    expect(h.domains).toEqual(["Grade 3", "Grade 4"]);
    const ana = h.rows.find((r) => r.name === "Ana")!;
    expect(ana.cells[0].level).toBe(3); // frac retained today
    const ben = h.rows.find((r) => r.name === "Ben")!;
    expect(ben.cells[0].level).toBe(2); // old1 proficient once, decayed
    expect(ben.cells[1].level).toBe(1); // sig merely practiced
  });

  it("common misconceptions aggregate signal ledgers with teacher-language notes", () => {
    const list = commonMisconceptions(msA, "cl1", members, ctx);
    expect(list[0].signal).toBe("wrong-direction");
    expect(list[0].learners).toBe(1);
    expect(list[0].note.length).toBeGreaterThan(0);
  });

  it("intervention groups need a SHARED fragile skill (≥2 learners)", () => {
    const g = interventionGroups(msA, "cl1", members, ctx, TODAY);
    expect(g).toEqual([{ tag: "old1", names: ["Ana", "Ben"] }]);
  });

  it("class summary rows + CSV golden shape", () => {
    const rows = classSummary(msA, "cl1", members, ctx, TODAY);
    expect(rows[0]).toMatchObject({ name: "Ana", activeDays14: 2, lessonsDone: 2, reviewOnTrack: true });
    const csv = summaryCsv(rows);
    expect(csv.split("\n")[0]).toBe(
      "name,active_days_14,lessons_done,review_on_track,transferable,retained,mastered,practicing,met"
    );
    expect(csv.split("\n")).toHaveLength(3);
    const acsv = assignmentCsv(
      [{ name: "Ana", status: "on-time" }],
      { id: "a", classId: "cl1", kind: "lesson", refId: "l1", title: "HW, week 1", dueDate: TODAY, createdAt: TODAY }
    );
    expect(acsv).toContain('"HW, week 1"'); // comma-safe escaping
  });
});
