/**
 * ASSIGNMENT SERVICE — server-side assignments with DERIVED completion.
 *
 * The one rule everything else here follows: COMPLETION IS NEVER DOUBLE-
 * BOOKED. An assignment does not get its own "mark done" write path — a
 * learner completes lessons the way they always have (local-first, synced
 * later), and assignment progress is COMPUTED from the lesson_completions
 * projection joined against enrollment. A child who did the work offline on
 * the family tablet satisfies the assignment the moment their profile syncs,
 * with no second bookkeeping system to disagree with the first.
 *
 * `assignment_status` is the cache of that computation (005's note: a cache,
 * not a source of truth). recomputeClassAssignments() rebuilds it from
 * scratch for a classroom; anything reading the cache may call it first.
 * Late is a DATE comparison — completed_at is the learner's local first-
 * completion DAY and due_date is a calendar day, so "handed in by the 15th"
 * means what a teacher thinks it means, timezone-free.
 *
 * Draft → published → archived: only published, unarchived assignments are
 * visible to learners or counted anywhere. kind is restricted to 'lesson' |
 * 'course' at the service layer (the schema allows more; those are headroom,
 * refused here until they mean something). refIds are validated against the
 * curriculum manifest — a typo'd lesson id is an error at creation, not a
 * permanently 0% assignment discovered in June.
 *
 * AGS: when an assignment carries an LTI resource link (external_source =
 * 'lti'), a learner's transition into a finished state enqueues an
 * 'ags-score' row into lms_outbox. Same honesty as mail_outbox: queued
 * durably, delivered by a worker this deployment does not run.
 */

import { randomBytes } from "node:crypto";
import type { DB } from "@/server/db";
import { audit, canTouchLearner, type SessionInfo } from "@/server/authService";
import { canAdminOrg } from "@/server/institutionService";
import manifest from "../../content/curriculum-manifest.json";

const nowIso = () => new Date().toISOString();
const newId = (p: string) => `${p}_${randomBytes(9).toString("base64url")}`;

// ── Curriculum lookup (built once from the manifest) ────────────────────────

interface ManifestLesson {
  id: string;
  title: string;
}
interface ManifestCourse {
  id: string;
  title: string;
  lessons: ManifestLesson[];
}
const COURSES = new Map<string, ManifestCourse>(
  (manifest as { courses: ManifestCourse[] }).courses.map((c) => [c.id, { id: c.id, title: c.title, lessons: c.lessons }])
);
const LESSON_TITLES = new Map<string, string>();
for (const c of COURSES.values()) for (const l of c.lessons) LESSON_TITLES.set(l.id, l.title);

export type AssignmentKind = "lesson" | "course";

/** The lesson ids an assignment demands, in curriculum order. */
export function lessonsFor(kind: AssignmentKind, refId: string): string[] | null {
  if (kind === "lesson") return LESSON_TITLES.has(refId) ? [refId] : null;
  const course = COURSES.get(refId);
  return course ? course.lessons.map((l) => l.id) : null;
}

export function lessonTitle(lessonId: string): string {
  return LESSON_TITLES.get(lessonId) ?? lessonId;
}

// ── Authorization ───────────────────────────────────────────────────────────

/** Teacher who owns the class, or an administrator over its org chain. */
export function canManageClassroom(db: DB, session: SessionInfo, classroomId: string): boolean {
  if (session.learnerId) return false;
  const cls = db.prepare("SELECT teacher_user_id, org_id FROM classrooms WHERE id = ?").get(classroomId) as
    | { teacher_user_id: string; org_id: string | null }
    | undefined;
  if (!cls) return false;
  if (cls.teacher_user_id === session.user.id) return true;
  return cls.org_id !== null && canAdminOrg(db, session, cls.org_id);
}

// ── Lifecycle ───────────────────────────────────────────────────────────────

export interface CreateAssignmentInput {
  kind: AssignmentKind;
  refId: string;
  title?: string;
  instructions?: string;
  /** Calendar date YYYY-MM-DD; null = no deadline. */
  dueDate?: string | null;
  points?: number | null;
  publish?: boolean;
}

