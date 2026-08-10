"use client";

// THE PARENT REPORT.
//
// /family already showed six aggregate numbers: xp, streak, skills, proficient, avg%, due. Those
// answer "how much has she done". They cannot answer the only question a parent actually has:
//
//     What is she struggling with, and what should we do tonight?
//
// Three things were missing, and all three are computable from data that already existed:
//
//   1. NAMES. A conceptTag is an opaque id (`dr-power-rule`). The catalog's `skillFirstLesson` map
//      already knows which lesson first teaches every tag, so a skill can be named in English — with
//      the label DERIVED from the real lesson title, never invented, so it cannot drift from what the
//      child was actually taught.
//   2. FORGETTING. mastery.ts has modelled time-decay all along (`retainedMastery`), and nothing has
//      ever shown it. The gap between what she scored and what she has RETAINED is the single most
//      actionable number a parent can see: "she knew this, and it is slipping."
//   3. AN ACTION. Not a percentage — a lesson, by name, that is worth ten minutes tonight.

import Link from "next/link";
import { PROFICIENT, daysBetween, retainedMastery, type SkillState } from "@/lib/mastery";

export interface SkillLabel {
  label: string;
  lessonId: string;
  courseTitle: string;
}

export interface ParentReportProps {
  mastery: Record<string, SkillState>;
  skills: Record<string, SkillLabel>;
  dueCount: number;
  today: string;
  childName: string;
}

interface Row {
  tag: string;
  label: string;
  lessonId: string;
  courseTitle: string;
  scored: number;
  retained: number;
  slip: number;
  days: number;
  attempts: number;
  /** Parent-readable strategy note from the process-evidence ledger, or null. */
  note: string | null;
}

/** The dominant process signal, phrased for a parent: tentative, specific,
 * never a diagnosis of the child. Ties break on a fixed priority (fixation is
 * the most actionable observation, invalid-moves the least). Null when the
 * ledger is empty — most rows should carry no note at all. */
export function strategyNote(signals: SkillState["signals"]): string | null {
  if (!signals) return null;
  const order: Array<[keyof NonNullable<SkillState["signals"]>, string]> = [
    ["one-control-fixation", "tended to work one control while the answer needed the other — worth watching over her shoulder once"],
    ["wrong-direction", "often started by adjusting away from the goal before finding her bearings"],
    ["oscillating", "tended to overshoot and swing back rather than closing in with small steps"],
    ["invalid-moves", "kept bumping into the model's rules — the constraint itself may not have clicked yet"]
  ];
  let best: string | null = null;
  let bestCount = 0;
  for (const [sig, text] of order) {
    const c = signals[sig] ?? 0;
    if (c > bestCount) {
      best = text;
      bestCount = c;
    }
  }
  return best;
}

function rows(props: ParentReportProps): Row[] {
  const out: Row[] = [];
  for (const [tag, st] of Object.entries(props.mastery)) {
    const info = props.skills[tag];
    if (!info || st.attempts === 0) continue;
    const retained = retainedMastery(st, props.today);
    out.push({
      tag,
      label: info.label,
      lessonId: info.lessonId,
      courseTitle: info.courseTitle,
      scored: st.mastery,
      retained,
      slip: st.mastery - retained,
      days: st.lastSeen ? daysBetween(st.lastSeen, props.today) : 0,
      attempts: st.attempts,
      note: strategyNote(st.signals),
    });
  }
  return out;
}

/** Skills she HAD (proficient when last seen) and is measurably losing. This is the list that
 * justifies a review session, and nothing in the app has ever shown it. */
export function slipping(props: ParentReportProps): Row[] {
  return rows(props)
    .filter((r) => r.scored >= PROFICIENT && r.slip >= 0.05)
    .sort((a, b) => b.slip - a.slip)
    .slice(0, 4);
}

/** The genuinely shaky skills — judged on RETAINED mastery, not on the score she once got.
 *
 * Deliberately EXCLUDES anything already listed as slipping. A skill she once scored 0.85 on and has
 * not touched for four months decays below a skill she has never grasped — so it would otherwise
 * appear in both lists, with two different prescriptions. It needs a REVIEW, not a re-teach, and
 * telling a parent both at once is worse than telling them neither. */
export function shakiest(props: ParentReportProps): Row[] {
  const slipped = new Set(slipping(props).map((r) => r.tag));
  return rows(props)
    .filter((r) => r.attempts >= 2 && r.retained < PROFICIENT && !slipped.has(r.tag))
    .sort((a, b) => a.retained - b.retained)
    .slice(0, 4);
}

export function strongest(props: ParentReportProps): Row[] {
  return rows(props)
    .filter((r) => r.retained >= PROFICIENT)
    .sort((a, b) => b.retained - a.retained)
    .slice(0, 3);
}

/** One concrete action. A lesson, by name — never a percentage.
 *
 * The order encodes a judgement: a due review beats everything (the spacing is the point); a skill
 * she is LOSING beats one she never had (recovering it is cheaper than building it); and only then
 * is a re-teach the best use of ten minutes. */
