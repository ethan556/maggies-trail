/**
 * MESSAGING SERVICE — who may talk to whom, and how that is enforced.
 *
 * The rule that shapes everything here: READING IS A ROW, NOT A ROLE. Every
 * read path in this file ends at `message_participants`. No query says "…or
 * the caller is an admin". An administrator who needs to see a conversation is
 * ADDED to it as a named participant, which the family can see. That is a
 * deliberate refusal to build silent oversight of children's messages.
 *
 * The part SQL cannot express — who is allowed to OPEN a thread with whom —
 * lives in `reachableFrom()`, computed from rows the product already
 * maintains (guardianship, enrollments, org staffing). The five rules:
 *
 *   1. A LEARNER reaches only their own teachers and their own guardians.
 *      Never another learner, at any distance, through any classroom. This is
 *      the rule the whole feature is judged on.
 *   2. A PARENT reaches their own learners' teachers, the co-guardians of
 *      those learners, and their own learners. Not other families.
 *   3. A TEACHER reaches learners enrolled in classes they teach, those
 *      learners' guardians, and co-teachers of those classes.
 *   4. A SCHOOL-ADMIN reaches staff of orgs they administer, plus the
 *      families and learners of classrooms owned by that staff.
 *   5. A PLATFORM-ADMIN reaches any user or learner — the "admin can reach
 *      everyone" requirement — but gains NO extra read: they must open or be
 *      added to a thread, visibly, like anyone else.
 *
 * Reach is checked at thread creation AND at every post, because a
 * relationship can end: when a learner leaves a class, the teacher keeps the
 * history (removing it would destroy a record both sides may need) but cannot
 * post again.
 */

import { randomBytes } from "node:crypto";
import type { DB } from "@/server/db";
import type { SessionInfo } from "@/server/authService";

const nowIso = () => new Date().toISOString();
const newId = (p: string) => `${p}_${randomBytes(9).toString("base64url")}`;

/** A message principal: a user account, or a learner (who is not a user). */
export type Principal =
  | { type: "user"; id: string }
  | { type: "learner"; id: string };

export interface ThreadSummary {
  id: string;
  subject: string;
  lastMessageAt: string;
  participants: Array<{ principal: Principal; role: string; label: string }>;
  unread: number;
}

export interface MessageRow {
  id: string;
  author: Principal;
  authorLabel: string;
  body: string;
  createdAt: string;
}

export type MessagingError = { error: "forbidden" | "not-found" | "invalid" };

/** The principal a session acts as. A PIN-scoped session acts as the LEARNER,
 * never as the parent account that owns the device — otherwise a child would
 * inherit their parent's entire reach. */
export function sessionPrincipal(session: SessionInfo): Principal {
  return session.learnerId
    ? { type: "learner", id: session.learnerId }
    : { type: "user", id: session.user.id };
}

const samePrincipal = (a: Principal, b: Principal) => a.type === b.type && a.id === b.id;

const key = (p: Principal) => `${p.type}:${p.id}`;

/** MAX_BODY exists so a single message cannot be used as bulk storage. The
 * route also caps the request body; this is the model-level backstop. */
export const MAX_BODY = 4000;
export const MAX_SUBJECT = 120;

// ── Reach ───────────────────────────────────────────────────────────────────

/** Guardians of a learner: the owning account today, extensible to co-guardians. */
function guardiansOf(db: DB, learnerId: string): Principal[] {
  const row = db.prepare("SELECT account_id FROM learners WHERE id = ?").get(learnerId) as
    | { account_id: string }
    | undefined;
  return row ? [{ type: "user", id: row.account_id }] : [];
}

/** Learners of a guardian account. */
function learnersOf(db: DB, userId: string): Principal[] {
  return (db.prepare("SELECT id FROM learners WHERE account_id = ?").all(userId) as Array<{ id: string }>)
    .map((r) => ({ type: "learner", id: r.id }) as Principal);
}

/** Teachers of a learner: owners of classrooms the learner is actively enrolled in,
 * plus teacher-role enrollments in those same classrooms (co-teachers). */
function teachersOfLearner(db: DB, learnerId: string): Principal[] {
  const rows = db.prepare(`
    SELECT DISTINCT u.id AS id FROM enrollments e
      JOIN classrooms c ON c.id = e.classroom_id
      JOIN users u ON u.id = c.teacher_user_id
     WHERE e.learner_id = ? AND e.status = 'active'
    UNION
    SELECT DISTINCT te.user_id AS id FROM enrollments e
      JOIN enrollments te ON te.classroom_id = e.classroom_id
     WHERE e.learner_id = ? AND e.status = 'active'
       AND te.role = 'teacher' AND te.status = 'active' AND te.user_id IS NOT NULL
  `).all(learnerId, learnerId) as Array<{ id: string }>;
  return rows.map((r) => ({ type: "user", id: r.id }) as Principal);
}