export function createAssignment(
  db: DB,
  session: SessionInfo,
  classroomId: string,
  input: CreateAssignmentInput
): { assignmentId: string } | { error: "forbidden" | "unknown-ref" | "bad-due-date" } {
  if (!canManageClassroom(db, session, classroomId)) return { error: "forbidden" };
  const lessons = lessonsFor(input.kind, input.refId);
  if (!lessons || lessons.length === 0) return { error: "unknown-ref" };
  if (input.dueDate != null && !/^\d{4}-\d{2}-\d{2}$/.test(input.dueDate)) return { error: "bad-due-date" };
  const id = newId("a");
  const at = nowIso();
  const fallbackTitle =
    input.kind === "lesson" ? lessonTitle(input.refId) : COURSES.get(input.refId)?.title ?? input.refId;
  db.prepare(
    `INSERT INTO assignments (id, classroom_id, kind, ref_id, title, instructions, due_date, points, published_at, created_by, created_at, updated_at)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`
  ).run(
    id,
    classroomId,
    input.kind,
    input.refId,
    (input.title ?? "").trim() || fallbackTitle,
    (input.instructions ?? "").trim(),
    input.dueDate ?? null,
    input.points ?? null,
    input.publish ? at : null,
    session.user.id,
    at,
    at
  );
  audit(db, session.user.id, "assignment-created", id);
  return { assignmentId: id };
}

export function publishAssignment(
  db: DB,
  session: SessionInfo,
  assignmentId: string
): { ok: true } | { error: "forbidden" | "not-found" } {
  const a = db.prepare("SELECT classroom_id, published_at FROM assignments WHERE id = ? AND archived_at IS NULL").get(
    assignmentId
  ) as { classroom_id: string; published_at: string | null } | undefined;
  if (!a) return { error: "not-found" };
  if (!canManageClassroom(db, session, a.classroom_id)) return { error: "forbidden" };
  if (!a.published_at) {
    db.prepare("UPDATE assignments SET published_at = ?, updated_at = ? WHERE id = ?").run(nowIso(), nowIso(), assignmentId);
    audit(db, session.user.id, "assignment-published", assignmentId);
  }
  return { ok: true };
}

export function archiveAssignment(
  db: DB,
  session: SessionInfo,
  assignmentId: string
): { ok: true } | { error: "forbidden" | "not-found" } {
  const a = db.prepare("SELECT classroom_id FROM assignments WHERE id = ?").get(assignmentId) as
    | { classroom_id: string }
    | undefined;
  if (!a) return { error: "not-found" };
  if (!canManageClassroom(db, session, a.classroom_id)) return { error: "forbidden" };
  db.prepare("UPDATE assignments SET archived_at = COALESCE(archived_at, ?), updated_at = ? WHERE id = ?").run(
    nowIso(),
    nowIso(),
    assignmentId
  );
  audit(db, session.user.id, "assignment-archived", assignmentId);
  return { ok: true };
}

// ── Derived status ──────────────────────────────────────────────────────────

export type AssignmentProgressStatus = "not-started" | "in-progress" | "on-time" | "late";

interface StatusRow {
  learnerId: string;
  status: AssignmentProgressStatus;
  completed: number;
  total: number;
  finishedAt: string | null;
  score: number | null;
}

