/**
 * TEACHER PLATFORM — classes, join codes, assignments, and honest reporting.
 *
 * Storage model: one persisted store per teacher account at
 * `numera:teach:v1:{accountId}` — real localStorage persistence, the same
 * local-first substrate the whole app runs on. On a shared classroom device
 * the join flow works end-to-end today (learners are roster profiles); across
 * devices, the store rides the existing account-scoped sync layer when its
 * transport lands — the data model is transport-ready now.
 *
 * Every function that touches a learner's record takes an Actor and calls
 * assertCan first. There is no unguarded read path in this module.
 *
 * Join codes are deterministic (hashSeed over class id + account), 6 chars
 * from an unambiguous alphabet — printable on a board, typo-resistant.
 */

import { hashSeed } from "@/lib/prng";
import { assertCan, type Actor, type OwnershipContext } from "@/lib/permissions";
import type { Profile } from "@/lib/progress";
import { isFading, PROFICIENT, retainedMastery, type SkillState } from "@/lib/mastery";
import { ladderCounts } from "@/lib/evidenceLadder";
import { reviewCompletion, type ManifestCourse } from "@/lib/family";
import { strategyNote } from "@/components/ParentReport";
import { storageGet, storageSet } from "@/lib/safeStorage";

export const TEACH_KEY_PREFIX = "numera:teach:v1:";

export type AssignmentKind = "lesson" | "course" | "domain" | "review" | "diagnostic" | "challenge";

export interface ClassRecord {
  id: string;
  name: string;
  createdAt: string;
  /** Durable identifiers minted by /api/class when a server is reachable.
   *
   *  The teach store is local-first on purpose: a classroom device works offline, and the UI never
   *  blocks on a network round-trip. When the server IS reachable, it owns the join code, because
   *  a locally derived code is only unique within this browser — two teachers on two devices could
   *  otherwise mint the same code. Present ⇒ this class is cross-device; absent ⇒ device-local. */
  serverId?: string;
  serverCode?: string;
}
export interface ClassLink {
  classId: string;
  childId: string;
  joinedAt: string;
}
export interface Assignment {
  id: string;
  classId: string;
  kind: AssignmentKind;
  /** lesson id, course id, domain key `${grade}:${category}`, or challenge/diagnostic ref. */
  refId: string;
  title: string;
  dueDate: string; // local date
  createdAt: string;
}
export interface TeachStore {
  classes: ClassRecord[];
  links: ClassLink[];
  assignments: Assignment[];
}

export function emptyTeachStore(): TeachStore {
  return { classes: [], links: [], assignments: [] };
}

export function readTeachStore(accountId: string): TeachStore {
  if (typeof window === "undefined") return emptyTeachStore();
  try {
    const raw = storageGet(TEACH_KEY_PREFIX + accountId);
    if (!raw) return emptyTeachStore();
    const p = JSON.parse(raw) as Partial<TeachStore>;
    return { classes: p.classes ?? [], links: p.links ?? [], assignments: p.assignments ?? [] };
  } catch {
    return emptyTeachStore();
  }
}

export function writeTeachStore(accountId: string, store: TeachStore): void {
  if (typeof window === "undefined") return;
  try {
    storageSet(TEACH_KEY_PREFIX + accountId, JSON.stringify(store));
  } catch {
    /* safeStorage retains the write in memory for this tab */
  }
}

/** Deterministic, board-printable join code for a class. Unambiguous alphabet
 * (no 0/O, 1/I/L). Stable across renders and devices — it derives from ids. */
export function joinCodeFor(accountId: string, classId: string): string {
  const ALPHA = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
  let n = hashSeed(`${accountId}:${classId}:join`) >>> 0;
  let out = "";
  for (let i = 0; i < 6; i++) {
    out += ALPHA[n % ALPHA.length];
    n = Math.floor(n / ALPHA.length) ^ (n << 5) >>> 0;
    n = n >>> 0;
  }
  return out;
}

/** Resolve a typed-in code against a teacher's classes (the learner-side join). */
export function classForCode(accountId: string, store: TeachStore, code: string): ClassRecord | null {
  const norm = code.trim().toUpperCase();
  return (
    store.classes.find(
      (c) => c.serverCode?.trim().toUpperCase() === norm || joinCodeFor(accountId, c.id) === norm
    ) ?? null
  );
}

export function ownershipFrom(accountId: string, store: TeachStore): Pick<OwnershipContext, "classOwner" | "classMembers"> {
  const classOwner: Record<string, string> = {};
  const classMembers: Record<string, string[]> = {};
  for (const c of store.classes) {
    classOwner[c.id] = accountId;
    classMembers[c.id] = store.links.filter((l) => l.classId === c.id).map((l) => l.childId);
  }
  return { classOwner, classMembers };
}

