// THE NOTEBOOK (the benchmark's #1 reported gap, closed the Maggie's Trail way).
//
// Learning in small daily bites means forgetting earlier material — and the
// most-requested missing feature on the comparison product is a revisitable
// record of what was covered. This module derives that record instead of
// asking anyone to author or maintain it:
//
//   - CARDS come from the recap takeaways every lesson already carries
//     (generated into /notebook-index.json by gen-manifest — single source of
//     truth, can never drift from the content).
//   - EVIDENCE comes from the live mastery model: each card shows RETAINED
//     mastery (mastery.ts's forgetting-adjusted estimate), so a card's
//     strength visibly fades with time away — the decay itself is the cue to
//     review, without any streak-guilt mechanic.
//
// Pure functions only: profile in, cards out. No fetch, no clock, no DOM —
// the client component owns those.

import { isFading, retainedMastery, type SkillState } from "@/lib/mastery";
import type { Profile } from "@/lib/progress";

/** Shape of /notebook-index.json (emitted by scripts/gen-manifest.mjs). */
export interface NotebookIndex {
  contentVersion: string;
  courses: Array<{
    title: string;
    lessons: Array<{ id: string; title: string; takeaways: string[]; tags: string[] }>;
  }>;
}

export interface NotebookCard {
  id: string;
  title: string;
  takeaways: string[];
  /** Mean RETAINED mastery over the lesson's evidenced tags, or null when the
   * learner completed the lesson but no tag has graded evidence yet. */
  retained: number | null;
  /** True when at least one of the lesson's skills was proficient when last
   * seen and has measurably decayed since — the "fading, worth a review" cue. */
  fading: boolean;
}

export interface NotebookSection {
  courseTitle: string;
  cards: NotebookCard[];
}

/** A skill that was HAD (proficient at last practice) and has decayed back
 * below the proficiency line — the shared rule now lives in mastery.ts beside
 * the retention model, so every surface consuming "fading" stays in agreement
 * and the review interval is monotone in evidence strength. */

export function buildNotebook(index: NotebookIndex, profile: Profile, today: string): NotebookSection[] {
  const mastery = profile.mastery ?? {};
  const out: NotebookSection[] = [];
  for (const course of index.courses) {
    const cards: NotebookCard[] = [];
    for (const l of course.lessons) {
      if (!profile.lessons[l.id]?.completed) continue;
      const evidenced = l.tags.map((t) => mastery[t]).filter((s): s is SkillState => !!s && s.attempts > 0);
      const retained =
        evidenced.length === 0
          ? null
          : evidenced.reduce((a, s) => a + retainedMastery(s, today), 0) / evidenced.length;
      cards.push({
        id: l.id,
        title: l.title,
        takeaways: l.takeaways,
        retained,
        fading: evidenced.some((s) => isFading(s, today))
      });
    }
    if (cards.length > 0) out.push({ courseTitle: course.title, cards });
  }
  return out;
}
