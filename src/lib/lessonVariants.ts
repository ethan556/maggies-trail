/**
 * S242 / ADAPT-01 — THE LESSON PATH FINALLY CONSULTS THE LEARNER.
 *
 * THE GAP. `ADAPT01_STATE_GAPS.md` measured it: `playerStore.ts` imports `applyResult` and
 * `recordSignal` and calls both — it WRITES mastery and never READS it. `/learn` hands the authored
 * lesson straight to the player with no variant resolution and no band. **1,701 lessons, 11,957
 * widget instances, 8,459 graded steps served exactly as authored, to every learner, forever.**
 *
 * `recommendBand` — the whole difficulty ladder — had exactly ONE call site, on the practice screen.
 * Review hardcoded `"core"`; the Mastery Studio took the default; the lesson path, which is where
 * almost all learning happens, never reached it at all.
 *
 * This is the transform that closes it: authored steps in, refreshed steps out, seeded so that the
 * same learner walking the same lesson twice gets different numbers and the same learner RESUMING
 * one gets the same numbers.
 *
 * ── THE SEED IS THE WHOLE DESIGN, AND IT DELIBERATELY DOES NOT CONSULT THE ANTI-REPEAT QUEUE ──
 *
 * `drawFreshVariant` re-draws until the fingerprint is outside the learner's recent window. That is
 * exactly right on the practice and review screens, where each visit is one draw. It is WRONG here,
 * and the reason is resume: a lesson is a long walk that can be interrupted, and `restoreQueue`
 * rebuilds the queue from the authored lesson every time. If the widget shown depended on a window
 * that the first visit had just written into, the resumed lesson would re-draw AWAY from what the
 * learner was looking at when they closed the tab — a different question, mid-problem.
 *
 * So freshness here comes from a RUN INDEX instead: the number of times this lesson has already
 * been completed. It is constant for the whole of a run (completion happens at the end), which makes
 * resume exact, and it increments on replay, which makes the second walk a genuinely new set of
 * problems. Determinism is total — (lesson, step, runIndex, band) fixes the widget.
 *
 * The fingerprints ARE recorded into the shared window, so review and practice will not immediately
 * re-serve a problem the lesson just showed. Recording is one-way and idempotent; nothing here reads
 * the window back.
 *
 * ── WHAT IS NOT CHANGED ──
 *
 * `variantForStep` refuses a variant whose widget type differs from the authored step's, so a
 * refreshed step is the same ENGINE with different numbers. Step ids, kinds, ordering, hints,
 * remedial mappings and `conceptTag` are all untouched, which is what keeps `restoreQueue`,
 * the remedial injector and the prediction ledger valid.
 */
import { drawFreshVariant, rememberDraw, type RecentDraws } from "./antiRepeat";
import { recommendBand } from "./difficulty";
import { localDateStr } from "./engine";
import type { Profile } from "./progress";
import type { TLesson, TStep } from "./schema";

export interface RefreshedLesson {
  steps: TStep[];
  /** The window with this run's draws folded in — the caller persists it. */
  served: RecentDraws;
  /** How many steps were actually regenerated. Zero is normal for a lesson with no generators. */
  refreshed: number;
  /** Band chosen per refreshed step, for the session ledger and for tests. */
  bands: Record<string, string>;
}

/**
 * How many times this lesson has been walked to completion. The freshness axis.
 *
 * `lessons[id].completed` is a boolean, not a count — the schema has never carried a replay
 * counter and adding one would be a sync-merge change for a cosmetic gain. `counters` already
 * exists for exactly this kind of tally and is merged by MAX, which is the right rule here: a
 * replay count can only go up, and two devices disagreeing should take the larger walk.
 */
export function lessonRunIndex(profile: Profile, lessonId: string): number {
  const counted = profile.counters?.[`walk:${lessonId}`];
  if (typeof counted === "number" && Number.isFinite(counted)) return Math.max(0, Math.floor(counted));
  // A profile from before this counter existed, on a lesson it has already finished, is on its
  // second walk — otherwise the replay would serve the numbers it just saw.
  return profile.lessons?.[lessonId]?.completed ? 1 : 0;
}

/**
 * Refresh a lesson's steps against this learner's state.
 *
 * Pure: same (lesson, profile, today) always gives the same steps. `today` is a parameter rather
 * than a `new Date()` because the forgetting model in `recommendBand` reads it, and a function that
 * silently depends on the clock cannot be tested or resumed.
 */