// ── Assignment progress ─────────────────────────────────────────────────────

export type AssignmentStatus = "on-time" | "late" | "incomplete";

/** Which lesson ids an assignment covers, expanded through the manifest. */
export function lessonsForAssignment(a: Assignment, courses: ManifestCourse[]): string[] {
  switch (a.kind) {
    case "lesson":
    case "challenge":
    case "diagnostic":
      return [a.refId];
    case "course":
      return courses.find((c) => c.id === a.refId)?.lessons.map((l) => l.id) ?? [];
    case "domain": {
      const [g, cat] = a.refId.split(":");
      return courses
        .filter((c) => String(c.gradeLevel) === g && c.category === cat)
        .flatMap((c) => c.lessons.map((l) => l.id));
    }
    case "review":
      return []; // judged by the review queue, not lesson completion
  }
}

/** One learner's status on one assignment, from the persisted record:
 * every covered lesson completed, with the LAST first-completion date deciding
 * on-time vs late. Review assignments are on-time when nothing is overdue. */
export function assignmentStatusFor(
  a: Assignment,
  profile: Profile,
  courses: ManifestCourse[],
  today: string
): AssignmentStatus {
  if (a.kind === "review") {
    const r = reviewCompletion(profile, today);
    if (r.onTrack) return today <= a.dueDate ? "on-time" : "on-time"; // clear queue = compliant
    return today > a.dueDate ? "late" : "incomplete";
  }
  const ids = lessonsForAssignment(a, courses);
  if (ids.length === 0) return "incomplete";
  const dates: string[] = [];
  for (const id of ids) {
    const lp = profile.lessons[id];
    if (!lp?.completed) return "incomplete";
    dates.push(lp.completedAt ?? today);
  }
  const finished = dates.sort()[dates.length - 1];
  return finished <= a.dueDate ? "on-time" : "late";
}

export function assignmentProgress(
  actor: Actor,
  a: Assignment,
  members: Array<{ childId: string; name: string; profile: Profile }>,
  courses: ManifestCourse[],
  ctx: OwnershipContext,
  today: string
): Array<{ childId: string; name: string; status: AssignmentStatus }> {
  assertCan(actor, "read-class", { classId: a.classId }, ctx);
  return members.map((m) => {
    assertCan(actor, "read-learner", { childId: m.childId }, ctx);
    return { childId: m.childId, name: m.name, status: assignmentStatusFor(a, m.profile, courses, today) };
  });
}

// ── Class analytics ─────────────────────────────────────────────────────────

export interface HeatCell {
  grade: number;
  category: string;
  /** 0 none · 1 exposed/practiced · 2 mastered · 3 retained+ */
  level: 0 | 1 | 2 | 3;
}

function domainOfTag(tag: string, tagGrade: Record<string, number>): number | undefined {
  return tagGrade[tag];
}

/** Learner × domain mastery heatmap. Level reflects the STRONGEST honest claim
 * the evidence supports in that domain (the ladder, compressed to a cell). */
export function masteryHeatmap(
  actor: Actor,
  classId: string,
  members: Array<{ childId: string; name: string; profile: Profile }>,
  tagGrade: Record<string, number>,
  ctx: OwnershipContext,
  today: string
): { domains: string[]; rows: Array<{ name: string; cells: HeatCell[] }> } {
  assertCan(actor, "read-class", { classId }, ctx);
  const domainSet = new Set<number>();
  for (const m of members)
    for (const s of Object.values(m.profile.mastery ?? {})) {
      const g = domainOfTag(s.tag, tagGrade);
      if (g !== undefined && s.attempts > 0) domainSet.add(g);
    }
  const grades = [...domainSet].sort((a, b) => a - b);
  const rows = members.map((m) => {
    assertCan(actor, "read-learner", { childId: m.childId }, ctx);
    const cells: HeatCell[] = grades.map((g) => {
      let level: HeatCell["level"] = 0;
      for (const s of Object.values(m.profile.mastery ?? {})) {
        if (domainOfTag(s.tag, tagGrade) !== g || s.attempts === 0) continue;
        const retained = s.mastery >= PROFICIENT && retainedMastery(s, today) >= PROFICIENT;
        const lvl: HeatCell["level"] = retained ? 3 : s.mastery >= PROFICIENT ? 2 : 1;
        if (lvl > level) level = lvl;
      }
      return { grade: g, category: "Math", level };
    });
    return { name: m.name, cells };
  });
  return { domains: grades.map((g) => `Grade ${g}`), rows };
}

