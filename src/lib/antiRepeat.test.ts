/**
 * S242 / GEN-04 — THE ANTI-REPEAT WINDOW, AND THE NUMBER §10 REQUIRES TO BE ZERO.
 *
 * §10 asks for "duplicate rate 0 inside the anti-repeat window". Until this module there was no
 * anti-repeat window, so the criterion had nothing to be measured against — it was neither passing
 * nor failing, which is the worst of the three.
 *
 * The tests below are in two halves, and the second is the one that would catch a regression that
 * matters. The first half proves the queue works. The second proves it stays HONEST when it cannot:
 * 242 of 2,045 (generator, form) pairs have a pool at or below the window, the smallest holding
 * four distinct problems, and no queue can invent a fifth. A mechanism that silently served a
 * repeat there would convert a content finding into an invisible one.
 */
import { describe, expect, it } from "vitest";
import {
  drawFreshVariant,
  fingerprintWidget,
  mergeRecentDraws,
  rememberDraw,
  MAX_DRAW_ATTEMPTS,
  MAX_TRACKED_STEPS,
  REPEAT_WINDOW,
  type RecentDraws
} from "./antiRepeat";
import { VARIANT_GENERATORS, variantForGenForm } from "./variants";

/* THE WIDGET TYPE IS DISCOVERED, NOT ASSUMED. `variantForStep` refuses a variant whose widget type
 * does not match the step's declared surface — by design — so probing every pair with a hardcoded
 * "numeric" step silently skipped every manipulative generator and quietly narrowed this file to a
 * third of the registry. `variantForGenForm` has no surface guard, so it answers the question the
 * probe was actually asking. */
const widgetTypeOf = (tag: string, form: string): string | null => {
  try { return variantForGenForm(tag, form, "probe", "core")?.widget.type ?? null; } catch { return null; }
};

/** A step that declares a generator, which is the branch `variantForStep` documents as outranking tags. */
function stepFor(tag: string, form: string, widgetType: string) {
  return { widget: { type: widgetType }, variant: { gen: tag, form } };
}

/** Draw n times in a row through the queue, threading the window exactly as a caller must. */
function drawSeries(step: ReturnType<typeof stepFor>, seed: string, n: number, key = "k") {
  let recent: RecentDraws = {};
  const out: Array<{ fingerprint: string; attempts: number; exhausted: boolean }> = [];
  for (let i = 0; i < n; i++) {
    const drawn = drawFreshVariant(step, `${seed}:${i}`, "core", recent, key);
    if (!drawn) break;
    recent = rememberDraw(recent, key, drawn.fingerprint);
    out.push({ fingerprint: drawn.fingerprint, attempts: drawn.attempts, exhausted: drawn.exhausted });
  }
  return out;
}

/* Pairs are chosen by EXERCISING them here rather than by reading a CSV, so this test cannot pass
 * against a stale audit. Ten draws per pair over a bounded sample keeps it fast; the exhaustive
 * sweep across all 2,045 pairs is `scripts/audit/anti-repeat-window.mts`. */
const SAMPLE = VARIANT_GENERATORS.slice(0, 60).flatMap((generator) => {
  const forms: readonly string[] = (generator as { forms?: readonly string[] }).forms ?? ["default"];
  return forms.slice(0, 2).map((form) => ({ tag: generator.tag, form }));
});

describe("GEN-04 — the queue prevents the repeat it is for", () => {
  it("serves no widget twice inside the window, wherever the pool allows it", () => {
    let checkedPairs = 0;
    let exhaustedPairs = 0;
    for (const { tag, form } of SAMPLE) {
      const widgetType = widgetTypeOf(tag, form);
      if (!widgetType) continue;
      const series = drawSeries(stepFor(tag, form, widgetType), `${tag}|${form}`, REPEAT_WINDOW + 1);
      if (series.length < 2) continue;
      checkedPairs++;
      if (series.some((s) => s.exhausted)) { exhaustedPairs++; continue; }
      // The claim, stated exactly: inside a window of 10, no fingerprint appears twice.
      const window = series.slice(-REPEAT_WINDOW).map((s) => s.fingerprint);
      expect(new Set(window).size, `${tag}|${form} repeated inside the window`).toBe(window.length);
    }
    // A green assertion over an empty set is the failure this repo has already shipped three times.
    expect(checkedPairs, "no pair was exercised — the sample resolved nothing").toBeGreaterThan(50);
    expect(exhaustedPairs).toBeLessThan(checkedPairs);
  });

  it("is deterministic: same step, seed, band and history give the same variant", () => {
    const step = stepFor(VARIANT_GENERATORS[0].tag, "default", widgetTypeOf(VARIANT_GENERATORS[0].tag, "default") ?? "numeric");
    const probe = drawFreshVariant(step, "s", "core", {}, "k");
    if (!probe) return;
    const history: RecentDraws = { k: [probe.fingerprint] };
    const a = drawFreshVariant(step, "s", "core", history, "k");
    const b = drawFreshVariant(step, "s", "core", history, "k");
    expect(a?.fingerprint).toBe(b?.fingerprint);
    expect(JSON.stringify(a?.variant.widget)).toBe(JSON.stringify(b?.variant.widget));
  });

  it("leaves a learner with no history seeing exactly what they see today", () => {
    // The first attempt uses the caller's seed UNCHANGED. The queue is supposed to change the
    // second encounter, not the first — a first-run diff would be a silent content change.
    for (const { tag, form } of SAMPLE.slice(0, 20)) {
      const widgetType = widgetTypeOf(tag, form);
      if (!widgetType) continue;
      const probe = drawFreshVariant(stepFor(tag, form, widgetType), "seed", "core", {}, "k");
      if (!probe) continue;
      expect(probe.attempts, `${tag}|${form} re-drew against an empty history`).toBe(1);
    }
  });

  it("returns null where the step has no generator, so authored content still shows", () => {
    expect(drawFreshVariant({ widget: { type: "numeric" } }, "s", "core", {}, "k")).toBeNull();
  });
});

