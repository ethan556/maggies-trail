/**
 * INTERVENTION — turning evidence into the three questions an MTSS meeting asks.
 *
 *   Who needs help?  ·  Help with WHAT?  ·  Who can be helped TOGETHER?
 *
 * The design constraint that shapes everything here: a tier is a STAFFING
 * decision, not a judgement about a child, and it must be defensible out loud
 * in a meeting where a parent may be sitting. So every tier carries its
 * `reasons` — the specific, countable facts that produced it — and the UI is
 * expected to show them. There is no opaque risk score, no percentile against
 * other children, and no model: the inputs are the same mastery records the
 * learner's own dashboard shows them, read through published thresholds.
 *
 * Determinism is a hard requirement, not a nicety. The same evidence on any
 * day produces the same tier, the same order, and the same groups, because a
 * district that sees a child move between tiers on a page refresh will
 * (correctly) stop trusting the whole system. All ordering is total: ties
 * break on learnerId, never on Map/object insertion order.
 *
 * Thresholds live in ONE exported constant so a district can see them, a test
 * can pin them, and nobody has to grep for magic numbers.
 */

import { isFading, PROFICIENT, retainedMastery, type SkillState } from "@/lib/mastery";

/** Tier 1 = core instruction · Tier 2 = small-group · Tier 3 = intensive. */
export type Tier = 1 | 2 | 3;

/**
 * Published thresholds. Chosen to match the product's existing mastery
 * semantics rather than invented: PROFICIENT (0.7) is already the bar the
 * learner-facing ladder uses, so intervention and the child's own dashboard
 * cannot tell contradictory stories.
 */
export const TIER_RULES = {
  /** At or below this share of attempted skills proficient ⇒ Tier 3 candidate. */
  tier3ProficientShare: 0.4,
  /** At or below this share ⇒ Tier 2 candidate. */
  tier2ProficientShare: 0.65,
  /** This many currently-fading skills alone justifies Tier 2. */
  tier2FadingSkills: 3,
  /** This many fading skills alone justifies Tier 3. */
  tier3FadingSkills: 6,
  /** A skill with at least this many recorded misconception signals is "persistent". */
  persistentSignalCount: 3,
  /** Fewer active days than this in the trailing fortnight is an engagement flag. */
  lowEngagementActiveDays: 3,
  /** A learner needs at least this many attempted skills before shares mean anything. */
  minAttemptedSkills: 5,
  /** Minimum learners before a small group is worth scheduling. */
  minGroupSize: 2
} as const;

export interface LearnerEvidence {
  learnerId: string;
  name: string;
  /** Mastery states keyed however the caller likes; only the values are read. */
  mastery: Record<string, SkillState>;
  /** Distinct days with at least one completed lesson in the trailing 14 days. */
  activeDays14: number;
}

export interface TierReason {
  code:
    | "low-proficiency"
    | "fading-skills"
    | "persistent-misconception"
    | "low-engagement"
    | "insufficient-evidence"
    | "on-track";
  detail: string;
}

export interface LearnerTier {
  learnerId: string;
  name: string;
  tier: Tier;
  reasons: TierReason[];
  /** Counts the meeting will ask for, so the UI never recomputes them. */
  attempted: number;
  proficient: number;
  fading: number;
  activeDays14: number;
  /** Skills to work on, strongest need first. Empty when the learner is on track. */
  focusTags: string[];
}

const share = (n: number, d: number) => (d === 0 ? 1 : n / d);

/**
 * Tier one learner. Reasons accumulate; the tier is the strongest rule that
 * fired. "Insufficient evidence" is deliberately Tier 1 — a child who has
 * barely used the product has not demonstrated a need, and flagging them would
 * fill the dashboard with noise that costs real intervention time.
 */