/** The class's most common observed strategy signals, in teacher language. */
export function commonMisconceptions(
  actor: Actor,
  classId: string,
  members: Array<{ childId: string; profile: Profile }>,
  ctx: OwnershipContext
): Array<{ signal: string; learners: number; note: string }> {
  assertCan(actor, "read-class", { classId }, ctx);
  const bySignal = new Map<string, Set<string>>();
  for (const m of members) {
    assertCan(actor, "read-learner", { childId: m.childId }, ctx);
    for (const s of Object.values(m.profile.mastery ?? {})) {
      for (const [sig, n] of Object.entries(s.signals ?? {})) {
        if ((n ?? 0) > 0) {
          const set = bySignal.get(sig) ?? new Set();
          set.add(m.childId);
          bySignal.set(sig, set);
        }
      }
    }
  }
  return [...bySignal.entries()]
    .map(([signal, kids]) => ({
      signal,
      learners: kids.size,
      note: strategyNote({ [signal]: 1 } as SkillState["signals"]) ?? signal
    }))
    .sort((a, b) => b.learners - a.learners);
}

/** Learners sharing a currently-fragile skill — a ready-made small group. */
export function interventionGroups(
  actor: Actor,
  classId: string,
  members: Array<{ childId: string; name: string; profile: Profile }>,
  ctx: OwnershipContext,
  today: string
): Array<{ tag: string; names: string[] }> {
  assertCan(actor, "read-class", { classId }, ctx);
  const byTag = new Map<string, string[]>();
  for (const m of members) {
    assertCan(actor, "read-learner", { childId: m.childId }, ctx);
    for (const s of Object.values(m.profile.mastery ?? {})) {
      if (isFading(s, today)) byTag.set(s.tag, [...(byTag.get(s.tag) ?? []), m.name]);
    }
  }
  return [...byTag.entries()]
    .filter(([, names]) => names.length >= 2)
    .map(([tag, names]) => ({ tag, names: names.sort() }))
    .sort((a, b) => b.names.length - a.names.length);
}

/** Per-learner usage + review compliance + ladder shape, one row each. */
export function classSummary(
  actor: Actor,
  classId: string,
  members: Array<{ childId: string; name: string; profile: Profile }>,
  ctx: OwnershipContext,
  today: string
): Array<{
  name: string;
  avatarId?: string;
  activeDays14: number;
  lessonsDone: number;
  reviewOnTrack: boolean;
  ladder: ReturnType<typeof ladderCounts>;
}> {
  assertCan(actor, "read-class", { classId }, ctx);
  const t = Date.parse(today + "T00:00:00Z");
  const window = new Set(
    Array.from({ length: 14 }, (_, i) => new Date(t - i * 86400000).toISOString().slice(0, 10))
  );
  return members.map((m) => {
    assertCan(actor, "read-learner", { childId: m.childId }, ctx);
    const activeDays14 = Object.entries(m.profile.lessonsByDay ?? {}).filter(
      ([d, n]) => window.has(d) && (n ?? 0) > 0
    ).length;
    return {
      name: m.name,
      ...(m.profile.avatarId ? { avatarId: m.profile.avatarId } : {}),
      activeDays14,
      lessonsDone: Object.values(m.profile.lessons).filter((l) => l.completed).length,
      reviewOnTrack: reviewCompletion(m.profile, today).onTrack,
      ladder: ladderCounts(m.profile.mastery, today)
    };
  });
}

// ── Exports ─────────────────────────────────────────────────────────────────

const csvEscape = (v: string | number | boolean): string => {
  const s = String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function summaryCsv(rows: ReturnType<typeof classSummary>): string {
  const head = "name,active_days_14,lessons_done,review_on_track,transferable,retained,mastered,practicing,met";
  const body = rows.map((r) =>
    [
      r.name,
      r.activeDays14,
      r.lessonsDone,
      r.reviewOnTrack,
      r.ladder.transferable,
      r.ladder.retained,
      r.ladder.mastered,
      r.ladder.practiced,
      r.ladder.exposed
    ]
      .map(csvEscape)
      .join(",")
  );
  return [head, ...body].join("\n");
}

export function assignmentCsv(rows: Array<{ name: string; status: AssignmentStatus }>, a: Assignment): string {
  const head = `assignment,due,name,status`;
  const body = rows.map((r) => [a.title, a.dueDate, r.name, r.status].map(csvEscape).join(","));
  return [head, ...body].join("\n");
}
