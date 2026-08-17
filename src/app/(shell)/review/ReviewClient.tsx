"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import QuizShell, { type QuizSummary, type Servable } from "@/components/QuizShell";
import { AppIcon } from "@/components/ui";
import { dueItems, localDateStr, onReviewResult, xpFor } from "@/lib/engine";
import { awardNewBadges, type BadgeDef } from "@/lib/achievements";
import { applyXp, bump, progressStore } from "@/lib/progress";
import { applyResult } from "@/lib/mastery";
import { applyFactResult, dueFacts, factDrillFor, factReviewKey, weakestFacts } from "@/lib/factFluency";
import { drawFreshVariant, rememberDraw } from "@/lib/antiRepeat";
import type { TWidget } from "@/lib/schema";

type LoadState =
  | { at: "loading" }
  | { at: "error"; upcoming: number }
  | { at: "empty"; upcoming: number; nextDue: string | null }
  | { at: "quiz"; servables: Servable[]; freshCount?: number; factCount?: number }
  | { at: "done"; summary: QuizSummary; badges: BadgeDef[] };

/** Earliest future due date in the queue, e.g. "Wednesday, July 15" — or null. */
function nextDueLabel(review: { due: string }[], today: string): string | null {
  const future = review.map((r) => r.due).filter((d) => d > today);
  if (future.length === 0) return null;
  const min = future.reduce((a, b) => (a < b ? a : b));
  const [y, m, d] = min.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "long",
    month: "long",
    day: "numeric"
  });
}

/** Facts are a supplement to the conceptual queue, never a replacement: a learner with a large
 * fluency backlog must still meet the lesson checks they missed. */
const FACT_CARDS_PER_SITTING = 5;

/** Deterministic seed for a fact drill, mirroring how lesson variants are seeded
 * (`${key}:${box}:${today}`): the same family on the same day at the same box always shows the
 * same face, so a refresh mid-sitting cannot reroll the question. */
function seedFor(family: string, box: number, today: string): number {
  let h = 0;
  for (const ch of `${family}:${box}:${today}`) h = (h * 31 + ch.charCodeAt(0)) | 0;
  return Math.abs(h);
}

