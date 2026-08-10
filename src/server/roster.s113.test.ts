/**
 * ROSTERING (s113) — OneRoster CSV import/export against a real database.
 *
 * The contract under test is the one INSTITUTIONS.md states:
 *   · dry run writes NOTHING except its audit row, and its plan equals what
 *     the apply then does;
 *   · apply is idempotent — the second import of the same bundle converges
 *     (updates, not creates; no duplicate learners, classes, memberships);
 *   · student enrollments dual-write enrollments + classroom_members so the
 *     existing teacher surface (classRoster) sees imported children;
 *   · 'tobedeleted' drops mark the enrollment and remove the member row while
 *     the learner row and their work survive;
 *   · a non-admin of the district is refused outright;
 *   · export round-trips: importing our own export plans zero creates.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import { login, sessionFor, signup, type SessionInfo } from "@/server/authService";
import { classRoster } from "@/server/classService";
import { addStaff, createDistrict } from "@/server/institutionService";
import { exportOneRoster, gradeToInt, importBundle } from "@/server/rosterService";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-roster-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function fresh(email: string): SessionInfo {
  const r = login(db, email, "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  const s = sessionFor(db, r.token);
  if (!s) throw new Error("no session");
  return s;
}
function platformAdmin(email: string): SessionInfo {
  signup(db, email, "pw-one-two", "parent");
  const s = fresh(email);
  db.prepare("UPDATE users SET role = 'platform-admin' WHERE id = ?").run(s.user.id);
  return fresh(email);
}
function sessionOf(userId: string): SessionInfo {
  const u = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(userId) as {
    id: string;
    email: string;
    role: "parent" | "teacher" | "school-admin" | "platform-admin";
  };
  return { user: { id: u.id, email: u.email, role: u.role, emailVerifiedAt: null }, learnerId: null };
}

/** A small but honest district: 1 district, 1 school, 1 term, 1 teacher,
 * 2 students, 1 class, 3 enrollments. */
const FILES = {
  orgs: [
    "sourcedId,status,dateLastModified,name,type,identifier,parentSourcedId",
    "d1,active,,Tally Peak USD,district,,",
    "s1,active,,Summit Elementary,school,,d1"
  ].join("\n"),
  academicSessions: [
    "sourcedId,status,dateLastModified,title,type,startDate,endDate,parentSourcedId,schoolYear",
    "t1,active,,Fall 2026,term,2026-08-15,2026-12-20,,2027"
  ].join("\n"),
  users: [
    "sourcedId,status,dateLastModified,enabledUser,orgSourcedIds,role,username,userIds,givenName,familyName,middleName,identifier,email,sms,phone,agentSourcedIds,grades,password",
    'u-t1,active,,true,s1,teacher,rivera,,Maria,Rivera,,,rivera@tallypeak.org,,,,,',
    'u-s1,active,,true,s1,student,pcook,,Penny,Cook,,,,,,,03,',
    'u-s2,active,,true,s1,student,mfern,,"Marco, Jr.",Fern,,,,,,,03,'
  ].join("\n"),
  classes: [
    "sourcedId,status,dateLastModified,title,grades,courseSourcedId,classCode,classType,location,schoolSourcedId,termSourcedIds,subjects,subjectCodes,periods",
    "c1,active,,Room 14 Math,03,,RM14,scheduled,,s1,t1,Math,,2"
  ].join("\n"),
  enrollments: [
    "sourcedId,status,dateLastModified,classSourcedId,schoolSourcedId,userSourcedId,role,primary,beginDate,endDate",
    "e-t1,active,,c1,s1,u-t1,teacher,true,,",
    "e-s1,active,,c1,s1,u-s1,student,false,,",
    "e-s2,active,,c1,s1,u-s2,student,false,,"
  ].join("\n")
};

