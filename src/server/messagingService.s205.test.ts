/**
 * MESSAGING (s205) — the permission model proven the s42/s44 way: DENIALS ARE
 * THE ENFORCEMENT. Every rule below is stated as something that must be
 * refused, because a messaging feature between children and adults is judged
 * on what it will not do.
 *
 * The five rules under test:
 *   1. A learner reaches only their own teachers and guardians — never
 *      another learner, including a CLASSMATE, which is the tempting path.
 *   2. A parent reaches their learners' teachers and their own learners,
 *      never another family.
 *   3. A teacher reaches taught learners and their guardians, never a
 *      stranger's child.
 *   4. A school-admin reaches staff of administered orgs and those staff's
 *      families.
 *   5. A platform-admin reaches everyone — and still reads NOTHING they are
 *      not a named participant of. Visible oversight, never silent.
 *
 * Plus: reading is a participant row (not a role), a PIN session acts as the
 * LEARNER and does not inherit the parent's reach, thread existence does not
 * leak through error shapes, and ending a relationship ends posting without
 * destroying history.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import { addLearner, login, sessionFor, setLearnerPin, signup, unlockLearner, type SessionInfo } from "@/server/authService";
import { createClass, joinClass } from "@/server/classService";
import {
  canReach, createThread, fileIssueReport, listIssueReports, listThreads,
  postMessage, readThread, reachableFrom, sessionPrincipal, type Principal,
} from "@/server/messagingService";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-msg-"));
  db = openDb(join(dir, "t.db"));
  migrate(db);
});
afterEach(() => {
  db.close();
  rmSync(dir, { recursive: true, force: true });
});

type Role = "parent" | "teacher" | "school-admin" | "platform-admin";
/** signup() only mints parent/teacher by design (admin roles are granted, not
 * self-selected), so admin fixtures elevate the row afterwards — the same
 * pattern institution.s113 and insight.s113 use. */
function account(email: string, role: Role = "parent"): SessionInfo {
  signup(db, email, "pw-one-two", role === "teacher" ? "teacher" : "parent");
  const r = login(db, email, "pw-one-two");
  if ("error" in r) throw new Error("login failed");
  const session = sessionFor(db, r.token)!;
  if (role === "school-admin" || role === "platform-admin") {
    db.prepare("UPDATE users SET role = ? WHERE id = ?").run(role, session.user.id);
    return sessionFor(db, r.token)!;
  }
  return session;
}

const ok = <T>(r: T): Exclude<T, { error: string }> => {
  if (r && typeof r === "object" && "error" in r) throw new Error(`unexpected ${(r as { error: string }).error}`);
  return r as Exclude<T, { error: string }>;
};

/** A learner plus a PIN-scoped session acting AS that learner. */
function learnerWithSession(parent: SessionInfo, name: string): { id: string; session: SessionInfo } {
  const { learnerId } = addLearner(db, parent.user.id, name);
  setLearnerPin(db, parent.user.id, learnerId, "1234");
  const r = unlockLearner(db, learnerId, "1234");
  if (!r) throw new Error("unlock failed");
  return { id: learnerId, session: sessionFor(db, r.token)! };
}

const has = (list: Principal[], p: Principal) => list.some((x) => x.type === p.type && x.id === p.id);

