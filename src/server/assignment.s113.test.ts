/**
 * ASSIGNMENTS (s113) — derived completion against a real database.
 *
 * What must hold:
 *  · authz: the owning teacher and an org administrator manage a class's
 *    assignments; another teacher and a parent are refused;
 *  · refIds are validated against the manifest at creation;
 *  · drafts are invisible to learners; publishing makes them appear;
 *  · progress DERIVES from lesson_completions — no second write path: a
 *    synced completion flips the assignment with no assignment-side write;
 *  · late is a calendar-day comparison of last first-completion vs due date;
 *  · recompute is a rebuildable cache (delete it; recompute restores it);
 *  · finishing an LTI-linked assignment enqueues exactly one ags-score row.
 */
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { migrate, openDb, type DB } from "@/server/db";
import { addLearner, login, sessionFor, signup, type SessionInfo } from "@/server/authService";
import { createClass, joinClass } from "@/server/classService";

import {
  archiveAssignment,
  createAssignment,
  learnerAssignments,
  lessonsFor,
  listClassAssignments,
  publishAssignment,
  recomputeClassAssignments
} from "@/server/assignmentService";

let dir: string;
let db: DB;

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), "maggie-asg-"));
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

/** Stand in for a synced profile: write the projection row directly (the
 * sync-side writer has its own tests in syncService.s43). */
function complete(learnerId: string, lessonId: string, date: string): void {
  db.prepare(
    "INSERT INTO lesson_completions (learner_id, lesson_id, completed_at, best_xp) VALUES (?,?,?,10) ON CONFLICT(learner_id, lesson_id) DO UPDATE SET completed_at = excluded.completed_at"
  ).run(learnerId, lessonId, date);
}

describe("assignments (s113)", () => {
  it("authorizes by ownership, validates refs, derives progress, detects late, rebuilds cache", () => {
    const teacher = account("rivera@example.com", "teacher");
    const other = account("other@example.com", "teacher");
    const parent = account("parent@example.com", "parent");
    const cls = createClass(db, teacher, "Room 14");
    if ("error" in cls) throw new Error("class failed");
    const learner = addLearner(db, parent.user.id, "Penny", 3);
    if ("error" in learner) throw new Error("learner failed");
    const joined = joinClass(db, parent, cls.joinCode, learner.learnerId);
    if ("error" in joined) throw new Error("join failed");

    // Bad ref refused; non-owners refused.
    expect(createAssignment(db, teacher, cls.classId, { kind: "lesson", refId: "no-such-lesson" })).toEqual({
      error: "unknown-ref"
    });
    expect(createAssignment(db, other, cls.classId, { kind: "lesson", refId: "kc-01-01" })).toEqual({
      error: "forbidden"
    });
    expect(listClassAssignments(db, parent, cls.classId)).toEqual({ error: "forbidden" });

    // Draft: invisible to the learner until published.
    const draft = createAssignment(db, teacher, cls.classId, {
      kind: "lesson",
      refId: "kc-01-01",
      dueDate: "2026-07-30"
    });
    if ("error" in draft) throw new Error("create failed");
    expect(learnerAssignments(db, parent, learner.learnerId)).toEqual([]);
    const pub = publishAssignment(db, teacher, draft.assignmentId);
    expect(pub).toEqual({ ok: true });
    const visible = learnerAssignments(db, parent, learner.learnerId);
    if ("error" in visible) throw new Error("read failed");
    expect(visible).toHaveLength(1);
    expect(visible[0].status).toBe("not-started");
    expect(visible[0].lessons).toEqual([{ id: "kc-01-01", title: "Count the Dots", completed: false }]);

    // A synced completion flips it — no assignment-side write happened.
    complete(learner.learnerId, "kc-01-01", "2026-07-25");
    const after = learnerAssignments(db, parent, learner.learnerId);
    if ("error" in after) throw new Error("read failed");
    expect(after[0].status).toBe("on-time");

    // Course assignment: in-progress until every lesson is done; late when the
    // LAST first-completion lands past the due date.
    const courseLessons = lessonsFor("course", "counting-to-20-k");
    if (!courseLessons) throw new Error("manifest course missing");
    const course = createAssignment(db, teacher, cls.classId, {
      kind: "course",
      refId: "counting-to-20-k",
      dueDate: "2026-08-01",
      publish: true
    });
    if ("error" in course) throw new Error("create failed");
    for (const l of courseLessons.slice(0, -1)) complete(learner.learnerId, l, "2026-07-26");
    let rows = listClassAssignments(db, teacher, cls.classId);
    if ("error" in rows) throw new Error("list failed");
    const courseRow = rows.find((r) => r.id === course.assignmentId);
    expect(courseRow?.counts["in-progress"]).toBe(1);
    complete(learner.learnerId, courseLessons[courseLessons.length - 1], "2026-08-03"); // past due
    rows = listClassAssignments(db, teacher, cls.classId);
    if ("error" in rows) throw new Error("list failed");
    expect(rows.find((r) => r.id === course.assignmentId)?.counts.late).toBe(1);

    // The cache is a CACHE: wipe it, recompute rebuilds identically.
    db.prepare("DELETE FROM assignment_status").run();
    recomputeClassAssignments(db, cls.classId);
    const rebuilt = db
      .prepare("SELECT status FROM assignment_status WHERE assignment_id = ? AND learner_id = ?")
      .get(course.assignmentId, learner.learnerId) as { status: string };
    expect(rebuilt.status).toBe("late");

    // Archive hides from the learner surface.
    expect(archiveAssignment(db, teacher, course.assignmentId)).toEqual({ ok: true });
    const post = learnerAssignments(db, parent, learner.learnerId);
    if ("error" in post) throw new Error("read failed");
    expect(post.find((a) => a.id === course.assignmentId)).toBeUndefined();
  });

  it("enqueues exactly one AGS score row when an LTI-linked assignment finishes", () => {
    const teacher = account("lti-t@example.com", "teacher");
    const parent = account("lti-p@example.com", "parent");
    const cls = createClass(db, teacher, "LTI Class");
    if ("error" in cls) throw new Error("class failed");
    const learner = addLearner(db, parent.user.id, "Marco", 0);
    if ("error" in learner) throw new Error("learner failed");
    joinClass(db, parent, cls.joinCode, learner.learnerId);
    const a = createAssignment(db, teacher, cls.classId, {
      kind: "lesson",
      refId: "kc-01-01",
      points: 10,
      publish: true
    });
    if ("error" in a) throw new Error("create failed");
    db.prepare("UPDATE assignments SET external_source = 'lti', external_id = 'rl-42' WHERE id = ?").run(a.assignmentId);

    recomputeClassAssignments(db, cls.classId); // not started: nothing queued
    expect(db.prepare("SELECT COUNT(*) AS n FROM lms_outbox").get()).toEqual({ n: 0 });

    complete(learner.learnerId, "kc-01-01", "2026-07-24");
    recomputeClassAssignments(db, cls.classId); // transition → one score row
    recomputeClassAssignments(db, cls.classId); // steady state → still one
    const outbox = db.prepare("SELECT kind, target, payload FROM lms_outbox").all() as Array<{
      kind: string;
      target: string;
      payload: string;
    }>;
    expect(outbox).toHaveLength(1);
    expect(outbox[0].kind).toBe("ags-score");
    expect(outbox[0].target).toBe("rl-42");
    const payload = JSON.parse(outbox[0].payload) as { scoreGiven: number; scoreMaximum: number };
    expect(payload.scoreGiven).toBe(10);
    expect(payload.scoreMaximum).toBe(10);
  });
});
