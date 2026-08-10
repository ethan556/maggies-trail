/**
 * INSIGHTS (s113) — tiers, cases, and suppressed reports over real projections.
 *
 * What must hold:
 *  · a learner with weak, misconception-heavy evidence tiers UP with named
 *    reasons and focus tags; a strong learner stays Tier 1 "on-track";
 *  · a learner with almost no evidence is Tier 1 (insufficient evidence is
 *    not need — the module's own stance);
 *  · intervention cases: only someone who can manage the class opens/works
 *    them; notes accumulate; resolve stamps resolved_at;
 *  · org reports suppress small cohorts (and the CSV shows the suppression,
 *    not the numbers); non-admins are refused.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import { addLearner, login, sessionFor, signup, type SessionInfo } from "@/server/authService";
import { createClass, joinClass } from "@/server/classService";
import { addStaff, createDistrict, createSchool } from "@/server/institutionService";
import {
  addInterventionNote,
  classInsights,
  listInterventions,
  openIntervention,
  orgReport,
  orgReportCsv,
  setInterventionStatus
} from "@/server/insightService";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-ins-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

function account(email: string, role: "parent" | "teacher"): SessionInfo {
  signup(db, email, "pw-one-two", role);
  const r = login(db, email, "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  const s = sessionFor(db, r.token);
  if (!s) throw new Error("no session");
  return s;
}
function platformAdmin(email: string): SessionInfo {
  const s = account(email, "parent");
  db.prepare("UPDATE users SET role = 'platform-admin' WHERE id = ?").run(s.user.id);
  const r = login(db, email, "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  return sessionFor(db, r.token)!;
}

const todayIso = new Date().toISOString().slice(0, 10);
function daysAgo(n: number): string {
  return new Date(Date.now() - n * 86400_000).toISOString().slice(0, 10);
}

function evidence(learnerId: string, tag: string, mastery: number, attempts: number, lastSeen: string, signals = "{}"): void {
  db.prepare(
    "INSERT INTO skill_evidence (learner_id, tag, mastery, attempts, last_seen, contexts, signals) VALUES (?,?,?,?,?,0,?)"
  ).run(learnerId, tag, mastery, attempts, lastSeen, signals);
}
function complete(learnerId: string, lessonId: string, date: string): void {
  db.prepare("INSERT INTO lesson_completions (learner_id, lesson_id, completed_at, best_xp) VALUES (?,?,?,10)").run(
    learnerId,
    lessonId,
    date
  );
}

describe("class insights (s113)", () => {
  it("tiers from projections with named reasons; cases carry notes and status", () => {
    const teacher = account("t@example.com", "teacher");
    const outsider = account("x@example.com", "teacher");
    const parent = account("p@example.com", "parent");
    const cls = createClass(db, teacher, "Room 14");
    if ("error" in cls) throw new Error("class failed");

    const strong = addLearner(db, parent.user.id, "Ada", 3);
    const weak = addLearner(db, parent.user.id, "Ben", 3);
    const quiet = addLearner(db, parent.user.id, "Cy", 3);
    for (const l of [strong, weak, quiet]) joinClass(db, parent, cls.joinCode, l.learnerId);

    // Ada: six proficient, recently seen skills + steady activity.
    for (let i = 0; i < 6; i++) {
      evidence(strong.learnerId, `tag-${i}`, 0.9, 5, daysAgo(2));
      complete(strong.learnerId, `lesson-a${i}`, daysAgo(i + 1));
    }
    // Ben: six weak skills, one with a heavy misconception ledger.
    for (let i = 0; i < 6; i++) {
      evidence(weak.learnerId, `tag-${i}`, 0.3, 6, daysAgo(3), i === 0 ? '{"guess-and-check":4}' : "{}");
    }
    complete(weak.learnerId, "lesson-b0", daysAgo(2));
    // Cy: two attempts total — insufficient evidence, deliberately Tier 1.
    evidence(quiet.learnerId, "tag-0", 0.2, 2, daysAgo(9));

    expect(classInsights(db, outsider, cls.classId)).toEqual({ error: "forbidden" });
    const insights = classInsights(db, teacher, cls.classId);
    if ("error" in insights) throw new Error("insights failed");
    const byName = new Map(insights.tiers.map((t) => [t.name, t]));
    expect(byName.get("Ada")?.tier).toBe(1);
    expect(byName.get("Ada")?.reasons.map((r) => r.code)).toContain("on-track");
    const ben = byName.get("Ben");
    expect(ben?.tier).toBe(3); // 0/6 proficient ⇒ far under the Tier 3 share
    expect(ben?.reasons.map((r) => r.code)).toContain("low-proficiency");
    expect(ben?.reasons.map((r) => r.code)).toContain("persistent-misconception");
    expect(ben?.focusTags).toContain("tag-0");
    expect(byName.get("Cy")?.tier).toBe(1);
    expect(byName.get("Cy")?.reasons[0].code).toBe("insufficient-evidence");
    expect(insights.counts.tier3).toBe(1);

    // Cases: outsider refused; owner opens, notes, resolves.
    expect(
      openIntervention(db, outsider, {
        learnerId: weak.learnerId,
        classroomId: cls.classId,
        reason: "nope",
        conceptTags: [],
        tier: 2
      })
    ).toEqual({ error: "forbidden" });
    const opened = openIntervention(db, teacher, {
      learnerId: weak.learnerId,
      classroomId: cls.classId,
      reason: "Small-group reteach on place value",
      conceptTags: ben?.focusTags ?? [],
      tier: 3
    });
    if ("error" in opened) throw new Error("open failed");
    expect(addInterventionNote(db, teacher, opened.interventionId, "Met Tuesday; used base-ten blocks.")).toEqual({
      ok: true
    });
    expect(setInterventionStatus(db, teacher, opened.interventionId, "resolved")).toEqual({ ok: true });
    const cases = listInterventions(db, teacher, cls.classId);
    if ("error" in cases) throw new Error("list failed");
    expect(cases).toHaveLength(1);
    expect(cases[0].status).toBe("resolved");
    expect(cases[0].notes).toHaveLength(1);
    expect(cases[0].conceptTags).toContain("tag-0");
    expect(
      db.prepare("SELECT resolved_at FROM interventions WHERE id = ?").get(opened.interventionId)
    ).not.toEqual({ resolved_at: null });
    expect(listInterventions(db, outsider, cls.classId)).toEqual({ error: "forbidden" });
  });
});

describe("org reports (s113)", () => {
  it("suppresses small cohorts, keeps the total, and refuses non-admins", () => {
    const op = platformAdmin("op@example.com");
    const d = createDistrict(db, op, "Tally Peak USD");
    if ("error" in d) throw new Error("district failed");
    const school = createSchool(db, op, d.orgId, "Summit");
    if ("error" in school) throw new Error("school failed");
    const supt = addStaff(db, op, d.orgId, "supt@tp.org", "administrator");
    if ("error" in supt) throw new Error("staff failed");

    // A teacher's class, attached to the school org, with THREE learners —
    // below the default cohort of 10, so the class/school cells suppress.
    const teacher = account("t2@example.com", "teacher");
    const parent = account("p2@example.com", "parent");
    const cls = createClass(db, teacher, "Room 1");
    if ("error" in cls) throw new Error("class failed");
    db.prepare("UPDATE classrooms SET org_id = ? WHERE id = ?").run(school.orgId, cls.classId);
    for (let i = 0; i < 3; i++) {
      const l = addLearner(db, parent.user.id, `Kid ${i}`, 2);
      joinClass(db, parent, cls.joinCode, l.learnerId);
      evidence(l.learnerId, "tag-a", 0.9, 4, todayIso);
    }

    const u = db.prepare("SELECT id, email, role FROM users WHERE id = ?").get(supt.userId) as {
      id: string;
      email: string;
      role: "school-admin";
    };
    const admin: SessionInfo = { user: { id: u.id, email: u.email, role: u.role, emailVerifiedAt: null }, learnerId: null };

    expect(orgReport(db, teacher, d.orgId, "school")).toEqual({ error: "forbidden" });
    const report = orgReport(db, admin, d.orgId, "school");
    if ("error" in report) throw new Error("report failed");
    expect(report.cells).toHaveLength(1);
    expect(report.cells[0].suppressed).toBe(true);
    expect(report.cells[0].proficientShare).toBeUndefined();
    expect(report.total.suppressed).toBe(true); // whole population below threshold

    // With minCohort 3 the cell reports real numbers.
    const open = orgReport(db, admin, d.orgId, "school", 3);
    if ("error" in open) throw new Error("report failed");
    expect(open.cells[0].suppressed).toBe(false);
    expect(open.cells[0].proficientShare).toBe(1);

    const csv = orgReportCsv(db, admin, d.orgId, "school");
    if (typeof csv !== "string") throw new Error("csv failed");
    expect(csv).toContain("suppressed");
    expect(csv).not.toContain("100");
  });
});