describe("GEN-04 — the queue is honest when the pool is too small", () => {
  it("reports exhausted rather than pretending, and still serves the un-queued draw", () => {
    /* An exhausted pool is made deterministic here rather than hunted for in the corpus: every
     * fingerprint the pair can produce across MAX_DRAW_ATTEMPTS is collected first and then handed
     * back as the history, so the next draw provably has nowhere fresh to go. */
    const step = stepFor(VARIANT_GENERATORS[0].tag, "default", widgetTypeOf(VARIANT_GENERATORS[0].tag, "default") ?? "numeric");
    const bare = drawFreshVariant(step, "s", "core", {}, "k");
    if (!bare) return;

    const reachable = new Set<string>();
    for (let attempt = 0; attempt < MAX_DRAW_ATTEMPTS; attempt++) {
      const d = drawFreshVariant(step, attempt === 0 ? "s" : `s#${attempt}`, "core", {}, "k");
      if (d) reachable.add(d.fingerprint);
    }

    const drawn = drawFreshVariant(step, "s", "core", { k: [...reachable] }, "k");
    expect(drawn, "an exhausted pool must still serve something").not.toBeNull();
    expect(drawn!.exhausted, "every reachable draw was seen, so this must say so").toBe(true);
    expect(drawn!.attempts).toBe(MAX_DRAW_ATTEMPTS);
    /* And it degrades to TODAY's behaviour rather than to something stranger: the variant served is
     * the one the caller's own seed produces with no queue at all. */
    expect(drawn!.fingerprint).toBe(bare.fingerprint);
  });

  it("never claims a fresh draw it did not find", () => {
    // The failure that would matter: `exhausted: false` on a fingerprint the history already holds.
    const step = stepFor(VARIANT_GENERATORS[0].tag, "default", widgetTypeOf(VARIANT_GENERATORS[0].tag, "default") ?? "numeric");
    for (let i = 0; i < 30; i++) {
      const history = drawSeries(step, `h${i}`, REPEAT_WINDOW).map((s) => s.fingerprint);
      const drawn = drawFreshVariant(step, `q${i}`, "core", { k: history }, "k");
      if (!drawn || drawn.exhausted) continue;
      expect(history, `claimed fresh but ${drawn.fingerprint} was in the window`).not.toContain(drawn.fingerprint);
    }
  });
});

describe("GEN-04 — the window is bounded storage that syncs", () => {
  it("keeps at most REPEAT_WINDOW fingerprints, newest last", () => {
    let recent: RecentDraws = {};
    for (let i = 0; i < REPEAT_WINDOW + 5; i++) recent = rememberDraw(recent, "k", `f${i}`);
    expect(recent.k).toHaveLength(REPEAT_WINDOW);
    expect(recent.k.at(-1)).toBe(`f${REPEAT_WINDOW + 4}`);
    expect(recent.k).not.toContain("f0");
  });

  it("does not let one fingerprint fill the window when a pool is exhausted", () => {
    // Without the de-duplication in rememberDraw, an exhausted pool re-serving its only problem
    // would push ten copies of one fingerprint and evict the memory of every other problem.
    let recent: RecentDraws = { k: ["a", "b", "c"] };
    for (let i = 0; i < 20; i++) recent = rememberDraw(recent, "k", "a");
    expect(recent.k).toEqual(["b", "c", "a"]);
  });

  it("evicts the least recently served step once the map is full", () => {
    let recent: RecentDraws = {};
    for (let i = 0; i < MAX_TRACKED_STEPS + 3; i++) recent = rememberDraw(recent, `step${i}`, "f");
    expect(Object.keys(recent)).toHaveLength(MAX_TRACKED_STEPS);
    expect(recent.step0).toBeUndefined();
    expect(recent[`step${MAX_TRACKED_STEPS + 2}`]).toEqual(["f"]);
  });

  it("merges two devices as a UNION, because either device's draw was seen", () => {
    /* Last-write-wins here would un-see everything the other device served — the exact repeat this
     * module exists to prevent, reintroduced by the merge rather than by the draw. */
    const merged = mergeRecentDraws({ k: ["c", "d"], only_a: ["x"] }, { k: ["a", "b"], only_b: ["y"] });
    expect(merged.k).toEqual(["a", "b", "c", "d"]);
    expect(merged.only_a).toEqual(["x"]);
    expect(merged.only_b).toEqual(["y"]);
  });

  it("keeps the fresher device's draws when the union overflows the window", () => {
    const fresher = Array.from({ length: REPEAT_WINDOW }, (_, i) => `new${i}`);
    const staler = Array.from({ length: REPEAT_WINDOW }, (_, i) => `old${i}`);
    const merged = mergeRecentDraws({ k: fresher }, { k: staler });
    expect(merged.k).toEqual(fresher);
  });

  it("fingerprints widget identity, not object identity", () => {
    expect(fingerprintWidget({ a: 1, b: [2, 3] })).toBe(fingerprintWidget({ a: 1, b: [2, 3] }));
    expect(fingerprintWidget({ a: 1 })).not.toBe(fingerprintWidget({ a: 2 }));
    expect(fingerprintWidget({ a: 1 })).toMatch(/^[0-9a-f]{8}$/);
  });
});
