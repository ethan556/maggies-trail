/**
 * Phase B — reveal rules (§8). Every rule is a pure predicate over (manifest, evidence),
 * deterministic by construction: no time-of-day, no randomness, no storage reads. `today`
 * is always an explicit YYYY-MM-DD argument so tests can sit exactly on each boundary.
 *
 * v1 policy constants are named and documented here rather than buried in conditionals,
 * because they ARE the pedagogy: change one and the world reveals differently.
 */
import { ASSISTED_CEILING } from "@/lib/mastery";
import type {
  InstrumentState, LandmarkState, MaintenanceState, WorldCourse, WorldEvidence,
  WorldInstrument, WorldLandmark, WorldSkill
} from "./worldTypes";

/** Days after the last (21-day) review interval before a completed, review-clear route
 * counts as enduring: the learner held it past the final scheduled rep. */
export const ENDURING_AFTER_DAYS = 22;
/** A completion within this window reads as "recently traveled". */
export const RECENT_DAYS = 3;
/** Calibration requires independent mastery: strictly above the assisted ceiling, so the
 * score is provably not reachable by hinted/revealed work alone (mastery.ts contract). */
export const CALIBRATED_MASTERY = ASSISTED_CEILING; // strict > comparison below
export const CALIBRATED_STREAK = 2;
export const ASSEMBLED_MASTERY = 0.5;

const dayNum = (iso: string): number => {
  const [y, m, d] = iso.split("-").map(Number);
  return Math.floor(Date.UTC(y, (m ?? 1) - 1, d ?? 1) / 86_400_000);
};
export const daysBetween = (a: string, b: string): number => dayNum(b) - dayNum(a);

/** §8: a trail segment becomes visible when its approach trails are satisfied. v1 policy —
 * a prerequisite is satisfied when EVERY one of its landmarks is either walked (≥1 waypoint
 * completed) or certified (chapter test-out). "Walked the whole approach, or proved it." */
export function prerequisiteSatisfied(
  prereq: WorldCourse,
  landmarksById: Map<string, WorldLandmark>,
  evidence: WorldEvidence
): boolean {
  return prereq.landmarkIds.every((lid) => {
    const lm = landmarksById.get(lid);
    if (!lm) return false; // dangling reference: never satisfied, verify:world reports it
    if (evidence.testouts[lm.chapterId]) return true;
    return lm.waypointIds.some((w) => evidence.lessons[w]?.completed);
  });
}

export function approachOpen(
  course: WorldCourse,
  coursesById: Map<string, WorldCourse>,
  landmarksById: Map<string, WorldLandmark>,
  evidence: WorldEvidence
): boolean {
  return course.prerequisiteCourseIds.every((id) => {
    const prereq = coursesById.get(id);
    return prereq ? prerequisiteSatisfied(prereq, landmarksById, evidence) : false;
  });
}

/** §8: a landmark activates when the learner starts it. Durable evidence only — the first
 * completed waypoint IS the start; mid-lesson resume snapshots are transient and excluded. */
export function landmarkState(landmark: WorldLandmark, evidence: WorldEvidence): LandmarkState {
  const done = landmark.waypointIds.filter((w) => evidence.lessons[w]?.completed).length;
  if (evidence.testouts[landmark.chapterId]) return "complete";
  if (done === 0) return "unvisited";
  return done === landmark.waypointIds.length ? "complete" : "active";
}

/** §16's route-maintenance states, derived from the existing 1/3/7/21 scheduler. Graduated
 * items are REMOVED by engine.onCorrect, so "enduring" is proven by absence: complete, no
 * items pending, and the newest completion at least ENDURING_AFTER_DAYS old. */
export function maintenanceState(
  courseWaypointIds: ReadonlySet<string>,
  complete: boolean,
  evidence: WorldEvidence,
  today: string
): MaintenanceState {
  const items = evidence.review.filter((r) => courseWaypointIds.has(r.lessonId));
  const overdue = items.some((r) => daysBetween(r.due, today) > 0);
  const dueToday = items.some((r) => r.due === today);
  if (overdue) return "route-fading";
  if (dueToday) return "needs-reinforcement";
  if (items.length > 0) return "route-restored"; // a miss happened; nothing due — recovering
  let newest: string | null = null;
  for (const w of courseWaypointIds) {
    const at = evidence.lessons[w]?.completedAt;
    if (evidence.lessons[w]?.completed && at && (!newest || at > newest)) newest = at;
  }
  if (newest && daysBetween(newest, today) <= RECENT_DAYS) return "recently-traveled";
  if (complete && newest && daysBetween(newest, today) >= ENDURING_AFTER_DAYS) return "enduring";
  return "holding";
}

/** §9's instrument ladder, total over any tag set. With no mapped tags (Phase B data) every
 * instrument is honestly "undiscovered" — no placeholder states. */
export function instrumentState(
  instrument: WorldInstrument,
  evidence: WorldEvidence,
  today: string
): InstrumentState {
  const skills: WorldSkill[] = instrument.conceptTags
    .map((t) => evidence.mastery[t])
    .filter((s): s is WorldSkill => Boolean(s));
  if (instrument.conceptTags.length === 0 || skills.every((s) => s.attempts === 0) || skills.length === 0) {
    return "undiscovered";
  }
  const every = (p: (s: WorldSkill) => boolean) =>
    instrument.conceptTags.length === skills.length && skills.every(p);
  if (!every((s) => s.mastery >= ASSEMBLED_MASTERY)) return "discovered";
  if (!every((s) => s.mastery > CALIBRATED_MASTERY && s.correctStreak >= CALIBRATED_STREAK)) return "assembled";
  // "carried" is deliberately unreachable in Phase B: it requires the cross-course usage
  // evidence Phase D defines. Emitting it now would be a state that LOOKS earned and is not.
  const enduring = every(
    (s) => s.lastSeen !== null && daysBetween(s.lastSeen, today) >= ENDURING_AFTER_DAYS && s.mastery > CALIBRATED_MASTERY
  );
  return enduring ? "enduring" : "calibrated";
}

/** §8: a connection appears on transfer evidence — every shared tag independently mastered. */
export function connectionRevealed(
  sharedConceptTags: string[],
  evidence: WorldEvidence
): boolean {
  if (sharedConceptTags.length === 0) return false;
  return sharedConceptTags.every((t) => {
    const s = evidence.mastery[t];
    return Boolean(s && s.mastery > CALIBRATED_MASTERY);
  });
}