export default function ReviewClient() {
  const [state, setState] = useState<LoadState>({ at: "loading" });
  const [reload, setReload] = useState(0);

  useEffect(() => {
    const p = progressStore.load();
    const today = localDateStr(new Date());
    const due = dueItems(p.review, today);

    // S187: the fact-grain half of the queue. `review` holds per-lessonId:stepId cards; a fluency
    // learner's actual weak spots live per FACT FAMILY (factItems), which no surface consumed
    // until now. Both feed one sitting: lesson cards first (they carry a lesson's full context),
    // then the specific facts the leech box says are shakiest. Capped so a fluency backlog can
    // never crowd out the conceptual review the queue was built for.
    const factItems = p.factItems ?? {};
    const dueFamilies = dueFacts(factItems, today);
    const factFamilies = weakestFacts(
      factItems,
      // only families the learner has actually met — review must never introduce a NEW fact
      dueFamilies.length > 0 ? dueFamilies : [],
      FACT_CARDS_PER_SITTING,
      today
    );
    const factServables: Servable[] = factFamilies.map((family) => {
      const st = factItems[family];
      const drill = factDrillFor(family, seedFor(family, st?.box ?? 0, today));
      return {
        key: factReviewKey(family),
        widget: drill.widget as TWidget,
        hints: drill.hints,
        explanationVariants: drill.explanationVariants,
        context: "Fact recall"
      };
    });

    if (due.length === 0 && factServables.length === 0) {
      setState({ at: "empty", upcoming: p.review.length, nextDue: nextDueLabel(p.review, today) });
      return;
    }
    if (due.length === 0) {
      // Facts only — no lesson cards to fetch, so serve them directly.
      setState({ at: "quiz", servables: factServables, freshCount: 0, factCount: factServables.length });
      return;
    }
    // oldest-due first, capped at a sitting of 10
    const batch = [...due].sort((a, b) => (a.due < b.due ? -1 : 1)).slice(0, 10);
    const controller = new AbortController();
    fetch("/api/review-steps", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keys: batch.map((i) => i.key) }),
      signal: controller.signal
    })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Review failed (${r.status})`);
        const data = (await r.json()) as { items?: Array<Servable & { widget: TWidget }> };
        if (!Array.isArray(data.items)) throw new Error("Review response was malformed");
        return { items: data.items };
      })
      .then((data) => {
        if (data.items.length === 0) {
          setState({ at: "empty", upcoming: p.review.length, nextDue: nextDueLabel(p.review, today) });
          return;
        }
        // Reviewing the SAME item tests whether you remember the item. Reviewing a FRESH VARIANT of
        // the same concept tests whether you understand the idea — which is what the review queue is
        // actually for. Where a generator exists, the numbers are regenerated; the misconception
        // traps come with them. Seeded on (key, box, date), so the sitting is still reproducible.
        /* S242 / GEN-04. The anti-repeat window. Review is the surface where a repeat does the most
         * damage to the measurement: the whole argument for regenerating a review item is that
         * recalling THIS question is not evidence of understanding the idea, and serving the same
         * generated question again reintroduces exactly the problem the regeneration was for.
         * The seed already varies by (key, box, date), but a box that comes due twice on the same
         * date — or a pool small enough to collide — could still repeat. */
        let served = p.recentVariants ?? {};
        const items = data.items.map((it) => {
          const ri = batch.find((b) => b.key === it.key);
          // S242. `ri` is still required — the seed needs its key and box — but the
          // `hasVariants(ri.conceptTag)` half was a pre-filter that outranked the resolver and
          // dropped every step whose declaration resolves while its tag does not. `it` now carries
          // `variant` from the API, so variantForStep can take its documented declaration branch.
          if (!ri) return it;
          const drawn = drawFreshVariant(
            { ...it, conceptTag: ri.conceptTag },
            `${ri.key}:${ri.box}:${today}`,
            "core",
            served,
            ri.key
          );
          if (!drawn) return it;
          served = rememberDraw(served, ri.key, drawn.fingerprint);
          return { ...it, widget: drawn.variant.widget, fresh: true };
        });
        progressStore.save({ ...progressStore.load(), recentVariants: served });
        setState({
          at: "quiz",
          servables: [...items, ...factServables],
          freshCount: items.filter((i) => (i as { fresh?: boolean }).fresh).length,
          factCount: factServables.length
        });
      })
      .catch(() => {
        if (!controller.signal.aborted) setState({ at: "error", upcoming: p.review.length });
      });
    return () => controller.abort();
  }, [reload]);

  function record(key: string, r: { firstTry: boolean; hintsUsed: number; revealed: boolean }) {
    const p = progressStore.load();
    const today = localDateStr(new Date());

    // S187: fact drills are keyed `fact:<family>` and belong to the leech box, not the
    // lessonId:stepId queue. Same strictness as the lesson player: fluency means unaided recall,
    // so only an unassisted first-try success advances the family's box.
    if (key.startsWith("fact:")) {
      const family = key.slice("fact:".length);
      p.factItems = applyFactResult(p.factItems ?? {}, family, r.firstTry && !r.revealed && r.hintsUsed === 0, today);
      applyXp(p, xpFor("check", r.firstTry ? 0 : 1, r.hintsUsed, r.revealed), today);
      progressStore.save(p);
      return;
    }

    const item = p.review.find((i) => i.key === key);
    if (r.firstTry && item && item.box >= 3) bump(p, "graduated");
    p.review = onReviewResult(p.review, key, r.firstTry, today);
    applyXp(p, xpFor("check", r.firstTry ? 0 : 1, r.hintsUsed, r.revealed), today);
    // The review queue is the RETENTION loop — and it was not feeding the mastery model at all. A
    // learner could review a skill ten times and their mastery number would never move, so the
    // parent report's "slipping" list could never recover. Reviewing IS evidence, and the strongest
    // kind: it is recall after a delay.
    if (item) {
      p.mastery = applyResult(p.mastery ?? {}, item.conceptTag, r, today);
    }
    progressStore.save(p);
  }

  if (state.at === "loading")
    return (
      <div aria-busy="true">
        <p className="sr-only">Checking what's due…</p>
        <div aria-hidden className="h-40 animate-pulse rounded-card bg-ink/6 dark:bg-paper/8" />
      </div>
    );

  if (state.at === "error")
    return (
      <div role="alert" className="rounded-card border border-amber-300 bg-amber-50 p-5 dark:border-amber-700 dark:bg-amber-950/30">
        <h2 className="text-lg font-extrabold">Review couldn’t load</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
          {state.upcoming} saved review {state.upcoming === 1 ? "item is" : "items are"} still safe on this device.
        </p>
        <button
          type="button"
          onClick={() => { setState({ at: "loading" }); setReload((n) => n + 1); }}
          className="pressable mt-4 min-h-11 rounded-pill bg-cta px-5 py-2.5 font-extrabold text-white hover:bg-sky/90"
        >
          Try again
        </button>
      </div>
    );

  if (state.at === "empty")
    return (
      <div className="rounded-card border border-ink/10 bg-surface p-5 shadow-e1 dark:border-paper/12">
        <h2 className="text-lg font-extrabold">Nothing due today 🎉</h2>
        <p className="mt-2 text-sm text-ink/70 dark:text-paper/70">
          {state.upcoming > 0
            ? `${state.upcoming} ${state.upcoming === 1 ? "item is" : "items are"} scheduled for later${state.nextDue ? ` — the next lands ${state.nextDue}` : ""}. Checks you miss come back on a 1 / 3 / 7 / 21-day trail until you beat them four times.`
            : "Checks you miss in lessons land here, then come back on a 1 / 3 / 7 / 21-day trail until you beat them four times."}
        </p>
        <Link
          href="/dashboard"
          className="pressable mt-4 inline-block rounded-pill bg-cta px-5 py-3 font-extrabold text-white shadow-e1 transition-colors hover:bg-primary-hover hover:shadow-e2"
        >
          Back to the trail
        </Link>
      </div>
    );

  if (state.at === "quiz")
    return (
      <div className="grid gap-3">
        {(state.freshCount ?? 0) > 0 && (
          <p className="rounded-card border border-sky/30 bg-sky/5 px-3 py-2 text-sm text-ink dark:text-paper">
            <strong>{state.freshCount} of these have fresh numbers.</strong> Coming back to the same
            question would only test whether you remember the question. These test whether you have
            the idea.
          </p>
        )}
        {(state.factCount ?? 0) > 0 && (
          <p className="rounded-card border border-tangerine/40 bg-tangerine/5 px-3 py-2 text-sm text-ink dark:text-paper">
            <strong>{state.factCount} {state.factCount === 1 ? "fact is" : "facts are"} due for recall.</strong>{" "}
            These are the specific number facts you have been slowest on — tracked per fact, across
            every lesson that used them, not per question.
          </p>
        )}
        <QuizShell
        items={state.servables}
        onResult={record}
        onFinished={(summary) => {
          const p = progressStore.load();
          bump(p, "reviewSittings");
          const badges = awardNewBadges(p);
          progressStore.save(p);
          setState({ at: "done", summary, badges });
        }}
        />
      </div>
    );

  return (
    <div className="summit-in rounded-card border border-leaf/50 bg-leaf/5 p-5 shadow-e1">
      <h2 className="text-lg font-extrabold">Review walked!</h2>
      {state.badges.map((b) => (
        <p key={b.id} className="status-pop mt-2 rounded-card border border-tangerine/60 bg-tangerine/10 px-3 py-2 text-sm font-extrabold">
          <AppIcon name={b.icon} size={18} className="mr-1 inline-block align-text-bottom" />
          Badge earned: {b.name} — <span className="font-normal">{b.desc}</span>
        </p>
      ))}
      <p className="mt-2 text-sm">
        {state.summary.firstTry} of {state.summary.total} on the first try. First-try wins move an
        item down the trail (1 → 3 → 7 → 21 days); misses send it back to the start.
      </p>
      <Link
        href="/dashboard"
        className="pressable mt-4 inline-block rounded-pill bg-cta px-5 py-3 font-extrabold text-white shadow-e1 transition-colors hover:bg-primary-hover hover:shadow-e2"
      >
        Back to the trail
      </Link>
    </div>
  );
}