/** Learners a teacher actively teaches. */
function learnersOfTeacher(db: DB, userId: string): Principal[] {
  const rows = db.prepare(`
    SELECT DISTINCT e.learner_id AS id FROM enrollments e
      JOIN classrooms c ON c.id = e.classroom_id
     WHERE c.teacher_user_id = ? AND e.learner_id IS NOT NULL AND e.status = 'active'
    UNION
    SELECT DISTINCT e.learner_id AS id FROM enrollments e
     WHERE e.learner_id IS NOT NULL AND e.status = 'active'
       AND e.classroom_id IN (
         SELECT classroom_id FROM enrollments
          WHERE user_id = ? AND role = 'teacher' AND status = 'active')
  `).all(userId, userId) as Array<{ id: string }>;
  return rows.map((r) => ({ type: "learner", id: r.id }) as Principal);
}

/**
 * Everyone `actor` is permitted to open a conversation with.
 *
 * Deliberately returns a SET rather than answering a yes/no question, because
 * the compose UI needs exactly this list — and a picker built from the same
 * function that enforces the rule cannot drift from it.
 */
export function reachableFrom(db: DB, actor: Principal): Principal[] {
  const out = new Map<string, Principal>();
  const add = (p: Principal) => { if (!samePrincipal(p, actor)) out.set(key(p), p); };

  if (actor.type === "learner") {
    // RULE 1. Own teachers and own guardians. Nothing else — note there is no
    // path here that starts from a classroom and ends at another learner.
    teachersOfLearner(db, actor.id).forEach(add);
    guardiansOf(db, actor.id).forEach(add);
    return [...out.values()];
  }

  const user = db.prepare("SELECT id, role FROM users WHERE id = ? AND deleted_at IS NULL").get(actor.id) as
    | { id: string; role: string }
    | undefined;
  if (!user) return [];

  if (user.role === "platform-admin") {
    // RULE 5. Reach everyone — and still read nothing they are not a named
    // participant of. Reach is the right to START a visible conversation.
    for (const r of db.prepare("SELECT id FROM users WHERE deleted_at IS NULL").all() as Array<{ id: string }>)
      add({ type: "user", id: r.id });
    for (const r of db.prepare("SELECT id FROM learners").all() as Array<{ id: string }>)
      add({ type: "learner", id: r.id });
    return [...out.values()];
  }

  // RULE 2. A parent's own learners, their teachers, and co-guardians.
  for (const learner of learnersOf(db, actor.id)) {
    add(learner);
    teachersOfLearner(db, learner.id).forEach(add);
    guardiansOf(db, learner.id).forEach(add);
  }

  if (user.role === "teacher") {
    // RULE 3. Taught learners, their guardians, and co-teachers.
    for (const learner of learnersOfTeacher(db, actor.id)) {
      add(learner);
      guardiansOf(db, learner.id).forEach(add);
      teachersOfLearner(db, learner.id).forEach(add);
    }
  }

  if (user.role === "school-admin") {
    // RULE 4. Staff of administered orgs, and the families/learners of the
    // classrooms those staff own.
    const orgs = (db.prepare(
      "SELECT org_id FROM org_staff WHERE user_id = ? AND role = 'administrator' AND status = 'active'"
    ).all(actor.id) as Array<{ org_id: string }>).map((r) => r.org_id);
    for (const orgId of orgs) {
      const staff = db.prepare(
        "SELECT DISTINCT user_id FROM org_staff WHERE org_id = ? AND status = 'active'"
      ).all(orgId) as Array<{ user_id: string }>;
      for (const s of staff) {
        add({ type: "user", id: s.user_id });
        for (const learner of learnersOfTeacher(db, s.user_id)) {
          add(learner);
          guardiansOf(db, learner.id).forEach(add);
        }
      }
    }
  }

  return [...out.values()];
}

export function canReach(db: DB, actor: Principal, target: Principal): boolean {
  return reachableFrom(db, actor).some((p) => samePrincipal(p, target));
}

// ── Participation ───────────────────────────────────────────────────────────

/** THE read gate. Every read path in this file goes through here. */
export function isParticipant(db: DB, threadId: string, p: Principal): boolean {
  const row = p.type === "user"
    ? db.prepare("SELECT 1 AS ok FROM message_participants WHERE thread_id = ? AND user_id = ?").get(threadId, p.id)
    : db.prepare("SELECT 1 AS ok FROM message_participants WHERE thread_id = ? AND learner_id = ?").get(threadId, p.id);
  return !!row;
}

