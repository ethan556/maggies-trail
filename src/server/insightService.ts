/**
 * INSIGHT SERVICE — tiers, intervention cases, and district reports.
 *
 * The division of labor: src/lib/institution/intervention.ts and
 * reporting.ts are PURE — published thresholds in, deterministic tiers and
 * suppressed aggregates out. This module feeds them from the PROJECTIONS
 * (skill_evidence, lesson_completions) and persists the one thing that must
 * outlive a recomputation: the intervention CASE, a human's decision with an
 * author and a note trail.
 *
 * Evidence honesty, stated once here and again in INSTITUTIONS.md:
 *  · SkillState is rebuilt from skill_evidence; `correctStreak` is not
 *    projected, so it is synthesized as 0 — nothing in tiering reads it.
 *  · activeDays14 counts distinct FIRST-completion days in the trailing
 *    fortnight (lesson_completions stores first completions only), so a
 *    learner replaying old lessons shows quiet. Undercounting engagement can
 *    only make us MORE attentive, never less; the caveat is documented.
 *  · Reports go through buildReport's small-cohort suppression (with
 *    complementary suppression) — a district CSV never isolates a child.
 */

import { randomBytes } from "node:crypto";
import type { DB } from "@/server/db";
import { audit, type SessionInfo } from "@/server/authService";
import { canAdminOrg, orgSubtree } from "@/server/institutionService";
import { canManageClassroom } from "@/server/assignmentService";
import type { SkillState } from "@/lib/mastery";
import {
  groupsFor,
  tierCounts,
  tierRoster,
  type InterventionGroup,
  type LearnerEvidence,
  type LearnerTier,
  type TierCounts
} from "@/lib/institution/intervention";
import {
  buildReport,
  reportCsv,
  type Dimension,
  type Report,
  type ReportLearner
} from "@/lib/institution/reporting";
import type { ProcessSignal } from "@/lib/processEvents";

const nowIso = () => new Date().toISOString();
const newId = (p: string) => `${p}_${randomBytes(9).toString("base64url")}`;
const today = () => nowIso().slice(0, 10);

// ── Evidence assembly (projections → pure inputs) ───────────────────────────

function skillStatesOf(db: DB, learnerId: string): Record<string, SkillState> {
  const rows = db
    .prepare("SELECT tag, mastery, attempts, last_seen, signals FROM skill_evidence WHERE learner_id = ?")
    .all(learnerId) as Array<{ tag: string; mastery: number; attempts: number; last_seen: string | null; signals: string }>;
  const out: Record<string, SkillState> = {};
  for (const r of rows) {
    let signals: Partial<Record<ProcessSignal, number>> | undefined;
    try {
      const parsed = JSON.parse(r.signals) as Record<string, number>;
      signals = Object.keys(parsed).length > 0 ? (parsed as Partial<Record<ProcessSignal, number>>) : undefined;
    } catch {
      signals = undefined;
    }
    out[r.tag] = { tag: r.tag, mastery: r.mastery, attempts: r.attempts, correctStreak: 0, lastSeen: r.last_seen, signals };
  }
  return out;
}

function activeDays14Of(db: DB, learnerId: string, todayIso: string): number {
  const cutoff = new Date(new Date(todayIso + "T00:00:00Z").getTime() - 14 * 86400_000).toISOString().slice(0, 10);
  const row = db
    .prepare(
      "SELECT COUNT(DISTINCT substr(completed_at, 1, 10)) AS n FROM lesson_completions WHERE learner_id = ? AND completed_at IS NOT NULL AND substr(completed_at, 1, 10) > ? AND substr(completed_at, 1, 10) <= ?"
    )
    .get(learnerId, cutoff, todayIso) as { n: number };
  return row.n;
}

function evidenceForLearners(db: DB, learners: Array<{ id: string; name: string }>, todayIso: string): LearnerEvidence[] {
  return learners.map((l) => ({
    learnerId: l.id,
    name: l.name,
    mastery: skillStatesOf(db, l.id),
    activeDays14: activeDays14Of(db, l.id, todayIso)
  }));
}

function activeStudentsOf(db: DB, classroomId: string): Array<{ id: string; name: string }> {
  return db
    .prepare(
      `SELECT l.id, l.name FROM enrollments e JOIN learners l ON l.id = e.learner_id
       WHERE e.classroom_id = ? AND e.role = 'student' AND e.status = 'active' ORDER BY l.name, l.id`
    )
    .all(classroomId) as Array<{ id: string; name: string }>;
}