describe("messaging reach — who may open a conversation", () => {
  it("RULE 1: a learner reaches their teacher and guardian, and NEVER a classmate", () => {
    const teacher = account("t@x.test", "teacher");
    const homeA = account("a@x.test");
    const homeB = account("b@x.test");
    const ana = learnerWithSession(homeA, "Ana");
    const ben = learnerWithSession(homeB, "Ben");

    const cls = ok(createClass(db, teacher, "Room 1"));
    ok(joinClass(db, ana.session, cls.joinCode, ana.id));
    ok(joinClass(db, ben.session, cls.joinCode, ben.id));

    const anaReach = reachableFrom(db, { type: "learner", id: ana.id });
    expect(has(anaReach, { type: "user", id: teacher.user.id })).toBe(true);
    expect(has(anaReach, { type: "user", id: homeA.user.id })).toBe(true);

    // The rule the whole feature is judged on: sharing a classroom does not
    // make two children reachable to each other.
    expect(has(anaReach, { type: "learner", id: ben.id })).toBe(false);
    expect(canReach(db, { type: "learner", id: ana.id }, { type: "learner", id: ben.id })).toBe(false);
    // Nor is the classmate's parent reachable.
    expect(has(anaReach, { type: "user", id: homeB.user.id })).toBe(false);

    // And the refusal is enforced at the door, not just absent from the list.
    expect(createThread(db, ana.session, {
      subject: "hi", to: [{ type: "learner", id: ben.id }], body: "hello",
    })).toEqual({ error: "forbidden" });
  });

  it("RULE 2: a parent reaches their child's teacher, not a stranger's child", () => {
    const teacher = account("t2@x.test", "teacher");
    const homeA = account("a2@x.test");
    const homeB = account("b2@x.test");
    const ana = learnerWithSession(homeA, "Ana");
    const ben = learnerWithSession(homeB, "Ben");
    const cls = ok(createClass(db, teacher, "Room 2"));
    ok(joinClass(db, ana.session, cls.joinCode, ana.id));

    expect(canReach(db, { type: "user", id: homeA.user.id }, { type: "user", id: teacher.user.id })).toBe(true);
    expect(canReach(db, { type: "user", id: homeA.user.id }, { type: "learner", id: ana.id })).toBe(true);
    expect(canReach(db, { type: "user", id: homeA.user.id }, { type: "learner", id: ben.id })).toBe(false);
    expect(canReach(db, { type: "user", id: homeA.user.id }, { type: "user", id: homeB.user.id })).toBe(false);
  });

  it("RULE 3: a teacher reaches taught learners and their guardians, not a stranger's child", () => {
    const teacher = account("t3@x.test", "teacher");
    const other = account("t3b@x.test", "teacher");
    const home = account("a3@x.test");
    const ana = learnerWithSession(home, "Ana");
    const cls = ok(createClass(db, teacher, "Room 3"));
    ok(joinClass(db, ana.session, cls.joinCode, ana.id));

    expect(canReach(db, { type: "user", id: teacher.user.id }, { type: "learner", id: ana.id })).toBe(true);
    expect(canReach(db, { type: "user", id: teacher.user.id }, { type: "user", id: home.user.id })).toBe(true);
    // A teacher with no shared classroom has no path to the child at all.
    expect(canReach(db, { type: "user", id: other.user.id }, { type: "learner", id: ana.id })).toBe(false);
  });

  it("RULE 4: a school-admin reaches their org's staff and those staff's families", () => {
    const admin = account("adm@x.test", "school-admin");
    const teacher = account("t4@x.test", "teacher");
    const home = account("a4@x.test");
    const ana = learnerWithSession(home, "Ana");
    const cls = ok(createClass(db, teacher, "Room 4"));
    ok(joinClass(db, ana.session, cls.joinCode, ana.id));

    const at = new Date().toISOString();
    db.prepare("INSERT INTO orgs (id, parent_org_id, type, name, created_at, updated_at) VALUES ('o1', NULL, 'school', 'School', ?, ?)").run(at, at);
    db.prepare("INSERT INTO org_staff (org_id, user_id, role, status, created_at) VALUES ('o1', ?, 'administrator', 'active', ?)").run(admin.user.id, at);
    db.prepare("INSERT INTO org_staff (org_id, user_id, role, status, created_at) VALUES ('o1', ?, 'teacher', 'active', ?)").run(teacher.user.id, at);

    expect(canReach(db, { type: "user", id: admin.user.id }, { type: "user", id: teacher.user.id })).toBe(true);
    expect(canReach(db, { type: "user", id: admin.user.id }, { type: "learner", id: ana.id })).toBe(true);

    // An admin of a DIFFERENT org has no path.
    const outsider = account("adm2@x.test", "school-admin");
    expect(canReach(db, { type: "user", id: outsider.user.id }, { type: "learner", id: ana.id })).toBe(false);
  });

  it("RULE 5: a platform-admin reaches everyone but READS only threads they are in", () => {
    const root = account("root@x.test", "platform-admin");
    const teacher = account("t5@x.test", "teacher");
    const home = account("a5@x.test");
    const ana = learnerWithSession(home, "Ana");

    expect(canReach(db, { type: "user", id: root.user.id }, { type: "learner", id: ana.id })).toBe(true);
    expect(canReach(db, { type: "user", id: root.user.id }, { type: "user", id: teacher.user.id })).toBe(true);

    // A private thread the admin is not part of.
    const t = ok(createThread(db, home, { subject: "Ana's week", to: [{ type: "learner", id: ana.id }], body: "well done" }));
    expect(listThreads(db, root)).toHaveLength(0);
    expect(readThread(db, root, t.threadId)).toEqual({ error: "not-found" });

    // Oversight is possible, but only by being ADDED — which the family can see.
    const visible = ok(createThread(db, root, { subject: "Check-in", to: [{ type: "user", id: home.user.id }], body: "hello" }));
    expect(listThreads(db, root).map((x) => x.id)).toEqual([visible.threadId]);
    const seen = ok(readThread(db, home, visible.threadId));
    expect(seen.messages[0].body).toBe("hello");
    expect(listThreads(db, home).find((x) => x.id === visible.threadId)!.participants
      .some((p) => p.role === "platform-admin")).toBe(true);
  });
});

