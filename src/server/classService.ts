/**
 * CLASS SERVICE — server-side classrooms on the durable tables.
 *
 * Session 42 built the on-device classroom loop (deterministic join codes in
 * a per-account store) and documented that CROSS-DEVICE joins would ride the
 * server tables when the transport landed. This is that transport: the
 * `classrooms` / `classroom_members` rows become the shared truth a teacher's
 * class can converge on from any device.
 *
 * The permission model is the s42 one, enforced from rows:
 *   · only a TEACHER creates classes and reads rosters, and only for classes
 *     they OWN — visibility is "joiners of my class", by construction;
 *   · joining a learner requires the RIGHT TO TOUCH that learner — the
 *     parent's session for their roster, or the learner's own scoped session
 *     for exactly themself (canTouchLearner, same as sync);
 *   · school admins read aggregates elsewhere, never these rosters — so they
 *     have no path here at all;
 *   · unknown code and forbidden learner return ONE error shape ("invalid"),
 *     so the join endpoint cannot be used to probe which codes exist.
 *
 * Joins are idempotent (INSERT OR IGNORE on the composite key): tapping
 * "join" twice, or joining from two devices, lands one row.
 */

import { randomBytes } from "node:crypto";
import type { DB } from "@/server/db";
import { audit, canTouchLearner, type SessionInfo } from "@/server/authService";

/** The s42 alphabet: no 0/O/1/I/L — codes get read aloud in classrooms. */
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

const nowIso = () => new Date().toISOString();
const newId = (p: string) => `${p}_${randomBytes(9).toString("base64url")}`;

function newJoinCode(): string {
  const bytes = randomBytes(6);
  let code = "";
  for (let i = 0; i < 6; i++) code += CODE_ALPHABET[bytes[i] % CODE_ALPHABET.length];
  return code;
}

export interface ClassRow {
  id: string;
  name: string;
  joinCode: string;
  members: number;
}

/** Teachers only. The UNIQUE join_code constraint plus a bounded retry makes
 * code collisions a non-event rather than a 500. */
export function createClass(db: DB, session: SessionInfo, name: string): { classId: string; joinCode: string } | { error: "forbidden" } {
  if (session.learnerId || session.user.role !== "teacher") return { error: "forbidden" };
  const id = newId("c");
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = newJoinCode();
    try {
      const at = nowIso();
      db.prepare("INSERT INTO classrooms (id, teacher_user_id, name, join_code, created_at) VALUES (?,?,?,?,?)").run(
        id,
        session.user.id,
        name,
        code,
        at
      );
      // Dual-write (s113): `enrollments` is the lifecycle table institutional
      // surfaces read; the owner's teacher enrollment is born with the class,
      // matching what the 005 backfill did for classes that pre-dated it.
      db.prepare(
        `INSERT INTO enrollments (id, classroom_id, learner_id, user_id, role, status, is_primary, begin_date, created_at, updated_at)
         VALUES (?,?,NULL,?,'teacher','active',1,?,?,?)`
      ).run(newId("e"), id, session.user.id, at.slice(0, 10), at, at);
      audit(db, session.user.id, "class-created", id);
      return { classId: id, joinCode: code };
    } catch (err) {
      if (!(err instanceof Error) || !/UNIQUE/.test(err.message)) throw err;
      // join_code collision (≈1 in 887M per attempt): draw again.
    }
  }
  throw new Error("join-code space exhausted?"); // five UNIQUE collisions in a row is not chance
}

/** Anyone who can TOUCH the learner may join them to a class by its code:
 * the parent for their roster, the learner's own scoped session for exactly
 * themself. One "invalid" shape covers unknown codes and forbidden learners
 * alike, so nothing enumerates. Idempotent by the composite primary key. */
export function joinClass(db: DB, session: SessionInfo, joinCode: string, learnerId: string): { ok: true; classId: string } | { error: "invalid" } {
  const cls = db.prepare("SELECT id FROM classrooms WHERE join_code = ?").get(joinCode.toUpperCase()) as
    | { id: string }
    | undefined;
  if (!cls || !canTouchLearner(db, session, learnerId)) return { error: "invalid" };
  const at = nowIso();
  db.prepare("INSERT OR IGNORE INTO classroom_members (classroom_id, learner_id, joined_at) VALUES (?,?,?)").run(
    cls.id,
    learnerId,
    at
  );
  // Dual-write (s113): the lifecycle row institutional surfaces read. A
  // re-join after a roster drop reactivates the SAME enrollment — history
  // stays one row per (class, learner), status telling the story.
  db.prepare(
    `INSERT INTO enrollments (id, classroom_id, learner_id, user_id, role, status, is_primary, begin_date, created_at, updated_at)
     VALUES (?,?,?,NULL,'student','active',0,?,?,?)
     ON CONFLICT(classroom_id, learner_id, role) WHERE learner_id IS NOT NULL
       DO UPDATE SET status = 'active', end_date = NULL, updated_at = excluded.updated_at`
  ).run(newId("e"), cls.id, learnerId, at.slice(0, 10), at, at);
  audit(db, session.user.id, "class-joined", `${cls.id}:${learnerId}`);
  return { ok: true, classId: cls.id };
}

/** The owning teacher's roster: exactly the learners who JOINED. */
export function classRoster(
  db: DB,
  session: SessionInfo,
  classId: string
): { name: string; members: Array<{ learnerId: string; name: string; joinedAt: string }> } | { error: "forbidden" } {
  if (session.learnerId || session.user.role !== "teacher") return { error: "forbidden" };
  const cls = db.prepare("SELECT name, teacher_user_id FROM classrooms WHERE id = ?").get(classId) as
    | { name: string; teacher_user_id: string }
    | undefined;
  if (!cls || cls.teacher_user_id !== session.user.id) return { error: "forbidden" };
  const members = db
    .prepare(
      `SELECT m.learner_id AS learnerId, l.name, m.joined_at AS joinedAt
       FROM classroom_members m JOIN learners l ON l.id = m.learner_id
       WHERE m.classroom_id = ? ORDER BY m.joined_at`
    )
    .all(classId) as Array<{ learnerId: string; name: string; joinedAt: string }>;
  return { name: cls.name, members };
}

/** A teacher's classes with member counts — the /teach landing data. */
export function myClasses(db: DB, session: SessionInfo): ClassRow[] | { error: "forbidden" } {
  if (session.learnerId || session.user.role !== "teacher") return { error: "forbidden" };
  return db
    .prepare(
      `SELECT c.id, c.name, c.join_code AS joinCode,
              (SELECT COUNT(*) FROM classroom_members m WHERE m.classroom_id = c.id) AS members
       FROM classrooms c WHERE c.teacher_user_id = ? ORDER BY c.created_at`
    )
    .all(session.user.id) as ClassRow[];
}