// ── Class tier dashboard ────────────────────────────────────────────────────

export interface ClassInsights {
  tiers: LearnerTier[];
  groups: InterventionGroup[];
  counts: TierCounts;
  generatedFor: string;
}

export function classInsights(db: DB, session: SessionInfo, classroomId: string): ClassInsights | { error: "forbidden" } {
  if (!canManageClassroom(db, session, classroomId)) return { error: "forbidden" };
  const d = today();
  const tiers = tierRoster(evidenceForLearners(db, activeStudentsOf(db, classroomId), d), d);
  return { tiers, groups: groupsFor(tiers), counts: tierCounts(tiers), generatedFor: d };
}

// ── Intervention cases ──────────────────────────────────────────────────────

export interface InterventionRow {
  id: string;
  learnerId: string;
  learnerName: string;
  classroomId: string | null;
  reason: string;
  conceptTags: string[];
  tier: 1 | 2 | 3;
  status: "open" | "monitoring" | "resolved";
  openedAt: string;
  updatedAt: string;
  notes: Array<{ at: string; author: string; text: string }>;
}

/** Case access rides the class predicate: whoever can manage the classroom
 * the case is anchored to may work it. */
function canTouchIntervention(db: DB, session: SessionInfo, interventionId: string): { classroomId: string | null } | null {
  const row = db.prepare("SELECT classroom_id FROM interventions WHERE id = ?").get(interventionId) as
    | { classroom_id: string | null }
    | undefined;
  if (!row) return null;
  if (row.classroom_id && canManageClassroom(db, session, row.classroom_id)) return { classroomId: row.classroom_id };
  return null;
}

export function openIntervention(
  db: DB,
  session: SessionInfo,
  input: { learnerId: string; classroomId: string; reason: string; conceptTags: string[]; tier: 1 | 2 | 3 }
): { interventionId: string } | { error: "forbidden" | "not-enrolled" } {
  if (!canManageClassroom(db, session, input.classroomId)) return { error: "forbidden" };
  const enrolled = db
    .prepare(
      "SELECT 1 FROM enrollments WHERE classroom_id = ? AND learner_id = ? AND role = 'student' AND status = 'active'"
    )
    .get(input.classroomId, input.learnerId);
  if (!enrolled) return { error: "not-enrolled" };
  const id = newId("iv");
  const at = nowIso();
  db.prepare(
    `INSERT INTO interventions (id, learner_id, classroom_id, opened_by, reason, concept_tags, tier, status, opened_at, updated_at)
     VALUES (?,?,?,?,?,?,?,'open',?,?)`
  ).run(id, input.learnerId, input.classroomId, session.user.id, input.reason.trim(), JSON.stringify(input.conceptTags.slice(0, 8)), input.tier, at, at);
  audit(db, session.user.id, "intervention-opened", id);
  return { interventionId: id };
}

export function addInterventionNote(
  db: DB,
  session: SessionInfo,
  interventionId: string,
  text: string
): { ok: true } | { error: "forbidden" } {
  if (!canTouchIntervention(db, session, interventionId)) return { error: "forbidden" };
  const at = nowIso();
  db.prepare("INSERT INTO intervention_notes (intervention_id, at, author_user_id, text) VALUES (?,?,?,?)").run(
    interventionId,
    at,
    session.user.id,
    text.trim()
  );
  db.prepare("UPDATE interventions SET updated_at = ? WHERE id = ?").run(at, interventionId);
  return { ok: true };
}

export function setInterventionStatus(
  db: DB,
  session: SessionInfo,
  interventionId: string,
  status: "open" | "monitoring" | "resolved"
): { ok: true } | { error: "forbidden" } {
  if (!canTouchIntervention(db, session, interventionId)) return { error: "forbidden" };
  const at = nowIso();
  db.prepare(
    "UPDATE interventions SET status = ?, updated_at = ?, resolved_at = CASE WHEN ? = 'resolved' THEN ? ELSE NULL END WHERE id = ?"
  ).run(status, at, status, at, interventionId);
  audit(db, session.user.id, "intervention-status", `${interventionId}:${status}`);
  return { ok: true };
}