describe("messaging reads and writes", () => {
  it("a PIN session acts as the LEARNER and does not inherit the parent's reach", () => {
    const teacher = account("t6@x.test", "teacher");
    const home = account("a6@x.test");
    const ana = learnerWithSession(home, "Ana");
    const bea = learnerWithSession(home, "Bea"); // sibling, same account

    expect(sessionPrincipal(ana.session)).toEqual({ type: "learner", id: ana.id });
    // Ana is not enrolled anywhere, so the teacher her PARENT could reach is
    // not reachable by her — the scoped session is not a proxy for the account.
    const cls = ok(createClass(db, teacher, "Room 6"));
    ok(joinClass(db, bea.session, cls.joinCode, bea.id));
    expect(canReach(db, { type: "user", id: home.user.id }, { type: "user", id: teacher.user.id })).toBe(true);
    expect(canReach(db, { type: "learner", id: ana.id }, { type: "user", id: teacher.user.id })).toBe(false);
    // Siblings are not reachable to each other either.
    expect(canReach(db, { type: "learner", id: ana.id }, { type: "learner", id: bea.id })).toBe(false);
  });

  it("reading is a participant row: a non-participant gets not-found, never forbidden", () => {
    const home = account("a7@x.test");
    const stranger = account("s7@x.test");
    const ana = learnerWithSession(home, "Ana");
    const t = ok(createThread(db, home, { subject: "Homework", to: [{ type: "learner", id: ana.id }], body: "hi" }));

    // not-found, not forbidden — the error shape must not confirm existence.
    expect(readThread(db, stranger, t.threadId)).toEqual({ error: "not-found" });
    expect(readThread(db, stranger, "mt_does-not-exist")).toEqual({ error: "not-found" });
    expect(postMessage(db, stranger, t.threadId, "let me in")).toEqual({ error: "not-found" });
    expect(listThreads(db, stranger)).toHaveLength(0);

    // The participants do see it, and unread counts move on read.
    expect(ok(readThread(db, ana.session, t.threadId)).messages).toHaveLength(1);
    expect(listThreads(db, ana.session)[0].unread).toBe(0);
  });

  it("ending a relationship ends posting but preserves the history", () => {
    const teacher = account("t8@x.test", "teacher");
    const home = account("a8@x.test");
    const ana = learnerWithSession(home, "Ana");
    const cls = ok(createClass(db, teacher, "Room 8"));
    ok(joinClass(db, ana.session, cls.joinCode, ana.id));

    const t = ok(createThread(db, teacher, { subject: "Great work", to: [{ type: "learner", id: ana.id }], body: "nice job today" }));
    ok(postMessage(db, ana.session, t.threadId, "thank you!"));

    // The learner leaves the class: reach ends.
    db.prepare("UPDATE enrollments SET status = 'dropped' WHERE learner_id = ?").run(ana.id);
    expect(canReach(db, { type: "user", id: teacher.user.id }, { type: "learner", id: ana.id })).toBe(false);
    expect(postMessage(db, teacher, t.threadId, "one more thing")).toEqual({ error: "forbidden" });

    // …but the record both sides may need survives, still readable by both.
    expect(ok(readThread(db, teacher, t.threadId)).messages).toHaveLength(2);
    expect(ok(readThread(db, ana.session, t.threadId)).messages).toHaveLength(2);
  });

  it("rejects empty, oversized, and recipientless messages", () => {
    const home = account("a9@x.test");
    const ana = learnerWithSession(home, "Ana");
    const to = [{ type: "learner", id: ana.id } as Principal];
    expect(createThread(db, home, { subject: "", to, body: "x" })).toEqual({ error: "invalid" });
    expect(createThread(db, home, { subject: "s", to, body: "   " })).toEqual({ error: "invalid" });
    expect(createThread(db, home, { subject: "s", to: [], body: "x" })).toEqual({ error: "invalid" });
    expect(createThread(db, home, { subject: "s", to, body: "x".repeat(4001) })).toEqual({ error: "invalid" });
  });
});

describe("issue reports — the universal report control", () => {
  it("accepts a signed-in report, an anonymous one, and stores no screen capture", () => {
    const home = account("a10@x.test");
    const r1 = ok(fileIssueReport(db, home, { route: "/learn/as100-01-01", description: "The Continue button did nothing", viewport: "390x844" }));
    const r2 = ok(fileIssueReport(db, null, { route: "/", description: "Cannot sign in" }));
    expect(r1.reportId).not.toBe(r2.reportId);

    // The stored columns are the whole payload: no screenshot, no DOM blob.
    const cols = (db.prepare("PRAGMA table_info(issue_reports)").all() as Array<{ name: string }>).map((c) => c.name);
    expect(cols).not.toContain("screenshot");
    expect(cols).not.toContain("dom");
    expect(cols).not.toContain("html");
  });

  it("a learner can report, and the triage queue is admins only", () => {
    const home = account("a11@x.test");
    const ana = learnerWithSession(home, "Ana");
    ok(fileIssueReport(db, ana.session, { route: "/learn/x", description: "the tiles are stuck" }));

    expect(listIssueReports(db, ana.session)).toEqual({ error: "forbidden" });
    expect(listIssueReports(db, home)).toEqual({ error: "forbidden" });

    const root = account("root2@x.test", "platform-admin");
    const queue = listIssueReports(db, root);
    expect(Array.isArray(queue) && queue.length).toBe(1);
  });

  it("rejects empty and oversized descriptions", () => {
    expect(fileIssueReport(db, null, { route: "/", description: "  " })).toEqual({ error: "invalid" });
    expect(fileIssueReport(db, null, { route: "/", description: "x".repeat(4001) })).toEqual({ error: "invalid" });
    expect(fileIssueReport(db, null, { route: "", description: "x" })).toEqual({ error: "invalid" });
  });
});