export function refreshLessonSteps(lesson: TLesson, profile: Profile, today: string = localDateStr(new Date())): RefreshedLesson {
  const runIndex = lessonRunIndex(profile, lesson.id);

  /* ── THE FIRST WALK IS ALWAYS THE AUTHORED ONE, AND THIS IS THE MOST IMPORTANT LINE HERE ──
   *
   * The first cut refreshed every walk, and the scripted player walk failed immediately. Reading
   * why is what produced this rule. `mult-01-01` is the shape:
   *
   *   c1 (concept)  "Maya packs 3 bags for a picnic. She puts 4 apples in every bag."
   *   k1 (check)    "Which picture matches 3 × 4?"      ← declares a generator
   *   c2 (concept)  "We write 3 × 4 = 12 … It means 4 + 4 + 4."
   *
   * Refreshing k1 turns that into a story about 3 bags of 4 apples, a question about 2 × 5, and an
   * explanation of 3 × 4 = 12. The authored item is the one the surrounding PROSE is built around —
   * the worked example leads to it, the hints reference it, the concept step after it explains it.
   * Regenerating it desynchronises the lesson from itself, which is CLAUDE.md rule 5 ("feedback must
   * be literally true of the drawn problem") applied at the scale of a whole lesson.
   *
   * So a lesson teaches with its authored numbers and RE-ASKS with fresh ones. That is what the
   * variant architecture was always for: ADAPT-01's complaint is that 1,701 lessons are served
   * identically to every learner FOREVER, and the repair to "forever" is the replay, not the first
   * read. Review and practice — where there is no surrounding prose to contradict — refresh from
   * the first encounter, and always have.
   *
   * The gate found this, not a review: the scripted walk in LessonPlayer.play.test.tsx encoded real
   * knowledge about how this content is written, and it was right. */
  const mastery = profile.mastery ?? {};
  let served: RecentDraws = profile.recentVariants ?? {};
  const bands: Record<string, string> = {};
  let refreshed = 0;

  /* ── THE ONE EXCEPTION TO THE FIRST-WALK RULE: A REPEAT OF AN ITEM ALREADY ASKED ──────────────
   *
   * `MCQ01_DISTRACTOR_REUSE.md` measured 75 lessons that ask the SAME QUESTION TWICE — identical
   * prompt, identical options, usually `k1` and again at `k3`. A learner answers it, then meets it
   * again in the same sitting, and two independent "correct" attempts are recorded against one
   * remembered item. That is the mastery-as-memory failure this whole program exists to remove,
   * reintroduced by copy-paste, and pinning the first walk to the authored numbers is exactly what
   * leaves it in place — the first walk is the walk where the duplicate is met twice.
   *
   * The rule above stands, and this does not weaken it. Its reason is that the lesson's PROSE is
   * written around the authored numbers — but prose can only be anchored to ONE occurrence, and it
   * is the first. The second copy is not what any sentence in the lesson refers to; it is a
   * duplicate. So the first occurrence keeps its authored numbers and every later occurrence is
   * refreshed, on every walk including the first.
   *
   * This closes 8 of the 75 today, and each of the remaining 67 the moment a generator serves its
   * conceptTag. The other 67 are listed in that document and need authoring, not this. */
  const seenItem = new Set<string>();
  const isRepeat = new Map<string, boolean>();
  for (const step of lesson.steps) {
    const widget = step.widget as { type?: string; prompt?: string; options?: Array<{ label?: string }> } | undefined;
    if (!widget?.prompt) continue;
    const identity = `${widget.type} ${widget.prompt.trim()} ${(widget.options ?? []).map((o) => String(o.label ?? "").trim()).sort().join("")}`;
    isRepeat.set(String(step.id), seenItem.has(identity));
    seenItem.add(identity);
  }

  const firstWalk = runIndex === 0;
  if (firstWalk && ![...isRepeat.values()].some(Boolean)) {
    return { steps: [...lesson.steps], served, refreshed: 0, bands: {} };
  }

  const steps = lesson.steps.map((step) => {
    if (!step.widget) return step;
    // On the first walk ONLY the repeats move; everything else stays exactly as authored.
    if (firstWalk && !isRepeat.get(String(step.id))) return step;
    /* THE BAND IS PER STEP, NOT PER LESSON. A lesson crosses several conceptTags and a learner is
     * rarely equally fragile across all of them; picking one band for the whole lesson would serve
     * a stretch surface on the tag they are weakest at. `recommendBand` is pure and re-derivable
     * from the profile, so a run stays reproducible. */
    const band = recommendBand(mastery[step.conceptTag ?? ""], today);
    const key = `${lesson.id}:${step.id}`;
    const drawn = drawFreshVariant(step, `${key}:${runIndex}${isRepeat.get(String(step.id)) ? ":repeat" : ""}`, band, {}, key);
    if (!drawn) return step;
    bands[String(step.id)] = band;
    served = rememberDraw(served, key, drawn.fingerprint);
    refreshed++;
    return { ...step, widget: drawn.variant.widget } as TStep;
  });

  return { steps, served, refreshed, bands };
}