export function listInterventions(
  db: DB,
  session: SessionInfo,
  classroomId: string
): InterventionRow[] | { error: "forbidden" } {
  if (!canManageClassroom(db, session, classroomId)) return { error: "forbidden" };
  const rows = db
    .prepare(
      `SELECT i.id, i.learner_id AS learnerId, l.name AS learnerName, i.classroom_id AS classroomId,
              i.reason, i.concept_tags, i.tier, i.status, i.opened_at AS openedAt, i.updated_at AS updatedAt
       FROM interventions i JOIN learners l ON l.id = i.learner_id
       WHERE i.classroom_id = ?
       ORDER BY CASE i.status WHEN 'open' THEN 0 WHEN 'monitoring' THEN 1 ELSE 2 END, i.updated_at DESC, i.id`
    )
    .all(classroomId) as Array<{
    id: string;
    learnerId: string;
    learnerName: string;
    classroomId: string | null;
    reason: string;
    concept_tags: string;
    tier: 1 | 2 | 3;
    status: "open" | "monitoring" | "resolved";
    openedAt: string;
    updatedAt: string;
  }>;
  const noteStmt = db.prepare(
    `SELECT n.at, u.email AS author, n.text FROM intervention_notes n JOIN users u ON u.id = n.author_user_id
     WHERE n.intervention_id = ? ORDER BY n.at, n.id`
  );
  return rows.map((r) => {
    let conceptTags: string[] = [];
    try {
      const parsed = JSON.parse(r.concept_tags) as unknown;
      if (Array.isArray(parsed)) conceptTags = parsed.filter((t): t is string => typeof t === "string");
    } catch {
      conceptTags = [];
    }
    return {
      id: r.id,
      learnerId: r.learnerId,
      learnerName: r.learnerName,
      classroomId: r.classroomId,
      reason: r.reason,
      conceptTags,
      tier: r.tier,
      status: r.status,
      openedAt: r.openedAt,
      updatedAt: r.updatedAt,
      notes: noteStmt.all(r.id) as Array<{ at: string; author: string; text: string }>
    };
  });
}

// ── District / school reporting ─────────────────────────────────────────────

/** Every ACTIVE student enrollment in the org's subtree becomes one
 * ReportLearner row (a learner in two classes appears once per class — the
 * class dimension needs that; school/grade dimensions de-duplicate). */
function reportRows(db: DB, orgId: string, todayIso: string, dimension: Dimension): ReportLearner[] {
  const subtree = orgSubtree(db, orgId);
  if (subtree.length === 0) return [];
  const placeholders = subtree.map(() => "?").join(",");
  const rows = db
    .prepare(
      `SELECT l.id AS learnerId, l.name, l.grade, c.id AS classId, c.name AS className,
              o.id AS schoolId, o.name AS schoolName
       FROM enrollments e
       JOIN learners l ON l.id = e.learner_id
       JOIN classrooms c ON c.id = e.classroom_id
       JOIN orgs o ON o.id = c.org_id
       WHERE c.org_id IN (${placeholders}) AND e.role = 'student' AND e.status = 'active'
       ORDER BY l.id, c.id`
    )
    .all(...subtree) as Array<{
    learnerId: string;
    name: string;
    grade: number | null;
    classId: string;
    className: string;
    schoolId: string;
    schoolName: string;
  }>;
  // De-duplicate per learner for non-class dimensions (first class wins as context).
  const chosen = dimension === "class" ? rows : [...new Map(rows.map((r) => [r.learnerId, r])).values()];
  const completionsStmt = db.prepare(
    "SELECT COUNT(*) AS n FROM lesson_completions WHERE learner_id = ? AND completed_at IS NOT NULL"
  );
  return chosen.map((r) => ({
    learnerId: r.learnerId,
    schoolId: r.schoolId,
    schoolName: r.schoolName,
    classId: r.classId,
    className: r.className,
    grade: r.grade,
    mastery: skillStatesOf(db, r.learnerId),
    lessonsCompleted: (completionsStmt.get(r.learnerId) as { n: number }).n,
    activeDays14: activeDays14Of(db, r.learnerId, todayIso)
  }));
}

export function orgReport(
  db: DB,
  session: SessionInfo,
  orgId: string,
  dimension: Dimension,
  minCohort = 10
): Report | { error: "forbidden" } {
  if (!canAdminOrg(db, session, orgId)) return { error: "forbidden" };
  const d = today();
  const report = buildReport(reportRows(db, orgId, d, dimension), dimension, d, minCohort);
  audit(db, session.user.id, "org-report", `${orgId}:${dimension}`);
  return report;
}

export function orgReportCsv(
  db: DB,
  session: SessionInfo,
  orgId: string,
  dimension: Dimension,
  minCohort = 10
): string | { error: "forbidden" } {
  const report = orgReport(db, session, orgId, dimension, minCohort);
  if ("error" in report) return report;
  return reportCsv(report);
}