describe("oneroster import/export (s113)", () => {
  it("dry-runs without writing, applies idempotently, dual-writes membership, and honors drops", () => {
    const op = platformAdmin("op@example.com");
    const d = createDistrict(db, op, "Tally Peak USD");
    if ("error" in d) throw new Error("district failed");
    const supt = addStaff(db, op, d.orgId, "supt@tallypeak.org", "administrator");
    if ("error" in supt) throw new Error("staff failed");
    const admin = sessionOf(supt.userId);

    // A parent, and an admin of a DIFFERENT district, are both refused.
    signup(db, "parent@example.com", "pw-one-two", "parent");
    expect(importBundle(db, fresh("parent@example.com"), d.orgId, FILES, { dryRun: true })).toEqual({
      error: "forbidden"
    });
    const other = createDistrict(db, op, "Elsewhere USD");
    if ("error" in other) throw new Error("district failed");
    const otherAdmin = addStaff(db, op, other.orgId, "other@elsewhere.org", "administrator");
    if ("error" in otherAdmin) throw new Error("staff failed");
    expect(importBundle(db, sessionOf(otherAdmin.userId), d.orgId, FILES, { dryRun: true })).toEqual({
      error: "forbidden"
    });

    // Dry run: a plan, an audit row, and NO entity writes.
    const dry = importBundle(db, admin, d.orgId, FILES, { dryRun: true });
    if ("error" in dry) throw new Error("dry failed");
    expect(dry.applied).toBe(false);
    expect(dry.plan.applicable).toBe(true);
    expect(dry.plan.classes.create).toBe(1);
    expect(dry.plan.learners.create).toBe(2);
    expect(dry.plan.staff.create).toBe(1);
    expect(db.prepare("SELECT COUNT(*) AS n FROM learners").get()).toEqual({ n: 0 });
    expect(db.prepare("SELECT COUNT(*) AS n FROM classrooms").get()).toEqual({ n: 0 });
    expect(db.prepare("SELECT outcome, dry_run FROM roster_imports WHERE id = ?").get(dry.importId)).toEqual({
      outcome: "pending",
      dry_run: 1
    });

    // Apply.
    const applied = importBundle(db, admin, d.orgId, FILES, { dryRun: false });
    if ("error" in applied) throw new Error("apply failed");
    expect(applied.applied).toBe(true);
    expect(db.prepare("SELECT COUNT(*) AS n FROM learners").get()).toEqual({ n: 2 });
    const cls = db.prepare("SELECT id, name, teacher_user_id, join_code, grade FROM classrooms WHERE external_id = 'c1'").get() as {
      id: string;
      name: string;
      teacher_user_id: string;
      join_code: string;
      grade: string;
    };
    expect(cls.name).toBe("Room 14 Math");
    expect(cls.join_code).toHaveLength(6);
    const teacherRow = db.prepare("SELECT id, email, pw_hash FROM users WHERE email = 'rivera@tallypeak.org'").get() as {
      id: string;
      email: string;
      pw_hash: string | null;
    };
    expect(cls.teacher_user_id).toBe(teacherRow.id); // primary teacher owns the class
    expect(teacherRow.pw_hash).toBeNull(); // provisioned, not password-seeded

    // The EXISTING teacher surface sees the imported roster (dual-write).
    const roster = classRoster(db, sessionOf(teacherRow.id), cls.id);
    if ("error" in roster) throw new Error("roster failed");
    expect(roster.members.map((m) => m.name).sort()).toEqual(["Marco, Jr. Fern", "Penny Cook"]);
    const penny = db.prepare("SELECT id, grade FROM learners WHERE external_id = 'u-s1'").get() as {
      id: string;
      grade: number;
    };
    expect(penny.grade).toBe(3);

    // Idempotence: the same bundle again converges — updates, no new rows.
    const again = importBundle(db, admin, d.orgId, FILES, { dryRun: false });
    if ("error" in again) throw new Error("re-apply failed");
    expect(again.plan.learners).toEqual({ create: 0, update: 2, retire: 0 });
    expect(again.plan.classes).toEqual({ create: 0, update: 1, retire: 0 });
    expect(db.prepare("SELECT COUNT(*) AS n FROM learners").get()).toEqual({ n: 2 });
    expect(db.prepare("SELECT COUNT(*) AS n FROM classrooms").get()).toEqual({ n: 1 });
    expect(db.prepare("SELECT COUNT(*) AS n FROM classroom_members").get()).toEqual({ n: 2 });
    expect(db.prepare("SELECT COUNT(*) AS n FROM enrollments WHERE role = 'student'").get()).toEqual({ n: 2 });

    // Drop Penny: enrollment marked, membership removed, learner + record kept.
    const dropFiles = {
      ...FILES,
      enrollments: FILES.enrollments.replace("e-s1,active", "e-s1,tobedeleted")
    };
    const dropped = importBundle(db, admin, d.orgId, dropFiles, { dryRun: false });
    if ("error" in dropped) throw new Error("drop failed");
    expect(db.prepare("SELECT status FROM enrollments WHERE external_id = 'e-s1'").get()).toEqual({
      status: "dropped"
    });
    expect(db.prepare("SELECT COUNT(*) AS n FROM classroom_members WHERE learner_id = ?").get(penny.id)).toEqual({
      n: 0
    });
    expect(db.prepare("SELECT COUNT(*) AS n FROM learners WHERE id = ?").get(penny.id)).toEqual({ n: 1 });

    // A bundle with a broken reference is REJECTED before any write.
    const badFiles = { ...FILES, enrollments: FILES.enrollments + "\ne-x,active,,c-missing,s1,u-s1,student,false,," };
    const rejected = importBundle(db, admin, d.orgId, badFiles, { dryRun: false });
    if ("error" in rejected) throw new Error("call failed");
    expect(rejected.applied).toBe(false);
    expect(rejected.plan.applicable).toBe(false);
    expect(db.prepare("SELECT outcome FROM roster_imports WHERE id = ?").get(rejected.importId)).toEqual({
      outcome: "rejected"
    });
  });

  it("export round-trips: importing our own export plans zero creates", () => {
    const op = platformAdmin("op2@example.com");
    const d = createDistrict(db, op, "RT USD");
    if ("error" in d) throw new Error("district failed");
    const supt = addStaff(db, op, d.orgId, "supt@rt.org", "administrator");
    if ("error" in supt) throw new Error("staff failed");
    const admin = sessionOf(supt.userId);
    const applied = importBundle(db, admin, d.orgId, FILES, { dryRun: false });
    if ("error" in applied) throw new Error("apply failed");
    expect(applied.applied).toBe(true);

    const out = exportOneRoster(db, admin, d.orgId);
    if ("error" in out) throw new Error("export failed");
    expect(out.orgs).toContain("Summit Elementary");
    expect(out.users).toContain("Penny");
    expect(out.enrollments).toContain("teacher");

    const round = importBundle(db, admin, d.orgId, out, { dryRun: true });
    if ("error" in round) throw new Error("round failed");
    expect(round.plan.applicable).toBe(true);
    expect(round.plan.orgs.create).toBe(0);
    expect(round.plan.classes.create).toBe(0);
    expect(round.plan.learners.create).toBe(0);
    expect(round.plan.staff.create).toBe(0);
  });

  it("maps OneRoster grades conservatively", () => {
    expect(gradeToInt(["KG"])).toBe(0);
    expect(gradeToInt(["03"])).toBe(3);
    expect(gradeToInt(["11"])).toBe(11);
    expect(gradeToInt(["postsecondary"])).toBeNull();
    expect(gradeToInt([])).toBeNull();
  });
});