export function tierFor(ev: LearnerEvidence, today: string): LearnerTier {
  const skills = Object.values(ev.mastery ?? {});
  const attemptedSkills = skills.filter((s) => s.attempts > 0);
  const attempted = attemptedSkills.length;
  const proficient = attemptedSkills.filter(
    (s) => s.mastery >= PROFICIENT && retainedMastery(s, today) >= PROFICIENT
  ).length;
  const fadingSkills = attemptedSkills.filter((s) => isFading(s, today));
  const fading = fadingSkills.length;

  const persistent = attemptedSkills.filter(
    (s) =>
      Object.values(s.signals ?? {}).reduce<number>((a, b) => a + (b ?? 0), 0) >= TIER_RULES.persistentSignalCount &&
      s.mastery < PROFICIENT
  );

  const reasons: TierReason[] = [];
  let tier: Tier = 1;
  const raise = (t: Tier) => {
    if (t > tier) tier = t;
  };

  if (attempted < TIER_RULES.minAttemptedSkills) {
    reasons.push({
      code: "insufficient-evidence",
      detail: `Only ${attempted} skill${attempted === 1 ? "" : "s"} attempted — not enough evidence to place a tier.`
    });
    if (ev.activeDays14 < TIER_RULES.lowEngagementActiveDays) {
      reasons.push({
        code: "low-engagement",
        detail: `Active on ${ev.activeDays14} of the last 14 days.`
      });
    }
    return {
      learnerId: ev.learnerId,
      name: ev.name,
      tier: 1,
      reasons,
      attempted,
      proficient,
      fading,
      activeDays14: ev.activeDays14,
      focusTags: []
    };
  }

  const proficientShare = share(proficient, attempted);
  if (proficientShare <= TIER_RULES.tier3ProficientShare) {
    raise(3);
    reasons.push({
      code: "low-proficiency",
      detail: `${proficient} of ${attempted} attempted skills are proficient and retained (${Math.round(proficientShare * 100)}%).`
    });
  } else if (proficientShare <= TIER_RULES.tier2ProficientShare) {
    raise(2);
    reasons.push({
      code: "low-proficiency",
      detail: `${proficient} of ${attempted} attempted skills are proficient and retained (${Math.round(proficientShare * 100)}%).`
    });
  }

  if (fading >= TIER_RULES.tier3FadingSkills) {
    raise(3);
    reasons.push({ code: "fading-skills", detail: `${fading} skills are fading and due for review.` });
  } else if (fading >= TIER_RULES.tier2FadingSkills) {
    raise(2);
    reasons.push({ code: "fading-skills", detail: `${fading} skills are fading and due for review.` });
  }

  if (persistent.length > 0) {
    raise(2);
    reasons.push({
      code: "persistent-misconception",
      detail: `${persistent.length} skill${persistent.length === 1 ? "" : "s"} show a repeated misconception signal.`
    });
  }

  if (ev.activeDays14 < TIER_RULES.lowEngagementActiveDays) {
    reasons.push({ code: "low-engagement", detail: `Active on ${ev.activeDays14} of the last 14 days.` });
  }

  if (reasons.length === 0) {
    reasons.push({ code: "on-track", detail: `${proficient} of ${attempted} attempted skills proficient and retained.` });
  }

  // Focus = fading first (retrieval is cheap and high-yield), then persistent
  // misconceptions, then simply-weak skills. Total order for determinism.
  const weight = (s: SkillState) =>
    (isFading(s, today) ? 0 : 1) * 100 +
    (persistent.includes(s) ? 0 : 1) * 10 +
    (s.mastery < PROFICIENT ? 0 : 1);
  const focusTags = attemptedSkills
    .filter((s) => isFading(s, today) || persistent.includes(s) || s.mastery < PROFICIENT)
    .sort((a, b) => weight(a) - weight(b) || a.mastery - b.mastery || a.tag.localeCompare(b.tag))
    .slice(0, 5)
    .map((s) => s.tag);

  return {
    learnerId: ev.learnerId,
    name: ev.name,
    tier,
    reasons,
    attempted,
    proficient,
    fading,
    activeDays14: ev.activeDays14,
    focusTags
  };
}

/** Highest tier first, then most fading, then name — a stable worklist. */
export function tierRoster(evidence: LearnerEvidence[], today: string): LearnerTier[] {
  return evidence
    .map((e) => tierFor(e, today))
    .sort(
      (a, b) =>
        b.tier - a.tier ||
        b.fading - a.fading ||
        a.proficient / Math.max(1, a.attempted) - b.proficient / Math.max(1, b.attempted) ||
        a.name.localeCompare(b.name) ||
        a.learnerId.localeCompare(b.learnerId)
    );
}

export interface InterventionGroup {
  tag: string;
  /** Learners who share this need, name-sorted. */
  members: Array<{ learnerId: string; name: string; tier: Tier }>;
  /** The highest tier present — how urgently the group needs scheduling. */
  urgency: Tier;
}

/**
 * Ready-made small groups: learners who share a focus skill. This is the
 * output a teacher can actually act on in a 20-minute block, which is why it
 * is grouped by SKILL rather than by child.
 */
export function groupsFor(tiers: LearnerTier[], minSize = TIER_RULES.minGroupSize): InterventionGroup[] {
  const byTag = new Map<string, InterventionGroup["members"]>();
  for (const t of tiers) {
    for (const tag of t.focusTags) {
      const list = byTag.get(tag) ?? [];
      list.push({ learnerId: t.learnerId, name: t.name, tier: t.tier });
      byTag.set(tag, list);
    }
  }
  return [...byTag.entries()]
    .filter(([, members]) => members.length >= minSize)
    .map(([tag, members]) => ({
      tag,
      members: [...members].sort((a, b) => a.name.localeCompare(b.name) || a.learnerId.localeCompare(b.learnerId)),
      urgency: members.reduce<Tier>((max, m) => (m.tier > max ? m.tier : max), 1)
    }))
    .sort((a, b) => b.urgency - a.urgency || b.members.length - a.members.length || a.tag.localeCompare(b.tag));
}

export interface TierCounts {
  tier1: number;
  tier2: number;
  tier3: number;
  total: number;
}

export function tierCounts(tiers: LearnerTier[]): TierCounts {
  const counts: TierCounts = { tier1: 0, tier2: 0, tier3: 0, total: tiers.length };
  for (const t of tiers) {
    if (t.tier === 3) counts.tier3 += 1;
    else if (t.tier === 2) counts.tier2 += 1;
    else counts.tier1 += 1;
  }
  return counts;
}