function labelFor(db: DB, p: Principal): string {
  if (p.type === "learner") {
    const r = db.prepare("SELECT name FROM learners WHERE id = ?").get(p.id) as { name: string } | undefined;
    return r?.name ?? "Learner";
  }
  const r = db.prepare("SELECT email FROM users WHERE id = ?").get(p.id) as { email: string } | undefined;
  return r?.email ?? "Account";
}

function roleFor(db: DB, p: Principal): string {
  if (p.type === "learner") return "learner";
  const r = db.prepare("SELECT role FROM users WHERE id = ?").get(p.id) as { role: string } | undefined;
  return r?.role ?? "parent";
}

// ── Threads ─────────────────────────────────────────────────────────────────

export function createThread(
  db: DB,
  session: SessionInfo,
  input: { subject: string; to: Principal[]; body: string; contextClassroomId?: string; contextLearnerId?: string }
): { threadId: string } | MessagingError {
  const actor = sessionPrincipal(session);
  const subject = input.subject.trim();
  const body = input.body.trim();
  if (!subject || subject.length > MAX_SUBJECT) return { error: "invalid" };
  if (!body || body.length > MAX_BODY) return { error: "invalid" };
  if (input.to.length === 0) return { error: "invalid" };

  // Reach is checked for EVERY recipient. One unreachable recipient fails the
  // whole thread rather than silently dropping them — a message the sender
  // believes reached someone who never got it is worse than an error.
  for (const target of input.to) if (!canReach(db, actor, target)) return { error: "forbidden" };

  const id = newId("mt");
  const at = nowIso();
  const run = db.transaction(() => {
    db.prepare(`INSERT INTO message_threads
      (id, subject, context_classroom_id, context_learner_id, created_by_user_id, created_by_learner_id, created_at, last_message_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).run(
      id, subject, input.contextClassroomId ?? null, input.contextLearnerId ?? null,
      actor.type === "user" ? actor.id : null,
      actor.type === "learner" ? actor.id : null,
      at, at
    );
    for (const p of [actor, ...input.to]) addParticipantRow(db, id, p, at);
    insertMessage(db, id, actor, body, at);
  });
  run();
  return { threadId: id };
}

function addParticipantRow(db: DB, threadId: string, p: Principal, at: string): void {
  db.prepare(`INSERT OR IGNORE INTO message_participants
    (thread_id, principal_type, user_id, learner_id, participant_role, added_at)
    VALUES (?, ?, ?, ?, ?, ?)`).run(
    threadId, p.type,
    p.type === "user" ? p.id : null,
    p.type === "learner" ? p.id : null,
    roleFor(db, p), at
  );
}

function insertMessage(db: DB, threadId: string, author: Principal, body: string, at: string): string {
  const id = newId("msg");
  db.prepare(`INSERT INTO messages (id, thread_id, author_type, author_user_id, author_learner_id, body, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?)`).run(
    id, threadId, author.type,
    author.type === "user" ? author.id : null,
    author.type === "learner" ? author.id : null,
    body, at
  );
  db.prepare("UPDATE message_threads SET last_message_at = ? WHERE id = ?").run(at, threadId);
  return id;
}

/** Posting re-checks reach against the OTHER participants, so an ended
 * relationship ends the conversation without deleting its history. */
export function postMessage(db: DB, session: SessionInfo, threadId: string, body: string): { messageId: string } | MessagingError {
  const actor = sessionPrincipal(session);
  const text = body.trim();
  if (!text || text.length > MAX_BODY) return { error: "invalid" };
  if (!isParticipant(db, threadId, actor)) return { error: "not-found" };

  const others = participantsOf(db, threadId).filter((p) => !samePrincipal(p.principal, actor));
  if (others.length > 0 && !others.some((p) => canReach(db, actor, p.principal))) return { error: "forbidden" };

  return { messageId: insertMessage(db, threadId, actor, text, nowIso()) };
}

export function participantsOf(db: DB, threadId: string): Array<{ principal: Principal; role: string; label: string }> {
  const rows = db.prepare(
    "SELECT principal_type, user_id, learner_id, participant_role FROM message_participants WHERE thread_id = ?"
  ).all(threadId) as Array<{ principal_type: string; user_id: string | null; learner_id: string | null; participant_role: string }>;
  return rows.map((r) => {
    const principal: Principal = r.principal_type === "user"
      ? { type: "user", id: r.user_id as string }
      : { type: "learner", id: r.learner_id as string };
    return { principal, role: r.participant_role, label: labelFor(db, principal) };
  });
}

/** Threads the caller participates in. Note there is no role branch: a
 * platform-admin's inbox is computed by exactly this query. */
export function listThreads(db: DB, session: SessionInfo): ThreadSummary[] {
  const actor = sessionPrincipal(session);
  const rows = actor.type === "user"
    ? db.prepare(`SELECT t.id, t.subject, t.last_message_at, p.last_read_at
                    FROM message_threads t JOIN message_participants p ON p.thread_id = t.id
                   WHERE p.user_id = ? ORDER BY t.last_message_at DESC`).all(actor.id)
    : db.prepare(`SELECT t.id, t.subject, t.last_message_at, p.last_read_at
                    FROM message_threads t JOIN message_participants p ON p.thread_id = t.id
                   WHERE p.learner_id = ? ORDER BY t.last_message_at DESC`).all(actor.id);

  return (rows as Array<{ id: string; subject: string; last_message_at: string; last_read_at: string | null }>).map((r) => {
    const unread = db.prepare(
      "SELECT COUNT(*) AS n FROM messages WHERE thread_id = ? AND created_at > ?"
    ).get(r.id, r.last_read_at ?? "") as { n: number };
    return {
      id: r.id, subject: r.subject, lastMessageAt: r.last_message_at,
      participants: participantsOf(db, r.id), unread: unread.n,
    };
  });
}

/** `not-found`, never `forbidden`: a non-participant must not be able to
 * discover that a thread exists by the shape of the error. */
export function readThread(db: DB, session: SessionInfo, threadId: string): { subject: string; messages: MessageRow[] } | MessagingError {
  const actor = sessionPrincipal(session);
  if (!isParticipant(db, threadId, actor)) return { error: "not-found" };
  const thread = db.prepare("SELECT subject FROM message_threads WHERE id = ?").get(threadId) as { subject: string } | undefined;
  if (!thread) return { error: "not-found" };

  const rows = db.prepare(
    "SELECT id, author_type, author_user_id, author_learner_id, body, created_at FROM messages WHERE thread_id = ? ORDER BY created_at, id"
  ).all(threadId) as Array<{ id: string; author_type: string; author_user_id: string | null; author_learner_id: string | null; body: string; created_at: string }>;

  const at = nowIso();
  if (actor.type === "user")
    db.prepare("UPDATE message_participants SET last_read_at = ? WHERE thread_id = ? AND user_id = ?").run(at, threadId, actor.id);
  else
    db.prepare("UPDATE message_participants SET last_read_at = ? WHERE thread_id = ? AND learner_id = ?").run(at, threadId, actor.id);

  return {
    subject: thread.subject,
    messages: rows.map((r) => {
      const author: Principal = r.author_type === "user"
        ? { type: "user", id: r.author_user_id as string }
        : { type: "learner", id: r.author_learner_id as string };
      return { id: r.id, author, authorLabel: labelFor(db, author), body: r.body, createdAt: r.created_at };
    }),
  };
}

// ── Issue reports ───────────────────────────────────────────────────────────

/** The universal "report a problem" control's sink. Anonymous is allowed on
 * purpose: someone who cannot sign in is the person most in need of it. */
export function fileIssueReport(
  db: DB,
  session: SessionInfo | null,
  input: { route: string; description: string; viewport?: string; appVersion?: string }
): { reportId: string } | MessagingError {
  const description = input.description.trim();
  const route = input.route.trim();
  if (!description || description.length > MAX_BODY) return { error: "invalid" };
  if (!route || route.length > 512) return { error: "invalid" };

  const actor = session ? sessionPrincipal(session) : null;
  const id = newId("ir");
  db.prepare(`INSERT INTO issue_reports
    (id, reporter_user_id, reporter_learner_id, route, viewport, app_version, description, status, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'new', ?)`).run(
    id,
    actor?.type === "user" ? actor.id : null,
    actor?.type === "learner" ? actor.id : null,
    route, input.viewport ?? null, input.appVersion ?? null, description, nowIso()
  );
  return { reportId: id };
}

/** Triage queue — admins only, and this one IS a role check, because an issue
 * report is a support ticket about the product, not a private conversation. */
export function listIssueReports(db: DB, session: SessionInfo, status: "new" | "triaged" | "closed" = "new") {
  if (session.learnerId) return { error: "forbidden" } as MessagingError;
  if (session.user.role !== "platform-admin" && session.user.role !== "school-admin") return { error: "forbidden" } as MessagingError;
  return db.prepare(
    "SELECT id, route, viewport, app_version, description, created_at FROM issue_reports WHERE status = ? ORDER BY created_at DESC LIMIT 200"
  ).all(status) as Array<{ id: string; route: string; viewport: string | null; app_version: string | null; description: string; created_at: string }>;
}