/** Compute one learner's state for one assignment from the projections. */
function deriveStatus(
  db: DB,
  learnerId: string,
  lessons: readonly string[],
  dueDate: string | null
): StatusRow {
  const placeholders = lessons.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT lesson_id, completed_at FROM lesson_completions WHERE learner_id = ? AND lesson_id IN (${placeholders})`
    )
    .all(learnerId, ...lessons) as Array<{ lesson_id: string; completed_at: string | null }>;
  const completed = rows.length;
  const total = lessons.length;
  if (completed === 0) {
    return { learnerId, status: "not-started", completed, total, finishedAt: null, score: 0 };
  }
  if (completed < total) {
    return { learnerId, status: "in-progress", completed, total, finishedAt: null, score: completed / total };
  }
  // Finished: latest first-completion DAY decides late/on-time.
  const dates = rows.map((r) => r.completed_at).filter((d): d is string => !!d);
  const finishedAt = dates.length ? dates.reduce((a, b) => (a > b ? a : b)) : null;
  const late = dueDate !== null && finishedAt !== null && finishedAt.slice(0, 10) > dueDate;
  return { learnerId, status: late ? "late" : "on-time", completed, total, finishedAt, score: 1 };
}

/** Rebuild the assignment_status cache for every published assignment of a
 * classroom, against its ACTIVE student enrollments. Finish transitions on
 * LTI-linked assignments enqueue AGS score rows. */
export function recomputeClassAssignments(db: DB, classroomId: string): void {
  const assignments = db
    .prepare(
      "SELECT id, kind, ref_id, due_date, points, external_id, external_source FROM assignments WHERE classroom_id = ? AND published_at IS NOT NULL AND archived_at IS NULL"
    )
    .all(classroomId) as Array<{
    id: string;
    kind: string;
    ref_id: string;
    due_date: string | null;
    points: number | null;
    external_id: string | null;
    external_source: string | null;
  }>;
  if (assignments.length === 0) return;
  const learners = (
    db
      .prepare(
        "SELECT DISTINCT learner_id FROM enrollments WHERE classroom_id = ? AND role = 'student' AND status = 'active' AND learner_id IS NOT NULL"
      )
      .all(classroomId) as Array<{ learner_id: string }>
  ).map((r) => r.learner_id);
  const at = nowIso();
  const upsert = db.prepare(
    `INSERT INTO assignment_status (assignment_id, learner_id, status, completed_lessons, total_lessons, finished_at, score, computed_at)
     VALUES (?,?,?,?,?,?,?,?)
     ON CONFLICT(assignment_id, learner_id) DO UPDATE SET status = excluded.status,
       completed_lessons = excluded.completed_lessons, total_lessons = excluded.total_lessons,
       finished_at = excluded.finished_at, score = excluded.score, computed_at = excluded.computed_at`
  );
  const prior = db.prepare("SELECT status FROM assignment_status WHERE assignment_id = ? AND learner_id = ?");
  const enqueueScore = db.prepare(
    "INSERT INTO lms_outbox (kind, target, payload, created_at) VALUES ('ags-score', ?, ?, ?)"
  );
  const tx = db.transaction(() => {
    for (const a of assignments) {
      const lessons = lessonsFor(a.kind as AssignmentKind, a.ref_id);
      if (!lessons) continue; // manifest drift: leave prior cache rather than lie
      for (const learnerId of learners) {
        const s = deriveStatus(db, learnerId, lessons, a.due_date);
        const before = prior.get(a.id, learnerId) as { status: string } | undefined;
        upsert.run(a.id, learnerId, s.status, s.completed, s.total, s.finishedAt, s.score, at);
        const nowFinished = s.status === "on-time" || s.status === "late";
        const wasFinished = before?.status === "on-time" || before?.status === "late";
        if (nowFinished && !wasFinished && a.external_source === "lti" && a.external_id) {
          enqueueScore.run(
            a.external_id,
            JSON.stringify({
              assignmentId: a.id,
              learnerId,
              resourceLinkId: a.external_id,
              scoreGiven: a.points !== null ? Math.round((s.score ?? 0) * a.points * 100) / 100 : s.score,
              scoreMaximum: a.points ?? 1,
              activityProgress: "Completed",
              gradingProgress: "FullyGraded",
              finishedAt: s.finishedAt
            }),
            at
          );
        }
      }
    }
  });
  tx();
}

// ── Reads ───────────────────────────────────────────────────────────────────

export interface TeacherAssignmentRow {
  id: string;
  kind: AssignmentKind;
  refId: string;
  title: string;
  instructions: string;
  dueDate: string | null;
  published: boolean;
  archived: boolean;
  lessonCount: number;
  counts: Record<AssignmentProgressStatus, number>;
}

/** The teacher's view of a class's assignments, cache freshly rebuilt. */
export function listClassAssignments(
  db: DB,
  session: SessionInfo,
  classroomId: string
): TeacherAssignmentRow[] | { error: "forbidden" } {
  if (!canManageClassroom(db, session, classroomId)) return { error: "forbidden" };
  recomputeClassAssignments(db, classroomId);
  const rows = db
    .prepare(
      "SELECT id, kind, ref_id AS refId, title, instructions, due_date AS dueDate, published_at, archived_at FROM assignments WHERE classroom_id = ? ORDER BY COALESCE(due_date, '9999'), created_at, id"
    )
    .all(classroomId) as Array<{
    id: string;
    kind: AssignmentKind;
    refId: string;
    title: string;
    instructions: string;
    dueDate: string | null;
    published_at: string | null;
    archived_at: string | null;
  }>;
  const countRows = db
    .prepare(
      `SELECT s.assignment_id, s.status, COUNT(*) AS n FROM assignment_status s
       JOIN assignments a ON a.id = s.assignment_id WHERE a.classroom_id = ? GROUP BY s.assignment_id, s.status`
    )
    .all(classroomId) as Array<{ assignment_id: string; status: AssignmentProgressStatus; n: number }>;
  const countsByAssignment = new Map<string, Record<AssignmentProgressStatus, number>>();
  for (const c of countRows) {
    const rec =
      countsByAssignment.get(c.assignment_id) ?? { "not-started": 0, "in-progress": 0, "on-time": 0, late: 0 };
    rec[c.status] = c.n;
    countsByAssignment.set(c.assignment_id, rec);
  }
  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    refId: r.refId,
    title: r.title,
    instructions: r.instructions,
    dueDate: r.dueDate,
    published: r.published_at !== null,
    archived: r.archived_at !== null,
    lessonCount: lessonsFor(r.kind, r.refId)?.length ?? 0,
    counts: countsByAssignment.get(r.id) ?? { "not-started": 0, "in-progress": 0, "on-time": 0, late: 0 }
  }));
}

export interface LearnerAssignment {
  id: string;
  classroomId: string;
  className: string;
  title: string;
  instructions: string;
  dueDate: string | null;
  lessons: Array<{ id: string; title: string; completed: boolean }>;
  status: AssignmentProgressStatus;
}

/** A learner's published assignments across their active enrollments, with
 * live per-lesson completion (one learner — cheap to read directly). */
export function learnerAssignments(
  db: DB,
  session: SessionInfo,
  learnerId: string
): LearnerAssignment[] | { error: "forbidden" } {
  if (!canTouchLearner(db, session, learnerId)) return { error: "forbidden" };
  const rows = db
    .prepare(
      `SELECT a.id, a.classroom_id AS classroomId, c.name AS className, a.kind, a.ref_id AS refId,
              a.title, a.instructions, a.due_date AS dueDate
       FROM assignments a
       JOIN classrooms c ON c.id = a.classroom_id
       JOIN enrollments e ON e.classroom_id = a.classroom_id AND e.learner_id = ? AND e.role = 'student' AND e.status = 'active'
       WHERE a.published_at IS NOT NULL AND a.archived_at IS NULL
       ORDER BY COALESCE(a.due_date, '9999'), a.created_at, a.id`
    )
    .all(learnerId) as Array<{
    id: string;
    classroomId: string;
    className: string;
    kind: AssignmentKind;
    refId: string;
    title: string;
    instructions: string;
    dueDate: string | null;
  }>;
  return rows.flatMap((r) => {
    const lessonIds = lessonsFor(r.kind, r.refId);
    if (!lessonIds) return [];
    const s = deriveStatus(db, learnerId, lessonIds, r.dueDate);
    const done = new Set(
      (
        db
          .prepare(
            `SELECT lesson_id FROM lesson_completions WHERE learner_id = ? AND lesson_id IN (${lessonIds.map(() => "?").join(",")})`
          )
          .all(learnerId, ...lessonIds) as Array<{ lesson_id: string }>
      ).map((x) => x.lesson_id)
    );
    return [
      {
        id: r.id,
        classroomId: r.classroomId,
        className: r.className,
        title: r.title,
        instructions: r.instructions,
        dueDate: r.dueDate,
        lessons: lessonIds.map((id) => ({ id, title: lessonTitle(id), completed: done.has(id) })),
        status: s.status
      }
    ];
  });
}
