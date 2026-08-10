/**
 * SCHOOL LAYER — cross-class aggregation and the integration contracts.
 *
 * What is REAL here today: the data model, the permission-gated aggregation
 * functions (they run over the same persisted teacher stores and learner
 * profiles the rest of the app uses), and one working RosterProvider backed
 * by local storage. What is a CONTRACT for later: SSO and external rostering
 * (Google Classroom, Clever) — typed interfaces a server implementation will
 * satisfy, documented in SCHOOL_ARCHITECTURE.md. No fake OAuth, no mock
 * dashboards: an unimplemented provider is absent, not simulated.
 *
 * Privacy stance, enforced by permissions.ts: a school admin sees class-level
 * AGGREGATES (band distributions, coverage, trends) — never an individual
 * learner's record through this layer.
 */

import { assertCan, type Actor, type OwnershipContext } from "@/lib/permissions";
import type { Profile } from "@/lib/progress";
import { ladderCounts, type EvidenceRung } from "@/lib/evidenceLadder";
import { PROFICIENT, retainedMastery } from "@/lib/mastery";

export interface School {
  id: string;
  name: string;
  /** Teacher accountIds registered to this school. */
  teacherAccountIds: string[];
}

export interface ClassRoster {
  classId: string;
  teacherAccountId: string;
  members: Array<{ childId: string; profile: Profile }>;
}

/** Grade-level ladder distribution across every class in the school —
 * "how much of what our learners met is mastered, retained, transferable". */
export function schoolLadderDistribution(
  actor: Actor,
  school: School,
  rosters: ClassRoster[],
  ctx: OwnershipContext,
  today: string
): Record<EvidenceRung, number> {
  assertCan(actor, "read-school", { schoolId: school.id }, ctx);
  const total: Record<EvidenceRung, number> = { exposed: 0, practiced: 0, mastered: 0, retained: 0, transferable: 0 };
  for (const r of rosters) {
    assertCan(actor, "read-class", { classId: r.classId }, ctx);
    for (const m of r.members) {
      const c = ladderCounts(m.profile.mastery, today);
      for (const k of Object.keys(total) as EvidenceRung[]) total[k] += c[k];
    }
  }
  return total;
}

/** Standards-style coverage. HONESTY NOTE: the app's curriculum is indexed by
 * conceptTags, and tagGrades (generated from disk) anchors each tag to a
 * grade. Until an external standards crosswalk exists, tags ARE the coverage
 * unit — reported as such, never dressed up as official standard codes. */
export function coverageByGrade(
  actor: Actor,
  school: School,
  rosters: ClassRoster[],
  tagGrade: Record<string, number>,
  ctx: OwnershipContext,
  today: string
): Array<{ grade: number; tagsMet: number; tagsSolid: number; tagsTotal: number }> {
  assertCan(actor, "read-school", { schoolId: school.id }, ctx);
  const totalByGrade = new Map<number, number>();
  for (const g of Object.values(tagGrade)) totalByGrade.set(g, (totalByGrade.get(g) ?? 0) + 1);
  const met = new Map<number, Set<string>>();
  const solid = new Map<number, Set<string>>();
  for (const r of rosters) {
    assertCan(actor, "read-class", { classId: r.classId }, ctx);
    for (const m of r.members) {
      for (const s of Object.values(m.profile.mastery ?? {})) {
        const g = tagGrade[s.tag];
        if (g === undefined || s.attempts === 0) continue;
        (met.get(g) ?? met.set(g, new Set()).get(g)!).add(s.tag);
        if (s.mastery >= PROFICIENT && retainedMastery(s, today) >= PROFICIENT)
          (solid.get(g) ?? solid.set(g, new Set()).get(g)!).add(s.tag);
      }
    }
  }
  return [...totalByGrade.entries()]
    .map(([grade, tagsTotal]) => ({
      grade,
      tagsTotal,
      tagsMet: met.get(grade)?.size ?? 0,
      tagsSolid: solid.get(grade)?.size ?? 0
    }))
    .filter((r) => r.tagsMet > 0)
    .sort((a, b) => a.grade - b.grade);
}

/** District rollup = the same aggregate over several schools' distributions.
 * Additive by construction, so a district is a sum — no new data path. */
export function districtRollup(
  perSchool: Array<Record<EvidenceRung, number>>
): Record<EvidenceRung, number> {
  const total: Record<EvidenceRung, number> = { exposed: 0, practiced: 0, mastered: 0, retained: 0, transferable: 0 };
  for (const s of perSchool) for (const k of Object.keys(total) as EvidenceRung[]) total[k] += s[k];
  return total;
}

// ── Integration contracts ───────────────────────────────────────────────────

/** Identity federation (SSO). A server implementation exchanges the
 * provider's assertion for a Session; nothing in this repo pretends to. */
export interface IdentityProvider {
  readonly kind: "google" | "clever" | "saml";
  beginSignIn(returnTo: string): Promise<{ redirectUrl: string }>;
}

/** External rostering (Clever / Google Classroom): pull classes + members
 * into the same ClassRoster shape every aggregate above consumes. */
export interface RosterProvider {
  readonly kind: "local" | "clever" | "google-classroom";
  /** Providers are constructed bound to one authenticated teacher. */
  listClasses(): Promise<Array<{ classId: string; name: string }>>;
  listMembers(classId: string): Promise<Array<{ childId: string; name: string }>>;
}

/** Assignment push-back (Google Classroom coursework, etc.). */
export interface ClassroomSync {
  publishAssignment(classId: string, title: string, dueDate: string, url: string): Promise<{ externalId: string }>;
}

/** The one REAL provider: local storage, the app's actual substrate. */
import { readTeachStore } from "@/lib/teacher";
import { getRoster } from "@/lib/roster";

export class LocalRosterProvider implements RosterProvider {
  readonly kind = "local" as const;
  /** Bound to one teacher account — membership lives in THAT teacher's
   * persisted store; display names resolve from the device roster. */
  constructor(private readonly teacherAccountId: string) {}
  async listClasses() {
    return readTeachStore(this.teacherAccountId).classes.map((c) => ({ classId: c.id, name: c.name }));
  }
  async listMembers(classId: string) {
    const links = readTeachStore(this.teacherAccountId).links.filter((l) => l.classId === classId);
    const nameOf = new Map(getRoster().children.map((c) => [c.id, c.name]));
    return links.map((l) => ({ childId: l.childId, name: nameOf.get(l.childId) ?? "Learner" }));
  }
}