export function tonight(
  props: ParentReportProps
): { kind: "review" | "refresh" | "reteach" | "onward"; row?: Row } {
  if (props.dueCount > 0) return { kind: "review" };
  const slip = slipping(props);
  if (slip.length > 0) return { kind: "refresh", row: slip[0] };
  const shaky = shakiest(props);
  if (shaky.length > 0) return { kind: "reteach", row: shaky[0] };
  return { kind: "onward" };
}

const pct = (v: number) => `${Math.round(v * 100)}%`;

function SkillRow({ r, showSlip }: { r: Row; showSlip?: boolean }) {
  return (
    <li className="flex items-center justify-between gap-3 border-b border-ink/10 py-2 last:border-0">
      <div className="min-w-0">
        <Link href={`/learn/${r.lessonId}`} className="block truncate font-bold text-ink hover:underline dark:text-paper">
          {r.label}
        </Link>
        <p className="truncate text-xs text-ink/70 dark:text-paper/70">{r.courseTitle}</p>
        {r.note && (
          <p className="mt-0.5 text-xs italic text-ink/70 dark:text-paper/70" data-testid="strategy-note">
            While working, she {r.note}.
          </p>
        )}
      </div>
      <div className="shrink-0 text-right tabular-nums">
        <p className="text-sm font-extrabold">{pct(r.retained)}</p>
        {showSlip && r.slip >= 0.05 && (
          <p className="text-xs font-bold text-berry-ink">
            was {pct(r.scored)} · {r.days}d ago
          </p>
        )}
      </div>
    </li>
  );
}

export default function ParentReport(props: ParentReportProps) {
  const slip = slipping(props);
  const shaky = shakiest(props);
  const strong = strongest(props);
  const act = tonight(props);
  const touched = rows(props).length;

  if (touched === 0) {
    return (
      <div className="rounded-card border border-ink/10 bg-surface p-4 shadow-e1 dark:border-paper/12">
        <p className="text-sm text-ink/70 dark:text-paper/70">
          Once {props.childName} has answered a few checks, this is where you will see which ideas are
          solid, which are slipping, and what is worth ten minutes tonight.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="rounded-2xl border-2 border-sky/30 bg-sky/5 p-4">
        <h3 className="text-sm font-extrabold uppercase tracking-wide text-sky-ink">Tonight, ten minutes</h3>
        {act.kind === "review" && (
          <p className="mt-1 text-ink dark:text-paper">
            <strong>{props.dueCount} review{props.dueCount === 1 ? "" : "s"} are due.</strong> These are ideas
            she has met before and is due to see again — the spacing is what makes them stick.{" "}
            <Link href="/review" className="font-bold underline">
              Open the review queue
            </Link>
            .
          </p>
        )}
        {act.kind === "refresh" && act.row && (
          <p className="mt-1 text-ink dark:text-paper">
            Nothing is formally due, but{" "}
            <Link href={`/learn/${act.row.lessonId}`} className="font-bold underline">
              {act.row.label}
            </Link>{" "}
            is slipping — she scored {pct(act.row.scored)} and is retaining about {pct(act.row.retained)}{" "}
            after {act.row.days} days away. Recovering something she once had is far cheaper than
            building it from scratch.
          </p>
        )}
        {act.kind === "reteach" && act.row && (
          <p className="mt-1 text-ink dark:text-paper">
            Nothing is due for review, so the best use of ten minutes is the shakiest idea:{" "}
            <Link href={`/learn/${act.row.lessonId}`} className="font-bold underline">
              {act.row.label}
            </Link>{" "}
            — currently retaining {pct(act.row.retained)} after {act.row.attempts} attempts.
          </p>
        )}
        {act.kind === "onward" && (
          <p className="mt-1 text-ink dark:text-paper">
            Nothing is due and nothing is shaky. This is the moment to move forward rather than drill —{" "}
            <Link href="/dashboard" className="font-bold underline">
              pick up the trail
            </Link>
            .
          </p>
        )}
      </div>

      {slip.length > 0 && (
        <section>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-berry-ink">Knew it — and slipping</h3>
          <p className="mb-1 text-xs text-ink/70 dark:text-paper/70">
            She scored well on these and has not seen them for a while. Forgetting is normal; catching it
            early is the whole point of the review queue.
          </p>
          <ul>{slip.map((r) => <SkillRow key={r.tag} r={r} showSlip />)}</ul>
        </section>
      )}

      {shaky.length > 0 && (
        <section>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-tangerine-ink">Not landed yet</h3>
          <p className="mb-1 text-xs text-ink/70 dark:text-paper/70">
            Judged on what she has <em>retained</em>, not on a score she once got. Tap any of these to
            reopen the lesson that teaches it.
          </p>
          <ul>{shaky.map((r) => <SkillRow key={r.tag} r={r} />)}</ul>
        </section>
      )}

      {strong.length > 0 && (
        <section>
          <h3 className="text-sm font-extrabold uppercase tracking-wide text-leaf-ink">Solid</h3>
          <ul>{strong.map((r) => <SkillRow key={r.tag} r={r} />)}</ul>
        </section>
      )}

      <p className="text-xs text-ink/70 dark:text-paper/70">
        Percentages are <strong>retained</strong> mastery — what the model expects she can still do today,
        after allowing for time since she last practised. That is why a number can fall without her
        getting anything wrong.
      </p>
    </div>
  );
}
