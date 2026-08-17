/**
 * S242 / ENG-01 — TWO WAYS AUTHORED FEEDBACK NEVER REACHES A LEARNER, AND NOTHING WATCHED EITHER.
 *
 * Both were found while measuring the R3 convergence channel, and neither is visible to any gate
 * that existed before this file.
 *
 * ── 1. Keys the schema silently drops ───────────────────────────────────────────────────────────
 * `z.object` STRIPS unknown keys by default. A lesson may therefore author `lowFeedback` on an
 * engine whose spec never declared it, `validate:content` passes, typecheck passes, and the string
 * is discarded at parse time — before the grader, before the renderer, before the learner.
 *
 * Measured at seal 6cfba1f: **152 of 10,260 authored widgets**, 17,279 characters of authored
 * feedback that nobody will ever read. `numberLineHop` alone carries 124 `lowFeedback` +
 * `highFeedback` pairs whose engine grades landings by name (`commonLandings`) and has no
 * directional branch at all.
 *
 * The count is pinned rather than driven to zero because the strings are authored work: deleting
 * them is a content decision for a person, and this gate's job is to stop the pile growing and to
 * TELL the next author which fields are inert. Lower it when prose is removed or wired up.
 *
 * ── 2. Feedback copy-pasted between problems ────────────────────────────────────────────────────
 * `"Each hop is 10. From 430, 3 hops land on 460."` was the true miss feedback for `g2b-02-05`
 * ("Hop by tens: three hops forward from 430") and had been pasted onto **36 other steps** —
 * "How many milliliters in 4 liters?", "72 ÷ 9", "Is 40 a multiple of 8?" — where it is the LIVE
 * string the grader shows and is false of every one of them. CLAUDE.md rule 5: feedback must be
 * literally true of the drawn problem.
 *
 * It survived because the correct-sounding prose sat in the inert `lowFeedback` field above, so
 * anyone reading the JSON saw a well-authored widget. Twenty-six of the repairs were made from
 * exactly that inert text; the other ten filled the boilerplate's own template with the widget's
 * own numbers.
 *
 * Both assertions below are cheap and neither existed before. `numberLineHop` is the engine tested
 * because its widget parameters DETERMINE its answer, so "a number in the feedback that the widget
 * never mentions" is decidable here in a way it is not for an engine whose answer is authored.
 */
import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { globSync } from "node:fs";
import { WidgetSpec } from "./schema";

/** Measured at seal 6cfba1f, 2026-08-16. Lower it when inert prose is removed or wired up; never raise it. */
const DROPPED_KEY_BASELINE = 148;

interface Lesson { steps?: Array<{ id?: string; widget?: Record<string, unknown> }> }

const lessons = globSync("content/courses/*/lessons/*.json").map((file) => ({
  id: file.split("/").pop()!.replace(".json", ""),
  data: JSON.parse(readFileSync(file, "utf8")) as Lesson,
}));

const widgets = lessons.flatMap(({ id, data }) =>
  (data.steps ?? []).flatMap((step) => (step.widget ? [{ lesson: id, step: String(step.id), raw: step.widget }] : []))
);

const ints = (s: unknown) =>
  new Set([...String(s).matchAll(/\d[\d,]*/g)].map((m) => Number(m[0].replace(/,/g, ""))));

describe("S242 — authored strings that never reach a learner", () => {
  it("has widgets to check", () => {
    // Guards every assertion below from passing vacuously on an empty glob.
    expect(widgets.length).toBeGreaterThan(9000);
  });

  it("does not grow the set of widgets carrying keys the schema drops", () => {
    const offenders: string[] = [];
    for (const { lesson, step, raw } of widgets) {
      const parsed = WidgetSpec.safeParse(raw);
      if (!parsed.success) continue; // validate:content owns malformed widgets
      const kept = new Set(Object.keys(parsed.data as object));
      const dropped = Object.keys(raw).filter((k) => !kept.has(k));
      if (dropped.length) offenders.push(`${lesson}#${step} (${raw.type}): ${dropped.join(", ")}`);
    }
    expect(
      offenders.length,
      `authored keys the schema strips before grading — these strings are invisible to learners:\n  ${offenders.slice(0, 6).join("\n  ")}`
    ).toBe(DROPPED_KEY_BASELINE);
  });

  it("never shows numberLineHop feedback written for a different problem", () => {
    const foreign: string[] = [];
    for (const { lesson, step, raw } of widgets) {
      if (raw.type !== "numberLineHop") continue;
      const miss = raw.missFeedback;
      if (typeof miss !== "string") continue;
      const start = Number(raw.start ?? 0), hop = Number(raw.hop ?? 1), hops = Number(raw.hops ?? 1);
      const landing = start + (raw.direction === "back" ? -1 : 1) * hop * hops;
      /* Everything the widget itself puts on screen or in another string. A miss feedback drawing
       * only on these is at worst unhelpful; one that is mostly numbers from somewhere else is
       * about a different problem. */
      const own = new Set<number>([
        ...ints(raw.prompt), start, hop, hops, landing, Math.abs(landing),
        Number(raw.min), Number(raw.max), ...ints(raw.successFeedback),
      ]);
      for (const c of (raw.commonLandings as Array<{ value: number; feedback: string }> | undefined) ?? []) {
        own.add(c.value); own.add(Math.abs(c.value));
        for (const n of ints(c.feedback)) own.add(n);
      }
      const said = [...ints(miss)];
      const alien = said.filter((n) => !own.has(n));
      // Two or more foreign numbers AND a majority of what the string says: one stray number can be
      // a legitimate aside ("a ten is 10 ones"); a string mostly about other numbers cannot.
      if (said.length && alien.length >= 2 && alien.length > said.length / 2)
        foreign.push(`${lesson}#${step}: says ${alien.join(", ")} — the widget never mentions them · "${miss.slice(0, 60)}"`);
    }
    expect(foreign, `miss feedback describing a different problem:\n  ${foreign.slice(0, 8).join("\n  ")}`).toEqual([]);
  });

  it("never reuses one numeric miss feedback across different hop parameters", () => {
    // The copy-paste itself, caught at its source rather than by its symptom: two hops with
    // different (start, hop, hops, direction) cannot honestly share a string that names numbers.
    const byString = new Map<string, Set<string>>();
    const where = new Map<string, string[]>();
    for (const { lesson, step, raw } of widgets) {
      if (raw.type !== "numberLineHop") continue;
      const miss = raw.missFeedback;
      if (typeof miss !== "string" || !/\d/.test(miss)) continue;
      const key = `${raw.start}|${raw.hop}|${raw.hops}|${raw.direction ?? "forward"}`;
      byString.set(miss, (byString.get(miss) ?? new Set()).add(key));
      where.set(miss, [...(where.get(miss) ?? []), `${lesson}#${step}`]);
    }
    const shared = [...byString].filter(([, keys]) => keys.size > 1);
    expect(
      shared.map(([s]) => `${where.get(s)!.slice(0, 3).join(", ")} … · "${s.slice(0, 50)}"`),
      "one numeric feedback string serving several different hop problems"
    ).toEqual([]);
  });
});
