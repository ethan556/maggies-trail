/**
 * THE EVIDENCE LADDER — what a family actually wants to know.
 *
 * "Progress" must never collapse to time spent or lessons completed. A skill
 * climbs five distinct rungs, each a stronger claim than the last, and each
 * backed by a different KIND of evidence:
 *
 *   EXPOSED       the learner has met the idea and tried it — evidence exists.
 *   PRACTICED     repeated work has moved the estimate meaningfully.
 *   MASTERED      unaided success carried the skill across the proficiency
 *                 line (hint-assisted work alone cannot — see ASSISTED_CEILING).
 *   RETAINED      it is STILL above the line today, after the forgetting model
 *                 has had its say — knowledge that survived time.
 *   TRANSFERABLE  unaided success in two or more different lessons — it works
 *                 outside the room it was learned in.
 *
 * Everything here is a pure function of (SkillState, today): deterministic,
 * auditable, and identical on every surface that reports it.
 */

import { PROFICIENT, retainedMastery, type SkillState } from "@/lib/mastery";

export type EvidenceRung = "exposed" | "practiced" | "mastered" | "retained" | "transferable";

export const RUNGS: readonly EvidenceRung[] = ["exposed", "practiced", "mastered", "retained", "transferable"];

/** Parent-facing copy — one plain sentence per rung, no jargon. */
export const RUNG_COPY: Record<EvidenceRung, { label: string; plain: string }> = {
  exposed: { label: "Met it", plain: "Has seen this idea and given it a try." },
  practiced: { label: "Practicing", plain: "Working on it — the attempts are adding up." },
  mastered: { label: "Got it", plain: "Solved it without help, more than once." },
  retained: { label: "Still has it", plain: "Checked again after time passed — it stuck." },
  transferable: { label: "Uses it anywhere", plain: "Solved it without help in different settings." }
};

/** The highest rung a skill's evidence currently supports. Rungs are
 * cumulative: transferable implies retained implies mastered, and so on. */
export function rungOf(skill: SkillState, today: string): EvidenceRung {
  const mastered = skill.mastery >= PROFICIENT;
  const retained = mastered && retainedMastery(skill, today) >= PROFICIENT;
  const transferable = retained && (skill.contexts?.length ?? 0) >= 2;
  if (transferable) return "transferable";
  if (retained) return "retained";
  if (mastered) return "mastered";
  if (skill.attempts >= 2 && skill.mastery >= 0.4) return "practiced";
  return "exposed";
}

/** Count of skills on each rung — the shape of a learner's knowledge, not a
 * single number. Skills with zero attempts are invisible (no evidence yet). */
export function ladderCounts(
  mastery: Record<string, SkillState> | undefined,
  today: string
): Record<EvidenceRung, number> {
  const out: Record<EvidenceRung, number> = { exposed: 0, practiced: 0, mastered: 0, retained: 0, transferable: 0 };
  for (const s of Object.values(mastery ?? {})) {
    if (s.attempts === 0) continue;
    out[rungOf(s, today)]++;
  }
  return out;
}
